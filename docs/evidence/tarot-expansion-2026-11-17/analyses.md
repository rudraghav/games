# Tarot analysis and flow evaluation — 17 November 2026

## Expanded-catalogue evaluation checkpoint

The initial sections below record the earlier eight-case plan. That baseline
ran nine attempts: seven nonblank cases validated; the blank case failed schema
twice. Manual review found generic virtue analogies and an insufficiently grounded
historical inference. It is not a release-quality acceptance result.

The expanded contract is `pop-tarot-8`: supplied public evidence, meaning-based
shortlists, distinct identity families, explicit general reflection for a blank
question, respectful named religious symbolism, and at most one appropriate meme.
The evaluator now has eleven scenarios: the original eight plus a lighthearted
This Is Fine inbox question, a Nataraja dance/change question and a grief-support
question. The final matrix is bounded to twelve additional provider attempts;
three remain reserved for two hosted saved-room readings. Combined with the
baseline, the task ceiling is twenty-four attempts. No extra inference call is
used to choose references. Before each run the exact current request, catalogue,
index and model integrity are checked; execution remains explicit.

Canonical identity and schema validation do not prove that prose uses the evidence
well. Manual review must assess each concrete analogy, card/position progression,
practical step, blank-question restraint, sensitive tone and astrology grounding.
The prompt treats both the question and public evidence as data; deterministic
request tests check this boundary, without claiming exhaustive injection resistance.
Failed synthetic responses can be diagnosed in exclusive mode-0600 local files;
production logging continues to exclude questions and response text.

Final matrix, hosted results and actual usage are pending the identity/context
freeze. Asset review continues separately and must complete before publication.

## Initial scope and budget (historical checkpoint)

The user authorized fresh reading analysis checks and a reference expansion.
Real provider evaluation remains gated on the release owner's candidate-contract
freeze. Preparing or running the script without `--execute` makes **zero**
provider calls. This document will distinguish planned, synthetic, actual provider
and saved-room evidence as each is obtained.

`scripts/eval_tarot_matrix.py` prepares eight fixed nonpersonal scenarios: two
ordinary, two Western, two Vedic and two Both. It preserves the configured model
(`gemini-3.5-flash-lite`), low thinking, structured output, storage disabled and
the production output/retry limits. Default evaluation budget is nine provider
attempts, enforced before transmission, including ordinary-reading retries.
Authentication, permission and quota failures stop the matrix. Three attempts of
the overall twelve-call task budget remain available to the release owner for
saved-room checks (two submissions, with at most one ordinary-reading retry);
they are not silently consumed here.

Full serialized requests are built by the production `build_reading_request`
function. Preflight records character counts, clearly labeled token estimates,
model/effort, shortlist counts and a request hash. Synthetic chart preflight also
records each location label, computed Ascendant/Sun/Moon signs and houses, and a
chart hash so variation can be checked without logging raw birth profiles.
Actual token/cache usage is
captured from the existing allowlisted provider logs. Questions and raw readings
are saved only in exclusive, mode-0600 files below ignored
`.vercel/tarot-expansion-evaluations/`; no prompts, provider output or credentials
are printed to the terminal. Earlier runs are never overwritten.

The initial `pop-tarot-7` dry run covers all eight scenarios, with a maximum
14,304-character request and no network calls. This precedes the expanded data
import and must be repeated on the frozen candidate before execution.

## Planned matrix

The six chart cases use explicitly synthetic instants across six decades and
public city coordinates in both hemispheres. They are not any person's birth
details. One keeps the public J2000/Greenwich benchmark; the others vary date,
UTC time and location. The adapter receives only computed placements. Direct
evaluation does not test geocoding, civil-time/DST resolution, database leases,
saving or membership authorization.

