"""Export synthetic Deal decisions using real actions and personalized projections."""

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from uuid import NAMESPACE_DNS, uuid5

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.core.contracts import Action
from app.games.deal.deck import RENTS
from app.games.deal.engine import DealEngine
from app.games.deal.table import place
from app.rooms.schemas import MemberView, RoomView

PLAYERS = [str(uuid5(NAMESPACE_DNS, f"deal-workspace-player-{i}")) for i in range(4)]
NAMES = ["Alexandra with a rather long name", "Dev", "Mira", "Sam"]


def opening(mercy=False):
    engine = DealEngine(mercy)
    state = engine.setup(PLAYERS, {}, seed=19)
    state.update(deck=list(engine.cards), discard=[], hands={p: [] for p in PLAYERS},
                 banks={p: [] for p in PLAYERS}, properties={p: {} for p in PLAYERS})
    for player in PLAYERS[1:]:
        take(engine, state, player, kind="money")
    return engine, state


def take(engine, state, player, *, kind=None, effect=None, colors=None, value=None,
         zone="hands", destination=None):
    card = next(c for c in engine.cards.values() if c.id in state["deck"]
                and (kind is None or c.kind == kind)
                and (effect is None or c.action == effect)
                and (colors is None or c.colors == colors)
                and (value is None or c.value == value))
    state["deck"].remove(card.id)
    if zone == "properties":
        place(state, player, card.id, engine.cards, colors[0] if colors else None,
              destination or "")
    else:
        state[zone][player].append(card.id)
    return card.id


def room_view(engine, state, viewer, ident, version=1):
    physical = state["deck"] + state["discard"] + [c for hand in state["hands"].values() for c in hand]
    physical += [c for bank in state["banks"].values() for c in bank]
    physical += [c for groups in state["properties"].values() for group in groups.values() for c in group]
    assert Counter(physical) == Counter(list(engine.cards)), f"Inventory mismatch: {ident}"
    view = engine.project_view(state, viewer)
    visible = view.hand + [c for p in view.players for c in p.bank]
    visible += [c for p in view.players for group in p.properties.values() for c in group]
    if view.discard:
        visible.append(view.discard)
    hidden = state["deck"] + [c for p, cards in state["hands"].items() if p != viewer for c in cards]
    assert not {c.id for c in visible}.intersection(hidden), f"Private card leak: {ident}"
    assert all(not player.cards for player in view.players)
    return RoomView(
        id=str(uuid5(NAMESPACE_DNS, f"deal-workspace-{ident}")),
        name="Synthetic Deal workspace", code="DESIGN1", game_id=engine.manifest.id,
        owner_id=state["order"][0], capacity=len(state["order"]), settings={}, status="playing", revision=version,
        match_id=str(uuid5(NAMESPACE_DNS, f"deal-workspace-match-{ident}")),
        match_version=version, paused=False, missing_players=[], messages=[],
        members=[MemberView(id=p, name=NAMES[i], avatar=i, ready=True, seated=True,
                            connected=True, last_seen=0) for i, p in enumerate(state["order"])],
        game=view,
    ).model_dump(mode="json")


