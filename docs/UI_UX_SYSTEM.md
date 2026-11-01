# Games design system

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
Room setup uses a scoped avatar grid with 44px pressed-state choices, stacked
phone fields, and full-width submit/cancel rows. Form changes preserve the same
shared create/join/configure behavior and are documented with inspected captures
in `evidence/browsing-2026-11-01`.

Action panels participate in document flow so they cannot obscure private cards.
Deal hand/decisions precede the collections; phone casino decisions precede the
seat grid; Skyjo's direct-grid instruction precedes the grids. Rank sorting uses
actual playing-card order. The table audit and phone/desktop regression evidence
live under docs/evidence/tables-2026-11-01.

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

Character connections pair each recognized reference with a local licensed
performer or explicitly labeled cosplay photograph. Captions state the role;
expandable source/license credits deduplicate by character, preserving distinct
characters played by the same performer. Unknown or mismatched saved references
stay text-only. Portrait/copy columns and long names fit320/390/1440 with keyboard
accessible credits; inspected examples and checks live in
`docs/evidence/tarot-portraits-2026-11-01`.

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
controls share the first row on wide canvases and stack before the public table
on phones. Crowded seats use separated bands; the canvas itself, rather than
only the viewport, selects the grid fallback. Split blackjack hands keep their
own cards, wager and active outline. Betting inputs expose a full 44px target.
Card-game piles use compact frames beside the hand, with actions below both.

New original district and ceramic atlases use the existing AtlasArt primitive.
GemDistrictArt selects one of 15 color/tier scenes or a patron crest; AzulTileArt
selects six distinct patterns. Whole illustration cells use proportional meet
alignment. Text, cost tokens and interaction states remain accessible UI outside
the decorative art. Gem opponent engines and Azul opponent boards are expandable;
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

The home starts with a compact title/action row. Active member-room shortcuts
precede the catalogue; finished rooms follow it. Search and Players share one
control row; category pills scroll beside a fixed, labeled Reset control. The
announced result count stays visually hidden to give games more first-fold space.
At 320px the secondary header Create action uses its labeled icon, while the
main home actions retain full phone rows. Exact name/alias matching has a bounded
Fuse.js typo fallback after category and group-size filtering. Solo + bots shows
all bot-capable formats and Tarot. Room chat starts collapsed and opens beside
the table on wide screens or in a shared sheet on phones.

The standard PlayingCard variant uses all 54 pinned, licensed vector faces.
Shedding cards separate their action icon, rank and short name; property cards
share district art and value/name slots. Card selection and real labels stay in
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


Uno and Deal variants consume canonical colors/effect metadata in one shared
renderer. Deal motifs distinguish all 24 effects and 10 property groups; paired
wild/rent bands print both names, any-color cards expose all colors accessibly,
and orientation stays separate. Card inventory stories cover 245 canonical faces
and every legal wild orientation at normal/compact sizes. Two browser widths
check 980 instances. See card-inventory and compact-live evidence for originals.

Shithead reuses the licensed standard-card faces with separate selectable hand
cards and public face-up/anonymous hidden rows. Its original felt center keeps
stock, comparison and burn counts compact; the own decision panel precedes
opponents on phones. Optional rule labels appear only when enabled. Player-strip
and panel bounds remain inside the viewport, with internal hand/seat scrolling,
44px controls and pending/disconnected states covered by focused checks.