| Case | Mode | Spread | Context |
| --- | --- | --- | --- |
| ordinary-blank | Ordinary | Two of Swords / Justice / Eight of Pentacles | No question |
| ordinary-reset | Ordinary | Tower / Three of Swords / Five of Cups | Volunteer project setback |
| western-rest | Western | Six of Wands / Ten of Wands / Four of Swords | Community performance and rest |
| western-beginner | Western | Page of Wands / Strength / Three of Cups | Beginner at a book club |
| vedic-resources | Vedic | Four / Five / Six of Pentacles | Sharing community garden tools |
| vedic-learning | Vedic | Page of Swords / Eight of Pentacles / Two of Wands | Learning to draw |
| both-boundaries | Both | Queen of Swords / King of Cups / Two of Pentacles | Team kindness, boundaries and deadlines |
| both-change | Both | Death / Six of Cups / Star | Preserving useful traditions through change |

| Chart case | Synthetic instant (UTC) | Public coordinates (latitude, longitude) | Computed Ascendant |
| --- | --- | --- | --- |
| western-rest | 2000-01-01 12:00 | Greenwich: 51.4779, 0 | Western Aries |
| western-beginner | 1990-06-15 03:30 | Sydney: -33.8688, 151.2093 | Western Libra |
| vedic-resources | 1985-09-23 04:45 | Chennai: 13.0827, 80.2707 | Vedic Scorpio |
| vedic-learning | 2010-03-20 18:00 | Tokyo: 35.6762, 139.6503 | Vedic Capricorn |
| both-boundaries | 1975-12-05 19:20 | New York: 40.7128, -74.0060 | Western Taurus / Vedic Aries |
| both-change | 2020-08-11 06:10 | Cape Town: -33.9249, 18.4241 | Western Virgo / Vedic Leo |

The varied-chart dry run validates all six charts through the current `chart_at`
producer, confirms six distinct chart hashes and retains all eight scenarios
within the existing request cap (maximum 14,803 characters before the expanded
reference import). Sun/Moon signs and houses differ across these cases as well.
It made **zero provider calls** and retains the nine-attempt execution budget.

## Review criteria

- Exact card identity/order and supplied chart systems; selected astrology points
  match the calculated sign and house. Schema success alone is not a quality pass.
- Three distinct card/position meanings, including the difficult and minor cards;
  no literal prediction of death, disaster or another person's private thoughts.
- Grounded and quirky sections express the same relevant theme in different
  language; humour targets situations without mocking hardship or identity.
- Named references exist in the permitted candidate pool, have accurate sources
  and a specific defensible parallel. Real-person connections use public work or
  achievements and imply neither private beliefs nor endorsement.
- A small practical next step fits the question; a blank question does not invent
  a biography. Advice remains optional, reflective and proportionate.
- Review reference-category diversity across the sample and identify repeated or
  strained comparisons. Eight outputs cannot establish accuracy for the full cast.
- Image identity, visible fit and credits are reviewed separately from prose;
  successful lookup or decoding alone does not prove that a portrait is correct.

Per-case findings will use pass/concern/not-tested with concrete explanations,
not a universal quality claim or an invented benchmark score.

## Interface and privacy coverage

Existing local browser tests cover optional ordinary reading, Both chart preview,
stale-input invalidation, opt-out, DST ambiguity, failed-chart recovery, explicit
blank/revised question retry, keyboard picks and saved spread refresh.

Focused additions exercise a synthetic generating response across two reloads,
disabled resubmission, preserved question/chart, explicit retry after failure,
and a synthetic lost POST response recovered through the saved-reading GET
without another POST. These tests never contact an AI provider. Independent
guest authorization for both current and archived readings is coordinated with
the archive owner, who maintains the separate archive workflow tests.

The affected browser type check and all 32 desktop/phone cases passed on 17
November. Verification report `verify-5a5e0eb4fa844057a950125c51d7b0fb` correctly
remains **inconclusive** as a final release gate because parallel source edits
changed its fingerprint during execution; the frozen release must rerun it.
The six added recovery cases pass. An initial lost-response assertion compared
visible text with hidden DOM text; comparing visible text across reload fixed
that test-only mismatch, and both corrected cases passed separately and in the
32-case run.

Actual screenshots were inspected for phone generation with a saved chart,
desktop ordinary generation and the recovered phone reading. The selected card
images, names, question, disabled writing state and chart remain readable and
within the viewport. The recovered reading's three text layers and portraits
remain usable at phone width. This confirms layout of synthetic prose, not its
meaning or AI quality. Task-owned screenshots are retained below
`output/playwright/tarot-expansion-20261117/recovery/` and `recovery-lost/`.

