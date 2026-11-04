"""Public, simultaneous no-chain booping and explicit graduation choices."""

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

# Seat 0 plays coral pieces, seat 1 blue. Finished messages name a colour, never "you".
COLOURS = ("Coral", "Blue")
DIRECTIONS = tuple((r, c) for r in (-1, 0, 1) for c in (-1, 0, 1) if (r, c) != (0, 0))


def square(index: int) -> str:
    return f"{chr(65 + index % 6)}{index // 6 + 1}"


def lines(board: list, player: str, adult_only: bool = False) -> list[list[int]]:
    found = []
    for row in range(6):
        for col in range(6):
            for dr, dc in ((0, 1), (1, 0), (1, 1), (1, -1)):
                positions = [(row + dr * n, col + dc * n) for n in range(3)]
                if not all(0 <= r < 6 and 0 <= c < 6 for r, c in positions):
                    continue
                slots = [r * 6 + c for r, c in positions]
                if all(board[i] and board[i]["owner"] == player and
                       (not adult_only or board[i]["kind"] == "cat") for i in slots):
                    found.append(slots)
    return found


class BoopEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="boop", name="boop.", subtitle="Push kittens and line up three cats",
            family="boop", min_players=2, max_players=2, minutes="15–25", icon="cat",
            color="coral", rules_version="standard-1", score_order="none", rules=[
                "Place a kitten or available cat in any empty square on the 6×6 bed.",
                "Adjacent pieces boop one space away. Occupied destinations block; no chain reactions.",
                "Kittens cannot push cats. Off-bed pieces return to their owner's pool.",
                "After booping, graduate one line of three into cats; with eight pieces down, you may return one instead.",
                "Only the active player checks: three adult cats in a line or eight adult cats on the bed wins.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        return {"order": players, "turn": 0, "phase": "placing", "board": [None] * 36,
                "pools": {p: {"kitten": 8, "cat": 0} for p in players},
                "retired": dict.fromkeys(players, 0), "reserve": dict.fromkeys(players, 8),
                "winners": [], "last_move": None, "last_pushes": [], "last_graduation": None,
                "moves": 0, "outcome_reason": None, "winning_cells": [],
                "message": "You play coral and go first. Pick a square for your first kitten."}

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        if s["phase"] == "graduating":
            choices = [legal("Graduate " + ", ".join(square(i) for i in group),
                             "graduate", choice=",".join(map(str, group)))
                       for group in lines(s["board"], player)]
            own = [i for i, piece in enumerate(s["board"]) if piece and piece["owner"] == player]
            if len(own) == 8:
                choices.extend(legal(f"Bring {square(i)} back to your pool", "return_piece", choice=str(i))
                               for i in own)
            return choices
        return [legal(f"Place {kind} at {square(i)}", "place", choice=str(i), color=kind)
                for kind in ("kitten", "cat") if s["pools"][player][kind]
                for i, piece in enumerate(s["board"]) if piece is None]

    def _pass(self, s: State) -> None:
        s.update(turn=1 - s["turn"], phase="placing",
                 message="Choose an available piece and an empty square.")

    def _return(self, s: State, player: str, slots: list[int]) -> None:
        for index in slots:
            piece = s["board"][index]
            if piece["kind"] == "kitten":
                s["retired"][player] += 1
                s["reserve"][player] -= 1
            s["pools"][player]["cat"] += 1
            s["board"][index] = None

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        if action.type in {"graduate", "return_piece"}:
            slots = [int(n) for n in action.choice.split(",")]
            kittens = sum(s["board"][i]["kind"] == "kitten" for i in slots)
            s["last_graduation"] = {"owner": player, "cells": slots, "kind": action.type,
                                    "kittens": kittens}
            self._return(s, player, slots)
            self._pass(s)
            return s
        index = int(action.choice)
        kind = action.color
        s["pools"][player][kind] -= 1
        s["board"][index] = {"owner": player, "kind": kind}
        before = self.copy(s)["board"]
        row, col = divmod(index, 6)
        pushes = []
        for dr, dc in DIRECTIONS:
            r, c = row + dr, col + dc
            if not (0 <= r < 6 and 0 <= c < 6):
                continue
            source = r * 6 + c
            piece = before[source]
            if not piece or (kind == "kitten" and piece["kind"] == "cat"):
                continue
            nr, nc = r + dr, c + dc
            destination = nr * 6 + nc if 0 <= nr < 6 and 0 <= nc < 6 else -1
            if destination >= 0 and before[destination] is not None:
                continue
            s["board"][source] = None
            if destination < 0:
                s["pools"][piece["owner"]][piece["kind"]] += 1
            else:
                s["board"][destination] = piece
            pushes.append({"from": source, "to": destination, **piece})
        s.update(last_move=index, last_pushes=pushes, last_graduation=None, moves=s["moves"] + 1)
        own = [piece for piece in s["board"] if piece and piece["owner"] == player]
        adult_lines = lines(s["board"], player, adult_only=True)
        if adult_lines or len(own) == 8 and all(p["kind"] == "cat" for p in own):
            s.update(phase="finished", winners=[player],
                     outcome_reason="three-cats" if adult_lines else "eight-cats",
                     winning_cells=list(adult_lines[0]) if adult_lines else
                     [i for i, p in enumerate(s["board"]) if p and p["owner"] == player],
                     message=f"{COLOURS[s['turn']]} lined up three adult cats." if adult_lines else
                     f"{COLOURS[s['turn']]} has all eight adult cats on the bed.")
        elif lines(s["board"], player) or len(own) == 8:
            s.update(phase="graduating", message="Choose one line to graduate, or bring a piece back if all eight are down.")
        else:
            self._pass(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[PlayerView(id=p, count=sum(bool(t and t["owner"] == p) for t in s["board"]))
                     for p in s["order"]], hand=[],
            community=[CardView(id=str(i), label=(f"{piece['kind'].title()} at {square(i)}" if piece else f"Empty {square(i)}"),
                                value=piece["kind"] if piece else "", suit=piece["owner"] if piece else "",
                                color=("coral" if piece["owner"] == s["order"][0] else "blue") if piece else "neutral")
                       for i, piece in enumerate(s["board"])],
            actions=self.legal_actions(s, player), winners=s["winners"], message=s["message"],
            detail={"pools": s["pools"], "retired": s["retired"], "reserve": s["reserve"],
                    "last_move": s["last_move"], "last_pushes": s["last_pushes"], "moves": s["moves"],
                    "last_graduation": s.get("last_graduation"),
                    "outcome_reason": s.get("outcome_reason"),
                    "winning_cells": s.get("winning_cells", [])},
        )
