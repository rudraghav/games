# Blackjack

Rules baseline: https://bicyclecards.com/how-to-play/blackjack/ plus these fixed
table rules: 1–7 humans, six 52-card decks, 200 free chips per new match, even
initial wagers, 3:2 natural payout, ties push, dealer stands on soft 17 by default
(host can select hit-soft-17). Insurance is offered against an ace. Dealer peeks
for blackjack before ordinary play. Double on any initial two cards, including
after split; at most four hands; split aces receive one card and cannot resplit.
Split-hand 21 is not a natural. No surrender. All hands/bets are visible except
the dealer's hole card until settlement. A match is one complete table round;
rematch starts a new round with free starting chips.

The 1 November 2026 rule audit checks `test_table_rules.py`: natural 3:2 payout,
dealer peek, insurance payout/funding, pushes, split aces, ordinary split 21,
double-down's single card, both soft-17 settings and min/max complete rounds with
all 312 card identities conserved. A split 21 ends automatically and pays as an
ordinary hand. Insurance is offered only when affordable. House rules above
resolve options that vary between casinos; they are not universal casino rules.
