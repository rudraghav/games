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

DIRECTIONS = [(r, c) for r in (-1, 0, 1) for c in (-1, 0, 1) if r or c]
# Seat 0 plays the dark (ink) discs, seat 1 the light (ivory) discs.
COLOURS = ("Black", "White")


def captures(board: list[int | None], cell: int, seat: int) -> list[int]:
    if board[cell] is not None:
        return []
    result = []
    for dr, dc in DIRECTIONS:
        r, c = cell // 8 + dr, cell % 8 + dc
        line = []
        while 0 <= r < 8 and 0 <= c < 8 and board[r * 8 + c] == 1 - seat:
            line.append(r * 8 + c)
            r, c = r + dr, c + dc
        if line and 0 <= r < 8 and 0 <= c < 8 and board[r * 8 + c] == seat:
            result.extend(line)
    return result


class ReversiEngine(BaseEngine):
    def __init__(self) -> None:
        super().__init__(GameManifest(
            id="reversi", name="Reversi", subtitle="Capture and flip opposing discs",
            family="board", min_players=2, max_players=2, minutes="10–25", icon="circle",
            color="sage", score_label="Discs", rules=["Place a disc to bracket and flip an opponent’s line.",
                "You must pass when no capturing placement is available.",
                "When neither player can move, the most discs wins."],
        ))

    def setup(self, players: list[str], settings: dict[str, bool], seed: int | None = None) -> State:
        self.require_players(players)
        board: list[int | None] = [None] * 64
        board[27], board[36], board[28], board[35] = 1, 1, 0, 0
        return {"order": players, "turn": 0, "phase": "playing", "board": board,
                "rows": 8, "columns": 8, "scores": dict.fromkeys(players, 2), "winners": [],
                "message": "You play Black and go first. Choose a marked square to flip discs.",
                "last_move": None, "last_flips": [], "passed": None}

    def legal_actions(self, s: State, player: str) -> list[LegalAction]:
        if s["phase"] == "finished" or player != s["order"][s["turn"]]:
            return []
        return [legal(f"Place at {chr(65 + i % 8)}{i // 8 + 1}", "place", choice=str(i))
                for i in range(64) if captures(s["board"], i, s["turn"])]

    def apply_action(self, state: State, player: str, action: Action) -> State:
        validate_action(self.legal_actions(state, player), action)
        s = self.copy(state)
        cell, seat = int(action.choice), s["turn"]
        flipped = captures(s["board"], cell, seat)
        for target in [cell, *flipped]:
            s["board"][target] = seat
        s["last_move"] = cell
        s["last_flips"] = sorted(flipped)
        s["passed"] = None
        s["scores"] = {p: s["board"].count(i) for i, p in enumerate(s["order"])}
        next_seat = 1 - seat
        if any(captures(s["board"], i, next_seat) for i in range(64)):
            s["turn"] = next_seat
            s["message"] = f"You play {COLOURS[next_seat]}. Choose a marked square to flip discs."
        elif any(captures(s["board"], i, seat) for i in range(64)):
            s["passed"] = s["order"][next_seat]
            s["message"] = (f"{COLOURS[next_seat]} has no placement and passes. "
                            f"Play again as {COLOURS[seat]}.")
        else:
            high = max(s["scores"].values())
            leaders = [p for p, score in s["scores"].items() if score == high]
            black, white = (s["scores"][p] for p in s["order"])
            s.update(phase="finished", draw=len(leaders) == 2,
                     winners=leaders if len(leaders) == 1 else [],
                     message=f"No placements remain. Black {black}, White {white}.")
        return s

    def project_view(self, s: State, player: str) -> GameView:
        # Flips follow from the public board: every viewer may see which discs a
        # placement would turn, and which ones the last placement turned.
        flips = {} if s["phase"] == "finished" else {
            str(i): line for i in range(64) if (line := sorted(captures(s["board"], i, s["turn"])))}
        return board_view(self.manifest.id, s, self.legal_actions(s, player), {
            "flips": flips, "last_flips": s.get("last_flips", []), "passed": s.get("passed")})
