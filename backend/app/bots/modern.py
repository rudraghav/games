"""Public-memory, drafting, collection and social simulation policies."""

from collections import Counter
from typing import Any

from app.bots.context import Context
from app.core.contracts import Action, CardView


def observe_modern(ctx: Context) -> None:
    if ctx.view.game_id == "flip-7":
        seen = set(ctx.memory.get("flip_seen", []))
        if ctx.view.draw_count > int(ctx.memory.get("flip_stock", ctx.view.draw_count)):
            seen.clear()
        seen.update(c.id for p in ctx.view.players for c in p.cards if c is not None)
        ctx.memory.update(flip_seen=sorted(seen)[:94], flip_stock=ctx.view.draw_count)
    if ctx.view.game_id != "trio":
        return
    table = ctx.memory.setdefault("trio_table", {})
    for i, card in enumerate(ctx.view.community):
        if card.suit == "empty":
            table.pop(str(i), None)
        elif card.value.isdigit():
            table[str(i)] = int(card.value)
    ends = ctx.memory.setdefault("trio_ends", {})
    reveals = ctx.detail.get("revealed", [])
    last = ctx.memory.get("trio_last")
    if last and len(reveals) == last["count"] + 1 and last["kind"] == "reveal_hand":
        reveal = reveals[-1]
        if reveal["owner"] == last["owner"]:
            value = int(reveal["card"]["value"])
            ends.setdefault(last["owner"], {}).pop(last["edge"], None)
            ctx.memory.setdefault("trio_turn", []).append([last["owner"], last["edge"], value])
            ctx.memory.pop("trio_last", None)
    if ctx.view.phase == "review" and ctx.detail.get("failed"):
        for owner, edge, value in ctx.memory.get("trio_turn", []):
            old = ends.setdefault(owner, {}).get(edge)
            ends[owner][edge] = (
                value if old is None else min(value, old) if edge == "low" else max(value, old)
            )
    for p in ctx.view.players:
        if p.count == 0:
            ends.pop(p.id, None)


def _trio(ctx: Context) -> Action:
    if options := ctx.of("continue"):
        ctx.memory["trio_turn"] = []
        ctx.memory.pop("trio_last", None)
        return ctx.action(options[0])
    reveals = ctx.detail.get("revealed", [])
    table, ends = ctx.memory.get("trio_table", {}), ctx.memory.get("trio_ends", {})
    hand = [int(c.value) for c in ctx.view.hand]

    def known(o: Any) -> int | None:
        a = o.action
        if a.type == "reveal_table":
            return table.get(a.choice)
        if a.type == "reveal_hand":
            if a.target == ctx.player:
                return hand[0] if a.choice == "low" else hand[-1]
            return ends.get(a.target, {}).get(a.choice)
        return None

    goal = int(reveals[0]["card"]["value"]) if reveals else None
    if goal is None:
        counts: Counter[int] = Counter(table.values())
        for value in set(hand[:1] + hand[-1:]):
            counts[value] += hand.count(value)
        for p in ctx.view.players:
            if p.id != ctx.player:
                values = ends.get(p.id, {})
                known_values = list(values.values()) if p.count > 1 else list(values.values())[:1]
                counts.update(known_values)
        candidates = [value for value, count in counts.items() if count >= 3]
        if candidates:
            goal = 7 if 7 in candidates else ctx.random.choice(candidates)
    options = [o for o in ctx.options if goal is not None and known(o) == goal]
    if not options:
        options = [o for o in ctx.options if o.action.type == "reveal_table" and known(o) is None]
    if not options:
        unknown = [o for o in ctx.options if o.action.type == "reveal_hand" and known(o) is None]
        options = [
            o
            for o in unknown
            if o.action.choice == ("high" if goal is not None and goal >= 7 else "low")
        ] or unknown
    option = ctx.pick(options or ctx.options)
    a = option.action
    ctx.memory["trio_last"] = {
        "kind": a.type,
        "owner": a.target,
        "edge": a.choice,
        "count": len(reveals),
    }
    return ctx.action(option)


