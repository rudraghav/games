"""Registry of ordinary algorithms: no model, network, secret state or shared hands."""

import json
from typing import Any

from app.bots.boards import board_action
from app.bots.cards import card_action
from app.bots.casino import casino_action
from app.bots.context import BotDecision, Context
from app.bots.modern import modern_action, observe_modern
from app.bots.words import word_action
from app.core.contracts import GameView, RuleError

BOT_GAMES = frozenset(
    {
        "uno",
        "uno-no-mercy",
        "deal",
        "deal-no-mercy",
        "holdem",
        "rummy",
        "teen-patti",
        "blackjack",
        "skyjo",
        "four-in-a-row",
        "reversi",
        "word-agents",
        "gem-market",
        "checkers",
        "mancala",
        "flip-7",
        "trio",
        "azul",
        "spill-or-chill",
        "most-likely",
        "hot-seat",
        "the-gang",
        "six-nimmt",
        "sea-salt-paper",
        "boop",
    }
)


def supports_bots(game_id: str) -> bool:
    return game_id in BOT_GAMES


def observe_view(
    view: GameView, player_id: str, memory: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Observe only a bot's permitted view, even while another player acts."""
    ctx = Context(view, player_id, memory)
    # Observation is not a decision and must not advance the policy RNG cursor.
    ctx.memory["step"] = int((memory or {}).get("step", 0))
    observe_modern(ctx)
    return ctx.memory


def choose_action(
    view: GameView, player_id: str, memory: dict[str, Any] | None = None
) -> BotDecision:
    if not supports_bots(view.game_id):
        raise RuleError("This experience does not use bot players.")
    if not view.actions:
        raise RuleError("This bot has no legal decision.")
    ctx = Context(view, player_id, memory)
    observe_modern(ctx)
    action = (
        board_action(ctx)
        or card_action(ctx)
        or casino_action(ctx)
        or modern_action(ctx)
        or word_action(ctx)
    )
    if action is None:
        raise RuleError("This bot's game policy is unavailable.")
    if len(json.dumps(ctx.memory)) > 16384:
        raise RuleError("Bot observation memory exceeded its bound.")
    return BotDecision(action, ctx.memory)
