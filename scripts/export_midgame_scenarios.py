"""Reach mid-game UI scenarios through legal engine actions, never reshaped hands."""

import argparse
import json
import sys
from collections import Counter
from pathlib import Path
from uuid import NAMESPACE_DNS, uuid5

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.bots import choose_action, observe_view
from app.core.contracts import Action
from app.games.registry import ENGINES
from app.rooms.schemas import MemberView, RoomView

TARGET = ROOT / "apps/web/src/stories/generated/midgame-scenarios.ts"
REPORT = ROOT / "docs/evidence/stable-play-2026-11-02/midgame-coverage.json"
NAMES = ["Alexandra with a rather long name", "Dev", "Mira", "Sam", "Noor", "Alex", "Jules", "Kai", "Robin", "Ari"]
INTERESTING = {"pay", "no", "choose", "keep", "give", "settle_debt", "rearrange", "challenge",
               "split", "double", "sideshow", "accept", "declare", "graduate", "promote", "capture",
               "swap", "reveal", "stop", "last_chance", "crab_card", "steal", "place", "freeze", "flip_three"}


def inventory(game, s):
    """Physical-card inventory, independent of each engine's projection."""
    if game.startswith("uno") or game.startswith("deal"):
        cards = s["deck"] + s["discard"] + sum(s["hands"].values(), [])
        if game.startswith("deal"):
            cards += sum(s["banks"].values(), [])
            cards += [c for groups in s["properties"].values() for group in groups.values() for c in group]
            if s["gift"]:
                cards.append(s["gift"]["card"])
        return Counter(cards)
    if game == "holdem":
        return Counter(s["deck"] + s["board"] + s["burn"] + [c for p in s["players"].values() for c in p["cards"]])
    if game == "teen-patti":
        return Counter(s["deck"] + [c for p in s["players"].values() for c in p["cards"]])
    if game == "blackjack":
        return Counter(s["deck"] + s["dealer"] + [c for p in s["players"].values() for hand in p["hands"] for c in hand["cards"]])
    if game == "rummy":
        return Counter(s["deck"] + s["discard"] + [s["cut"]] + sum(s["hands"].values(), []))
    if game == "skyjo":
        return Counter(s["deck"] + s["discard"] + ([s["drawn"]] if s["drawn"] else []) + [c for grid in s["grids"].values() for c in grid if c])
    if game == "shithead":
        return Counter(s["deck"] + s["pile"] + s["burned"] + sum(s["hands"].values(), []) + sum(s["face_up"].values(), []) + [c for grid in s["face_down"].values() for c in grid if c])
    if game == "flip-7":
        return Counter(s["deck"] + s["discard"] + sum(s["table"].values(), []))
    if game == "trio":
        return Counter([c for c in s["table"] if c] + sum(s["hands"].values(), []) + sum(s["trios"].values(), []) + ([r["card"] for r in s["reveals"] if r["owner"] != "table"] if s["phase"] == "revealing" or s.get("failed") else []))
    if game == "sea-salt-paper":
        return Counter(s["deck"] + s["draft"] + sum(s["piles"], []) + sum(s["hands"].values(), []) + sum(s["played"].values(), []))
    if game == "the-gang":
        return Counter(s["deck"] + s["board"] + sum(s["hands"].values(), []))
    if game == "azul":
        return Counter(s["bag"] + s["discard"] + s["center"] + s["draft"] + sum(s["factories"], []) + [c for lines in s["lines"].values() for line in lines for c in line] + [c for wall in s["wall"].values() for row in wall for c in row if c] + [c for floor in s["floor"].values() for c in floor if c != "first"])
    if game == "tarot":
        return Counter(s["deck"])
    return None


def visible_cards(value):
    if isinstance(value, dict):
        if "id" in value and "label" in value and "value" in value:
            yield value["id"]
        for child in value.values():
            yield from visible_cards(child)
    elif isinstance(value, list):
        for child in value:
            yield from visible_cards(child)


