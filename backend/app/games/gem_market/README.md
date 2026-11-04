# Gem Market

An original resource-engine game for 2–4 friends, inspired by Splendor. Reference
for the familiar turn loop: SPACE Cowboys' published rules at
https://cdn.svc.asmodee.net/production-spacecowboys/uploads/2025/10/SCSPL01EN_SPLENDOR_RULES_LIGHT.pdf.
Gem Market has its own development cards and patrons; it is not the printed
Splendor edition. All original costs/points are enumerated in `deck.py`.

Components: five gem colours with 4/5/7 chips each for 2/3/4 players, five wild
gold chips; 90 development cards in separate 40/30/20 tiers; ten original patrons
requiring three discounts in each of three colours. Reveal four cards per tier
and player-count-plus-one patrons. Other cards/patrons remain private in stock.

On a turn, take three different available gems (fewer only when fewer colours
remain), take two of one colour with at least four in supply, reserve one market
or blind tier card and gain a gold if available, or purchase a market/reserved
card. Hold at most three reserved cards. Purchased bonuses discount future costs.
This edition spends matching chips before gold automatically. Excess chips above
ten are returned by explicit choice before ending the turn. Then choose one
eligible patron, worth three prestige, if any. Tokens/chips are room-only play pieces.

The actor's projection includes a purchase quote for every visible development
and their own reserved cards: printed cost, applied discounts, matching/gold
spend, missing colors and remaining chips. The same pure quote calculation owns
purchase payment. Unaffordable quotes give a shortfall and no fictitious resulting
wallet; opponents' reserved identities never enter the quote map. The decision
area shows the selected quote, and prioritizes required chip returns or patron
selection over the ordinary turn choices. Market headings count the cards
actually remaining in that tier, including zero after depletion.

At fifteen prestige, finish the current seating round. Most prestige wins, then
fewest purchased cards; a remaining tie is shared. If every player has no legal
action and passes consecutively, settle using the same ranking. Cards from market
are replaced from their own tier until depleted. Reserved cards are visible only
to their owner; bought cards, chips, discounts, patrons and scores are public.

Acceptance: all 90 identities unique, seeded shuffle, legal take/return limits,
discount/gold payments, no negative supplies, reservation privacy and cap, patron
choice, exact card/chip conservation, final seating round and tie handling.

The 1 November 2026 audit checked the linked publisher rules for the shared turn
loop and retained this edition's original costs, patrons and automatic payment
choice. `test_expansion.py` verifies conservation throughout complete 2/4-seat
matches and reservation privacy; `test_gem_market_edges.py` independently checks
the final seating round, fewer-development tie-break and one-patron limit.
`test_table_rules.py` adds separate 2/4-seat completion seeds.

Messages are instructions for the seat that can act (in the final round, "this is
your last turn"; on a return, how many gems to give back). The room shows other
seats whom it is waiting for and the attributed last public move. Reserve actions
state whether a gold is gained ("Reserve … · +1 gold" or "no gold left"), and
patrons are named by their three required colours.
