from app.core.contracts import (
    Action,
    BaseEngine,
    GameManifest,
    GameView,
    LegalAction,
    State,
    legal,
    validate_action,
)
from app.games.board.view import board_view

# Seat 0 drops coral discs, seat 1 gold. Messages are read only by the seat that
# can act, so they say "you"; finished messages name a colour, never "you".
COLOURS = ("Coral", "Gold")


def landing(board: list[int | None], column: int) -> int | None:
    rows = [r for r in range(6) if board[r * 7 + column] is None]
    return max(rows) * 7 + column if rows else None


class FourEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="four-in-a-row", name="Four in a Row", subtitle="Connect four discs to win",
            family="board", min_players=2, max_players=2, minutes="5–15", icon="circle",
            color="coral", score_order="none", rules=["Drop a disc into an open column.",
                "Connect four horizontally, vertically or diagonally to win.",
                "A full board without a four-in-a-row is a draw."],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        return {"order": players, "turn": 0, "phase": "playing", "board": [None] * 42,
                "rows": 6, "columns": 7, "scores": dict.fromkeys(players, 0), "winners": [],
                "message": "You drop coral discs and go first. Choose a column.", "last_move": None,
                "outcome_reason": None, "winning_cells": []}

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        return [legal(f"Drop in column {c + 1}", "drop", choice=str(c))
                for c in range(7) if s["board"][c] is None]

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        column = int(action.choice)
        row = max(r for r in range(6) if s["board"][r * 7 + column] is None)
        seat = s["turn"]
        s["board"][row * 7 + column] = seat
        s["last_move"] = row * 7 + column
        for dr, dc in ((1, 0), (0, 1), (1, 1), (1, -1)):
            line = [row * 7 + column]
            for direction in (-1, 1):
                r, c = row + dr * direction, column + dc * direction
                while 0 <= r < 6 and 0 <= c < 7 and s["board"][r * 7 + c] == seat:
                    if direction < 0:
                        line.insert(0, r * 7 + c)
                    else:
                        line.append(r * 7 + c)
                    r, c = r + dr * direction, c + dc * direction
            if len(line) >= 4:
                s.update(phase="finished", winners=[player],
                         message=f"{COLOURS[seat]} connected four in a row.",
                         outcome_reason="four-in-a-row", winning_cells=line[:4])
                s["scores"][player] = 1
                return s
        if all(cell is not None for cell in s["board"]):
            s.update(phase="finished", draw=True, outcome_reason="board-full",
                     message="The board is full without a line of four. It’s a draw.")
        else:
            s["turn"] = 1 - seat
            s["message"] = f"You drop {COLOURS[1 - seat].lower()} discs. Choose a column."
        return s

    def project_view(self, s: State, player: str) -> GameView:
        # Landing cells follow from the public board; they let every viewer see
        # where a column choice will land before it is made.
        drops = {} if s["phase"] == "finished" else {
            str(c): cell for c in range(7) if (cell := landing(s["board"], c)) is not None}
        return board_view(self.manifest.id, s, self.legal_actions(s, player), {"landing": drops})
