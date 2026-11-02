# Shared recovery, Tarot and concurrency receipt

## Implemented

One pure `acceptRoomSnapshot` accepts every room response source, including
React Query's normal fetch completion through structural sharing. Lower room
revisions cannot replace a newer action/heartbeat/bot/rematch; equal revisions
refresh presence. The installed QueryClient is tested with actual deferred
responses, not a mocked implementation of the acceptance rule.

Tarot derives an untouched question from the saved response. Explicit edits,
including empty, take precedence; the table is already keyed by match ID.
Ordinary and saved-chart retries are exercised after refresh without AI calls.
Pre-1970 input warns about local-time uncertainty. The preview displays the actual
server-resolved timezone/UTC offset (including historical seconds); this ephemeral
metadata clears on edit and is excluded from saved charts/provider context. Fifteen independent JPL samples
are now durable tests alongside prior J2000 angle/cusp and IANA gap/fold checks.
Waiting members now receive no active-match game/history/casino cue/bot-driving
metadata; participant and outsider behavior stays explicitly tested.

Only five numbered Tarot images changed. The original atlases remain. Original
1024×1536 masters and compact512px WebP derivatives are versioned separately.
Source and actual320/390/1440 browser frames were manually counted: Two Cups2,
Six Cups6, Eight Cups8, Eight Pentacles8, Nine Pentacles9. Full-frame fitting keeps
motifs, heads and labels; all78IDs still map uniquely. Selected390px browser frames
are in `tarot/`; this is symbolic visual review, not an automated object counter.

Uno's four colours now occupy two columns at every width. Its fixed footprint
was adjusted after a320px check exposed clipped alternatives from the longer
roulette instruction. All four choices now fit at320/390/768/1440 without internal
scrolling. Other long decision docks have scroll-edge shadows. Keyboard/touch
and CSS200%/400% scaling are covered in game receipts; native screen-reader and
human novice studies have not been performed.

## Bounded live reading evaluation

Four real requests, one per ordinary/Western/Vedic/Both mode, used public J2000
Greenwich chart data and a synthetic creative-hobby question. Four different
spreads include Tower/Three of Swords/Death and the corrected numbered imagery.
No personal input was used. Production prompt, validation and limits unchanged:
`pop-tarot-6`, `gemini-3.5-flash-lite`, low effort,3600 output cap,16000-character
input guard. All four returned valid complete readings first attempt.

| Mode | Input/output tokens | Seconds | Semantic review |
| --- | --- | --- | --- |
| Ordinary |856/707|3.85|Three distinct meanings, imaginative parallels, concrete15-minute action|
| Western |1533/823|4.32|Difficult cards framed without predicted harm; exact Sun/MC sign+house grounding|
| Vedic |1496/1109|5.21|Meaningful change/nostalgia/boundaries; exact Sun/Moon/ASC grounding; secondary astrology next-step generic|
| Both |2000/1064|5.66|Western/sidereal distinctions preserved, varied humour and small practical actions|

Total5885input/3703output tokens, no cached input, retry or cap breach.13character
connections across12cards used10distinct characters; each spread had distinct
characters and accurate named sources. Core advice was grounded and optional,
quirky text distinct, and selected placements matched the deterministic chart.
The Vedic astrology-specific next-step was weaker than the concrete Tarot step;
this small sample does not establish universal content quality. Complete synthetic
outputs remain in ignored `.vercel/audit-fixes-evaluations/`; only this safe summary
is committed. No topic-specific production prompt patch was added.

The user explicitly elected to retain existing44copyright-reference character
images. Existing3public-domain/1licensed classifications and source credits remain
honest; no permission grant or legal clearance was invented.

## Transport evidence

Proxy failures now record normalized route, method, status, duration and allowlisted
error class. No IDs, credentials, full URLs, exception text, request/response bodies
or game state enter diagnostics. Browser helpers separately count HTTP failures
and transport recovery. HTTP503 and possibly committed mutations are never retried.

Fresh bounded same-origin workload: eight local Flip7 rooms,16simultaneous requests,
96snapshots+96heartbeats, no HTTP/transport failures or retries. Maximum snapshot207ms,
heartbeat209ms. All eight matches abandoned and memberships left;16cleanup responses200.
`concurrency.json` is the aggregate evidence. The original audit503 is preserved;
this is a candid non-reproduction, not a proven cause or production load claim.
Two initial test setup errors were corrected (minimum seats and201creation status).
Eight lobbies created before the bad status assertion were recovered by exact QA
identity/local-scope checks and authorized leave, each404readback; no user room touched.

## Focused evidence

Before final integration:6cache/art Vitest cases and types passed;38Tarot/transport
browser cases passed across desktop/phone. Art/Uno four-width checks passed; final
bounded workload passed. A second agent independently reviewed cache/recovery/privacy
source with no actionable defect. Final named verification reports and release status
are recorded in root progress.txt, separate from these component checks.
