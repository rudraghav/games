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

The public projection includes `payment_amount` only while the current bill is
awaiting asset selection (zero otherwise). This is the same already-announced
amount shown to the payer and lets rule-based bots/UI calculate a bank-first
payment without parsing English copy. No hidden state or rule is changed.

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

## Public card-face metadata

`CardView.colors` contains every color printed on a visible property or rent
card; `color` remains its current orientation. `CardView.effect` contains the
printed action identifier, such as `rent_double` or `breaker`. These public face
fields distinguish green/blue from green/rail wilds and two-color from any-color
rent without interpreting opaque card IDs. Empty defaults keep other families
compatible. Only cards already authorized in the viewer projection receive
metadata; other hands, stock order and shuffle randomness remain private.
Focused regressions cover both editions, matching-orientation wilds, all-color
rent, immutable deck definitions and hidden-card projection boundaries.

## Named property sets and table destinations — 2 November 2026

Ordinary properties have distinct US identities instead of color-only labels.
The named properties are fixed metadata attached to the existing physical card
IDs. The order, colors, bank values, action effects and complete deck inventory
are unchanged; saved matches still store only those IDs and their pile keys.
Restarting an older match projects its canonical names without rewriting data.
The No Mercy house format reuses these classic identities as part of its
already approved classic property composition, not as a certification of G3071
printed property faces.

| Set | Properties | Full set | Rent ladder (M) |
|---|---|---:|---|
| Brown | Mediterranean Avenue; Baltic Avenue | 2 | 1 / 2 |
| Light blue | Oriental Avenue; Vermont Avenue; Connecticut Avenue | 3 | 1 / 2 / 3 |
| Pink | St. Charles Place; States Avenue; Virginia Avenue | 3 | 1 / 2 / 4 |
| Orange | St. James Place; Tennessee Avenue; New York Avenue | 3 | 1 / 3 / 5 |
| Red | Kentucky Avenue; Indiana Avenue; Illinois Avenue | 3 | 2 / 3 / 6 |
| Yellow | Atlantic Avenue; Ventnor Avenue; Marvin Gardens | 3 | 2 / 4 / 6 |
| Green | Pacific Avenue; North Carolina Avenue; Pennsylvania Avenue | 3 | 2 / 4 / 7 |
| Dark blue | Park Place; Boardwalk | 2 | 3 / 8 |
| Railroads | Reading Railroad; Pennsylvania Railroad; B&O Railroad; Short Line | 4 | 1 / 2 / 3 / 4 |
| Utilities | Electric Company; Water Works | 2 | 1 / 2 |

