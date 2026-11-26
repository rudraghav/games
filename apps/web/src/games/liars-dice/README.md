# Liar's Dice table

Family `dice`, game `liars-dice`. The engine contract (phases, actions, `detail`
keys, secrecy) is in `backend/app/games/liars_dice/README.md`; the API client's
strict `liarsDiceDetails` parser refuses any key the README does not list.

## Files

- `LiarsDiceTable.tsx`: the table. Root class `table-layout stable-game-table liars-dice-game`
  with `data-phase`.
- `Die.tsx`: one die as original SVG art. Pips say the face (shape, not colour); the
  accessible name says it in words. `counts` rings a die that counts for a bid; an
  empty `label` hides a die that sits beside its own words.
- `bid-builder.ts`: pure helpers. `bidRanges` reads each face's range only from the
  offered `bid` option's `minimum`/`maximum` (a face with no option is disabled);
  `clampQuantity`, `bidAction` (`{type:'bid', choice: face, amount: quantity}`),
  `countsFor` (the face, plus ones when `wild_ones` is on and the bid is not on ones),
  `bidText` ("3 × fours") and `revealSummary` (the outcome in words, from the
  server's `count`, `held`, `loser` and `eliminated`).
- Styles: `packages/ui/src/styles/liars-dice.css`.

## What the table shows

- **Seats** (`PlayerStrip`): "5 dice left" or "Out of dice · first out", with the dice
  left drawn as small pips under each name. A scoped style sets `--dice` per seat id.
- **Topline**: round, dice in play (`total_dice`) and whether ones are wild.
- **Current bid** as the headline ("3 × fours", with a die of that face) and who bid it;
  "No bid yet" and who opens otherwise.
- **Your dice** while bidding: only the viewer's own `detail.dice`. Dice that count for
  the standing bid are ringed and say "counts" or "wild", with a line saying how many.
  A short tumble plays when a round is rolled; it is off under reduced motion.
- **Bids this round**, oldest first, each attributed; the newest is tinted.
- **The bid builder** (dock, only with legal actions): six face buttons (a face with
  no offered bid is disabled and says "no legal bid"), a −/+ stepper bounded by the
  chosen face's range, then the filled `Bid 3 × fours` and a secondary `Call liar`.
  With no raise left, `Call liar` is the only, filled, button. The unsent face and
  quantity are a tab-scoped draft that expires with the match version.
- **Reveal and finish**: every player's dice from `reveal.dice` (viewer first). Dice
  that count are ringed and labelled "counts" or "wild"; each row says who called or
  bid, how many of theirs count, and who loses a die (tinted row plus words). The
  outcome sentence reads, for example, "4 fours on the table (2 were wild ones). The
  bid of 3 × fours held, so Ada, who called liar, loses a die." The starter gets
  `Roll the next round`. A finished match keeps the last reveal and names the winner.

The instruction is the turn notice's; the dock adds at most the chosen face's range
or "No higher bid is possible" and drops a line that repeats the notice.

## Secrecy

While bidding the view holds one dice list, the viewer's own; the table draws no
other die. Other players are counts only. Every die appears only from `reveal`.

## Tests

- `apps/web/src/tests/liars-dice.test.tsx`: parser contract and extra-key refusal,
  ranges from offered options only, disabled faces, stepper clamping and the sent
  action, Call liar as the only filled button, own dice only while bidding, and the
  reveal's rings, labels and sentence.
- `tests/browser/liars-dice.spec.ts`: two humans (two contexts) bid through the
  builder, raise, call, see the reveal and roll on, with DOM and room-JSON secrecy
  checks each step; one human plays a bot to the finish. Every room is closed.
  `GAMES_SHOT_DIR` saves evidence screenshots.
- `tests/browser/liars-dice-tutorial-player.ts`: `playLiarsDiceDecision`, the mobile
  tutorial-depth driver.
