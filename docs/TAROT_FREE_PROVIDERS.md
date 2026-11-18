# Free hosted inference options for Tarot

Verified on **18 November 2026** against official provider documentation. These
are research candidates, not configured or accepted replacements for Gemini.
No account, API key, billing arrangement or inference request was created for
this comparison. The existing free Gemini plan remains selected.

The acceptance requirement is a complete private Tarot reading: three ordered
cards, grounded references, normal and imaginative interpretations, and optional
Western/Vedic/Both analysis. A short successful chat or valid JSON alone would
not establish equivalent quality. Open model weights also do not supply free
hosted compute; operating them locally or on rented hardware has separate costs.

## Current allowances

| Provider | What is actually free | Candidate fit and limits |
| --- | --- | --- |
| **Groq** | The rendered **Free Plan Limits** table lists GPT-OSS 120B, GPT-OSS 20B and Qwen3.8 27B at **30 requests/minute, 1,000 requests/day, 8,000 tokens/minute and 200,000 tokens/day** each. Limits apply at organization level; the account console is authoritative. | First candidate: `openai/gpt-oss-120b`. Its production model listing has 131,072-token context and 65,536 maximum completion tokens. It supports strict JSON Schema. The free token quota, rather than the headline request quota, is likely to constrain our readings. [Limits](https://console.groq.com/docs/rate-limits), [models](https://console.groq.com/docs/models), [structured outputs](https://console.groq.com/docs/structured-outputs). |
| **Cloudflare Workers AI** | **10,000 neurons/day**, resetting at **00:00 UTC**. On Workers Free, further requests fail when the allocation is exhausted; additional paid usage requires an upgrade. | Second candidate: `@cf/openai/gpt-oss-120b`, with 128,000-token context and low/medium/high reasoning. It is not in the documented list requiring a paid billing method. The model definition exposes JSON Schema, but exact full-reading compatibility remains untested. [Pricing](https://developers.cloudflare.com/workers-ai/platform/pricing/), [model](https://developers.cloudflare.com/workers-ai/models/gpt-oss-120b/). |
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

## Recommendation and acceptance boundary

Evaluate **Groq GPT-OSS 120B first**, with **Cloudflare GPT-OSS 120B second**, using
synthetic questions and a separately bounded attempt budget. Keep the free plans;
do not add paid fallback, automatic credit purchases or trial-dependent capacity.

Both require an adapter and full-reading verification, not merely a model-name
change. Preserve the existing local validation, exact candidate identities,
source qualifications, private saved-reading behavior and computed chart anchors.
Groq strict mode requires every property to be required and every object closed
with `additionalProperties: false`. Our tuple ordering, field lengths and
optional astrology shape must be checked against the supported schema subset.
Cloudflare documents a JSON-schema path but warns that requests can fail when
the model cannot satisfy the schema. Neither provider has been tested with this
app's complete contract. [Groq schema rules](https://console.groq.com/docs/structured-outputs),
[Cloudflare JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/).

The current application reserves up to **8,192 combined reasoning/output tokens**
and bounds the serialized request at **16,000 characters**. Groq's free 8,000-token
minute allowance may reject an unchanged request once input and reserved output
are considered. Verify its exact accounting and actual tokenization; do not
silently truncate required sections or relax validation to make it fit.
Cloudflare's acceptance of our exact 8,192-token cap also remains untested.

Measure complete-request latency and failure rates, not advertised decoding
speed. Before adoption, inspect real blank, sensitive, source-qualified and Both
readings, then verify saved refresh/archive privacy in the app. The current
Gemini evaluation does not establish any other model's quality. Provider limits,
availability and model catalogues can change; refresh these primary sources
before implementation.
