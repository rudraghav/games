# Verification and release

Use `python3 scripts/verify.py --list` for the named check groups. The runner fails
on a missing prerequisite; it never substitutes a tooling PASS for product proof.

| Group | Coverage |
| --- | --- |
| frontend | TypeScript, lint, frontend contract/card checks, Next production build |
| backend | Python lint/types, engines, special cards, complete legal scenarios, Tarot adapter |
| contracts | Actual OpenAPI/catalogue and generated wire-type drift |
| migrations | Fresh isolated local database upgrade, drift, RLS/public grants |
| multiplayer | Room membership, hidden hands, simultaneous moves, retries, reconnect, hosting, invites, saved readings |
| browser | Independent guest sessions, chat, move/refresh/game switch; phone/desktop; 28 min/max table scenarios; Tarot picks and expansion controls |
| tooling | Game/feature/shared-UI import boundaries |
| load | 50 simultaneous local private rooms, committed action and snapshot latency |

Database checks create a random `games_verify_*` database on the dedicated local
server, apply the reviewed Alembic history and remove only that exact database.
They refuse non-local database hosts. They never reset the development database.

Browser checks require the Games development services on 3217/8217. Install the
official browser runtime with `PLAYWRIGHT_SKIP_BROWSER_GC=1 pnpm exec playwright
install chromium`; preserve other projects' browser caches. Success traces are
disposable; retain concise evidence and failure traces needed for open issues.

## Current release verification — 1 November 2026

The owner requested main/production, then complete-match/rule verification,
Tarot reliability repairs and expansion. Production uses the existing dedicated
Games Supabase data and stable encryption identity; local verification remains
isolated. Google signup and guest-preserving linking passed live consent/callback
and scoped player/room readback in the preceding production release.

The catalogue now contains sixteen experiences. The owner explicitly approved
the labeled Deal No Mercy Games house inventory; no unverified claim to Hasbro's
printed money multiplicities is made. See [the rules audit](RULE_AUDIT.md) and
each module's canonical sources, table choices and expected-outcome tests.

Named frontend/backend/contracts/migrations/multiplayer/tooling/local-load groups
passed after the rule/Tarot work. Phone/desktop catalogue/board workflows passed
six checks; the existing regression suite passed sixteen and the new table
usability suite passed four. All 32 generated min/max table scenarios fit each
viewport. The root journal records final-source reruns and exact counts.

Local acceptance reached 54 distinct full-match seat/viewport cases, including
two real saved Tarot readings. Final-source Deal cases were rerun after the
house-version and large-payment fixes. Thirteen frontend tests, 285 backend tests,
43 isolated multiplayer checks and four transport/privacy checks passed. See
`docs/evidence/release-2026-11-01/local.json` for metadata-only per-game results.

Complete matches are an explicit long-running acceptance run:

```sh
GAMES_FULL_MATCHES=1 GAMES_TEST_AI=1 pnpm exec playwright test tests/browser/fullmatches.spec.ts --output=output/playwright/fullmatches
```

The harness reuses ten independent player sessions, exercises each distinct
minimum/maximum seat limit, naturally reaches results and clicks rematch/change
game while preserving the group. Bulk moves use the authorized API, not private
engine-state injection. Tarot needs `GAMES_TEST_AI=1` for real generation; Rummy
browser drops and separate conserved declaration fixtures are distinguished.
Use `GAMES_FULL_MATCH_GAME` for a focused retry of comma-separated game IDs and
`GAMES_FULL_MATCH_SEATS` for a specific player count. The helper sanitizes
transport/cookie-decoding failures so test reports never echo authentication.

After the single production deployment, repeat with
`GAMES_TEST_URL=https://games-seven-black.vercel.app`, then run private Broadcast
authorization and the explicit fifty-room load check:

```sh
GAMES_TEST_URL=https://games-seven-black.vercel.app GAMES_LOAD_ROOMS=50 node scripts/check_hosted_load.mjs
```

The load tool measures real committed actions, private Broadcast arrival and
authorized observer snapshots for fifty simultaneous rooms. Polling is a
separately labeled fallback, never called Broadcast proof. It closes only its
own memberships and keeps all saved history. Results, latency and cleanup counts
are retained without tokens, invite codes or hidden cards.

The repaired Tarot provider contract passed six fresh non-personal strict-schema
evaluations first attempt (2.24–4.15 s). Malformed/truncated/incorrect-card output
has one budgeted regeneration at most. Quota/auth/transport/safety failures do
not loop or save invented output. Final real browser/persistence and production
checks must pass before closing this release.

## Historical baseline evidence and limits — 31 October 2026

- Google account connection is implemented locally: regular OAuth for a fresh
  visitor, manual linking for saved guest/email players, explicit existing-account
  choice, and private relative callback redirects. Six focused auth checks plus
  the original four frontend tests pass; phone/desktop callback-cancel checks
  preserve the same saved player. Live provider configuration and consent remain
  pending Chrome access; do not call Google signup enabled until that passes.

