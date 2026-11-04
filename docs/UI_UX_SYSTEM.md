# Games design system

Read-only board cells use named semantic elements, not labels on generic empty
containers. Four in a Row exposes every square and occupant as a named image.
Mancala labels include the public owner, pit/store and seed count on both the
main board and overview. These do not add focus stops or move controls.

Azul exposes draft colours/counts, pattern-line contents and fit/overflow,
wall row/column/colour/occupancy, and floor contents/penalties through semantic
labels. Empty floor positions distinguish potential penalties from the current
score. The centre/floor first-player marker has an explicit identity. Tile art
remains decorative; static descriptions never become extra move controls.

Trio keeps its concise visible Lowest/Highest text and adds the public target
player to each control's accessible name. Unrevealed ranks stay private.
Party choices remain selected during same-round updates from other players;
new prompts start unselected, including advancement from another tab. The server's
locked state takes precedence over a transient local draft.

Crowded public assets wrap within the player's collection; inspectable casino
previews stay bounded. Do not validate only an outer seat's rectangle: verify its
painted card contents and neighbouring rows. Rails keep intrinsic card spacing
constant when overflow navigation appears. Full boards can use the typed
`navigationPosition="below"` variant to keep controls outside the board canvas.
Measure overflow before paint so navigation appearing on the first selection
cannot move the action area.
The current per-game density/action matrix is in
`evidence/crowded-actions-2026-11-02`.

Warm ivory lounge; dark ink, muted sage and terracotta accents. Cards combine
large readable ranks/actions, documented SVG playing-card faces and original
illustration atlases. Casino tables use
deep pine felt, warm rails, clear seat positions, pots and compact action controls.
Property games show banks and property collections; rummy supports hand groups;
Skyjo uses a 3×4 grid. Never shrink a full desktop table into an unreadable phone.

One token source in `@games/ui`: colours, type scale, spacing, radii, borders,
shadows and motion. One shared primitive layer, typed variants, accessible
Radix dialogs/sheets, Lucide icons, reduced-motion-aware Motion animations.

Game layouts compose shared cards, hands, piles, seats, chips, action controls,
chat and rule sheets. Features own composition, packages own vocabulary. Use
minimum 44px hit areas, visible focus, labels for icon controls, rank/action
symbols alongside colours, keyboard selection, and click alternatives to dragging.

Reference research: https://playdeal.io/ and Zynga's official App Store gameplay
screenshots. Reuse interaction ideas, create Games-owned artwork and components.

Storybook covers primitive variants, table layouts, crowded/maximum hands,
pending/disconnected states and narrow viewports.

The catalogue composes shared GameTile and ChoiceGroup primitives, with a labeled
search field and group-size select. Fixed seat counts and solo play use concise
metadata. Filters intersect and offer a reset from an empty state. Mancala pits
and stores use a typed MancalaPit variant; Checkers extends the shared board
renderer with source/destination selection and visible crowns.

Browsing keeps search, category pills and group controls in deliberate rows.
Phone category pills scroll inside their own rail; keyboard focus reveals the
selected filter without widening the page. Co-op discovery reads the engine's
play-mode metadata. Search accepts familiar names, punctuation and accented input;
Clear search and Escape preserve the category/group, while Reset filters restores
all choices and returns focus to search. One live result count follows the
controls. Phone hero actions occupy full rows, and tile subtitles remain readable
so unfamiliar games can be understood before opening room setup.
Room setup uses a compact profile row with an optional 44px avatar picker, a segmented Friends/Bots choice and a seat selector. Room-name and rule controls are inside Room options. Submit and Cancel occupy separate full rows, with the primary action first, at every width. Form changes preserve the same
shared create/join/configure behavior and are documented with inspected captures
in `evidence/browsing-2026-11-01`.

Actions remain beside the objects they affect. Deal presents opponents, stock,
own bank/sets, then a hand and contextual move composer. Casino tables lead with
the public table and keep private cards/actions together directly below it on
compact screens. Skyjo keeps the viewer's grid first; pile actions sit beside
their source. Rank sorting uses actual playing-card order. Current screenshot
findings and the 27-game review matrix live in `evidence/gameplay-2026-11-02`.

The app icon follows the existing sage diamond and coral period from Wordmark.
`apps/web/src/app/icon.svg` is the editable vector source; `favicon.ico` is its
16/32/48/64-pixel compatibility export, discovered through Next.js file metadata.
Catalogue grid artwork supplies its own inherited card dimensions, so mobile
playing-card defaults cannot enlarge decorative Skyjo ranks or affect game hands.

