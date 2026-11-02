# Pop Tarot

## Optional birth charts — 2 November 2026

Astrology is off by default. A participant may preview Western tropical,
Vedic True Chitrapaksha, or both whole-sign charts before the same Tarot request.
The server calculates all placements; the reading adds separate normal and
quirky interpretations grounded in named body/sign/house anchors. The Vedic
convention is explicitly True Chitrapaksha, not Lahiri. See the
[calculation, privacy and verification contract](../../astrology/README.md).

Birth date, time and place stay out of saved readings and provider prompts.
Only the computed chart is saved privately, including during a pending/failed
request so refresh and explicit retry can reuse it. Turning astrology off omits
it from the next request and clears an earlier failed chart draft. Ordinary and
legacy readings remain unchanged. The `pop-tarot-6` optional contract makes one
combined provider call, with no automatic astrology retry or substitute reading.

## Reading expansion acceptance — 1 November 2026

New readings must give every selected card a grounded interpretation, a separate
playful interpretation and one or two named fictional-character connections with
an explained relationship to that card. All 56 minor meanings must be distinct
editorial interpretations of their traditional archetypes. Saved earlier readings
remain readable without inventing missing sections. Provider retries, time and
attempt budgets, privacy, exact spread identity and atomic persistence continue
to apply. Acceptance includes strict fresh-output validation, legacy readback,
fixed live evaluations and phone/desktop rendering of the expanded sections.

An original reflective solo experience, not a competitive game. The player asks
an optional question and chooses three face-down positions from a shuffled
78-card deck: 22 major arcana and four 14-card suits. Cards are unique, upright
only in this edition, and never leave the server until selected. The spread is
**Where you are / What is shifting / Your next move**. Picking cannot be undone.

The meanings in `deck.py` are Games' concise editorial interpretation of
traditional archetypes, not copied guidebook text. Every one of the 56 minor
cards has an individual meaning; rank/suit template phrases are not used.
New readings separate the normal interpretation from a playful reinterpretation
and one or two structured character connections (name, source and explained
parallel) for each card. Characters cannot repeat within a spread. A stable
rotation of broad reference genres across the three cards encourages variety
without another provider call or retaining a user's earlier readings. Humour
targets situations rather than mocking hardship or feelings.
References to films and characters are written analogies; dialogue and lyrics
are not bundled. Fresh v4 readings choose from a documented 48-reference cast.
Each reference now has a local image of the actual character: character artwork,
an in-character film/TV still or a character illustration. The complete v2 cast
uses one reviewed 4:5 frame; performer headshots and cosplay cannot enter the
active registry. Sources and rights categories are recorded accurately, without
representing copyright references as freely licensed art. The original photo
archive remains preserved. Historical references outside this cast remain text.

After three picks, the player explicitly requests a personal AI reading.
`reading.py` owns the compact prompt, schema and provider adapter; engines never
make network calls. Generation reserves a database lease, releases the lock
before calling the provider, validates the exact three cards, then saves the
result atomically. Saved readings survive refresh. A failed or interrupted call
can be retried after its lease; no curated substitute is presented as AI.
If submission fails, the browser fetches the saved reading again before another
generation is needed. A committed response lost in transit can recover without
a second provider call; rejected attempts retain the same cards for explicit retry.

The optional question is limited to 400 characters. It is sent to the configured
Gemini with the selected card meanings. Questions/readings are private to
the solo participant and are not logged. Usage logs contain token counts and
model configuration only. Failures log the exception type and validation-error
count, without exception text, player questions or provider output. Provider
storage is disabled. `GEMINI_API_KEY` is a
dedicated server environment variable; the feature reports unavailable when it
is absent. Live quality evaluation remains required before release.

Provider storage controls do not determine Google's product-improvement policy.
Google's free API tier may use submitted content to improve its products; paid
tier terms differ. The owner selected the free tier for development. The server
returns `api_tier` from `TAROT_API_TIER` (default `free`); the question form shows
the free-tier notice and waits for that server response before enabling submission.
The configured value must match the actual key's project tier. The notice is
associated with the question field for screen readers. Paid-tier configuration
retains the general Gemini transmission notice without the free-tier statement.
See https://ai.google.dev/gemini-api/docs/pricing.

