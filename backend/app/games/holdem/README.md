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
can still match it plus the all-in players (`all_in`). Settlement groups amounts
that the same players can win before dividing a tied pot. Folded contributions
at different amounts therefore add to a single pot. Each actual side pot has its
own awards and clockwise odd-chip calculation. Uncalled excess is refunded.
The renderer also accepts the older saved per-layer ledger. Publicly shown hands
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

## Independent verification

The five-seat regression in `test_table_rules.py` reaches showdown using legal
bets and folds from a seeded deal. The two winners each receive 11 of the 22 chips.
See [Poker TDA rules 21 and 23](https://www.pokertda.com/view-poker-tda-rules/) for
odd-chip order and side-pot splits.

`backend/tests/verify_pokerkit.py` replays that deal in an independent engine.
It also compares the evaluator against all 2,598,960 five-card combinations and
their full ordering, then checks best-five selection on 1,024 seeded seven-card deals.
Run from the repository root with an isolated Python 3.13 environment containing
the project dependencies and [PokerKit 0.7.7](https://github.com/uoftcprg/pokerkit).

```sh
PYTHONPATH=backend python backend/tests/verify_pokerkit.py
```
