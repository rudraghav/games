"""Shithead choices from own cards and public pile only."""

from hashlib import sha256

from app.bots.context import Context
from app.core.cards import RANKS
from app.core.contracts import Action, LegalAction


def palace_action(ctx: Context) -> Action | None:
    if ctx.view.game_id != "shithead":
        return None
    settings = ctx.detail.get("settings", {})

    def keep_value(card: str) -> int:
        value = card[0]
        if value == "T":
            return 20
        if value == "2":
            return 19
        if value == "3" and settings.get("transparent_three"):
            return 18
        return RANKS.index(value) + 2

    if options := ctx.of("arrange"):
        action = options[0].action.model_copy(deep=True)
        action.cards = sorted(options[0].eligible_cards, key=keep_value, reverse=True)[:3]
        return action
    if options := ctx.of("play"):
        # Equal-rank greed can recycle the same high sets between two hands.
        # Recognize a repeated authorized situation, without storing a view or
        # looking at another hand, and vary this otherwise legal decision.
        signature = sha256(
            repr(
                (
                    sorted(c.id[0] for c in ctx.view.hand),
                    [c.id[0] for c in ctx.view.community],
                    [p.count for p in ctx.view.players],
                )
            ).encode()
        ).hexdigest()[:16]
        recent = list(ctx.memory.get("palace_recent", []))[-63:]
        repeated = signature in recent
        ctx.memory["palace_recent"] = [*recent, signature]
        ctx.memory["palace_variety"] = repeated or ctx.memory.get("palace_variety", False)
        if ctx.memory["palace_variety"] and ctx.of("pickup") and ctx.random.random() < 0.12:
            return ctx.action(ctx.pick(ctx.of("pickup")))
        if ctx.memory["palace_variety"] and ctx.random.random() < 0.45:
            return ctx.action(ctx.pick(options))

        def score(option: LegalAction) -> float:
            cards = option.action.cards
            trailing = 0
            for public in reversed(ctx.view.community):
                if public.id[0] != cards[0][0]:
                    break
                trailing += 1
            burn = cards[0][0] == "T" or trailing + len(cards) >= 4
            return len(cards) * 30 - keep_value(cards[0]) + (25 if burn else 0)

        return ctx.action(ctx.best(options, score))
    if options := ctx.of("flip"):
        # Slot occupancy is public; none of the candidate card identities exists
        # in this authorized view. Uniform choice does not inspect hidden cards.
        return ctx.action(ctx.pick(options))
    if options := ctx.of("pickup"):
        face_up = {c.id: c for c in ctx.own.cards if c is not None} if ctx.own else {}
        return ctx.action(
            ctx.best(
                options, lambda o: -keep_value(o.action.card) if o.action.card in face_up else 0
            )
        )
    return None
