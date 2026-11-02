# Tarot table

`TarotTable` owns the shuffled three-card selection, optional question, private reading request and saved reading. `TarotReading` preserves each card’s grounded read, quirky read and character connections. Existing readings without astrology render unchanged.

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

`astrology-presentation.test.tsx` covers angle formatting, crowded-label anchor conservation, calculated data tables and legacy reading compatibility. Seven Storybook stories cover each chart, both charts, optional-off, saved, recovered and pending states.

Fixtures are synthetic: J2000 noon at Greenwich and a New York daylight-saving calculation. Positions were produced by the backend calculator. Interpretation layout examples explicitly say “Synthetic layout example”; they are not a production fallback. Retained visual and verification evidence is in `docs/evidence/tarot-astrology-2026-11-02`.
