# Skyjo table

The table consumes the authorized projection and the server's legal actions; rules
and scoring stay in `backend/app/games/skyjo`.

- Moves happen on the table: the draw and discard piles carry their legal action
  (after a private draw the discard pile becomes "Discard & reveal"), and grid cards
  are the swap and reveal targets. The dock carries one instruction and never a
  control that can scroll out of view.
- The dock speaks to the viewer: the server's instruction for the seat that can
  act, or what a waiting seat is waiting for, from public information only (for
  example "Ana drew from the deck and is deciding where it goes"). A private draw
  is named only in the drawer's own projection.
- When someone closes the round, a "Final turns" strip names the closer and the
  remaining order as wrapping names, with the current seat underlined.
- Every opponent is a compact row: name, total, the visible sum and hidden count,
  badges ("Closed the round", "Can close soon", "Cleared a column") and a 4x3
  summary in the cards' printed bands (negative, 0, 1-4, 5-8, 9-12). Rows stack on
  phones; from an 860px table they sit beside your grid. Inspect opens the full grid.
- The slots changed by the latest public move are outlined (`recent-slots.ts`),
  compared only between public faces in the same round.
- Round review is a ranked list (lowest round score first) with grid total,
  removed columns, doubling and total; only the closer gets "Next round".
