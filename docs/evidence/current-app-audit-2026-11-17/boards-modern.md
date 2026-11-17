# Board and modern table audit — 2026-11-17

Fresh local review of the current app at `http://127.0.0.1:3217`, following the
`0840f8b` implementation. Screens below are authorized engine projections from
`/design/midgame`, not saved games. Each listed state was rendered and visually
inspected at **320 × 900 and 1280 × 900**. All 24 measured renders had no page
overflow and no visible enabled button/summary below the 44px target tolerance.

## Findings resolved

- **Gem artwork:** uniform quarter-image crops included neighbouring buildings.
  The preserved 1254px atlas actually packs its subjects unevenly. Sixteen measured
  subject rectangles now frame each complete illustration; no image replacement
  was needed. All 16 final renders were visually inspected in Storybook. Existing
  grid-based Azul tiles were also rendered and inspected unchanged.
- **Gem geometry:** the 390px market previously mixed 272px/298px cards and
  134px/160px artwork depending on cost wrapping. Market cards now reserve equal
  square art, two title lines and two cost rows, and grow to contain their content.
  The regression checks equal heights and full cost/status containment across
  compact and wide widths. It covers the desktop aspect-ratio constraint that
  was found and corrected during this implementation.
- **Trio perspective:** the viewer's own active row previously said “their turn”.
  It now says “your turn”; another active player's row still says “their turn”.

## Visual and interaction matrix

| Game | Inspected legal state | Fresh interaction evidence in this pass |
| --- | --- | --- |
| Four in a Row | `four-in-a-row-2-31-16`, occupied columns | Whole-board overview, Escape/focus return, final-column keyboard reachability, 200%/400% content zoom. At 320px the 312px board uses the page gutter and fits fully. |
| Reversi | `reversi-2-31-16`, legal destinations and recent flips | Overview, rail navigation, last legal control keyboard reachability, zoom. Phone rail intentionally preserves 44px squares. |
| Checkers | `checkers-2-31-107`, forced king capture | Overview, rail navigation, last legal control keyboard reachability, zoom. Crown, selected source and destination are visibly distinct. |
| Mancala | `mancala-2-31-16`, nonuniform pits | Overview, rail navigation, last legal pit keyboard reachability, zoom. Pit/store ownership and counts remain readable. |
| Boop | `boop-2-17-16`, kittens and adults of both colours | Graduation preview, clear, keyboard selection and explicit confirmation exercised separately. Current adult/kitten silhouettes and sizes are visibly distinct on the phone board and labelled pool. |
| Azul | `azul-4-31-16`, four red tiles awaiting placement | All 10 generated states included in four-width expanded-layout checks. Fit, completion and floor penalties visually inspected; no fresh saved Azul turn in this sub-audit. |
| Gem Market | `gem-market-2-17-2`, mixed one-/five-colour costs | All 7 generated states in four-width geometry checks; selected card shortfall/decision-tray visibility; actual two-player token selection, commit and refresh at desktop/phone. |
| Sea Salt & Paper | `sea-salt-paper-4-31-136-crowded`, hand and played collections | All 18 generated states in four-width checks. Separate private-choice rail keyboard navigation, selection/clear/take, saving/disconnected gating, inspection dialog and focus return. |
| Flip 7 | `flip-7-10-31-57-crowded`, ten seats and Second Chance | All 8 generated states in four-width checks. Wrapped own cards, busted duplicate pairs, frozen/stayed rows and Hit/Stay consequences visually inspected. No fresh saved Flip 7 turn in this sub-audit. |
| Trio | `trio-6-31-24-crowded`, collected trio and cleared table slot | All 6 generated states in four-width checks. Cleared slots remain named static images, not reveal buttons; current-seat wording regression passes. No fresh saved Trio turn in this sub-audit. |
| The Gang | `the-gang-6-31-19`, six-player river | All 12 generated states in four-width checks. Private pocket cards, rank chips and previous-round chip history visibly legible. No fresh saved chip commit in this sub-audit. |
| 6 nimmt! | `six-nimmt-10-31-33`, mandatory row choice | All 8 generated states in four-width checks. Four row capacities, exact penalties, cheapest row and resolving order visibly legible. No fresh saved row commit in this sub-audit. |

## Checks run

- `pnpm exec vitest run apps/web/src/tests/table-layout.test.tsx`: **5 passed**.
- `pnpm exec playwright test tests/browser/crowded-modern.spec.ts tests/browser/modern-board-fixes.spec.ts`: **16 passed**. Covers the listed board/Paper/Boop/Gem interactions and 69 modern projections at 320, 390, 768 and 1440px.
- Final Gem containment change: `crowded-modern.spec.ts --grep 'all seven'`: **2 passed**, 69 projections × 4 widths.
- Final Trio copy assertion: `crowded-modern.spec.ts --grep 'legally cleared'`: **2 passed**.
- Saved Gem rooms: `expansion.spec.ts --grep 'Gem Market'`: **2 passed**. Independent guests selected three gem colours, submitted the move, observed a newer saved version and reloaded. Test teardown abandoned the unfinished matches and made every QA participant leave.

Local screenshots and logs: `output/playwright/current-app-audit-20261117/boards-modern/`.
Key files are `gems-tier1-390.png` (before), `gem-market-320.png`,
`gem-market-1280.png`, `gem-all-16-after.png`, `atlas-grid-preserved.png`,
`trio-own-seat-after.png`, `four-rail-320.png`, and each game's `-320`/`-1280` pair.
Some table-element captures crop board gutters; `four-rail-320.png` separately
shows the complete 312px board inside the 320px page.

## Boundaries and remaining work

This closes the old `AZULGEMS-22` crop and `AZULGEMS-23` geometry deferrals with
fresh renderer evidence. It does not establish every possible game state or a
new hosted release. Other historical deferred decisions remain separate:
phone board rails versus smaller targets, roving keyboard grids, hidden phone
edge rulers, rematch seat ordering, reveal-history policy and bot pacing. No new
art was needed for the inspected Boop pieces; this is visual evidence, not a
native screen-reader or colour-vision user study. No fresh long-offline recovery,
native touch-device, all-game complete-match, or production test is claimed here.

The saved-room evidence above is specific to Gem Market; the other games' local
legal-projection evidence must not be presented as newly saved multiplayer play.
Root release verification and any broader saved-room checks are recorded separately.

Cleanup receipt: the task-created `audit-boards-modern-1117` browser session was
closed. Successful saved tests closed their extra browser contexts and ran their
room-leave teardown. The 6.5 MB of before/after evidence and check logs is retained
for review. Existing app, Storybook, API and database services were left running.
