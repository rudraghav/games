# Parlour games release — 26 November 2026

Housie, Liar's Dice, Bluff and Truth or Dare (friendly and 18+ editions), 30 → 34 games.

## Release

- Application commit `a33ab04148a110dfe9045d6e190c230015827102`, pushed to `main`.
- One production deployment, `dpl_8tw3XV5R4HhdQrzxpoDvbTkZqVko`, READY in bom1, aliased to
  https://games-seven-black.vercel.app; both source metadata fields match the commit.
- No migration; production Alembic head stays `3002383be1bd`.

## Local checks before release

- verify backend+contracts+multiplayer passed (`verify-1301060c7dec45d1bb82849a7d79bd4c`).
- verify frontend+tooling+migrations passed (`verify-68c543f4cc7c4995866b62bf95b2cdd6`).
- Whole browser suite after the fixes: desktop 257 passed / 58 skipped; phone 291 passed /
  22 skipped / 2 failed. The two (tutorial-depth boop and shithead) failed while the laptop
  slept on a flat battery mid-run, then passed 8/8 with `--repeat-each=4`.
- Gated runs for the four games: fullmatches 1/1, solo-bots 1/1.

## Live checks

- `check_hosted_http.mjs`: exit 0; `/api/backend/v1/games` lists 34 games, 30 with bots.
- `hosted.spec.ts` (desktop) against production: passed in 2.0 minutes. Every one of the 34
  games ran create, start, action, retry, conflict and refresh. Housie tickets, Bluff hands
  and Liar's Dice dice appeared only in their own seat's projection, and no call order,
  roll, deal or pile left the server.
  - The first two runs stopped at Pop Tarot. The spec still waited for `.table-announcement`,
    which the Tarot table no longer has. The wait now uses `.tarot-table` for Tarot.
- Production runtime and request logs, 03:49–03:58 UTC: 0 errors, 0 5xx.
- QA readback: the release's test rooms are all closed, with 0 active memberships.
- Owner account, profile, rooms, memberships and identities: fingerprints and counts unchanged.
- Runtime fingerprint unchanged (6360 files).

## Known limits

- The 18+ gate is a UI gate. A joiner's room projection carries the current naughty prompt
  before they tap Continue.
- The naughty deck is flirty and stays clear of sex acts and nudity, pending the owner's call.
- Not checked: the phone project of `hosted.spec.ts`, and the craft check at 768 and 1024 widths.
