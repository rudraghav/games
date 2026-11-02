from app.core.contracts import CardView, GameView, LegalAction, PlayerView, State


def board_view(game_id: str, s: State, actions: list[LegalAction]) -> GameView:
    colors = ["coral", "gold"] if game_id == "four-in-a-row" else ["ink", "ivory"]
    return GameView(
        game_id=game_id, phase=s["phase"],
        current_player=s["order"][s["turn"]] if s["phase"] != "finished" else None,
        players=[PlayerView(id=p, score=s["scores"][p]) for p in s["order"]],
        hand=[], actions=actions, winners=s["winners"], message=s["message"],
        community=[CardView(id=str(i), label=f"Row {i // s['columns'] + 1}, column {i % s['columns'] + 1}",
                            value="" if cell is None else str(cell + 1),
                            color="empty" if cell is None else colors[cell])
                   for i, cell in enumerate(s["board"])],
        detail={"rows": s["rows"], "columns": s["columns"], "draw": s.get("draw", False),
                "last_move": s.get("last_move"), "outcome_reason": s.get("outcome_reason"),
                "winning_cells": s.get("winning_cells", [])},
    )
