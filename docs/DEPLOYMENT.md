# Personal Games testing preview

## Owner-requested production target — 1 November 2026

The owner explicitly requested main and production instead of further previews.
The existing dedicated Games Supabase project retains its current name/data and
stable encryption secret; local development remains a separate local database.
Historical previews are rollback references. This early production deployment
does not certify the open game-rule, full-match/load and AI-reliability gates.

`cloud_preview.py configure --environment production` uses the same scoped
target checks and secret/config boundaries, writes production-only entries and
sets APP_ENV=production with both local-auth flags disabled. It reuses the Games
Gemini settings and makes no billing changes. Shared/branch entries still fail
closed. `migrate --environment production` checks the same dedicated database
through reviewed history, drift and RLS/grants without resetting it.

Release path: verify locally, commit/push exact main to rudraghav/games, then use
the personal Vercel CLI with `--environment production`. No Git integration is
enabled in parallel, avoiding a duplicate deployment. Verify the production
alias, serving source, auth boundary, guest multiplayer and Google PKCE callback.

The deployment target is the already linked personal Vercel Games project and
the dedicated personal Supabase `games-preview`. It is a testing preview; the
production acceptance gate in VERIFICATION.md remains in force.

## Credential handoff

The ignored, owner-readable `.env.cloud.local` names the exact Games project and
its previously inspected Mumbai pooler. Fill only its saved database password
and publishable key. Do not source the file in a shell: the setup reader treats
the password as a literal value, including `#`, `$`, spaces and punctuation.
Never use a service-role/secret key for frontend configuration. Enable anonymous
sign-ins on the dedicated project for immediate guest play.

The available Supabase connector currently cannot access this personal project.
No other organization's project/credential is an acceptable substitute. An
owner-only, separate preview encryption secret is generated once under `.vercel`
and retained across deployments so saved invitations remain decryptable.

## Scoped setup

```sh
backend/.venv/bin/python scripts/cloud_preview.py check
backend/.venv/bin/python scripts/cloud_preview.py migrate
backend/.venv/bin/python scripts/cloud_preview.py configure
```

Each operation checks the configured project identity and selected personal
Vercel account/project. Checks verify the publishable key, anonymous sign-in
configuration, asymmetric signing keys and session database connection. Migrate
uses reviewed Alembic history on the session pooler (5432), then checks schema
drift and private-table RLS/grants. Configure uses transaction pooling (6543)
with no prepared statements, TLS and preview-only environment entries. Secrets
are supplied to the CLI through stdin and never echoed. A mismatched project,
shared environment entry, missing setting or failed check stops the operation.

The local `.env`, local database and local development identity stay separate.
No cloud migration command resets a database. These helpers do not deploy.

## Deployment and online verification

Run affected verification groups locally, then deploy once through the personal
Vercel CLI configuration and **explicit `--environment preview`** (the CLI can
select production for a project's first deployment). Each service pins its
framework, since Storybook also lives beside Next. The `services` configuration ships the Next frontend
and private FastAPI backend together. Only the frontend has public ingress;
the same-origin proxy authenticates each request and uses the service binding.
Never set the binding's backend URL manually or enable hosted development auth.
Runtime functions use Mumbai (`bom1`), beside the dedicated database. Static
assets remain CDN-served. Tarot uses compact static WebP derivatives while keeping
the original PNG masters; verify both file delivery and actual card rendering.

After Vercel reports Ready, verify the actual preview: anonymous identities in
separate browser contexts, create/join/readiness/start/move, refresh/reconnect,
private hands, chat, results/rematch and catalogue switching. Exercise every
available engine and phone layout before handing over the testing URL. Verify
private Broadcast subscriptions and polling recovery against real Supabase.
Record the exact deployment/source and remaining test limitations in progress.txt.

For protected previews, use the personal CLI's development OIDC token through
`vercel env run` and the explicit `GAMES_TEST_URL`. The browser tests attach it
only to the exact Games origin, never to Supabase or a provider. Hosted tests are
opt-in; regular local browser runs skip them. `GAMES_TEST_AI=1` opts into a real
generation. Reuse identities within the catalogue scenario to respect anonymous
signup limits. Never commit session storage or tokens.

The final testing URL is https://games-r9le3idrh-rudraghavs-projects.vercel.app.
It retains Vercel Authentication pending the owner's answer about friend access.
Application membership/invite checks remain required independently of that gate.
