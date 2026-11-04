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

Final-turn detail lists the actual remaining turn order clockwise after the
closer, shrinking once per completed turn. Round-end detail records each final
grid total after removed columns, removed-column count, applied multiplier,
round points and cumulative points. The UI displays that server ledger during
round review/results; hidden-grid totals are never sent during play.
`test_casino_explanations.py` checks the queue at 2/8 seats and ledger parity;
existing final-reveal and positive/zero/negative doubling tests remain in force.

Projected messages are the instruction for the seat that can act, derived from the
phase at projection time: turn over two cards, then one more; draw or take the
named discard; replace with the card you took or drew, or discard it and turn over
a card; turn over a face-down card; "Final turn." during final turns; start the
next round after review; the lowest total wins at the end. Only the drawer's own
view names a privately drawn value; every other view says "the drawn card". The
stored round-start text is left unchanged because saved reshuffles hash the state.
`test_skyjo_flip_trio_messages.py` covers each phase and the private draw.