Primary references: Hasbro's [US street-name comparison](https://hasbro-new.custhelp.com/app/answers/detail/a_id/124/)
and [B&O Railroad clarification](https://hasbro-new.custhelp.com/app/answers/detail/a_id/45/),
plus the B0965 card guide linked above. Original Hasbro-printed
[railroad](https://monopolydealrules.com/photos/cards/railroad-property-card.png)
and [utility](https://monopolydealrules.com/photos/cards/utility-property-card.png)
photographs were inspected for the remaining names and rent ladders. Their
printed Short Line name is retained; B&O punctuation is normalized to the
publisher's current FAQ spelling. The enthusiast site's inventory prose is not
used to override the publisher guide.

Visible property cards add `set_name`, `set_size` and `rent_ladder` to `CardView`.
For a wild these describe its current orientation; `colors` still retains all
printed choices. Non-property faces and other games retain null/null/empty-list
defaults. The Deal view additionally supplies:

- `property_groups`: static `{color, name, set_size, rent_ladder, properties}`
  references for set inspection; property names are not hidden state.
- `collections`: one `{player, key, color, count, set_size, complete, rent}` per
  visible nonempty pile. Count excludes buildings; completion and rent come
  from the authoritative engine, including active building modifiers. A pile
  without properties has zero rent.
- `pending_action`: null or `{kind, actor, target, responder, amount, blocked,
  stage}`. Stage is `select`, `counter`, `payment` or `distribution`. This is a
  minimal public decision summary, never the internal event object or private
  hand selection. Existing `pending` and `payment_amount` remain compatible.

Property and rearrangement actions keep their bare `color` and carry the exact
destination pile in `choice`. Players may select an incomplete pile or start a
new pile of the allowed color. Complete piles reject additions. Empty slots are
reused so repeated free moves cannot grow saved state or legal options without
bound. Older actions with an empty `choice` resolve only to the first legal
destination, retaining the previous deterministic behavior. Ordinary property
cards can also move between same-color piles for free on their owner's turn,
as clarified in Hasbro [FAQ 922](https://hasbro-new.custhelp.com/app/answers/detail/a_id/922/)
and [FAQ 937](https://hasbro-new.custhelp.com/app/answers/detail/a_id/937/).
Counter/payment phases and a committed Double the Rent still prevent
rearrangement. Existing turn progression is unchanged: the third spent play
automatically advances the turn, after any required discard/pending resolution.
Free collection moves are available before and between those plays; this change
does not add a separate final rearrangement phase. Buildings remain with their
original collection when a property
is moved; its classic building bonus remains inactive while incomplete, and
anchors are refreshed to a remaining property. This preserves the established
building/rent behavior rather than introducing a new payment or banking rule.

Independent tests assert all 28 names, original inventory fingerprints, old
ID-only state restoration, wild orientation, immutable metadata, exact pile
selection, forged/full destinations, same-color moves, bounded repeated moves,
legacy actions, building rent/anchors and public decision privacy. Bot scoring
uses the selected pile's visible count, so a new-pile option does not obscure a
completing move. Complete deterministic min/max matches and bot matches remain
part of verification.

The independent rendered-workspace audit caught a misleading rent quote for a
collection made only from zero-value any-color wilds. Legal Rent actions were
already blocked, but the shared rent helper still returned the color's base
ladder. It now returns zero unless the collection contains a property with a
monetary value; inactive buildings cannot supply that missing base. Both
editions, all-zero-wild groups with/without buildings and building-only groups
have direct regressions, and the public UI fixture asserts the same zero quote.

## Audit fixes — 2 November 2026

Classic now declares `b0965-faq-2`: the B0965 deck plus Hasbro's current
[Just Say No FAQ 953](https://hasbro-new.custhelp.com/app/answers/detail/a_id/953/).
Just Say No uses no ordinary play, including when countering after the third
ordinary card. Counter chains finish before the normal end-of-turn progression.
No Mercy retains `house-deck-1`, its approved money inventory, and its existing
own-turn counter cost as an explicitly stated Games house convention. This
choice does not claim the classic FAQ establishes a G3071 counter rule.

The existing Games **building transfer convention** is now explicit: buildings
linked to a property travel with it. Their values count in the payment total,
including when only the property was selected. This carry convention is not
presented as a verified publisher payment rule. A building selected alone goes
to the creditor's bank. Property-plus-building selections resolve property first
so input order cannot change where an attached building ends up.

`transfer_cards` owns that transfer closure. `payment_bundles` projects one
public bundle per eligible asset only to the current payer. A bundle contains
its selected `card` and all `transfers: [{id, value}]`; it does not enumerate
subsets. The pure `combine_payment_bundles` unions IDs, rejects duplicates or
ineligible selections, and supplies the same actual value to payment validation,
No Mercy debt issuance and bot loss estimates. Insolvency tests the full union
against every payable asset. No change is returned for overpayment. The UI
unions these server-authored bundles and identifies unselected carried buildings
before confirmation; it never derives hidden engine links.

`pending_action.transfers` lists committed public cards with source/recipient
for swaps, steals, set taking and bank exchange, including carried buildings.
`collection`, `category`, `source_collection` and `multiplier` expose only allowed
public set/category/rent context. Arbitrary event fields, opposing hand choices,
stock order and private card identities are still excluded. Old saved events
without the added public rent context remain readable.

Regression evidence includes the original unchanged-seed audit trajectories:
classic 114 actions reaches a 2M face selection that actually transfers 9M;
No Mercy 99 actions reaches a 3M property that transfers 6M with its Shack;
classic seed 12 reaches the third-play counter window in four legal actions.
All now assert exact quotes, actual transferred IDs, card conservation and input
immutability. Controlled cases additionally cover selection order/deduplication,
bank/building-only payment, insolvency, hidden canaries and bot loss valuation.

## Seat instructions and move labels — 3 November 2026

`GameView.message` is computed by `DealEngine.instruction(state)` at projection
time instead of being the stored "Played …" text. It is written for the seat
that can act, never restates the previous move (the room's attributed Last move
line does that), and reveals nothing private: for example "Play up to 2 more
cards, or end your turn.", "Accept, or answer with Just Say No.", "Accept the
block, or answer with your own Just Say No.", "Pay 5M from your bank or
properties. No change is given.", "Choose the card to take.", "Settle your debt
first: give a card from your hand to your creditor.", "Place or bank the card
you were given for a debt.", "Play a Rent card next: it charges ×2." and
"Discard 1 card to keep 7.". The stored `message` key is kept for saved-state
compatibility. No rule or projection field changed.

Public move-history labels: accepting is "Let the last play stand" (it covers
both an accepted action and an accepted block), choosing is "Chose a card to
take" and a debt settlement is "Gave a hand card to settle a debt" (the card
stays private to the two players).
