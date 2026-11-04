"""American checkers: compulsory forward jumps, short kings and completed turns."""

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


def square(index: int) -> str:
    return f"{'ABCDEFGH'[index % 8]}{8 - index // 8}"


def moves(s: State, seat: int) -> list[tuple[int, int, int | None]]:
    board = s["board"]
    jumps: list[tuple[int, int, int | None]] = []
    steps: list[tuple[int, int, int | None]] = []
    for start, piece in enumerate(board):
        if piece is None or piece % 2 != seat or (s["forced"] is not None and start != s["forced"]):
            continue
        row, col = divmod(start, 8)
        directions = (-1, 1) if piece >= 2 else (-1,) if seat == 0 else (1,)
        for dr in directions:
            for dc in (-1, 1):
                r, c = row + dr, col + dc
                if not (0 <= r < 8 and 0 <= c < 8):
                    continue
                near = r * 8 + c
                if board[near] is None:
                    steps.append((start, near, None))
                elif board[near] % 2 != seat:
                    r, c = row + dr * 2, col + dc * 2
                    if 0 <= r < 8 and 0 <= c < 8 and board[r * 8 + c] is None:
                        jumps.append((start, r * 8 + c, near))
    return jumps or ([] if s["forced"] is not None else steps)


# Seat 0 plays coral men from the bottom, seat 1 ivory men from the top.
COLOURS = ("Coral", "Ivory")


def turn_message(s: State) -> str:
    """Instruction for the seat about to move (only that seat reads it)."""
    colour = COLOURS[s["turn"]]
    if any(captured is not None for _, _, captured in moves(s, s["turn"])):
        return f"You play {colour}. A capture is available, so you must jump."
    return f"You play {colour}. Choose a piece, then its destination."


def position(s: State) -> str:
    return ",".join("-" if p is None else str(p) for p in s["board"]) + f":{s['turn']}"


class CheckersEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="checkers", name="Checkers", subtitle="Capture the opposing pieces",
            family="board", min_players=2, max_players=2, minutes="10–25", icon="crown",
            color="sage", score_label="Captures", rules=[
                "Move diagonally forward on dark squares. Captures are compulsory.",
                "Finish every available jump with the same piece; choose any capture path.",
                "Reach the far row to become a king. Crowning ends that turn; kings move either way.",
                "Win when the other player has no pieces or legal move. Threefold repetition or 40 moves each without a capture/man move draws.",
            ],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        board = [None if (r + c) % 2 == 0 or 3 <= r <= 4 else 1 if r < 3 else 0
                 for r in range(8) for c in range(8)]
        s: State = {"order": players, "turn": 0, "phase": "playing", "board": board,
                    "forced": None, "quiet": 0, "positions": {}, "winners": [],
                    "last_move": None, "last_from": None, "last_captured": None,
                    "outcome_reason": None,
                    "message": "You play Coral and move first. Choose a piece, then its destination."}
        s["positions"][position(s)] = 1
        return s

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        return [legal(f"{'Jump' if captured is not None else 'Move'} {square(a)} to {square(b)}",
                      "move", choice=f"{a}:{b}") for a, b, captured in moves(s, s["turn"])]

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        start, end = map(int, action.choice.split(":"))
        captured = next(c for a, b, c in moves(s, s["turn"]) if (a, b) == (start, end))
        piece = s["board"][start]
        s["board"][start], s["board"][end] = None, piece
        s["last_move"] = end
        s["last_from"] = start
        s["last_captured"] = captured
        s["quiet"] = 0 if captured is not None or piece < 2 else s["quiet"] + 1
        if captured is not None:
            s["board"][captured] = None
        crowned = piece < 2 and end // 8 == (0 if s["turn"] == 0 else 7)
        if crowned:
            s["board"][end] = piece + 2
        s["forced"] = end if captured is not None and not crowned else None
        if s["forced"] is not None and moves(s, s["turn"]):
            s["message"] = f"Keep jumping: continue with the piece on {square(end)}."
            return s
        s["forced"] = None
        s["turn"] = 1 - s["turn"]
        if not moves(s, s["turn"]):
            remaining = any(v is not None and v % 2 == s["turn"] for v in s["board"])
            loser, winner = COLOURS[s["turn"]], COLOURS[1 - s["turn"]]
            s.update(phase="finished", winners=[player],
                     outcome_reason="no-legal-move" if remaining else "no-pieces",
                     message=f"{loser} has no legal move left, so {winner} wins." if remaining else
                     f"Every {loser} piece has been captured, so {winner} wins.")
        else:
            key = position(s)
            s["positions"][key] = s["positions"].get(key, 0) + 1
            if s["quiet"] >= 80 or s["positions"][key] >= 3:
                s.update(phase="finished", draw=True,
                         outcome_reason="quiet-limit" if s["quiet"] >= 80 else "threefold",
                         message="Draw: 40 moves each without a capture or man move."
                         if s["quiet"] >= 80 else "Draw: the same position occurred three times.")
            else:
                s["message"] = turn_message(s)
        return s

    def project_view(self, s: State, player: str) -> GameView:
        return GameView(
            game_id=self.manifest.id, phase=s["phase"],
            current_player=None if s["phase"] == "finished" else s["order"][s["turn"]],
            players=[PlayerView(id=p, score=12 - sum(v is not None and v % 2 != seat for v in s["board"]))
                     for seat, p in enumerate(s["order"])],
            hand=[], actions=self.legal_actions(s, player), winners=s["winners"], message=s["message"],
            community=[CardView(id=str(i), label=square(i),
                                value="" if v is None else str(v % 2 + 1),
                                color="empty" if v is None else "coral" if v % 2 == 0 else "ivory",
                                subtitle="King" if v is not None and v >= 2 else "")
                       for i, v in enumerate(s["board"])],
            detail={"rows": 8, "columns": 8, "draw": s.get("draw", False),
                    "last_move": s["last_move"], "outcome_reason": s.get("outcome_reason"),
                    "winning_cells": [], "last_from": s.get("last_from"),
                    "last_captured": s.get("last_captured"), "forced": s.get("forced")},
        )
