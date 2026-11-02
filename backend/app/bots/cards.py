"""Hand, public-collection and card-value heuristics for card-game families."""

from collections import Counter
from functools import lru_cache
from typing import Any

from app.bots.context import Context
from app.core.contracts import Action, CardView
from app.games.deal.deck import RENTS
from app.games.rummy.melds import is_joker, meld_options, points


def _number(card: CardView | None, default: float = 5.0) -> float:
    try:
        return float(card.value.rstrip("M")) if card else default
    except ValueError:
        return default


def _uno(ctx: Context) -> Action:
    if options := ctx.of("uno", "catch_uno"):
        return ctx.action(options[0])
    colors = Counter(c.color for c in ctx.view.hand if c.color != "wild")
    if options := ctx.of("choose"):
        return ctx.action(ctx.best(options, lambda o: colors[o.action.color]))
    if options := ctx.of("play"):
        counts = {p.id: p.count for p in ctx.view.players}
        next_low = min(
            (p.count for p in ctx.view.players if p.id != ctx.player and not p.eliminated),
            default=7,
        )

        def value(o: Any) -> float:
            card = next(c for c in ctx.view.hand if c.id == o.action.card)
            color = o.action.color or card.color
            kind = card.id.split(":")[1]
            score = colors[color] * 2 + (10 if card.color != "wild" else -5)
            if kind == "discard_all":
                score += colors[color] * 20
            if kind == "7" and o.action.target:
                score += (len(ctx.view.hand) - counts.get(o.action.target, 7)) * 15
            if kind == "0" and len(ctx.view.hand) <= 3:
                score -= 30
            if next_low <= 2 and kind in {
                "skip",
                "skip_all",
                "reverse",
                "+2",
                "+4",
                "+6",
                "+10",
                "reverse4",
            }:
                score += 18
            return score

        return ctx.action(ctx.best(options, value))
    # A +4 challenge requires evidence about another hidden hand. With no such
    # evidence this policy accepts the penalty, rather than pretending to know it.
    options = ctx.of("accept", "draw", "end_turn")
    return ctx.action(options[0] if options else ctx.options[0])


def _asset_map(ctx: Context) -> dict[str, CardView]:
    return {
        c.id: c
        for p in ctx.view.players
        for c in [*p.bank, *[c for g in p.properties.values() for c in g]]
    }


def _payment(ctx: Context) -> Action:
    option = ctx.of("pay")[0]
    required = int(ctx.detail.get("payment_amount", 0))
    if required <= 0:
        raise ValueError("A public payment amount is required for bot payment selection.")
    assets = _asset_map(ctx)
    own = ctx.own
    assert own is not None
    bank = {c.id for c in own.bank}
    protected = {
        c.id
        for key, group in own.properties.items()
        if len([c for c in group if c.suit == "property"]) >= len(RENTS[key.split(":")[0]])
        for c in group
    }
    choices: dict[int, tuple[float, list[str]]] = {0: (0, [])}
    for ident in option.eligible_cards:
        card = assets[ident]
        amount = int(_number(card, 0))
        if amount <= 0:
            continue
        cost = amount + 0.01 + (0 if ident in bank else 100) + (1000 if ident in protected else 0)
        for total, (old_cost, ids) in list(choices.items()):
            new = total + amount
            if new not in choices or choices[new][0] > old_cost + cost:
                choices[new] = (old_cost + cost, [*ids, ident])
    sufficient = [(cost, total, ids) for total, (cost, ids) in choices.items() if total >= required]
    action = option.action.model_copy(deep=True)
    action.cards = min(sufficient)[2] if sufficient else list(option.eligible_cards)
    return action


