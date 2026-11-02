# Verification and evidence receipt

Audit date:2 November2026. Baseline `main` at `4233d6c9da9269de1bf19165c8ba38afa869c15b`; application/runtime sources unchanged throughout this review. Audit documents were being written during the initial named checks, so their whole-worktree stability gate reported **inconclusive**, even though every selected command passed. Those reports are retained honestly. A final frozen-worktree named run is recorded below when complete; no PASS is inferred in advance.

## Checks already completed

| Check | Actual result | Evidence and limits |
|---|---|---|
| `python3 -B scripts/verify.py --list`, affected `--plan` | Completed | Backend, contracts, multiplayer, scoped browser and tooling plans inspected; default tooling alone not used as product proof |
| Initial backend/contracts/multiplayer named run | All five commands passed; overall inconclusive because audit files changed | `verify-2af0af1e580b4b3d863b815941c403b4`; ruff, mypy,857 pure/backend tests, generated-contract comparison,169 isolated database/multiplayer tests; ignored `output/playwright/independent-audit-20261102/verification.{json,log}` |
| Initial focused browser named run | TypeScript and82 browser tests passed; overall inconclusive because audit files changed | `verify-98fcd621e9e943149574766903b21078`; nine specs listed below,107seconds browser time; logs retained |
| `pnpm test` | **120 tests /30 files passed** | `frontend-tests.log`; direct frontend unit checks, not browser/live proof |
| `pnpm type-check` | **All three workspace packages passed** | `frontend-types.log`; API client, UI and web |
| Card inventory + casino motion | **6 browser cases passed**, phone+desktop | Existing `card-inventory.spec.ts` and `casino-motion.spec.ts`, explicit task-owned Storybook6111; all canonical four-edition faces in normal/compact frames, yellow-face contrast, canceled payment/reveal does not replay after reduced-motion preference restores. Does not establish every animation/network condition |
| Saved local full matches | **95 completed case executions,94 distinct device/game/seat cases,26 multiplayer games,9,125 completed moves** | [saved-match-receipt.json](saved-match-receipt.json).47 unique cases per device; Flip7 minimum repeated once during recovery. All game minimum/maximum seat combinations completed on phone and desktop. See failure qualification below |
| Manual responsive review | **108 game/width observations**,320/390/768/1440 | Normal-height DOM/geometry manifest plus corrected table crops; all27 representative states visually reviewed at all widths. Full-table tall captures are not first-fold proof; single Tarot320 loading artifact excluded |
| Fresh legal/pure probes | Confirmed Deal mismatch in both editions, classic third-play counter conflict, natural Rummy declaration at2/6,12 Sea Salt boundary branches, Four winning line | JSON/replay records beside subreviews; exact rare states not saved/browser end-to-end proof |
| Shared-state/privacy probes | Query cache regression confirmed; waiting-member public casino cue confirmed | `tarot-review/probe-results.json`; narrow in-memory probes, no concealed-data breach established |
| Tarot/assets/numerics |78 card cells and48 character images inspected;48 hashes verified;15 JPL positions all within1arcminute, maximum7.73arcseconds | Per-ID art and JPL records in `tarot-review`; no fresh Gemini call; prior actual provider samples reviewed separately |
| Public production observations | Home/privacy/catalogue200; unauthenticated identity401; design routes404;27 manifests equal local | `current-state.json`. Vercel control-plane connector and CLI403: current deployed SHA/config cannot be independently certified |

All log filenames in this receipt are within `output/playwright/independent-audit-20261102/` unless a different path is given. These are ignored local evidence, not committed provider logs. The curated reports, safe replay records and sanitized saved-match receipt are in this audit directory.

## Saved-match method and original failure

The existing `fullmatches.spec.ts` creates isolated local guest identities/rooms, derives legal moves from each actor's authorized API projection, checks sampled rendered decisions and selection, reaches an actual saved result, verifies profile history and rematch controls, and switches games with the same group. It closes its own memberships/room and preserves history. A `selectionStable:false` receipt means that action did not take the optional selection exercise; it is not an observed layout movement failure. Most game moves are driven via API; do not present these runs as94 manual touch-play sessions.

Commands used:

```sh
GAMES_FULL_MATCHES=1 GAMES_MIDGAME=1 GAMES_FULL_MATCH_GAME='uno,uno-no-mercy,deal,deal-no-mercy,holdem,rummy,teen-patti,blackjack,skyjo,shithead' pnpm exec playwright test tests/browser/fullmatches.spec.ts --workers=2 --output=output/playwright/independent-audit-20261102/fullmatches-card

GAMES_FULL_MATCHES=1 GAMES_MIDGAME=1 GAMES_FULL_MATCH_GAME='four-in-a-row,reversi,word-agents,gem-market,checkers,mancala,flip-7,trio,azul,spill-or-chill,most-likely,hot-seat,the-gang,six-nimmt,sea-salt-paper,boop' pnpm exec playwright test tests/browser/fullmatches.spec.ts --workers=2 --output=output/playwright/independent-audit-20261102/fullmatches-modern

GAMES_FULL_MATCHES=1 GAMES_MIDGAME=1 GAMES_FULL_MATCH_GAME='flip-7,trio,azul,spill-or-chill,most-likely,hot-seat,the-gang,six-nimmt,sea-salt-paper,boop' pnpm exec playwright test tests/browser/fullmatches.spec.ts --project=phone --workers=1 --output=output/playwright/independent-audit-20261102/fullmatches-phone-recovery
```

