# Bluff table

`BluffTable` renders family `bluff` (the game `bluff`, also called Cheat). The
rules, actions and `detail` contract are in `backend/app/games/bluff/README.md`;
`bluffDetails` in the API client validates that detail strictly.

## What the table shows

- **Seats.** The shared `PlayerStrip`: each seat's card count, a `Passed` badge
  for anyone who passed since the last play, and `Last cards` for the player in
  `detail.going_out`.
- **The pile, on the felt.** A face-down `CardPile` with its count, the declared
  rank in words ("Queens", "7s") or "New round", and the set-aside count. Each
  play of the round is a line, "Ada played 3 cards as 7s", then who passed. A
  player on their last cards gets a written warning: if the play stands, they win.
- **The reveal.** Only `match.community` (the one called play) is face up, with
  a check or a cross _and_ the words "Honest: every card matches" or "Bluff: not
  every card matches", who called whose play, who takes the pile and how many
  cards, and who starts next. The rest of the pile never reaches the client.
- **Your hand.** The server's order (Ace to King). More than eight cards wrap
  into overlapped rows so every rank corner stays in view. On phones a long hand uses 56px cards with a minimum 44px exposed per card. Following a round,
  "Choose my Queens · 2" selects the viewer's own matching cards (their own
  information; any card may still be played).

## How a play works

1. Tap one to four cards. The limit is the offered `play` option's `maximum`
   (never more than four); a fifth tap is refused with a note saying so.
2. Starting a round, choose the rank to declare from the 13 rank buttons (each
   names the rank for a screen reader, "Sevens"). Cards that all share a rank
   suggest it; the player can pick any other. Following, the rank is set.
3. The one filled button is `Play 2 as 7s`. It sends the offered option for that
   rank with `cards` set to the chosen ids. `Pass` (`skip`) and `Call bluff`
   (`call_bluff`) are secondary; in a reveal, the starter's `Continue` is filled.

The selection and the declared rank are a draft (`useTableDraft`) scoped to the
room, match, version and seat, so a refresh keeps it and a new saved version
clears it. The dock line adds only the selection or the call's consequence
("Call bluff turns over Ada's last 3 cards."); the turn notice gives the
instruction. Pure helpers live in `bluff-view.ts` (`decisions`, `playAction`,
`toggleCard`, `suggestedRank`, `playLine`) and are unit tested in
`apps/web/src/tests/bluff.test.tsx`.

## Checks

- Unit: `apps/web/src/tests/bluff.test.tsx`.
- Browser: `tests/browser/bluff.spec.ts` (two friends on desktop and phone with
  secrecy checks on hands and pile faces; one player against a bot to the end).
- Tutorial driver: `tests/browser/bluff-tutorial-player.ts` (`playBluffDecision`).
- Styles: `packages/ui/src/styles/bluff.css`, root class `.bluff-game`.