Modern games reuse the table/action vocabulary: Flip 7 shows readable personal
number runs and Hit/Stay decisions; Trio separates private sorted hands, public
hand-end requests and stable memory slots; Azul uses tile shapes alongside color,
factory sources and explicit pattern-line placement. Party games share one
prompt/choice/reveal table and typed projection validator, with distinct original
poster variants. Games remain registry-driven rather than special room routes.

Tarot's artwork registry maps every canonical ID to an original atlas rectangle.
SVG viewports preserve illustration proportions and clip neighboring cells;
WebP delivery reuses eight cached atlases. No minor card falls back to pip art.
The deck dialog filters all 78 cards without accessing hidden shuffled order.
Readings compose a shared pure presentation component: normal and quirky panels,
then explained character connections; phones stack these in reading order.
Storybook includes all 78 cards, each suit, legacy/fresh readings and pending states.

Character connections use actual character artwork or in-character film/TV
images. The active 48-image `character-art-v2` registry excludes performer
headshots and cosplay. A shared `TarotCharacterImage` owns the consistent 4:5
frame, character alt text and direct local WebP delivery. Source credits are
expandable and distinguish copyrighted references from CC/public-domain images;
attribution never implies an open license. Unknown saved references remain text.
Both readings and the complete-cast Storybook review use the same image frame.
The former photo assets and their provenance remain archived, outside the active
registry. Current review lives in `docs/evidence/tarot-characters-2026-11-02`.

Room presentation uses the personalized legal actions and simultaneous-decision
metadata to distinguish Your turn, Your decision, locked choice, paused and
complete states. The shared TurnNotice exposes these as a polite status update;
the horizontal phone player strip reveals the current actor without moving the
page vertically. Lobby names wrap instead of concealing their identities.
Phone room headers keep the title and compact toolbar in one row. Invite, ready/start and
shared move buttons occupy full rows with at least 44px targets. Secondary host
controls and leaving live behind the vertical room-options kebab, in the shared
Radix dialog with grouped rows and a separate destructive confirmation. Controlled
dialogs restore focus to their opener when closing without replacing the dialog.

The banner is said from the viewer's seat (`games/shared/turn-state.ts`). Engine
messages are instructions for the seat that can act, so only that seat sees
them; waiting seats see who they are waiting for, response windows separate the
turn owner from the responder ("Your response", "You owe a payment"), an
eliminated seat reads "You’re out", and Word Agents names the guessing team. A
"Last move" line repeats the latest public move from room history with its
actor, public cards, targets and amount (`features/room/move-description.ts`).
Commit buttons inside a TableDecisionPanel or DecisionDock sit in a sticky
`data-decision-actions` footer and docks may size to content (`size="fit"`), so
no legal control scrolls out of reach. Decision panels focus their container on
open, so holding Space peeks at the table. An unsent choice is kept per tab with
`useTableDraft(scope, initial)`, scoped to one decision. Board games keep 44px
targets: boards fit without scrolling from 360px; below that Reversi, Checkers
and Mancala fall back to the scrolling rail rather than shrink squares.

At match end (except solo Tarot) the room shows the banner, results, the rematch
lobby and then the final table. Results list winners first, use singular units,
and rank No Mercy eliminations below the players still in, last out first. A
failed move appears in a dismissible note pinned to the top of the viewport and
clears once the table moves on.

Result composition follows the server winner IDs and catalogue play/score
metadata: cooperative defeat is a team result, penalty scores sort low first,
and games without meaningful scores retain player identities without invented
points. Storybook covers reactions, saving, disconnection, team defeat, low-score
results and no-score results. The current screenshot audit and its limits are
recorded under `docs/evidence/room-audit-2026-11-01/README.md`.

Illustrated game pieces share an AtlasArt viewport and semantic wrappers:
BoopPiece selects kitten/cat and coral/blue variants; PaperCardArt selects one of
14 original ocean symbols, and PaperPlayingCard composes it with readable type,
color name and rule text. Complete cells use proportional meet alignment.
Masters and reproducible WebP derivatives live in public/game-art; run
`node scripts/prepare_game_art.mjs` after deliberate master changes.

Catalogue metadata owns playMode, scoreLabel and scoreOrder, validated at the
API-client boundary from generated wire fields. Results use these fields instead
of guessing scoring semantics from a game ID. Unscored results still show every
participant; cooperative loss is a team defeat, not a tie.
Saved profile history uses the same declared outcome semantics and score units:
team defeat/victory, penalty points, net chips, or an unscored match label.

