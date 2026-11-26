"""Housie, Liar's Dice, Bluff and Truth or Dare from the bot's own view only."""

from collections import Counter
from math import comb

from app.bots.context import Context
from app.core.contracts import Action, LegalAction

# Smaller prizes first: Full house ends the match, so it is always claimed last.
HOUSIE_CLAIM_ORDER = ["early_five", "top_line", "middle_line", "bottom_line", "full_house"]
# How sure a bot wants to be of its own opening bid.
OPENING_CONFIDENCE = 0.62
KIND_WEIGHTS = {"truth": 0.45, "dare": 0.35, "burning": 0.2}


def _housie(ctx: Context) -> Action:
    # Mark first (a claim only counts marked numbers), claim at once, then call.
    if marks := ctx.of("mark"):
        return ctx.action(min(marks, key=lambda o: o.action.amount))
    if claims := ctx.of("claim"):
        return ctx.action(min(claims, key=lambda o: HOUSIE_CLAIM_ORDER.index(o.action.choice)))
    return ctx.action(ctx.options[0])


def at_least(unknown: int, chance: float, need: int) -> float:
    """Chance that at least `need` of `unknown` unseen dice count for a bid."""
    if need <= 0:
        return 1.0
    if need > unknown:
        return 0.0
    return sum(
        comb(unknown, hits) * chance**hits * (1 - chance) ** (unknown - hits)
        for hits in range(need, unknown + 1)
    )


def _liars_dice(ctx: Context) -> Action:
    if rounds := ctx.of("next_round"):
        return ctx.action(rounds[0])
    own = [int(die) for die in ctx.detail["dice"]]
    wild = bool(ctx.detail["wild_ones"])
    unknown = int(ctx.detail["total_dice"]) - len(own)

    def holds(quantity: int, face: int) -> float:
        counts_one = wild and face != 1
        have = sum(die == face or (counts_one and die == 1) for die in own)
        return at_least(unknown, 1 / 3 if counts_one else 1 / 6, quantity - have)

    bids = ctx.of("bid")
    current = ctx.detail.get("bid")
    if current is None:
        # Open on the face it holds most of, as high as it still believes.
        def opening(option: LegalAction) -> tuple[int, int]:
            face = int(option.action.choice)
            believed = [
                quantity
                for quantity in range(option.minimum or 1, (option.maximum or 1) + 1)
                if holds(quantity, face) >= OPENING_CONFIDENCE
            ]
            return max(believed, default=option.minimum or 1), face

        best = ctx.best(bids, lambda o: opening(o)[0] + opening(o)[1] / 10)
        action = best.action.model_copy(deep=True)
        action.amount = opening(best)[0]
        return action
    standing = holds(int(current["quantity"]), int(current["face"]))
    if not bids:
        return ctx.action(ctx.of("call_liar")[0])
    # The cheapest raise on each face; take the one most likely to be true.
    raise_option = ctx.best(bids, lambda o: holds(o.minimum or 1, int(o.action.choice)))
    raised = holds(raise_option.minimum or 1, int(raise_option.action.choice))
    if standing + raised < 1:
        # Calling is more likely to be right than the best raise is to hold.
        return ctx.action(ctx.of("call_liar")[0])
    return ctx.action(raise_option)


def _bluff(ctx: Context) -> Action:
    if reviews := ctx.of("continue"):
        return ctx.action(reviews[0])
    hand = ctx.view.hand
    held = Counter(card.value for card in hand)
    plays = ctx.of("play")

    def play(value: str, cards: list[str]) -> Action:
        option = next(o for o in plays if o.action.choice == value)
        action = option.action.model_copy(deep=True)
        action.cards = cards
        return action

    rank = ctx.detail.get("rank")
    if rank is None:
        # Start honestly with the rank it holds most of.
        most = max(held.values())
        value = ctx.random.choice(sorted(v for v, count in held.items() if count == most))
        return play(value, [card.id for card in hand if card.value == value][:4])
    honest = [card.id for card in hand if card.value == rank]
    last = ctx.detail.get("last_play")
    if isinstance(last, dict) and (calls := ctx.of("call_bluff")):
        claimed = int(last["count"])
        going_out = ctx.detail.get("going_out") == last["player"]
        # More than four of a rank cannot exist; a last play is always worth a look.
        if claimed + len(honest) > 4 or going_out:
            return ctx.action(calls[0])
        others = sum(int(p["count"]) for p in ctx.detail["plays"] if p["player"] != ctx.player)
        doubt = 0.04 + 0.1 * (claimed - 1) + 0.12 * len(honest)
        if others + len(honest) > 4:
            doubt += 0.25  # somebody in this round has lied
        if ctx.random.random() < doubt:
            return ctx.action(calls[0])
    if honest:
        return play(rank, honest[:4])
    # Nothing honest to play: bluff one card now and then, more with a short hand,
    # but never as a last card, which is always called.
    if len(hand) > 1 and ctx.random.random() < (0.55 if len(hand) <= 3 else 0.2):
        spare = min(hand, key=lambda card: (held[card.value], card.id))
        return play(rank, [spare.id])
    return ctx.action(ctx.of("skip")[0])


def _truth_or_dare(ctx: Context) -> Action:
    if moves := ctx.of("next"):
        return ctx.action(moves[0])
    if picks := ctx.of("pick"):
        weights = [KIND_WEIGHTS.get(option.action.choice, 0.1) for option in picks]
        return ctx.action(ctx.random.choices(picks, weights=weights)[0])
    if fates := ctx.of("assign"):
        return ctx.action(ctx.pick(fates))
    roll = ctx.random.random()
    if roll < 0.06 and (swaps := ctx.of("swap")):
        return ctx.action(swaps[0])
    if roll < 0.14 and (passes := ctx.of("skip")):
        return ctx.action(passes[0])
    return ctx.action(ctx.of("done")[0])


def parlour_action(ctx: Context) -> Action | None:
    policy = {
        "housie": _housie,
        "liars-dice": _liars_dice,
        "bluff": _bluff,
        "truth-or-dare": _truth_or_dare,
    }.get(ctx.view.game_id)
    return policy(ctx) if policy else None
