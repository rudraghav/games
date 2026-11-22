# Tarot table: one-tap draws, deck rows, drawn-card preview, Groq first — 22 November 2026

## What changed

- One tap or click on a face-down back reveals it (was: lift, then confirm).
- The deck lies in three overlapped rows; each back keeps a target of at least 44px
  each way and the targets never overlap.
- A bar under the deck scrolls through all 78 cards by finger or pointer, beside the
  existing arrows and the native sideways swipe.
- A drawn card opens its full page on click in every phase and shows a larger preview
  on mouse hover or keyboard focus (never on touch).
- Reading providers default to Groq, Gemini, Cloudflare.

## Measured locally

| Viewport | Backs in view before | Backs in view now |
| --- | --- | --- |
| 320 x 640 phone | 6 | 17 |
| 390 x 844 phone | 8 | 21 to 23 |
| 1440 x 900 desktop | 30 | 60 |

- Real rooms, phone (touch emulation) and desktop: three single taps or clicks drew
  three cards (78 to 77 to 76 to spread complete). A finger swipe on the backs moved the
  view from cards 1–23 to 17–41 without drawing; a finger drag on the bar reached cards
  60–78.
- Desktop: the first drawn card was a `View … card` button while still choosing; hover
  showed the preview (name, position, orientation, five keywords, short meaning,
  essence); click opened the page with Upright and Reversed tabs and the preview closed.
- Phone: a tap on a drawn card opened the page; no preview appeared.
- One real reading on a synthetic question was served by Groq (`qwen/qwen3.8-27b`,
  prompt `pop-tarot-16`, first attempt, 1,992 tokens) in 2 seconds; all three portrait
  bridges spoke to the question.
- Groq rate-limit headers on the development key: 1,000 requests a day, 8,000 tokens a
  minute.

## Checks

- `scripts/verify.py frontend backend contracts tooling`: pass (396 unit tests, 7,534
  backend tests).
- `scripts/verify.py browser`: 468 passed, 75 skipped, 1 failed. The failure is
  `uno-table.spec.ts` "failed Uno saves preserve the exact selection…" on the phone
  project (an expected action was not in the dealt hand); it passed 4 of 4 when
  repeated alone and no Uno file changed in this work.
- A gallery control measured 43.99998px once in a full Tarot run; the size check now
  compares to a hundredth of a pixel.

## Not verified

- Engines other than Chromium and real touch hardware (the phone checks use Chromium
  touch emulation with native touch events).

## Release

- Commit `28efb79b3ae77c8078563cfb8d9700d5e5705b12`, deployment
  `dpl_6dSFCZZW5ks2NT9ysHMxksfsBDy5` (production, READY). Production
  `TAROT_PROVIDER_ORDER` set to Groq, Gemini, Cloudflare before the deployment.
- Live desktop and phone-width rooms repeated the local checks above with the same
  results. A real reading came back in 5 seconds with the providers listed as Groq,
  Google Gemini, Cloudflare.
- Runtime errors and 5xx requests since release start: none. Both QA rooms closed.
