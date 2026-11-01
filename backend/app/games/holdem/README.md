# Texas Hold'em

Baseline: no-limit Texas Hold'em as described by
https://bicyclecards.com/how-to-play/texas-holdem-poker/.
2–9 players, standard 52-card deck, 200 room-only starting chips, blinds 1/2,
button at the first seat (rotated across rematches by the room service).
Heads-up button posts small blind and acts first preflop, last thereafter.
Four betting streets; burn before flop/turn/river; no rake. Raises are to a total
street commitment. Minimum full raise equals the last full raise. Short all-ins
do not reopen raising for players whose action is not reopened by the cumulative
increase. All-in runouts, folded contributions, side pots, ties and clockwise
odd-chip allocation are part of settlement. Folded hands remain concealed.

Status: implementation in progress. A match is one hand; rematch deals another.
Verify hand rankings, heads-up order, blind credit, short raises, all-in runouts,
multiway side pots, split/odd pots, chip conservation and private projections.
