# Verification and release

Latest Deal/table redesign verification is recorded in
`evidence/deal-redesign-2026-11-02`, `evidence/gameplay-2026-11-02` and
`evidence/card-workspaces-2026-11-02`. It includes all27initial-table reviews,
281named/special card faces, exact Deal pile/target/payment/counter decisions,
complete minimum/maximum Deal matches, actual browser bot-driver matches and
the 50-room local load check. Historical release evidence below remains history;
the newest pushed/deployed source and hosted checks belong to `progress.txt`.

Use `python3 scripts/verify.py --list` for the named check groups. For owned work, run `python3 scripts/verify.py --task TASK_ID GROUP...`; actual results and before/after source fingerprints attach privately to that task. `--json` emits a metadata-only report, while raw check output stays on stderr. Changed or incomplete source fingerprints make the result inconclusive; reports do not fingerprint secrets, dependencies or external services and never replace hosted proof. Repeat `--browser-file tests/browser/NAME.spec.ts` to scope the browser group to affected workflows; paths are validated and the exact selection enters the retained command manifest. Without explicit groups this option selects browser only. The runner fails
on a missing prerequisite; it never substitutes a tooling PASS for product proof.

| Group       | Coverage                                                                                                                                   |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| frontend    | TypeScript, lint, frontend contract/card checks, Next production build                                                                     |
| backend     | Python lint/types, engines, special cards, complete legal scenarios, Tarot adapter                                                         |
| contracts   | Actual OpenAPI/catalogue, generated wire types, canonical card faces, Tarot characters and deterministic casino playback fixture drift     |
| migrations  | Fresh isolated local database upgrade, drift, RLS/public grants                                                                            |
| multiplayer | Room membership, hidden hands, simultaneous moves, retries, reconnect, hosting, invites, saved readings, bot lifecycle/concurrency/restart |
| browser     | Independent guest sessions, chat, move/refresh/game switch; phone/desktop; 52 min/max table scenarios; Tarot picks and expansion controls  |
| tooling     | Game/feature/shared-UI import boundaries                                                                                                   |
| load        | 50 simultaneous local private rooms, committed action and snapshot latency                                                                 |

The current bot layer adds 144 policy tests, including 100 naturally completed
matches across all 25 multiplayer games at minimum/maximum seats and two seeds.
Sixty room integration cases cover one-human completion for all 25 games,
maximum-capacity starts, bot identity isolation, leases, retries, simultaneous
drivers and an actual process restart. Policy tests receive authorized views and
durable observations only. These deterministic checks are separate from the
opt-in real-client solo suite below and any hosted verification in the journal.

Database checks create a random `games_verify_*` database on the dedicated local
server, apply the reviewed Alembic history and remove only that exact database.
They refuse non-local database hosts. They never reset the development database.

Browser checks require the Games development services on 3217/8217. Install the
official browser runtime with `PLAYWRIGHT_SKIP_BROWSER_GC=1 pnpm exec playwright
install chromium`; preserve other projects' browser caches. Success traces are
disposable; retain concise evidence and failure traces needed for open issues.

## Sixteen-game production baseline — 1 November 2026

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

Production acceptance also passed all sixteen experiences across 54 distinct
phone/desktop scenarios and 2,962 legal actions, including two saved real Tarot
readings. A network-interrupted phone run was completed through a focused
same-source recovery, with task-room cleanup verified separately. Fifty hosted
rooms committed and synchronized through private Broadcast; action p95 was
977 ms and authorized observer snapshot p95 1,059 ms. Nonmember subscription/read
denial and the original owner's account/room preservation passed. See
`docs/evidence/release-2026-11-01/production.json` for exact source and per-game proof.

Complete matches are an explicit long-running acceptance run. Add `GAMES_MIDGAME=1` to inspect up to eight refreshed actor views per game/seat case, recording distinct phases/critical actions and applicable stable hand selection. `selectionStable: false` means that check was not applicable or not sampled, not a failed geometry assertion. Local `/design/midgame` separately covers 235 conserved authorized projections and critical clicks, including a legal Rummy declaration; browser full-match Rummy still draws/discards then drops.

Complete-match command:

```sh
GAMES_FULL_MATCHES=1 GAMES_TEST_AI=1 pnpm exec playwright test tests/browser/fullmatches.spec.ts --output=output/playwright/fullmatches
```

The harness reuses ten independent player sessions, exercises each distinct
minimum/maximum seat limit, naturally reaches results and clicks rematch/change
game while preserving the group. It also opens the host's rendered profile,
checks the latest room history row against the saved result and server catalogue
semantics, and records `profileHistoryVerified` for every completed case. This
distinguishes shared team outcomes, declared score units and games without point
scores before returning to the room. Bulk moves use the authorized API, not private
engine-state injection. Tarot needs `GAMES_TEST_AI=1` for real generation; Rummy
browser drops and separate conserved declaration fixtures are distinguished.
Use `GAMES_FULL_MATCH_GAME` for a focused retry of comma-separated game IDs and
`GAMES_FULL_MATCH_SEATS` for a specific player count. The helper sanitizes
transport/cookie-decoding failures so test reports never echo authentication.

Solo-bot acceptance is a separate opt-in browser run:

```sh
GAMES_SOLO_BOTS=1 pnpm exec playwright test tests/browser/solo-bots.spec.ts --workers=2 --output=output/playwright/solo-bots
```

It reuses one human guest and one group room per viewport for all 25 multiplayer games, with the
minimum required bot seats (blackjack also has its automated dealer). The actual
room client drives every bot move; the harness never calls the drive endpoint.
Human decisions use only that human's authorized projection, followed by the
normal visible-tab refresh path. Results, saved/profile history, rematch,
and same-group game changes are checked for each game. The shared room closes
after the selected catalogue finishes, with a fresh unreadable-room check;
reusing the room respects the existing twelve-creations-per-hour limit.
The initial UI scenario also covers bot setup/autostart, a clicked board move,
bot seat add/remove, interrupted-driver retry and reconnect without state loss.
Use `GAMES_SOLO_BOT_GAMES` for a focused comma-separated subset. Safe summaries
are written to a unique ignored `.vercel/solo-bots-<viewport>-<run>.json` file;
they contain counts/status/source metadata, never hands, credentials or invites.
Local runs allow 40 minutes per viewport; hosted runs allow 75 minutes for network
round trips. Both retain a 45-second stall guard, a 4,000-version match bound and
the unchanged server limits.

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
checks passed for this release; future changes must repeat affected verification.

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

## Modern/party and Tarot v3 expansion

This batch adds six formats, taking the catalogue to 22. Its evidence is separate
from the sixteen-game production baseline above. The backend group includes
`test_modern_games.py` and `test_party_games.py`; the browser suite exercises all
44 generated min/max table projections. `party.spec.ts` adds independent real
choice/lock/wait/reveal/refresh checks; modern tests cover source/placement and
hand-end/memory controls. Full-match filters select the six additions and Tarot
without needlessly replaying unaffected engines.

`tarot-artwork.test.tsx` checks all 78 canonical IDs, unique bounded atlas cells,
PNG/WebP existence and actual illustrated markup. Real browser checks open the
entire deck and each suit/major filter. Tarot v3 unit tests distinguish strict new
output from historical stored data; fresh generation requires a normal read,
quirky read and 1–2 explained named-character links per card. Small real-provider
samples and hosted saved-reading verification remain distinct from deterministic
contract/failure tests. Counts, source/deployment and local/hosted completion are
recorded in progress.txt and owning evidence folders.
