"""Bot scheduling uses authorized projections, never privileged strategy input."""

from collections.abc import Iterable

from app.core.contracts import Engine, GameView, State
from app.models import Member

BOT_DELAY_SECONDS = 0.8
# A bot never closes a review or reveal before people can read it. These pauses
# apply only when the bot due next can do nothing but advance past that screen;
# ordinary bot moves keep the short delay above.
BOT_REVIEW_DELAY_SECONDS = {
    "continue": 5.0,  # Trio: the revealed cards, before they return or a trio is taken
    "next_selection": 4.0,  # 6 nimmt!: where each revealed number went
    "next_prompt": 6.0,  # Party games: the prompt's reveal and points
    "next_round": 8.0,  # Round summaries: Skyjo, Flip 7, Azul, Sea Salt & Paper, 6 nimmt!
    "next_heist": 8.0,  # The Gang: revealed hands and the heist result
}
# A person who has just reached one card gets a fair chance to call UNO before
# any bot may catch them. Catching stays an ordinary, legal engine action.
BOT_CATCH_GRACE_SECONDS = 3.0
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


def bot_delay(
    engine: Engine, state: State, bots: Iterable[Member], base: float = BOT_DELAY_SECONDS
) -> float:
    """Seconds before the next bot may act, from that bot's own legal actions.

    Pacing only: the scheduled bot and its policy are unchanged. A pause applies
    when that bot could only advance past a review, or could catch a person who
    has not yet had a fair chance to call UNO.
    """
    bots = list(bots)
    selected = next_bot_view(engine, state, bots)
    if selected is None:
        return base
    _, view = selected
    delay = base
    kinds = {option.action.type for option in view.actions}
    if kinds and kinds <= BOT_REVIEW_DELAY_SECONDS.keys():
        delay = max(delay, *(BOT_REVIEW_DELAY_SECONDS[kind] for kind in kinds))
    bot_ids = {member.user_id for member in bots}
    if any(
        option.action.type == "catch_uno" and option.action.target not in bot_ids
        for option in view.actions
    ):
        delay = max(delay, BOT_CATCH_GRACE_SECONDS)
    return delay
