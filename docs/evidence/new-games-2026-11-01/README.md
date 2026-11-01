# Contemporary game acceptance — 1 November 2026

Local, uncommitted source during implementation. This folder does not assert a
production deployment. The root journal and release evidence record the final
source and hosted readback separately.

## Rules and persistence

- Four independent modules own primary rule sources, exact edition inventories,
  player limits, scoring, optional-mode exclusions and edge cases.
- 47 focused engine checks pass, including natural minimum/maximum matches,
  independent inventories, legal/illegal moves, conservation and hidden views.
- 152 shared setup/playthrough checks pass after correcting two harness
  assumptions: integer card IDs require exact wire-ID comparisons, and a
  cooperative defeat has an empty winner list rather than a fabricated draw.
- Two isolated, migrated database checks pass. One plays 79 ordinary HTTP moves
  from seeded Gang setup to a two-vault/three-alarm defeat and verifies finished
  state, all participant histories and persistence across a new lifespan. The
  other exercises concurrent private 6 nimmt! choices, version conflict, receipt
  retry, unauthorized access, restart and the eventual ordered reveal.
- Python lint/type checks pass. Six focused table/contract component checks and
  browser-test types pass.

## Browser evidence

The four retained images show maximum-seat phone tables after the scoped mobile
action-row improvements. Both supported seat limits are exercised for all four
games on desktop and phone; assets are decoded before acceptance, enabled
controls meet the 44-pixel target, and page width stays within the viewport.
The phone test additionally checks full-row primary action widths for chip
confirmation, number locking and stock drawing.

| Table | Current phone capture |
| --- | --- |
| The Gang, six seats | [Ranking chips and private hand](gang-maximum.png) |
| 6 nimmt!, ten seats | [Private numbers and public rows](six-nimmt-maximum.png) |
| Sea Salt & Paper, four seats | [Original card symbols and draw control](paper-maximum.png) |
| boop., two seats | [Original kitten/adult art and 36-square bed](boop-maximum.png) |

Four independent-session browser workflows pass across desktop and phone:
chip taking/stealing/return, automatic streets and explicit showdown reveals;
private number locking, ordered reveal, every required low-card row choice and
the next selection; private stock choice preserved by refresh and hidden from
the other player; cat placement and off-board pushing through mouse and keyboard.
Test rooms are abandoned only where needed and left by all participants.

Initial live test failures exposed harness timing, complete accessible card
names and the existing rotating starting-seat convention. The final tests wait
for committed state and choose the actual current actor. No rule was changed to
make a test pass. The room's shared public guidance also now follows Paper's
draw/keep phase and stays viewer-neutral after a boop turn.

## Complete natural matches

The final local run passes all 14 distinct player-limit/viewport cases with
3,018 accepted legal moves in 6.3 minutes: seven on desktop and seven on phone.
Every case reaches its natural result, verifies saved history and rendered
participant rows, starts a rematch and switches games with the same ten-member
group. Both rooms close with every guest and host leave returning 200; no
transport retries or failures occur.

The exact metadata-only records are [desktop](fullmatches-local-desktop.json)
and [phone](fullmatches-local-phone.json). They correctly identify an uncommitted
local workspace and do not attach the prior checkout SHA as the tested
application source. Hosted production acceptance is a separate release gate.

These checks establish representative rendered decisions and responsive
composition. They do not claim every branch was clicked in a browser. Natural
move selection uses one authorized actor projection at a time; browser controls
exercise results, rematch, settings and changing games.
