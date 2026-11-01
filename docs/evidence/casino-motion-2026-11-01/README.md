# Casino motion verification — 2026-11-01

Local implementation and browser evidence. No production deployment is claimed
by this workstream. All retained images use synthetic identities and authorized
engine projections, never live private rooms or internal decks.

## Changes and inspected views

The viewer stays at the first/bottom seat. A quiet shared turn outline moves to
the next player, the public action remains readable beneath the pot, and exact
committed payments move three representative chips from the actual actor seat
to the actual pot. Results move chips towards visible winning stacks. The stack,
pot and enabled controls update immediately; animations never delay a move.
The original felt/token art and licensed playing-card faces remain shared.

New permitted cards reveal briefly; hidden backs have no real card identity.
Splitting moves previously visible cards without dealing them again, and the
active blackjack hand scrolls inside its own horizontal rail into view. The
dealer hole card stays hidden until the engine projects it. Results remove the
active-hand outline.

Before implementation, inspected the real local design gallery at desktop 1440px
and phone 390px. Inspected the after images at the same widths, the nine-seat poker
table, seven-seat blackjack table, exact betting flight and active split hand.
The design gallery header is a development-only scenario selector; it is not the
production room header. Motion Storybook captures use its default font fallback;
the gallery images show the actual Next.js fonts.

| Evidence | Scope |
| --- | --- |
| `before-poker-desktop.png`, `before-poker-phone.png` | Original nine-seat composition |
| `before-blackjack-phone.png` | Original seven-seat pre-deal composition |
| `after-poker-gallery-desktop.png`, `after-poker-gallery-phone.png` | Current shared table composition and actual app fonts |
| `after-blackjack-gallery-phone.png` | Current pre-deal controls, no invented hands |
| `after-poker-bet-flight-desktop.png` | Committed Raise 4, three seat-to-pot chips |
| `after-blackjack-active-hand-phone.png` | Active second split hand revealed inside its rail |

## Verification

- `pnpm --filter @games/web type-check` and focused ESLint pass.
- Casino transition and existing table layout units: **14 pass**. Cases include
  duplicate/old/jumped versions, rematches, pause/resume, exact payment amounts,
  no inferred check/call labels, payout reconciliation, hidden-card identifiers,
  conserved split-card identities and immutable input projections.
- `backend/.venv/bin/python scripts/export_casino_motion.py --check` passes.
  The exporter contains **49 authorized snapshots** from complete legal matches:
  Hold'em 34, Teen Patti 10 and split blackjack 5. Its Python lint/format pass.
- All three Storybook sequences reached `finished` in the isolated CLI browser.
  Hold'em exposed three flop cards, one turn, one river, then permitted showdown
  faces; folded hands remained hidden. Teen Patti's own peek exposed three own
  faces while both opponent hands stayed anonymous until permitted showdown.
  Blackjack split preserved both known cards, revealed only its two new draws,
  shifted the active hand, then exposed the dealer only on closure.
- At 390px: a fresh payment produced three flights; changing Reduce Motion cleared
  the live layer and suppressed the next payment. Restoring motion animated only
  a fresh move. Pause, refresh, background, first refocus snapshot and a five-version
  jump produced zero flights/new-face markers; the next fresh action animated.
  Every sampled status contained exactly one current cue. At 320px and 390px there
  was no document overflow. A hit/check/fold never reused prior chip-flight DOM.
- Existing crowded-casino browser regression: **2 pass**, desktop and phone.
  Both 1120px and 740px available canvases avoid seat collisions. The first run found
  a nested query-container bug: `display: contents` removed the table's box but
  left it intercepting descendant queries. Removing that redundant declaration
  makes `casino-layout` the single width container and restores the 740px seat grid.

This focused visual/motion evidence complements the parent release's real-room,
bot/full-match, authorization, reconnect and production checks. Storybook's Next
move control plays the exact recorded legal action; its table action buttons do
not pretend to execute arbitrary moves against a recorded sequence.

## Motion contract and references

Only consecutive committed versions of the same unpaused match animate. Refresh,
missed versions, rematches and reconnect snapshots establish a static baseline.
Versioned public receipts contain only allowlisted casino verb/actor/amount,
never cards, choices or random state. Legacy matches can show an observable stack
reduction without guessing an action name. Payout motion follows observable
stack increases and never invents a gross side-pot allocation.

Reuse installed Motion 14.9.0 for transforms and shared layout; no dependency was
added. Its reduced-motion hook samples at mount, so the existing shared
`useMediaQuery` supplies active preference changes to the casino configuration.
Seat/pot coordinates are measured from rendered DOM; no viewport-specific path
coordinates or visual timers masquerading as game turns are used.

