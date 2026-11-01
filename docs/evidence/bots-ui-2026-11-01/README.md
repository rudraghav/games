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
builds and production results are recorded separately as the release closes.

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