def actor_for(engine, state, players):
    actor = engine.project_view(state, players[0]).current_player
    if engine.manifest.id.startswith("uno"):
        actor = next((p for p in players if any(o.action.type == "uno" for o in engine.legal_actions(state, p))), actor)
    if actor is None or not engine.legal_actions(state, actor):
        actor = next(p for p in players if engine.legal_actions(state, p))
    return actor


def project(engine, state, viewer, players):
    view = engine.project_view(state, viewer)
    data = view.model_dump(mode="json")
    shown = set(visible_cards(data))
    hidden_stock = set(state.get("deck", []))
    if engine.manifest.id == "tarot":
        hidden_stock = {card for index, card in enumerate(state["deck"]) if index not in state["picks"]}
    if engine.manifest.id == "blackjack" and state["phase"] != "finished":
        hidden_stock.update(state["dealer"][1:])
    if engine.manifest.id == "skyjo":
        hidden_stock.update(card for player in players for slot, card in enumerate(state["grids"][player])
                            if card and not state["revealed"][player][slot])
    if engine.manifest.id == "shithead":
        hidden_stock.update(card for player in players for card in state["face_down"][player] if card)
    assert not shown.intersection(hidden_stock), f"Stock identity leaked: {engine.manifest.id}"
    # Other players' genuinely private cards may not occur as CardViews. A
    # public showdown/reveal is allowed only when that player's own public list
    # already names it. This also allows Sea Salt & Paper's protected hands.
    for player in players:
        if player == viewer:
            continue
        public = next(p for p in view.players if p.id == player)
        allowed = {c.id for c in public.cards if c}
        allowed.update(c.id for c in public.bank)
        for group in public.properties.values():
            allowed.update(c.id for c in group)
        private = state.get("hands", {}).get(player, [])
        if engine.manifest.id in {"holdem", "teen-patti"}:
            private = state["players"][player]["cards"]
        if engine.manifest.id == "blackjack":
            private = [card for hand in state["players"][player]["hands"] for card in hand["cards"]]
        # Trio hand-end reveals are separately, deliberately public.
        if engine.manifest.id == "trio":
            allowed.update(r["card"] for r in state["reveals"])
        if engine.manifest.id == "shithead":
            # A failed hidden flip is shown to the table before it is taken
            # into the player's hand. Its announced identity remains public.
            allowed.update(visible_cards(data["detail"].get("last_play")))
        if private and all(isinstance(card, str) for card in private):
            assert not (set(private) - allowed).intersection(shown), f"Other hand leaked: {engine.manifest.id}"
    assert "_shuffle_key" not in json.dumps(data) and "_shuffle_nonce" not in json.dumps(data)
    return view


def room(engine, state, viewer, players, key, step):
    return RoomView(
        id=str(uuid5(NAMESPACE_DNS, f"midgame-room-{key}")), name="Synthetic legal mid-game",
        code="MIDGAME1", game_id=engine.manifest.id, owner_id=players[0], capacity=len(players),
        settings={}, status="finished" if state["phase"] == "finished" else "playing", revision=step,
        match_id=str(uuid5(NAMESPACE_DNS, f"midgame-match-{key}")), match_version=step,
        paused=False, missing_players=[], messages=[],
        members=[MemberView(id=p, name=NAMES[i], avatar=i % 8, ready=True, seated=True,
                            connected=True, last_seen=0) for i, p in enumerate(players)],
        game=project(engine, state, viewer, players),
    ).model_dump(mode="json")


