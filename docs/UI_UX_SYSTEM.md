# Games design system

On Roulette and Slots, the wheel or payline shows the saved server result. Editing a stake or bet updates its preview. Spin commits the wager and locks the controls until the result arrives. Reduced motion keeps the same outcome and receipt. Wager controls have at least a 44px touch target on a 320px phone.

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
search field and one row of occasion chips (see "Home page" below; the earlier
group-size select and category pills were removed). Fixed seat counts and solo
play use concise metadata. Search and an occasion intersect and the empty state
offers one way back to every game. Mancala pits
and stores use a typed MancalaPit variant; Checkers extends the shared board
renderer with source/destination selection and visible crowns.

Pop Tarot was once a full-width featured tile on the home catalogue. It is now
one compact tile like every other game, in its discovery slot, so no game is
shown twice or larger than the rest; its Start reading action is on its own
game page.

Browsing keeps search and the occasion chips in one deliberate row (two on a
phone). Phone chips scroll inside their own row; keyboard focus reveals the
chosen one without widening the page. Search accepts familiar names, kinds of
game, punctuation and accented input; Clear search and Escape preserve the
occasion, while Show all games (the empty state) restores everything and
returns focus to search. One live result count follows the controls. A tile
shows a name and one line; a game's blurb and rules are on its public game page.
Game tiles are real links with an Open game accessible name. Game entry reuses
GameArt, semantic Button variants and a labelled rules disclosure. The phone view
keeps art, title and full-row play actions together without a large hero gap.
Tarot starts from Start reading; multiplayer offers Play with friends and Play
with bots. Bot-filter links emphasize bots without auto-starting. Pending buttons
show Starting…; failed starts retain the request for Try again. An expired session
requires the explicit Start a new reading/game action. Secondary history/join
links stay below the main actions. A closed, labelled **Rules & tutorial**
disclosure opens the game objective, captioned pictures and a topic-organized
rules reference. The optional tutorial action belongs inside the rulebook.
The same document is available from the table, where eligible players get a
switch for the current match.
Room setup uses a compact profile row with an optional 44px avatar picker, a segmented Friends/Bots choice and a seat selector. Room-name and rule controls are inside Room options. Submit and Cancel occupy separate full rows, with the primary action first, at every width. Form changes preserve the same
shared create/join/configure behavior and are documented with inspected captures
in `evidence/browsing-2026-11-01`.

Actions remain beside the objects they affect. Deal presents opponents, stock,
the private hand and command bar, then own bank/sets with a contextual move composer. Casino tables lead with
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
poster variants. Game pages remain registry-driven and share the same room renderer.

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

Deal faces live in one stylesheet (`packages/ui/src/styles/deal-cards.css`). A
face is a colour header (kind and value pill), a body and a rent-ladder foot,
and the card is its own size container, so one set of rules serves the hand,
compact, board-row and cover sizes. Each property colour is a trio: a fill, the
text colour that sits on that fill, and a deep shade for the same hue as text on
the cream card; every pair is 4.5:1 or more and each property also names its
colour in words. A two-colour wild leads with the colour it is played as, an
any-colour wild and any-colour Rent use the ten-colour spectrum as a gradient,
Rent keeps the action header with a gradient ribbon and disc, and money keeps a
paper header tinted by denomination so it never reads as a set or an action.

Shared finish (`polish.css`): cards and buttons share hover lift, press,
selected ring and a processing sweep shown on the played card and the commit
button while a move saves. `TooltipLayer` gives any element with `data-tip`, and
any button or link with a `title`, one styled tooltip on hover or keyboard focus
(never on touch). `ActionToasts` shows at most three small notifications in the
bottom-right corner (top-right, one at a time, on phones) for notable public
moves only: anything aimed at a player, counters, steals, raises, declarations
and Deal actions; routine draws, banks and passes stay quiet. They repeat public
room history, never private state, and never replay on reload. Glass surfaces
(tooltips, notifications) always keep an opaque fallback.

