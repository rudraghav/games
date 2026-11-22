# Tarot table

`TarotTable` owns the shuffled three-card selection, optional question, private reading request and saved reading. `TarotReading` preserves each card’s grounded read, quirky read and character connections. Existing readings without astrology render unchanged.

## A reading that answers the question

Each card reads in one order, in `CardSections`:

1. **What this card says about your question** (`interpretation`). With no question
   on the page the heading is "What this card says".
2. **The figure.** Fun: "How it could play out" with the portrait, its scene and
   its editorial move, then a tinted block, **What this means for your question**
   (`pop_culture`, the one generated line about the figure; "What this could mean
   for you" with no question). Classic: "Your connections", each a fact and what
   it suggests, with Background collapsed.
3. **The plot twist** (`quirky_interpretation`): an image and what it implies.

A Fun reading saved before the bridge has no `pop_culture` and renders as it did:
portrait first, then "The grounded read" and the plot twist together. A saved
interpretation that is only a question keeps the "The grounded read" heading.
Nothing is rewritten; only order and headings depend on what was saved.

Chart perspectives follow the same rhythm. `chartPoints` splits `normal` into focus
points and shows each as its computed label ("Sun in Sagittarius, house 9"), what
the placement is traditionally associated with, then the sentence that begins
"For your question" with a plum rule beside it. Text saved as one unlabelled
paragraph stays one paragraph; labelled questions from an earlier profile keep
their labels under "The grounded read".

Copy and share (`reading-text.ts`) carry the page's words in the page's order:
each card's reading, its figures with their move, the bridge, the plot twist, any
chart perspective, how it meets the cards, and both next steps. Scenes, portraits,
credits and the chart drawing stay on the page.

The question field keeps its "What’s on your mind?" label and 400-character limit.
Its placeholder invites context: "Ask your question and add what’s going on.
Specifics make the reading more useful." The form keeps its height, because the
progress card that replaces the button must still open on screen at 320 by 740;
a count appears only for the last 100 characters.

## Reversed cards, card pages and the deck rows — 22 November 2026

### Reversed cards

The server decides each card's orientation at the shuffle and sends it only with a
drawn card (`card.orientation` in `match.community`, and `orientation` on each
saved reading section). The web never knows, stores or guesses the orientation of
a card still in the deck, and the deck backs carry no per-card data at all.

- `orientation.ts` reads it (`orientationOf`); anything saved before reversals is
  upright.
- `TarotCard reversed` turns the picture half a circle (`.tarot-card--reversed
.tarot-art`), leaves the name plate upright, prints the word "Reversed" under the
  name and appends ", reversed" to the accessible name. Orientation is never shown
  by rotation or colour alone.
- The spread slot is labelled "Card 2, What is shifting: Ace of Wands, reversed. …",
  carries `data-orientation`, and shows the meaning for that orientation (the
  server's `subtitle`). The reveal flips straight into the drawn orientation; the
  live region says "You drew Ace of Wands, reversed, for what is shifting."
- In a reading: the jump list adds "· Reversed", the thumbnail turns, the card
  heading's pill says `Upright` or `Reversed`, and the copied or shared text says
  "(reversed)". A section's saved orientation wins; an older section falls back to
  the drawn card.

### Card pages

`TarotCardPage` loads `TarotCardGuide` on demand (the guide JSON is about 300 KB and
is not part of the first paint; the gallery preloads it when it opens).

- **A drawn card** (`TarotCardDetail`): the dialog is named after the card, its
  description says the position, what it asks and "Drawn upright." or "Drawn
  reversed.", and the page opens on the drawn side with "Drawn as <position>". The
  other side stays one tap away.
- **The gallery** (`TarotDeckGallery`, "Explore the deck"): all 78 cards in printed
  order behind the pinned suit filter. Every card is a button; the grid is one Tab
  stop with arrow keys, Home and End. Opening a card shows its page in the same
  dialog under a pinned bar: "All cards" (back), "Card N of M" within the current
  filter, and Previous / Next, which wrap. Focus moves to the page heading on
  opening and stays on Previous / Next while turning; Back or Escape returns to the
  same filter and scroll position with focus on that card. A second Escape closes
  the dialog. Every gallery page shows both orientations and opens on Upright: the
  gallery knows nothing about the shuffled deck.

### Drawn cards: hover preview and click

A drawn card is a button from the moment it lands, in every phase (choosing, ready,
reading): `View <name> card`, with `, reversed` when it was drawn that way. A click, tap,
Enter or Space opens its full page (`TarotCardDetail`) and Escape returns focus to the
card. After a draw the slot still takes focus, so Tab from a revealed slot reaches its
card first.

`TarotCardPreview` wraps each spread card and each reading thumbnail and shows a
preview while a mouse rests on the card or keyboard focus is on it: more than the
table shows, clearly less than the page.

- **What it shows**: a larger picture in the drawn orientation (the art turns, the
  name stays upright and the word "Reversed" is printed), "Major Arcana · XIII" or
  "Suit of Wands · Nine", the name, an Upright / Reversed pill, "Drawn as <position>",
  up to five keywords for the drawn side, the one-line `short` meaning, the `essence`
  line and "Click for the full card". Love, work, self, advice, symbols,
  correspondences and questions stay on the page.
- **When**: about 120ms after a mouse arrives (at once when moving from one card to
  the next) or after keyboard focus that shows a focus ring. It closes on pointer
  leave, blur, Escape, any scroll, a window resize and a press. A touch or pen never
  opens it, nor does a device without hover: a tap goes straight to the page. After
  the page closes, focus returns to the card without reopening the preview; it comes
  back when the pointer or focus leaves and returns.
- **Where** (`placePreview`): rendered in a portal with fixed positioning. Beside the
  card, right first and then left, in the wide layout (640px, narrowing to 500px);
  above or below when there is no room beside; in a narrow window the picture and
  heading share a row and the rest runs underneath (400px at most). It always stays
  8px inside the viewport and 12px clear of its card, and grows out of the card's
  centre. When neither side has the height it drops the essence line and shows three
  keywords before anything is cut.
- **Accessibility**: the panel is a `role="tooltip"` with `pointer-events: none`; it is
  never a dialog and never takes focus. The picture is `aria-hidden`. The card's
  `aria-describedby` points at hidden text, "Keywords: … . <short meaning>", so the
  same line is heard on focus whether or not the panel is on screen (until the guide
  has loaded it is the drawn meaning alone). The plain "Open the full card" tooltip is
  gone from these cards, so two popups never show together.
- **Motion**: a 160ms scale-in on `--ease-out`; with reduced motion a 100ms fade.
- **Loading**: the preview needs the card guide (about 300 KB). It is fetched when the
  page is idle after a drawn card appears, or at the first hover or focus, and is the
  same chunk the card page uses.

Styles are in `packages/ui/src/styles/tarot-preview.css`, with the drawn card's own
hover (lift and stronger shadow), press and focus states. While choosing, the spread
lies on the light canvas, so its focus ring is `--color-focus`, not the velvet's.

### The deck rows

`TarotDeckPicker` lays every remaining card in three overlapped rows inside
`HorizontalRail`'s native scroller: wheel, trackpad and touch drag with the browser's
own momentum, `scroll-snap-type: x proximity` on card edges, no custom physics. Cards
fill each column from the back row to the front, then the next column, and each row
starts a little further right than the one behind it. About 24 backs show across a
390px phone and about 60 across a 1440px desktop (one row showed 8 and 30).

- One tap or click on a back reveals it. There is no separate lift-then-confirm step.
  The rest of a double click or a burst of taps is dropped for 400ms, so one gesture
  never reveals two cards; a rejected save re-arms the deck at once.
- Each back's target is its visible strip: `--fan-step` (44px) wide and, behind the
  front row, `--fan-row-step` (46px) tall. The front row, and the very last card, use
  the whole height of the back.
- A back that is pointed at, pressed, focused or being drawn comes up above every
  other card, so the whole of it shows. While its draw is saved it stays raised with
  the foil highlight.
- "Cards 14–42 of 77" on the velvet follows the scroll. It is not a live region:
  each back already says "Face-down card N of M, for <position>".
- The bar under the deck (`.tarot-deck-scrub`, a native range input named "Scroll the
  deck") can be dragged by a finger or the pointer through every card; the arrows
  beside it page by about a screenful (instantly under reduced motion). It is hidden
  when the whole deck is in view.
- One Tab stop for the backs. Left and Right move along a row, Up and Down between
  rows, Home and End to the first and last card (`deckStep`); focus scrolls the deck
  with it, and Enter or Space reveals the focused card.
- A finger drags the deck (sideways) or the page (vertically).

## Reading style

After the third pick the Fun mode switch is on for a fresh spread. Its visible info hint describes both styles. Turning the switch off selects Classic. The choice stays with the question draft through refresh. The submitted style comes back from the reading service for recovery, retry and archive rendering. Fun moves the illustrated character connection before the card interpretation under **How it could play out**. The opt-in hosted browser check accepts `GAMES_TEST_TAROT_STYLE=fun` to exercise the full result, images, refresh, private archive and closed-room flow with a real provider.

The completed table and saved archive offer the same Fun switch. Both open on the original saved reading. The alternate presentation uses the selected cards and existing interpretation without a new draw or provider call.

## Oracle table

The velvet, transparent crystal instrument and engraved printed backs are three
original GPT Image assets. The decorative equatorial ring is projected in CSS
3D and passes behind and in front of the crystal. The ring leans toward the card
being drawn. A mouse shifts the apparent viewpoint, card pitch and foil
highlight. Paper edges and the raised outline also mark the chosen card when
motion is reduced. Only the pictured surfaces tilt; hit lanes retain their
positions, and pointer rendering does not run while the table is idle.

## Choosing and revealing

- The face-down deck comes first: every remaining back in overlapped rows in front of the oracle sphere (see "The deck rows" above). Tap or click a back to reveal it in the named spread position. One tap is the whole pick, and a revealed card stays.
- Previous and next controls page through the full deck. The deck uses one Tab stop. Arrows, Home and End move focus, and Space or Enter reveals the focused card (a held key never repeats the draw). The screen reader hears the card’s ordinal and destination.
- Empty spread slots have dashed outlines. Only the next slot is highlighted and labelled.
- After a committed pick, the filled slot scrolls into view, takes focus and briefly highlights, and a polite live region says “You drew <card> for <position>.” A refresh starts from the saved spread without replaying a reveal. On phones a “Choose card N of 3” button below the spread returns to the deck. The public activity line still never names the card.
- Spread position labels and card names are at least 11px and meanings 12px at every width.
- The unsent question is a `useTableDraft` scoped to room and match, so it survives a refresh in that tab and never carries into the next spread; it clears when a reading is saved. Birth fields remain memory-only.
- Loading the saved spread shows “Checking status…”; a failed read offers only “Check status”, a GET, and generation stays disabled until authoritative state returns. Paused/offline rooms cannot submit readings.
- `ReadingAction` keeps one surface mounted: the primary action expands into the processing card, with a short height, color, corner and content transition. The old action becomes inert and hidden from assistive technology. The card reports the actual saved stage: preparing, matching character references, writing, retrying with a provider, checking, or saving. A failed request first checks whether a reading was saved; only then does the surface return to “Retry reading”. One concise failure message sits beside it.
- Motion never delays a request or a completed reading. Reduced motion changes state immediately; refresh restores the expanded card without replaying the morph. Keyboard focus moves from the submitted action to the processing surface and returns to the available action after failure, unless the user moved focus elsewhere.

`ReadingProgress` renders the server's optional progress snapshot, mapped at the
API boundary. The percent is explicitly estimated and capped at99 while running;
the remaining time uses coarse estimates and becomes “Taking longer than
expected…” when the server can no longer estimate it. No browser timer invents
stages, resets a saved attempt's start, or marks a pending reading complete.
Before a snapshot arrives, the loader is indeterminate. Recovery reads say
“Checking your saved reading” without replaying stale timing. Only stage changes
are live-announced; numeric estimates do not repeatedly interrupt screen readers.
A failed-check retry may include one bounded, server-authored explanation beneath
its stage, naming the failed part and any relaxed presentation rule. This detail
survives progress polls and refresh while that retry runs, then disappears during
checking/saving. Saved-status recovery never repeats stale failure details. The
browser displays the explanation as text and never exposes raw provider output.

Polling starts during the initial POST and continues every two seconds while
generation/recovery is active, including after refresh. Success cancels in-flight
status reads before caching the completed reading, so a late pending response
cannot erase it. An explicit submission scrolls the processing card into view
once, after expansion. If a later explanation makes that locally requested card
taller, it stays in view only while the surface still owns focus and the user has
not scrolled or interacted elsewhere. Refresh, unchanged-height polls and
background updates preserve scroll. Reduced motion makes following immediate.
The pattern follows Shikha's current server-driven ExamRunWatcher; its older
timer-invented stages are not copied. Existing icons/tokens and reduced-motion
rules provide the presentation without another dependency.

## After the reading

- The completed reading displays its exact saved question.
- A finished solo room shows “Draw a new spread” twice: a quiet secondary button beside the Fun switch at the top, and the primary button after the last section. It readies the player and starts the next match in one tap (as room creation does); only the room owner sees it.
- Each card section shows that card as a small thumbnail button that opens the full card. With astrology, the chart’s next step is folded into the single “Your next small move” block.
- Image credits wrap on phones; a credit that is only a URL reads as its site name while the link keeps the full source.
- The Explore-the-deck dialog keeps its heading and suit filter pinned (one swipeable row on phones).

## Optional astrology

On phones the question form uses the table's existing gutter instead of another
padded card. Astrology grids own their field spacing, so the shared field's
outer margins do not accumulate with grid gaps. Input and button hit areas stay
unchanged. The final next-step block uses 16px phone padding; reference accents
retain a smaller 10px inset, leaving more width for the explanation text.

Astrology starts off. Turning it on offers Both, Western or Vedic, then requires a birth date, local birth time and a birthplace selected from the authenticated location search. A successful server preview is required before generation. Changing any input, tradition, selected place or daylight-saving occurrence clears that preview; stale search/calculation responses cannot restore it. Repeated local times need an explicit first/second occurrence. Nonexistent local times remain blocked.

- `AstrologyForm` receives typed search/calculation callbacks; it does not own credentials, identity or persistence.
- `AstrologyChart` draws only returned placements. The Western wheel separates labels while retaining exact position dots and leaders. Pointer selection uses the closest visible label, so overlapping touch areas cannot select a neighbouring body. Each body also supports keyboard selection. A native inspector and full placements/houses/aspects tables provide a larger, text-based alternative.
- The Vedic diagram fixes North Indian house positions and displays returned sidereal signs, bodies, nakshatra and pada. It explicitly shows the server’s ayanamsa and geometric-aspect model; it does not claim Lahiri or classical graha drishti.
- `AstrologyReading` renders validated interpretation text and derives the placement lines from the saved chart using its validated `focus_points`. The AI does not supply chart coordinates. Show/hide changes presentation only.
- `astrology-presentation.ts` formats returned angles and projects SVG coordinates; it does not calculate a horoscope.

Both diagrams use the server’s whole-sign houses. Calculation version, source and precision note remain available under “How this chart was calculated”. Native hover hints repeat the chart selection labels; touch and keyboard inspection remain available without hover. Contract types come from generated OpenAPI through `@games/api-client`.

The wheel, North Indian diamond, inspection panel and placement/house tables
use original square WebP illustrations from `public/art/zodiac`. Each marker
uses the sign index returned for that system and placement. Vedic placements
show the rashi name alongside its English counterpart. Mithuna, Dhanu, Makara
and Kumbha have their own illustrated emblems. The other eight share a motif
across traditions. [Rashi names](https://www.drikpanchang.com/astrology/prediction/info/find-rashi-with-name.html?lang=en)

## Privacy and recovery

Birth fields exist only in component memory. They are never query keys, URLs, browser storage or logs. Search and calculation use authenticated POST bodies. The provider receives computed placements rather than raw date/time/place. Off requests omit both astrology fields and the saved-chart reuse flag.

A failed or interrupted reading can return `astrology_chart`, containing only the computed chart. Refresh restores that chart without restoring birth fields. Retry sends `reuse_saved_astrology`; choosing off sends an ordinary reading request. Completed readings retain their saved interpretation and chart. Room/match identity keys reset ephemeral form state on rematch.

The authoritative `failure` response carries a safe code, short message,
`retryable` flag and optional `retry_at` epoch time. Its policy survives refresh.
Quota cooldowns keep generation disabled, including after question edits; expiry
only enables the button and never submits. An unavailable service offers no Retry;
its server-supplied recheck time permits only a GET availability check. A blocked
question permits a fresh request only after a non-whitespace question change.
Session/access failures use existing profile/back navigation. Client transport
errors never display raw provider/browser messages or trigger automatic POSTs.

The form names the server's configured `provider_names` before submission; model
names and credentials are not exposed. The Google free-tier data-use sentence is
shown only when Google Gemini is among those providers and the tier is free.

## Verification and fixtures

`tests/browser/tarot-astrology.spec.ts` exercises actual local rooms with intercepted provider/location/calculation responses: ordinary readings, required fields, both diagrams, each planet’s pointer target at 320px, keyboard inspection, saved reload/hide, stale requests, location errors, daylight-saving decisions and failed-chart reuse/opt-out. `GAMES_ASTROLOGY_LIVE=1` additionally uses the real location service and local server calculator while still intercepting AI generation. Never run this synthetic harness against production.

`astrology-presentation.test.tsx` covers angle formatting, crowded-label anchor conservation, calculated data tables and legacy reading compatibility. Seven Storybook stories cover each chart, both charts, optional-off, saved, recovered and pending states (the synthetic chart fixture is imported without an import attribute, which Storybook's bundler rewrote into a crashing `assert`). At 480px and below the Western wheel breaks out of the nested card padding to nearly the full screen width, with larger house numbers and glyphs.

`tests/browser/tarot-table.spec.ts` covers the reveal, roving deck focus, refresh mid-spread, the saved question draft, the pinned deck filter and (with constructed responses, no reading request) the one-tap new spread and phone credits. It also verifies solo setup/menu controls, DOM deck order and saved-spread GET error recovery without generation.

The astrology suite also holds a recovery GET open to reject duplicate submits,
checks both quota cooldowns across reload with a saved chart, proves time expiry
does not POST, distinguishes edited blocked questions, and checks unavailable
service recovery through GET only. All reading/provider responses are intercepted.

Fixtures are synthetic: J2000 noon at Greenwich and a New York daylight-saving calculation. Positions were produced by the backend calculator. Interpretation layout examples explicitly say “Synthetic layout example”; they are not a production fallback. Retained visual and verification evidence is in `docs/evidence/tarot-astrology-2026-11-02`.

## Audit recovery and art refinement

A missing local question draft derives from the saved reading response. Once
edited, even an explicitly empty question remains the user's choice during
background refresh. Room's match-ID key resets drafts on rematch. Raw birth input
remains ephemeral; a pre-1970 note distinguishes uncertain historical civil time
from calculated celestial precision. All corrected card artworks now use the same
full-bleed `slice` framing as the atlas cells (see `public/tarot/README.md`). Desktop/phone recovery tests cover
ordinary/chart retries and edits, with no provider call for a saved read.
Six of Wands and Four of Pentacles now use dedicated original masters with
six distinct staffs and four complete coins. Their gallery and spread crops
retain the counted symbols at phone and desktop proportions; all forty numbered
minor cards now meet the inventory count assertion without an exception.

## Expanded people and character references

The source-backed catalogue now spans fictional characters and notable people
from acting, science, history, politics, sport, literature and music. Every active
reference has an exact name/source identity and a credited local portrait or
character depiction. A real person's portrait is never used as a substitute for
a role they played. Historical artwork is a depiction, not a verified lifetime
photograph. The importer retains explicit exclusions and crop decisions.

The backend selects a small, category-balanced shortlist for each card; the
provider must use an identity from that card's shortlist. This keeps request
size bounded as the library grows. Real-person connections concern public work
and achievements without inventing private beliefs or implying endorsement.
The expanded registry is loaded with the Tarot table, not every game's table.

Profile history opens `/games/tarot/readings/[matchId]`, preserving the specific saved
question, cards, interpretation and optional charts after a new spread or room
closure. Reading it never regenerates text. The participant-only endpoint returns
404 to other people, including other room visitors. See
`features/reading/README.md` for archive behavior and verification.

## Expanded scene and artwork presentation

`TarotCharacterImage` is shared by current and archived readings. Person and
character portraits remain112px on desktop and88px on narrow screens. Meme
scenes and labelled artist works receive176px on desktop, then stack above the
explanation up to240px on phones. Meme files retain4:3 or4:5 composition; actual
images are never replaced by the actor who played the scene. Original generated
art and artist-work references have distinct visible captions. Credits include
the work title, actual image source and honest rights category.

The archive browser fixture now exercises all six image types with real eligible
assets: person, fictional character, religious figure, meme, artist work and
original illustration, including long names at320/390/1440px. Constructed text
checks layout/privacy/persistence; real-provider quality is a separate gate.

## Mobile layout and controls

Solo entry starts directly without a setup form or multiplayer invite instructions.
The phone toolbar keeps rules and Reading options, with saved readings and a
return to Tarot. Multiplayer rooms retain their own toolbar actions.
Icon controls have accessible names and native hover hints.

On phones a portrait and subject name share one row, followed by a full-width
connection paragraph. Wider meme/artwork scenes keep their complete composition.
When a saved connection includes catalogue evidence, a closed native Background
disclosure follows that paragraph. It preserves the exact supplied text, uses
the existing 44px disclosure target and does not add another card or border.
Earlier readings without evidence retain their original presentation. The archive
browser fixture checks 600-character text, keyboard/touch disclosure, narrow
wrapping, refresh and room closure without generation.
The astrology form uses a divider within the question box rather than a second
padded box. Saved astrology uses a section divider, a full-row show/hide control
on narrow phones, and expandable calculation details. Main reading/new-spread
actions use a full row and wrap when necessary; charts remain visible by default.

### Card-first visual polish

Normal Tarot turns use the local heading/action state instead of a duplicated
room turn banner; paused/offline notices remain. A compact heading and deck icon
bring enlarged card choices into the initial phone viewport. The rail's44px
controls sit below the cards, sharing their row with the browsing hint. Empty
spread slots do not reserve blank meaning paragraphs. Recovery lobbies retain
ready/open-deck controls without multiplayer invitation chrome.

Enabled cards have a small press response; a committed pick retains focus and a
short reveal. Reading sections enter with a brief fade/rise. Reduced motion
disables these animations. A single12ms optional Vibration API call follows only
a local, committed pick on a visible page. Failure, refresh and reduced motion
produce none; unavailable/denied hardware never blocks the UI. Automated browser
checks establish call timing, not physical feedback or iPhone support.

Visual references inspected: [Purrweb Tarot](https://dribbble.com/shots/25947541-Tarot-Mobile-iOS-App)
and [Nixtio Tarot](https://dribbble.com/shots/27667144-Tarot-Reading-Mobile-App-UI-UX-Design).
Only card prominence, typography hierarchy and restrained depth informed this
implementation; source artwork remains the app's existing assets. Optional
haptics follow the [Vibration API](https://www.w3.org/TR/vibration/) visibility
and browser-activation behavior.

## Reading polish — 21 November 2026

### What the table says

Once three cards are drawn the spread sits on the same velvet as the deck, with
gilt position labels and light meanings. The heading states what is happening,
and one status line beneath it says the cards are safe:

| State               | Heading                            | Status line                                                                  |
| ------------------- | ---------------------------------- | ---------------------------------------------------------------------------- |
| Ready               | Your three-card spread             | Add a question if you like, then ask for your reading.                       |
| Writing             | Writing your reading…              | Your three cards are saved while the reading is written.                     |
| Service unavailable | Readings are unavailable right now | Your cards are saved. You can ask for your reading once the service is back. |
| Browser offline     | You’re offline                     | Your cards are saved. Reconnect to ask for your reading.                     |

The line is present in every state, so asking for a reading changes its words in
place and never pushes the form down. `data-reading-state` on `.tarot-table`
carries the same state for styling. While
writing, a slow light passes over each saved card and the status marker breathes;
`ReadingProgress` keeps the only live announcement. The unavailable and offline
lines are `role="status"`, and the unavailable state no longer repeats the
server's message beside the disabled button. A finished room whose saved reading
is still loading shows `ReadingSkeleton` instead of the question form.

### The finished reading

Order: title, “You asked” with the exact saved question, the Fun switch and a
secondary “Draw a new spread”, the spread, then `TarotReading` with `summary`:

- **In short** floats over the lower edge of the velvet as glass (opaque surface
  fallback). It holds the introduction as the one-sentence synthesis, the next
  small move, and three jump links to the card sections. On phones the links are
  a three-line contents list with 44px rows.
- **Card sections** state the position, the card, how it was drawn (`Upright` or
  `Reversed`, from the saved section) and what the position
  asks (`spread.ts`, worded to match the service's `POSITION_FOCUS`). The grounded
  read is plain 16px text at a 64-character measure; the plot twist is a tinted
  aside; Fun connections come first as before.
- **Thumbnails and spread cards** are buttons that open `TarotCardDetail`: the
  card's full page on the side it was drawn, with its position. Only cards
  already drawn by this viewer can be opened. Spread cards become buttons after
  the third pick, so the deck's single Tab stop is unchanged while choosing.
- **Your next small move** closes the reading, followed by `ReadingShare`: Copy
  reading (plain text from `reading-text.ts`: title, question, synthesis, each
  position and card with its grounded read, the next step; no portraits, credits
  or charts), the device share sheet when the browser has one, and a link to the
  private saved copy. Image credits come last.

Orientation is saved with each drawn card and each reading section (see
"Reversed cards, card pages and the deck rows"). The saved-reading page uses the same component without `summary`,
`question` or `savedHref`; its own header already shows the question and
introduction.

### Motion

All motion is transform/opacity, 320ms or less for transitions, and off under
reduced motion. A local pick turns over in its slot: the chosen back swings away,
then the face swings in (`tarot-flip-back`, `tarot-flip-face`). The new card is
marked during render, so its face is never painted before the turn. The back is
decoration over a card the server has already returned to this viewer. The deck
fans out once when it is first laid down (`data-entering`, removed after 700ms);
cards that regroup after a pick do not replay it. Openable cards lift on hover
and press on tap.

### Contrast and type

Computed pairs, recorded at the top of the polish block in `tarot-reading-v2.css`:

- The shared muted ink (#77796e) is 4.0:1 on the canvas. Inside Tarot scopes
  `--color-ink-muted` is #5c5f55: 5.9:1 on canvas, 6.4:1 on surface, 5.2:1 on
  ochre-light, 5.0:1 on plum-light.
- On velvet (72% dark wash; brightest pixel #4f333f): labels 7.8:1, meanings
  8.7:1, body 9.4:1.
- The glass panel is 90% surface: over velvet, ink 11.5:1, muted 5.2:1, plum 5.6:1.
- Plot-twist text is #4f3a53 on plum-light, 7.8:1. Next-step label 5.6:1.

Astrology: weights are 500/600, table sub-labels are 11px, wheel house lines and
aspect lines are 3.6:1 and 3.8:1 against the surface (were 2.2:1 and 2.3:1), and
interpretation text follows the reading's 16px/1.7 measure.

### Verification

`tests/browser/tarot-table.spec.ts` covers the summary, jump links, position
lines, the card dialog from a thumbnail and from the spread, focus return, the
clipboard text, the flip and its reduced-motion fallback, the three table states
with constructed responses, velvet text contrast, and the refused-invite message.
`apps/web/src/tests/tarot-reading.test.tsx` covers the summary, copy text,
skeleton and position lines. No reading is requested by any of them.
