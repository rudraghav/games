"""Public or viewer-authorized hand explanations, using the existing evaluators.

Every description starts with the category a player looks up in the rules, so a
result reads "Two pair, kings and 6s" rather than an unnamed comparison. Call
these only with already-public cards or the viewer's own permitted hand.
"""

from collections import Counter
from itertools import combinations
from typing import Any

from app.core.cards import RANKS as RANK_ORDER
from app.core.cards import card_view, poker_five, teen_rank

NAMES = ("High card", "Pair", "Two pair", "Three of a kind", "Straight", "Flush",
         "Full house", "Four of a kind", "Straight flush")
RANKS = {**{i: str(i) for i in range(2, 11)}, 11: "jack", 12: "queen", 13: "king", 14: "ace"}
TEEN_NAMES = ("High card", "Pair", "Colour", "Sequence", "Pure sequence", "Trail")


def _value(card: str) -> int:
    return RANK_ORDER.index(card[0]) + 2


def _plural(value: int) -> str:
    return f"{RANKS[value]}s"


def _title(word: str) -> str:
    return word[:1].upper() + word[1:]


def _ordered(cards: list[str], rank: tuple[int, ...], straight: bool) -> list[str]:
    """Largest group first, then rank; a wheel straight starts at its 5."""
    counts = Counter(_value(card) for card in cards)

    def key(card: str) -> tuple[int, int]:
        value = _value(card)
        if straight and rank[1:] == (5,) and value == 14:
            value = 1
        return (-counts[_value(card)], -value)

    return sorted(cards, key=key)


def short_poker_name(rank: tuple[int, ...]) -> str:
    """A seat-sized name: 'Flush', 'Pair of 3s', 'Ace high'."""
    if rank == (8, 14):
        return "Royal flush"
    if rank[0] == 0:
        return f"{_title(RANKS[rank[1]])} high"
    if rank[0] == 1:
        return f"Pair of {_plural(rank[1])}"
    return NAMES[rank[0]]


def explain_poker_hand(cards: list[str]) -> dict[str, Any]:
    """Call only with already-public cards or the viewer's own permitted hand."""
    best = max(combinations(cards, 5), key=lambda five: poker_five(list(five)))
    rank = poker_five(list(best))
    values = [RANKS[value] for value in rank[1:]]
    category = "Royal flush" if rank == (8, 14) else NAMES[rank[0]]
    descriptions = {
        0: lambda: f"{_title(values[0])} high; then {', '.join(values[1:])}",
        1: lambda: f"Pair of {values[0]}s; kickers {', '.join(values[1:])}",
        2: lambda: f"Two pair, {values[0]}s and {values[1]}s; kicker {values[2]}",
        3: lambda: f"Three of a kind, {values[0]}s; kickers {', '.join(values[1:])}",
        4: lambda: f"{values[0]}-high straight",
        5: lambda: f"Flush, {values[0]} high; then {', '.join(values[1:])}",
        6: lambda: f"Full house, {values[0]}s over {values[1]}s",
        7: lambda: f"Four of a kind, {values[0]}s; kicker {values[1]}",
        8: lambda: "Royal flush" if rank == (8, 14) else f"{values[0]}-high straight flush",
    }
    ordered = _ordered(list(best), rank, rank[0] in (4, 8))
    return {"category": category, "comparison": list(rank[1:]),
            "description": descriptions[rank[0]](),
            "short": short_poker_name(rank),
            "cards": [card_view(card).model_dump() for card in ordered]}


def _faces(cards: list[str]) -> str:
    """Cards in the order the ranking reads them, as rank letters: 'A-K-Q'."""
    labels = {11: "J", 12: "Q", 13: "K", 14: "A"}
    ordered = sorted((_value(card) for card in cards), reverse=True)
    if ordered == [14, 3, 2]:
        ordered = [14, 2, 3]
    return "-".join(labels.get(value, str(value)) for value in ordered)


def explain_teen_hand(cards: list[str]) -> dict[str, Any]:
    """Teen Patti category and comparison order for one three-card hand."""
    rank = teen_rank(cards)
    category = TEEN_NAMES[rank[0]]
    values = [RANKS[value] for value in rank[1:]]
    faces = _faces(cards)
    descriptions = {
        0: lambda: f"{_title(values[0])} high ({faces})",
        1: lambda: f"Pair of {values[0]}s, {values[1]} kicker",
        2: lambda: f"Colour, {values[0]} high ({faces})",
        3: lambda: f"Sequence {faces}",
        4: lambda: f"Pure sequence {faces}",
        5: lambda: f"Trail of {values[0]}s",
    }
    short = (f"{_title(values[0])} high" if rank[0] == 0
             else f"Pair of {values[0]}s" if rank[0] == 1 else category)
    return {"category": category, "rank": list(rank), "description": descriptions[rank[0]](),
            "short": short}


ORDINALS = ("first", "second", "third")


def teen_comparison(winner: list[int], other: list[int]) -> str:
    """Why one public Teen Patti rank beats another, without naming players."""
    if winner[0] != other[0]:
        return f"{TEEN_NAMES[winner[0]]} beats {TEEN_NAMES[other[0]].lower()}"
    if winner == other:
        return "Equal hands"
    index = next(i for i in range(1, len(winner)) if winner[i] != other[i])
    if winner[0] == 0:
        return f"Both hands are high card; the {ORDINALS[index - 1]} card decides"
    if winner[0] == 2:
        return f"Both hands are colours; the {ORDINALS[index - 1]} card decides"
    if winner[0] == 1:
        return ("Both hands are pairs; the higher pair wins" if index == 1
                else "Equal pairs; the kicker decides")
    return f"Both hands are {TEEN_NAMES[winner[0]].lower()}s; the higher one wins"