`tarot-reading-live.spec.ts` is a separate, explicitly gated release check:
`GAMES_TEST_URL` and `GAMES_TEST_AI=1` are both required. One desktop test creates
two independent readers and makes one ordinary and one Both generation
submission, using real saved responses and a live Greenwich chart preview. It
checks selected reference name/source/portrait mappings and image decoding at
320/390/1440px, exact saved content hashes after reload/rematch/closure, cleared
new-spread fields, profile archive access and reciprocal access denial. A fresh
45-second teardown budget closes only its own rooms through normal endpoints.
No reference is forced solely to make a test pass; coverage is the references
the provider actually selects. Decoding and a registry match still require
visual portrait review. Raw nonpersonal readings are retained only in mode-0600
ignored test outputs; traces are disabled and equality failures compare hashes.

Provider evaluation and the opt-in hosted test remain pending the release
owner's freeze and authorization. No production room or provider call has been
made by this evaluation. All synthetic test rooms were abandoned when needed,
left and confirmed inaccessible through their owners' API sessions by the test
cleanup; Playwright closed its contexts. Active development services remain
running. Two superseded test-only assertion snapshots were removed after the
corrected cases passed; selected screenshots and other agents' evidence remain.
Task scratch was 12 MB at this checkpoint, well below the 500 MB ordinary QA
budget. The evaluator passes Ruff, both changed browser specs pass formatting,
and the live spec passes browser TypeScript and disabled discovery (two skips,
no signups or AI calls). This is test-harness readiness, not hosted acceptance.

## First expanded matrix: actual output review and revision

The 5,636-identity candidate passed exact normalized name/source-alias checks
after a Nightwing mantle record was reconciled with explicit Dick Grayson. The
first expanded `pop-tarot-8` matrix used11 attempts: five validated on their first
response; six returned provider HTTP503 with an explicit high-demand message.
No automatic transport retry or model substitution occurred. Reported successful
usage was8,666 input and4,495 output tokens, zero cached tokens. The provider did
not return token usage for the six failed requests; this does not assert billing.

All five successful outputs were visually read alongside the exact supplied
evidence. Blank generation now satisfied its schema, but some language asserted
a reader situation. The inbox scene used the correct This Is Fine context, but
Jim Halpert's excerpt described his real-life namesake and the connection fell
back to a generic character trait. Grief omitted memes and supplied a fitting
practical step, but its quirky wording was insensitive. The drawing case had a
useful practical step and valid Vedic anchors, but one excerpt began with an
orphaned pronoun. The rest case had valid Western anchors and some specific
connections, but an unattributed historian's praise weakened the scientist analogy.
These are editorial concerns, not a final prose acceptance.

Root-cause changes: source selection now preserves paragraph boundaries and
rejects real-world namesake paragraphs and detached first-person praise; generic
virtue terms no longer boost evidence selection. Runtime excerpts prefer a
complete subject. `pop-tarot-9` uses tentative, invitational language and gentle
imagery for vulnerable questions. The compact prompt retains the existing request
ceiling;15 focused tests cover source identity, paragraph/subject integrity,
ranking, optional-question boundaries and worst-case request trimming.

Because the evidence and prompt changed, the final matrix needs a fresh bounded
run rather than replaying only failed HTTP requests. Under the user's existing
testing authorization, the remaining evaluation cap is12 attempts for the
corrected11-case matrix plus3 reserved hosted attempts. Including9 baseline and
11 first-expanded attempts, the revised total task ceiling is35. This revision
is explicit; successful cases are rerun only because the contract changed.
Provider high-demand failures are inspected and paced, never retried indefinitely.

## Corrected evidence review and final prose contract

The `pop-tarot-9` runs used12 attempts: nine of eleven scenarios validated;
Nataraja's first attempt, Both-change and grief returned HTTP503. Independent
review read all nine saved outputs against their exact supplied excerpts.
All17 selected astrology body/sign/house anchors were correct. Inbox and
Nataraja made specific, useful connections, but other cases inferred motives or
virtues from achievements, introduced familiar facts outside the supplied
excerpt, or placed extra named references in prose without corresponding images.
Astrology sometimes asserted personality or predicted successful performance.
These were grounding and tone weaknesses, not proven fabricated public events.