def _deal(ctx: Context) -> Action:
    if ctx.of("pay"):
        return _payment(ctx)
    if options := ctx.of("no"):
        return ctx.action(options[0])
    assets = _asset_map(ctx)
    own = ctx.own
    assert own is not None
    hand = {c.id: c for c in ctx.view.hand}

    def worth(card: CardView) -> float:
        return (
            _number(card, 0)
            + (40 if card.suit == "property" else 0)
            + (15 if card.label.lower() in {"deal breaker", "just say no"} else 0)
        )

    if options := ctx.of("discard", "settle_debt"):
        return ctx.action(ctx.best(options, lambda o: -worth(hand[o.action.card])))
    if options := ctx.of("choose", "keep", "give"):
        return ctx.action(
            ctx.best(
                options,
                lambda o: worth(assets[o.action.card]) * (-1 if o.action.type == "give" else 1),
            )
        )
    if options := ctx.of("accept"):
        return ctx.action(options[0])
    playable = [o for o in ctx.options if o.action.type in {"property", "play", "bank"}]
    if playable:

        def value(o: Any) -> float:
            action = o.action
            card = hand.get(action.card)
            if card is None:  # A debt gift is visible as the permitted action.
                return 20 if action.type == "property" else 10
            if action.type == "property":
                groups = (
                    [own.properties.get(action.choice, [])]
                    if action.choice
                    else [g for k, g in own.properties.items() if k.split(":")[0] == action.color]
                )
                held = max((sum(c.suit == "property" for c in g) for g in groups), default=0)
                need = len(RENTS[action.color])
                return 70 + held * 15 + (90 if held + 1 == need else 0)
            if action.type == "bank":
                return (
                    (18 if card.subtitle == "MONEY" else -5)
                    + _number(card, 0)
                    - (40 if card.label.lower() == "just say no" else 0)
                )
            label = card.label.lower()
            priorities = {
                "pass go": 60,
                "deal breaker": 95,
                "sly deal": 75,
                "forced deal": 65,
                "go again": 35,
                "double the rent": 45,
            }
            target = next((p for p in ctx.view.players if p.id == action.target), None)
            threat = max((len(g) for g in target.properties.values()), default=0) if target else 0
            return priorities.get(label, 40) + threat * 2

        return ctx.action(ctx.best(playable, value))
    # Rearrangements do not spend a play and must never form an endless bot loop.
    return ctx.action((ctx.of("end_turn") or ctx.options)[0])


def _skyjo(ctx: Context) -> Action:
    own = ctx.own
    assert own is not None
    grid = own.cards

    def improvement(slot: int, value: float) -> float:
        before = _number(grid[slot])
        column = [grid[r * 4 + slot % 4] for r in range(3) if r * 4 + slot % 4 != slot]
        if all(c is not None and _number(c) == value for c in column):
            return before + value * 2 + 15
        return before - value

    if options := ctx.of("next_round"):
        return ctx.action(options[0])
    if options := ctx.of("reveal"):
        return ctx.action(ctx.pick(options))
    if options := ctx.of("swap"):
        value = _number(ctx.view.drawn or ctx.view.discard)
        best = ctx.best(options, lambda o: improvement(o.action.slot, value))
        if ctx.of("discard") and improvement(best.action.slot, value) < 0.5:
            return ctx.action(ctx.of("discard")[0])
        return ctx.action(best)
    value = _number(ctx.view.discard)
    slots = [i for i in range(12) if i not in own.removed_slots]
    use_discard = max((improvement(i, value) for i in slots), default=-100) >= 3 or value <= 0
    return ctx.action((ctx.of("draw_discard") if use_discard else ctx.of("draw_stock"))[0])


def _rummy_analysis(cards: list[str], wild: str) -> tuple[dict[int, tuple[float, bool]], int]:
    """One 14-card meld enumeration shared by every possible discard."""
    options = meld_options(cards, wild)
    by_bit: dict[int, list[tuple[int, bool, bool]]] = {}
    for meld in options:
        for i in range(len(cards)):
            if meld[0] & (1 << i):
                by_bit.setdefault(i, []).append(meld)
    values = [points(c, wild) + (6 if is_joker(c, wild) else 0) for c in cards]

    @lru_cache(None)
    def cost(mask: int, sequences: int, pure: bool) -> float:
        if not mask:
            return (0 if pure else 30) + max(0, 2 - sequences) * 18
        bit = (mask & -mask).bit_length() - 1
        result = values[bit] + cost(mask ^ (1 << bit), sequences, pure)
        for bits, seq, is_pure in by_bit.get(bit, []):
            if bits & mask == bits:
                result = min(
                    result, cost(mask ^ bits, min(2, sequences + int(seq)), pure or is_pure)
                )
        return result

    @lru_cache(None)
    def covered(mask: int, sequences: int, pure: bool) -> bool:
        if not mask:
            return sequences >= 2 and pure
        bit = (mask & -mask).bit_length() - 1
        return any(
            covered(mask ^ bits, min(2, sequences + int(seq)), pure or is_pure)
            for bits, seq, is_pure in by_bit.get(bit, [])
            if bits & mask == bits
        )

    full = (1 << len(cards)) - 1
    return {
        i: (cost(full ^ (1 << i), 0, False), covered(full ^ (1 << i), 0, False))
        for i in range(len(cards))
    }, int(cost(full, 0, False))