Provider: Google Gemini Interactions API with JSON Schema output, storage off,
low thinking level and a 3,600-token output cap. Default model is configurable
through `TAROT_MODEL`. The `pop-tarot-4` provider schema binds each of the three
ordered card IDs and positions using supported `prefixItems`/single-value enums.
Google ignores JSON Schema string-length constraints; descriptions communicate
the character ranges and strict Pydantic validation remains authoritative. A
completed but malformed/invalid response or partial truncated response receives
at most one fresh generation with a safe failure classification, never rejected
text. Failed, canceled, empty/safety, HTTP quota/auth and transport responses do
not retry automatically. A 60-second retry deadline and 45-second per-request cap
fit within the 75-second frontend proxy and 120-second saved-generation lease.
Both attempts reserve the transactional daily budget before transmission.
The per-request cap was raised from 30 seconds after a fresh phone request timed
out and controlled calls measured about 27 seconds even for a two-token reply.
Schema removal and minimal thinking did not remove the delay. The model, effort,
output cap, total retry deadline, proxy timeout and generation lease are unchanged;
the second attempt receives only the remaining total budget. This adds margin
for provider latency without automatically repeating a transport failure.
Fresh-output validation requires all new reading sections and rejects repeated
characters, unnamed sources, missing/oversized explanations and extra fields.
Fresh name/source pairs must match the curated cast, including explicit aliases;
substring matches are rejected. Each card receives a rotating genre's permitted
references, while the provider schema lists the public cast's names. The public
frontend registry is generated from this same cast and the licensed asset manifest
with `scripts/export_tarot_characters.py`; contract checks reject drift.
The persisted/API model independently accepts older `pop_culture` paragraphs;
loading those readings never fabricates quirky text or silently generates again.

See [Google structured output](https://ai.google.dev/gemini-api/docs/structured-output)
and [Interactions status reference](https://ai.google.dev/api/interactions-api)
(reviewed 1 November 2026). The old rejected responses were deliberately not
retained, so their exact rejection cannot be reconstructed. The confirmed contract
gap was relying on provider-ignored length keywords without a recovery path.

Historical v2 reliability verification: 28 focused Tarot/provider checks and nine isolated-room
checks passed, including recovery from malformed/truncated/oversized/missing-field
output, exact card identity validation, exhausted retry budgets, privacy, saved
readback and no regeneration on repeated submission. Six non-personal live
scenarios passed strict schema/card-position checks on their first attempts in
2.24–4.15 seconds on 1 November 2026. These are bounded reliability samples,
not a guarantee against provider outages. Metadata-only evaluation evidence is
retained privately; no player questions, readings or tokens are in logs.

Current v3 verification: 34 focused engine/provider checks and eight isolated-room
checks pass, including required normal/quirky/character layers, two-character
bounds, repeated-character rejection, legacy persistence without mutation or new
provider calls, output recovery, authorization and transactional retry budgets.
Three fixed real-provider scenarios passed first attempt in 3.83–4.20 seconds;
metadata and review limits are in `docs/evidence/tarot-v3-2026-11-01`. Separate
frontend tests cover legacy presentation and text escaping; phone/desktop browser
checks cover the 78-card explorer, suit filters, choices and refresh. Real-AI
phone/desktop full matches also pass all new sections, exact rendered readback,
history, natural results, rematch and same-group switching, with clean test-room
closure and no transport recovery needed.

Cost controls: 16,000-character request ceiling, 10 reading requests per player
per hour, and a transactional application-wide default of 100 provider attempts
per UTC day (`TAROT_DAILY_LIMIT`). Failed provider attempts consume that budget.
The dedicated free-tier key passed authentication and three fixed real-provider
evaluations, reviewed under `docs/evidence/tarot-evaluation`. A browser reading
was saved and remained identical after refresh and an API process restart;
its phone layout had no horizontal overflow. An earlier browser attempt was
rejected before persistence; retry retained the same spread and succeeded.
The earlier prepaid-key HTTP 402 is resolved by replacing the key, not by
purchasing credit or upgrading billing. This small evaluation is not exhaustive.

Acceptance: all 78 identities unique, deterministic seeded draws, no deck leak,
exactly three choices, persisted personal output, wrong-card output rejected,
honest unavailable/error states, keyboard and phone card picking, reduced motion.

V4 release evidence: all 48 reference pairs/assets are covered by focused tests
and the contract exporter; 718 backend and 84 frontend cases pass. Final real
hosted desktop/phone readings validate and persist every layer, with all portrait
images decoded, unchanged refresh, history/rematch and closed test rooms. Bundled
WebPs use direct public delivery because the initial production Services image
optimizer URL returned 404. The final source 02ff603 corrects only that delivery;
provider transport failures remain honest saved-spread retry states. See
`docs/evidence/lounge-tables-2026-11-01/README.md` for exact revisions and limits.

## Audit evaluation, 2 November 2026

Four bounded, nonpersonal live evaluations cover ordinary, Western, Vedic and
Both modes across four distinct spreads, including difficult cards. Production
prompt `pop-tarot-6`, provider/model, token caps, validation and storage contracts
are unchanged. Safe semantic/usage summary is in
`docs/evidence/audit-fixes-2026-11-02/shared-tarot.md`; complete outputs remain in
ignored local evidence. The user elected to retain the existing character images
and accurate credits; that decision does not alter recorded usage categories or
claim that permission was granted.
