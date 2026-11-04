# Shithead table

`ShitheadTable` shows the public piles, the active special cards, the viewer's
workspace and dock, their own table, and opponents through the shared
`OpponentPanel`. Legal moves come only from the server's personalized actions.

- **Playable cards.** On your turn the hand passes the server-legal card ids as
  `playableIds`; other cards are dimmed but stay inspectable. Selecting one
  explains why Play is disabled ("4 ♥ can't be played on 5. Play 5 or higher,
  or a 2 or 10, or take the pile."). With nothing playable the instruction says
  so and Take pile becomes the primary button.
- **The pile.** A run of equal ranks on top (from the public pile tail) is
  fanned with "Q ×3 on top: one more Q burns". The pile note explains the last
  pile change from `last_play`: who burned how many cards and why (a 10, or four
  of a kind) and whether they play again, a failed blind flip, or a pickup.
  View pile lists the public tail newest first. On phones the card to beat is
  never smaller than an opponent's face-up card.
- **Face-up and hidden stages.** Once the hand is empty, your table cards move
  into the workspace above the dock instead of waiting below an empty hand.
  With no face-up card able to beat the pile, the copy says which card you add
  and how many cards you then take ("…you then take all 5 cards").
- **Long hands and setup.** Hands of 9+ cards wrap into overlapped rows sized
  to the container (12 corners per row on phones), so a 36-card pickup stays in
  view; the heading counts the hand. Setup shows all six cards at once.
- **Setup choices** use `useTableDraft`, scoped to the room, match and setup
  round: a waiting player can pick early (confirmed on their turn) and a
  refresh keeps the picks. A fourth tap is refused with a hint instead of
  silently dropping the oldest pick. Play selections are scoped to the match
  version.
- **Results.** The outcome names the Shithead ("You're the Shithead…" for the
  loser) and lists the escape order; strips and opponents read "Escaped 1st".
  Opponent stages use plain words ("on face-up cards", "on hidden cards").

The player strip spans the full grid on wide tables. Engine messages are
instructions for the acting seat; the room banner's Last move line attributes
the previous move.

Tests: `src/tests/shithead.test.tsx` (zones, privacy, dimming, pile run and burn
reason, face-up workspace, long hand, outcome) and
`tests/browser/shithead.spec.ts`.