`pop-tarot-10` keeps the same model, effort, schema and limits. A connection now
states a supplied fact before clearly marking its analogy; achievements cannot
stand in for virtues or private motives. Named references stay in the structured
connections, while quirky prose uses everyday imagery. Astrology uses symbolic
reflection questions rather than claims about personality or outcomes. This is
a compact general contract change, not a list of scenario-specific exceptions.
No substring validator is presented as proof of factual entailment.

The changed contract requires fresh output review. The task has used32 attempts
so far. This explicit revision allows at most12 more for the eleven-case matrix,
followed by the unchanged three reserved hosted attempts:47 total. Provider
errors, actual usage and remaining coverage will be recorded. The first run
prioritizes the six chart cases plus blank and grief before the remaining three.

The first eight `pop-tarot-10` attempts produced three validated readings, three
HTTP503 responses, one correct coordinated astrology phrase rejected by the
anchor validator, and one connection exceeding300 characters. Rest and learning
improved; grief's imaginative layer still trivialized loss. This is a substantive
remaining quality failure. The grouped-anchor validator is being corrected only
for explicitly coordinated bodies with the same computed sign and house.

Prompt refinements alone did not resolve instruction adherence. A focused
comparison now raises the existing Flash-Lite model's application thinking from
low to medium, retaining the3600-output-token ceiling, one provider call, current
timeouts, transport-error policy and bounded retry counts. This does not change
the user's Codex settings. Medium is supported in Google's current
[thinking documentation](https://ai.google.dev/gemini-api/docs/thinking).
The task has used40 attempts. The revised ceiling is56: up to13 more for the
eleven-case comparison including two failure allowances, then the same three
reserved hosted attempts. Begin with the grief case and review it before the
remaining matrix. No more prompt patches or model substitution are implicit.

All three paced medium-thinking probes returned the provider's explicit
Flash-Lite high-demand503; none produced a reading, so they establish no quality
improvement. Stop that retry loop. A deliberate comparison now uses the supported
`gemini-3.8-flash` model with the same medium effort, structured contract and
3600-token output ceiling; production settings remain unchanged until evaluation.
Google documents [structured output and medium thinking](https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash)
and [current pricing](https://ai.google.dev/gemini-api/docs/pricing#gemini-3.8-flash):
free tier is available; standard paid text rates are$0.75 input/$3.75 output per
million tokens through2026-12-31, rising to$1.50/$7.50 on2027-01-01. This is a
bounded quality/availability comparison, not an automatic runtime fallback.
43 attempts are used. The explicit final comparison allowance is12 attempts
plus the three hosted reserve, revising the task ceiling to58. Review grief first.

## Current acceptance boundary

All45 attempted calls are accounted for in private, mode-0600 run receipts.
The last five probes (four Flash-Lite, one Flash3.8; grief and blank questions)
returned explicit provider high-demand503 without reported token usage. There
is no accepted medium-thinking reading and no evidence supporting a production
model change. The existing model remains configured; medium is a candidate
setting only. Stop further provider calls in this unavailable-service window.

The latest local release gate passes with a complete stable source fingerprint:
241 frontend tests,6542 backend tests,181 persistence/privacy tests,44 workflow
tests, generated contracts,5636 image/index identities and production build.
The earlier42-case responsive/archive browser gate remains valid for unchanged
UI/archive inputs. Fresh production no-op migration, drift and RLS/grants pass.
Grouped-anchor regression tests revalidate the original Vedic-resources output
offline; this is not a new provider generation.

Publish the tested source to a review branch, not the production main branch,
while the sensitive-tone quality gate remains unresolved. Hosted ordinary/Both
generation, deployed Python packaging/cold start, canonical alias/SHA proof,
final owner preservation and runtime-log checks remain pending. Resume with the
same saved evidence and bounded remaining allowance when provider availability
returns; do not silently substitute a model or present schema success as prose
quality. No production expansion deployment has been attempted.
