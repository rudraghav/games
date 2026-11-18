# Targeted Tarot retry — 18 November 2026

The user requests reporting the failed check and retrying with it removed.
This release makes the failure's safe check ID and field explicit, passes the
feedback to the next model and grants a request-local exception only to that
field's question grammar. It does not globally disable any check or relax the
correct spread, character, chart, complete-output or privacy contracts.

The loader displays a concise explanation such as “Card 2 wording didn't match
the question format. Retrying without that format.” It survives refresh while
retrying and clears once checking/saving begins. Final failure messages identify
the part and retain the existing retry action. Rejected prose, unknown schema
keys, credentials and private inputs never enter diagnostics.

Checks cover both grounded and legacy Western adapters, all four modes,
provider switching, same-provider correction, unchanged original context,
strict new requests, exact field scope and preserved hard failures. Real provider
calls are separately bounded; synthetic failure tests do not claim a natural
production failure or guarantee all future responses succeed.

Release results and cleanup are recorded in the root journal and the production
receipt after verification. Earlier evidence and failed test runs are preserved.

## Local acceptance

Passed 7,155 backend tests, Ruff/mypy, 224 persistence tests, 44 tooling tests,
generated contracts, frontend types/lint/build and 266 frontend tests. All 48
selected browser cases passed on mobile and desktop; three focused retry-progress
executions also passed. All 51 local QA rooms closed with no provider calls.

The first broad run exposed a real long-context request-budget regression. The
final contract removes an unused chart definition and duplicate length keys that
[Google documents as ignored](https://aistudio.google.com/docs/structured-output),
retaining character-range descriptions and local validation. Worst-case correction
metadata and complete character facts fit the existing request ceiling. Final
backend checks passed after refining generic failure messages; frontend/browser
inputs were unchanged by those backend-only follow-ups.

## Production acceptance

Released `ad5a6ddf41dd6c7b7913111da2b9765489f25c07` once to production with the
canonical alias and source verified. All 28 configuration records, the owner
account/rooms and the schema were preserved. Complete scoped runtime queries
returned no warnings/errors/fatals or HTTP 500+ responses.

One real combined reading completed through Gemini in 21 seconds from loader to
saved-result readback. Both charts, six selected images, settled mobile/desktop
layouts, refresh and archive privacy passed. No fallback occurred in that call;
the new relaxation branch is established by controlled tests. See
[production evidence](production.json) and [hosted evidence](hosted.json).

All 52 task QA rooms were closed. Test contexts/browsers were closed and the user
browser/local services retained. One superseded screenshot and three temporary inspection crops (557,894 bytes)
were removed; final evidence and historical records remain. Documentation-only closure
shares the deployed runtime fingerprint and does not create another deployment.
