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

Tarot character references render only verified `character` or `illustration`
artwork from the generated public catalogue. Matching checks the character name
and source; actor and cosplay entries never become a fallback. Images use the
same centered 4:5 frame, intrinsic dimensions and direct local WebP delivery.
Character/source text stays beside the image without performer captions.
The shared credits disclosure deduplicates by character, preserves real source
and rights notes, and links a license only when one is actually supplied. Older
unknown references remain readable text; no saved reading is rewritten.

Synthetic minimum/maximum seat and hand scenarios are generated with
`scripts/export_fixtures.py` and exposed in Storybook and local-only `/design`.
The design gallery returns 404 in production. Browser workflow checks live in
`tests/browser`, and release acceptance is tracked in the root verification guide.


## Compact table compositions

The shared card-game layout puts piles beside the hand on wide canvases and in
one compact column on phones. Action panels stay in document flow. Casino games
render the public table before a single private decision dock; the same
cards are not duplicated at the viewer's seat. Crowded tables use spaced ring
positions, then switch to a seat grid based on the available canvas width,
including when chat is open. Blackjack's projected detail is validated by the
API client and keeps each split hand, its bet and active state separate. Empty
pre-deal seats never invent card backs; the dealer's unrevealed card stays hidden.

On compact casino canvases the order is felt, own cards/decisions, then opponent
seats. The full-size ring keeps the dock immediately below the table. Uno marks
only server-legal cards while leaving other cards inspectable; card moves appear
after selection, and colour/draw/challenge instructions reflect the legal choices.
Yellow-card ranks, corners and captions use measured contrasting ink.

`shared/TablePile` places an authorized draw action on its corresponding pile for
Rummy and Skyjo. It is one labeled keyboard/touch control, disabled while saving
or paused. Rummy's local group buttons preserve card identity across sorting;
declarations are still validated by the engine. Skyjo rotates public seat order
to put the viewer's grid first, and names each legal slot by action, row and
column. Shithead groups the viewer's own zones; selection expires with the match
version while sorting persists until a new match. These changes never inspect a
hidden card or infer a legal move. Per-game checks and complete paired card-face
sheets are recorded in `docs/evidence/card-workspaces-2026-11-02`.

Gem Market shares typed development cards, resource tokens and complete district
illustration cells. Tier and color select the art; readable names, points and
costs remain real UI. The wallet pairs each color's token count with its permanent
discount. Tier 1 leads; phones show all four developments in a selected tier using
three explicit tier controls, while desktop keeps all twelve developments visible.
Reserved cards and current resources precede the market;
blind reservations, patrons and opponent collections expand on demand. A required
patron choice opens its collection. Azul shares six patterned ceramic pieces,
keeps the viewer's board open and opponent boards expandable. Its center and
first-player marker remain outside the horizontal phone factory rail; previous/
next controls provide a click and keyboard alternative to swiping. Reduced motion
uses immediate scrolling. The supply and own board retain their positions when a
draft becomes a placement; a reserved preview shows the chosen tiles.

Flip 7 places the viewer's live cards/risk directly before hit/stay decisions;
opponent summaries retain scores and status with native keyboard disclosures for
their public cards. Trio numbers stable table positions and distinguishes the
private sorted hand from public reveals and lowest/highest requests. Party games
show one active A/B choice set and a full-row confirmation; closed rounds retain
their option reference. The Gang groups private cards and ranks estimates from
weakest to strongest. 6 nimmt! shows exact penalties and five visible slots per
ascending row before the private number selection; missing slots never fabricate
cards. These compositions continue to send only server-enumerated actions.

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
390px viewport; smaller canvases retain an internal board scroller. Skyjo keeps
the own grid first and shows opponents as compact public miniature grids with
explicit inspection controls. See the
26-game matrix and retained inspected images in the table-refresh evidence.


Card inventory stories use the generated 281-face source for both Uno and both
Deal editions, retaining every wild orientation. PlayingCard owns the shared
24-effect symbols, all 28 named US properties with rent schedules, full allowed-color bands and accessible
orientation labels. Renderers forward validated metadata instead of inferring
actions from subtitles. Presentation coverage is separate from engine rules.

## Shithead

`shithead/ShitheadTable` composes the shared standard PlayingCard/Hand/Seat system.
Setup exposes only the viewer's six candidates; selecting exactly three locks
public table cards. The same-rank hand selector sends an actual enumerated legal
option, and face-up pickup requires selecting its added card. Hidden slots are
anonymous backs with occupied/cleared state; only legal own flips are buttons.
No hidden rank or identity exists in the renderer. Rank/suit sorting preserves
card IDs; pending, missing-presence and out-of-turn views disable moves.

