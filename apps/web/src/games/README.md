# Table modules

The registry binds generated game metadata to family compositions. All tables
consume the viewer projection in `TableProps`; they never compute legal moves,
deck order, winners or scores. `ActionPanel` renders server-owned choices and
amount steps/payment eligibility. Shared visual vocabulary lives in `@games/ui`.

- `shared/CardTable`: shedding piles, seat strip and selected-card actions.
- `deal`: banks/collections, public asset selection and private hand.
- `casino`: table seats, community cards/pot and betting controls.
- `rummy`: sortable local hand groups and explicit discard/declaration choices.
- `skyjo`: 3×4 grids, hidden/revealed/removed slots and draw/swap decisions.
- `tarot`: private three-card selection and persisted AI reading status.
- `board`: public-board composition shared by Four in a Row and Reversi.
- `words`: private spymaster key, one-word clues and confirmed team guesses.
- `gems`: resource selection, development/patron cards, private reservations and prestige.

Typed detail parsers in the API client validate new-family metadata. The renderer
registry fails on an unknown family. PlayerStrip accepts a caption variant for
discs, team roles and prestige; existing compositions retain their defaults.

Hand arrangement and selection are transient component state. Authorized
snapshots, membership, chat and match versions belong to TanStack Query. No
hidden hand information is persisted in browser storage. Room changes invalidate
and refetch snapshots; private Broadcast payloads carry revision information only.

Synthetic minimum/maximum seat and hand scenarios are generated with
`scripts/export_fixtures.py` and exposed in Storybook and local-only `/design`.
The design gallery returns 404 in production. Browser workflow checks live in
`tests/browser`, and release acceptance is tracked in the root verification guide.
