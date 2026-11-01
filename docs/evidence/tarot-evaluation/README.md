# Live Tarot evaluation — 31 October 2026

Three fixed, non-personal scenarios used the dedicated Games Development free-tier
project and `gemini-3.5-flash-lite`, prompt contract `pop-tarot-1`. The adjacent
JSON files are the real saved outputs, not fixtures or handcrafted readings.

All three validated the supplied card identities, positions/order, field lengths
and strict schema. Editorial review found relevant card interpretations,
recognisable film/TV analogies and practical next steps. The small set has a
Hollywood/English-language reference bias and is not a broad quality benchmark.
Direct generation took 2.57, 2.45 and 2.14 seconds; no cached input tokens were
reported. The adapter requested low thinking, a 2,400-token cap and `store=false`.
Google's free-tier product-improvement terms still apply.

A separate real browser spread completed on retry, with the first attempt
rejected before saving output. The chosen cards remained intact. The successful
reading was identical after page refresh and a real API process restart. A 390px
layout check confirmed no horizontal page overflow. Five provider attempts were
made across these checks: three direct evaluations and two browser attempts.
The first browser response was not retained; its exact rejection cause is unknown.

Questions and provider output are excluded from logs; rejected payloads and
exception text are excluded from error responses. Only counts/model/exception-class
diagnostics are logged. Deterministic
integration coverage verifies failed generation, private errors, retry and saved
readback. These checks are local; no deployed reading or hosted auth claim is made.
