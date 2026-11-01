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
- `board`: public-board composition shared by Four in a Row, Reversi and Checkers; Kalah/Mancala composes shared numeric pits/stores.
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


## Compact table compositions

The shared card-game layout puts piles beside the hand on wide canvases and in
one compact column on phones. Action panels stay in document flow. Casino games
render a single private decision workspace before the public table; the same
cards are not duplicated at the viewer's seat. Crowded tables use spaced ring
positions, then switch to a seat grid based on the available canvas width,
including when chat is open. Blackjack's projected detail is validated by the
API client and keeps each split hand, its bet and active state separate. Empty
pre-deal seats never invent card backs; the dealer's unrevealed card stays hidden.

Gem Market shares typed development cards, resource tokens and complete district
illustration cells. Tier and color select the art; readable names, points and
costs remain real UI. Reserved cards and current resources precede the market;
blind reservations, patrons and opponent collections expand on demand. A required
patron choice opens its collection. Azul shares six patterned ceramic pieces,
keeps the viewer's board open and opponent boards expandable, and places factories
in a horizontal phone rail. Placement brings the player's board before factories.

Seat variants and player-name helpers identify bots explicitly. Renderers still
consume only personalized projections and server-owned legal actions. Pure visual
art wrappers never infer rules, hidden cards or scores. Storybook's Board pieces
story exercises all 16 district cells, all six ceramic cells and development-card
states. Browser density tests sweep every minimum/maximum projection for page
width, painted card text, enabled 44px controls and reachable decision workspaces;
separate tests cover crowded casino collisions and keyboard card grouping.


Original TokenArt variants decorate public board discs and casino wagers; Mancala
composes the same marble art with independent exact seed counts. AtlasArt clips
each selected cell explicitly before meet framing so neighboring source cells
cannot appear in letterbox space. Classic boards preserve all 44px squares at a
390px viewport; smaller canvases retain an internal board scroller. Skyjo uses
three desktop columns and a full-width interactive own grid on phones. See the
26-game matrix and retained inspected images in the table-refresh evidence.


Card inventory stories use the generated 245-face source for both Uno and both
Deal editions, retaining every wild orientation. PlayingCard owns the shared
24-effect motifs, ten group scenes, full allowed-color bands and accessible
orientation labels. Renderers forward validated metadata instead of inferring
actions from subtitles. Presentation coverage is separate from engine rules.
