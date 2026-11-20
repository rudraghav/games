"""Optional exhaustive external check. See games/holdem/README.md for setup."""

from collections import Counter
from itertools import combinations
from math import comb
from random import Random

from pokerkit import Automation, Card, NoLimitTexasHoldem, StandardHighHand

from app.core.cards import poker_five, poker_rank, standard_deck


def check_split_pot() -> None:
    """Replay the five-seat deal from test_folds_at_different_amounts_do_not_create_extra_odd_chips."""
    game = NoLimitTexasHoldem.create_state(
        (Automation.ANTE_POSTING, Automation.BET_COLLECTION, Automation.BLIND_OR_STRADDLE_POSTING,
         Automation.HOLE_CARDS_SHOWING_OR_MUCKING, Automation.HAND_KILLING, Automation.CHIPS_PUSHING,
         Automation.CHIPS_PULLING), True, 0, (1, 2), 2, 200, 5,
    )
    # PokerKit's first seat is the small blind: b, c, d, e, a.
    for hand in ("TcJh", "7c4c", "9d3s", "5d4h", "2c5h"):
        game.deal_hole(hand)
    game.complete_bet_or_raise_to(5)
    game.check_or_call()
    game.check_or_call()
    game.fold()
    game.fold()
    game.burn_card("9c")
    game.deal_board("5sQs9s")
    game.check_or_call()
    game.complete_bet_or_raise_to(2)
    game.check_or_call()
    game.fold()
    for burn, card in [("Qh", "6d"), ("5c", "Kh")]:
        game.burn_card(burn)
        game.deal_board(card)
        game.check_or_call()
        game.check_or_call()
    assert not game.status and game.stacks == [199, 198, 195, 204, 204]


def main() -> None:
    check_split_pot()
    deck = standard_deck()
    cards = {c: next(Card.parse(c[0] + c[1].lower())) for c in deck}
    indices: dict[tuple[int, ...], int] = {}
    categories: Counter[int] = Counter()
    for hand in combinations(deck, 5):
        rank = poker_five(list(hand))
        entry = StandardHighHand.lookup.get_entry(tuple(cards[c] for c in hand))
        assert indices.setdefault(rank, entry.index) == entry.index, hand
        categories[rank[0]] += 1
    assert [indices[rank] for rank in sorted(indices)] == list(range(7462))
    assert [categories[i] for i in range(9)] == [
        1302540, 1098240, 123552, 54912, 10200, 5108, 3744, 624, 40,
    ]
    assert categories.total() == comb(52, 5)
    rng = Random(20261121)
    for _ in range(1024):
        seven = rng.sample(deck, 7)
        reference = StandardHighHand.from_game(tuple(cards[c] for c in seven))
        assert indices[poker_rank(seven)] == reference.entry.index, seven
    print("PokerKit agrees on all 2,598,960 five-card hands, all 7,462 ordered strengths,"
          " and 1,024 seven-card deals. The tied 22-chip pot pays 11 to each winner.")


if __name__ == "__main__":
    main()