Table density follows the player's next decision. Casino private cards and
controls share a dock after the public table. Crowded seats use separated bands;
the canvas itself, rather than
only the viewport, selects the grid fallback. Split blackjack hands keep their
own cards, wager and active outline. Betting inputs expose a full 44px target.
Card-game piles use compact frames beside the hand, with actions below both.

New original district and ceramic atlases use the existing AtlasArt primitive.
GemDistrictArt selects one of 15 color/tier scenes or a patron crest; AzulTileArt
selects six distinct patterns. Whole illustration cells use proportional meet
alignment. Text, cost tokens and interaction states remain accessible UI outside
the decorative art. Gem opponent engines and Azul opponent boards retain public summaries with optional Inspect views;
required patron/placement decisions stay exposed. Felt, wood and plum material
variants reuse one three-strip atlas without replacing card labels or controls.

AtlasArt clips the exact source cell before proportional meet alignment. The clip
prevents neighboring illustrations from painting into a rectangular letterbox;
CSS overflow alone cannot establish that boundary. TokenArt reuses six original
wooden discs, marble and poker-chip pieces; Mancala keeps numeric seed counts
visible above representative piece artwork. Phone board dimensions and paddings
live with the owning board rules so late imports cannot hide columns or counts.
The complete 52-scenario phone/desktop audit and inspected samples are recorded
in `docs/evidence/table-refresh-2026-11-01`.

The home starts with a compact title/action row and shared SegmentedTabs for Games / Rooms. Games shows the catalogue alone. Rooms groups active/waiting and finished memberships with empty, loading and retry states. Search and Players share one
control row; category pills scroll beside a fixed, labeled Reset control. The
announced result count stays visually hidden to give games more first-fold space.
At 320px the secondary header Create action uses its labeled icon, while the
main home actions retain full phone rows. Exact name/alias matching has a bounded
Fuse.js typo fallback after category and group-size filtering. Solo + bots shows
all bot-capable formats and Tarot. Room chat starts collapsed and opens beside
the table on wide screens or in a shared sheet on phones.

The standard PlayingCard variant uses all 54 pinned, licensed vector faces.
Shedding cards separate their action icon, rank and short name. Deal cards use
named title deeds, printed rent schedules, distinct bank notes and action icons
with concise effects. District illustrations belong to Gem Market. Card selection and real labels stay in
the shared accessible control. See `docs/REUSE_RESEARCH.md` for provenance.

Bots have explicit seat labels, host-only add/remove controls, an automatic
versioned move driver and a retry action for interrupted moves. Bot capability
comes from the generated catalogue rather than a second frontend game list.
Word Agents explains finite category-clue support; party responses are labeled
as simulated. Bots never impersonate people or use the Tarot generation API.

Casino motion follows committed, consecutive authorized snapshots. Exact public
payments travel from rendered actor seats to the pot; visible results travel back
to winning stacks. The viewer stays first, the current seat shares one moving
outline, and a readable latest-action cue persists. New permitted cards reveal;
split hands move known faces and expose the active hand inside their own rail.
The single casino-layout query container chooses ring/grid layout from available
canvas width. Controls and numbers update immediately, with no animation delay.
Reduce Motion changes apply during play. Refresh, skipped versions, rematches,
background and reconnect snapshots do not replay history. No other player's
hidden identity enters the animation model. See the inspected before/after and
complete legal playback evidence in `evidence/casino-motion-2026-11-01`.

Catalogue covers compose the same canonical card faces, property metadata and
original piece/ceramic/district atlases used by tables. Decorative cards retain
readable ranks and real effects. Skyjo cover cells and shedding fans size to their
poster containers; boards keep their actual 8×8 or 7×6 shapes. Shithead has its
own stacked hidden/face-up cover. No additional UI kit or duplicated token layer
is needed. Dashboard stories cover discovery, solo tiles and member shortcuts;
phone/desktop screenshots and private-entry checks live in
`docs/evidence/dashboard-2026-11-01`.

Tarot character images are bounded 400×500 WebPs. Deliver their local
public paths directly (`Image unoptimized`), retaining intrinsic dimensions,
lazy loading and alt text. The root image-optimization URL returned 404 in the
production Vercel Services arrangement despite direct originals returning 200;
real hosted image decoding is a release check, alongside the asset hash check.

Uno and Deal consume canonical metadata in one shared renderer. Deal has all28
US property names, ten rent schedules and24distinct action effects; wild/rent
bands print both names and orientation stays separate. Full cards use126×178px
frames and compact table cards80×114px. Hands separate card faces with a gap;
horizontal scrolling preserves legibility instead of covering neighbouring text.
The281-face inventory retains each named property and legal wild orientation at
normal/compact sizes. Two widths check1,124instances, including instructions and
rent cells. Historical card-inventory evidence remains; current review is in
`evidence/gameplay-2026-11-02`.