Primary references consulted: [Motion layout animations](https://motion.dev/docs/react-layout-animations),
[reduced motion](https://motion.dev/docs/react-use-reduced-motion),
[AnimatePresence](https://motion.dev/docs/react-animate-presence),
[PokerStars table appearance](https://www.pokerstars.com/help/articles/table-appearance-feature/232136/)
and [Zynga's published poker screenshots](https://apps.apple.com/us/app/zynga-poker-texas-holdem/id354902315).
Borrowed composition principles only: readable cards, viewer-first seating,
separate pot/betting controls, quiet current-seat emphasis and clear dealer marker.

## Real-room follow-up

The casino exporter is now part of the existing `contracts` verification group,
alongside canonical faces and Tarot assets. `python3 scripts/verify.py contracts`
passes its read-only comparison, including all 49 casino snapshots.

Ran the existing filtered solo acceptance against the local web/API services:

```sh
GAMES_SOLO_BOTS=1 GAMES_SOLO_BOT_GAMES=holdem,teen-patti,blackjack pnpm exec playwright test tests/browser/solo-bots.spec.ts --workers=2 --output output/playwright/casino-real-rooms-2026-11-01
```

**2 browser tests passed in 19.3 seconds**, containing six natural matches across
desktop 1440px and phone 390px. Every case verified saved results, the rendered
profile history, rematch, same-group game switching, results without horizontal
overflow and final room closure. These minimum-seat cases complement the prior
maximum-seat visuals and deterministic split/edge scenarios.

| Game | Seats | Human moves phone / desktop | Real client bot drives phone / desktop | Final version phone / desktop |
| --- | --- | --- | --- | --- |
| Hold'em | 2 | 4 / 4 | 4 / 4 | 9 / 9 |
| Teen Patti | 2 | 2 / 2 | 2 / 2 | 5 / 5 |
| Blackjack | 1 | 2 / 3 | 0 / 0, automated dealer | 3 / 4 |

The real rendered client drove every opponent bot; human decisions used only
their authorized projections. Each viewport also verified setup/autostart, a
clicked legal board move, bot add/remove, two deliberate transport failures and
the retry control, then reconnect without version loss. The summaries' two
failed drive responses per viewport are those deliberately injected setup 503s.
All normal casino drive requests succeeded.

Retained `real-rooms-phone.json` and `real-rooms-desktop.json` contain only counts,
status and source metadata. Both report `complete: true`, `cleanup: true` and
`roomClosed: true` for every case. Four owned setup/group rooms were closed and
fresh reads returned 404; no other room was touched. These are tests of the dirty
local workspace, with no serving-commit or production verification claim.

## Final integration review

Reviewed backend public-cue creation, receipt persistence/lookup, membership and
view serialization against the actual Hold'em, Teen Patti and blackjack commit
paths. Payment deltas, capped calls, split/double/insurance costs, same-action
settlement, side-pot returns, retries and legacy receipts match the intended
contract. Public cues never copy cards or submitted choices. Casino presentation
adds no fetches and continues to consume only the personalized room snapshot.

Fixed a preference edge found during this review: turning Reduce Motion on and
off inside one event's 900ms lifetime could replay its payment/card animation.
The hook now cancels the transient event itself while reduced motion is enabled;
restoration stays static until a new committed version. A mounted regression
passed on phone and desktop (final 2 tests, 2.3 seconds), including a fresh following
payment and cancellation/restoration of the three-card flop reveal:

```sh
GAMES_STORYBOOK_URL=http://127.0.0.1:6108 pnpm exec playwright test tests/browser/casino-motion.spec.ts --workers=2
```

This optional regression needs an existing local Storybook server; normal browser
runs skip it when that URL is absent. Frontend and browser TypeScript, focused
lint and all 14 casino/table units pass. Timers, frames and media/lifecycle
listeners clean up on unmount. Blackjack's final visible total label is
`hand bets`, with main/split/double semantics in its accessible label: insurance
has its own exact cue and is not included in the engine's public hand-bet sum.
Earlier retained captures use the preceding `wagered` label.
The regression asserts it observes the result within 850ms of the move, so expiry
of the 900ms event cannot produce a false pass.

## Production acceptance

On 2026-11-01, the parent release verified production revision
`c1169d204e99e2da70cafa2c9a8fe0aaf7793142` at
`https://games-seven-black.vercel.app`, deployment
`dpl_8F3o8ntZKUXCbpvoGxi5G93LDt43`. The existing filtered solo suite then passed
against that production target on phone and desktop: **2 tests, six natural
matches, 37.0 seconds**. No runtime, configuration or deployment changed during
the check.

Every case verified results, saved/rendered profile history, rematch and game
switching with the same group. Per viewport, Hold'em finished at version 9 with
four human decisions and four actual client bot drives; Teen Patti finished at
version 5 with two human decisions and two bot drives; blackjack finished at
version 3 with two human decisions against its automated dealer.

`production-phone.json` and `production-desktop.json` retain safe counts/status
and the exact explicit release SHA. Both report `complete: true`, `cleanup: true`
and `roomClosed: true` for every case. All four owned setup/group rooms closed
with fresh 404 readback. Setup also verified bot autostart, a clicked board move,
add/remove, the two deliberately injected 503 retry responses, and reconnect.
The normal casino bot drives succeeded. Production evidence supplements, and
does not overwrite, the earlier local/synthetic evidence.
