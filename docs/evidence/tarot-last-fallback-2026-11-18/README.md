# Tarot last fallback — 18 November 2026

## Outcome and acceptance

The user requests eligibility over disabling less consistent models: prefer
Gemini, then Cloudflare, and retain Groq for every reading option as a final
attempt. Use simpler reasoning/format controls for the previously gated modes.
Keep exact card/reference/astrology facts, complete validated output, private
saved state and bounded cost/time accounting.

Acceptance includes all four modes reaching Groq after earlier provider failures,
useful final-provider time after persistence overhead, unchanged refusal handling,
focused free-account evaluation, exact pushed/deployed revision and live readback.
No paid-plan, new-key, schema or UI change is required.

## Method

[Groq reasoning documentation](https://console.groq.com/docs/reasoning) supports
`reasoning_effort="none"` for Qwen. [Its JSON mode guidance](https://console.groq.com/docs/structured-outputs)
distinguishes JSON syntax from application schema and semantic validation.
The last-fallback path uses those controls while retaining local validation.
A successful HTTP response alone is not proof of a usable reading.

The earlier ordinary and Western Groq profiles remain intact. Vedic/Both use
compact explicit JSON with reasoning disabled. Defaults and production priority
put Gemini and Cloudflare first; no mode is denied solely for failing the earlier
editorial qualification phase. A malformed or incomplete response still cannot
be presented as a completed reading.

Known complete JSON placement variants normalize without changing their text.
Conflicting or partial fields remain invalid. Time slots are recalculated after
progress persistence, with headroom for later providers. A slower provider no
longer prevents trying a faster final provider that still fits the deadline.

## Evaluation boundaries

Preserve 86 Gemini operator attempts and 58 alternative attempts (35 Groq,
23 Cloudflare, including the previous hosted recovery). This phase permits at
most four additional Groq requests, with reservations before every transmission
and no automatic evaluation retry. Failed calls count. Stop on quota; report it
without re-disabling the model or claiming fresh quality evidence.

Final checks, observed provider responses, configuration readback, deployment and
hosted acceptance are added with release evidence. Historical provider failures
and prior task receipts remain unchanged.
