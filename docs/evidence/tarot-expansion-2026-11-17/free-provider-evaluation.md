# Free-provider evaluation

Closed on 18 November 2026 after 41 direct attempts: Groq 25 and Cloudflare 16,
including every failed and rate-limited attempt. No further direct evaluations
are planned. The original comparison and subsequent explicitly bounded recovery
phases remain preserved below.

The final release decision approves Groq Qwen only for ordinary readings
(`none`, evidence-3) and Western astrology (`medium`, two candidates per card).
Four ordinary cases and the unchanged Western output are locally valid and
independently usable with minor prose concerns. Western required a narrow
decimal-anchor validator fix and a separate offline attestation; its original
failure is preserved. Vedic and combined astrology are **not approved** for Groq.
No Cloudflare configuration or Groq GPT-OSS variant is approved. The final
[case table](#final-release-decision--18-november-2026) records the boundaries.
This is a configuration acceptance decision, not proof that production has been
configured or deployed; rollout evidence belongs in the release record.

## Original comparison: outcome and acceptance

Evaluate the existing Tarot contract on Groq `openai/gpt-oss-120b` and
Cloudflare `@cf/openai/gpt-oss-120b` using seven existing synthetic scenarios:
blank question, grief, Nataraja, meme, Western, Vedic and combined astrology.
This is an evaluation tool, not a production adapter or provider switch.

Acceptance requires a dry run without credential reads or network inference,
explicit execution against a verified free-only account, at most ten requests
per provider across runs, exact local reading validation, private evidence and
independent editorial review. A successful ordinary-blank smoke request precedes
the remaining matrix. Invalid output is a failed result, never repaired or
replaced with a generated substitute. No provider fallback, automatic retry,
paid tier, gateway routing, database writes or application configuration changes
are in scope.

## Implementation

`scripts/eval_tarot_free_providers.py` reuses `eval_tarot_matrix.SCENARIOS`, its
synthetic chart calculations, the production request builder and retrieval, and
the unchanged `validate_reading` function. Only the wire envelope changes.
The provider schema replaces `cards.prefixItems` with one `items` schema containing
the allowed card/position enums and an explicit ordered-pair description. Exact
card order, reference membership, lengths, reference-family diversity and computed
astrology anchors remain enforced locally. String/array bounds remain in the
initial wire schema; unsupported-keyword errors stop for review rather than
silently weakening the validator or retrying.

| Provider | Direct endpoint | Model | Generated-token cap | Effort |
| --- | --- | --- | --- | --- |
| Groq | `api.groq.com/openai/v1/chat/completions` | `openai/gpt-oss-120b` |4096 (`max_completion_tokens`) | low default; medium explicit |
| Cloudflare | `api.cloudflare.com/client/v4/accounts/{account}/ai/v1/chat/completions` | `@cf/openai/gpt-oss-120b` |8192 (`max_tokens`) | low default; medium explicit |

Groq sends strict JSON Schema output, `include_reasoning:false` and the explicit
`on_demand` service tier; this is the ordinary processing tier, **not** proof of a
free billing plan. Cloudflare uses its OpenAI-compatible schema envelope and
`options.rejectIfBusy:true`. Neither request uses tools, a gateway, automatic
model selection, streaming, redirects or retries. `store` is deliberately omitted:
Groq's Chat Completions reference lists that parameter as unsupported. No storage
or training-policy claim is inferred from omission.

Execution reads only the selected provider's names from this checkout's private
`.env.ai.local`: `GROQ_API_KEY`, or `CLOUDFLARE_ACCOUNT_ID` and
`CLOUDFLARE_API_TOKEN`. There is no process/global credential fallback. The
production builder's settings accessor is locally substituted with the code's
default model label, so dry runs do not load the existing Gemini credential.
Both providers receive identical context/schema hashes; only the wire model and
provider parameters change. This avoids model-name length changing shortlist
trimming at the request-size boundary.

`--free-plan-confirmed` records an operator's prior account verification; it is not
an API billing control. Verify Groq Free and Cloudflare Workers Free without paid
overage before using it. The root release operator owns that verification and
credential setup. A token alone cannot establish the account's billing state.
These evaluations use synthetic questions and chart profiles only. Production
use would need accurate provider-specific disclosure and separate acceptance.

## Budget and evidence

An exclusive per-provider lock and immutable reservation files under ignored
`.vercel/tarot-free-provider-evaluations/` enforce ten total requests per provider
across all run IDs. A reservation is written before transmission; transport
failures and interrupted attempts still consume it. Do not remove that history
to obtain more requests. Groq starts are spaced at least65 seconds apart across
runs. HTTP errors and transport failures stop the run; output contract failures
are recorded as failures without a replacement call. Each request has a90-second
HTTP timeout.

Private directories are0700 and JSON artifacts0600. Evidence includes exact
synthetic request context, per-card public facts, the computed chart, schema and
request hashes, prompt/model/effort/cap, latency, token counts (including separate
reasoning-token counts when supplied), and successful normalized readings.
Failed output retains allowlisted field locations/types and a text hash/length,
not rejected text. Unknown JSON property names become `<extra>` because validation
locations can otherwise contain provider text. HTTP failures retain only bounded error identifiers, known contract keyword
names and rate-limit headers. Raw provider reasoning, signatures, credentials,
error prose and arbitrary response envelopes are never written or printed.
Schema-valid output always remains `editorial_review: pending`.

## Running the comparison

Dry runs require no credentials and make no inference requests:

```sh
backend/.venv/bin/python -B scripts/eval_tarot_free_providers.py --provider groq
backend/.venv/bin/python -B scripts/eval_tarot_free_providers.py --provider cloudflare
```

After verifying the account plan, execute one ordinary smoke request per provider
with distinct new run IDs:

```sh
backend/.venv/bin/python -B scripts/eval_tarot_free_providers.py --provider groq --execute --free-plan-confirmed --max-attempts 1 --run-id groq-smoke-20261118 --scenario ordinary-blank
backend/.venv/bin/python -B scripts/eval_tarot_free_providers.py --provider cloudflare --execute --free-plan-confirmed --max-attempts 1 --run-id cloudflare-smoke-20261118 --scenario ordinary-blank
```

Only after a valid smoke result and inspection, run the six remaining cases for
the same provider with a new run ID:

```sh
backend/.venv/bin/python -B scripts/eval_tarot_free_providers.py --provider groq --execute --free-plan-confirmed --max-attempts 6 --run-id groq-matrix-20261118 --scenario ordinary-grief --scenario ordinary-nataraja --scenario ordinary-inbox --scenario western-rest --scenario vedic-resources --scenario both-boundaries
```

Use `--provider cloudflare` and a distinct Cloudflare run ID for that provider's
matrix. Changed script/prompt/reference-index hashes or reasoning effort require
a fresh smoke result, within the same ten-request total. Effort is included in
the effective contract hash and checked explicitly against the smoke receipt.
Nothing here changes production.

### Bounded medium comparison

`--reasoning-effort medium` changes only that request parameter. It preserves
the supplied public facts, prompt, schema, charts, local validator and provider
output cap. The low default remains explicit. More reasoning can consume more of
the same generated-token cap; a truncated or invalid response remains a failed
attempt. The evaluator does not raise a cap or retry automatically.

After the low baseline, the release operator reserved the remaining five Groq
requests for medium blank, grief, Western, Vedic and combined astrology; the
remaining three Cloudflare requests cover medium blank, grief and combined
astrology. These are comparison plans, not passing quality results. The existing
reservation history remains authoritative and includes failures. Prepare first:

```sh
backend/.venv/bin/python -B scripts/eval_tarot_free_providers.py --provider groq --reasoning-effort medium --max-attempts 5 --scenario ordinary-blank --scenario ordinary-grief --scenario western-rest --scenario vedic-resources --scenario both-boundaries
backend/.venv/bin/python -B scripts/eval_tarot_free_providers.py --provider cloudflare --reasoning-effort medium --max-attempts 3 --scenario ordinary-blank --scenario ordinary-grief --scenario both-boundaries
```

Run only the new blank smoke first, separately for each provider:

```sh
backend/.venv/bin/python -B scripts/eval_tarot_free_providers.py --provider groq --reasoning-effort medium --execute --free-plan-confirmed --max-attempts 1 --run-id groq-medium-smoke-20261118 --scenario ordinary-blank
backend/.venv/bin/python -B scripts/eval_tarot_free_providers.py --provider cloudflare --reasoning-effort medium --execute --free-plan-confirmed --max-attempts 1 --run-id cloudflare-medium-smoke-20261118 --scenario ordinary-blank
```

After that provider's valid medium smoke and inspection, use a new run ID and
select its remaining cases explicitly (`--max-attempts 4` for Groq or `2` for
Cloudflare). A low-effort smoke cannot unlock this run. Both efforts share the
same ten-request provider budget; changing effort never replenishes it.

## Source checks and limits

Official sources checked18 November2026:

- [Groq Structured Outputs](https://console.groq.com/docs/structured-outputs)
  documents strict GPT-OSS support, closed objects, required fields and references.
  It does not document tuple support or explicitly enumerate the supported length
  bounds; the smoke request is the actual compatibility check.
- [Groq reasoning](https://console.groq.com/docs/reasoning) documents GPT-OSS
  low/medium/high effort and `include_reasoning`; `reasoning_format` is not
  supported for this model. This evaluator permits only low and medium.
- [Groq API reference](https://console.groq.com/docs/api-reference) documents
  completion caps and explicit `on_demand` processing.
- [Groq limits](https://console.groq.com/docs/rate-limits) lists the model's Free
  plan at30 RPM,1000 RPD,8000 TPM and200,000 TPD. Organization-specific limits and
  returned headers are authoritative. Preflight's bytes/4 token estimate is only
  an estimate; it rejects an estimated input-plus-cap above8000.
- [Cloudflare OpenAI compatibility](https://developers.cloudflare.com/workers-ai/configuration/open-ai-compatibility/)
  and the [GPT-OSS120B model page](https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/)
  document the direct Chat Completions route, model ID, token cap and low/medium/high
  reasoning. The [JSON Mode page](https://developers.cloudflare.com/workers-ai/features/json-mode/)
  uses a different native schema wrapper and does not list GPT-OSS in its example
  model list; compatibility for this exact strict request remains a smoke gate.
- [Cloudflare pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/)
  gives Workers Free a10,000-neuron daily allowance with no paid overage; its
  GPT-OSS120B rates are31,818 input and68,182 output neurons per million tokens.
  The evaluator records a cap-based estimate, not an actual bill or quota balance.

## Local verification

The focused deterministic test file is
`backend/tests/test_tarot_free_provider_eval.py`, included in the maintained
`backend` verification group. Tests cover all seven scenarios for both wire
formats, unchanged local validators, no credential/network access during dry
runs, strict execution limits, smoke gating, durable failed-attempt accounting,
exclusive private artifacts, sanitized diagnostics and omission of reasoning.
Live transport and editorial outcomes are separate evidence and are not implied
by these tests.

Preparation checks on18 November2026:48 focused tests passed; lint passed for
the new evaluator and test file. Both real-retrieval dry runs passed all seven
scenarios without credential reads or inference. Every paired context/schema
hash matched. Groq's largest estimated input-plus-output-cap reservation was7757
tokens. Cloudflare's seven full-cap neuron estimates summed to4598. These are
preflight estimates, not observed provider token counts. Private v2 preflight
receipts retain the exact request and contract hashes. The v3 receipts supersede
v2 after independent review caught and fixed unknown-field-name leakage in safe
validation diagnostics. No live inference was
performed by the implementation task.

The later medium comparison adds17 focused checks (65 total passing), including
all seven scenarios for both providers, effort-specific hashes and smoke gates,
and shared reservation accounting. Both medium dry runs match the v3 low
context/schema/chart/cap hashes for every scenario. Their private
`medium-v1` receipts record effective contract
`e72335d293ed645b7fc76faddbe961aa9ed8e44a7955ed6a9546629e9013c064`.
Groq's largest estimated input-plus-cap remains7757; Cloudflare's seven full-cap
estimates still sum to4598 neurons. These runs read no credentials and make no
inference requests. Live medium outcomes require the release operator's separate
requests and editorial review.

## Actual comparison outcome — 18 November 2026

The release operator confirmed both accounts were on free plans and executed
15 synthetic requests: **Groq 7/10** and **Cloudflare 8/10** across both efforts.
Credentials stayed private. No paid upgrade, retry, fallback, production provider
change or database write was made. The application/evaluator commit `53421e7`
was pushed; these outcome notes are documentation of the separate evaluation,
not a production-model adoption.

| Provider / effort | Cases sent | Transport and local validation | Independent editorial assessment |
| --- | --- | --- | --- |
| Groq / low | Blank, grief, Nataraja, inbox, Western | First four valid in 2.413–2.687s. Western HTTP 400 `json_validate_failed`; safe diagnostics mention `required`. Run stopped. | Blank and grief: Block. Nataraja and inbox: Minor, with useful grounded connections but repeated names outside designated fields and some overcertain framing. |
| Cloudflare / low | All seven | Four ordinary cases valid in 20.714–29.032s. Western (62.136s) and Vedic (28.875s) failed exact local validation. Both timed out at 90.005s. | All four available ordinary readings: Block for concrete grounding, reader-context or sensitive-tone failures. No editorial verdict inferred for rejected or absent text. |
| Groq / medium | Blank, grief | Blank valid in 5.631s. Grief HTTP 400 after 4.605s, `json_validate_failed` mentioning `maxItems`; remaining token allowance was present. Run stopped. | Blank: Minor. Fact-first connections and reference placement improved, but blank-reader certainty and dropped attribution remained. No normalized grief prose was available. |
| Cloudflare / medium | Blank | Locally valid in 30.716s. | Block: all three normal fields contained `normal_interpretation`, all quirky fields contained `quirky_interpretation_of_same_meaning_but_with_imagery`, and all connections ended mid-sentence. |

The technical count is **10 locally valid outputs from 15 attempts**. Editorial
review of those ten found **seven Block and three Minor**, with no full Pass.
These categories distinguish observed quality from transport and schema failures;
they are not a statistical reliability estimate.

Grounding checks used only each card's exact supplied public context. The low
blank outputs added unsupported details or a personal dilemma. Both low grief
outputs turned Hildegard's non-singing Devil into a silent character; Cloudflare
then used the analogy to limit grief's place in the song, contrary to the
question's supportive intent. Cloudflare's Nataraja reading invented a wheel the
figure dances upon, and its inbox reading added character-specific decisions
absent the source. Groq's Nataraja and inbox readings were closer: relevant scene
or tradition, specific factual connections and bounded next steps. Medium Groq
improved blank-reading discipline, while medium Cloudflare demonstrated why
length/schema checks alone cannot establish meaningful prose.

Rejected output text was deliberately not retained. Accordingly, Cloudflare's
Western/Vedic failures cannot be assigned to a particular body/sign/house anchor
or reference field from the safe generic diagnostic, and Groq's HTTP 400 keyword
mentions do not establish the exact invalid generated value. No missing prose
was reconstructed for review.

The operator stopped with **three Groq and two Cloudflare requests unused**.
Groq low Vedic/Both and medium Western/Vedic/Both were not run. Cloudflare medium
grief/Both were not run after the unusable blank output. There are no pending
required calls for this comparison. Private assessments retain these gaps and
the per-case reasons; public notes contain no keys, raw reasoning or private
request artifacts.

**Decision: neither tested provider configuration is adopted for this Tarot
contract.** This is a scoped rejection of the observed configurations, not a
general claim about GPT-OSS or either service. Production Gemini remains unchanged;
the selected free-plan Gemini checks resume after its quota reset. The evaluator
remains available for a separately authorized future comparison without resetting
its durable reservation history.

## Separately authorized compact-profile experiment — 18 November 2026

The user subsequently authorized a new bounded experiment with provider-specific
formats. The preceding 15 calls and their rejection remain historical evidence.
The evaluator defaults to `legacy-v1`, retaining its ten-attempt provider limit.
The explicit `--profile compact-v1` selects Groq `openai/gpt-oss-120b` at medium
reasoning/4,096 output tokens, or Cloudflare
`@cf/meta/llama-3.3-70b-instruct-fp8-fast` without a reasoning parameter and with
4,096 output tokens. Both use a fixed-slot JSON schema and the pure provider
adapter; the existing domain validator still checks the exact cards, shortlist
references, families and astrology placements.

The compact experiment permits **35 cumulative attempts across both providers,
at most 20 per provider**, including the prior 15 attempts. A cross-provider lock
makes reservations atomic; unsuccessful or interrupted calls consume a slot.
Changing profiles, effort or run ID never resets the ledger. Each new profile
requires its own successful `ordinary-grief` smoke under the exact code/model/
format contract before a wider matrix. A schema-valid smoke still needs the
operator's separate editorial review before proceeding. There are no automatic
retries, model switching, paid-tier switches or production-setting changes here.

Dry-run preparation (no credential reads or inference):

```sh
backend/.venv/bin/python scripts/eval_tarot_free_providers.py \
  --provider groq --profile compact-v1 --scenario ordinary-grief
backend/.venv/bin/python scripts/eval_tarot_free_providers.py \
  --provider cloudflare --profile compact-v1 --scenario ordinary-grief
```

Only the release operator may add `--execute --free-plan-confirmed
--max-attempts 1 --run-id UNIQUE-LOWERCASE-ID` after inspecting the preflight.
The evaluator keeps direct endpoints, Groq's approximate 8,000-token reservation
guard and 65-second spacing, and Cloudflare's reject-if-busy option. It records
Cloudflare's model-specific full-cap neuron estimate; this is not a measurement
of remaining account quota. Verified free accounts enforce their own daily
limits, and any quota error stops the run without retry. A full request-count
budget does not imply sufficient daily token or neuron allowance.

Both the canonical supplied context and adapted wire context receive separate
hashes. The effective contract includes the provider adapter source and fixed
model/profile settings. Private artifacts retain only normalized readings,
allowlisted usage and bounded failure diagnostics; reasoning, raw rejected prose
and arbitrary provider-generated property names remain excluded.

Compact preparation verification: 89 evaluator safeguards and 25 adapter checks
pass. Real-retrieval dry runs cover all seven cases on both profiles with no
credential reads or provider calls. The largest Groq estimate is 7,928 tokens
including its 4,096-token output cap. Cloudflare estimates 920–941 neurons per
full-cap request (6,500 for the seven-case matrix); these remain estimates. The
historical Cloudflare receipts report 12,823 input and 9,811 output tokens across
seven responses, approximately 1,077 GPT-OSS neurons. The eighth request timed
out without usage, so the actual earlier total and account remainder are not
known. The private compact-v1 preflight records exact hashes and the unchanged
seven Groq/eight Cloudflare historical reservation counts.

Compact smoke reuse is narrowly separated from the whole-source audit hash.
An additive private attestation may be created only while the successful smoke's
original full source fingerprint still matches. It binds the exact request,
adapter source and immutable request/result/normalized-reading artifact hashes.
Later orchestration-only edits can reuse that proof only when a freshly built
grief request is byte-identical, the provider/profile/model/format still match,
and the saved normalized reading passes the current exact domain validator.
Missing or changed artifacts, adapter changes, changed prompts/facts/schema and
newly invalid output fail closed. Existing receipts are never rewritten. This
proof asserts local contract validity only, never editorial acceptance. Seven
additional safeguard tests cover these boundaries (96 evaluator tests total).

## Compact-v2 preparation — 18 November 2026

The two compact-v1 grief smokes passed local structure checks but failed
independent editorial review. Their reservations and private attestations remain
unchanged; they do not approve production use or unlock a new profile.

A separately authorized `--profile compact-v2` uses a standalone, concise output
instruction instead of appending an override to the canonical prompt. Groq uses
high reasoning with the same 4,096-token combined completion cap; Cloudflare
keeps nonreasoning Llama and its 4,096-token cap. The original cards, supplied
reference facts and chart data remain the adapter inputs. Current execution of
`compact-v1` is explicitly rejected so the new instructions cannot silently run
under an old label. Legacy-v1 retains its original models and limits.

The cumulative limits remain 35 total and 20 per provider. The two new historical
smokes bring usage to 17 attempts, leaving at most 18 further attempts across
both providers. Compact-v2 needs its own exact-request grief smoke and editorial
review; no old smoke can unlock it. The new profile and its adapter version are
bound in preflight and attestation proof. Request matching compares the actual
wire instructions, so an unused canonical instruction change cannot substitute
for—or invalidate—an unchanged compact request.

After the reviewed exact-ID shortlist exclusion, all 14 compact-v2 dry requests
pass without credentials or inference. Groq's largest approximate input-plus-cap
is 7,699 tokens; its grief smoke is 7,035. Cloudflare's maximum full-cap estimate
is 935 neurons (6,465 across seven cases). The private compact-v2 preflight
records the exact hashes, the unchanged 8/9 cumulative reservations and absence
of the reviewed excluded identity from every supplied shortlist. All 98 evaluator
and 28 adapter tests pass; lint and diff checks pass. These are preparation
results, not evidence of live prose quality or production approval.

## Groq JSON-mode diagnostic preparation — 18 November 2026

The explicit Groq-only `--profile compact-json-v1` is a separate experiment.
Its pure `groq_json.py` transform copies the compact-v2 request, replaces strict
schema decoding with `json_object`, and appends the exact unchanged compact
schema JSON to the trusted system message. It preserves the high reasoning
setting, 4,096-token cap, question, reference facts, chart and domain validator.
It is not wired into production routing. Cloudflare's compact-v2 builder and
adapter source remain unchanged, and its existing local smoke proof still
revalidates; this does not imply editorial acceptance of all Cloudflare modes.

The new profile requires its own grief smoke. Its attestation binds both the
shared decoder and this transform's source. Existing 25 reservations (Groq9,
Cloudflare16) remain counted against 35 combined/20 per provider, leaving at most
ten further attempts. Neither a strict-mode smoke nor a different run ID can
bypass the new smoke gate or reset those limits. No retries are automatic.

All seven real-retrieval dry requests fit the approximate Groq free-tier guard:
maximum 7,804 input-plus-output-cap tokens, grief 7,105. The private JSON-mode
preflight records exact request/context/schema hashes and preserved Cloudflare
proof. 113 evaluator tests plus 28 adapter tests pass; scoped lint, module typing
and diff checks pass. No credentials or inference calls are used by preparation.

```sh
backend/.venv/bin/python scripts/eval_tarot_free_providers.py \
  --provider groq --profile compact-json-v1 --scenario ordinary-grief
```

## Groq medium-effort diagnostic preparation — 18 November 2026

The high-effort strict and JSON-mode grief attempts both returned provider-side
JSON validation errors despite remaining request-token allowance. Existing
receipts do not establish whether the combined 4,096-token reasoning/output cap
was exhausted; remaining account quota is a different limit. No rejected text
was retained or reconstructed.

The separate Groq-only `--profile compact-medium-v1` tests that uncertainty by
changing only `reasoning_effort` from high to medium on the compact-v2 strict
request. Its pure `groq_medium.py` transform preserves every prompt, schema,
reference fact, chart and cap byte otherwise. It is not production routing and
requires its own grief smoke. Old profiles and all 26 reservations (Groq10,
Cloudflare16) remain counted, leaving at most nine further direct attempts.
Cloudflare's request and existing local smoke proof remain unchanged.

Future failed-generation diagnostics retain only presence, value kind, length,
JSON parseability/error position and any explicitly returned allowlisted finish
reason or numeric usage. Error bodies remain bounded in memory and are discarded;
no rejected prose, arbitrary keys, provider message or hidden reasoning is saved.
Known internal domain failures now yield fixed classifications such as
`astrology_anchor_mismatch` or `reference_family_collision`; unknown messages
become an unclassified marker. Historical generic failures are not retroactively
assigned a cause. The new structural diagnostics do not authorize retries.

All seven real-retrieval medium dry requests pass and differ from compact-v2 only
in effort. 133 evaluator tests and 28 adapter tests pass, including privacy
canaries, exact domain classifications and cumulative-budget coverage. Scoped
lint, module typing and diff checks pass; preparation reads no credentials and
makes no inference calls.

## Groq high-effort, bounded-shortlist preparation — 18 November 2026

The medium grief output was structurally valid but independently rejected for
invented group emotion and unsuitable grief imagery. Its successful structure
check is not a quality approval. All 27 prior reservations remain counted.

The separately authorized Groq-only `--profile compact-high-v1` retains the
compact-v2 prompt, strict schema construction and high effort, with a 5,000-token
completion cap and at most two supplied candidates per card. The initial
5,120-token proposal would exceed the conservative free-tier estimate for Both;
5,000 fits all seven without truncating any retained fact or chart value.

`groq_high.py` returns both the effective canonical request and its wire request.
The evaluator uses that same effective shortlist for decoder lookup and final
domain validation. Tests explicitly reject a reference removed from the supplied
shortlist. Production routing remains unchanged. Real-retrieval preparation also
confirms that trimming the default canonical shortlist matches the evaluator's
existing `_candidate_limit=2` builder for every case, supporting later exact
promotion only if live quality passes.

All seven requests contain exactly two candidates per card and fit the guard:
maximum 7,963 estimated input-plus-cap tokens, grief 6,858. 142 evaluator tests
and 28 adapter tests pass; scoped lint, typing and diff checks pass. The private
preflight records the exact hashes and preserved Cloudflare local proof. The
profile requires a new grief smoke and independent review before a matrix; the
remaining eight-attempt combined budget is unchanged. No credentials or
inference are used by this preparation.

## Final Qwen candidate preparation — 18 November 2026

The high-effort, two-candidate GPT-OSS grief request also returned HTTP 400
`json_validate_failed`. Its safe diagnostics report an empty `failed_generation`
value and no usage or finish reason. This does not prove reasoning exhaustion;
no more GPT-OSS tuning is authorized by this preparation.

The separate Groq-only `--profile qwen-none-v1` uses `qwen/qwen3.8-27b`,
`reasoning_effort:none`, `reasoning_format:hidden` and a 4,096-token output cap.
Groq's [Qwen model documentation](https://console.groq.com/docs/model/qwen/qwen3.8-27b)
and [reasoning reference](https://console.groq.com/docs/reasoning) document this
nonthinking configuration and hidden reasoning format. `include_reasoning` is
omitted because it is mutually exclusive with `reasoning_format`. This is a
preview model and an evaluation candidate, not an approved production default.

The trusted wire schema and instructions use the neutral field `imagery` for
both card and astrology layers. The adapter checks the actual returned Qwen
model and exact wire keys, rejects duplicate or old/new colliding keys, then
maps to the existing canonical `quirky_interpretation`/`quirky` fields. It never
rewrites the returned model identity. Explicit refusals and `content_filter`
stop evaluation; tools and malformed envelopes remain ordinary invalid output.
All existing text bounds, exact card/reference/chart checks and complete source
facts remain unchanged. Because both model and field naming change, this tests
the candidate configuration, not an isolated causal model comparison.

All seven actual-retrieval dry requests pass without reading credentials or
calling inference: maximum 7,675 estimated input-plus-cap tokens, grief 7,010.
Original six/four-candidate pools are retained. The private preflight binds the
exact request/schema/context/adapter hashes and all 28 prior reservations.
Combined evaluator/adapter tests pass (197), as do scoped lint, module typing
and diff checks. The shared decoder's explicit model allowlist change invalidates
older adapter smoke fingerprints; historical evidence is preserved.

A fresh Qwen grief smoke and independent review are required before the remaining
six cases. At most seven direct requests remain under the unchanged cumulative
35-attempt limit; no automatic retry or fallback is added by this evaluator.

## Deterministic-evidence phase — 18 November 2026

The first Qwen grief result passed local structure in 2.374 seconds but failed
independent editorial review: it introduced unsupported plot chronology and
assumed the choir had been offering superficial comfort. No remaining matrix
was run for that profile; its receipt and code remain preserved.

The newly authorized `qwen-evidence-v2` separates factual background from model
writing. A selected reference ID resolves to the exact `public_context` supplied
for that card; the adapter copies it into the optional `evidence` field. The model
cannot supply or override evidence. Server validation compares the text exactly,
including whitespace. The frontend presents it separately as Background. Legacy
readings can omit the field; the Gemini generation schema excludes it, preserving
existing Gemini requests. Historical stored readings retain their saved facts.

The isolated `groq_qwen_v2.py` keeps Qwen none/hidden and the 4,096 cap. Its
`reflection_question` maps deterministically to canonical interpretation, while
`imagery` retains the v1 mapping for cards and astrology. Card reflections and
connections must be invitational questions; the connection uses a relevant motif
without retelling the biography/plot or attributing a lesson to a person or work.
The introduction frames card meanings as possibilities. Exact wire keys,
reference membership, duplicate rejection, refusal handling, prose bounds and
chart anchors remain enforced. This removes the fact-paraphrasing task rather
than prompting for a better paraphrase. Question syntax is not a factual-quality
proof; independent review remains required.

All 29 prior attempts count toward the new explicit ceiling: 38 combined and
24 per provider. Historical compact execution still stops at 35/20. The new
profile requires its own grief smoke, then the six other scenarios only after
review. Nine attempts remain; no automatic retries, billing changes or production
enablement are introduced.

All seven actual-retrieval dry requests pass with unchanged candidate facts/chart
and original six/four-candidate pools: maximum 7,663 estimated input-plus-cap
tokens, grief 6,998. Combined evaluator/adapter tests pass (220), including exact
whitespace evidence, post-adapter tampering, model evidence injection, old/new
key collisions, all requested astrology modes, refusals and cumulative ceilings.
Scoped lint, module typing and diff checks pass. The exclusive 0600 private
preflight records the frozen hashes; preparation reads no credentials and makes
no inference calls.

## Question-shape correction and explicit failure diagnostics — 18 November 2026

The first evidence-v2 grief response was HTTP 200 but failed
`invalid_reflection_question` in 1.735 seconds. Its rejected text was not retained,
so the actual phrasing cannot be reconstructed. A focused test demonstrated that
the prefix whitelist could reject valid invitations starting with “Can” or “In
what way”. Validation now requires one question mark at the end, without a
word-start whitelist. Exact evidence, identity, chart and length checks remain;
question syntax still does not establish editorial quality. The model, prompt,
profile version and all seven request/schema/context/chart hashes are unchanged.

Safe failure diagnostics report only the six known question-field paths, question
mark counts and whether each ends with a question mark. The explicit
`--capture-rejected-output` option additionally allows inspection of rejected
HTTP-200 final-channel text for these fixed synthetic scenarios. It defaults off
and never accepts a custom question or user-supplied output path. Only
`message.content` is saved, possibly truncated when the provider reports length;
headers, error bodies, refusals, tool calls, hidden reasoning fields and known
reasoning markup are excluded. Both UTF-8 content and serialized artifact are
bounded to 100,000 bytes, with exclusive creation and mode 0600. This is an
explicit evaluation diagnostic exception; production does not retain rejected
prose. No rejected text is printed or included in safe result receipts.

236 evaluator/adapter tests, scoped lint, typing and diff checks pass, including
valid English openings, private-marker diagnostics, default-off capture, exact
content-only persistence, Unicode/escaping limits, prior-file preservation and
fixed-scenario guards. The final private preflight verifies every request remains
byte-identical and counts all 30 prior reservations. Eight of the authorized
38 attempts remain; no automatic retries were added.

## Complete imagery sentence clarification — 18 November 2026

The next evidence-v2 grief response passed question shape and exact evidence
binding but was rejected for one 29-character imagery fragment. The explicitly
captured final-channel text showed all three imagery fields were noun fragments.
Independent editorial review found no additional material factual or sensitive-
tone blocker; two reference questions were generic and remain a quality concern,
not evidence of invented facts. The response remains failed, without repair.

The same CLI profile now binds wire version `compact-groq-qwen-evidence-3` and
adds one general instruction: each imagery field is a complete descriptive
sentence, aiming for 80–180 characters. The local 40–500-character bounds stay
unchanged, and a regression confirms the actual short fragment still fails.
All seven schema/context/chart hashes are unchanged; request hashes reflect the
new instruction. The new version requires its own successful grief smoke.
237 combined evaluator/adapter tests, scoped lint, typing and diff checks pass.
No calls were made during preparation; all 31 prior reservations remain counted.

## Evidence-3 matrix outcome and bounded astrology diagnostic — 18 November 2026

The final imagery-version grief smoke passed local validation in 2.050 seconds.
Independent review rated it usable with minor concerns: exact source backgrounds,
respectful tone and practical check-ins, but some presumptive present-tense
wording and generic reference analogies. Blank, Nataraja and inbox also passed
local validation and independent review with minor prose/analogy concerns. This
is evidence for these four fixed cases, not every ordinary question.

Western failed the introduction length bound. Captured text also lacked directly
bound body/sign/house wording in normal astrology prose, used a rigid rest plan,
and placed named references in imagery. Vedic failed question shape: selected
Félix González-Torres but introduced John Stuart Mill and unsupplied claims in
that connection, a material image-to-text mismatch. Its Moon Sagittarius House2
and Mercury Virgo House11 anchors were correct. Both returned HTTP429 token-rate
failure with no reading; no editorial assessment is possible. The failure was
not retried. An approximate request estimate does not prove provider quota fit.

The new explicit Groq-only `qwen-astrology-medium-v1` retains the exact evidence-3
prompt, model, hidden reasoning format, output cap4096, source fact text and chart.
It changes effort to medium and bounds the actual supplied shortlist to two
candidates per card. The pure helper returns both effective canonical input and
wire; decoder and domain validator use that same shortlist, rejecting references
outside it. It rejects ordinary scenarios. Its own successful Western smoke and
independent review must precede Vedic/Both. Every previous reservation counts:
38 used, at most three new attempts,41 combined/25 per provider. No automatic
retry, new billing or validation relaxation is introduced.

[Groq's reasoning documentation](https://console.groq.com/docs/reasoning) supports
Qwen medium reasoning with hidden final-only format. Reasoning shares the output
budget, so this configuration may improve adherence or reduce available final
text; the experiment does not assume an improvement. All three dry requests fit
the conservative estimate with room: Western6,649, Vedic6,628, Both7,046 including
the4096 cap. These are approximate byte-based estimates, not provider usage or
quota guarantees. Every existing evidence-3 request remains byte-identical and
its ordinary local smoke proof remains valid.

251 evaluator/adapter tests, scoped lint, module typing and diff checks pass.
Coverage includes effective-shortlist parity, rejected removed references,
astrology-only selection, exact stored-chart revalidation for Western smoke,
wrong/mutated proof rejection and unchanged older phase ceilings. The exclusive
0600 preflight records hashes and all38 historical attempts; no credentials or
inference were used during preparation.

## Western decimal-anchor correction and offline proof — 18 November 2026

The medium Western response was initially recorded as failed because the shared
anchor validator treated decimal points as sentence boundaries. Its actual
Moon Scorpio 13.32° house 8 and Mars Aquarius 27.96° house 11 match the supplied
computed chart. The narrow validator fix permits a dot only between two digits;
real sentence boundaries, other body names, wrong signs and wrong houses still
reject. Fifteen focused boundary cases cover that distinction. Independent
editorial review rates the unchanged reading usable with minor generic-reference
and advice-length concerns, without a material factual or sensitive-tone block.

The evaluator now supports the explicit offline-only command
`--revalidate-western-smoke-attempt 23` for this original Groq astrology-profile
Western anchor failure. It cannot execute inference, load credentials or reserve
an attempt, and cannot admit safety, format, HTTP or other scenario failures.
It binds the original reservation, identical result copies, preflight, request,
computed chart and bounded final-content fingerprints to a fresh exact request.
The original domain-failure path had already verified actual model identity and
stop completion; only that minimal verified envelope is reconstructed around the
unchanged captured final text. Current decoding and full domain validation must
pass, and every generated prose field must remain identical.

The command writes new exclusive0600 normalized evidence and a supplemental
attestation. It never updates the original failed result or its captured text.
Smoke lookup checks every artifact fingerprint and revalidates against the current
full validator; no mutable `valid` flag alone can unlock the matrix. The proof
records zero provider calls/reservations and does not imply editorial approval.
269 evaluator/adapter tests, scoped lint and diff checks pass, including refused
safety/format substitutions, request/chart/content tampering, private artifact
checks, stale proof rejection and no-network execution. Read-only replay of the
actual attempt23 passes with unchanged prose; the release operator owns the
explicit attestation command.39 total attempts remain used, leaving two.

## Final release decision — 18 November 2026

The comparison is closed at **41 direct attempts: Groq 25, Cloudflare 16**. All
prior phases, HTTP errors and invalid responses remain in the cumulative ledger;
the offline Western replay added zero calls and zero reservations. No direct
attempts remain under the authorized ceiling, and no more tuning calls are
planned. Historical ten-request, 35/20 and 38/24 ceilings remain attached to their
original profiles; only the final astrology diagnostic had 41/25 authority.

| Fixed scenario | Final configuration | Actual result | Independent review and decision |
| --- | --- | --- | --- |
| Blank question | Qwen none, evidence-3 | Valid, 1.158 s | MINOR; usable general card reflection, some presumptive choice/shift wording and generic analogy. |
| Grief / community choir | Qwen none, evidence-3 | Valid, 2.050 s | MINOR; exact backgrounds, respectful imagery and practical check-ins; some current-state assumptions and loose analogies. |
| Nataraja / changing a dance routine | Qwen none, evidence-3 | Valid, 1.782 s | MINOR; exact named form/tradition, no assumed faith; some additional interpretive symbolism and overstated ritual wording. |
| This Is Fine / office inbox | Qwen none, evidence-3 | Valid, 1.506 s | MINOR; appropriate ironic meme and practical step; two generic links and minor grammar. |
| Western / rest before a performance | Qwen medium, two candidates | Original domain rejection, 7.035 s; unchanged output subsequently validates offline | MINOR; exact Moon Scorpio 13.32° house 8 and Mars Aquarius 27.96° house 11, reflective tone and useful pause/delegation. Some generic links and bundled advice. Approved after independent review and additive proof. |
| Vedic / shared garden tools | Qwen medium, two candidates | Rejected, 5.192 s | BLOCK; all three connections are literal instruction placeholders, intro 722 exceeds 600, and astrology prose adds an unselected reference/purpose claim. Correct Sun/Mars anchors do not rescue it. |
| Both / kindness and deadlines | Qwen medium, two candidates | Rejected, 5.277 s | BLOCK; intro 686 exceeds 600, a nested quoted question fails shape, and Bondar connection invents scheduling/protocol details not in supplied context. Both systems' selected placements are otherwise correct. |

Only **ordinary and Western** Groq modes are accepted for the release. Groq
Vedic/Both and all Cloudflare modes remain excluded from the approved mode list;
their correct fragments, isolated successes or fast responses do not establish
reliable complete readings. Existing approved providers and their bounded failure
behavior remain responsible for modes without an approved alternative. No failed
output was trimmed, paraphrased, filled in or promoted to make it pass.

The Western supplementary receipt binds the actual attempt 23 failure, captured
final text, exact original request/chart, current decoder/validator and unchanged
generated prose. It records the original failed status and independent editorial
review separately. Final Vedic/Both failures remain failed, with their explicitly
requested synthetic final-channel diagnostics private. No error bodies, headers,
credentials or hidden reasoning were retained in those diagnostic artifacts.

These seven fixed scenarios establish a bounded release baseline, not exhaustive
coverage of all questions, users, birth charts or catalogue references. Exact
source-text binding prevents model paraphrase from replacing the background; it
does not itself certify every upstream source claim or make a generic analogy
specific. Full local verification passed separately (244 frontend tests, 6,946 backend tests,
contracts); deployment, live mobile proof and production mode settings require
the root release record rather than inference from this evaluation table.