Deal uses authoritative collection counts, completion and rent from the server.
Each set can reveal its printed property checklist and rent ladder. Selecting a
card exposes only personalized legal moves, including exact existing/new pile
destinations. Banking has an explicit confirmation. Payments select actual bank
or property assets and show value, amount remaining and overpayment; a bank-only
suggestion never automatically commits collateral. Counter prompts identify the
actor, target, amount and blocked state while keeping the board available.
Changing a target or cancelling banking clears the previous move selection.

Shithead reuses the licensed standard-card faces with separate selectable hand
cards and public face-up/anonymous hidden rows. Its original felt center keeps
stock, comparison and burn counts compact; the own decision panel precedes
opponents on phones. Optional rule labels appear only when enabled. Player-strip
and panel bounds remain inside the viewport, with internal hand/seat scrolling,
44px controls and pending/disconnected states covered by focused checks.

The 2 November card-workspace review keeps the casino felt before the private
hand/decision dock, with compact opponent seats below that dock. Uno highlights
server-legal cards without hiding inspectable cards. Rummy/Skyjo draw controls
sit on their matching piles; Skyjo's viewer grid comes first in DOM order.
Shithead keeps own zones together and preserves sorting across match revisions.
Yellow Uno text uses measured 4.5:1-or-better ink in both card sizes. Complete
281-face paired sheets and focused behavior/visual evidence are retained in
`docs/evidence/card-workspaces-2026-11-02`.

Stable gameplay uses shared DecisionDock variants with bounded internal scrolling and a persistent clear/status slot. Deal has a 96px command bar, a fixed-height hand, compact public opponent summaries and a scrollable owned bank/collection area. On phones, owned properties use named 44px deed rows; full faces remain in the hand and Inspect views. Complex Deal decisions use TableDecisionPanel, a modeless Radix dialog with an explicit peek toggle, Escape/focus restoration and no blocking overlay. Portalled inspectors use their own viewport rules.

HorizontalRail owns overflow detection, external 44px arrows, native touch scrolling and reduced-motion navigation. It reveals focused cards horizontally without moving the page vertically. OpponentPanel owns the public summary/Inspect vocabulary; features provide only authorized public children. RoomActivity displays the latest 80 durable, server-redacted moves with optional public card details. The same sidebar tabs serve chat/activity on desktop and phone.

Current stable-play evidence lives in `evidence/stable-play-2026-11-02`: 235 legally reached projections across all 27 games, critical interaction/geometry checks, and inspected phone/desktop captures. This fixture review is distinct from real saved-room full matches and hosted release checks in the journal.

SegmentedTabs owns labelled tab/tabpanel relationships, one roving tab stop and
Left/Right/Home/End activation. Inactive panels stay mounted but hidden, retaining
search/filter state. Home omits the redundant Games navigation item; its Games
home brand reveals the Games panel. Inner pages retain their Games link. ChoiceGroup
adds a typed segmented variant for form choices. Modal forwards an optional
Escape handler so nested optional controls can close before their parent dialog.
The shared font tokens have valid sans/serif fallbacks when Next font variables
are absent in Storybook; the app keeps its existing DM Sans/Fraunces faces.

Decision-information review is tracked per game in
`evidence/game-info-2026-11-02/README.md`, including layout and unverified branches.
Deal keeps inspection separate from playing: Info opens a readable dialog for a
hand card or public set, including both printed wild groups, set completion and
labelled rent tiers. The table stays in place and nested inspection returns focus
to the exact opener. Azul shows legal-line fit/overflow before placement and keeps
floor penalties visible under occupied slots; the server remains the move judge.

Optional Tarot astrology reuses ChoiceGroup, SegmentedTabs, Button and the existing
private reading flow. Western uses an interactive wheel, Vedic a North Indian
house diagram. Both include accessible selection and placement/house/aspect tables.
The frontend draws only server-calculated positions and names the calculation
convention. The birth form invalidates previews when inputs change and never
persists raw birth details in browser storage.

Audit refinement retains stable decision footprints. Uno uses two-column colour
choices at every width with a 180px desktop / 244px phone dock; long docks have
scroll-edge shadows. Four/Reversi/checkers/Mancala share BoardViewport using existing
HorizontalRail/Modal primitives, with a read-only overview and full-size move targets.
Boop graduation requires preview/confirm; Paper public inspection never takes a
card. Five corrected Tarot cards opt into full-frame SVG fitting. Acceptance
uses normal-height browser frames, not only tall catalogue captures.
