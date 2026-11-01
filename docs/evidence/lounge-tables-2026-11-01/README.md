# Dashboard, casino tables, Shithead and Tarot — 1 November 2026

Rooms remain private and invite-only. The member dashboard has compact search,
player/category filters, solo intent, safer pasted invite handling and active-room
shortcuts. All 27 covers were reviewed at 320/390/1440px.

Casino tables animate only real committed public actions and newly permitted
cards. Fresh snapshots and restored motion cannot replay earlier moves. Local
licensed photos cover all 48 new Tarot reference choices; all 78 original card
illustrations remain. Shithead adds a full 2–5-player game with a non-LLM bot.

## Local release evidence

- 718 deterministic backend cases; Python lint/types; 133 isolated multiplayer
  cases; fresh migration/drift/private-grant checks; generated contracts and
  module boundaries pass. No schema migration or auth-setting change is needed.
- 84 frontend units, workspace/browser types, lint, Next production and Storybook
  builds pass. The regular browser run passed 96 cases; one obsolete 52-fixture
  expectation failed after adding Shithead. It now derives 54 from the catalogue;
  both complete table-density and casino layout cases pass on both widths (4).
  The 17 opt-in cases were skipped deliberately and relevant ones ran separately.
- Six complete actual-room casino solo matches, four Shithead human matches
  (2/5 players × phone/desktop), two Shithead solo matches and two real-AI Tarot
  matches pass: results/history/profile, rematch, switching games and closure.
- Focused private-entry, cover, motion/reduced-motion, and Tarot portrait/credits
  browser checks pass. The motion regression finishes inside the transient-event
  lifetime so it cannot pass merely by waiting for expiry.
- Local 50-room load: action p95 388ms, snapshot p95 223ms; bot-drive p95 512ms,
  bot private snapshot p95 307ms. These are local measurements, not hosted claims.
- Personal Games cloud, current Alembic head a6e442b15d80, schema drift and grants
  verified. Owner account/profile/identity/four rooms fingerprinted before release.
  Rollback is dpl_9kyjAskSc3UCrS3RSgGjp8GsmgSQ, application source b4506a2.

The new prompt's fixed samples validated in 26.67–28.89s. A 30s provider timeout
also occurred in a real phone request. Tiny/full controls both took about 27s;
schema/effort changes did not demonstrate a fix. The model/effort remain unchanged,
with a 45s per-request cap inside the existing 60s total budget. Two final actual
client readings passed on their first attempts. Provider outages remain possible;
failed spreads stay saved for an explicit retry.

## Owning evidence

- [Dashboard and covers](../dashboard-2026-11-01/README.md)
- [Casino motion and actual rooms](../casino-motion-2026-11-01/README.md)
- [Shithead rules and complete matches](../shithead-2026-11-01/README.md)
- [Tarot photos, licenses and UI](../tarot-portraits-2026-11-01/README.md)
- [Tarot latency controls](../tarot-latency-2026-11-01/README.md)

## Production verification

The final [production deployment](corrective-deployment.json) is READY in Mumbai:
`dpl_JB1s7UJpd8qxvK8P4a65phGGSb96`, application source
`02ff60357e9165c51afdda952eef7a83f3a72af3`. Both provider SHA fields and the public
alias match. The initial [deployment](deployment.json) remains recorded separately.
Its hosted checks discovered that root image-optimization URLs returned404 while
the originals returned200. One focused corrective deployment now delivers the
already bounded WebPs directly. No auth, environment, schema or engine change
was made in that correction.

- Six hosted dashboard/private-room cases, six natural casino solo matches, and
  four Shithead human matches at2/5seats pass. Their source is the initial c1169d2;
  [runtime parity](runtime-parity.json) proves the correction changes only the
  Tarot reading component. Those dashboard, casino, Shithead and backend inputs
  remain byte-identical, so their passing checks were retained.
- Final real-AI Tarot matches pass on desktop36.8s and phone28.6s, including every
  portrait decoded, normal/quirky/character layers, identical refresh readback,
  saved/profile results, rematch and group retention. Both test rooms closed.
  [Desktop](../tarot-portraits-2026-11-01/production-desktop.json) and
  [phone](../tarot-portraits-2026-11-01/production-phone.json) retain safe summaries.
- [HTTP checks](hosted-http.json) verify121 paths:27games/26bot capabilities,
  48photo checksums,54licensed card faces and original artwork. Unauthenticated
  profile reads return401; hosted dev/design paths return404.
- [Fifty private rooms](production-load.json) all committed/synchronized through
  private Broadcast and closed. Under concurrent release-browser traffic,
  action p95 was2535ms and observer snapshot p95 was2680ms. This ran on c1169d2;
  the backend is unchanged in the correction.
- [Final log scans](observability.json) cover the serving revision's checks with
  complete pagination, no excluded intervals, zero runtime errors/warnings and
  zero request5xx. The initial rollout's one provider ReadTimeout is recorded
  separately and is not hidden by this final-revision scan.
- [Owner preservation](owner-preservation.json) confirms the Google account,
  profile, identity, four rooms and memberships are unchanged, schema head
  a6e442b15d80. No provider keys, sessions, invites or private hands enter evidence.

One phone attempt stopped at guest-session creation after many test signups;
this was separate from Tarot generation. The focused harness now starts with
the selected largest-capacity game and creates one guest for solo Tarot. Its
first version incorrectly waited for a lobby code after Tarot auto-start; that
test was interrupted and its one exact owned room closed through RoomService.
The corrected solo flow passed. No sign-in rate limit or auth boundary was relaxed.

Final cleanup preserves all requested local services, user sessions, source,
credentials, databases, original artwork and the complete license ledger. The
release records remain distinct from exhaustive rules or provider-uptime claims.
