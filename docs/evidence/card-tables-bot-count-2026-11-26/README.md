# Card tables and bot count release — 26 November 2026

This release covers one-tap ordinary card plays, tighter phone hands across the card tables,
and a bot-count picker for quick play. A Codex chat started the work, and the owner handed it
to the Claude chat on 26 November 2026 to finish and ship.

## Release

- Application commit `3fc3cf3ac1e820ec1aa1914e42b64dca2b3c0212`, pushed to `main`.
- One production deployment, `dpl_2dCR7bBNussjGgRLYnAGDk4t3AJV`, READY in bom1 and aliased to
  https://games-seven-black.vercel.app. Both source metadata fields match the commit.
- No migration.

## Local checks

- verify frontend, backend, contracts, tooling, multiplayer and migrations passed
  (`verify-39dfd92aad134642823db467e7635109`). After the fixes, frontend, backend and contracts
  passed again (`verify-cdb0e75983a2494e83466f9f45797507`).
- Whole browser suite after the fixes:
  - desktop: 260 passed, 59 skipped
  - phone: 295 passed, 22 skipped, 2 failed. The 2 were a `page.goto` failing with
    ERR_NETWORK_IO_SUSPENDED and a Tarot availability wait. Both passed 6/6 with
    `--repeat-each=3`.
- The first run had 9 phone failures:
  - 5 came from the local API still running code from before the change. It rejected
    `bot_count` with 422, and a restart fixed them.
  - 4 were real and were fixed before release:
    - the Uno fan step went from 44px to 45px
    - the hand heading keeps its arrow space while the fan is used
    - the Shithead phone setup has more room between cards
    - the Inspect-first effect test was rewritten for one-tap play

## Live checks

- `check_hosted_http.mjs`: exit 0.
- `hosted.spec.ts` (desktop) against production passed for all 34 games, in 2.2 minutes.
- On production, choosing 3 bots for Uno opened a 4-seat table with 4 players. The test room
  was closed afterwards.
- Production runtime and request logs, 16:09–16:17 UTC: 0 errors and 0 5xx.
- QA readback: test rooms closed and 0 active memberships. Owner data and runtime
  fingerprints are unchanged.
