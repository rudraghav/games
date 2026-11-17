# Tarot reference expansion and complete reading flow

17 November 2026. User authorized improvements, initially beyond 1,000 references,
then expanded the scope to over5,000 recognizable references with nuanced matching,
Indian/regional cinema and bounded familiar mythological figures. Strong names
require image repair or a labelled original illustration, not exclusion solely
for an unavailable first image. Testing, push and production release remain
authorized. Starting main: `197b0f8`; serving application
before this work: `65de797`, deployment `dpl_3aLSUJHLn5STFeHttnT5NRHwG84U`.

## Implemented behavior

- Broad source-linked people and fictional-character library, retaining the original
  48 identities and their exact character art. New public image manifests bind
  canonical identity, article, source file, attribution and image bytes.
- Local semantic retrieval compares the optional question, card meaning and spread
  position with sourced public work, stories or symbolism across the full catalogue.
  Shortlists preserve strong matches while diversifying identities and families.
  Requests reduce from six to four, three or two candidates per card to retain
  the existing budget; the private question is encoded once in memory, without
  another provider call, query cache or new storage of birth inputs. The generation
  model remains unchanged. One meme may be offered when its scene is a strong match;
  the reading contract requires sensitive questions to omit humour.
- Exact people, characters, religious depictions and meme scenes share a canonical
  identity contract. Original illustrations and attributed artwork references have
  explicit visible labels; scenes and works use larger responsive presentation.
  Tarot's expanded reference data loads with Tarot instead of all game tables.
- Private `/readings/[matchId]` archive, linked from Profile history, retaining the
  exact question, selected cards, original analysis and optional charts after a
  new spread or room closure. Historical text is not rewritten or regenerated.
- Astrology remains off by default, with Western, Vedic and Both selection,
  preview, show/hide, retry/opt-out and ephemeral raw birth fields.

## Evidence boundaries

[Archive checks](archive.md) use constructed results in guarded local saved rooms;
[analysis checks](analyses.md) distinguish synthetic UI cases, direct provider
outputs and hosted generation. [Historical portrait review](royalty-review.md)
records exclusions and the limits of historical depictions. The final reference
receipt will record accepted totals and source/crop review.

A canonical source association and decoded file do not by themselves establish
portrait accuracy. Every acquired sheet is visually inspected for wrong subjects,
groups, collages, diagrams, logos and illegible framing. Ambiguous first-choice assets are
held for source repair, a documented work or a labelled original illustration;
focused crops retain the original subject. Group entities cannot masquerade as
one individual. Editorial exclusions and identity repairs remain in the audit. Historical paintings and
statues are depictions, not asserted lifetime photographs.

## Release preparation

The production target remains the dedicated personal Games project. A fresh alias
readback confirms the baseline deployment. Existing owner identity/profile/rooms
have a private before-state fingerprint. Production auth/signing keys/session
pooler and no-op Alembic/schema/RLS/privacy grants passed. No new application push
or deployment has occurred at this checkpoint.

Final named local gates, bounded real analysis evaluations, release SHA/alias,
hosted saved readings, runtime logs and cleanup receipt follow after source freeze.

## Local gate and publication boundary

The final local gate passes with a complete stable fingerprint:241 frontend,
6542 backend,181 persistence/privacy and44 workflow tests, types/lint/build,
generated contracts and5636 reference/image/index checks. The42-case responsive
archive/browser report also passes. Production no-op schema/privacy checks pass.
These do not establish production packaging or generation quality.

The recent provider window returned five consecutive high-demand503 responses,
including a deliberately tested alternative model. Sensitive-tone evaluation
remains unresolved, so the expansion is prepared as a review-branch publication;
production remains on the original release. See [analysis evidence](analyses.md).
No hosted expansion reading or deployment has been attempted.

The pinned Linux runtime wheels plus backend source total336,003,480 uncompressed
bytes before provider overhead. Current Vercel Python documentation specifies a
[500MB limit](https://vercel.com/docs/functions/runtimes/python#controlling-what-gets-bundled).
Local macOS first request preparation measured0.273s versus0.125s warm, with
offline model loading. These are packaging estimates/local timings, not hosted
proof. Detailed wheel hashes and receipts remain in the task's retained scratch.

Cleanup review identified307,087,495 bytes of matching stage/crop copies and
regenerable previews. They remain until release because the task is unfinished.
Original generated artwork, source caches, recovery copies and review evidence
are protected. Existing development services and user browser are preserved.
