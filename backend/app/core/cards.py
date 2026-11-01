from __future__ import annotations

import hashlib
import itertools
import json
import random
import secrets
from collections import Counter
from typing import Any

from app.core.contracts import CardView, RuleError, State

SUITS = "SHDC"
RANKS = "23456789TJQKA"
SUIT_SYMBOL = {"S": "♠", "H": "♥", "D": "♦", "C": "♣"}


def rng(seed: int | None = None) -> random.Random:
    return random.Random(seed if seed is not None else secrets.randbits(128))


def shuffle_saved(state: State, cards: list[Any]) -> None:
    """Reproducible reshuffles derived from the already private shuffled state."""
    if "_shuffle_key" not in state:
        state["_shuffle_key"] = hashlib.sha256(
            json.dumps(state, sort_keys=True).encode()
        ).hexdigest()
    nonce = state.get("_shuffle_nonce", 0)
    digest = hashlib.sha256(f"{state['_shuffle_key']}:{nonce}".encode()).digest()
    rng(int.from_bytes(digest, "big")).shuffle(cards)
    state["_shuffle_nonce"] = nonce + 1


def standard_deck(copies: int = 1, jokers: int = 0) -> list[str]:
    return [
        f"{rank}{suit}:{copy}" for copy in range(copies) for suit in SUITS for rank in RANKS
    ] + [f"JK:{i}" for i in range(jokers)]


def card_view(card: str) -> CardView:
    face = card.split(":")[0]
    if face == "JK":
        return CardView(id=card, label="Joker", value="★", color="violet")
    rank, suit = face[0], face[1]
    value = {"T": "10", "J": "J", "Q": "Q", "K": "K", "A": "A"}.get(rank, rank)
    return CardView(
        id=card,
        label=f"{value} {SUIT_SYMBOL[suit]}",
        value=value,
        suit=SUIT_SYMBOL[suit],
        color="red" if suit in "HD" else "ink",
    )


def draw(state: State, count: int = 1) -> list[Any]:
    cards = []
    for _ in range(count):
        if not state["deck"]:
            if len(state.get("discard", [])) <= 1:
                raise RuleError("The draw pile is exhausted.")
            top = state["discard"].pop()
            state["deck"] = state["discard"]
            # Randomness stays inside the server's new authoritative state.
            shuffle_saved(state, state["deck"])
            state["discard"] = [top]
        cards.append(state["deck"].pop())
    return cards


def blackjack_total(cards: list[str]) -> tuple[int, bool]:
    values = [11 if c[0] == "A" else min(RANKS.index(c[0]) + 2, 10) for c in cards]
    total, aces = sum(values), sum(c[0] == "A" for c in cards)
    soft = aces
    while total > 21 and soft:
        total -= 10
        soft -= 1
    return total, soft > 0


def poker_five(cards: list[str]) -> tuple[int, ...]:
    values = sorted((RANKS.index(c[0]) + 2 for c in cards), reverse=True)
    groups = sorted(((count, value) for value, count in Counter(values).items()), reverse=True)
    flush = len({c[1] for c in cards}) == 1
    unique = sorted(set(values), reverse=True)
    straight = unique[0] if len(unique) == 5 and unique[0] - unique[-1] == 4 else 0
    if unique == [14, 5, 4, 3, 2]:
        straight = 5
    if straight and flush:
        return (8, straight)
    if groups[0][0] == 4:
        return (7, groups[0][1], groups[1][1])
    if [g[0] for g in groups] == [3, 2]:
        return (6, groups[0][1], groups[1][1])
    if flush:
        return (5, *values)
    if straight:
        return (4, straight)
    if groups[0][0] == 3:
        return (3, groups[0][1], *(g[1] for g in groups[1:]))
    if [g[0] for g in groups[:2]] == [2, 2]:
        return (2, *sorted((groups[0][1], groups[1][1]), reverse=True), groups[2][1])
    if groups[0][0] == 2:
        return (1, groups[0][1], *(g[1] for g in groups[1:]))
    return (0, *values)


def poker_rank(cards: list[str]) -> tuple[int, ...]:
    return max(poker_five(list(combo)) for combo in itertools.combinations(cards, 5))


def teen_rank(cards: list[str]) -> tuple[int, ...]:
    values = sorted((RANKS.index(c[0]) + 2 for c in cards), reverse=True)
    groups = sorted(((n, v) for v, n in Counter(values).items()), reverse=True)
    flush = len({c[1] for c in cards}) == 1
    straight = len(groups) == 3 and values[0] - values[-1] == 2
    high = values[0]
    # This table ranks AKQ, A23, KQJ ... 432, as documented in the rules.
    if values == [14, 3, 2]:
        straight, high = True, 13
    elif straight and high < 14:
        high -= 1
    if groups[0][0] == 3:
        return (5, groups[0][1])
    if straight and flush:
        return (4, high)
    if straight:
        return (3, high)
    if flush:
        return (2, *values)
    if groups[0][0] == 2:
        return (1, groups[0][1], groups[1][1])
    return (0, *values)
