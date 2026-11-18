# Game entry release — 18 November 2026

Application `1fb6e0dc3eca3a609635699633bf9f98bd30b5ae` is live at
https://games-seven-black.vercel.app. Deployment
`dpl_D68UtvJJ25VQJctymryg33oYN9y5` is READY in bom1; Git source metadata and the
canonical alias agree. One production deployment was created. The following
closure commit changes documentation only and does not require another rollout.

All 27 games have public named pages. Tarot and bot play start without room
setup; friends choose a game before creating an invite lobby. Existing profiles,
server-owned cards, private sessions, old links and saved archives remain intact.
Launch retries recover the original match. A reviewed profile-query race was
fixed using the existing cancellation and authoritative refresh helper.

## Local verification

- Frontend: types, lint, 251 tests and production build pass on final runtime.
- Backend: lint, types and 6948 deterministic tests pass.
- Persistence/privacy: 219 tests pass, including 36 quick-play cases.
- Contracts: generated OpenAPI, catalogue, wire types and asset checks pass.
- Tooling: import boundaries and 44 workflow checks pass.
- Browser: 61 cases pass in the main run, with one deliberate desktop skip.
  Two obsolete menu-label assertions were repaired; both pass in a separate
  six-case rerun, which also checks ordinary and Both astrology presentation.
  Six phone WebKit cases pass. This totals 73 verified cases, including the reruns.

The first combined ownership report is inconclusive because frontend/test/docs
source changed while it ran. Its backend, persistence and contract inputs stayed
unchanged. Final frontend and tooling reruns have stable passing reports. This
record does not recast the original failed/inconclusive runs as clean passes.

## Live verification

Every public game page returns 200 and its intended action. Actual browser checks
on the serving release pass at 320px and 390px: first-time Guest Tarot start,
three selections, identical saved cards/match after refresh, old room-link
redirect and home resume. A returning player keeps their profile during direct
bot start; a human move receives a bot response. Friends create from the chosen
game, join by invitation and start from separate sessions. Outsiders receive
404 for rooms/readings and unauthenticated room reads receive 401 without private
content. Six inspected captures show bounded, aligned layouts and usable actions.

No AI generation was performed for this navigation release. Local constructed
reading/astrology cases test presentation and private archives; previous real
provider reading evidence remains in the Tarot expansion release record.

The complete deployment log window contains zero runtime warning/error/fatal
records and zero HTTP 500+ records. Production schema matches reviewed head
`a6e442b15d80`, all eight private tables use RLS, and all 112 grant checks pass.
The permanent owner's identity, profile, rooms and memberships match the fresh
pre-release fingerprint. No provider, environment or schema settings changed.

## Cleanup and retained evidence

All 72 local task-period test rooms and four exact hosted QA rooms are closed.
The one interrupted local fixture was recovered through its captured owner;
unrelated room/member rows remained unchanged. Four hosted browser contexts are
closed. Web3217, API8217 and Storybook6105 remain available. Removed 3.5 MB of
superseded task captures; final screenshots, necessary failure evidence and
scoped receipts remain ignored under `output/game-entry-20261118`,
`output/playwright/game-entry-hosted-20261118-*` and `.vercel`.

Runtime fingerprint across 6186 files:
`4d6d9de735ef16a2dc34e4c888e8b42cc2655aec691bc5098ab19987c887da88`.
The previous application `14e5cfa00864a8d71ff77111980c27eca0750d88` remains the
rollback reference. Machine-readable public release facts are in `production.json`.
