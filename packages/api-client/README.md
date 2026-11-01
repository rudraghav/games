# Games API boundary

`pnpm gen:api` exports the actual FastAPI OpenAPI schema and public game catalogue,
then generates TypeScript wire types. Do not hand-edit `src/generated`.
`scripts/check_contracts.py` compares those artifacts against their owning backend.

`mappers.ts` validates essential room identity/status fields and maps wire names
into frontend domain names. `index.ts` owns authenticated HTTP calls and safe
error messages. Legal action inputs include server-owned amount steps and payable
card IDs. Frontend modules render those choices without duplicating game rules.
