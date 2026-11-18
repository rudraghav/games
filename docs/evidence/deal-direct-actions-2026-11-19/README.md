# Direct Monopoly Deal card actions

The selected-card view is a compact modeless action toolkit: up to three exact
legal choices appear immediately, banking stays separate, and All N moves/properties
expands the full list. Fewer returns without losing a partial swap. The table
stays in place; this avoids the layout shift of a growing inline toolbar and the
hidden destinations of a table-only flow. The card tap only
opens choices; a named destination/action/bank button commits. The permanent bank
conversion is explained before committing. Forced Deal keeps the necessary take
and give decisions, with owners and both cards explicit. Pending payments and
counteractions keep their existing reviews. Complete No Mercy Take/Keep/Give
stages also use direct buttons. Server-enumerated options remain the
only authority, with no rule, wire, server-persistence or privacy change.

Baseline at 320px: selecting Baltic Avenue offered only Choose a move in the dock,
with destinations below the fold. The panel route required four taps from the
hand. Targeted action routes could require player, property and confirmation after
selection. Acceptance is two taps for complete choices and three for multi-option
Forced Deal, with exact submitted options and visible first-view CTAs.

Local release checks passed: frontend types/lint, 270 unit tests and production
build; contract/catalogue/asset parity; 44 workflow tests; and 54 affected desktop/
phone browser cases. Reports `verify-1d3a53e47e3e40c88682a7deb47af7c4` and
`verify-87e1813e50874ff28cd3ae11aaf8eb41` have stable source fingerprints.
The 22 focused browser cases additionally cover expansion/backtracking and exact
visible choices. Constructed projections are separate from actual gameplay.

The browser review caught a real last-row focus clipping issue after expanding,
collapsing and re-expanding. Constant spacing across states fixed it; strict bounds
and top/bottom hit tests remain. Old nonpayable-wild assertions now check the new
read-only inspection behavior and prove the wild stays outside the payment.

Runtime: 6,193 files, `5e017b68be847e3619583a114e6b75a613a16481cdae76a30399c2ffe52eb3a7`.
Publication and hosted verification will be recorded in `production.json`.

Card interaction follows context: playable hand/public cards open their moves,
payable public assets toggle the existing payment selection, and cards without
available moves open information. Explicit Place here/Move here destinations
commit the selected property to that exact projected pile. Inspection, peek,
expansion and partial swap selection never submit an action.

Local real saved-room rehearsal used two fresh QA guests and both editions. Six
actual projected commits (property/action/bank in each) required two clicks each;
selection submitted nothing and each committing CTA incremented the version once.
Classic property/bank were reviewed at 320px; its action and No Mercy at 390px.
Refresh and hand privacy passed, and the exact QA room was closed with 404 readback.
Natural hands in this run had at most two direct choices: expansion coverage comes
from controlled engine-derived review fixtures, not this saved-room rehearsal.

Production is live and verified at https://games-seven-black.vercel.app, application
`bb1093a624fb0402eb2145ed3c74cb6f12f1404e`, one READY deployment in bom1. See
[production.json](production.json) for exact source/alias, six actual two-click
commits, viewport scope, refresh/privacy, health, preservation and log evidence.
The natural hosted hands did not require expansion; controlled local fixtures
cover full-list expansion, backtracking and the crowded final target.

Cleanup closed three local QA rooms and one hosted QA room, retaining history;
the hosted room returned 404. All test browsers closed. User browser and local
web/API/Storybook remain untouched and healthy. Approximately 74 MiB of meaningful
baseline, failure and final evidence is retained in task output; final browser
artifacts were moved out of the shared test-results folder to prevent overwriting.
No source, credentials, database, unfinished work or active service was removed.
Documentation closure preserves the tested runtime and needs no second deployment.
