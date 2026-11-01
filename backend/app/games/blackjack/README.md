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

Status: implementation in progress. Verify natural/dealer-natural/insurance,
soft totals, split funding/aces, doubles, busts, payouts and public projection.
