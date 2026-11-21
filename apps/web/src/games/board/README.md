# Public board presentation

Four in a Row, Reversi and Checkers share `BoardTable`; Kalah uses `MancalaTable`.
The server supplies every position, legal action and result. These renderers
select and submit those actions without recomputing board rules.

`BoardViewport` preserves full-size actions in the shared horizontal rail and
offers a read-only overview. Escape returns focus to its opener. Four's main
cells and overview expose named images for each square and occupant, without
adding keyboard stops. Mancala names every pit/store with its public owner and
seed count, including read-only stores and all fourteen overview positions.
Legal pit controls retain the server action label followed by the owner.

Browser accessibility-tree tests verify the rendered roles and names, keyboard
actions, overview isolation and focus restoration. They do not certify a native
screen-reader usability study. Authoritative rules live in
`backend/app/games/board/README.md` and `NEW_BOARDS.md`.

## Perspective, consequences and fit

Each table shows the viewer's colour ("You play Black"), one instruction line
for the seat that can act (waiting seats see whom they wait for), and what the
latest move did that the shared "Last move" line cannot: Reversi flips (ringed)
and skipped turns, checkers captures, Mancala captures and the final sweep.
Finished tables name the winner from the viewer's seat; they never repeat an
engine sentence written for someone else.

- Four in a Row: the whole column is a pointer/touch target and the drop row is a
  filled, keyboard-reachable control; hover or focus shows the landing disc.
- Reversi: hover, focus or a first tap previews which discs flip (in the mover's
  colour); on touch the second tap places. Mouse clicks and Enter still commit at once.
- Checkers: movable pieces are ringed; with one movable piece (always mid-jump)
  it is selected for the player, also after a refresh. The second seat sees the
  board turned so its own pieces start at the bottom. Edge coordinates show from
  601px.
- Mancala: the viewer's row and store are nearest; hover, focus or a first tap
  shows the landing pit, captures or an extra turn before sowing.

The instruction occupies a fixed two-line slot so previews never move the board
under the pointer. Boards fit with 44px targets from 360px. At 320px the shared
rail scrolls to keyboard focus immediately and reveals a tapped edge square
after its action runs. A horizontal swipe moves the board without playing.
`apps/web/src/tests/board-perspective.test.tsx` covers seat-specific copy,
rotation and auto-selection.

The tutorial reads the same public flip and sowing previews as the board. Its
Mancala shortcut focuses the named pit; a Checkers shortcut points to the
destination when the required piece is already selected.

## Depth, motion and contrast

`packages/ui/src/styles/piece-depth.css` owns the finish for these boards (CSS
only): Four in a Row is a moulded frame with wells, Reversi a felt with a
bevelled edge, Checkers a walnut-framed board, Mancala a carved tray whose pits
are shaded hollows. Illustrated pieces cast a shadow; a king is two stacked
pieces under its crown.

A piece is separated from its board either directly or by its own rim. Measured
from the art: ink on the Reversi felt 3.3:1; ivory on the dark Checkers square
4.0:1; coral and gold against the Four in a Row well 3.3:1 and 6.6:1; the coral
checker and the ivory Reversi disc carry a dark rim (3.6:1 and 8.3:1 against
their own faces). Legal marks, last-move rings and Mancala markers are 3:1 or
more against the surface they sit on. Colour never stands alone: sides are named
in the status line, kings carry a crown, markers differ by shape (solid, dashed).

Motion replays only what the public state already says, 320ms or less per
step, never delays input and is skipped under `prefers-reduced-motion`:

- Four in a Row: the new disc falls down its column (`--drop-rows`).
- Reversi: the placed disc sets down and each disc in `last_flips` turns over.
  Discs are keyed by colour so a square that flips twice running replays.
- Checkers: the moved piece slides from `last_from` (`--from-dx/--from-dy`,
  already turned for the second seat) and the captured piece lifts away
  (`data-captured-color`, drawn only during the lift).
- Mancala: one seed lands in each pit from `last_source` to `last_move`, in
  sowing order (`hop` on `MancalaPit`); the count ticks as it lands.

States: movable checkers carry a gold ring that hugs the piece, the chosen one
lifts with a double ring, own Mancala pits rise on hover and sink on press, and
keyboard focus is a two-tone ring that holds on light and dark squares.
`data-pending` on the table shows a quiet saving bar while a move is in flight.
Marks whose meaning is not printed (last move, flipped, captured, move start,
king, Mancala landing/capture) carry `data-tip` for the app tooltip.
