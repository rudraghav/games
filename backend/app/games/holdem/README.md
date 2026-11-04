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

The projection exposes public total contributions and, while betting, the pots
as the table sees them (`live_pots`): one pot until an active player is all in,
then a split at each all-in total, listing everyone still in who has matched or
can still match it plus the all-in players (`all_in`). Settlement still awards
every exact contribution layer separately; settled pots record exact awards and
odd-chip recipients, and refunds remain separate (the UI groups layers with the
same eligible players into one pot for display only). Publicly shown hands
include the best five cards ordered by rank group, the category, a short
seat-sized name and description text from the existing poker evaluator.

`message` is the instruction for the seat that can act ("Call 14 to stay in,
raise to 38 or more, or fold."; "Check, or bet 2 or more."; "Call all in for
198, or fold."), and at the end how the hand was settled without naming anyone
("Won at showdown with a flush.", "Tied hands split the pot (two pair).",
"Everyone else folded."). With no bet to match yet, the raise option is labelled
"Bet". Legal actions and outcomes are unchanged. Folded and uncontested
unshown hands never acquire explanations. The UI uses these server fields rather
than recomputing winners. The unequal-commitment tests in
`test_casino_explanations.py` are explicitly synthetic capability fixtures: they
do not claim naturally reached unequal-stack rooms in a 200-chip reset format.