def _flip(ctx: Context) -> Action:
    if options := ctx.of("next_round"):
        return ctx.action(options[0])
    risk = ctx.detail["at_risk"]
    if options := ctx.of("target_effect"):
        pending = ctx.detail.get("pending_card", "")
        if pending == "Freeze":
            return ctx.action(
                ctx.best(
                    options,
                    lambda o: (
                        100
                        if o.action.target == ctx.player and risk.get(ctx.player, 0) >= 25
                        else -risk.get(o.action.target, 0)
                    ),
                )
            )
        if pending == "Second Chance":
            return ctx.action(
                ctx.best(
                    options,
                    lambda o: -next(p.score for p in ctx.view.players if p.id == o.action.target),
                )
            )
        return ctx.action(
            ctx.best(
                options,
                lambda o: (
                    risk.get(o.action.target, 0) - (100 if o.action.target == ctx.player else 0)
                ),
            )
        )
    own = ctx.own
    assert own is not None
    numbers = [int(c.value) for c in own.cards if c is not None and c.id.startswith("n-")]
    seen = Counter(
        int(c.split("-")[1]) for c in ctx.memory.get("flip_seen", []) if c.startswith("n-")
    )
    duplicate = sum(max(0, max(1, n) - seen[n]) for n in numbers) / max(1, ctx.view.draw_count)
    has_chance = any(c and c.id.startswith("chance-") for c in own.cards)
    duplicate *= 0.2 if has_chance else 1
    amount = risk[ctx.player]
    expected = (1 - duplicate) * (5 + (8 if len(numbers) == 6 else 0)) - duplicate * amount
    stay = own.score + amount >= 200 or expected < 0 or amount >= 45
    return ctx.action((ctx.of("stay") if stay and ctx.of("stay") else ctx.of("hit"))[0])


COLORS = ["blue", "yellow", "red", "black", "white"]


def _azul(ctx: Context) -> Action:
    if options := ctx.of("next_round"):
        return ctx.action(options[0])
    wall, lines = ctx.detail["walls"][ctx.player], ctx.detail["lines"][ctx.player]

    def placement(color: str, count: int, row: int) -> float:
        col = (COLORS.index(color) + row) % 5
        if wall[row][col] is not None or lines[row] and lines[row][0] != color:
            return -100
        room = row + 1 - len(lines[row])
        complete = count >= room
        nearby = sum(
            wall[rr][cc] is not None
            for rr, cc in [(row - 1, col), (row + 1, col), (row, col - 1), (row, col + 1)]
            if 0 <= rr < 5 and 0 <= cc < 5
        )
        row_near = sum(x is not None for x in wall[row])
        return (
            min(count, room) * 2
            + (12 + nearby * 2 + row_near * 2 if complete else 0)
            - max(0, count - room) * 4
            - row * 0.1
        )

    if options := ctx.of("place_tiles"):
        color = ctx.detail["draft"][0]
        return ctx.action(
            ctx.best(
                options,
                lambda o: (
                    -100
                    if o.action.choice == "floor"
                    else placement(color, len(ctx.view.hand), int(o.action.choice))
                ),
            )
        )

    def draft(o: Any) -> float:
        source = (
            ctx.detail["center"]
            if o.action.choice == "center"
            else ctx.detail["factories"][int(o.action.choice)]
        )
        count = source.count(o.action.color)
        return max(placement(o.action.color, count, row) for row in range(5)) - (
            1 if o.action.choice == "center" and ctx.detail["marker"] else 0
        )

    return ctx.action(ctx.best(ctx.options, draft))


def _six(ctx: Context) -> Action:
    if options := ctx.of("take_row"):
        return ctx.action(
            ctx.best(options, lambda o: -ctx.detail["row_penalties"][int(o.action.choice)])
        )
    if options := ctx.of("select_number"):
        rows = ctx.detail["rows"]
        penalties = ctx.detail["row_penalties"]
        others = len(ctx.view.players) - 1

        def value(o: Any) -> float:
            n = int(o.action.card.split("-")[-1])
            candidates = [i for i, row in enumerate(rows) if int(row[-1]["value"]) < n]
            if not candidates:
                return -min(penalties) * 10
            i = max(candidates, key=lambda j: int(rows[j][-1]["value"]))
            gap = n - int(rows[i][-1]["value"]) - 1
            arrival = 1 - (1 - min(gap, 103) / 104) ** others
            risk = 1 if len(rows[i]) == 5 else arrival if len(rows[i]) == 4 else arrival * 0.12
            return -risk * penalties[i] * 10 - gap * 0.08 + n * 0.004

        return ctx.action(ctx.best(options, value))
    return ctx.action(ctx.options[0])


