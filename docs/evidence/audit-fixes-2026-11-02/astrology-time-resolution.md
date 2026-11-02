# Ephemeral astrology time resolution — 2 November 2026

Successful private chart previews now return optional `time_resolution` with
the canonical IANA timezone and the UTC offset used for the resolved instant.
The form displays the server result beside the preview and clears it on input
changes. Historical Kolkata seconds remain `UTC+05:21:10`; wartime, modern and
chosen DST-fold offsets use the same pinned rules that calculate the chart.
Unresolved/gap times have no resolved offset. The existing ambiguity labels and
new preview share one offset formatter.

The metadata is outside `AstrologyChart`; saved charts, drafts, readings and
provider input remain free of timezone/offset/raw birth details. Private HTTP
preview authorization and no-store behavior remain unchanged. No persistence or
service mutation was necessary. Generated contracts were handed to the parent.

Verified locally:

- `pytest backend/tests/test_astrology.py backend/tests/test_astrology_reading.py backend/tests/test_astrology_geocoder.py -q`: **58 passed**, including 1900/1943/2000 Kolkata, both New York folds and gap behavior.
- `scripts/isolated_backend.py tests/test_astrology_rooms.py -q -k 'preview_and_city_search or generation_saves_only'`: **2 passed**, including ephemeral preview data, private access, persisted-payload omission and provider separation. Disposable DB migrated, checked and dropped.
- `playwright test tests/browser/tarot-astrology.spec.ts --grep 'historical preview|ambiguous local time' --output test-results/astrology-time-resolution`: **4 passed**, desktop/phone. Synthetic preview presentation shows seconds, removes stale resolution on edit, fits horizontally and preserves DST choice/gap behavior. These use the existing mocked provider fixture; no live provider calls.
- Web type-check, scoped ESLint, Ruff, mypy and formatting passed.

The browser helper cleaned every owned room/context. Redundant scoped browser
outputs were removed after verification; unrelated services/data were preserved.
Parent owns final integrated checks and push. No deployment claim is made here.
