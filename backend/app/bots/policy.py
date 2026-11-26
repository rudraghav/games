"""Registry of ordinary algorithms: no model, network, secret state or shared hands."""

import json
from typing import Any, Literal

from app.bots.boards import board_action
from app.bots.cards import card_action
from app.bots.casino import casino_action
from app.bots.context import BotDecision, Context
from app.bots.modern import forget_plan, modern_action, observe_modern
from app.bots.palace import palace_action
from app.bots.parlour import parlour_action
from app.bots.words import word_action
from app.core.contracts import Action, GameView, LegalAction, RuleError

Level = Literal["easy", "medium", "hard"]

# "hard" is each game's policy, untouched. The other levels make a deliberate slip
# this often: a uniformly random ordinary move instead of the policy's choice.
SLIP_CHANCE: dict[str, float] = {"medium": 0.18, "easy": 0.5}

# A slip never replaces these. They advance a review or round, are a courtesy or
# reaction with no real choice, or are built by the policy from several cards.
STEADY_ACTIONS = frozenset(
    {
        # Advancing a review, reveal or round for the whole table.
        "continue",
        "next_round",
        "next_prompt",
        "next_selection",
        "next_heist",
        "next",
        "reveal_hand",
        "reveal_mermaids",
        # Calling or catching UNO.
        "uno",
        "catch_uno",
        # The only move a player without a real one is offered.
        "pass",
        # A bot never claims it answered aloud; Spill or Chill stays Chill.
        "respond",
        # Composed by the policy: a rummy declaration, a clue, a Palace setup, a Deal payment.
        "declare",
        "clue",
        "arrange",
        "pay",
    }
)
# A slip never lands on these either. They leave the hand or deal, stake a whole
# stack, or are free moves that would only stall or undo the table's progress.
SLIP_AVOIDS = STEADY_ACTIONS | {"fold", "all_in", "rearrange", "return_chip"}

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
        "shithead",
        "housie",
        "liars-dice",
        "bluff",
        "truth-or-dare",
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


def slip_options(ctx: Context) -> list[LegalAction]:
    """Ordinary complete moves a slip may land on, from the bot's own legal actions."""
    options = [
        o
        for o in ctx.options
        if o.action.type not in SLIP_AVOIDS
        and o.action.choice != "pass"  # sitting a party prompt out is not a move
        and o.input in (None, "amount")  # cards and text need the policy to compose them
    ]
    if ctx.view.game_id == "the-gang":
        # A wrong estimate takes a free chip; it never takes one from a crewmate.
        chips = ctx.detail.get("chips")
        held = set(chips.values()) if isinstance(chips, dict) else set()
        options = [o for o in options if o.action.amount not in held]
    return options


def _slip(ctx: Context, chosen: Action, level: Level) -> Action:
    chance = SLIP_CHANCE.get(level, 0.0)
    if not chance or chosen.type in STEADY_ACTIONS:
        return chosen
    if any(o.input in ("cards", "text") for o in ctx.of(chosen.type)):
        return chosen
    options = slip_options(ctx)
    if not options or all(ctx.action(o) == chosen for o in options):
        return chosen
    # Drawn after the policy has decided, from the same seeded cursor: a replay of
    # this memory and view slips at the same moments and onto the same moves.
    if ctx.random.random() >= chance:
        return chosen
    action = ctx.action(ctx.pick(options))
    if action != chosen:
        forget_plan(ctx, action)
    return action


def choose_action(
    view: GameView,
    player_id: str,
    memory: dict[str, Any] | None = None,
    level: Level = "hard",
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
        or palace_action(ctx)
        or parlour_action(ctx)
        or word_action(ctx)
    )
    if action is None:
        raise RuleError("This bot's game policy is unavailable.")
    if level != "hard":
        action = _slip(ctx, action, level)
    if len(json.dumps(ctx.memory)) > 16384:
        raise RuleError("Bot observation memory exceeded its bound.")
    return BotDecision(action, ctx.memory)