Result composition follows the server winner IDs and catalogue play/score
metadata: cooperative defeat is a team result, penalty scores sort low first,
and games without meaningful scores retain player identities without invented
points. Storybook covers reactions, saving, disconnection, team defeat, low-score
results and no-score results. The current screenshot audit and its limits are
recorded under `docs/evidence/room-audit-2026-11-01/README.md`.

Illustrated game pieces share an AtlasArt viewport and semantic wrappers:
BoopPiece selects kitten/cat and coral/blue variants; PaperCardArt selects one of
14 original ocean symbols, and PaperPlayingCard composes it with readable type,
color name and rule text. Complete cells use proportional meet alignment. Unevenly packed atlases may
provide an explicit source rectangle; Gem districts use measured bounds rather
than assuming equal grid cells. Gem market cards reserve equal art, title, cost
and action rows so all costs and status remain visible at phone and desktop sizes.
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

The home starts with a compact title/action row and shared SegmentedTabs for Games / Your games. Games shows the catalogue alone. Your games groups active/waiting and finished sessions with empty, loading and retry states. Search and Players share one
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

Stable gameplay uses shared DecisionDock variants with bounded internal scrolling and a persistent clear/status slot. Deal keeps a fixed command-bar footprint, a stable hand, compact public opponent summaries and content-sized owned bank/collection rows. On phones, owned properties use named 44px deed rows; full faces remain in the hand and Inspect views. Deal card selection immediately opens TableDecisionPanel, a modeless Radix dialog with named action CTAs, an explicit peek toggle, Escape/focus restoration and no blocking overlay. Its compact toolkit exposes up to three exact choices, with All N moves/properties and Fewer moves/properties expanding or collapsing the same panel without changing a partial swap. Complete legal choices commit from their labelled row; Forced Deal retains only the take/give decisions. Bank conversion is explained beside its direct CTA, outside the scrolling card-choice area so it cannot cover focused rows. Complete No Mercy Take/Keep/Give choices use direct rows too; payments and counteractions keep their existing review controls. Portalled inspectors use their own viewport rules.

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
labelled rent tiers. Public property cards without legal actions and unplayable hand cards also open information on click. The table stays in place and nested inspection returns focus
to the exact opener. Azul shows legal-line fit/overflow before placement and keeps
floor penalties visible under occupied slots; the server remains the move judge.

Optional Tarot astrology reuses ChoiceGroup, SegmentedTabs, Button and the existing
private reading flow. Western uses an interactive wheel, Vedic a North Indian
house diagram. Both include accessible selection and placement/house/aspect tables.
The frontend draws only server-calculated positions and names the calculation
convention. The birth form invalidates previews when inputs change and never
persists raw birth details in browser storage. Optional fields use a divider within
the question form; saved astrology uses a section divider and stacks its show/hide
control on narrow phones. Calculation metadata lives in a keyboard-accessible
native disclosure; chart selection stays available by touch, keyboard and text
inspector, with matching native hover hints. Phone reference portraits and names
share a row while their explanations use the full available width. Tarot's deck
precedes the spread in DOM and visual order, and main actions wrap without clipping.

Audit refinement retains stable decision footprints. Uno uses two-column colour
choices at every width with a 180px desktop / 244px phone dock; long docks have
scroll-edge shadows. Four/Reversi/checkers/Mancala share BoardViewport using existing
HorizontalRail/Modal primitives, with a read-only overview and full-size move targets.
Boop graduation requires preview/confirm; Paper public inspection never takes a
card. Five corrected Tarot cards opt into full-frame SVG fitting. Acceptance
uses normal-height browser frames, not only tall catalogue captures.

