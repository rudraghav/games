"""Classic 6 nimmt!: private simultaneous choices, ascending row resolution."""

from random import Random

from app.core.cards import rng
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


def penalty(number: int) -> int:
    return 7 if number == 55 else 5 if number % 11 == 0 else 3 if number % 10 == 0 else 2 if number % 5 == 0 else 1


SELECT_MESSAGE = ("Choose one number to lock. Locked numbers stay secret until everyone has chosen, "
                  "then resolve from lowest to highest.")


def face(number: int) -> CardView:
    points = penalty(number)
    return CardView(id=f"number-{number}", label=f"{number} ({points} penalty {'point' if points == 1 else 'points'})",
                    value=str(number), subtitle=str(points), color={1: "green", 2: "blue", 3: "yellow", 5: "red", 7: "plum"}[points])


class SixNimmtEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="six-nimmt", name="6 nimmt!", subtitle="Choose numbers and avoid penalty rows",
            family="number-rows", min_players=2, max_players=10, minutes="20–40",
            icon="layers", color="coral", rules_version="classic-1", score_label="Penalty points",
            score_order="low", rules=[
                "Classic 104-card deck. Ten private cards each; four public rows. Lowest penalty total wins.",
                "Everyone locks one secret card, then all reveal together. Numbers resolve from lowest to highest.",
                "Each card follows the greatest row-end number below it. The sixth card takes that row's five cards as penalties.",
                "A card below every row end must take a row of its owner's choice, becoming its new starter.",
                "Penalty values: ordinary 1; ending in five 2; multiples of ten 3; multiples of eleven 5; 55 has 7.",
                "After all ten cards, total penalties. At 66 or more, finish the round: lowest total wins and equal lowest totals tie.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        s: State = {"order": players, "turn": 0, "phase": "selecting", "round": 0,
                    "seed": rng(seed).randrange(2**63), "scores": dict.fromkeys(players, 0),
                    "round_scores": {}, "winners": []}
        self._deal(s)
        return s

    def _deal(self, s: State) -> None:
        s["round"] += 1
        deck = list(range(1, 105))
        Random(s["seed"] + s["round"]).shuffle(deck)
        s.update(deck=deck, hands={p: sorted(deck.pop() for _ in range(10)) for p in s["order"]},
                 rows=[[deck.pop()] for _ in range(4)], captured={p: [] for p in s["order"]},
                 selected={}, pending=[], revealed=[], resolution=[], phase="selecting", turn=0, trick=1,
                 message=SELECT_MESSAGE)

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if player not in s["order"] or s["phase"] == "finished":
            return []
        if s["phase"] == "selecting":
            return [] if player in s["selected"] else [legal(f"Lock {n}", "select_number", card=f"number-{n}") for n in s["hands"][player]]
        if player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "take_row":
            return [legal(f"Take row {i + 1} · {sum(map(penalty, row))} penalties", "take_row", choice=str(i)) for i, row in enumerate(s["rows"])]
        return [legal("Next round", "next_round")] if s["phase"] == "round_over" else [legal("Next selection", "next_selection")]

    def _take(self, s: State, player: str, row: int, card: int, kind: str) -> None:
        taken = s["rows"][row]
        s["captured"][player].extend(taken)
        s["rows"][row] = [card]
        s.setdefault("resolution", []).append({"player": player, "number": card, "row": row, "kind": kind,
                                               "captured": list(taken), "penalties": sum(map(penalty, taken))})

    def _resolve(self, s: State) -> None:
        while s["pending"]:
            item = s["pending"][0]
            p, card = item["player"], item["number"]
            eligible = [i for i, row in enumerate(s["rows"]) if row[-1] < card]
            if not eligible:
                # Only the card's owner can act, so the message speaks to them.
                s.update(phase="take_row", turn=s["order"].index(p),
                         message=f"Your {card} is lower than every row end. Choose a row to take: "
                                 f"you score its penalties and your {card} starts that row.")
                return
            row = max(eligible, key=lambda i: s["rows"][i][-1])
            if len(s["rows"][row]) == 5:
                self._take(s, p, row, card, "sixth")
            else:
                s["rows"][row].append(card)
                s.setdefault("resolution", []).append({"player": p, "number": card, "row": row, "kind": "placed",
                                                       "captured": [], "penalties": 0})
            s["pending"].pop(0)
        s.update(turn=0, phase="review",
                 message="Check where each number went, then continue to the next selection.")
        if not any(s["hands"].values()):
            s["round_scores"] = {p: sum(map(penalty, s["captured"][p])) for p in s["order"]}
            for p in s["order"]:
                s["scores"][p] += s["round_scores"][p]
            s.update(phase="round_over", message="All ten cards are played. Check the round penalties, then start the next round.")
            if max(s["scores"].values()) >= 66:
                best = min(s["scores"].values())
                s.update(phase="finished", winners=[p for p in s["order"] if s["scores"][p] == best],
                         message="Someone reached 66 penalties. The fewest penalties wins.")

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type == "next_round":
            self._deal(s)
        elif action.type == "next_selection":
            s.update(phase="selecting", selected={}, pending=[], revealed=[], resolution=[], turn=0,
                     trick=s["trick"] + 1, message=SELECT_MESSAGE)
        elif action.type == "take_row":
            item = s["pending"].pop(0)
            self._take(s, player, int(action.choice), item["number"], "low")
            self._resolve(s)
        else:
            number = int(action.card.removeprefix("number-"))
            s["hands"][player].remove(number)
            s["selected"][player] = number
            pending = [p for p in s["order"] if p not in s["selected"]]
            if pending:
                s["turn"] = s["order"].index(pending[0])
                s["message"] = SELECT_MESSAGE
            else:
                s["revealed"] = [{"player": p, "number": n} for p, n in sorted(s["selected"].items(), key=lambda item: item[1])]
                s["pending"] = [dict(item) for item in s["revealed"]]
                s["selected"] = {}
                s["resolution"] = []
                self._resolve(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        round_penalties = {p: sum(map(penalty, s["captured"][p])) for p in s["order"]}
        totals = {p: s["scores"][p] + (round_penalties[p] if s["phase"] not in {"round_over", "finished"} else 0) for p in s["order"]}
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[PlayerView(id=p, count=len(s["hands"][p]), score=s["scores"][p]) for p in s["order"]],
            hand=[face(n) for n in s["hands"].get(player, [])],
            community=[face(item["number"]) for item in s["revealed"]], draw_count=len(s["deck"]),
            actions=self.legal_actions(s, player), winners=s["winners"], message=s["message"],
            detail={"round": s["round"], "trick": s["trick"], "rows": [[face(n).model_dump() for n in row] for row in s["rows"]],
                    "row_penalties": [sum(map(penalty, row)) for row in s["rows"]],
                    "selected_players": list(s["selected"]),
                    "own_selection": face(s["selected"][player]).model_dump() if player in s["selected"] else None,
                    "revealed": [{"player": item["player"], "card": face(item["number"]).model_dump()} for item in s["revealed"]],
                    "round_penalties": {p: points for p, points in round_penalties.items()},
                    "total_penalties": totals,
                    "round_scores": s["round_scores"], "pending_player": s["pending"][0]["player"] if s["pending"] else None,
                    # Public: every revealed number and every row it took were already on the table.
                    "resolution": [{"player": step["player"], "card": face(step["number"]).model_dump(), "row": step["row"],
                                    "kind": step["kind"], "captured": [face(n).model_dump() for n in step["captured"]],
                                    "penalties": step["penalties"]}
                                   for step in s.get("resolution", [])],
                    "unresolved": [{"player": item["player"], "card": face(item["number"]).model_dump()}
                                   for item in s["pending"]],
                    "decision_mode": "simultaneous" if s["phase"] == "selecting" else "turn",
                    "pending_players": [p for p in s["order"] if p not in s["selected"]] if s["phase"] == "selecting" else []},
        )