def _gang(ctx: Context) -> Action:
    if ctx.view.phase != "chips":
        return ctx.action(ctx.options[0])
    # Estimate a percentile against uniformly unknown pocket cards, not against
    # other bots' actual hands. The policy RNG is unrelated to the engine shuffle.
    from app.core.cards import RANKS, poker_rank, standard_deck

    own = [c.id for c in ctx.view.hand]
    board = [c.id for c in ctx.view.community]
    if not board:
        high, low = sorted((RANKS.index(c[0]) + 2 for c in own), reverse=True)
        estimate = high / 14 * 0.35 + low / 14 * 0.15
        estimate += (
            0.45
            if high == low
            else 0.08
            if high - low <= 1
            else -min(0.25, (high - low - 1) * 0.045)
        )
        estimate += 0.08 if own[0][1] == own[1][1] else 0
        percentile = max(0.0, min(1.0, estimate))
    else:
        unseen = [c for c in standard_deck() if c not in own + board]
        own_rank = poker_rank(own + board)
        ranks = [poker_rank(ctx.random.sample(unseen, 2) + board) for _ in range(32)]
        percentile = sum(
            1 if own_rank > other else 0.5 if own_rank == other else 0 for other in ranks
        ) / len(ranks)
    preferred = 1 + round(percentile * (len(ctx.view.players) - 1))
    held = set(ctx.detail["chips"].values())
    options = [o for o in ctx.of("claim_chip") if o.action.amount not in held]
    return ctx.action(
        ctx.best(options or ctx.of("claim_chip"), lambda o: -abs(o.action.amount - preferred))
    )


def _paper(ctx: Context) -> Action:
    own = ctx.own
    assert own is not None
    kinds = Counter(c.suit for c in [*ctx.view.hand, *own.bank])
    colors = Counter(c.color for c in [*ctx.view.hand, *own.bank])

    def value(card: CardView) -> float:
        count = kinds[card.suit]
        if card.suit == "mermaid":
            return 3 + max(colors.values(), default=0)
        if card.suit == "sailor":
            return 5 if count else 1
        if card.suit == "penguin":
            return 1 + 2 * count
        if card.suit in {"shell", "octopus"}:
            return (2 if card.suit == "shell" else 3) if count else 0.7
        if card.suit in {"crab", "boat", "fish"}:
            return 3 if count % 2 else 0.6
        if card.suit in {"shark", "swimmer"}:
            counterpart = "shark" if card.suit == "swimmer" else "swimmer"
            return 3 if kinds[counterpart] > count else 0.6
        multipliers = {
            "lighthouse": ("boat", 1),
            "shoal": ("fish", 1),
            "penguin-colony": ("penguin", 2),
            "captain": ("sailor", 3),
        }
        kind, factor = multipliers.get(card.suit, ("", 0))
        return kinds[kind] * factor + colors[card.color] * 0.05

    if options := ctx.of("reveal_mermaids", "next_round"):
        return ctx.action(options[0])
    if options := ctx.of("keep", "take_inspected"):
        cards = {c["id"]: CardView.model_validate(c) for c in ctx.detail["private_options"]}
        return ctx.action(ctx.best(options, lambda o: value(cards[o.action.card])))
    if options := ctx.of("inspect"):
        return ctx.action(
            ctx.best(options, lambda o: ctx.detail["pile_counts"][int(o.action.choice)])
        )
    if options := ctx.of("steal"):
        return ctx.action(
            ctx.best(
                options,
                lambda o: next(p.count for p in ctx.view.players if p.id == o.action.target),
            )
        )
    if options := ctx.of("pair"):
        kinds_by_id = {c.id: c.suit for c in ctx.view.hand}
        return ctx.action(
            ctx.best(
                options,
                lambda o: (
                    5
                    if kinds_by_id.get(o.action.cards[0]) == "fish"
                    else 4
                    if kinds_by_id.get(o.action.cards[0]) == "shark"
                    else 3
                ),
            )
        )
    if options := ctx.of("stop"):
        chance = ctx.of("last_chance")
        if chance and ctx.detail["own_points"] >= 12:
            return ctx.action(chance[0])
        return ctx.action(options[0])
    if ctx.view.phase == "draw":
        discards = ctx.of("take_discard")
        if discards:
            best = ctx.best(
                discards,
                lambda o: value(
                    CardView.model_validate(ctx.detail["discard_tops"][int(o.action.choice)])
                ),
            )
            if (
                value(CardView.model_validate(ctx.detail["discard_tops"][int(best.action.choice)]))
                >= 2.5
            ):
                return ctx.action(best)
        return ctx.action((ctx.of("take_stock") or discards)[0])
    return ctx.action(ctx.options[0])


def _party(ctx: Context) -> Action:
    # Synthetic preferences are deliberate game actions, never a claim that a
    # bot drank, disclosed a real experience, or answered aloud.
    if options := ctx.of("respond"):
        return ctx.action(next(o for o in options if o.action.choice == "chill"))
    options = [o for o in ctx.options if o.action.choice != "pass"]
    return ctx.action(ctx.pick(options or ctx.options))


def modern_action(ctx: Context) -> Action | None:
    policy = {
        "trio": _trio,
        "flip-7": _flip,
        "azul": _azul,
        "six-nimmt": _six,
        "the-gang": _gang,
        "sea-salt-paper": _paper,
        "spill-or-chill": _party,
        "most-likely": _party,
        "hot-seat": _party,
    }.get(ctx.view.game_id)
    return policy(ctx) if policy else None