Tarot puts the current spread position above a layered crystal-and-brass instrument on velvet. The equatorial ring turns toward the active card. With a mouse, perspective and foil light follow the pointer. A reduced-motion preference uses the original art, fixed highlight, and raised edge. The face-down deck sits in front of the sphere in the first phone viewport, in three
overlapped rows: about 24 backs across a phone and most of the deck across a wide table.
The pictured card may overlap its neighbours, while each touch target keeps its own
strip of at least 44px. One tap or click on a back reveals it; a back that is pointed
at, pressed or focused comes up above the others first. A sideways swipe scrolls the
deck, the bar under it can be dragged through every card, and page controls and
keyboard navigation reach every remaining back. Vertical swipes scroll the page.
Reduced motion raises the back without an animated transition. A
supported device can pulse when a local draw is confirmed. The illuminated slot
and spoken card name communicate the same result on every device.

The reading form shows a **Fun mode** switch with an info button and a one-line description of Fun and Classic underneath. The description starts visible. The button can hide or show it without moving the form, and Escape dismisses it. Completed Fun cards put the example and its possible consequence first under **How it could play out**. The active room and archive use the same reading component so the order and source images survive reopening. The completed table and saved archive share the Fun mode switch. A view change preserves the spread and existing words. An alternate Classic view foregrounds the card meanings and the saved grounded reflections. An alternate Fun view shows the matched illustrated example for each card.

Tarot generation morphs its primary action into one compact processing card. A
420ms grid expansion preserves text size while color, corners and content fade
between states. The previous action is inert/hidden; keyboard focus follows the
surface and returns to the available action on failure. Requests and completed
results never wait for animation. Restored progress appears fully expanded.
The card contains one actual server-stage line and an accessible estimated progress bar. Percent and
rounded remaining time share a row on320px screens. Slow estimates become Taking
longer than expected; starting/status recovery is indeterminate. The live region
announces stages without announcing every estimate tick. Only an explicit new
submission scrolls this region into view after expansion. Later content growth
can keep that locally requested, focused card visible; scrolling or interacting
elsewhere stops following. Unchanged-height polls and restored sessions preserve
scroll. Native reduced-motion preferences make the state change
immediate and stop the spinner and meter transitions.

## Room setup and invitations

Styles live in `packages/ui/src/styles/room-setup.css`; no new tokens.

- **Bots stepper**: two 44px round buttons ("Fewer bots", "More bots") around an
  `output` that announces the count. Shown in Friends mode only.
- **Bot players**: one row per bot, a name input and a segmented Easy / Medium /
  Hard `ChoiceGroup`; side by side from 441px, stacked below it. One line states
  what each level means. A name clash is an inline alert under the rows.
- **Bot seat (lobby)**: `Seat` with a chip-shaped native select for the level, a
  Rename icon button and Remove. Renaming replaces the name with an input through
  the `nameEditor` prop, with Save and Cancel buttons; focus returns to Rename.
  On phones the controls take their own row inside the seat. Non-hosts see the
  level as the seat badge.
- **Invite panel**: the centre of an unfilled lobby (sage tint while a seat is
  open). Code at 30 to 42px in tabular figures, the short link as selectable
  text, then Share / Copy link / Copy code. On phones each action is a full
  row, like Ready and Start; from 760px they sit in one row. A reserved status
  line confirms each action, so nothing moves.
- **Username search**: a labelled search field, 250ms debounce, at most eight
  rows (avatar, name, @username, Invite). The results area has a fixed height
  and keeps earlier matches, dimmed, until new ones arrive, so the Ready and
  Start buttons below never shift. Empty, failed and rate-limited searches are
  one plain sentence each. Invited players are listed with a Cancel button.
- **Username field**: a label, an @ drawn beside the input (never sent), the
  rule as helper text, Save and Remove, a status line and the server's message
  for a taken, reserved or invalid name.
- **Room code field**: numeric keyboard, digits grouped as typed, a helper line
  and "My code has letters" for an older code.
- **Home invitations**: sage cards above the tabs with the inviter's avatar, one
  sentence, and Join / Decline; the buttons take a full row on phones.

Every control is at least 44px high, has a visible label or accessible name and
the shared focus ring; confirmations use `role="status"` and refusals
`role="alert"`. Layouts hold at 320px without horizontal scrolling.

## Secret Santa

