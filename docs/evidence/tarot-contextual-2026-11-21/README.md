# Tarot readings that answer the question — 21 November 2026

Status: local source and local real-provider evaluation only. Not pushed, not
deployed, not live-verified. The running local API predates this change.

## What changed

A reading used to return, per card, a fixed portrait with a move that never
mentioned the question, a single question as "the grounded read" and an image with
no stated meaning. Chart text named bodies, signs and houses without saying what
they mean. From `pop-tarot-16` every generated part says what it means for the
question, then may ask one question:

- **In short** mirrors what was asked and gives the spread's overall answer, naming two cards.
- **What this card says about your question** answers for that card and position.
- **The figure.** Fun keeps the server-owned portrait, scene and move and adds a
  generated bridge, "What this means for your question". Classic connections state
  a supplied fact and what it suggests for the question.
- **The plot twist** is an image and what it implies.
- **Chart perspective** gives each focus point as label, plain-words meaning of the
  body, sign and house, then what that could mean for the question; the chart link
  says how placements reinforce, temper or complicate the cards.

Guardrails are unchanged: question and source text are data; no invented facts,
diagnoses or predictions; gentle and meme-free for vulnerable questions; reflection
and real-world support for consequential decisions. Details and the validator are
in `backend/app/games/tarot/README.md`.

## Evaluation

Synthetic questions written for this check and the public J2000 Greenwich chart;
no player data. One transmission per run, a rejection recorded rather than retried.
Questions, readings and rejected text are kept outside the repository.

- 29 real requests of a 30-request budget: 21 valid readings, 3 rejected by the
  validators, 5 provider errors (3 Gemini HTTP 503, 2 Groq HTTP 429).
- Scenarios: a decision with context; an everyday question with context; one word;
  blank; a recent bereavement; the decision with a Vedic chart, a Western chart and
  both; one reading with a card hand-set to reversed in the evaluation script only.
- Prompts changed between rounds, so early rows show what each round fixed.

Rubric: 1 introduction mirrors the question; 2 each card answers with a detail from
the question; 3 bridge or connection says what the figure means, no invented
biography; 4 plot twist states its meaning; 5 next step concrete; 6 chart terms
glossed, tied to the question, link explicit; 7 guardrails.

Readings on the final prompts (P pass, ~ partial, F fail, - not applicable):

| Provider | Style | Scenario | Seconds | Request characters | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Gemini | Fun | everyday question | 4.1 | 8,800 | P | P | P | P | P | - | P |
| Gemini | Fun | blank | 3.9 | 8,627 | P | ~ | P | P | P | - | P |
| Gemini | Fun | everyday question, one card reversed | 4.4 | 8,763 | P | P | ~ | P | P | - | P |
| Gemini | Fun | decision, both charts | 13.0 | 14,086 | P | P | P | P | P | P | ~ |
| Gemini | Classic | decision, Vedic chart | 5.7 | 15,015 | P | P | P | P | P | P | P |
| Groq | Classic | decision, Western chart | 3.4 | 11,650 | P | P | P | P | P | P | ~ |
| Groq | Fun | decision, both charts | 3.9 | 13,838 | P | P | P | P | ~ | ~ | ~ |
| Cloudflare | Classic | decision, Vedic chart | 34.2 | 14,029 | P | ~ | ~ | P | ~ | ~ | ~ |
| Cloudflare | Fun | bereavement | 20.9 | 8,683 | P | P | F | P | ~ | - | ~ |
| Cloudflare | Fun | decision, both charts | 49.8 | 14,737 | P | ~ | F | P | ~ | ~ | ~ |

Earlier rounds, all valid readings: Gemini Fun bereavement was gentle and meme-free
with a concrete step, though the step named an object the question had not; a
one-word question stayed on its theme but presumed an upcoming choice; Groq Classic
on the everyday question passed every line.

What each rejection led to: Gemini copied the sign from an example in the prompt
instead of the computed sign, so the example became a placeholder; Cloudflare's
explained chart text ran past the old 520 and 650 character limits, so those limits
were widened and grounded field notes gained sentence counts.

The reversed card: the reading said "the Eight of Pentacles reversed" and that
patient repetition "might be giving way to perfectionism or shortcuts", with no
prediction and no "bad card" framing.

## Latency and size

| Provider | Model | Latency, valid readings | Request characters |
| --- | --- | --- | --- |
| Gemini | gemini-3.5-flash-lite | 3.2–7.1 s without a chart, 5.7–13.0 s with | 7,966–15,015 |
| Groq | qwen/qwen3.8-27b | 2.0–3.9 s | 11,650–13,838 |
| Cloudflare | llama-3.3-70b-instruct-fp8-fast | 20.9–30.3 s without a chart, 34.2–49.8 s with | 7,942–14,737 |

Every request stayed inside the 16,000-character budget. Measured offline with a
400-character question on six spreads: Fun 8,422–9,381 characters across the three
wires, Classic 13,522–14,298, Classic with two charts 14,555–15,108 with two
references per card. The largest wire with retry feedback was 15,846, and a unit
test asserts the 16,000 ceiling for every live wire. The question limit stays at
400 characters; at 600 the largest retry wire measured 15,940.

## Limits

- Cloudflare is the weak fallback. Its Fun bridges often ignore the portrait's move
  and give generic advice, its tone slips into "you should" and "you need to", it
  sometimes describes the asker in chart text, and a two-chart reading took 50
  seconds of its 60-second allowance. Groq was faster and closer to the rubric but
  sits last in the configured order.
- Groq Fun without a chart was not exercised by a real request (rate limited). It
  shares the grounded schema that ran on Cloudflare Fun and on Groq Classic.
- The validators are structural. They reject a part that only asks, a one-liner or
  an image without a second sentence. They cannot tell whether a statement is
  specific to the question; that is prompt quality, sampled here on ten final
  readings.
- A loose fit between a selected portrait and the question still produces a
  strained bridge; portrait selection is unchanged.
- Small invented details still appear occasionally (an object, a named feeling).
- Web layout was checked with route-mocked saved readings at 390 and 1440 pixels,
  not against a live provider response in the browser.
