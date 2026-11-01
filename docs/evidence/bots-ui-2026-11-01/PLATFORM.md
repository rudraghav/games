# Bot platform release review and local load

Reviewed 1 November 2026. This document records local platform evidence; the
release owner records the production rollout and hosted behavior in progress.txt.

## Concurrency load

`backend/tests/test_load.py` now has two 50-room checks. Both run through
FastAPI with ordinary development JWT authentication and production rate limits,
against a new local database that receives the full migration chain and a drift
check. The isolated runner removes only that invocation's random database.

| Operation, 50 samples | Median | p95 | Maximum |
| --- | ---: | ---: | ---: |
| Human blackjack action | 422ms | 478ms | 499ms |
| Human authorized snapshot | 198ms | 296ms | 317ms |
| SixNimmt bot drive | 519ms | 579ms | 658ms |
| Bot-room authorized snapshot | 279ms | 333ms | 341ms |

The bot case creates 50 private two-seat rooms, each with one human and one bot.
Every room waits for its real 800ms due time, then a barrier releases all 50
drive requests together. Each drive commits exactly one move and returns the
caller's authorized view. The subsequent snapshot retains the bot's hidden
choice, exposes neither policy seed nor memory, and leaves the human's decision
unsubmitted. Every bot test room is closed through the normal last-human-leave
path and becomes unavailable to that session.

The final `python3 scripts/verify.py load` run passed both tests in 6.30s,
including a fresh migration to `a6e442b15d80` and a clean schema drift check.
Pacing is respected but excluded from request latency. p95 is the 48th sorted
sample of 50.

This is local HTTP/database contention evidence for one inexpensive bot decision
per room. It does not measure worst-case search cost, hosted network latency or
Supabase Broadcast delivery. No provider, cloud database or live room was used.

## Security and restart review

No additional consequential defect was found in the reviewed platform/policy
source. Existing focused cases cover these boundaries:

- Only human room members can drive; only the human host manages bot seats.
  Reserved bot identifiers cannot authenticate, claim hosting or be claimed by a
  guest. A full lobby gives an arriving human a bot seat, before a match starts.
- A locked transaction applies one due bot action, updates state/version/result,
  and writes its deterministic receipt. A second drive with the same expected
  version returns a fresh view without another move. State, due time and policy
  memory survive service recreation; no process-local worker is required.
- Strategies receive only their bot's projected view and its bounded memory.
  Independent private seeds make hidden choices unpredictable from public IDs;
  the engine shuffle seed never reaches policies. Private events/memory are not
  synchronization payloads. Other missing humans still pause a match.
- Legal UNO announcements take precedence over another bot's catch. Gang bots
  already holding a chip wait while humans choose. Human decisions are never
  submitted by the drive route.

The same-origin frontend allowlist was also read back: it admits POST bot
management/drive and DELETE reserved bot member IDs, while rejecting arbitrary
backend paths. This closes the previously reported frontend integration concern.

## Reviewed migration release checklist

- Target only the dedicated personal Games database. The reviewed revision is
  `a6e442b15d80`, directly after `7066963c5ae4`; no provider credentials or
  authentication settings are part of this migration.
- Apply the migration before serving the new ORM. It only adds non-null columns
  with compatible defaults: `room_members.is_bot=false`,
  `matches.bot_memory={}`, and `matches.bot_due_at=0`. Existing human memberships,
  match contents and results retain their values. There are no new tables,
  grants, RLS policies, auth users or bot profiles created by the migration.
- Confirm Alembic head/drift and existing private-table RLS/grants afterward;
  compare protected owner/profile/room fields against the scoped preflight
  fingerprints. Never log raw private state or credentials.
- The previous application can read the original human rooms with these added
  columns, but cannot operate newly created bot rooms. An application rollback
  retains the columns and saved bot state; bot rooms need a corrected bot-aware
  application to resume. The known READY deployment is a recovery reference,
  and the revision intentionally rejects destructive schema downgrade.
- After the single production rollout, verify its exact source/alias, fresh
  guest entry, one-human bot play, private simultaneous choices and forbidden
  access through the deployed same-origin proxy. Hosted synchronization and
  production latency require their own observation.

The release owner has separately recorded that the dedicated cloud migration,
schema drift and private-table RLS/grants passed. This agent made no cloud writes,
restart, build, commit or deployment during this review. All owned disposable
load databases were removed by the isolated runner; requested services and other
agents' browser sessions were preserved.