- Next production build, frontend types/lint and Storybook build have passed.
  Rerun affected checks after subsequent changes; the journal records the latest run.
- The current backend group includes 132 engine, complete-scenario, Tarot adapter
  and identity checks. Local identities are rejected in hosted/preview settings;
  hosted JWT verification checks issuer, audience, signature, expiry and subject.
- Viewer/legal-action engine scenarios complete all thirteen competitive games at
  minimum and maximum seats. Rummy's generic scenario uses legal drops; specific
  declaration/meld tests cover validation separately. This is not exhaustive rule proof.
- Six phone/desktop browser workflows passed, including 28 generated table
  scenarios per viewport, an independent two-player room flow with a move,
  chat/refresh/game switch, and a saved three-card Tarot spread.
- Eight additional phone/desktop expansion workflows passed: Four in a Row
  reaches results, Reversi flips discs, Word Agents keeps the spymaster key private,
  and Gem Market accepts resource selection. Card cost bounds are checked in the
  gallery so generic phone sizing cannot silently clip development-card contents.
- The personal Mumbai preview passed an all-14-engine hosted smoke with four real
  Supabase guest identities reusing one room. Start/action/idempotent retry/stale
  conflict/refresh passed for every engine, plus role privacy and saved real Gemini
  output. This checks opening actions, not complete browser matches for all games.
  HTTP checks confirm all four static WebP atlases return images, unauthenticated
  profile access returns 401 and hosted local-identity creation returns 404.
  Actual phone/desktop home screenshots show the Tarot artwork without page overflow.
- Final preview: `dpl_CiiSDEFqQgpRcg93CG7xeng8JvMR`, Ready/preview, both runtimes
  `bom1`. Private Broadcast delivered an actual revision event and rendered chat
  in a second phone browser; a nonmember's subscription and API room read were
  rejected. The receiver test understands the current SDK's binary broadcast
  envelope and records no payloads, tokens or socket frames.
- A repeated real AI call on the final preview returned 502 after two schema
  validation errors. No malformed reading was saved. Earlier hosted generation
  and saved-reading refresh passed with identical backend code. Do not treat that
  small successful sample as a provider reliability guarantee. The separate
  failure/retry tests confirm saved cards and successful retry persistence.
- The local 50-room run measured action median 535 ms / p95 606 ms, and snapshot
  fetch median 281 ms / p95 337 ms. These are local in-process HTTP/database
  measurements, **not** deployed Broadcast or internet synchronization latency.
- The dedicated free-tier Gemini key passed authentication/model discovery and
  three fixed real-provider schema/editorial evaluations (2.57, 2.45, 2.14 s).
  A real browser reading remained identical after refresh and an API process
  restart; the saved result fit a 390px phone viewport without page overflow.
  One earlier app attempt was rejected before persistence and recovered on
  retry with the same spread. Counts-only failure diagnostics and an isolated
  failure/retry/privacy regression check now cover that path. This small live
  sample does not establish universal generation reliability.
  The free-tier disclosure passed phone/desktop browser checks. Configuring
  `TAROT_API_TIER` controls the notice, not Google's actual billing or quota;
  it must match the key's project.

## Historical pre-production checklist — superseded by the release run above

1. Verify the No Mercy Deal edition's complete printed inventory and values with
   canonical publisher/physical-deck evidence; finish action-specific edge coverage.
2. Complete optional email ownership confirmation. Private Broadcast membership
   authorization/delivery, independent real guest sessions, preview database migration,
   schema drift, RLS/grants, anonymous sign-in settings and public signing keys passed.
3. Complete every game through browser results/rematch at minimum and maximum
   player counts; cover crowded layouts, long names, keyboard and reduced motion.
4. Keep the active provider data-use policy visible, preserve the reviewed live
   evaluation, and resolve the remaining intermittent response-validation failures
   before declaring AI reliability production-ready.
5. Repeat the 50-room scenario against the hosted preview, recording action and
   synchronization latency and rechecking state after a deployment/restart.
6. Provision isolated production data, run migration/schema and production build
   gates, then use one intentional deployment path. Verify the actual rollout and
   a live multiplayer smoke test before calling the release complete.

## Historical preview hosting configuration

The personal `rudraghavs-projects/games` Vercel project is linked. Its preview has
the working free-tier Gemini key as a Secret, model/tier as Config, and development auth disabled.
Database/auth settings are configured for preview only. The repo's `vercel.json` defines web
and backend services; only the web service has public ingress. Bindings supply
the internal backend URL at runtime. Do not create a second deployment path or
reuse another product's database/key. Reviewed Alembic migrations are the sole
application schema history.

`backend/.venv/bin/python scripts/configure_preview.py --refresh-ai` updates only
the explicitly linked personal Games preview AI settings. It checks the signed-in
account and linked project and refuses shared/branch-specific entries before any
write. Values enter the CLI through stdin. No deployment is triggered.
