# Skyjo

Canonical rules: Magilano's classic rules, available at
https://cdn.shopify.com/s/files/1/0019/1696/0881/files/SKYJO.pdf?v=1739260165
(English printed pages 4–5, publisher-hosted download; verified 1 November 2026).
2–8 players; 150 cards (-2×5, 0×15, every other value -1 to 12×10).
Each player has a face-down 3-row/4-column grid and reveals two cards. Highest
initial revealed sum starts. Take the discard and replace, or privately draw and
replace/discard-and-reveal. A fully revealed equal-value column disappears.
First fully revealed grid triggers one final turn for everyone else. The finisher's
positive round score doubles unless strictly lowest. Accumulate to a 100-point
threshold; lowest total wins. The finisher starts the next round.

Before scoring, turn over all hidden cards and remove every newly completed
equal column, as required by the publisher's special rule. `test_table_rules.py`
checks this final-reveal case, exactly one final turn per opponent, positive-only
doubling on ties, next-round starter, full matches at 2/8 seats and conservation
of all 150 unique cards through draws, swaps, removals and reshuffles. Opening
sum ties use first seat order as the explicit app tie-break.
