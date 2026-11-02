# Card workspace review — 2 November 2026

Outcome: recognizable cards, a stable playing area, and decisions beside the
cards they affect. This is the Uno/casino/Rummy/Skyjo/Shithead portion of the
owner-requested Playdeal review. Deal identity/table interaction and other game
families have separate owning changes.

Constraints: use only authorized projections and legal actions; preserve casino
committed-version animation and blackjack split/bet semantics; no engine rules,
turn clocks, private data, migrations or cloud configuration changes here.

## Rendered review and changes

Before changes, captured all eight games at minimum/maximum seats on 390px and
1440px canvases (32 synthetic views). The development gallery controls are not
production headers. The review found separated card/action context, generic
phase text, a viewer grid that depended on seat order, and sort state reset on
each Shithead revision. Captures contain synthetic names/cards only.

| Game | Change and observable check |
| --- | --- |
| Uno | Authoritative playable-card emphasis; other cards remain inspectable. Card-specific choices require selection; colour/challenge/draw/pass text follows legal options. Keyboard select/clear and pending blocking pass. |
| Uno No Mercy | Same workspace, with edition-specific faces and legal choices. No unavailable draw alternative is suggested. Maximum 24-card preview remains in its own rail. |
| Hold'em | Public felt precedes the own hand/decision dock; compact opponent seats follow it. One own hand, unchanged min-raise amount validation and actual public pot/bet anchors. |
| Teen Patti | Same table/dock hierarchy; blind private faces remain absent. Minimum chip action validation passes. |
| Blackjack | Same dock hierarchy; undealt cards are not invented, split hands/bets remain distinct, and hand-bet total still excludes insurance. Minimum bet validation passes. |
| Rummy | Draw actions are directly on available piles; selected cards move through labeled local group buttons. Rank/suit sorting retains card identities and groups. Discard/declaration still use the engine's legal choices. |
| Skyjo | Viewer grid first in DOM order; exact legal reveal/replace targets include row/column labels. Opponent grids have no move buttons, and hidden ranks remain absent. |
| Shithead | Own private/public zones share one workspace. Sort preference survives revisions; selection is version-scoped. Three-card setup, sorting, privacy, play and refresh checks pass. |

Final 32-view capture sweep has no page overflow. The existing all-catalogue
density sweep also passes at both widths: painted card text remains in its
frame, Skyjo cards do not collide, controls retain 44px targets, and crowded
casino seats adapt to available canvas width. Casino desktop docks are allowed
below the full-size ring (under 650px from table start); compact docks remain
under 330px and above opponent seats. Other family bounds remain unchanged.

## Complete card inventory

All **281 canonical faces/orientations** were mounted and captured as paired
normal/compact frames, then visually inspected in the 20 `inventory-*.webp`
sheets: 54 Uno, 68 Uno No Mercy, 74 Deal and 85 Deal No Mercy. The mounted
regression checks labels/values, active wild colours, instructions and each rent
ladder cell for painted clipping/collisions at phone and desktop sizes. Compact
Deal cards deliberately retain names/value/colour/rent; full instructions remain
on normal cards and the selected-card decision workspace.

The visual review found yellow Uno ink too pale. The scoped fix keeps the yellow
fill and changes rank/corner/caption ink to `#624509`. Actual computed normal and
compact styles measure **5.08:1** on yellow `#edbe4a` and **8.70:1** on the ivory
centre `#fffdf8`. A browser contrast regression now enforces at least 4.5:1 for
those parts in both Uno editions. All other reviewed faces remain unchanged.

The final painted review also constrained interactive pile shadows to actual card
width, so longer action captions cannot stretch them into a second ghost card.
Skyjo reuses the shared legal border/glow without an additional exterior outline
that would bridge the grid gaps. The affected views were recaptured and the
complete density sweep passed again.

## Verification and limits

- Focused card-workspace/table-layout/Shithead/casino-transition tests: **22 pass**.
- Frontend type-check, scoped ESLint, and browser-test TypeScript: **pass**.
- Table density and crowded casino collision checks: **4 pass**, both widths.
- Updated table usability, keyboard grouping and pending/paused checks: **4 pass**.
- Mounted complete card inventory and contrast checks: **4 pass**.
- Mounted casino motion/reduced-motion regression: **2 pass**.
- Real local room-layout/Shithead lifecycle/refresh/race/recovery checks: **13 pass**,
  **1 intentional desktop skip** for the phone-only compact-lobby case. Test-owned
  rooms were closed by suite teardown.
- Separate CLI interaction review: keyboard Uno; Rummy grouping/sorting; Skyjo
  exact targets/privacy; Shithead setup/sort; and casino amount bounds pass at
  both 390px and 1440px.

Initial table-usability runs loaded the former Deal selector before its owning
change completed; the updated source passes. The first mounted motion run
included Storybook hydration inside its 850ms observation deadline. Trace
inspection showed 839ms waiting for the story button before the click. The test
now awaits the mounted initial version before starting that same deadline;
replay, chip-flight and reduced-motion assertions are unchanged and pass.

These checks establish local rendering, controls, privacy and the listed real-room
flows. They do not substitute for the parent's all-game complete-match, bot,
production-build, release or hosted smoke checks. This subtask made no commit,
push or deployment. The parent owns those release states.