def _rummy(ctx: Context) -> Action:
    cards = [c.id for c in ctx.view.hand]
    wild = str(ctx.detail["wild_rank"])
    if ctx.view.phase == "draw":
        turns = int(ctx.memory.get("rummy_turns", 0)) + 1
        ctx.memory["rummy_turns"] = turns
        # Deliberate late withdrawal bounds a stale deal; normal play pursues
        # genuine declarations instead of immediately dropping every hand.
        if turns > 70 and ctx.of("fold"):
            return ctx.action(ctx.of("fold")[0])
        if ctx.view.discard and ctx.of("draw_discard"):
            extended = [*cards, ctx.view.discard.id]
            analysis, _ = _rummy_analysis(extended, wild)
            keep_best = min(score for i, (score, _) in analysis.items() if i != len(cards))
            drop_open = analysis[len(cards)][0]
            if keep_best < drop_open - 1:
                return ctx.action(ctx.of("draw_discard")[0])
        return ctx.action(ctx.of("draw_stock")[0])
    analysis, _ = _rummy_analysis(cards, wild)
    index = {card: i for i, card in enumerate(cards)}
    declares = [o for o in ctx.of("declare") if analysis[index[o.action.card]][1]]
    if declares:
        return ctx.action(declares[0])
    options = ctx.of("discard")
    return ctx.action(
        ctx.best(
            options,
            lambda o: -analysis[index[o.action.card]][0] + points(o.action.card, wild) * 0.01,
        )
    )


def _gems(ctx: Context) -> Action:
    info = ctx.detail["card_info"]
    tokens, discounts = ctx.detail["tokens"][ctx.player], ctx.detail["bonuses"][ctx.player]
    cards = [c for c in [*ctx.view.community, *ctx.view.hand] if c.id in info]

    def needs(ident: str) -> dict[str, int]:
        return {
            color: max(0, amount - discounts.get(color, 0) - tokens.get(color, 0))
            for color, amount in info[ident]["cost"].items()
        }

    if options := ctx.of("buy"):
        return ctx.action(
            ctx.best(
                options,
                lambda o: (
                    info[o.action.card]["points"] * 4
                    + 2
                    - sum(info[o.action.card]["cost"].values()) * 0.03
                ),
            )
        )
    if options := ctx.of("patron"):
        return ctx.action(options[0])
    target = (
        min(cards, key=lambda c: sum(needs(c.id).values()) - info[c.id]["points"] * 0.5)
        if cards
        else None
    )
    deficits = needs(target.id) if target else {}
    if options := ctx.of("return"):
        return ctx.action(
            ctx.best(
                options,
                lambda o: -deficits.get(o.action.choice, 0) + tokens.get(o.action.choice, 0) * 0.01,
            )
        )
    if options := ctx.of("take", "take_pair"):

        def usefulness(o: Any) -> float:
            colors = o.action.choice.split(",")
            return (
                min(2, deficits.get(colors[0], 0))
                if o.action.type == "take_pair"
                else sum(min(1, deficits.get(c, 0)) for c in colors)
            ) + len(colors) * 0.01

        return ctx.action(ctx.best(options, usefulness))
    if options := ctx.of("reserve"):
        visible = [o for o in options if o.action.card in info]
        return ctx.action(
            ctx.best(
                visible,
                lambda o: info[o.action.card]["points"] - sum(needs(o.action.card).values()) * 0.2,
            )
            if visible
            else options[0]
        )
    return ctx.action(ctx.options[0])


def card_action(ctx: Context) -> Action | None:
    game = ctx.view.game_id
    if game.startswith("uno"):
        return _uno(ctx)
    if game.startswith("deal"):
        return _deal(ctx)
    policy = {"skyjo": _skyjo, "rummy": _rummy, "gem-market": _gems}.get(game)
    return policy(ctx) if policy else None
