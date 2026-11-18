# Free hosted inference options for Tarot

Verified on **18 November 2026** against official provider documentation. The
initial documentation-only research below created no accounts or inference
requests. A subsequent authorized comparison tested Groq and Cloudflare on
verified free accounts; **neither met the current Tarot acceptance requirements**.
The results are recorded at the end of this document. Other listed options remain
research candidates. Production Gemini and its free plan remain unchanged.

The acceptance requirement is a complete private Tarot reading: three ordered
cards, grounded references, normal and imaginative interpretations, and optional
Western/Vedic/Both analysis. A short successful chat or valid JSON alone would
not establish equivalent quality. Open model weights also do not supply free
hosted compute; operating them locally or on rented hardware has separate costs.

## Current allowances

| Provider | What is actually free | Candidate fit and limits |
| --- | --- | --- |
| **Groq** | The rendered **Free Plan Limits** table lists GPT-OSS 120B, GPT-OSS 20B and Qwen3.8 27B at **30 requests/minute, 1,000 requests/day, 8,000 tokens/minute and 200,000 tokens/day** each. Limits apply at organization level; the account console is authoritative. | First candidate: `openai/gpt-oss-120b`. Its production model listing has 131,072-token context and 65,536 maximum completion tokens. It supports strict JSON Schema. The free token quota, rather than the headline request quota, is likely to constrain our readings. [Limits](https://console.groq.com/docs/rate-limits), [models](https://console.groq.com/docs/models), [structured outputs](https://console.groq.com/docs/structured-outputs). |
| **Cloudflare Workers AI** | **10,000 neurons/day**, resetting at **00:00 UTC**. On Workers Free, further requests fail when the allocation is exhausted; additional paid usage requires an upgrade. | Second candidate: `@cf/openai/gpt-oss-120b`, with 128,000-token context and low/medium/high reasoning. It is not in the documented list requiring a paid billing method. The model definition exposes JSON Schema; the subsequent full-reading comparison did not meet acceptance (see results below). [Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [model](https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/). |
| **Hugging Face Inference Providers** | Free accounts receive **$0.10/month**, subject to change. More usage requires purchased credits. Credits apply to requests routed through HF, not a separately supplied provider key. | Suitable for a small experiment, not substantial recurring capacity. Structured output depends on the exact model/provider combination. HF recommends selecting that combination explicitly. [Pricing](https://huggingface.co/docs/inference-providers/main/en/pricing), [structured outputs](https://huggingface.co/docs/inference-providers/en/guides/structured-output). |
| **OpenRouter free variants** | Models ending in `:free` permit **20 requests/minute and 50 requests/day** without a credit purchase. Failed attempts count. A higher allowance depends on a credit purchase and is outside this free-only recommendation. | Lower-priority experiment. Pin a specific model/provider and verify its data policy and schema support. The automatic free router can change models, so it cannot preserve the identity of an evaluated model. [Free-model rules](https://openrouter.ai/collections/free-models), [free router](https://openrouter.ai/openrouter/free). |
| **Cerebras** | **No recurring free tier.** New accounts receive a **$5 trial**, requiring a verified payment method; it expires after **30 days**. Access stops when credits run out or expire. | Excluded from the ongoing-free recommendation. Current documentation explicitly supersedes older descriptions of an always-free tier. [Current trial FAQ](https://inference-docs.cerebras.ai/support/rate-limits). |

Cloudflare's published GPT-OSS 120B conversion is 31,818 neurons per million
input tokens and 68,182 per million output tokens. As an illustrative calculation,
3,000 input plus 3,000 generated tokens uses approximately 300 neurons, or about
33 such requests within the daily allowance. Using the full 8,192 generated-token
cap instead would use approximately 654 neurons, or about 15 requests. These are
budget examples, not measured Tarot throughput; actual usage, reasoning and
retries must be counted. [Neuron pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/).

## Credentials and data handling

- **Groq:** requires a Groq account and its own API key. Moving from Free to
  Developer requires a payment method; that upgrade is not proposed. Inference
  content is not retained by default, but reliability/abuse investigations can
  retain it for up to 30 days. All customers can enable zero data retention in
  Data Controls. [Setup](https://console.groq.com/docs/quickstart),
  [billing](https://console.groq.com/docs/billing-faqs),
  [data policy](https://console.groq.com/docs/your-data).
- **Cloudflare:** requires an account ID and API token with Workers AI Read/Edit
  permissions. Standard stateless inference has a zero-retention commitment;
  customer content is not used for model training. Explicit storage/logging
  features and documented safety/legal exceptions still matter.
  [Setup](https://developers.cloudflare.com/workers-ai/get-started/rest-api/),
  [data policy](https://developers.cloudflare.com/workers-ai/platform/data-usage/).
- **Hugging Face:** requires a token authorized for inference. A connected
  profile/repository OAuth integration is not evidence of inference permission
  and must not be reused on that assumption. HF says it does not retain routed
  request/response bodies; the selected downstream provider's policy also applies.
  [Client setup](https://huggingface.co/docs/inference-providers/en/guides/structured-output),
  [routing privacy](https://huggingface.co/docs/inference-providers/en/security).
- **OpenRouter:** requires an account/API key. This review has not cleared any
  particular free endpoint for private Tarot questions; check its underlying
  provider's retention/training policy before use.
  [Provider policies](https://openrouter.ai/docs/guides/privacy/provider-logging).

## Initial recommendation and acceptance boundary

The initial research prioritized **Groq GPT-OSS 120B first**, with **Cloudflare
GPT-OSS 120B second**, using synthetic questions and a separately bounded attempt
budget. The comparison below followed that order and retained the free plans,
without paid fallback, automatic credit purchases or trial-dependent capacity.

Both require an adapter and full-reading verification, not merely a model-name
change. Preserve the existing local validation, exact candidate identities,
source qualifications, private saved-reading behavior and computed chart anchors.
Groq strict mode requires every property to be required and every object closed
with `additionalProperties: false`. Our tuple ordering, field lengths and
optional astrology shape must be checked against the supported schema subset.
Cloudflare documents a JSON-schema path but warns that requests can fail when
the model cannot satisfy the schema. At the research stage, neither had been
tested with this app's complete contract. [Groq schema rules](https://console.groq.com/docs/structured-outputs),
[Cloudflare JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/).

The current application reserves up to **8,192 combined reasoning/output tokens**
and bounds the serialized request at **16,000 characters**. Groq's free 8,000-token
minute allowance may reject an unchanged request once input and reserved output
are considered. Verify its exact accounting and actual tokenization; do not
silently truncate required sections or relax validation to make it fit.
Cloudflare's acceptance of our exact 8,192-token cap was also untested at that stage.

Measure complete-request latency and failure rates, not advertised decoding
speed. Before adoption, inspect real blank, sensitive, source-qualified and Both
readings, then verify saved refresh/archive privacy in the app. The current
Gemini evaluation does not establish any other model's quality. Provider limits,
availability and model catalogues can change; refresh these primary sources
before implementation.

## Observed comparison and decision — 18 November 2026

Both accounts were confirmed locally as free plans, with credentials kept private.
The evaluation used the unchanged `pop-tarot-11` prompt, supplied reference facts,
computed charts and production reading validator. Groq used a 4,096-token generated
cap to fit its free token allowance; Cloudflare used 8,192. Low and medium effort
shared a ten-attempt ceiling per provider, including failures.

| Provider and effort | Requests / locally valid readings | Observed result |
| --- | --- | --- |
| Groq, low | 5 / 4 | Four ordinary readings completed in 2.413–2.687s. Blank and grief failed editorial review; Nataraja and inbox had minor concerns. Western returned HTTP 400 `json_validate_failed` mentioning `required`. |
| Groq, medium | 2 / 1 | Blank completed in 5.631s with cleaner connections but remaining framing/attribution concerns. Grief returned HTTP 400 `json_validate_failed` mentioning `maxItems`. |
| Cloudflare, low | 7 / 4 | Four ordinary readings completed in 20.714–29.032s but failed editorial review. Western and Vedic failed exact local validation; Both timed out at 90s. |
| Cloudflare, medium | 1 / 1 | Blank completed in 30.716s and passed the schema, but all card interpretations were literal placeholders and connections ended mid-sentence. Editorially unusable. |

These are small, fixed-case observations, not general model benchmarks. The
editorial failures included unsupported facts or motives, insensitive grief
comparisons, and reader circumstances invented for a blank question. For example,
both low-effort grief readings changed a supplied fact that a character does not
sing into a claim that the character is silent. A JSON/schema pass did not ensure
a complete, grounded reading.

The comparison stopped at **7/10 Groq** and **8/10 Cloudflare** requests, preserving
the unused allowance. Groq Vedic/Both were not run at low effort; Western/Vedic/Both
were not run at medium effort. Cloudflare medium grief/Both were not run after the
placeholder failure. These are explicit evidence gaps, not inferred prose failures.

**Neither tested configuration is adopted for the current contract.** This does
not reject either provider or model for other tasks. No production provider,
model, billing tier or saved-reading behavior changed. Continue the selected free
Gemini verification after its quota reset; no further alternative-provider calls
are required for this comparison. See the [evaluation receipt](evidence/tarot-expansion-2026-11-17/free-provider-evaluation.md)
for transport, validation and editorial distinctions.
