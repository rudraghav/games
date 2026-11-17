# Current app audit — 17 November 2026

Baseline: clean main `3be4108`, following application `0840f8b`. This review checks
current rendered behavior instead of carrying forward historical findings as facts.

**Released:** application `65de79752ae2bf2075f561f7b57425e51b81b4af` is pushed to
main and live at [Games](https://games-seven-black.vercel.app). Deployment
`dpl_3aLSUJHLn5STFeHttnT5NRHwG84U` is READY, production, bom1; the canonical
alias and both source metadata fields match. The final test/documentation commit
does not change runtime inputs and does not trigger another deployment.

## Reproduced and repaired

- Room connection: a Deal move panel outside the inert table could queue a new
  move while the browser was offline. Every table now receives a local pause,
  with a second network guard at submission. Draft choices survive reconnect;
  the authoritative cached room and actual saving state remain separate.
- Uno and No Mercy: a rejected save cleared the selected card. Keep the draft
  until a saved version advances, so retry, refresh and explicit changes work.
- Gem Market: uneven atlas packing leaked neighbouring buildings into card art;
  exact subject rectangles and equal art/title/cost rows restore complete art and
  visible costs/actions at narrow and wide sizes.
- Word Agents: six-letter words could split as five letters plus one on phones.
  The existing soft-hyphen strategy now includes the midpoint.
- Party covers: both illustrated cards, including Hot Seat's A/B choices, remain
  inside narrow catalogue posters.
- Trio: the viewer's active seat now says “your turn”.
- Tarot: corrected Six of Wands and Four of Pentacles art, with original masters
  retained and final symbol counts/crops checked separately from generation.
- Hosted core-flow verification now uses the actual browser session for its API
  readbacks; the previous raw request stopped after refresh with Session required.

## Coverage and evidence boundaries

The family notes describe all 27 games: [cards/casino](cards-casino.md),
[boards/modern](boards-modern.md), [party/words/Tarot](party-words-tarot.md), and
both Deal editions below. Visual inspection, deterministic fixtures, actual
saved actions and hosted proof are distinct. This is not a claim to have played
every possible match or proved every combinatorial state.

Both Deal editions: reviewed the current real-size card hand and move panel in
an actual saved bot room. Manually reproduced the offline queued move, then
confirmed the corrected disabled panel after a fresh page load. The saved
crowded-action suite checks both editions at desktop and phone sizes with four
independent human sessions: the portalled confirm disables offline, another seat
observes no version change, reconnect preserves the draft, explicit confirmation
sends the exact legal payload once, and refreshed public assets agree.

Twenty Deal fixture browser cases passed: 13 own/opponent collections across
multiple rows, bank counts, inspection/focus, steal response, card destinations,
swap/bank cancellation, counter-counteraction, payments/overpayment, private hand
projections and pending/paused controls at 320/390/768/1440. These fixtures are
not saved-game proof; saved ordinary actions and recovery are described above.

Root local saved suite: 4 passed (both projects): crowded actions plus independent
guests creating, joining, chatting, playing, refreshing and changing games.
Family notes contain their focused check counts. Final named verification and
release evidence are recorded below.

## Release preparation history

The following observations were recorded before release; the final result below
supersedes their pending deployment and verification status.

Production inspection still serves application `0840f8b`, deployment
`dpl_PXue8sGehJHii1PAa93MzTVKv7qi`, READY, production, bom1. Its canonical alias
and both source metadata fields agree. Production database checks initially
failed: the project hostname did not resolve and the pooler was unavailable.
The owner signed into the exact dedicated Games dashboard; it now reports
“Coming up...”. No reset, credential change or substitute project was used.
Local PostgreSQL was also stopped at startup; the existing games-postgres volume
was restarted intact. Existing web3217/API8217/Storybook6105 services remain.


The dashboard subsequently reported restoration complete. Fresh dedicated-project,
anonymous-auth/signing-key/pooler and production Alembic/drift/private-grant checks
passed on 17 November. The existing owner account and six rooms were fingerprinted
before release. No production application deployment has occurred yet.

The build's security gate identified an affected Next version. See
[framework investigation](framework-security.md). Next and its ESLint config are
now pinned to16.4.5; React remains19.3.1. The lockfile changed only the compatible
Next dependency family. Production dependency audit now reports zero advisories;
two moderate development-only glob/minimatch advisories remain documented because
fixes cross Storybook's declared dependency ranges. The local web service was
restarted on its existing3217 port to load16.4.5; API/Storybook/database remain.
The first integrated browser run passed63 cases and skipped one desktop case
that is intentionally phone-only; its task report was inconclusive because docs
changed during the run. Final verification is repeated after the framework patch
and a source freeze, preserving the earlier evidence rather than relabelling it.


Patched-runtime browser gate: **63 passed, one intentional desktop skip** (the
case is phone-only), with stable source provenance. The final artwork unit check
also exposed a whitespace-sensitive Markdown inventory parser after table
formatting; it now accepts table padding while still requiring all40 ranks and
exact symbol counts. This is a test-only parser correction. Final frontend,
contract and tooling gates follow it; the tested browser runtime is unchanged.

## Final verification and cleanup

- Frontend, contracts and tooling passed on stable source: types, lint, **235
  unit tests**, Next 16.4.5 production build, 488 canonical card faces, 48
  attributed Tarot portraits, 24 Deal scenarios, 259 legal projections across
  27 games, dependency boundaries and 44 workflow tests. Report:
  `verify-1061a207a5134a3992ccbfcb1a6fd30a`.
- The nine-file browser gate passed **63 cases**, with one intentional desktop
  skip for a phone-only case. Report:
  `verify-3b8c7ff254ce4370842101b861d79e99`.
- Final Uno harness verification passed all **8 cases**, including desktop and
  phone saved retries, on stable source. Report:
  `verify-59771a4f45834e15a9f6077558b03216`. Local-only fixture hooks are scoped
  separately so the saved test runs against production. A naturally drawn card
  exposed a test locator assumption: it now accepts the “just drawn” suffix and
  indexes only playable duplicates. Cleanup has its own 45-second budget and
  records room creation/join responses before later assertions. This changes
  tests only; the application behavior had already passed hosted verification.
- **Seven hosted checks passed:** core guest flow on desktop and phone; crowded
  phone actions and offline Deal recovery; Uno/No Mercy failed-save retry; Gem
  Market saved moves; catalogue artwork bounds; and Tarot asset delivery/crops
  at 320/390/1440. The new WebP bytes exactly match committed files.
- Public boundaries passed: homepage and 27-game catalogue return 200,
  unauthenticated account returns 401, and production dev-session/design routes
  return 404. Dedicated-project auth/signing-key/pooler and no-op production
  Alembic/drift/privacy checks passed at head `a6e442b15d80`.
- Six hosted QA rooms are closed with zero active memberships. Owner account,
  profile, six existing rooms/memberships and identity fingerprints are unchanged.
  Runtime warning/error/fatal and HTTP 5xx queries returned zero records from
  06:08:05 to 06:13:32 UTC, with complete pagination and no excluded intervals.
- A local Uno test timeout left one task-owned QA room. It was closed through
  authenticated abandon/leave endpoints; readback returned 404 and confirmed
  closed/zero active members, preserving its match and receipt. Successful test
  rooms use the same normal cleanup path. No production recovery write was needed.
- Removed only task-owned superseded scratch: root 363,555 bytes, cards/casino
  9,348 bytes and party/art 6,162,627 bytes. Retained useful captures, original
  artwork, user data, credentials and history. Test browsers are closed; existing
  web 3217, API 8217 and Storybook 6105 remain healthy. The original local database
  volume is intact. Private receipts remain in ignored `.vercel` files.
- All 565 runtime inputs retain fingerprint
  `2c67f0c6ed749f9cd2287816c1c9b983e666302ba989db38dc7761ab3e38b88d` through
  verification, deployment and the final test/documentation changes. There is
  no Git-triggered deployment or GitHub workflow for this repository; local
  named checks and hosted behavior provide the release evidence.

Production dependency audit reports **zero advisories**. Two moderate
development-only Storybook glob/minimatch advisories remain; see the
[framework record](framework-security.md). Coverage is bounded by the family
notes: this review does not establish every possible full match, native-touch
device behavior or a screen-reader study.
