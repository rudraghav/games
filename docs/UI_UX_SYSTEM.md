# Games design system

Warm ivory lounge; dark ink, muted sage and terracotta accents. Cards are original
vector/typographic compositions with large readable symbols. Casino tables use
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

Room presentation uses the personalized legal actions and simultaneous-decision
metadata to distinguish Your turn, Your decision, locked choice, paused and
complete states. The shared TurnNotice exposes these as a polite status update;
the horizontal phone player strip reveals the current actor without moving the
page vertically. Lobby names wrap instead of concealing their identities.
Phone room headers give the room title its own row. Invite, ready/start and
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
