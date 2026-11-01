# Backend architecture

Next.js owns presentation and a same-origin proxy. FastAPI owns room, match,
profile and chat workflows. Supabase owns authentication, Postgres and private
Realtime Broadcast. Vercel Services deploys frontend/backend atomically; it is a
beta feature. The backend is private behind a service binding in hosted deployments.

Router → Service → Repository. Services own transactions and authorization.
Repositories own SQLAlchemy persistence. Game engines do no I/O. Registry entries
bind game IDs, rules versions, metadata and engines. Shared core provides cards,
randomness, projections and contracts; related games share family helpers.

Each move carries `actionId`, `expectedVersion`, and a validated action. The
service locks the room/match, validates membership, presence and engine rules,
persists state/action receipt atomically, then changes the room revision. Duplicate
action IDs return a fresh authorized snapshot without applying a second move;
conflicting actions fail safely. Receipts store the committed version and a
fingerprint, avoiding a second copy of private hands or chat in every receipt.

Casino receipts also store an allowlisted public action cue: committed version,
actor, action type and public payment amount. It is computed from the actor's
authorized pre-move view and saved in the same transaction. Only the current
version's cue is projected to members as `last_action`; older receipts without a
cue return null. No card identities, targets, choices, deck order or random state
enter this cue. Durable receipts let a fresh process produce the same cue without
adding a second event store or migration. Clients animate only contiguous live
versions, and never replay a cue on mount, refresh, reconnect or a version gap.

Private state is not available through Supabase's public Data API. A safe room
revision notification is broadcast transactionally. Channel policies check room
membership. Clients fetch a fresh viewer projection; raw state never enters
public broadcast payloads or logs. Private responses are `no-store`.

Anonymous Supabase users have authenticated JWTs but receive only membership-
scoped access. All requests verify the token's issuer/audience/signature. Local
development can explicitly enable signed development identities; hosted startup
rejects development auth. Reviewed Alembic migrations are the sole application
schema history. Preview and production require separate Games databases.
## Persisted rules-version boundary

GameManifest.rules_version is a nonempty string of at most sixteen characters,
matching the persisted Match column. Registry construction rejects an oversized
version before room creation; integration tests start and reload every game at
both seat limits to catch constraints that pure engine setup cannot exercise.
`house-deck-1` identifies the owner-approved Deal No Mercy Games inventory.

Game manifests also declare play_mode (competitive/cooperative/solo), score_label
and score_order (high/low/none). These additive catalogue fields do not change
persisted match state. Cooperative engines may finish with no winners on team
defeat; the service persists that result normally. Frontend results consume the
declared semantics rather than inferring a tie from an empty winner list.

Action card selections allow up to 115 identifiers, covering the largest current
selectable Deal asset inventory. A legal payment can include more than thirty
bank/property cards; the API must accept what the engine offers. Each engine
still rejects duplicate, foreign or insufficient selections. Isolated HTTP
integration tests pay thirty-three conserved assets in both Deal editions and
verify immutable engine inputs, rejected ineligible cards and persisted readback.

Visible card projections include additive printed-face `colors` and `effect`
metadata. Deal retains its current `color` orientation while exposing all printed
property/rent colors and the action identifier. This resolves ambiguous wilds
without exposing additional cards, engine state or shuffle randomness; other
families use empty defaults. The API client's shared `cardSchema` validates and
normalizes those fields for hands and nested casino/modern/cooperative/paper
details alike; older responses receive the same empty defaults. UI components
consume the domain card instead of rebuilding per-game wire-card shapes.

## Room bots

Room-owned bots use reserved `bot:` profile identifiers, not Supabase accounts.
Memberships declare `is_bot`; authentication accepts UUID subjects only, and
room services additionally reject bot identities at the human authorization
boundary. Only a human host can add/remove lobby bots. Human arrivals replace a
lobby bot when seats are full; running matches keep their fixed participants.
Bots never claim hosting, and the last human leaving closes the room even if
bots remain. Retired memberships/profiles and match history are preserved.

Bots are ready/connected without a presence heartbeat. Human leases still pause
the whole match. A match persists bot policy memory and its next due timestamp.
`POST /rooms/{id}/bots/drive` accepts a match ID and expected version, locks the
room, and applies at most one due legal bot move. Stale/concurrent drives return
the caller's fresh authorized snapshot without another move. Human and bot moves
share the same apply/result/receipt transaction; every committed bot move has a
deterministic receipt and version increment. There is no process-local worker or
sleeping request. Reconnect/redeploy resumes from persisted state.

Policy functions receive only `engine.project_view(state, bot_id)` and that bot's
own JSON memory (at most 16KiB per bot). Private independent 128-bit policy seeds
are persisted there; public room/seat identifiers cannot predict hidden votes.
Policies cannot inspect state, opponent hands, engine seed or deck order.
Trio and Flip 7 observe authorized public reveals even between their turns.
Strategies use ordinary rules/search/heuristics without an
LLM or network call. Bot memory stays in the private match table and is never
part of a player response or Realtime payload. A private room view exposes only
`bot_pending` and its safe next `bot_due_at` timestamp for frontend scheduling.

Migration `a6e442b15d80` adds three columns to existing private tables, with
backfills preserving all human memberships and old matches. It changes neither
public grants nor membership/Broadcast policies.

| Wire operation | Authorization and behavior |
| --- | --- |
| `POST /v1/rooms`, optional `bots` | Existing creation; atomically fills requested open seats with 0–9 bots |
| `POST /v1/rooms/{id}/bots`, `{count}` | Human host; adds 1–9 bots to available lobby seats |
| `DELETE /v1/rooms/{id}/members/{bot_id}` | Existing human-host removal between matches; preserves the retired profile/history |
| `POST /v1/rooms/{id}/bots/drive`, `{match_id, expected_version}` | Human member; at most one due bot move; stale/concurrent calls are safe no-ops |

`MemberView.is_bot` is explicit; `bot_due_at` is epoch seconds and is returned
only when safe bot work is pending. The normal pacing interval is 800ms after a
committed action. Scheduling gives a bot its legal out-of-turn UNO announcement
before another bot catches it. Gang bots holding ranking chips wait for the
human instead of repeatedly stealing/returning chips. These are scheduling
choices over the existing engine's legal actions, not altered game rules.

Shithead's independent `palace` family keeps all 52 cards in stock, private
hands, hidden/public table slots, active pile or a burn archive. Projections
expose occupied hidden-slot booleans, never their card identities. Its bot reads
only its authorized view and stores at most 64 own/public rank signatures to
vary legal choices when a pickup cycle repeats. There is no forced turn limit,
hidden-state search or model request. An unscored outcome lists all escaped
players as winners and the final remaining player as the loser.
