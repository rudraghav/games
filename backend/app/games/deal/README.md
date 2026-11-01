# Monopoly Deal family

Classic reference: https://instructions.hasbro.com/en-us/instruction/monopoly-deal-card-game.
No Mercy card-effect reference: physical-card photographs and component inventory at
https://www.geekyhobbies.com/monopoly-deal-no-mercy-rules/ and the Triple S Games
rules demonstration. Publisher instructions remain canonical for the branded
edition. On 1 November 2026 the owner approved a clearly labeled **Games house
deck** because exact G3071 money multiplicities were unavailable. The catalogue
subtitle and in-app rules explicitly identify that format; it is not a certified
reproduction of the boxed G3071 deck.

Classic: 2–5 players, 106 playable cards: 20 money, 28 properties, 11 property
wilds, 13 rent, 34 other actions. Five initial cards, draw two on your turn (five
if empty), play at most three, discard to seven. Three distinct complete colour
sets win immediately. Banked actions become money permanently. Payments come
from bank/properties, never hand; no change. An insolvent classic player pays all
payable assets. Wilds may be rearranged on their owner's turn without spending a
play. Every-colour wilds are not money and cannot form a set alone. Just Say No
supports counter-counteractions, including multi-player rent separately.

No Mercy house format: 115 playable cards, 15 debt chips (three per player),
and two to five seats. Complete sets and hidden hands can
be attacked. Unpaid bills issue one available debt chip. Before ordinary plays,
debtors give one hand card per chip; the creditor immediately plays/banks it.
This spends a debtor play. The edition includes double rent, forced debt, go
again, heist, market crash, pass-go-to-seven, repossession, shack, super sly deal,
tax collector, tough luck, unfair trade and Yoink. Distribution/selection choices
belong to the player specified by each card, not an automatic heuristic.

Verify card conservation, bills and insolvency,
counter chains, wild orientation, set protection in classic, every No Mercy action,
debt settlement into immediate actions, maximum hand discard, and win-on-transfer.

## 1 November 2026 rule audit

Acceptance: preserve exact card inventory through complete min/max-seat matches,
test payments, counters and edition actions against independently stated effects,
and close only rules backed by publisher instructions or readable printed cards.
The classic B0965 publisher card guide is available at
https://assets-us-01.kc-usercontent.com/500e0a65-283d-00ef-33b2-7f1f20488fe2/6eaeff1c-a49c-4415-9ea2-489f5ffe31bc/B09650000_MonoDeal_instr_back.pdf.
The public Hasbro instructions catalogue returned no G3071 result across en-US,
en-GB and en-AU on this audit. Secondary summaries disagree about boxed totals.
The owner resolved the product-format decision by authorizing the house deck,
not by treating a reconstructed inventory as publisher-verified.

The classic inventory is asserted independently against the B0965 guide:
20 money (6×1M, 5×2M, 3×3M, 3×4M, 2×5M, 1×10M), 28 ordinary properties,
11 property wilds, 13 rent cards and 34 other actions. Four physical rule cards
are excluded from the 106-card playable deck. A readable photograph of the
Hasbro-printed light-blue/railroad wild confirms its exceptional 4M value:
https://monopolydealrules.com/photos/cards/railraod-and-light-blue-wildcard-card.png.
That shared-family value was corrected; the No Mercy house deck explicitly
reuses classic property/wild composition, payment values and rent schedules.

## Approved No Mercy house deck

Rules version: `house-deck-1`. The eighteen money cards are **5×1M, 4×2M,
3×3M, 2×4M, 2×5M, 1×10M and 1×15M**. Photographs of the physical cards confirm
all seven denominations, including the previously missing 15M. Their copy counts
are an owner-approved Games convention, not a claim about Hasbro's boxed deck.
The remaining deck contains 28 ordinary properties, eleven property wilds,
five two-colour Rent, five two-colour Double Rent, three any-colour Rent,
three any-colour Double Rent and the 42 actions below, for 115 unique cards.

Original printed action-face photographs were inspected in a fresh browser at
the Geeky Hobbies source above. Their bank values differ from classic and are
asserted independently in tests:

| Action | Bank value | Copies in the house deck |
|---|---:|---:|
| Deal Breaker | 3M | 3 |
| Forced Debt | 2M | 3 |
| Go Again | 1M | 3 |
| Heist | 4M | 3 |
| Just Say No | 4M | 5 |
| Market Crash | 4M | 3 |
| Pass Go, Go, Go! | 1M | 4 |
| Repossession | 5M | 2 |
| Shack | 3M | 3 |
| Super Sly Deal | 3M | 3 |
| Tax Collector | 5M | 2 |
| Tough Luck | 5M | 3 |
| Unfair Trade | 4M | 2 |
| Yoink! | 2M | 3 |

Two-colour Rent/Double Rent bank for 1M; any-colour versions bank for 3M.
Printed effects determine the action (Yoink collects 10M despite banking for 2M).

The audit also fixed a Double the Rent turn deadlock (it now requires an actual
playable matching Rent and cannot lose that follow-up through rearrangement),
rainbow-only collections collecting rent, debt-paid Shack cards attaching
instead of banking, a Shack incorrectly remaining on a partially repossessed
set's kept property, and Deal incorrectly retaining Uno's active discard-top
when recycling. If no stock or used cards exist, a draw takes the available
cards rather than inventing a card or rejecting the entire action.

Independent expected-state tests cover counters and own-turn play counts,
insolvent payments, debt caps, immediate creditor victory, complete-set
protection, buildings on stolen sets, rent multiplication and all No Mercy
effect categories. Three seeded matches per edition at both player limits check
every physical card in stock/discard/hands/banks/collections/pending gifts after
every action. Passing these tests proves the implemented classic and explicitly
approved house formats. It does not certify G3071 money multiplicities.

Full-match API testing exposed another boundary beyond pure rules: a valid
33-asset payment exceeded the shared action model's former 30-card wire limit.
The shared contract now admits the full 115-card selection bound. A projection
regression validates and applies all 33 selected assets with conservation, while
HTTP integration checks verify that the real request path accepts it.
