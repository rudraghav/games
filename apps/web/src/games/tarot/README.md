# Tarot table

`TarotTable` owns the shuffled three-card selection, optional question, private reading request and saved reading. `TarotReading` preserves each card’s grounded read, quirky read and character connections. Existing readings without astrology render unchanged.

## Choosing and revealing

- The deck rail is one Tab stop (roving focus): arrow keys, Home and End move between cards, Enter or a tap picks. Labels say what a card is and what it will fill: “Face-down card 5 of 77, for what is shifting”. The heading names the next position: “Choose card 2 of 3 · What is shifting”.
- Empty spread slots are dashed drop targets (“Lands here”), never card backs; the next slot is highlighted.
- After a committed pick, the filled slot scrolls into view, takes focus and briefly highlights, and a polite live region says “You drew <card> for <position>.” A refresh starts from the saved spread without replaying a reveal. On phones a “Choose card N of 3” button below the spread returns to the deck. The public activity line still never names the card.
- Spread position labels and card names are at least 11px and meanings 12px at every width.
- The unsent question is a `useTableDraft` scoped to room and match, so it survives a refresh in that tab and never carries into the next spread; it clears when a reading is saved. Birth fields remain memory-only.
- While a reading is being written, or when readings are unavailable, the reason sits next to the button with “Your three cards are saved.”

## After the reading

- A finished solo room shows “Draw a new spread” at the top of the reading and after its last section. It readies the player and starts the next match in one tap (as room creation does); only the room owner sees it.
- Each card section shows that card as a small thumbnail. With astrology, the chart’s next step is folded into the single “Your next small move” block.
- Image credits wrap on phones; a credit that is only a URL reads as its site name while the link keeps the full source.
- The Explore-the-deck dialog keeps its heading and suit filter pinned (one swipeable row on phones).

## Optional astrology

Astrology starts off. Turning it on offers Both, Western or Vedic, then requires a birth date, local birth time and a birthplace selected from the authenticated location search. A successful server preview is required before generation. Changing any input, tradition, selected place or daylight-saving occurrence clears that preview; stale search/calculation responses cannot restore it. Repeated local times need an explicit first/second occurrence. Nonexistent local times remain blocked.

- `AstrologyForm` receives typed search/calculation callbacks; it does not own credentials, identity or persistence.
- `AstrologyChart` draws only returned placements. The Western wheel separates labels while retaining exact position dots and leaders. Pointer selection uses the closest visible label, so overlapping touch areas cannot select a neighbouring body. Each body also supports keyboard selection. A native inspector and full placements/houses/aspects tables provide a larger, text-based alternative.
- The Vedic diagram fixes North Indian house positions and displays returned sidereal signs, bodies, nakshatra and pada. It explicitly shows the server’s ayanamsa and geometric-aspect model; it does not claim Lahiri or classical graha drishti.
- `AstrologyReading` renders validated interpretation text and derives the placement lines from the saved chart using its validated `focus_points`. The AI does not supply chart coordinates. Show/hide changes presentation only.
- `astrology-presentation.ts` formats returned angles and projects SVG coordinates; it does not calculate a horoscope.

Both diagrams use the server’s whole-sign houses. Calculation version, source and precision note remain visible. Contract types come from generated OpenAPI through `@games/api-client`.

## Privacy and recovery

Birth fields exist only in component memory. They are never query keys, URLs, browser storage or logs. Search and calculation use authenticated POST bodies. The provider receives computed placements rather than raw date/time/place. Off requests omit both astrology fields and the saved-chart reuse flag.

A failed or interrupted reading can return `astrology_chart`, containing only the computed chart. Refresh restores that chart without restoring birth fields. Retry sends `reuse_saved_astrology`; choosing off sends an ordinary reading request. Completed readings retain their saved interpretation and chart. Room/match identity keys reset ephemeral form state on rematch.

## Verification and fixtures

`tests/browser/tarot-astrology.spec.ts` exercises actual local rooms with intercepted provider/location/calculation responses: ordinary readings, required fields, both diagrams, each planet’s pointer target at 320px, keyboard inspection, saved reload/hide, stale requests, location errors, daylight-saving decisions and failed-chart reuse/opt-out. `GAMES_ASTROLOGY_LIVE=1` additionally uses the real location service and local server calculator while still intercepting AI generation. Never run this synthetic harness against production.

`astrology-presentation.test.tsx` covers angle formatting, crowded-label anchor conservation, calculated data tables and legacy reading compatibility. Seven Storybook stories cover each chart, both charts, optional-off, saved, recovered and pending states (the synthetic chart fixture is imported without an import attribute, which Storybook's bundler rewrote into a crashing `assert`). At 480px and below the Western wheel breaks out of the nested card padding to nearly the full screen width, with larger house numbers and glyphs.

`tests/browser/tarot-table.spec.ts` covers the reveal, roving deck focus, refresh mid-spread, the saved question draft, the pinned deck filter and (with constructed responses, no reading request) the one-tap new spread and phone credits.

Fixtures are synthetic: J2000 noon at Greenwich and a New York daylight-saving calculation. Positions were produced by the backend calculator. Interpretation layout examples explicitly say “Synthetic layout example”; they are not a production fallback. Retained visual and verification evidence is in `docs/evidence/tarot-astrology-2026-11-02`.

## Audit recovery and art refinement

A missing local question draft derives from the saved reading response. Once
edited, even an explicitly empty question remains the user's choice during
background refresh. Room's match-ID key resets drafts on rematch. Raw birth input
remains ephemeral; a pre-1970 note distinguishes uncertain historical civil time
from calculated celestial precision. All corrected card artworks now use the same
full-bleed `slice` framing as the atlas cells (see `public/tarot/README.md`). Desktop/phone recovery tests cover
ordinary/chart retries and edits, with no provider call for a saved read.
