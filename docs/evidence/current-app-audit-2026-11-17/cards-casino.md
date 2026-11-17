# Card and casino current-app review — 17 November 2026

Reviewed current source after `0840f8b`, starting at clean `3be4108`. The local
app uses port 3217. Evidence below distinguishes rendered legal projections from
saved-room actions; this is not an exhaustive game-state claim.

## Fresh visual coverage

Actual screenshots were inspected at 320 and 1440 pixels for each game's
maximum-seat opening/decision fixture. Additional complex states were inspected
at 320 pixels. Standard ranks/suits, Uno symbols and Skyjo numbers remain
readable at their rendered size. The inspected collections and controls stay
within the phone page; no new persistent clipping or overlap was reproduced.

| Game | Additional current inspection or interaction | Limits of this pass |
| --- | --- | --- |
| Uno | Ten-seat Wild +4 challenge, explanation of possible penalties, actual challenge button and resulting failed-challenge projection. Saved failure/retry below. | No new complete ten-seat match or every challenge outcome. |
| Uno No Mercy | Six-seat colour roulette, eliminated-seat status and four colour choices; long-hand browser assertions. Saved normal-card failure/retry below. | Roulette rendered; elimination, every stack and large swap-target flow not replayed in a saved room. |
| Rummy | Six-seat 14-card winning-discard state, wild/taken/winning indicators, selecting a winning discard reveals distinct Declare and Discard actions. | Selection rendered; no new saved declaration or false-declaration penalty. |
| Shithead | Five-seat setup and legal crowded 22-card hand, wrapped rank corners, escaped seats, public/hidden own-table zones. | No new saved pickup/burn/blind-flip sequence. |
| Skyjo | Eight-seat opening and scored-round state, closer's doubled score, actual Next round leading to the fresh hidden grid. | Projection continuation; no new saved full round or every column-clear/final-turn branch. |
| Hold'em | Nine-seat preflop and river, betting range, own cards and hidden opponent hands; actual Check leads to named waiting state. | No new saved side-pot/all-in settlement. |
| Teen Patti | Six-seat seen hand and sideshow response; Accept sideshow leads to the viewer's loss/waiting state while opponent cards remain hidden. | No new saved tie/show/declined-sideshow match. |
| Blackjack | Seven-seat betting and split decision; Split pair produces two distinct hands/bets, active-hand label and bounded rail. | Projection continuation; no new saved insurance/natural/multiple-resplit settlement. |

Retained images and small probe results:
`output/playwright/current-app-audit-20261117/cards-casino/`.
The development inspector badge in captures is not production UI. Settled
casino continuation captures use reduced motion; they do not assert every
animation frame is correct. No new 768-pixel sweep was run by this reviewer.

## Reproduced and fixed: failed Uno save loses selection

In a real local two-seat Uno room at 390 pixels, Green Reverse was legal and
selected. One controlled HTTP 503 prevented the move from reaching the server.
The saved version stayed at 1 and the hand was unchanged, but selected cards
fell from one to zero and Play Green Reverse disappeared. The error asked the
player to retry while requiring them to reconstruct their choice.

`shared/CardTable.tsx` cleared the draft immediately after dispatching the move.
It now preserves the selection until the authoritative version changes. The
existing room/match/version draft key handles successful moves and stale-state
expiry; explicit clear and replacement selection still work.

`uno-table.spec.ts` now checks both Uno editions with two independent local
human sessions: legal projected card, controlled 503, unchanged saved version,
retained selection/action, refresh recovery, clear/change/reselect, exact legal
retry payload, one saved-version increment, and refreshed hand/selection after
success. Eight existing/new desktop and phone cases passed in 20.9 seconds.
After hardening duplicate-card identity selection, the two saved recovery cases
passed again in 30.9 seconds. Browser TypeScript, formatting and scoped diff
checks pass. No engine or API contract changed.

## Independent shared offline-patch review

Read-only review of `Room.tsx`, `useRoom.ts` and the added saved Deal assertions
found no blocking issue. The local paused projection does not mutate cached
server state; existing portalled Deal controls consume it. The reactive and
immediate browser-network guards prevent new offline move submissions. The test
checks the other seat's unchanged saved version, retained draft, no false saving
state and deliberate commit after reconnect. This addresses browser-reported
offline status; it does not claim every server-unreachable condition was tested.

## Cleanup and release boundary

The manual local QA room was abandoned and left through normal endpoints
(200/200), then denied further room reads (404). Each recovery-test room also
asserts normal abandonment/leaving and final 404; history and profiles remain.
The task's browser session was closed and 9,348 bytes of superseded task logs
removed. Current screenshots and concise evidence remain (about 5.6 MB).
No production room was created or changed. Publication and hosted verification
belong to the parent release task.
