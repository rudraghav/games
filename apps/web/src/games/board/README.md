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
