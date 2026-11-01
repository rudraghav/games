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

Action card selections allow up to 115 identifiers, covering the largest current
selectable Deal asset inventory. A legal payment can include more than thirty
bank/property cards; the API must accept what the engine offers. Each engine
still rejects duplicate, foreign or insufficient selections. Isolated HTTP
integration tests pay thirty-three conserved assets in both Deal editions and
verify immutable engine inputs, rejected ineligible cards and persisted readback.
