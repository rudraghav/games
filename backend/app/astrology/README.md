# Private Tarot astrology

Astrology is an optional reflective layer for the solo Tarot participant. It is
off by default. The server computes positions before requesting interpretation;
Gemini never supplies planetary placements, signs, houses or chart geometry.
Both, Western only and Vedic only use the same deterministic calculation path.

## Calculation conventions

- `astronomy-engine==2.1.19` (MIT) computes apparent geocentric tropical ecliptic
  longitudes in the true ecliptic/equinox of date. Sun, Moon and the eight planets
  use `Ecliptic(GeoVector(..., aberration=True))`, rather than heliocentric
  longitude. The library targets approximately one arcminute; this is an
  interpretive chart, not an astronomical navigation instrument.
- Western charts use the tropical zodiac. Vedic charts use **True Chitrapaksha**:
  Spica is anchored at sidereal 180 degrees. This is explicitly **not Lahiri**.
  The implementation transforms the documented SIMBAD ICRS/J2000 Spica position
  into the true ecliptic of date. Its fixed-J2000 anchor omits proper motion;
  supported dates are 1900 through today. Small differences from another
  implementation's apparent-star convention are expected. No claim of exact
  Swiss Ephemeris interchangeability is made.
- Both systems use whole-sign houses. The Ascendant is the eastern intersection
  of the ecliptic and local horizon; the Midheaven is calculated independently
  from local sidereal time. The MC is not forcibly assigned to the tenth house.
  Undefined rising angles near the poles return an explicit unsupported-location
  issue, rather than a guessed chart.
- North and south mean lunar nodes use the IERS 2003 fundamental-argument
  polynomial, with a short nutation correction to the true equinox. Vedic charts
  label them Rahu/Ketu (mean node); the south node is exactly opposite the north.
  Vedic placements include the seven classical bodies and both nodes. Western
  placements also include Uranus, Neptune and Pluto.
- Retrograde flags compare signed longitudes a quarter-day before and after the
  instant. Major geometric aspects use conjunction, sextile, square, trine and
  opposition, with 8-degree luminary orbs and 6-degree other orbs. The Vedic view
  labels these as geometric aspects, **not classical Jyotish graha drishti**.
  Moon nakshatra/pada use 27 equal sidereal divisions from Ashwini.

Runtime code is Games' mathematics plus the permissively licensed astronomy
library. Swiss Ephemeris is not a dependency and its AGPL code is not bundled.
Independent numeric references from a test-only isolated installation validate
angles and sidereal samples to the declared arcminute tolerance.

## Birth location and civil time

The private POST city-search endpoint accepts a bounded city query only. It uses
Open-Meteo's GeoNames geocoder; selection is an opaque `geo:<id>`. Before preview,
the server resolves that canonical ID again and validates coordinates and IANA
timezone. Clients cannot supply arbitrary coordinates or a UTC offset.

`tzdata==2026.6` pins historical IANA rules independently of the host operating
system. Local times must round-trip through UTC. A skipped DST time is rejected;
a repeated time requires an explicit first/second occurrence, including zones
with half-hour changes. Historical offsets containing seconds are retained.
No browser timezone or present-day offset substitutes for the birth location.

Geocoding has a six-second timeout, a 128 KiB response limit and a bounded
ten-minute/256-place cache. Only city text or canonical place ID goes to the
geocoder; date and time never do. Search is a POST to Games so city text is not
in Games URL/query logs. External request failures use a generic safe error.
GeoNames via Open-Meteo attribution (CC BY 4.0) accompanies search responses.
The public Open-Meteo endpoint is free for noncommercial use; Games' current
private, free friend-room use fits that restriction. Review that service's terms
before introducing commercial use.

## Authorization, persistence and recovery

Both preview endpoints require the current match ID and its sole Tarot
participant. Outsiders receive no chart/location data; old match IDs conflict.
The service releases its transaction before external lookup or provider work and
rechecks authoritative state afterward. Because sessions retain committed ORM
objects, those rechecks explicitly expire the earlier snapshot before relocking.
Tests cover a rematch during generation and an expired-lease retry superseding
an older in-flight attempt.

Raw date, time and birthplace are neither persisted nor passed to Gemini. They
exist only in the request and the browser's unsaved draft. The server stores
the **computed chart only** in the existing private reading JSON while generation
is pending. A failed request or refresh can expose that chart to its owner for an
explicit retry (`reuse_saved_astrology: true`); it requires no further geocoding.
An ordinary retry omits astrology and clears the old computed draft. Completed
readings retain their own computed chart and interpretation. Legacy and ordinary
readings omit the astrology field entirely and are never regenerated on read.
No database migration is needed.

`pop-tarot-6` adds interpretation to the existing Tarot call. It supplies compact
computed placements, conventions, aspects and nakshatra only. For each selected
system the response must choose two or three allowed `focus_points` and name the
corresponding canonical body, sign and house in its normal text. Validation
rejects ungrounded, duplicate, swapped or unknown anchors, unexpected systems and
model-produced positions. Quirky text is separate, followed by a Tarot connection
and a next step. There is one combined provider call and no automatic astrology
retry or fabricated fallback. The existing 16,000-character request guard,
3,600-token output cap, deadline, saved lease and transactional daily budget apply.
Failure logs retain exception class/count only, never birth input or provider text.

## Verification

Pure tests live in `test_astrology.py`, `test_astrology_geocoder.py` and
`test_astrology_reading.py`; persisted authorization/recovery/race tests live in
`test_astrology_rooms.py`. The latter run through the isolated database helper.
References use synthetic J2000 Greenwich inputs rather than anyone's birth data.
NASA/JPL apparent geocentric samples cover five bodies; independent Swiss
references cover ASC, MC, whole-sign cusps, mean node and sidereal Sun/Moon.
Horizon checks cover eastern/western longitudes in both hemispheres. Time tests
include New York gaps/folds, Lord Howe's half-hour fold, Apia's skipped day and
historical Kolkata seconds/wartime offsets. Provider tests cover all three
system choices, ordinary opt-out/legacy omission, grounding and private canaries.

Primary references reviewed 2 November 2026:

- [Astronomy Engine source and license](https://github.com/cosinekitty/astronomy)
  and [Python coordinate/API documentation](https://github.com/cosinekitty/astronomy/blob/master/source/python/README.md).
- [SIMBAD Spica astrometry](https://simbad.cds.unistra.fr/simbad/sim-basic?Ident=Spica).
- [Sidereal reference conventions](https://www.astro.com/swisseph/swisseph.htm)
  (True Chitrapaksha, section 27).
- [IERS fundamental argument in ERFA](https://github.com/liberfa/erfa/blob/master/src/faom03.c).
- [NASA/JPL Horizons manual](https://ssd.jpl.nasa.gov/horizons/manual.html):
  Earth centre `500@399`, OBSERVER quantity31, 2000-01-01 12:00 UTC.
- [Open-Meteo geocoding API](https://open-meteo.com/en/docs/geocoding-api),
  [free-service terms](https://open-meteo.com/en/pricing) and
  [GeoNames data attribution](https://www.geonames.org/export/).
