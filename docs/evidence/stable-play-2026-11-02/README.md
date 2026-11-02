# Stable gameplay review — 2 November 2026

Deal leads this revision: compact public opponent summaries, a fixed hand and
96px command bar, scrollable owned bank/property sets and exact legal choices.
Complex moves use a modeless panel; View table preserves the choices. Public
swap previews identify both cards, rent includes the authoritative multiplier,
and payments show the selected value, remainder and overpayment. Portalled
phone inspectors stack their public bank/collections; compact property words
stay intact. Owned phone deeds use named 44px rows, with full card faces in the
hand and inspectors.

The same reusable primitives now serve the rest of the catalogue: bounded
DecisionDock variants, HorizontalRail navigation, public OpponentPanel summaries
and RoomActivity. The latest 80 committed public moves survive refresh; hidden
hands, draws, private choices, Tarot questions/readings and deck order stay out
of that history. Existing receipts without public descriptions are omitted;
this update does not reconstruct earlier activity.

## Evidence

- [Deal captures](deal/): clean phone table, swap preview, public inspection and
  authoritative 18M doubled-rent preview. All 22 Deal browser cases pass.
- [Other families](non-deal/README.md): 16 focused browser cases, fixed casino
  controls/split-hand navigation, stable grouping/drafting/target decisions and
  permanent public opponent summaries.
- [Hand and mid-game review](HAND_AND_MIDGAME.md): 235 legally reached projections
  across all 27 games, private-zone/inventory checks and actual critical controls.
- [Shared cards and stories](shared-card-results.json): all 281 normal/compact
  faces at both widths, yellow contrast, motion restoration and 14 interactions
  across seven new shared-component stories.

Final local named gates passed: 108 frontend tests, types/lint/production build,
804 backend tests with lint/types, 162 isolated multiplayer cases, fresh migration
validation, contract/fixture drift and module boundaries. Fifty isolated local
human rooms measured action p95 676ms and authorized snapshot p95 391ms; bot drive
p95 847ms and private snapshot p95 502ms. These are local measurements, not
internet/Broadcast latency.

The final clean browser gate passed 159 cases, with 21 explicitly optional cases skipped; required Storybook, full-match and live suites are recorded separately. [Saved-room acceptance](local-matches.json) validates 94 complete matches across all 26 multiplayer games: 9,008 moves, 231 refreshed mid-game checks and 50 stable selections. It retains interrupted-parent/recovery provenance and does not label interrupted runs successful. Production rollout remains separate in the root journal. Rummy full-match automation draws/discards then
drops; valid declaration is exercised in engine-derived UI states and rule tests.
The 235 projections are not a substitute for saved-room or hosted acceptance.
