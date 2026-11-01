"""Bot scheduling uses authorized projections, never privileged strategy input."""

from collections.abc import Iterable

from app.core.contracts import Engine, GameView, State
from app.models import Member

BOT_DELAY_SECONDS = 0.8
BOT_NAMES = ("Ada", "Bo", "Cleo", "Dax", "Eli", "Fern", "Gus", "Hana", "Ivo")


def next_bot_view(
    engine: Engine, state: State, bots: Iterable[Member]
) -> tuple[str, GameView] | None:
    # Sequential turns first; then simultaneous choices and legitimate reactions.
    # The strategy layer receives only the returned personalized projection.
    eligible = []
    for member in bots:
        view = engine.project_view(state, member.user_id)
        # Holding a Gang chip still permits optional stealing/returning. Once
        # ranked, a bot waits for people instead of churning chips forever.
        if view.game_id == "the-gang" and view.phase == "chips":
            pending = view.detail.get("pending_players")
            if not isinstance(pending, list) or member.user_id not in pending:
                continue
        if view.actions:
            eligible.append((member.user_id, view))
    # An out-of-turn UNO announcement must have its chance before another bot's
    # ordinary turn/catch. The one-card count and action are already authorized.
    for bot_id, view in eligible:
        if any(option.action.type == "uno" for option in view.actions):
            return bot_id, view
    for bot_id, view in eligible:
        if view.current_player == bot_id:
            return bot_id, view
    return eligible[0] if eligible else None
