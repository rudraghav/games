from functools import lru_cache
from itertools import combinations

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
    options = meld_options(cards, wild)

    @lru_cache(None)
    def visit(mask: int, sequences: int, pure: bool) -> bool:
        if mask == (1 << len(cards)) - 1:
            return sequences >= 2 and pure
        first = next(i for i in range(len(cards)) if not mask & (1 << i))
        return any(
            visit(mask | bits, min(2, sequences + sequence), pure or is_pure)
            for bits, sequence, is_pure in options
            if bits & (1 << first) and not bits & mask
        )

    return visit(0, 0, False)


def deadwood(cards: list[str], wild: str) -> int:
    values = [points(c, wild) for c in cards]
    options = meld_options(cards, wild)
    full = sum(values)

    @lru_cache(None)
    def visit(mask: int, sequences: int, pure: bool) -> int:
        total = (
            full - sum(values[i] for i in range(len(cards)) if mask & (1 << i))
            if pure and sequences >= 2 else full
        )
        for bits, sequence, is_pure in options:
            if not bits & mask:
                total = min(total, visit(mask | bits, min(2, sequences + sequence), pure or is_pure))
        return total

    return min(80, visit(0, 0, False))
