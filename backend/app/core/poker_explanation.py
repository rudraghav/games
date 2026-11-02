"""Public or viewer-authorized poker explanations, using the existing evaluator."""

from itertools import combinations
from typing import Any

from app.core.cards import card_view, poker_five

NAMES = ("High card", "Pair", "Two pair", "Three of a kind", "Straight", "Flush",
         "Full house", "Four of a kind", "Straight flush")
RANKS = {**{i: str(i) for i in range(2, 11)}, 11: "jack", 12: "queen", 13: "king", 14: "ace"}


def explain_poker_hand(cards: list[str]) -> dict[str, Any]:
    """Call only with already-public cards or the viewer's own permitted hand."""
    best = max(combinations(cards, 5), key=lambda five: poker_five(list(five)))
    rank = poker_five(list(best))
    values = [RANKS[value] for value in rank[1:]]
    category = "Royal flush" if rank == (8, 14) else NAMES[rank[0]]
    descriptions = {
        0: lambda: f"{values[0]} high; comparison order {', '.join(values)}",
        1: lambda: f"Pair of {values[0]}s; kickers {', '.join(values[1:])}",
        2: lambda: f"Pairs of {values[0]}s and {values[1]}s; kicker {values[2]}",
        3: lambda: f"Three {values[0]}s; kickers {', '.join(values[1:])}",
        4: lambda: f"{values[0]}-high straight",
        5: lambda: f"Flush; comparison order {', '.join(values)}",
        6: lambda: f"Three {values[0]}s with two {values[1]}s",
        7: lambda: f"Four {values[0]}s; kicker {values[1]}",
        8: lambda: f"{values[0]}-high straight flush",
    }
    return {"category": category, "comparison": list(rank[1:]),
            "description": descriptions[rank[0]](),
            "cards": [card_view(card).model_dump() for card in best]}
