# Flip 7

Rules audited 1 November 2026 against The Op's [FAQ](https://theop.games/pages/flip-7-faqs)
and the publisher-distributed [edition 3.1 rules](https://cdn.svc.asmodee.net/production-asmodeeca/uploads/2025/12/FLIP_7-RULES.pdf).
Original Games typography and card graphics; no publisher artwork is bundled.

The 94-card inventory is one zero, n copies of each number n=1–12, one each
+2/+4/+6/+8/+10/x2, and three each Freeze, Flip Three and Second Chance.
Rooms support 3–10 players (the printed game supports 3+).

Deal one card per active seat, resolving effects before continuing the deal.
Then offer Hit/Stay clockwise. Duplicate numbers bust; Second Chance discards
itself and that duplicate. A second protection must move to an eligible active
seat or be discarded. Freeze banks the target. Flip Three draws up to three,
deferring Freeze/Flip Three until the batch finishes; a bust cancels those
deferred effects. The drawer chooses eligible targets. Seven distinct numbers
immediately end the round. Number sums are doubled before additive modifiers
and the 15-point seven-card bonus. Busts score zero.

Reach 200 at a round boundary with a unique highest score; tied leaders play on.
The dealer rotates; round discards enter the next shuffle only when the draw
deck empties. Inactive piles remain out of a mid-round shuffle. For the printed
rules' ambiguous resolved-action discard timing, Games retains Freeze/Flip Three
beside the affected pile until the round ends. The first seat deals initially.
Round review pauses for an explicit next-round action. Hidden deck order and
shuffle state never enter a player view.

Acceptance: all 94 physical IDs conserved, special-card ordering and recovery,
illegal actions rejected, private deck excluded, complete seeded 3/10-seat matches.

Projected messages instruct the seat that can act: hit or stay with the amount
banked and the numbers a repeat would bust (or that a Second Chance saves one),
the 15-point bonus when one new number would end the round, what Freeze or Flip
Three does when choosing a target, passing an extra Second Chance, dealing the next
round, and the end condition. Every resolved target choice is recorded publicly
for the round as `detail.effects` (`card`, `by`, `to`) and cleared at each deal, so
tables can say "Frozen by Ana". `test_skyjo_flip_trio_messages.py` covers them.
