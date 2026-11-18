# Games API boundary

`pnpm gen:api` exports the actual FastAPI OpenAPI schema and public game catalogue,
then generates TypeScript wire types. Do not hand-edit `src/generated`.
`scripts/check_contracts.py` compares those artifacts against their owning backend.

`mappers.ts` validates essential room identity/status fields and maps wire names
into frontend domain names. `index.ts` owns authenticated HTTP calls and safe
error messages. Legal action inputs include server-owned amount steps and payable
card IDs. Frontend modules render those choices without duplicating game rules.

Current Tarot reading GET/POST responses map optional generated `ReadingProgress`
wire fields into camelCase at this boundary. Stages, provider labels, attempt
counts, finite timestamps, estimated1–99 percent and a positive/null remaining
time are validated. Omitted/null progress remains compatible with old responses;
invalid estimates are rejected rather than rendered as a completed reading.

`astrology.ts` exports only generated wire aliases. Authenticated place search,
chart preview and reading calls stay under the current solo Tarot room/match.
Ordinary readings omit both astrology request fields; an explicit saved-chart
retry sends `reuse_saved_astrology: true`. Casino/Skyjo detail parsers expose
server-supplied bets, pot settlements, refunds and round closure at this boundary.

The `@games/api-client/characters` entry exports the public Tarot reference cast
and a discriminated artwork type. Active artwork comes from
the preserved `apps/web/public/characters/character-art-v2/manifest.json` and
the expanded `reference-art-v1/manifest.json`; regenerate it with
`backend/.venv/bin/python scripts/export_tarot_characters.py`. The default export
requires complete character/person image manifests and never falls back to the
original performer/cosplay manifest, which remains an explicitly checked archive.

Versioned character images use local 4:5 WebPs, an identity-specific alt, an origin
and reviewed credit/source metadata. Sourced images distinguish copyrighted
references, licensed files and public-domain files. A copyrighted reference has
an explanatory rights note and cannot claim a reusable image license. Generated
illustrations form a separate variant. Asset dimensions, bytes, hashes, canonical
paths, provenance and full cast coverage are checked before registry generation.

`savedReading(matchId)` reads the participant-only historical Tarot archive.
Its generated wire schema is mapped at the boundary with validated identities,
bounded chosen cards and explicit complete/generating/incomplete/unavailable
states. Complete output uses the backend's backwards-compatible saved parser;
opening the archive never requests fresh generation. `canResume` controls the
optional return link to the same current, open room and spread.