def generate():
    cases, runs = [], []

    def trajectory(game, seats, seed, *, supplemental=False, stress=False, target_type="split"):
        engine = ENGINES[game]
        players = [str(uuid5(NAMESPACE_DNS, f"midgame-player-{i}")) for i in range(seats)]
        state = engine.setup(players, {s.key: s.default for s in engine.manifest.settings}, seed=seed)
        initial = inventory(game, state)
        memory = {p: {"seed": f"midgame:{seed}:{p}"} for p in players}
        exercised = set()
        seen, phases, action_types, offered_types, captured, peak = set(), set(), set(), set(), [], 0
        for step in range(1, 4001):
            if state["phase"] == "finished" or game == "tarot" and state["phase"] == "reading":
                break
            actor = actor_for(engine, state, players)
            view = project(engine, state, actor, players)
            if game == "tarot":
                action = view.actions[0].action
            else:
                decision = choose_action(view, actor, memory[actor])
                memory[actor] = decision.memory
                action = decision.action
            # Both strategies use only public legal options. They intentionally
            # reach complete betting streets, legal split hands and large hands.
            if game == "holdem":
                action = next((o.action for o in view.actions if o.action.type in {"check", "call"}), action)
            if game == "blackjack":
                action = next((o.action for o in view.actions if o.action.type == "split"), action)
            for kind in ["challenge", "rearrange"]:
                if kind not in exercised and any(option.action.type == kind for option in view.actions):
                    action = next(option.action for option in view.actions if option.action.type == kind)
                    exercised.add(kind)
                    break
            if stress:
                action = next((o.action for o in view.actions if o.action.type == "draw"),
                              next((o.action for o in view.actions if o.action.type == "pass"), action))
            if state.get("deck") == [] and stress:
                break
            phase = view.phase
            phases.add(phase)
            action_types.add(action.type)
            offered_types.update(option.action.type for option in view.actions)
            peak = max(peak, len(view.hand))
            classification = action.type if action.type in INTERESTING else "decision"
            if game == "tarot":
                classification = f"spread-{len(view.community)}"
            if game == "teen-patti":
                classification += ":blind" if view.detail.get("blind") else ":seen"
            if game == "skyjo" and view.detail.get("finisher") and phase != "between_rounds":
                classification += ":final-turn"
            if game == "azul" and any(view.detail.get("floors", {}).values()):
                classification += ":occupied-floor"
            if any(option.action.type == "challenge" for option in view.actions):
                classification += ":challenge-available"
            if game == "the-gang":
                classification += f":{view.detail.get('street', 0)}"
            if game.startswith("deal") and action.type == "play":
                card = next((c for c in view.hand if c.id == action.card), None)
                classification += f":{card.effect if card else 'asset'}"
            if stress:
                classification = f"hand-{len(view.hand) // 10 if game == 'uno' else len(view.hand)}"
            if game in {"four-in-a-row", "reversi", "mancala", "boop"}:
                classification += ":" + ("early" if step < 8 else "middle" if step < 16 else "late")
            if game == "checkers":
                path = action.choice.split(":")
                capture = len(path) > 1 and abs(int(path[0]) // 8 - int(path[1]) // 8) > 1
                classification += ":" + ("multi-jump" if len(path) > 2 else "capture" if capture else "move")
                if any(card.subtitle == "King" for card in view.community):
                    classification += ":king"
            if game.startswith("deal") and view.detail.get("pending_action"):
                pending = view.detail["pending_action"]
                classification += ":" + pending["kind"] + (":blocked" if pending["blocked"] else "")
            signature = (phase, classification)
            after = engine.apply_action(state, actor, action)
            if initial is not None:
                assert inventory(game, after) == initial, f"Physical inventory drift: {game}/{seed}/{step}"
            limit = 18 if game.startswith("deal") else 3 if stress and game == "uno" else 6 if stress else 8
            worth_recording = step > 1 and signature not in seen and len(captured) < limit
            if stress:
                worth_recording = worth_recording and len(view.hand) >= 20
            if supplemental:
                worth_recording = (action.type == target_type or phase == target_type) and not captured
            if worth_recording:
                seen.add(signature)
                key = f"{game}-{seats}-{seed}-{step}"
                own = next(p for p in view.players if p.id == actor)
                selectable_cards = view.hand + own.bank + [c for group in own.properties.values() for c in group]
                focus = action.card if any(c.id == action.card for c in selectable_cards) else None
                cases.append({
                    "id": key, "game": game, "seats": seats, "seed": seed, "step": step,
                    "label": f"{engine.manifest.name} · {seats} players · {phase.replace('_', ' ')} · {classification.replace('_', ' ')}",
                    "selfId": actor, "focusCard": focus, "reachedBy": "legal engine actions from setup",
                    "room": room(engine, state, actor, players, key, step),
                    "next": {"action": action.model_dump(mode="json"), "game": project(engine, after, actor, players).model_dump(mode="json")},
                })
                captured.append(key)
            state = after
            if game in {"trio", "flip-7"}:
                for player in players:
                    memory[player] = observe_view(engine.project_view(state, player), player, memory[player])
            if supplemental and captured or stress and peak >= (40 if game == "uno" else 24):
                break
        else:
            raise AssertionError(f"Legal scenario playthrough exceeded bound: {game}/{seats}/{seed}")
        if not supplemental and not stress:
            assert captured, f"No reached mid-game scenario for {game}/{seats}"
            assert state["phase"] in {"finished", "reading"}, f"Unfinished scenario trajectory: {game}"
        runs.append({"game": game, "seats": seats, "seed": seed, "supplemental": supplemental,
                     "stress": stress, "steps": step - 1, "phases": sorted(phases),
                     "chosenActionTypes": sorted(action_types), "peakPrivateHand": peak,
                     "offeredActionTypes": sorted(offered_types),
                     "captured": len(captured), "finished": state["phase"] in {"finished", "reading"},
                     "physicalInventoryChecked": initial is not None})
        recorded = [case for case in cases if case["id"] in captured]
        runs[-1]["capturedPhases"] = sorted({case["room"]["game"]["phase"] for case in recorded})
        runs[-1]["capturedActionTypes"] = sorted({case["next"]["action"]["type"] for case in recorded})
        return bool(captured)

    for game, engine in ENGINES.items():
        for maximum in (False, True):
            seats = engine.manifest.max_players if maximum else engine.manifest.min_players
            trajectory(game, seats, 31 if maximum else 17)
    if not any(case["game"] == "blackjack" and case["next"]["action"]["type"] == "split" for case in cases):
        for seed in range(1, 61):
            if trajectory("blackjack", 1, seed, supplemental=True):
                break
        else:
            raise AssertionError("No legal Blackjack split found in the bounded seed search")
    if not any(case["game"] == "blackjack" and case["room"]["game"]["phase"] == "insurance" for case in cases):
        for seed in range(1, 61):
            if trajectory("blackjack", 1, seed, supplemental=True, target_type="insurance"):
                break
        else:
            raise AssertionError("No legal Blackjack insurance decision found in the seed search")
    trajectory("uno", 2, 11, stress=True)
    trajectory("uno-no-mercy", 2, 11, stress=True)
    coverage = {"kind": "Legally reached engine projections, not saved API rooms", "games": len(ENGINES),
                "scenarios": len(cases), "runs": runs,
                "limits": ["Only generated legal trajectories are claimed; no guarantee that every rare action appears.",
                           "Existing targeted Deal scenarios separately cover forced swaps and counter-counter chains.",
                           "Saved HTTP rooms and refresh are checked by fullmatches.spec.ts with GAMES_MIDGAME=1."]}
    return cases, coverage


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    args = parser.parse_args()
    cases, coverage = generate()
    content = ('import type { components } from "@games/api-client/wire";\n'
               'export interface MidgameScenario { id: string; game: string; seats: number; seed: number; step: number; label: string; selfId: string; focusCard: string | null; reachedBy: string; room: components["schemas"]["RoomView"]; next: { action: components["schemas"]["Action"]; game: components["schemas"]["GameView"] } }\n'
               'export const midgameScenarios: MidgameScenario[] = ' + json.dumps(cases, ensure_ascii=False, sort_keys=True, separators=(",", ":")) + ';\n')
    report = json.dumps(coverage, sort_keys=True, indent=2) + '\n'
    if args.check:
        assert TARGET.exists() and TARGET.read_text() == content, "Mid-game scenario drift: regenerate export_midgame_scenarios.py"
        assert REPORT.exists() and REPORT.read_text() == report, "Mid-game coverage drift"
    else:
        TARGET.parent.mkdir(parents=True, exist_ok=True)
        REPORT.parent.mkdir(parents=True, exist_ok=True)
        TARGET.write_text(content)
        REPORT.write_text(report)
    print(f"{'Checked' if args.check else 'Exported'} {len(cases)} legal mid-game scenarios across {len(ENGINES)} games and both seat limits.")


if __name__ == "__main__":
    main()
