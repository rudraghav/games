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
under the pointer. Boards fit with 44px targets from 360px; 320px keeps the rail
fallback. `apps/web/src/tests/board-perspective.test.tsx` covers seat-specific copy,
rotation and auto-selection.
