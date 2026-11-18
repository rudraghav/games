# Tarot table

`TarotTable` owns the shuffled three-card selection, optional question, private reading request and saved reading. `TarotReading` preserves each card’s grounded read, quirky read and character connections. Existing readings without astrology render unchanged.

## Choosing and revealing

- The deck precedes the spread in both visual and keyboard order. The deck rail is one Tab stop (roving focus): arrow keys, Home and End move between cards, Enter or a tap picks. Labels say what a card is and what it will fill: “Face-down card 5 of 77, for what is shifting”. The heading names the next position: “Choose card 2 of 3 · What is shifting”.
- Empty spread slots are dashed drop targets (“Lands here”), never card backs; the next slot is highlighted.
- After a committed pick, the filled slot scrolls into view, takes focus and briefly highlights, and a polite live region says “You drew <card> for <position>.” A refresh starts from the saved spread without replaying a reveal. On phones a “Choose card N of 3” button below the spread returns to the deck. The public activity line still never names the card.
- Spread position labels and card names are at least 11px and meanings 12px at every width.
- The unsent question is a `useTableDraft` scoped to room and match, so it survives a refresh in that tab and never carries into the next spread; it clears when a reading is saved. Birth fields remain memory-only.
- Loading the saved spread has a visible status; a failed read offers a GET-only retry and keeps generation disabled until authoritative state returns. Paused/offline rooms cannot submit readings.
- While a reading is being written, or when readings are unavailable, the reason sits next to the button. Writing can take a minute or two; the saved cards remain available.

## After the reading

- The completed reading displays its exact saved question.
- A finished solo room shows “Draw a new spread” at the top of the reading and after its last section. It readies the player and starts the next match in one tap (as room creation does); only the room owner sees it.
- Each card section shows that card as a small thumbnail. With astrology, the chart’s next step is folded into the single “Your next small move” block.
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

## Privacy and recovery

Birth fields exist only in component memory. They are never query keys, URLs, browser storage or logs. Search and calculation use authenticated POST bodies. The provider receives computed placements rather than raw date/time/place. Off requests omit both astrology fields and the saved-chart reuse flag.

A failed or interrupted reading can return `astrology_chart`, containing only the computed chart. Refresh restores that chart without restoring birth fields. Retry sends `reuse_saved_astrology`; choosing off sends an ordinary reading request. Completed readings retain their saved interpretation and chart. Room/match identity keys reset ephemeral form state on rematch.

## Verification and fixtures

`tests/browser/tarot-astrology.spec.ts` exercises actual local rooms with intercepted provider/location/calculation responses: ordinary readings, required fields, both diagrams, each planet’s pointer target at 320px, keyboard inspection, saved reload/hide, stale requests, location errors, daylight-saving decisions and failed-chart reuse/opt-out. `GAMES_ASTROLOGY_LIVE=1` additionally uses the real location service and local server calculator while still intercepting AI generation. Never run this synthetic harness against production.

`astrology-presentation.test.tsx` covers angle formatting, crowded-label anchor conservation, calculated data tables and legacy reading compatibility. Seven Storybook stories cover each chart, both charts, optional-off, saved, recovered and pending states (the synthetic chart fixture is imported without an import attribute, which Storybook's bundler rewrote into a crashing `assert`). At 480px and below the Western wheel breaks out of the nested card padding to nearly the full screen width, with larger house numbers and glyphs.

`tests/browser/tarot-table.spec.ts` covers the reveal, roving deck focus, refresh mid-spread, the saved question draft, the pinned deck filter and (with constructed responses, no reading request) the one-tap new spread and phone credits. It also verifies solo setup/menu controls, DOM deck order and saved-spread GET error recovery without generation.

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

Profile history opens `/readings/[matchId]`, preserving the specific saved
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

Solo setup omits the one-option Seats field and multiplayer invite instructions.
The phone room toolbar keeps rules and its existing options menu; chat and activity
remain available inside that menu. Multiplayer rooms retain their toolbar actions.
Icon controls have accessible names and native hover hints.

On phones a portrait and subject name share one row, followed by a full-width
connection paragraph. Wider meme/artwork scenes keep their complete composition.
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
