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
