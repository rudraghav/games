# Trio

Individual SIMPLE mode, audited 1 November 2026 against Cocktail Games'
[English rules](https://www.cocktailgames.com/wp-content/uploads/2022/11/regle_trio_0722_EN_v3.pdf)
and [official FAQ](https://www.cocktailgames.com/nos-jeux/trio-faq/).
Games uses original card graphics. Team swaps and SPICY mode are not offered.

The 36 cards contain three copies of each number 1–12. With 3/4/5/6 seats,
deal 9/7/6/5 cards each and leave 9/8/6/6 fixed face-down table positions.
Hands stay sorted. Reveal a table card or the current smallest/largest card
in any player's hand, including your own. Continue while numbers agree, up
to three. A mismatch returns the revealed cards; a matching trio is collected.
Three collected trios, or the trio of sevens, wins immediately. First seat
starts (Games replaces the printed avocado-based first-player suggestion).

An explicit Continue review lets everyone see a failed reveal before it is
hidden again. Public views contain only table positions, hand counts, earned
trios and currently revealed cards; only the viewer sees their own hand.
Captured positions remain empty, preserving memory of all other positions.

Acceptance: 36-card conservation through success/failure; dynamic hand ends;
no hidden IDs/ranks in projections; seven/three-trio victory; seeded 3/6-seat matches.

Projected messages instruct the seat that can act (reveal or ask; find another or
the third of a number; no match, continue; trio collected, continue) and name the
winning condition at the end. Each hand reveal records which end was asked for as
public `edge` (`low`/`high`; table reveals have none). The catalogue's score unit is
"Trios". `test_skyjo_flip_trio_messages.py` covers the messages and edges.
