# Free-provider evaluation

## Outcome and acceptance

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