def generate():
    cases = []

    def record(ident, label, engine, state, viewer=PLAYERS[0], focus=None, actions=()):
        transitions = []
        for name, action in actions:
            after = engine.apply_action(state, viewer, action)
            transitions.append({"label": name, "action": action.model_dump(mode="json"),
                                "room": room_view(engine, after, viewer, ident, 2)})
        cases.append({"id": ident, "label": label, "selfId": viewer, "focusCard": focus,
                      "room": room_view(engine, state, viewer, ident), "transitions": transitions})

    engine, state = opening()
    take(engine, state, PLAYERS[0], kind="property", colors=("brown",), zone="properties")
    card = take(engine, state, PLAYERS[0], kind="property", colors=("brown",))
    take(engine, state, PLAYERS[0], kind="property", colors=("green", "blue"))
    record("placement", "Deal · choose a property destination", engine, state, focus=card,
           actions=[("Complete existing set", Action(type="property", card=card, color="brown", choice="brown:0")),
                    ("Start separate set", Action(type="property", card=card, color="brown", choice="brown:1"))])

    engine, state = opening()
    take(engine, state, PLAYERS[0], kind="property", colors=("brown",), zone="properties")
    card = take(engine, state, PLAYERS[0], kind="property", colors=("brown",), zone="properties", destination="brown:1")
    record("rearrange", "Deal · move between same-color sets", engine, state, focus=card,
           actions=[("Complete existing set", Action(type="rearrange", card=card, color="brown", choice="brown:0"))])

    engine, state = opening()
    card = take(engine, state, PLAYERS[0], effect="forced")
    for color, player in [("brown", PLAYERS[0]), ("sky", PLAYERS[0]), ("red", PLAYERS[1]), ("green", PLAYERS[2])]:
        take(engine, state, player, kind="property", colors=(color,), zone="properties")
    forced = [(f"Swap {i}", option.action) for i, option in enumerate(engine.legal_actions(state, PLAYERS[0]))
              if option.action.card == card and option.action.type == "play"]
    record("forced", "Deal · targeted property swap", engine, state, focus=card, actions=forced)
    chosen = forced[0][1]
    record("forced-pending", "Deal · review both sides of a pending swap", engine,
           engine.apply_action(state, PLAYERS[0], chosen), viewer=chosen.target,
           actions=[("Accept the exchange", Action(type="accept"))])

    engine, state = opening()
    debt = take(engine, state, PLAYERS[0], effect="debt")
    take(engine, state, PLAYERS[0], effect="no")
    no = take(engine, state, PLAYERS[1], effect="no")
    take(engine, state, PLAYERS[1], kind="money", value=1, zone="banks")
    state = engine.apply_action(state, PLAYERS[0], Action(type="play", card=debt, target=PLAYERS[1]))
    record("counter", "Deal · counter an action", engine, state, viewer=PLAYERS[1],
           actions=[("Block the bill", Action(type="no", card=no)), ("Accept the bill", Action(type="accept"))])
    state = engine.apply_action(state, PLAYERS[1], Action(type="no", card=no))
    no = next(option.action for option in engine.legal_actions(state, PLAYERS[0]) if option.action.type == "no")
    record("counter-chain", "Deal · counter a counter", engine, state,
           actions=[("Restore the bill", no), ("Let the block stand", Action(type="accept"))])

    for ident, label, amounts, property_asset in [
        ("payment-bank", "Deal · pay from the bank", [2, 4], False),
        ("payment-exact", "Deal · exact payment or overpayment", [1, 4, 10], False),
        ("payment-insolvent", "Deal · pay every available asset", [1], True),
    ]:
        engine, state = opening()
        debt = take(engine, state, PLAYERS[0], effect="debt")
        bank = [take(engine, state, PLAYERS[1], kind="money", value=value, zone="banks") for value in amounts]
        payable = list(bank)
        if property_asset:
            payable.append(take(engine, state, PLAYERS[1], kind="property", colors=("brown",), zone="properties"))
        take(engine, state, PLAYERS[1], kind="property", colors=tuple(RENTS), zone="properties")
        state = engine.apply_action(state, PLAYERS[0], Action(type="play", card=debt, target=PLAYERS[1]))
        state = engine.apply_action(state, PLAYERS[1], Action(type="accept"))
        actions = [("Pay every available asset", Action(type="pay", cards=payable))]
        if ident == "payment-exact":
            actions += [("Pay exactly", Action(type="pay", cards=bank[:2])), ("Overpay", Action(type="pay", cards=bank[2:]))]
        record(ident, label, engine, state, viewer=PLAYERS[1], actions=actions)

    for mercy in (False, True):
        engine, state = opening(mercy)
        for _ in range(2):
            take(engine, state, PLAYERS[0], kind="property", colors=("brown",), zone="properties")
        boardwalks = [c for c in engine.cards.values() if c.name == "Boardwalk"]
        boardwalk = boardwalks[0]
        state["deck"].remove(boardwalk.id)
        place(state, PLAYERS[0], boardwalk.id, engine.cards)
        if not mercy:
            for effect in ("house", "hotel"):
                building = take(engine, state, PLAYERS[0], effect=effect)
                state = engine.apply_action(state, PLAYERS[0], Action(type="play", card=building, color="brown:0"))
        record("no-mercy" if mercy else "collections", "No Mercy · house deck" if mercy else "Deal · named properties and rent", engine, state)

    # Build the actual set, pass around the table, then commit Double the Rent.
    # The preview and pending bill below are engine outcomes, not UI arithmetic.
    engine, state = opening()
    for _ in range(2):
        take(engine, state, PLAYERS[0], kind="property", colors=("brown",), zone="properties")
    buildings = [take(engine, state, PLAYERS[0], effect=effect) for effect in ("house", "hotel")]
    double = take(engine, state, PLAYERS[0], effect="double")
    rent = take(engine, state, PLAYERS[0], effect="rent", colors=("brown", "sky"))
    for building in buildings:
        state = engine.apply_action(state, PLAYERS[0], Action(type="play", card=building, color="brown:0"))
    for player in PLAYERS:
        state = engine.apply_action(state, player, Action(type="end_turn"))
    state = engine.apply_action(state, PLAYERS[0], Action(type="play", card=double))
    charge = next(option.action for option in engine.legal_actions(state, PLAYERS[0])
                  if option.action.card == rent and option.action.type == "play"
                  and option.action.color == "brown:0")
    record("doubled-rent", "Deal · preview doubled rent", engine, state, focus=rent,
           actions=[("Charge doubled Brown rent", charge)])

    # Reach a large hand through ordinary setup and legal draw-two actions.
    # No extra cards or hidden identities are injected into this scenario.
    for seed in range(1000):
        engine = DealEngine()
        state = engine.setup(PLAYERS, {}, seed=seed)
        passes = [card for card in state["hands"][PLAYERS[0]] if engine.cards[card].action == "pass_go"]
        if len(passes) >= 2:
            for card in passes[:2]:
                state = engine.apply_action(state, PLAYERS[0], Action(type="play", card=card))
            assert len(state["hands"][PLAYERS[0]]) >= 9
            record("information-hand", "Deal · inspect a natural large hand", engine, state)
            break
    else:
        raise AssertionError("Expected a reproducible large-hand setup seed")
    # Preserve the original legal audit trajectories as reviewable regressions.
    # These public actions, including attached-building payments, replay from seed.
    for case in json.loads((ROOT / "backend/tests/fixtures/deal_audit_replays.json").read_text()):
        engine = DealEngine(case["game"] == "deal-no-mercy")
        names = {f"p{i}": p for i, p in enumerate(PLAYERS[:3])}
        state = engine.setup(list(names.values()), {}, seed=case["seed"])
        for step in case["replay"]:
            values = {key: names.get(value, value) if isinstance(value, str) else value
                      for key, value in step["action"].items()}
            state = engine.apply_action(state, names[step["actor"]], Action.model_validate(values))
        viewer = names[case["player"]]
        if "selected" in case:
            ident = "linked-payment-no-mercy" if engine.mercy else "linked-payment-classic"
            record(ident, f"{engine.manifest.name} · payment carries buildings", engine, state,
                   viewer=viewer, focus=case["selected"][0],
                   actions=[("Pay with linked assets", Action(type="pay", cards=case["selected"]))])
        else:
            counter = next(o.action for o in engine.legal_actions(state, viewer)
                           if o.action.type == "no")
            record("third-play-counter", "Deal · counter after your third ordinary play", engine,
                   state, viewer=viewer, actions=[("Counter for no ordinary play", counter)])
    return cases


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    result = generate()
    content = ('import type { components } from "@games/api-client/wire";\n'
               'export interface DealScenario { id: string; label: string; selfId: string; focusCard: string | null; '
               'room: components["schemas"]["RoomView"]; transitions: { label: string; '
               'action: components["schemas"]["Action"]; room: components["schemas"]["RoomView"] }[] }\n'
               'export const dealScenarios: DealScenario[] = ' + json.dumps(result, indent=2) + ';\n')
    path = ROOT / "apps/web/src/stories/generated/deal-scenarios.ts"
    if args.check:
        if not path.exists() or path.read_text() != content:
            raise SystemExit("Deal workspace fixture drift. Run backend/.venv/bin/python scripts/export_deal_scenarios.py.")
    else:
        path.write_text(content)
    print(f"{'Checked' if args.check else 'Generated'} {len(result)} public Deal workspace scenarios.")


if __name__ == "__main__":
    main()
