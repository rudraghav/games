# Solo bots and complete table refresh — 1 November 2026

This release adds optional non-LLM players to all 25 multiplayer formats; Tarot
remains solo. Bots use authorized private views and bounded observations, with
no access to other hidden hands or engine randomness. Word Agents supports
finite category clues; party bot responses are simulated.

The table audit covers every one of the 26 experiences at minimum/maximum
seats on phone and desktop. See [the visual matrix and screenshots](../table-refresh-2026-11-01/README.md)
and [reviewed reusable libraries/artwork](../../REUSE_RESEARCH.md).

## Local verification

- 588 engine/policy tests, including six added public card-metadata regressions;
  100 naturally completed policy matches across all 25
  multiplayer formats, both seat limits and two seeds.
- 128 room integration cases, including60 new bot lifecycle, privacy, version
  conflict, retry, restart, natural one-human matches and maximum-seat starts.
- Fresh isolated migration/privacy test, generated contracts, module boundaries.
- 63 frontend units, workspace and browser TypeScript, frontend lint, production
  Next.js and Storybook builds.
- 104 before and104 after table captures; all26 maximum layouts visually inspected
  on both widths; zero final horizontal page overflow.

Local 50-room load checks pass for human actions and paced private bot drives;
see [platform review, timings and migration checklist](PLATFORM.md).
The [local real-client run](local.json) completed all 25 multiplayer formats on
phone and desktop: 50 natural matches, 2,643 committed actions (1,296 human and
1,347 client-driven bot actions) in 14.3 minutes. Results/history/profile,
rematch, same-group switching and final closure passed for every case. Setup,
clicked play, bot add/remove, interrupted-driver retry and reconnect also passed.
The later card metadata/art changes preserve engine and bot behavior. Final
builds and production results are recorded below.

## Production verified

[Games](https://games-seven-black.vercel.app) serves application source
`b4506a29c5062d215b5b43a02e56c7899ff4d9f3` from READY production deployment
`dpl_9kyjAskSc3UCrS3RSgGjp8GsmgSQ` in Mumbai. Both provider source metadata
fields and the public alias match. One deployment was used; later changes are
verification records and a load-evidence filename fix, with identical app bytes.

- [50 natural solo matches](production.json): all 25 multiplayer formats on phone
  and desktop; 2,642 commits, including 1,347 bot moves. Results/history/profile,
  rematch, same-group changes, recovery and closure passed for every game.
- [Human/private-access smoke](human-smoke.json): all 26 opening paths,
  retry/conflict/refresh and private views. A member received Broadcast chat;
  an outsider's subscription and room read were denied. A separate AI-enabled
  check saved one fresh Tarot reading and verified identical reload data.
- [50-room live load](production-load.json): every action committed and observer
  synchronized through private Broadcast. Action p95 936ms; observer snapshot
  p95 941ms. All test memberships/channels closed.
- [Deployment/artwork checks](deployment.json): 26 games/25 bot capabilities,
  all 54 licensed card faces, original/Tarot atlases, and hosted auth/dev boundaries.
- [Error scans](observability.json): zero runtime errors or request 5xx, complete
  pagination and no excluded intervals over the serving verification window.
- [Final owner preservation](owner-final-preservation.json): all preexisting
  account/profile/identity/three-room fingerprints unchanged; the additional
  owner-created room remains intact.

Word Agents uses a finite clue vocabulary and party bots use simulated responses.
Blackjack's minimum solo table needs only its required automated dealer. These
limits are explicit; completion counts are separate from exhaustive rule proof.
The [245-face visual review](../card-inventory-2026-11-01/README.md),
[all-game table audit](../table-refresh-2026-11-01/README.md) and
[actual compact flow](../compact-live-2026-11-01/README.md) retain reviewed images.

## Canonical card-face inventory

[card-faces.json](card-faces.json) is this release's frozen inventory and
contains only public deck definitions: all
54 classic Uno and68 No Mercy faces, plus56 classic Deal and67 No Mercy faces
including every legal property orientation. Semantic duplicates across physical
copies are removed; distinct wild properties are retained even when their
current orientation matches. Additive `colors`/`effect` fields preserve printed
property/rent colors and action identity. No match, player or randomness data is
included. Six metadata regression cases and the affected engine/family suite
pass (170 cases); generated contract verification also passes.

Regenerate the current Storybook inventory at
`apps/web/src/stories/generated/card-faces.json` with
`backend/.venv/bin/python scripts/export_card_faces.py`. Use the same command
with `--check` for read-only drift detection; the named `contracts` group runs
this check automatically. The exporter removes physical copy duplicates while
retaining every permitted orientation and semantic action. Changes to canonical
decks or public card fields require regenerating the inventory and reviewing
their artwork coverage; the exporter does not change dated release evidence,
OpenAPI or room fixtures.
