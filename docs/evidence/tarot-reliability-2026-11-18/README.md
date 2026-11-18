# Tarot mobile and provider recovery — 18 November 2026

## Outcome and acceptance

Improve the entire phone reading flow, including ordinary Tarot, Western, Vedic
and combined astrology, character images, saved analysis and useful recovery.
Show actual processing stages with clearly estimated percentage and remaining
seconds. Preserve the exact spread, question and computed chart across refresh
and retries. Never manufacture a completed AI reading after every provider fails.

The [mobile receipt](mobile.json) distinguishes real local sessions, image files
and persisted archives from constructed provider replies. It records75 passing
Chromium/WebKit cases at320/390/1440px; representative images were inspected,
not every possible combination of5,636 catalogue references.

## Implementation

- `ReadingProgress` shows saved preparing/matching/writing/retrying/checking/saving
  stages. The server owns timestamps and estimates; estimates expire into a slow
  message, stay below100%, and do not imply access to model token progress.
- Active generation now polls its saved state during the original POST. A late
  progress GET cannot overwrite a completed result. Only an explicit submission
  scrolls the loader into view, and reduced motion stops animation.
- Each milestone uses a short transaction guarded by match, lease and attempt.
  Progress is private and omitted from completed archives. Raw birth inputs remain
  outside storage, URLs and AI requests; only the computed chart is retained.
- Alternative models receive fixed card slots and permitted reference/placement
  IDs. The server restores exact card identities, supplied reference background
  and calculated body/sign/house labels. Every interpretation remains model-written
  and passes the shared reading validator; no rejected prose is trimmed into a
  supposed success.
- Three-provider routing reserves useful time for later alternatives. Safe output
  corrections also work with astrology. Every transmission counts against the
  existing request budget. Refusals stop rather than seek a less restrictive model.

## Research used

[Google structured output](https://aistudio.google.com/docs/structured-output),
[Groq structured output](https://console.groq.com/docs/structured-outputs), and
[Cloudflare JSON mode](https://developers.cloudflare.com/workers-ai/features/json-mode/)
support explicit schema contracts but still require application validation.
The implementation therefore separates provider wire formats from authoritative
saved reading types and retains field, identity and chart validation locally.

[Instructor's architecture](https://python.useinstructor.com/architecture/) offers
validation and corrective retry patterns. The application already has Pydantic,
httpx, shared validation, leases and a single bounded retry owner. Those existing
pieces implement the useful pattern without adding a second retry system or SDK.

Read-only comparison with Shikha's current `ExamRunWatcher` informed server-stage
polling and honest progress. Its older elapsed-time simulated-stage component was
not reused. No Shikha files, credentials or data were changed.

## Provider evaluation boundaries

The new free-only phase preserves41 prior direct alternative requests and permits
at most12 further direct requests: six Groq and six Cloudflare. Failed calls count.
Gemini preserves80 prior operator attempts, with four direct mode checks and two
hosted attempts reserved in a separate ledger. Requests use synthetic questions
and chart profiles; full outputs remain in private ignored evidence.

The unchanged production Gemini model returned503 for all four new direct mode
checks. This is current availability evidence, not four new successful editorial
checks. Previous accepted Gemini output remains historical evidence.

Initial alternative output passed structural validation but failed editorial
review: Groq's grief analogy was inappropriate, and Cloudflare repeated generic
advice. The revised general question/reflection contract preserves exact source
background and reduces unsupported claims. A subsequent length-only rejection
exposed unnecessary compact limits; accepted field sizes must follow the shared
product contract, not an arbitrary tighter evaluator limit. Historical failures
remain failures; any offline revalidation is identified separately from new calls.

Two further bounded Groq phases brought the cumulative direct ledger to 57
(35 Groq, 22 Cloudflare). The final JSON-object experiment returned a response
with misplaced fields; the corrected format then hit a provider quota rejection.
Its two unused request slots are retired for this release. No rejected response
was promoted into production by discarding fields or substituting prose.

## Accepted release coverage

| Provider | Ordinary | Western | Vedic | Both |
| --- | --- | --- | --- | --- |
| Gemini | Existing contract | Existing contract | Existing contract | Existing contract |
| Groq Qwen | Grounded adapter | Preserved accepted medium profile | Disabled | Disabled |
| Cloudflare Llama | Grounded adapter | Grounded adapter | Grounded adapter | Grounded adapter |

All six enabled alternative cases pass shared validation and editorial review
with recorded limits. Groq ordinary and Cloudflare ordinary/Western/Vedic include
explicit revalidation of unchanged saved prose against the shared product bounds.
Cloudflare Both has a successful call using the final request format. Groq
Western preserves its previously accepted output and byte-identical request;
it is not a new successful live call. Groq's Vedic/Both modes are hard-gated even
if an environment variable mistakenly includes them. The JSON-object candidate
remains evaluation-only.

Cloudflare is a useful basic backup; some connections and chart reflections are
generic. These checks do not establish equally rich, uniquely personal analysis
from every provider. Routing remains bounded to three transmissions and 105
seconds; useful time is reserved for later providers, including Cloudflare. An
all-provider outage, exhausted quota or refusal remains an honest failure with
the supported retry action, rather than a fabricated AI reading.

Hosted acceptance is separately bounded to two submissions (ordinary and Both),
at most six transmissions total: Gemini at most two, alternatives at most four.
There are no browser retries or paid-plan changes. Production proof is recorded
after the actual rollout, not inferred from these local tests or a successful push.

## Production result

[Production receipt](production.json) and [hosted mobile receipt](hosted.json)
record the exact deployed application `8c69c58815a88b120bb0ed9d9a31c91c69cd1482`.
Ordinary Tarot completed with Gemini. Combined astrology recovered automatically
from a temporary Gemini failure through Cloudflare, with the retry provider,
estimated percentage and time visible on the phone. Both readings retained exact
images and private saved output across refresh, a new spread and room closure.

Two submissions used three provider transmissions. Runtime warning/error/fatal
and HTTP500+ log queries returned zero records. All seven permanent owner rooms,
profile and identity remained unchanged; schema and grants passed read-only checks.
The two hosted QA rooms and temporary contexts were closed. Existing development
services and final evidence were retained; earlier cleanup removed43.4MB of
superseded captures. Cloudflare's live analysis remains a more generic backup;
Groq's unqualified astrology modes remain disabled.
