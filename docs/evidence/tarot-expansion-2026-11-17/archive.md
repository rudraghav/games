# Private saved-reading archive — local verification

17 November 2026. This is constructed-result product verification, not a fresh
provider evaluation or production deployment claim.

Profile history now opens `/readings/{matchId}`. The authenticated API reads the
exact saved solo Tarot match independently of current room membership. It keeps
the saved question, reading layers, chosen cards and optional charts; rematching
or closing the room does not replace them. Reading the archive never generates
new output. Nonparticipants, nonexistent and non-Tarot matches share a 404.

## Checks

- Isolated PostgreSQL: `test_tarot_archive.py`, **8 passed**. Exact stored response,
  no unpicked cards, unauthenticated/outsider/wrong-game rejection, GET-only,
  no-store, repeat reads without writes, rematch and closed-room survival, missing
  historical membership, legacy optional layers, missing/failed/expired/live
  generation and invalid saved payload. Invalid data is kept and yields explicit
  unavailable state without logging private content. The test provider raises if
  called; no provider calls occurred.
- Frontend boundary: `saved-reading.test.tsx`, **2 passed**. Mapping and impossible
  complete/null rejection, strict GET proxy routes and archive-ID redaction.
- Actual local browser/API/database: `tarot-archive.spec.ts`, **4 passed** on the
  final archive UI (1440×1000 desktop and 390×664 phone). Each width exercised an
  ordinary and a Both-astrology result: select three cards, store guarded synthetic
  output, open Profile history, exact question/result readback, reload, chart
  show/hide, rematch, closure, reopen from Profile and exact saved response again.
  A separate guest received 404 for both current and archived reading endpoints
  and a private-unavailable page without the question or reading. Zero generation
  submissions; all test-owned rooms closed and outsider contexts closed. Phone
  cases also checked both navigation controls, chart show/hide and overflow at
  320px before restoring the 390px capture. Cleanup runs in `afterEach` with a
  fresh 45-second budget and records each room immediately from its creation
  response, including when later navigation assertions fail.
- Web TypeScript and scoped ESLint passed. Owned diff has no whitespace errors.
- Final desktop Both and phone ordinary screenshots visually inspected: titles,
  stacked reading layers, card art, reference portraits and chart layout fit
  without document overflow. Four screenshots are retained in the local output
  folder; this is not an exhaustive visual inspection of the expanded catalogue.

The fixture writer requires development auth, a loopback database, exact fresh
QA room/match/actor, the selected three cards and no previous reading. It refuses
hosted targets and cannot overwrite historical output. Durable fixtures live only
in these closed local QA rooms. The isolated database was automatically dropped.

## Evidence and limits

Compact logs and final screenshots:
`output/playwright/tarot-expansion-20261117/archive/` (5.1 MB). The rerender reused
that folder; no duplicate traces/videos, dependencies or services were created.
The maintained tests/helper are source. Existing web/API/Storybook/PostgreSQL were
retained. Root owns the full integration gate, deployment and hosted-provider
proof. Browser results use constructed ordinary/Both content; older-payload and
incomplete-state assertions here are backend tests, not new real model outputs.

## Expanded-reference follow-up

The browser fixture now uses six canonical expanded-library identities (three
people and three fictional characters), including long names and newly framed
portraits. Added assertions decode the exact six assets and verify names, sources
and copy bounds at desktop/phone sizes and 320px. This follow-up has not yet run:
the final browser gate was paused when the requested catalogue scope expanded
past 5,000 references. The four passing cases above establish archive behavior
before these additional reference assertions; they are not a passing claim for
the later fixture version.

Separate diagnostic browser renderings of eight corrected people and seven
accepted fictional-character crops were inspected at exactly 88×110 using the
shared portrait CSS. `corrections-88px.png` and `fiction-corrections-88px.png` are
in the evidence folder; the latter also records one rejected Ahab crop. These
diagnostic fixtures are not saved-room tests. Source metadata patches were handed
to the asset owner; this agent did not edit shared manifests. The temporary named
browser was closed, and no provider call was made.