Styles live in `packages/ui/src/styles/secret-santa.css`; no new tokens. The
cover (`SantaArtwork`) is an original inline SVG of two wrapped gifts and a name
tag with a question mark, drawn with the shared colour tokens.

- **Organiser page**: a centred intro (step, the event title, one sentence) and
  a reserved status line (`role="status"`) that says what was saved: "Added
  Sam.", "Title saved.", "Names drawn. Each person now has a private link.".
  Cards stack in one column; from 960px the event and groups sit beside the
  people (or the links). The room's turn banner and results panel are not used.
- **Event card**: a sage summary of the saved date, location and budget, then
  labelled inputs. A native date input, with the saved date in words under it.
  Clear is a 44px icon button named for its field. An unsaved value keeps an
  ochre border and a one-line note.
- **People and groups**: rows of avatar, name, chips ("Can’t draw: Priya" in
  coral, "Group: Household" in sky) and actions. On phones the actions take
  their own row. Removing a person who has rules asks once in place.
- **Checklists and confirmations** use the shared `Modal`: 48px rows with a 24px
  tick box whose label is the whole row, a count, then Save and Cancel.
- **Draw names** is the one large primary button. Disabled, it carries the
  server's reason in an ochre note linked with `aria-describedby`.
- **Links list**: name, Opened (pine, with a tick) or Not opened yet, then the
  actions. On phones two actions share a row and a third takes its own; from
  560px they sit on the name's row. A reserved status line confirms copies.
- **Pass the phone**: one pine card that replaces the page content while it is
  open, with the name at 34 to 60px and a full-width Hide. Focus moves to the
  card and back to the opener.
- **Private link page**: one centred card. The name is not in the page until
  the person taps; details are a two-column list; the page links only home.

Every control is at least 44px, has a visible label or an accessible name that
includes the person or group it acts on, and the shared focus ring. Layouts
hold at 320px without horizontal scrolling. Reduced motion removes the button
lift and uses instant scrolling.

## Tickets, progress and rewards (23 November 2026)

### Ticket

`Ticket` (`@games/ui`, `styles/ticket.css`) is the ticket and coupon shell: a
body and a stub joined by a dashed tear line, with a semicircular notch cut
from each edge where they meet. The notches are real holes (a CSS mask on each
piece), so the surface behind shows through on ivory and on dark felt, and the
soft shadow (a drop-shadow filter) follows the cut shape. There are no images.

- It is layout only. Content stays ordinary HTML with its own headings, labels
  and buttons; `aria-*`, `role` and `data-*` land on the outer element, which
  can be a `div`, `li`, `article` or `section`.
- `variant`: `default`, `success` (sage paper: redeemed, in use, opened),
  `muted` (grey paper, lighter shadow: locked, nothing to do).
- `layout`: `auto` stacks the stub under the body below 620px and puts it
  beside the body above; `row` and `column` hold one arrangement.
- `stubSide`: `end` (default) or `start`. `shape="tag"` adds an eyelet for a
  gift tag. Without a stub it is one piece with no tear line.
- In forced-colours mode the masks are dropped and both pieces get a border.

Used for: invitations on the home page (answers on the stub), the lobby invite
panel (the room code on the stub), each person's row in Secret Santa and the
private link page (gift tags), and reward coupons (the cosmetic on the stub).
Do not use it for ordinary cards or panels; a ticket means "this is yours to
use, redeem or hand over".

### Level ring, streak and badges

