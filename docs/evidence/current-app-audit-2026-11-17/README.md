# Current app audit — 17 November 2026

Baseline: clean main `3be4108`, following application `0840f8b`. This review checks
current rendered behavior instead of carrying forward historical findings as facts.

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
release evidence will be appended after the source is frozen.

## Current release status

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
