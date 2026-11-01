# Games

A private game-night web app: bring your people, share a room, play another round.
Built with Next.js, TypeScript, Tailwind, FastAPI, Supabase and Vercel Services.

The catalogue contains Uno, Uno No Mercy, Monopoly Deal, Monopoly Deal No Mercy,
Texas Hold'em, Indian 13-card rummy, Teen Patti, blackjack, Skyjo and solo Pop
Tarot, Four in a Row, Reversi, Word Agents, Gem Market, Checkers, Mancala,
Flip 7, Trio, Azul, Spill or Chill, Most Likely and Hot Seat. All 78 Tarot cards
have original pop-art illustrations and an explorable deck. Fresh personal
Gemini readings give each card a grounded interpretation, a quirky take and
one or two explained character parallels. Existing saved readings stay intact.
The three original party games have 144 prompts and optional sip suggestions.
Word Agents is a Codenames-style house edition with an original word list;
Gem Market is a Splendor-style game with original card costs and patrons.
Deal No Mercy uses an explicitly labeled Games house deck, approved by the owner;
its documented inventory is not represented as Hasbro's exact printed G3071 deck.

**Production: [Games](https://games-seven-black.vercel.app), early access.** The personal
Vercel `games` project runs Next and FastAPI together. Personal
Supabase `games-preview` has anonymous authentication, reviewed cloud migrations,
schema drift and private-table grants verified. Production cloud settings are
configured separately from local development. The Gemini free-tier key generates real
readings. The repaired adapter binds all three card identities/positions, budgets
every attempt and regenerates malformed output at most once. Six fresh fixed
evaluations passed on their first attempts. A browser reading survived refresh
and an API process restart. The question form discloses the free-tier data-use
terms. Four independent real guest sessions exercised every catalogue engine
online: start, legal move, retry, stale-version conflict and refresh. A real
hosted Tarot reading saved and survived reload. Historical previews remain
rollback references. Complete-match and independent rule-regression evidence is
recorded in the rules audit and release verification guide.
Provider outages/quota failures keep the saved spread and offer an honest retry.
The 1 November release passed 54 complete-match phone/desktop scenarios on
production, two real saved readings and a fifty-room private Broadcast load run.
See [verified release evidence](docs/evidence/release-2026-11-01/README.md).
The modern/party expansion passed 26 additional hosted full-match scenarios
(2,477 moves), including two richer real Tarot readings. Final portrait framing,
poster ranks and browser icons passed four focused hosted phone/desktop checks.
See [current expansion release](docs/evidence/modern-party-2026-11-01/RELEASE.md).
Google account signup passed live consent and the production callback. Linking
the owner's guest retained the same player ID, saved name and existing room;
the verified Google identity survives refresh. See the project journal and
[Google sign-in setup](docs/GOOGLE_SIGN_IN.md).

## Run locally

The current development services use web **3217**, API **8217**, and dedicated
Postgres **55439**. Other projects' services must remain untouched.

```sh
pnpm install --frozen-lockfile
cd backend
uv sync --locked --extra dev --inexact
uv run alembic upgrade head
uv run uvicorn app.main:app --host 127.0.0.1 --port 8217
```

In another terminal at the repository root:

```sh
pnpm dev
```

Configure ignored `.env` and `apps/web/.env.local` from `.env.example`.
Development identity is explicitly local-only and is rejected in hosted
environments. `.env.ai.local` holds the dedicated server-side Gemini key. The
separate `.env.cloud.local` setup file is never loaded into local play, preserving
the boundary between local and hosted databases. Keep all these files out of Git.

## Verify and extend

```sh
python3 scripts/verify.py --list
python3 scripts/verify.py frontend backend contracts migrations multiplayer browser tooling
python3 scripts/verify.py load
pnpm storybook
```

See [verification and release gates](docs/VERIFICATION.md), the
[product contract](docs/PRD.md), [application flow](docs/APP_FLOW.md),
[backend architecture](docs/BACKEND_STRUCTURE.md), [design system](docs/UI_UX_SYSTEM.md),
[design research](docs/DESIGN_REFERENCES.md) and [feature kickoff](docs/process/feature-kickoff.md).
Each engine owns its rules README; frontend compositions are documented under
`apps/web/src/games`. The single `progress.txt` records verified state and gaps.

Regenerate the actual backend contract with `pnpm gen:api`; update visual
fixtures with `backend/.venv/bin/python scripts/export_fixtures.py`. Game modules
extend registries rather than shared rule switches. Components, variants and
tokens live in `@games/ui`.

## Delivery boundary

The owner requested production hosting and full verification on 1 November 2026.
The release passed the recorded match, privacy, persistence, layout and load
acceptance for all sixteen documented formats, including the approved No Mercy
house inventory.
The modern/party expansion adds six documented formats through the same private
room contract. Its current verification and deployment state is recorded separately
in the journal; the preceding sixteen-game evidence remains historical proof.
Completing a scripted match does not certify every rule. The independent
[rules audit](docs/RULE_AUDIT.md) separates expected-outcome rules checks from
complete-match scenarios and documents traditional/house choices. The owner
approved the explicit Deal No Mercy house inventory on 1 November 2026.
`docs/VERIFICATION.md` and `progress.txt` record local and hosted acceptance results.
