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

This record currently describes local acceptance. Production state will be
recorded after the single deployment and fresh hosted verification.
