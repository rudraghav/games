# Indian 13-card points rummy

Baseline: published 13-card declaration guidance at
https://www.rummycircle.com/how-to-play-rummy/cards-in-Rummy.pdf.
2–6 players, two 52-card packs plus two printed jokers. Deal 13 each; cut a wild
rank (ace if printed joker); one open discard. Draw from stock/open discard then
discard. A declaration consumes the 14th/discarded card and requires complete
coverage by sets/sequences, at least two sequences including one pure. Aces may
be low or high, never wrap; sets require distinct suits. Jokers score zero;
faces/aces 10, numbers face value; losing hand is capped at 80. Before drawing
on their first turn a player may drop for 20, later for 40. False declaration is
80 and removes the declarer. The last active player wins. Discarded jokers are
not available to pick up at this table. A match is one points deal.

Scoring reference verified on 1 November 2026:
https://www.rummycircle.com/how-to-play-rummy/rummy-points-system.html.
Without two sequences including a pure one, every non-joker card counts toward
the capped loss; with both, only unmatched cards count. A picked-up open card
cannot immediately be discarded again. The ace fallback for a printed cut,
20/40 drops, false-show 80 and zero-sum room scoring are explicit table choices.
`test_table_rules.py` verifies this scoring gate, natural wild-rank pure runs,
ace wrapping, duplicate-suit sets, false declarations and both drop penalties.
Conserved controlled local deals at 2/6 seats complete valid declarations and
score zero-sum. These fixed deals are separate from shuffled browser play.
