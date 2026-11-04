"""Trio individual Simple mode, with public reveal review and private sorted hands."""

from random import Random

from app.core.contracts import (
    Action,
    BaseEngine,
    CardView,
    GameManifest,
    GameView,
    LegalAction,
    PlayerView,
    State,
    legal,
    validate_action,
)


def number(card: str) -> int:
    return int(card.split("-")[1])


def face(card: str) -> CardView:
    value = number(card)
    return CardView(id=card, label=f"Trio {value}", value=str(value),
                    color="yellow" if value == 7 else "violet", suit="✦")


class TrioEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="trio", name="Trio", subtitle="Find three matching numbers",
            family="trio", min_players=3, max_players=6, minutes="10–15", icon="layers",
            color="plum", rules_version="simple-1", score_label="Trios", rules=[
                "Simple individual mode. Three copies each of numbers 1–12; sorted private hands.",
                "Reveal a table card or any hand’s current lowest or highest card, including your own.",
                "A mismatch ends your turn. Three equal numbers earn a trio.",
                "Collect three trios, or the trio of sevens, to win. Review reveals before continuing.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        deck = [f"trio-{value}-{copy}" for value in range(1, 13) for copy in range(3)]
        Random(seed).shuffle(deck)
        count = {3: 9, 4: 7, 5: 6, 6: 5}[len(players)]
        hands = {p: sorted([deck.pop() for _ in range(count)], key=number) for p in players}
        return {"order": players, "turn": 0, "phase": "revealing", "hands": hands,
                "table": deck, "reveals": [], "trios": {p: [] for p in players}, "winners": []}

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "review":
            return [legal("Continue", "continue")]
        actions = [legal(f"Reveal table card {i + 1}", "reveal_table", choice=str(i))
                   for i, card in enumerate(s["table"]) if card is not None
                   and not any(r["owner"] == "table" and r["slot"] == i for r in s["reveals"])]
        for p in s["order"]:
            if s["hands"][p]:
                actions.append(legal("Reveal lowest", "reveal_hand", target=p, choice="low"))
                if len(s["hands"][p]) > 1:
                    actions.append(legal("Reveal highest", "reveal_hand", target=p, choice="high"))
        return actions

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "continue":
            if s["failed"]:
                for reveal in s["reveals"]:
                    if reveal["owner"] != "table":
                        s["hands"][reveal["owner"]].append(reveal["card"])
                for p in s["order"]:
                    s["hands"][p].sort(key=number)
            s.update(reveals=[], phase="revealing", turn=(s["turn"] + 1) % len(s["order"]))
            return s
        if action.type == "reveal_table":
            index = int(action.choice)
            card = s["table"][index]
            s["reveals"].append({"owner": "table", "slot": index, "card": card})
        else:
            index = 0 if action.choice == "low" else -1
            card = s["hands"][action.target].pop(index)
            # Which end was asked for is public, like the request itself.
            s["reveals"].append({"owner": action.target, "slot": -1, "card": card,
                                 "edge": action.choice})
        values = [number(r["card"]) for r in s["reveals"]]
        if len(set(values)) > 1:
            s.update(phase="review", failed=True)
        elif len(values) == 3:
            for reveal in s["reveals"]:
                if reveal["owner"] == "table":
                    s["table"][reveal["slot"]] = None
            s["trios"][player].extend(r["card"] for r in s["reveals"])
            s.update(phase="review", failed=False)
            if values[0] == 7 or len(s["trios"][player]) >= 9:
                s.update(phase="finished", winners=[player])
        return s

    def _message(self, s: State) -> str:
        """The instruction for the seat that can act; it never names a private card."""
        values = [number(r["card"]) for r in s["reveals"]]
        if s["phase"] == "finished":
            won = number(s["trios"][s["winners"][0]][-1]) if s["winners"] else 0
            return "The trio of 7s wins the match." if won == 7 else "A third trio wins the match."
        if s["phase"] == "review":
            if s.get("failed"):
                return ("No match. Take a good look, then continue: "
                        "the cards go back face down and the turn passes.")
            return f"Three {values[0]}s collected! Continue to pass the turn."
        if not values:
            return ("Reveal a table card, or ask any player for their lowest or highest card. "
                    "You can ask yourself too.")
        if len(values) == 1:
            found = f"an {values[0]}" if values[0] in (8, 11) else f"a {values[0]}"
            return f"You found {found}. Find another {values[0]}; a different number ends your turn."
        return f"Two {values[0]}s! Find the third {values[0]} to collect a trio."

    def project_view(self, s: State, player: str) -> GameView:
        revealed_slots = {r["slot"]: r["card"] for r in s["reveals"] if r["owner"] == "table"}
        community = []
        for i, card in enumerate(s["table"]):
            shown = revealed_slots.get(i)
            community.append(face(shown) if shown else CardView(
                id=f"table-slot-{i}", label=f"Table position {i + 1}" if card else f"Empty position {i + 1}",
                value="?" if card else "", color="neutral", suit="hidden" if card else "empty"))
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[PlayerView(id=p, count=len(s["hands"][p]), score=len(s["trios"][p]) // 3,
                                bank=[face(card) for card in s["trios"][p]]) for p in s["order"]],
            hand=[face(card) for card in s["hands"].get(player, [])], community=community,
            actions=self.legal_actions(s, player), winners=s["winners"], message=self._message(s),
            detail={"revealed": [{"owner": r["owner"], "slot": r["slot"], "card": face(r["card"]).model_dump(),
                                  "edge": r.get("edge")}
                                 for r in s["reveals"]], "failed": s.get("failed", False)},
        )
