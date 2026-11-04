from app.core.cards import draw, rng, shuffle_saved
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


def sky_card(card: str) -> CardView:
    value = int(card.split(":")[1])
    return CardView(
        id=card,
        label=str(value),
        value=str(value),
        color="blue"
        if value <= 0
        else "green"
        if value < 5
        else "yellow"
        if value < 9
        else "coral",
        subtitle="SKYJO",
    )


class SkyjoEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(
            GameManifest(
                id="skyjo",
                name="Skyjo",
                subtitle="Reveal your grid. Lowest score wins.",
                family="grid",
                score_order="low",
                min_players=2,
                max_players=8,
                minutes="15–30",
                icon="grid",
                color="sky",
                rules=[
                    "Reveal two cards, then trade to lower your grid's score.",
                    "Three matching revealed cards in a column disappear.",
                    "At 100 total points, the lowest score wins.",
                ],
            )
        )

    def setup(
        self, players: list[str], settings: dict[str, bool], seed: int | None = None
    ) -> State:
        self.require_players(players)
        s: State = {
            "order": players,
            "turn": 0,
            "scores": {p: 0 for p in players},
            "round": 0,
            "winners": [],
        }
        self._round(s, seed)
        return s

    def _round(self, s: State, seed: int | None = None) -> None:
        cards = [
            f"sky:{n}:{i}"
            for n in range(-2, 13)
            for i in range(5 if n == -2 else 15 if n == 0 else 10)
        ]
        if "grids" in s:
            shuffle_saved(s, cards)
        else:
            rng(seed).shuffle(cards)
        s.update(
            deck=cards,
            grids={p: [cards.pop() for _ in range(12)] for p in s["order"]},
            revealed={p: [False] * 12 for p in s["order"]},
            discard=[cards.pop()],
            phase="opening",
            drawn=None,
            source=None,
            finisher=None,
            remaining=[],
            round_scores={},
            round_ledger={},
            round=s["round"] + 1,
            message="Turn over two cards to begin.",
        )

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "between_rounds":
            return [legal("Next round", "next_round")]
        if s["phase"] in ("opening", "reveal"):
            return [
                legal(f"Reveal card {i + 1}", "reveal", slot=i)
                for i, card in enumerate(s["grids"][player])
                if card and not s["revealed"][player][i]
            ]
        if s["drawn"]:
            actions = [
                legal(f"Replace card {i + 1}", "swap", slot=i)
                for i, card in enumerate(s["grids"][player])
                if card
            ]
            if s["source"] == "stock":
                actions.append(legal("Discard & reveal", "discard"))
            return actions
        return [legal("Take discard", "draw_discard"), legal("Draw a card", "draw_stock")]

    def _columns(self, s: State, player: str) -> None:
        for col in range(4):
            slots = [col, col + 4, col + 8]
            cards = [s["grids"][player][i] for i in slots]
            if (
                all(cards)
                and all(s["revealed"][player][i] for i in slots)
                and len({c.split(":")[1] for c in cards}) == 1
            ):
                s["discard"].extend(cards)
                for i in slots:
                    s["grids"][player][i] = None

    def _end_turn(self, s: State, player: str) -> None:
        self._columns(s, player)
        if (
            all(c is None or s["revealed"][player][i] for i, c in enumerate(s["grids"][player]))
            and not s["finisher"]
        ):
            s["finisher"] = player
            closing = s["order"].index(player)
            s["remaining"] = s["order"][closing + 1:] + s["order"][:closing]
        elif s["finisher"] and player in s["remaining"]:
            s["remaining"].remove(player)
        if s["finisher"] and not s["remaining"]:
            for p in s["order"]:
                s["revealed"][p] = [True] * 12
                self._columns(s, p)
            totals = {p: sum(int(c.split(":")[1]) for c in s["grids"][p] if c) for p in s["order"]}
            grid_totals = dict(totals)
            finisher = s["finisher"]
            if totals[finisher] > 0 and any(
                totals[p] <= totals[finisher] for p in s["order"] if p != finisher
            ):
                totals[finisher] *= 2
            for p in s["order"]:
                s["scores"][p] += totals[p]
                s["revealed"][p] = [True] * 12
            s["round_scores"] = totals
            s["round_ledger"] = {
                p: {"grid_total": grid_totals[p],
                    "removed_columns": sum(c is None for c in s["grids"][p]) // 3,
                    "multiplier": 2 if totals[p] != grid_totals[p] else 1,
                    "round_points": totals[p], "total_points": s["scores"][p]}
                for p in s["order"]
            }
            s["phase"] = "between_rounds"
            s["turn"] = s["order"].index(finisher)
            if max(s["scores"].values()) >= 100:
                low = min(s["scores"].values())
                s["winners"] = [p for p in s["order"] if s["scores"][p] == low]
                s["phase"] = "finished"
            return
        s["turn"] = (s["turn"] + 1) % len(s["order"])
        s["phase"] = "playing"

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "next_round":
            self._round(s)
        elif action.type == "reveal":
            s["revealed"][player][action.slot] = True
            if s["phase"] == "opening":
                if sum(s["revealed"][player]) == 2:
                    s["turn"] = (s["turn"] + 1) % len(s["order"])
                    if all(sum(r) == 2 for r in s["revealed"].values()):
                        if s["round"] == 1:
                            s["turn"] = max(
                                range(len(s["order"])),
                                key=lambda i: sum(
                                    int(c.split(":")[1])
                                    for j, c in enumerate(s["grids"][s["order"][i]])
                                    if s["revealed"][s["order"][i]][j]
                                ),
                            )
                        s["phase"] = "playing"
            else:
                self._end_turn(s, player)
        elif action.type in ("draw_stock", "draw_discard"):
            s["source"] = "stock" if action.type == "draw_stock" else "discard"
            s["drawn"] = draw(s)[0] if s["source"] == "stock" else s["discard"].pop()
        elif action.type == "swap":
            s["discard"].append(s["grids"][player][action.slot])
            s["grids"][player][action.slot] = s["drawn"]
            s["revealed"][player][action.slot] = True
            s["drawn"] = None
            self._end_turn(s, player)
        else:
            s["discard"].append(s["drawn"])
            s["drawn"] = None
            s["phase"] = "reveal"
            if all(
                r or not c for r, c in zip(s["revealed"][player], s["grids"][player], strict=True)
            ):
                self._end_turn(s, player)
        return s

    def _message(self, s: State, player: str) -> str:
        """The instruction for the seat that can act, from the current phase.

        Only the drawer's own view names a privately drawn card. The stored
        round-start message stays untouched: saved reshuffles hash the state.
        """
        phase, actor = s["phase"], s["order"][s["turn"]]
        if phase == "finished":
            return "A total reached 100, so the match is over. The lowest total wins."
        if phase == "between_rounds":
            return (f"Round {s['round']} is scored. Start round {s['round'] + 1} "
                    "when everyone has checked the scores.")
        if phase == "opening":
            return ("Turn over two of your cards to begin." if not any(s["revealed"][actor])
                    else "Turn over one more of your cards.")
        final = "Final turn. " if s["finisher"] else ""
        if phase == "reveal":
            return f"{final}Turn over one of your face-down cards."
        if s["drawn"]:
            value = sky_card(s["drawn"]).value
            if s["source"] == "discard":
                return f"{final}Replace one of your grid cards with the {value} you took."
            drawn = f"the {value} you drew" if player == actor else "the drawn card"
            return (f"{final}Replace one of your grid cards with {drawn}, "
                    "or discard it and turn over a face-down card.")
        if not s["discard"]:
            return f"{final}Draw a card."
        top = sky_card(s["discard"][-1]).value
        return f"{final}Draw a card, or take the {top} from the discard pile."

    def project_view(self, s: State, player: str) -> GameView:
        return GameView(
            game_id="skyjo",
            phase=s["phase"],
            current_player=s["order"][s["turn"]],
            players=[
                PlayerView(
                    id=p,
                    score=s["scores"][p],
                    removed_slots=[i for i, card in enumerate(s["grids"][p]) if not card],
                    cards=[
                        sky_card(c) if c and s["revealed"][p][i] else None
                        for i, c in enumerate(s["grids"][p])
                    ],
                )
                for p in s["order"]
            ],
            hand=[],
            discard=sky_card(s["discard"][-1]) if s["discard"] else None,
            drawn=sky_card(s["drawn"]) if s["drawn"] and s["order"][s["turn"]] == player else None,
            draw_count=len(s["deck"]),
            actions=self.legal_actions(s, player),
            message=self._message(s, player),
            winners=s["winners"],
            detail={"round": s["round"], "finisher": s["finisher"],
                    "remaining": s["remaining"],
                    "round_ledger": s.get("round_ledger", {})
                    if s["phase"] in ("between_rounds", "finished") else {}},
        )
