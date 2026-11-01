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


class FourEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="four-in-a-row", name="Four in a Row", subtitle="One more move. Four in a row.",
            family="board", min_players=2, max_players=2, minutes="5–15", icon="circle",
            color="coral", rules=["Drop a disc into an open column.",
                "Connect four horizontally, vertically or diagonally to win.",
                "A full board without a four-in-a-row is a draw."],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        return {"order": players, "turn": 0, "phase": "playing", "board": [None] * 42,
                "rows": 6, "columns": 7, "scores": dict.fromkeys(players, 0), "winners": [],
                "message": "Drop your first disc into a column.", "last_move": None}

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
            count = 1
            for direction in (-1, 1):
                r, c = row + dr * direction, column + dc * direction
                while 0 <= r < 6 and 0 <= c < 7 and s["board"][r * 7 + c] == seat:
                    count += 1
                    r, c = r + dr * direction, c + dc * direction
            if count >= 4:
                s.update(phase="finished", winners=[player], message="Four in a row!")
                s["scores"][player] = 1
                return s
        if all(cell is not None for cell in s["board"]):
            s.update(phase="finished", draw=True, message="An evenly matched board. It’s a draw.")
        else:
            s["turn"] = 1 - seat
            s["message"] = "Find your next connection."
        return s

    def project_view(self, s: State, player: str) -> GameView:
        return board_view(self.manifest.id, s, self.legal_actions(s, player))
