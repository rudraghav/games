# All-games table review, 2026-11-03

Every one of the 27 games was reviewed as tabletop designer, game artist,
product designer and QA engineer at 320, 390, 768 and 1440 px (plus 1024x700 and
1280x720 for laptops), with minimum and maximum seats, long names and long
hands. The review found 251 problems (22 reported P0, 15 of them independently
reproduced; 148 P1; 81 P2;
`coverage.json` keeps the breakdown, the per-game evidence lists, what was not
covered, and every fix with how it was verified).

## Per-game coverage

Counts are evidence entries from the review: visually inspected (screens and
true-size art), played through (opening, midgame, crowded late game, result,
rematch) and verified in a saved room (moves committed through the normal UI,
then refresh/reconnect).

| Game | Inspected | Played | Saved room | Fix owner |
| --- | ---: | ---: | ---: | --- |
| azul | 7 | 6 | 4 | azul-gems |
| gem-market | 6 | 7 | 4 | azul-gems |
| four-in-a-row | 6 | 5 | 4 | boards |
| reversi | 6 | 2 | 3 | boards |
| checkers | 7 | 4 | 4 | boards |
| mancala | 6 | 4 | 3 | boards |
| boop | 7 | 5 | 5 | boards |
| holdem | 6 | 4 | 3 | casino |
| teen-patti | 5 | 5 | 4 | casino |
| blackjack | 4 | 4 | 4 | casino |
| deal | 13 | 11 | 7 | deal-layout+deal-decisions |
| deal-no-mercy | 6 | 3 | 2 | deal-layout+deal-decisions |
| sea-salt-paper | 3 | 2 | 4 | paper-gang-nimmt |
| the-gang | 3 | 3 | 5 | paper-gang-nimmt |
| six-nimmt | 3 | 2 | 4 | paper-gang-nimmt |
| rummy | 6 | 7 | 6 | rummy-shithead |
| shithead | 6 | 7 | 5 | rummy-shithead |
| skyjo | 4 | 4 | 5 | skyjo-flip7-trio |
| flip-7 | 3 | 4 | 3 | skyjo-flip7-trio |
| trio | 3 | 4 | 4 | skyjo-flip7-trio |
| tarot | 10 | 9 | 6 | tarot |
| uno | 5 | 7 | 6 | uno |
| uno-no-mercy | 4 | 4 | 3 | uno |
| word-agents | 6 | 7 | 6 | words-party |
| spill-or-chill | 4 | 6 | 5 | words-party |
| most-likely | 4 | 6 | 5 | words-party |
| hot-seat | 4 | 6 | 4 | words-party |

## Fixes and how each was verified

"Completed" means a player finished the action through the normal UI in a saved
room and the server version advanced; "rendered" means the screen was checked
(real room or engine-legal harness state) without completing that action.

| Owner | Fixed | Completed in saved room | Rendered, real room | Rendered, harness | Unit test only | Deferred |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| azul-gems | 25 | 10 | 7 | 8 | 0 | 3 |
| boards | 18 | 9 | 8 | 0 | 1 | 6 |
| card-art | 16 | 3 | 8 | 5 | 0 | 0 |
| casino | 30 | 18 | 10 | 1 | 1 | 4 |
| deal-decisions | 19 | 7 | 4 | 8 | 0 | 4 |
| deal-layout | 20 | 4 | 9 | 6 | 1 | 3 |
| paper-gang-nimmt | 28 | 13 | 8 | 7 | 0 | 2 |
| rummy-shithead | 21 | 9 | 11 | 0 | 1 | 5 |
| shell | 6 | 3 | 2 | 1 | 0 | 3 |
| skyjo-flip7-trio | 17 | 16 | 0 | 1 | 0 | 8 |
| tarot | 17 | 5 | 8 | 2 | 2 | 6 |
| uno | 10 | 8 | 0 | 1 | 1 | 7 |
| words-party | 22 | 18 | 0 | 4 | 0 | 4 |

Some stress states were constructed rather than reached by play: the 9-seat
Hold'em side pots with unequal stacks (real engine projection shown in a real
room page) and the 13-pile Deal board used for Sly Deal on a wild (legal engine
state exported as `sly-*` Deal scenarios, then played in a saved room).

## Layout lint, before and after

The same engine-legal harness states (259 mid-game scenarios plus the Deal
workspace scenarios) were rendered at 320, 390, 768 and 1440 px before the fixes
(1,120 renders) and on the released source (1,132 renders; regenerated fixtures
added states). An automated lint counted problems:

| Problem | Before | After |
| --- | ---: | ---: |
| Element collisions | 7,935 | 2,801 |
| Content spilling out of its container | 1,219 | 0 |
| Clipped child elements | 28 | 0 |
| Text under 11 px | 1,104 | 562 |
| Clipped text | 1,460 | 1,478 |
| Targets under 44 px | 252 | 288 |

Deal went from 2,050 to 136 problems and Deal No Mercy from 2,171 to 144;
Checkers, Reversi, Four in a Row and Sea Salt & Paper reached zero. The lint is a
screening tool, not a verdict: remaining collisions include pinned phone action
bars over scrolled content (Word Agents' last row scrolls clear of its bar at
320 and 390), decorative felt marks and cards inside collapsed rows; clipped
text is mostly intentional ellipsis on long names and screen-reader-only text.
Clipped text and small targets did not improve and were not separately triaged.

## Shared changes

- Viewer-aware turn banner and a "Last move" line from public room history.
- Results and rematch before the final table; winners first; singular units;
  No Mercy elimination order.
- Sticky commit footers in decision panels and docks; Space peeks.
- Per-tab drafts for unsent choices (`useTableDraft`).
- Move errors pinned to the top and cleared when the table moves on.

## Not verified

- Realtime push: the local environment polls every 4 s; reconnect after long
  outages was not exercised.
- Tarot rematch after a real AI reading (no real readings were requested).
- Five Deal players on a 320/390 phone keep the hand one scroll below the first
  screen; the two-player case fits.
- Reversi, Checkers and Mancala scroll sideways below 360 px rather than shrink
  squares below 44 px.
- Remaining deferred items are listed per owner in `coverage.json`.
