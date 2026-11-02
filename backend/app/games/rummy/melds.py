from collections.abc import Callable
from functools import lru_cache
from itertools import combinations
from typing import Any, NamedTuple

from app.core.cards import RANKS


def is_joker(card: str, wild: str) -> bool:
    return card.startswith("JK") or card[0] == wild


def points(card: str, wild: str) -> int:
    return 0 if is_joker(card, wild) else 10 if card[0] in "TJQKA" else int(card[0])


def meld_type(cards: list[str], wild: str) -> tuple[bool, bool] | None:
    if len(cards) < 3:
        return None
    naturals = [c for c in cards if not c.startswith("JK")]
    if len(naturals) == len(cards) and len({c[1] for c in cards}) == 1:
        ranks = [RANKS.index(c[0]) + 2 for c in cards]
        low = [1 if r == 14 else r for r in ranks]
        if len(set(ranks)) == len(cards) and (
            max(ranks) - min(ranks) == len(cards) - 1 or max(low) - min(low) == len(cards) - 1
        ):
            return True, True
    fixed = [c for c in cards if not is_joker(c, wild)]
    if fixed and len({c[1] for c in fixed}) == 1:
        ranks = [RANKS.index(c[0]) + 2 for c in fixed]
        for values in [ranks, [1 if r == 14 else r for r in ranks]]:
            if (
                len(set(values)) == len(values)
                and max(values) - min(values) < len(cards)
                and len(cards) <= 13
            ):
                return True, False
    if (
        len(cards) <= 4
        and len({c[0] for c in fixed}) <= 1
        and len({c[1] for c in fixed}) == len(fixed)
    ):
        return False, False
    return None


def meld_options(cards: list[str], wild: str) -> list[tuple[int, bool, bool]]:
    options = []
    for size in range(3, len(cards) + 1):
        for indices in combinations(range(len(cards)), size):
            kind = meld_type([cards[i] for i in indices], wild)
            if kind is not None:
                options.append((sum(1 << i for i in indices), *kind))
    return options


class Partition(NamedTuple):
    sequences: int
    pure: bool
    unmatched: int
    groups: tuple[int, ...]


@lru_cache(maxsize=128)
def _partitions(cards: tuple[str, ...], wild: str) -> Callable[[int], tuple[Partition, ...]]:
    """A bounded pure search, shared by discard previews and adjudication.

    Each card is visited once as unmatched or in a meld. Anchoring the search
    on the first remaining card avoids enumerating permutations of the same
    partition. All candidate discards reuse this hand's options and subproblems.
    """
    options = meld_options(list(cards), wild)
    by_card = [[o for o in options if o[0] & (1 << i)] for i in range(len(cards))]
    values = [points(c, wild) for c in cards]

    def cost(mask: int) -> tuple[int, int]:
        return sum(v for i, v in enumerate(values) if mask & (1 << i)), mask.bit_count()

    @lru_cache(None)
    def visit(mask: int) -> tuple[Partition, ...]:
        if not mask:
            return (Partition(0, False, 0, ()),)
        first = (mask & -mask).bit_length() - 1
        results: dict[tuple[int, bool], Partition] = {}

        def keep(item: Partition) -> None:
            key = (item.sequences, item.pure)
            existing = results.get(key)
            if existing is None or cost(item.unmatched) < cost(existing.unmatched):
                results[key] = item

        for rest in visit(mask ^ (1 << first)):
            keep(rest._replace(unmatched=rest.unmatched | (1 << first)))
        for bits, sequence, pure in by_card[first]:
            if bits & mask == bits:
                for rest in visit(mask ^ bits):
                    keep(Partition(min(2, rest.sequences + sequence), rest.pure or pure,
                                   rest.unmatched, (bits, *rest.groups)))
        return tuple(results.values())

    return visit


def hand_analysis(cards: list[str], wild: str, omit: int | None = None) -> dict[str, Any]:
    """Explain the optimal legal partition, optionally after one discard.

    Returned IDs belong exclusively to the supplied authorized hand. There is
    no inference from opponents, the stock, or a shuffle seed.
    """
    mask = (1 << len(cards)) - 1
    if omit is not None:
        mask ^= 1 << omit
    values = [points(c, wild) for c in cards]
    raw = sum(v for i, v in enumerate(values) if mask & (1 << i))

    def loss(item: Partition) -> int:
        return min(80, sum(v for i, v in enumerate(values) if item.unmatched & (1 << i))
                   if item.pure and item.sequences >= 2 else raw)

    best = min(_partitions(tuple(cards), wild)(mask), key=lambda item: (
        not (mask.bit_count() == 13 and not item.unmatched and item.pure and item.sequences >= 2),
        loss(item), item.unmatched.bit_count(), not item.pure, -item.sequences,
    ))
    groups = [[c for i, c in enumerate(cards) if bits & (1 << i)] for bits in best.groups]
    types = [meld_type(group, wild) for group in groups]
    return {
        "valid": mask.bit_count() == 13 and not best.unmatched and best.pure and best.sequences >= 2,
        "deadwood": loss(best), "raw_points": min(80, raw),
        "scoring_gate": best.pure and best.sequences >= 2,
        "sequence_count": sum(bool(t and t[0]) for t in types),
        "pure_sequence_count": sum(bool(t and t[1]) for t in types),
        "melds": [{"cards": group, "kind": "pure_sequence" if kind and kind[1]
                   else "sequence" if kind and kind[0] else "set"}
                  for group, kind in zip(groups, types, strict=True)],
        "unmatched": [c for i, c in enumerate(cards) if best.unmatched & (1 << i)],
    }


def valid_declaration(cards: list[str], wild: str, groups: list[list[str]] | None = None) -> bool:
    if len(cards) != 13:
        return False
    if groups:
        flat = [c for group in groups for c in group]
        if sorted(flat) != sorted(cards):
            return False
        types = [meld_type(group, wild) for group in groups]
        return (
            all(t is not None for t in types)
            and sum(bool(t and t[0]) for t in types) >= 2
            and any(t and t[1] for t in types)
        )
    return bool(hand_analysis(cards, wild)["valid"])


def deadwood(cards: list[str], wild: str) -> int:
    return int(hand_analysis(cards, wild)["deadwood"])
