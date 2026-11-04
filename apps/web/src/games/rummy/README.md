# Rummy table

`RummyTable` composes the shared `PlayerStrip`, `TablePile` and `DecisionDock`
with three Rummy-only pieces. Every legal move still comes from the server's
personalized actions; nothing here infers a rule outcome.

- **`RummyHand`** draws one group of the viewer's own cards as a wrapped,
  overlapped fan on `HorizontalRail` + `PlayingCard`. The step between card
  corners fits 14 cards per row on wide tables and 7 per row on phones (62 px
  cards at 360 px and below), so a 13/14-card hand is readable without
  scrolling. Markers are classes on the card, drawn by Rummy CSS inside each
  visible strip: **Wild** (printed jokers and the wild rank), **Win** (a discard
  that leaves a valid declaration, from `discard_analyses[*].valid`), **New**
  (the card just drawn: the engine appends it) and **Taken** (the card taken
  from the discard: the only hand card without a discard action). Each card's
  accessible name carries the same meaning, e.g. `10 ♠ (wild joker)`.
- **`RummyDock`** is the decision dock. Draw moves stay on their piles; the dock
  names the pile cards and offers Drop as a secondary button that opens a
  confirmation ("Drop for 20 points?", naming the winner when only one player
  would remain). With a winning discard selected, **Declare** is the primary
  first button and Discard is secondary; otherwise Discard is primary and a
  false declaration still needs the 80-point confirmation. Commit buttons sit
  in a sticky `data-decision-actions` row so they never scroll out of the dock.
  A card taken from the discard explains why it can't go straight back, and a
  player who dropped or declared falsely is told they're out.
- **`RummyResults`** shows every hand the engine reveals at the finish, grouped
  by the server's settlement melds (jokers marked), winner first, with each
  player's points and reason. It spans the full table width.

The felt shows the face-up cut card with "Wild: 10s" (never the raw engine rank
"T"); a printed-joker cut reads as aces wild. Seats show public penalties from
the projection's `out` map ("Dropped · −20", "False declaration · −80") and the
settled points at the finish.

The viewer's own arrangement (groups, sort and the selected card) is kept with
`useTableDraft`, scoped to the room and match, so it survives refresh and
reconnect for that deal only; ids no longer in the hand are ignored. "Group my
melds" applies the shown analysis's melds to Groups 1–4. The analysis summary
says "You can declare: discard 4 ♥" when a winning discard exists, names the
best discard only when it lowers your points, and is replaced by the results at
the finish. Closed explanations are not mounted.

Tests: `src/tests/rummy-table.test.tsx` (wild rank, marks, declare order, taken
card, drop/false-declaration captions, results) and the Rummy cases in
`card-workspaces.test.tsx`; browser coverage in `casino-explanations`,
`crowded-card-casino`, `midgame-workspaces`, `stable-game-tables` and
`table-usability` specs.