- `LevelRing` (sm 38px, md 48px, lg 88px): a sage arc on a muted track with the
  level number inside. With a `label` it is one image ("Level 3, 40 of 150 XP
  toward level 4"); beside written numbers it is decoration.
- Progress is always measured against the player's own past. There are no
  leaderboards and no comparisons with friends.
- A streak is shown only as it stands: a flame and "4-day streak", with "Play
  today to keep it going" only while a streak exists and today has no game.
  No streak means no streak line (the rewards page says "No streak yet"). Never
  write that a streak was lost, broken or missed, and never add a countdown.
- A badge that is earned and one that is not differ by more than colour: a
  check and "Earned", or a thin bar and "3 of 10".
- Anything that loads later (the line under a result, the status line on the
  rewards page) reserves its height first. The header chip sits in the header,
  so the page below it never moves.

### Avatar frames

`Avatar` takes `frame`. The five frames are inline SVG on a 100-unit square,
36% wider than the avatar so they sit just outside it at 32, 42 and 56px:

| id | shape |
| --- | --- |
| `frame-gold` | two plain rings |
| `frame-laurel` | a wreath of leaves, open at the top, tied at the bottom |
| `frame-flame` | a thin ring with flames over the top half |
| `frame-confetti` | loose squares, dots and triangles all the way round |
| `frame-crown` | a thin ring with a crown on top |

They differ by shape, not colour alone, and the laurel and crown carry a pale
edge so they read on pine felt. A frame is `aria-hidden`; the avatar's name is
unchanged. An unknown id renders the plain avatar. Pass a member's `frame`
wherever a player's avatar is drawn.

### Card backs

Four designs restyle `.playing-card--back` (and the turn-over back) under
`[data-card-back='<id>']`, set on the room root from the viewer's own profile:

| id | fill | pattern |
| --- | --- | --- |
| `back-midnight` | navy | scattered stars |
| `back-sunrise` | terracotta | rays from the bottom edge |
| `back-emerald` | green | a diamond lattice |
| `back-royal` | plum | gold pinstripes |

Each keeps the white paper frame, the inner keyline and the round "g." seal,
so a compact back in an opponent's hand still reads as a card back, and each
changes the pattern as well as the colour. The standard pine back stays the
default with no attribute. Tarot's deck back is separate and untouched.

### Rewards copy

Rewards are earned by playing and redeemed in the app. Never show a price, a
currency, a timer, "claim now" or an outside offer. States are named plainly:
Locked, Ready to redeem, Redeemed, In use. Buttons say what they do: Redeem,
Use, Take off, Use standard back.

### Home page

Two sections only: **Start**, then **Browse**. The eye should land on the
headline, then the filled button, then the search box and the occasions, then
the grid.

- **One headline, three actions.** "How do you want to play?" with Play solo,
  Create room and Join a room, each a different verb with one short caption.
  Only the first is filled: the accent colour belongs to the primary action
  and to nothing else on the page. Wide screens show three equal cards in one
  row; phones show the primary button full width and the other two side by
  side under it, so all three and the first tiles fit a 390x844 screen.
- **One library, nothing repeated.** A search field, one row of at most six
  occasion chips and one grid. Each game appears once. There are no rails, no
  "See all", no featured banner and no second set of filters; kinds of game are
  search words. A chosen chip is ink on paper turned round (ink fill, light
  text), not a second accent.
- **Compact tiles.** A cover, the name and one quiet line ("2–10 players ·
  10–20 min"). No card, border or resting shadow around a tile; a cover lifts
  slightly on hover. Five columns from 1200px, four from 960px, three from
  620px, two below. Cover art is scaled whole into the smaller poster.
- **Hierarchy from size and space.** One type-scale step between the headline
  (30 to 46px), a section heading (22 to 26px) and body text (12 to 15px). No
  border where spacing can do the job, and at most one shadowed surface in a
  section (the invitation ticket).
- **Demoted, not removed.** Progress is a 44px chip in the header. An
  invitation is one slim ticket above the headline, only while one exists. A
  game in progress is one text line under the actions. Your games is a quiet
  text tab on the Browse heading's row, drawn with `SegmentedTabs`
  `variant="text"` (same tab roles and keys as the filled variant).
- **Nothing else.** No promotional banner, welcome copy or explanatory
  paragraph. The "For teams" note appears only while that occasion is chosen
  and is backed by a documented allowlist (see the lounge README).
- Reduced motion, 44px targets, visible focus and 320px without sideways page
  scrolling hold as everywhere else. Size check for the default view: about
  1,800px tall at 1440x900 and about 3,150px at 390x844, with the first tiles
  in the first viewport at both.