Card runs passed both devices (40 cases). Modern desktop passed27. Modern phone initially completed9, then failed during ten-seat Flip7 with **HTTP503 on heartbeat**. The subsequent sequential continuation passed19 cases including a repeated minimum Flip7, closing all missing gameplay/device/seat coverage. The original parallel-run failure remains unresolved as an availability incident. A sequential pass is not a concurrency/load clearance. [Investigation](tarot-review/fullmatch-phone-heartbeat-investigation.md) distinguishes HTTP errors from the helper's transport-exception retry counters and explains why database-pool exhaustion is not established.

All five run receipts report `roomClosed:true`, `cleanup.failed:false`, successful abandon/host leave and nine successful guest leaves. No historical QA or user room was deleted. Two bounded transport exceptions across the successful/partial receipts were recovered according to existing read/heartbeat policy; HTTP503 was not silently retried. Rummy browser completion uses legal drops; the fresh pure-engine declaration38/44-move wins are a separate proof. A natural saved declaration remains on the backlog. Tarot was omitted from real-provider fullmatches; mocked-provider browser and isolated persistence checks plus historical real samples are the stated evidence.

## Final named verification

The final run freezes audit writes and reruns the same affected groups once to resolve the earlier source-stability inconclusive status, adding the required tooling/boundary checks. No app changes were made to get a green result.

```sh
python3 -B scripts/verify.py --task independent-audit-20261102 --json backend contracts multiplayer browser tooling \
  --browser-file tests/browser/midgame-workspaces.spec.ts \
  --browser-file tests/browser/stable-deal.spec.ts \
  --browser-file tests/browser/stable-game-tables.spec.ts \
  --browser-file tests/browser/deal-information.spec.ts \
  --browser-file tests/browser/game-information.spec.ts \
  --browser-file tests/browser/azul-information.spec.ts \
  --browser-file tests/browser/dashboard-refinement.spec.ts \
  --browser-file tests/browser/tarot-astrology.spec.ts \
  --browser-file tests/browser/flows.spec.ts
```

Final outcome: **all selected commands passed across the two stable reports below**. The first report remains marked failed because the local database service was stopped; it is not relabelled PASS. Backend/contracts had passed before that infrastructure failure, so only the remaining groups were rerun after restoring services.

| Report | Result |
|---|---|
| `verify-86a4a73384a84039b48030bf03748ace` | Stable-source backend ruff/mypy/857 tests and contracts passed. Multiplayer could not connect to local55439; browser/tooling not reached. |
| `verify-7b152f8be0c847be934f7e3f8655900a` | **PASS, source stable:**169 isolated multiplayer tests, browser TypeScript +82 browser cases, architecture boundaries and44 workflow tests. Continuation command was the one above with only `multiplayer browser tooling`. |

The82 browser cases include the247 legal-projection corpus at phone/desktop, targeted information/stability, local independent guests/chat/refresh/same-group flow, and mocked Tarot/astrology recovery. They are not a full test of every rare action at all four manual-review widths.

The local web/API processes and Docker daemon were found stopped during closure. The existing Docker app and exact `games-postgres` container were started, preserving its existing volume; documented web3217/API8217 commands were restored. Both services returned200. No database was reset and no settings changed. Next automatically changed two generated `next-env.d.ts` imports to development-type paths on restart; those two lines were restored to their original values after checks. That generated-only change explains the differing fingerprints between stable reports. No application behavior was edited. Final type-check/readback after restoration is recorded in closure.

## Remaining uncertainty and release gates

- Fresh production deployment identity/environment and cloud RLS/realtime permission recertification were unavailable; hosted controls are time-bound. Current source and local tests do not replace them.
- The local parallel heartbeat503 needs safe request-duration/proxy/error-class evidence if reproduced. No timing or retry setting was changed.
- A physical second device, real network partition/background suspension and actual server-process kill/restart were not exercised in this review. Integration cases exercise durable recreation/concurrency and authorizations, which are different evidence.
- No fresh account OTP/email delivery, live geocoder request, Gemini generation or actual billing-tier/provider-retention audit. Historical samples are clearly labelled. No provider cost was incurred for new readings.
- Exact rare branches remain game-specific in `coverage.md`: saved natural Rummy declaration; long Deal counter/payment chains; insurance/resplit outcomes; simultaneous close/alternate wins; side-pot capabilities; stock exhaustion conventions; every optional toggle cross-product.
- Full screen-reader experience,200–400% zoom, all colour-vision contrasts, every touch inspector and semantic comprehension by new human players remain incomplete. Passing geometry/card tests do not close these gaps.
- No build/deploy/load50 run was needed or claimed for this unchanged-code audit. No dependency, migration or production setting changed.

## Cleanup and final state

`cleanup.json` records exact task-owned disposable captures removed:124 files,11,811,811bytes reclaimed. Retained corrected table images, normal-height geometry, original selected screenshots, legal replays, numerical/asset evidence, reports and minimum unresolved-failure evidence. No source master, database, credential, installed dependency, existing recovery artifact or historical report was removed. No worktree was created or retired. Final audit evidence remains well below500MB.

The temporary Storybook6111 is no longer listening; all audit-owned browser tabs are closed and the viewport override reset. Restored web3217/API8217 and the same dedicated database remain running. No production data changes, commit, push or deployment. Final source diff and service checks are recorded in the closure entry below.

**Closure:** all three workspace type checks passed again after restoring the generated imports (`final-types.log`). `git diff --check` passed; final tracked modification is `progress.txt`, with only this new audit directory untracked. No diff remains under application/backend/packages/scripts/tests or runtime manifests. Web3217 and API8217 both returned200; the original `games-postgres` container is running on its existing volume. All audit JSON parses and local Markdown/image links resolve. Curated evidence totals approximately18.9MB (19MiB disk usage). [Verification reports](verification-reports.json) retain the initial inconclusive runs, stopped-database failure and successful continuation without rewriting their status. Subsequent edits only finalized audit documents/journal; unchanged application checks were not rerun for document closure.
