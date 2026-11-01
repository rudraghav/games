# Tarot latency controls — 1 November 2026

Three bounded nonpersonal local controls used the existing Gemini3.5Flash-Lite
free-tier key without logging it, storing provider history, changing source,
restarting services, or retrying. The full reading retains the complete v4
48-character cast, schema and3,600output-token cap. Only fixed evaluation inputs
were sent. Full reading text remains in private0600 ignored evidence; this record
contains safe timing, validation and usage metadata only.

| Control | Deadline | Result | Elapsed | Output/thought tokens |
| --- | --- | --- | --- | --- |
| Full v4, temporary minimal effort | 30s | ReadTimeout | 30.009s | No response/usage |
| Full v4, normal low effort | 55s | Validated complete reading | 26.723s | 672 /0 |
| Tiny Hello, low, max32, no schema | 55s | HTTP200 completed | 26.643s | 2 /0 |

The last two calls ran in parallel. Their nearly identical completion times are
consistent with baseline provider/transport overhead near the original30s read
cap. They do not identify the exact cause and do not establish a causal latency
benefit for removing the cast/schema or reducing effort. No successful response
over30s was observed. These are one request per control, not a latency percentile.

The full response passes the strict card/order/position/length/character contract:
all three cards have separate normal and quirky readings, one character each,
and distinct canonical references Ted Lasso, Tony Stark and Hermione Granger.
This is structural quality evidence; it does not replace the parent's prose
review of its other fixed-scenario evaluations or an actual client acceptance run.

Google's [Interactions thinking documentation](https://ai.google.dev/gemini-api/docs/thinking)
confirms minimal is supported and the default for this model. Its
[model guidance](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash-lite?hl=en)
recommends minimal for simpler latency-sensitive tasks. The control did not show
that effort solved these timeouts, so the existing model and low effort remain.
The parent owns a bounded read-cap adjustment, deterministic timeout regressions
and actual-client/production verification. No automatic transport retries were
introduced by these controls.

[Safe control metadata](controls.json) preserves request fingerprints and returned
usage counts. All three request processes completed, no temporary service or
browser was created, and requested private evidence remains0600. No further
provider samples were taken.
