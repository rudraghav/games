# Games engineering instructions

Read the latest `progress.txt` entry, `docs/PRD.md`, `docs/APP_FLOW.md`, and the
relevant architecture/UI/rules document before meaningful changes.

- Follow `docs/process/feature-kickoff.md`. Record outcome and observable acceptance criteria first.
- Keep FastAPI Router → Service → Repository. Services own authorization and transactions; repositories own SQL. Engines are pure game logic and never perform I/O.
- Share UI through `@games/ui`, use semantic tokens and typed variants, and keep routes thin. Check existing primitives before adding one.
- Backend wire types are generated from OpenAPI, never handwritten in the frontend. Map/validate responses at the API-client boundary.
- Game extensions use registries. Engines may depend on core/family helpers, never another game module. UI features must not import one another.
- Multiplayer additions include a bounded non-LLM bot policy using only that bot's authorized projection and durable observations; register capability and verify a one-human complete match. Never pass private engine state into bot policies.
- The server owns game outcomes. Never expose unrevealed cards, deck order, or randomness to a client, log, or public realtime payload.
- Schema changes use reviewed Alembic migrations. Games databases, keys and deployments are separate from other products.
- Run `python3 scripts/verify.py --list`, then affected groups. A build alone does not establish product correctness. Do not disable checks to pass.
- Keep secrets in ignored environment files. Never commit real credentials, access-bearing invite URLs, or private game state.
- Maintain the module README, applicable source-of-truth docs and the single root `progress.txt` in the same change. Distinguish local, pushed, deployed and live-verified.
- Preserve existing work. Read the user's task-cleanup and release-verification policies at completion/release; clean only task-owned disposable resources.

## Workflow ownership and verification

Inspect `python3 -B scripts/task.py list` before substantial work. Claim narrow
paths with this chat's ID and root `progress.txt`; preserve history and accept
handoffs explicitly. Use `python3 -B scripts/verify.py --list` and `--plan GROUP`.
Default checks cover tooling only; product/browser/live evidence stays separate.
See [workflow verification](docs/WORKFLOW_VERIFICATION.md).
