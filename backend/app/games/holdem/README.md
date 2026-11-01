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

A match is one hand; rematch deals another. The 1 November 2026 audit also checked
[PokerStars' rules](https://www.pokerstars.com/help/articles/poker-rules-master/229151/)
for heads-up order, side-pot eligibility and minimum raises. `test_table_rules.py`
independently checks all nine ranking categories, wheel/raise boundaries,
cumulative short all-ins, odd-chip order and min/max complete matches with exact
card/chip conservation. Uncalled excess is refunded separately, never counted
as a winning side pot; a lone funded player cannot raise against only all-ins.
Existing side-pot fixtures verify unequal stacks and folded-hand redaction.
