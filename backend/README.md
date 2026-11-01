# Games API

FastAPI Router → Service → Repository, with pure game modules and explicit viewer
projections. `app/main.py` owns the ASGI app; `main.py` is the Vercel entrypoint.
Use Python 3.13 and `uv sync --locked --extra dev --inexact`. `uv.lock` is the
deployment dependency ledger; `requirements.lock` preserves the original local
bootstrap snapshot and is not a deployment input.

Schema changes use reviewed Alembic revisions. `DATABASE_URL` is the runtime
transaction-pool connection; optional `MIGRATION_DATABASE_URL` uses a direct or
session-pool connection. Prepared statements are disabled for the transaction
pooler, SQLAlchemy uses NullPool, and remote connections require TLS. Every
application table is in private schema `games` with RLS enabled.

Use the root verification runner. Isolated database checks are launched through
`scripts/isolated_backend.py`; raw database tests refuse the development database.
Per-game READMEs record their sources, chosen table rules and unresolved gaps.
