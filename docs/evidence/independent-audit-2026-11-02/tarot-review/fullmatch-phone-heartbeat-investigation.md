# Phone full-match heartbeat 503 investigation

Read-only investigation, 2026-11-02. No tests rerun, application/settings changes, database queries, provider calls, or cleanup mutations were performed by this reviewer. Environment values and private logs were not inspected. The parent auditor owns the sequential continuation and its eventual result.

## Verdict

The original phone run is **incomplete**, with nine completed seat-limit cases and a real HTTP 503 during the ten-seat Flip 7 case. This is an availability failure under the observed parallel local verification workload. It is consistent with transient proxy/backend latency or connection pressure, but **database pool contention is unproven**. There is no evidence in this receipt of a Flip 7 rules failure, privacy failure, or corrupt persisted outcome. Do not relabel the 503 as a passed test or dismiss it solely because the desktop run passed.

The concurrent desktop run completed all 27 selected seat-limit cases. Its transport receipt records one bounded transport retry/recovery. The failed phone receipt records no transport retries because HTTP error responses are intentionally excluded from that counter.

## Observed evidence

- `output/playwright/independent-audit-20261102/fullmatches-modern.log`: two tests on two workers; phone failed after approximately 7.5 minutes, with `POST heartbeat must succeed`, expected status below 300, actual 503. Stack: `tests/browser/fullmatches.spec.ts:123`, called by `heartbeats()` at line 127 and the active game loop at line 223. Desktop completed in approximately 19.3 minutes.
- `.vercel/fullmatches-phone-four-in-a-row_reversi_word-agents_gem-market_checkers_mancala_flip-7_trio_azul_spill-or-chill_most-likely_hot-seat_the-gang_six-nimmt_sea-salt-paper_boop.json`: local origin, `hosted:false`, checkout `4233d6c9da9269de1bf19165c8ba38afa869c15b`; `complete:false`; `active:{game:"flip-7",seats:10}`; `failureType:"Error"`; nine completed cases; transport `{retryAttempts:0,recovered:0,failed:0}`. The source receipt labels the overall workspace dirty; it does not prove an application source change.
- The matching desktop JSON records `complete:true`, 27 completed cases, `active:null`, transport `{retryAttempts:1,recovered:1,failed:0}`.

## Why transport zeros do not mean that no request failed

`tests/browser/helpers.ts:60-75` retries one allowlisted thrown transport exception for GET or heartbeat requests. A received HTTP response is returned directly, including 503, with no retry and no increment to the exception-failure counter. `tests/browser/transport.spec.ts:92-104` explicitly tests that HTTP 503 is not retried. The full-match assertion then creates an ordinary assertion error; `fullmatches.spec.ts:501-504` only records a detailed reason for `TestTransportError`, explaining the absent failure-reason field.

This behavior honestly exposes the HTTP availability failure. It also means the transport telemetry needs to be read alongside the assertion log; zero counters are not a general HTTP-health metric.

## Source trace and likely mechanism

1. `fullmatches.spec.ts:126-128` sends all player heartbeats concurrently with `Promise.all`; line 223 does this roughly every ten seconds during a match. These selected runs create ten identities each and were running in two browser workers. Normal rendered room hooks also poll and heartbeat while mounted (`apps/web/src/features/room/useRoom.ts:12-19`, 21-40). The test workload can therefore create request bursts in addition to game-action and snapshot traffic. Exact burst overlap at the failure instant was not captured.
2. `apps/web/src/app/api/backend/[...path]/route.ts:29-51` sets a 15-second backend fetch timeout for heartbeat requests. Any thrown fetch error is logged only by error name and returned to the caller as HTTP 503 with generic reconnect copy. Backend HTTP responses are otherwise passed through unchanged. The saved test evidence does not retain the response body or proxy error name, so the exact 503 origin cannot be proved from these files alone.
3. `backend/app/rooms/service.py:276-282` updates membership presence and constructs the authorized room projection in a transaction. This heartbeat implementation has no explicit 503 branch and no Flip 7-specific path. A game-rules rejection is therefore not a supported explanation for this stack.
4. `backend/app/db.py:25-28` uses SQLAlchemy `NullPool`, so a claim that SQLAlchemy's application connection pool was exhausted is incorrect. Each session checks out a fresh connection. An external pooler/database connection limit, network delay, worker pressure, transaction contention, or local event-loop delay could still contribute, but none was observed directly. The available evidence cannot discriminate between them.

**Best-supported classification:** local parallel-load availability incident, with proxy timeout/connection pressure a plausible mechanism. Exact infrastructure root cause remains unknown. It is neither established as a persistent product defect nor cleared as harmless test noise. A clean sequential continuation would close the missing gameplay coverage while leaving this original incident recorded; it would not alone prove acceptable concurrent-load behavior.

## Cleanup verification

The failed phone receipt reports:

| Cleanup step | Observed result |
|---|---|
| Abandon task-owned active match | HTTP 200 |
| Nine guest memberships leave | Nine HTTP 200 statuses |
| Host membership leaves | HTTP 200 |
| Final room state from host-leave response | `roomClosed:true` |
| Cleanup failure flag | `false` |

The source at `fullmatches.spec.ts:505-545` records those status checks, requires the host-leave response body to say `closed`, preserves history/database rows, and closes spawned browser contexts. Thus the original failed run's task-owned room memberships were successfully closed according to its fresh cleanup receipt. This is not a claim that all test identities or historical rows were deleted; deletion is neither performed nor required by that cleanup.

The matching desktop receipt independently reports the same successful room/membership cleanup. No additional cleanup action is indicated by these flags.

## Recommended evidence follow-up

Owner: verification/backend operations. The parent is rerunning only remaining phone cases sequentially; do not overwrite or hide this original failure. If further 503s occur, preserve safe endpoint/status/duration, proxy error name, and aggregate connection/worker timing, without tokens, session headers, room secrets, or private game state. Distinguish HTTP errors from thrown transport errors in the reported counters. Do not raise timeouts or add automatic retries to game mutations merely to obtain a green run.

This note is stable. No further writes are planned by this reviewer unless the parent explicitly requests them.
