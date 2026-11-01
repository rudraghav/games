"""Basic blackjack strategy and bounded information-set poker sampling."""

from app.bots.context import Context
from app.core.cards import RANKS, blackjack_total, poker_rank, standard_deck, teen_rank
from app.core.contracts import Action


def _equity(ctx: Context, three_card: bool = False) -> float:
    own = [c.id for c in ctx.view.hand]
    board = [] if three_card else [c.id for c in ctx.view.community]
    if len(own) < (3 if three_card else 2):
        return 0.35
    remaining = [c for c in standard_deck() if c not in own + board]
    opponents = max(1, sum(not p.folded and not p.eliminated for p in ctx.view.players) - 1)
    score, samples = 0.0, 16
    for _ in range(samples):
        cards = ctx.random.sample(
            remaining, (0 if three_card else 5 - len(board)) + opponents * (3 if three_card else 2)
        )
        common = [] if three_card else board + cards[: 5 - len(board)]
        offset = 0 if three_card else 5 - len(board)
        rank = teen_rank(own) if three_card else poker_rank(own + common)
        ranks = []
        for opponent in range(opponents):
            start = offset + opponent * (3 if three_card else 2)
            hand = cards[start : start + (3 if three_card else 2)]
            ranks.append(teen_rank(hand) if three_card else poker_rank(hand + common))
        best = max([rank, *ranks])
        if rank == best:
            score += 1 / (1 + ranks.count(rank))
    return score / samples


def _blackjack(ctx: Context) -> Action:
    if options := ctx.of("bet"):
        action = ctx.action(options[0])
        minimum, maximum = options[0].minimum or 2, options[0].maximum or 2
        action.amount = max(minimum, min(10, maximum))
        action.amount -= (action.amount - minimum) % options[0].step
        return action
    if options := ctx.of("decline"):
        return ctx.action(options[0])
    hand = [c.id for c in ctx.view.hand]
    total, soft = blackjack_total(hand)
    dealer = ctx.view.community[0].value if ctx.view.community else "10"
    up = 11 if dealer == "A" else 10 if dealer in {"J", "Q", "K", "10"} else int(dealer)
    ranks = [min(RANKS.index(c[0]) + 2, 10) if c[0] != "A" else 11 for c in hand]
    if options := ctx.of("split"):
        pair = ranks[0]
        split = (
            pair in (11, 8)
            or pair in (2, 3, 7)
            and up <= 7
            or pair == 6
            and up <= 6
            or pair == 9
            and up not in (7, 10, 11)
            or pair == 4
            and up in (5, 6)
        )
        if split:
            return ctx.action(options[0])
    if options := ctx.of("double"):
        double = (
            (
                not soft
                and (
                    total == 11
                    and up != 11
                    or total == 10
                    and up <= 9
                    or total == 9
                    and 3 <= up <= 6
                )
            )
            or soft
            and (
                total in (17, 18)
                and 3 <= up <= 6
                or total in (15, 16)
                and 4 <= up <= 6
                or total in (13, 14)
                and up in (5, 6)
            )
        )
        if double:
            return ctx.action(options[0])
    stand = total >= 19 if soft else total >= 17
    if soft and total == 18 and up <= 8:
        stand = True
    if not soft and (13 <= total <= 16 and up <= 6 or total == 12 and 4 <= up <= 6):
        stand = True
    options = ctx.of("stand" if stand else "hit")
    return ctx.action(options[0] if options else ctx.options[0])


def _holdem(ctx: Context) -> Action:
    equity = _equity(ctx)
    own = ctx.own
    assert own is not None
    call = max(0, int(ctx.detail.get("current_bet", 0)) - own.bet)
    odds = call / max(1, ctx.view.pot + call)
    if ctx.memory.get("poker_street") != ctx.view.phase:
        ctx.memory.update(poker_street=ctx.view.phase, poker_raises=0)
    raises = int(ctx.memory.get("poker_raises", 0))
    if (options := ctx.of("raise")) and equity > 0.65 and raises < 2:
        option = options[0]
        action = ctx.action(option)
        action.amount = min(
            option.maximum or action.amount, action.amount + max(0, ctx.view.pot // 2)
        )
        ctx.memory["poker_raises"] = raises + 1
        return action
    if options := ctx.of("check"):
        return ctx.action(options[0])
    if equity + 0.04 < odds and ctx.of("fold"):
        return ctx.action(ctx.of("fold")[0])
    if options := ctx.of("call"):
        return ctx.action(options[0])
    return ctx.action(ctx.options[0])


def _teen(ctx: Context) -> Action:
    if options := ctx.of("peek"):
        return ctx.action(options[0])
    equity = _equity(ctx, three_card=True)
    if options := ctx.of("accept", "decline"):
        wanted = "accept" if equity > 0.28 else "decline"
        return ctx.action(next((o for o in options if o.action.type == wanted), options[0]))
    if options := ctx.of("show"):
        return ctx.action(options[0])
    if (options := ctx.of("sideshow")) and equity > 0.65:
        return ctx.action(options[0])
    bets = ctx.of("bet")
    price = bets[0].minimum or 0 if bets else 0
    if equity < 0.17 and (price > 4 or ctx.view.pot > 30) and ctx.of("fold"):
        return ctx.action(ctx.of("fold")[0])
    if bets:
        action = ctx.action(bets[0])
        if equity > 0.75:
            action.amount = min(bets[0].maximum or action.amount, action.amount * 2)
            action.amount -= (action.amount - (bets[0].minimum or 0)) % bets[0].step
        return action
    return ctx.action(ctx.options[0])


def casino_action(ctx: Context) -> Action | None:
    policy = {"blackjack": _blackjack, "holdem": _holdem, "teen-patti": _teen}.get(ctx.view.game_id)
    return policy(ctx) if policy else None
