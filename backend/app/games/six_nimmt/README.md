# 6 nimmt! — classic 104-card game

Rules audited 1 November 2026 against [AMIGO's English classic rules](https://blog.amigo-spiele.de/content/ap/rule/04910-GB-AmigoRule.pdf) and its [current product rules summary](https://www.amigo-spiele.de/6-nimmt_4910_1124). Two to ten players; the full 104-card numbered deck is used at every player count. The tactical reduced-deck/draft variant is not offered. This is an established social card game, selected for continued popularity rather than claimed as a recent release: [BGA's 2025 review](https://en.boardgamearena.com/news?id=1025) ranks it first by distinct players.

Shuffle all 104 unique cards numbered 1–104 each round. Deal ten private cards per player and four public row starters; set the rest aside until the next round. Each card has one penalty point except numbers ending in five (two), multiples of ten (three), multiples of eleven (five), and 55 (seven). The full deck totals 171 penalty points.

Everyone secretly selects one card. Locked choices cannot change and remain private until every player has selected. Reveal together, then resolve the unique numbers in ascending order. Each number goes after the greatest row-end value below it. If that row already has five cards, its owner takes those five as penalties and the selected card becomes the new starter. A number below all four row ends requires its player to choose any row to take. Later cards resolve against the updated rows, not an earlier snapshot.

After all ten selections, add captured-card penalties to cumulative totals. Finish only at a complete round boundary when any player has at least 66 penalties. The lowest cumulative total wins; equal lowest totals share victory. Games records positive penalty totals and labels them explicitly; lower is better. Review pauses after each reveal/resolution and each completed round. The first seat advances the next selection or round; a forced low-card row is chosen only by that card's owner. These review controls are digital pacing conventions, not extra scoring rules.

Acceptance: exact 104-card/171-point inventory; hidden locked decisions; forced ascending placement, sixth-card capture and low-card choice; updated-row cascades, score boundaries and ties; rejected forged/duplicate choices; immutable complete minimum/maximum matches; full physical-card conservation within every round. Original numeric card faces and penalty labels replace publisher artwork.

Persistence regression: `test_coop_number_rooms.py` submits two different players'
secret choices at one version. Exactly one commits; the other receives a conflict.
The committed lock survives retry and application restart without revealing its
number to a waiting player. Reviewed submissions then reveal all numbers in
ascending order; receipts contain committed versions only.