The API-client `shitheadDetails` parser owns stages/counts/slot booleans, pile
comparison, optional rule flags, public last play, finish order and loser. The
engine—not presentation—decides when a blind play fails and who loses. Its
unscored outcome has all escaped player IDs as winners, never the last player.
Stories cover setup, five seats, pending and disconnected. Focused real-browser
checks select setup cards, commit a hand play, reload the saved state and verify
stale-version rejection/room closure; full solo acceptance uses the actual bot
client driver through the shared harness.

## Casino transitions

`casino-transitions` compares only authorized projections. It animates contiguous
versions of the same unpaused match, reads allowlisted public receipt amounts,
and preserves hidden backs as anonymous slots. Refresh, jumps, rematches and the
first foreground/reconnect snapshot establish a baseline. `useCasinoMotion`
expires transient cues; the latest committed public action stays readable.

`CasinoMotion` composes the shared PlayingCard and TokenArt with short card/layout
changes and actual DOM-measured chip paths. Amounts/actions update immediately;
motion never locks controls or drives turns. The existing `useMediaQuery` applies
Reduce Motion changes during play. Split blackjack reuses known card identities,
keeps separate bets/active hands, and scrolls only its own hand rail on a hand shift.
The single `casino-layout` width container owns the ring/grid fallback.

`scripts/export_casino_motion.py` exports complete legal authorized-view sequences
for Hold'em, Teen Patti and split blackjack. Its `--check` verifies 49 deterministic
snapshots. Storybook Casino motion provides next-move, jump, refresh and pause
controls. Focused verification/evidence is in
`docs/evidence/casino-motion-2026-11-01`; it supplements real-room release tests.

Enabling Reduce Motion cancels its current event, so restoring the preference
cannot replay an earlier payment or reveal. The opt-in mounted regression in
`tests/browser/casino-motion.spec.ts` uses `GAMES_STORYBOOK_URL` and covers both
widths without creating rooms. Blackjack's total is labeled hand bets because
the projected main/split/double sum excludes the separate insurance stake.


## Stable decision workspaces

`ActionPanel` composes the shared `DecisionDock`; selecting or clearing a card
changes the contents of a fixed action area rather than inserting rows before
the hand. The compact, standard and extended variants use bounded internal
scrolling. Selection never switches a dock's size. The clear-control footprint
stays reserved, and board squares, factories and card piles remain in place.

Family compositions reserve the controls that can appear later in a turn:
Rummy's grouping lane, Trio's reveal/review lane, Azul's tile preview and own
floor action, Boop's graduation choices, Word Agents' clue/guess controls,
Sea Salt & Paper's draw/keep/steal choices, and party voting/reveal states.
Private keep choices use compact card art and visible confirmation buttons.
Casino tables retain the own-card well before dealing and between hands, while
existing authoritative chip/card transitions keep their DOM anchors. Casino
controls use a fixed 192px desktop / 252px phone area; their context does not
inherit the wider horizontal-panel flex basis. Every legal control remains
scroll-reachable, and the first action starts inside the visible area. Split
blackjack hands use explicit previous/next controls and preserve active-hand
reveal. Tarot
spread meanings reserve their line before a reveal.

`PlayerStrip` and custom card rows use `HorizontalRail` for bounded scrolling
with external 44px previous/next controls. Focus reveals only the relevant
horizontal item. Skyjo and Shithead share `OpponentPanel`: a public seat and
summary remain visible, while an explicit Inspect button opens the full public
assets. Hidden cards remain anonymous; inspection never receives unprojected
ranks, other hands or deck order. Gem Market and Azul always show public
progress in their expandable-player summaries.

`tests/browser/stable-game-tables.spec.ts` checks phone and desktop bounds before
and after private selection, exact public-target previews, grouping, clearing
and a committed legal Azul draft. It also checks anonymous opponent inspections.
The local midgame review adds legally reached phases at both seat limits; it
changes local projections only and cannot write rooms. Evidence and practical
limits are recorded in `docs/evidence/stable-play-2026-11-02/non-deal`.


## Decision information

Deal card/set inspection has separate keyboard/touch controls, labelled rent
ladders, completion, current buildings/rent and exact legal rent previews; see
`deal/README.md`. Selected Uno effects, blackjack visible totals, Teen Patti
blind/stake state, actual Hold’em settlement, Skyjo final turns and public Gem
token holdings use authorized projections. Gang/Paper completed rounds compact
their existing docks without moving live-phase choices. The per-game interaction
checklist and verification limits are recorded in
`docs/evidence/game-info-2026-11-02/README.md`.
