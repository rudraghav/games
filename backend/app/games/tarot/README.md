# Pop Tarot

## Targeted failed-check retries — 18 November 2026

Validation failures carry a reviewed check ID and field path. The loader explains
which part failed; the final failure message names it while retaining the Retry
action. Logs contain only those bounded identifiers, never rejected prose or
unknown response keys. Feedback now reaches the next provider as well as a
same-provider correction, while preserving the original question/cards/chart.

A failed question-format check grants only that field permission to use tentative
reflective prose on the next attempt. The grant lives only in this generation's
request; later failures can add their own exact field within the same maximum of
three transmissions/105 seconds. New readings start strict. Grounded ordinary,
Cloudflare astrology, Groq Vedic/Both and legacy Groq Western share this behavior.
Required fields, bounds, placeholders, exact references/evidence, card order,
computed chart anchors and refusals remain checked. Hard failures get correction
feedback, never a bypass. The saved reading contract remains unchanged.

The canonical request reserves 1,200 characters inside its existing 16,000-character
limit for bounded retry feedback and instructions. The request removes an
unreferenced chart definition and redundant string-length keys that Gemini ignores;
all character-range descriptions and local bounds remain. This follows
[Google's schema support guidance](https://aistudio.google.com/docs/structured-output).
Alternative retry instructions map canonical card paths to their output field names.
No rejected text is resent.
Optional private `retry_detail` progress survives polling/refresh during the
retry, clears when checking/saving, and is absent from legacy snapshots.


## Last fallback eligibility — 18 November 2026

The latest requested preference is Gemini → Cloudflare → Groq. Configured
providers default to all four reading modes, and the hard-coded Groq Vedic/Both
denial is removed. Explicit operational settings can still disable a provider;
they do not make malformed responses acceptable.

Ordinary Groq retains its grounded no-reasoning contract, and Western retains
its established medium-reasoning contract. Vedic/Both use the compact JSON shape
with reasoning disabled. Provider-specific formats map to the same exact card,
reference and computed-chart contract. Only a complete valid reading is saved.
The JSON decoder accepts three complete, known placements of common astrology
text: the requested top-level fields, the astrology parent, or a sole requested
chart section. It moves unchanged strings without inventing or dropping prose.
Mixed/conflicting locations, missing fields, unknown extras and ambiguous
placement inside a two-chart response remain invalid.
The prompt requests one invitational question per field; validation accepts one
or two complete questions within the same length bounds. Three or more remain
invalid. This avoids rejecting useful prose solely for one additional question.
Routing reserves time for later providers and their persistence overhead inside
the existing 105-second, three-transmission limit. It recalculates network time
after progress writes and can skip a slower provider when a faster one still fits.
Less polished prose can remain a useful last fallback; no unsupported claim of
equal quality or guaranteed delivery is implied. Quota or service outages can
still fail the bounded attempt and expose the existing retry action.

Source changes, actual evaluation results and rollout evidence are recorded in
the root journal and `docs/evidence/tarot-last-fallback-2026-11-18/`.

## Previous grounded provider recovery — 18 November 2026

The section below records the earlier qualified-only policy and evaluation.
Its Vedic/Both gate is superseded by the last-fallback policy above.

The final release preserves Gemini's existing full contract and qualifies these
alternative profiles. Environment configuration must still enable each mode:

| Provider | Qualified modes | Runtime profile | Reasoning / output cap |
| --- | --- | --- | --- |
| Groq Qwen3.8 27B | Ordinary | `grounded-reading-3` | None / 4096 tokens |
| Groq Qwen3.8 27B | Western | `qwen-astrology-medium-1` | Medium / 4096 tokens |
| Cloudflare Llama3.3 70B | Ordinary, Western, Vedic, Both | `grounded-reading-3` | None / 4096 tokens |

Groq Vedic and Both are hard-gated in `GROQ_RUNTIME_MODES`, even if an environment
variable accidentally lists them. Cloudflare provides the qualified alternative
for those modes. Groq Western retains its previously accepted two-reference
shortlist, wire request and decoder; current replay verifies the original request
hash and unchanged saved prose against the current shared validator. No new
Western inference is claimed by that replay.

The grounded profile requests short invitational questions, imagery and a
candidate ID per card. The server adds the selected reference's exact supplied
evidence. Its astrology reflections select allowed computed point IDs; the
adapter prefixes each exact body/sign/house label and preserves the generated
reflection verbatim. These headers are chart facts, not generated analysis.
Groq Western's legacy profile retains its generated, locally checked placement
anchors. Missing, extra, duplicate, truncated, outside-product-bounds or unbound
fields fail closed; partial output never becomes a substitute reading.

Both active alternatives use their schema modes with hidden Groq reasoning.
Cloudflare's schema mode does not guarantee successful generation. Compact
character targets guide writing; acceptance retains shared product limits.
Grounded chart questions are bounded to270 characters and the assembled section
to650. Model identity, explicit refusals, exact reference evidence, requested
astrology modes and prose limits remain checked. Editorial review separately
assesses relevance and unsupported claims. The accepted Cloudflare analyses are
usable reflective backups; some character analogies and sign/house interpretations
remain generic, so qualification does not establish deeply personal insight.

`grounded-qwen-astrology-2` and `grounded-qwen-json-2` remain evaluation-only
candidates. JSON2 explicitly places astrology links and next steps at the top
level of its wire contract, then maps their unchanged strings into the shared
reading shape. It does not accept misplaced fields, extras, duplicates or partial
responses. That method produced promising prose before its nesting correction,
but the corrected request reached a provider token limit without generating a
reading. It is not enabled for production. Historical experimental adapters and
all failed records remain available for reproduction.

A single provider can make at most two attempts, and a multi-provider request at
most three, inside the shared105-second deadline. Routing reserves20 seconds for
queued Groq and35 for queued Cloudflare, plus a second of overhead per queued
provider. Starting thresholds are15/30 seconds respectively, so minor persistence
overhead does not skip a useful remaining slot. Time is recalculated after
reservation and progress writes. With no overhead, a three-provider chain can
allocate48/21/36 seconds; actual slots depend on earlier completion times. Each transmission still consumes a separate
application reservation. One safe corrective request may now repair either
ordinary or astrology output when time and attempts remain. Its feedback contains
only a local failure classification with the unchanged original context, never
rejected prose. Explicit safety refusals still stop the chain; quota and auth
failures never repeat the same service automatically.

Generation emits matching, writing, checking and retrying milestones through an
optional callback. Milestones contain only provider/attempt metadata, never the
question, chart or output. Room services own their persistence and publication.

The alternative-provider ledger ends this task at57 reserved calls:35 Groq and
22 Cloudflare, including every failed or interrupted attempt. The grounded phase
added12 calls to the previous41. The native-medium phase used two more; its two
unused slots were retired when the JSON phase began. The JSON phase then used
two of its four approved calls, leaving two unused under the cumulative59 ceiling.
Evaluation stopped at57; the unused slots never trigger calls automatically.

The fixed evaluations cover ordinary grief and Western, Vedic and Both scenarios.
Length-only rechecks preserve original failures and generated text, bind the
original request/result/capture hashes, and verify the current adapter and shared
validator. Legacy Western has a separate exact-wire and unchanged-prose binding.
Qualification includes current per-mode profile, effort and contract hashes;
structural validity alone is never editorial acceptance. Tests additionally cover
runtime wire parity, the hard-gated modes, fallback timing after persistence
writes, refusals and safe retries. The final focused suite passed444 tests, Ruff
and mypy. Deployment and live mobile verification remain separately recorded in
the root progress journal and dated quality evidence.

Safe diagnostics retain only allowlisted quota units/counts and known schema
field paths, never provider error prose, unknown field names or reasoning.
The last JSON attempt reported requested3989 against limit1000 without an
identified TPM/TPD unit; this is not recorded as proof of a daily quota or of an
8000-token request-size limit. Free-account limits and provider availability still
bound delivery; no model is enabled merely because its request compiles.

This compact contract follows the documented distinction between schema
compliance and semantic correctness in [Groq structured outputs](https://console.groq.com/docs/structured-outputs)
and [Cloudflare JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/).
[Groq reasoning controls](https://console.groq.com/docs/reasoning) describe the
Qwen reasoning settings. Pydantic validation and explicit bounded corrections
provide the needed mechanism without adding another SDK retry owner.

## People, characters and saved readings — 17 November 2026

The expanded reference catalogue includes fictional characters and real people
from film, television, books, games, science, history, civic life, sport and the
arts. The original48 identities and their character artwork remain unchanged. New references carry a
stable public identity, source context and source-linked image provenance. A
portrait of an actor represents that actor; it never substitutes for a fictional
role. Saved historical references outside the catalogue remain text. New worthwhile
entries retain their identity while a better source or labelled original
illustration is prepared. Attributable artist works are explicitly labelled
Artwork reference, with a work title and source; they are not presented as a face. The artwork exporter checks exact entity bindings, local bytes,
dimensions, attribution and generated-registry parity.

`pop-tarot-11` ranks the full catalogue by the optional question, card meaning and
spread position using a pinned local semantic model. It sends at most six
candidates per card, with sourced public evidence. The same ranked result trims
to four, three or two candidates when necessary to preserve the existing16,000-
character request ceiling; the question is encoded only once. There is no user
profile/history lookup or additional provider request. The schema restricts each
card to its shortlisted names, and validation requires exact canonical
name/source identity plus globally distinct names, identities and families.
Real-person parallels concern documented public work, without invented private
motives, endorsement or claims that a metaphor establishes facts about a player.

Saved reading content retains its original version and interpretation. Fresh
generation changes never rewrite earlier analyses. Reading archives authorize
against the saved solo participant and can be reopened after rematch or room
closure; reading an archive never generates again. See the room API and frontend
module documentation for incomplete-state handling and navigation.

## Meaning-based reference retrieval — expanded scope

The new local retrieval path compares the optional question, each exact card
meaning and its spread role with source-linked public context. The pinned BGE
encoder runs offline; player input is encoded in memory once per request and
never stored in the public index, query cache or retrieval logs. Card and role
vectors and the public catalogue vectors are built ahead of release. No extra
reading-provider request is introduced by retrieval.

Relevance is primary. A small curated major/regional recognition signal resolves
near ties; diversity penalties reduce repeated fields/franchises, and exact
identity/family constraints prevent aliases or closely related forms filling a
spread. This is retrieval support for a reflective metaphor, not a measured
personality assessment. Embedding similarity is not factual confidence.

`reference-lenses.json` provides sourced concrete story arcs for the original48
without changing their names or pictures. New entries retain bounded public
context and revision/source attribution. Full context stays server-side; selected
candidates carry a short relevant excerpt; complete contexts already within320
characters retain their subject and fictional/historical framing. Prompt `pop-tarot-11` asks for the
concrete evidence and its specific connection to the question/card tension,
without unsupported biography, private motives or a whole-person equivalence.
Source attribution and uncertainty must survive the analogy; a qualified claim
must not become a definite fact. This general instruction follows a focused
evaluation finding, rather than a topic-specific list of patched biographies.
Religious/mythological figures retain their tradition and named form, without
inferring the reader's religion or claiming divine messages. Curated memes retain
the exact scene/reaction context; only a strongly relevant meme may enter the
shortlist and at most one may appear in a spread. The prompt excludes humour
from grief, trauma, health crises and serious hardship. This is tested editorially,
not claimed as an exhaustive classification of every possible question.

The application reading adapter uses `gemini-4-hydrogen` with low thinking and
an8192-token combined reasoning/output ceiling. The earlier medium/3600 candidate
could consume most of its allowance on reasoning and truncate the JSON. Safe usage
receipts now count thought tokens and total generated tokens as well as visible
output. Exact facts precede
limited analogies; named references belong with their structured image/source
entries. Astrology offers symbolic reflection questions, not personality facts
or predictions. Coordinated bodies can share a sign/house anchor only when both
computed values match; unrelated later sentences cannot supply a missing anchor.
See the dated evaluation record for accepted outputs and provider availability.

`fetch_tarot_semantic_model.py` verifies the pinned local model. Build the public
index with `build_tarot_reference_index.py` after catalogue/context freeze. Model,
corpus and index hashes guard against stale or mismatched vectors. The provider
request reuses one ranked result while trimming the shortlist to its existing
size budget. `test_tarot_retrieval.py` covers ranking/identity invariants; real
relevance and factuality require the separate editorial/provider evaluations.

New-reference eligibility is separate from canonical lookup and index storage.
`reference_retrieval.NEW_READING_EXCLUSIONS` records exact reviewed IDs and reasons;
the filter applies before both the bounded and expanded candidate pools. The
18 November review excludes `bohdan-khmelnytsky-q203808` because its supplied
context consists of massacres, enslavement and attempted eradication. This is an
individual editorial decision, not a keyword filter over historical subjects.
Its canonical entry, artwork and vector row remain intact for saved readings.

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
legacy readings remain unchanged. The optional contract introduced in `pop-tarot-6`
historically combined Tarot and astrology without an invalid-output retry.
The18 November recovery policy above now permits one bounded safe correction;
no substitute reading is presented as AI.

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
parallel) for each card. Characters cannot repeat within a spread. Meaning-based public reference retrieval encourages variety
without another provider call or retaining a user's earlier readings. Humour
targets situations rather than mocking hardship or feelings.
References to films and characters are written analogies; dialogue and lyrics
are not bundled. Historical v4 readings used a documented 48-reference cast.
Each reference now has a local image of the actual character: character artwork,
an in-character film/TV still or a character illustration. Portraits use a reviewed4:5 frame; meme scenes may also use4:3. Generated
illustrations and attributable artist works are explicitly labelled; performer headshots and cosplay cannot enter the
active registry. Sources and rights categories are recorded accurately, without
representing copyright references as freely licensed art. The original photo
archive remains preserved. Historical references outside this cast remain text.

After three picks, the player explicitly requests a personal AI reading.
`reading.py` owns the shared contract and bounded provider routing; `providers.py`
owns pure alternative wire profiles; engines never
make network calls. Generation reserves a database lease, releases the lock
before calling the provider, validates the exact three cards, then saves the
result atomically. Saved readings survive refresh. A failed or interrupted call
can be retried after its lease; no curated substitute is presented as AI.
If submission fails, the browser fetches the saved reading again before another
generation is needed. A committed response lost in transit can recover without
a second provider call; rejected attempts retain the same cards for explicit retry.

`CharacterConnection.evidence` is optional source prose, limited to600 characters.
An accepting adapter copies the selected reference's supplied `public_context`
verbatim; fresh validation rejects any mismatch, including another card's facts.
It is never requested from Gemini, whose accepted request schema is unchanged.
The shared reading renderer presents it in a closed Background disclosure.
The saved `Reading` contract preserves it without revalidating against a later
catalogue revision, and older readings continue to omit the field. No migration
or additional retrieval/provider call is needed.

The optional question is limited to 400 characters. It is sent to the configured
AI providers with the selected card meanings. `provider_names` discloses the enabled
services before submission. Questions/readings are private to
the solo participant and are not logged. Usage logs contain token counts and
model configuration only. Failures log the exception type and validation-error
count, without exception text, player questions or provider output. Gemini provider
storage is disabled. Credentials stay in dedicated server environment variables;
the feature reports unavailable when no approved provider mode has a credential. Live quality evaluation remains required before release.

Provider storage controls do not determine Google's product-improvement policy.
Google's free API tier may use submitted content to improve its products; paid
tier terms differ. The owner selected the free tier for development. The server
returns `api_tier` from `TAROT_API_TIER` (default `free`); the question form shows
the free-tier notice and waits for that server response before enabling submission.
The configured value must match the actual key's project tier. The notice is
associated with the question field for screen readers. Paid-tier configuration
retains the general Gemini transmission notice without the free-tier statement.
See https://ai.google.dev/gemini-api/docs/pricing.

Provider routing is configured by `TAROT_PROVIDER_ORDER`, with alternatives off
by default. `TAROT_GROQ_MODES` and `TAROT_CLOUDFLARE_MODES` explicitly approve
ordinary/Western/Vedic/Both modes only after real editorial acceptance. Keys alone
never enable a provider. Missing credentials and unapproved modes are skipped.
Groq additionally permits only ordinary and Western in the runtime allowlist;
Vedic/Both remain gated until a future evidence-backed release changes that list.
Gemini uses its configured model, low thinking and8192 combined thought/output
cap. Alternative profiles use trusted reference IDs and fixed card/focus slots;
the adapter restores canonical names, positions and arrays before the SAME local
validator. It never trims, fabricates, or repairs rejected prose.

A multi-provider request allows at most3 attempts total; a single provider retains
the2-attempt ceiling. Each transmission reserves the global daily budget. All
attempts share105s, inside the120s proxy and180s saved lease; individual caps are
90s Gemini,30s Groq and60s Cloudflare, with useful time reserved for a queued
alternate. Eligible transport, overload, quota/auth and invalid-output failures
may move to a different approved provider. Quota/auth/timeouts never repeat the
same provider automatically. One definite503 retry or one safe output
correction is allowed if attempts/time remain. Explicit HTTP-level or envelope
safety refusals never seek another provider. Generic failed/cancelled/empty
envelopes may use an approved alternate or manual Retry; they do not blame the
question or automatically repeat the same provider. Caller cancellation escapes.
Only safe failure classifications,
counts and model/profile metadata enter logs or correction feedback.

Safe `ReadingFailure` metadata uses the existing private failed-reading payload
alongside the computed chart draft, without a schema migration. Quota/daily/user
limits retain a server cooldown across refresh and reject early retries before
network transmission. Provider configuration failures allow a later GET-only
availability recheck; blocked output requires a changed question. Failed status
recovery blocks a new POST until an authoritative GET resolves. The user sees
one concise message and Retry reading, Check status or no retry as appropriate.
No cooldown expiry generates automatically. Raw birth inputs remain ephemeral.

Historical18 November Gemini evaluation accepted pop-tarot-10 prose at23–86s.
The first pop-tarot-11 reset checks timed out90s; a later grief reading passed
independent editorial review in24.56s, while Vedic-learning still timed out.
The earlier18 November release selected Gemini first and Groq Qwen3.8 27B as a backup
only for ordinary and Western readings. Ordinary uses evidence-3/none with the
canonical shortlist; Western uses qwen-astrology-medium-1/medium with two supplied
candidates per card. Both use hidden reasoning and a4096 combined-token cap.
The selected source background is copied exactly, separately from generated
reflection. Vedic/Both Groq and all Cloudflare modes remain disabled after failed
quality checks. Defaults still require explicit mode configuration to enable any
alternative. Current profiles and decisions are tracked in the dated evaluation
evidence; structural validation alone never constitutes production approval.
Production14e5cfa verifies real ordinary/Both generation, mobile saved refresh,
private archives and concise recovery after a provider HTTP failure. The dated
evidence retains failures and minor editorial caveats; approved fallback behavior
is covered locally and direct Groq evaluations pass for its enabled modes.
No production provider outage is deliberately induced to claim a live fallback.
Astrology anchor validation accepts decimal degree punctuation while retaining
true sentence boundaries, other-body boundaries and exact computed sign/house.
Fresh-output validation requires all new reading sections and rejects repeated
characters, unnamed sources, missing/oversized explanations and extra fields.
Fresh name/source pairs must match the curated cast, including explicit aliases;
substring matches are rejected. Each card receives a bounded rotating shortlist,
while the provider schema lists only that request's candidate names. The public
frontend registry is generated from this same cast and the source-attributed asset manifest
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
