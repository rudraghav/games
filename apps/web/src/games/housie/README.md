# Housie table

`HousieTable` renders family `housie` (game `housie`, 2–10 players). The rules,
actions and the exact `detail` keys are in `backend/app/games/housie/README.md`;
`housieDetails` in `@games/api-client` validates them strictly (an extra key such
as a call order or another ticket is refused, not shown).

## What the table shows

- **Seats** (`PlayerStrip`): each player's marked count and points, from
  `players[].count` and `players[].score`.
- **The caller**: the last called number on a ball, how many are called and to
  come, the five numbers before it, and the caller's `Call the next number`
  button. Other seats see who calls next in the same reserved slot, so the
  ticket never moves when the caller changes.
- **Your ticket**: the 3 × 9 grid from `detail.ticket`. A marked number carries a
  stamp (a coral ring, a tick badge and the words "marked" for screen readers).
  With "Mark called numbers for me" off, a called number that is not marked has
  a dashed ring; tapping it sends the offered `mark`. The same moves are
  full-size `Mark 42` buttons under the ticket, for keyboards and phones, where
  a ticket square is narrower than 44px. A viewer with no seat sees no ticket.
- **Prizes**: Early five, Top, Middle and Bottom line, Full house with their
  points. A prize in `claimable` becomes its `Claim …` button whatever the turn,
  because claims belong to every seat at any time. A won prize names its
  winners; while `won_on_call` equals the number of calls it says it can still
  be shared until the next call.
- **All called numbers**: a disclosure with the 1–90 board, called numbers
  ringed and the last one outlined. It shows only what has been called; the
  call order never reaches the client.

## Moves and the filled button

Only server-offered actions are sent. One button is filled: a claim first (a
shared prize closes on the next call), then the newest mark, then the call.
The instruction itself is the turn notice above the table; the table adds no
second copy of it.

## Craft

Phone first: at 320px the ticket keeps nine columns of 44px-tall squares and
the call button spans the width. Text is at least 12px, weights 400/500/600/700,
corners from the tokens. Stamps and the ball animate in on `transform`/`opacity`
only, and not at all under reduced motion. Colour never stands alone: stamps add
a tick and words, called board numbers a ring and words.

## Tests

- `apps/web/src/tests/housie.test.tsx`: the parser on generated fixtures and its
  refusals, the ticket and stamps, the mark mapping with auto-mark off, claim
  buttons only for `claimable`, winners and the shareable state, and that only
  the viewer's own ticket is drawn.
- `tests/browser/housie.spec.ts`: two people in two browsers call, mark by hand
  (one tap on the ticket, the rest by button) and claim while the other player
  calls, with secrecy checks on both screens and room JSON; and one person plays
  against a bot to Full house. Every room is closed afterwards.
- `tests/browser/housie-tutorial-player.ts`: the mobile tutorial walkthrough's
  decision driver.
