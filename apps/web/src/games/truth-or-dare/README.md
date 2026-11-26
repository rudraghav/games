# Truth or Dare table

`TruthOrDareTable` renders family `truth-dare` (`truth-or-dare`). The server
contract (phases, actions, `detail` keys, editions and fates) is
`backend/app/games/truth_or_dare/README.md`; the API client validates `detail`
strictly with `truthOrDareDetails`. This is a shared table: every viewer gets
the same detail and only the actions differ.

## What it shows

- **Seats** (`PlayerStrip`): each player's points and turns left
  (`turns_per_player − turns_taken`).
- **The prompt card**, the table's one surface: its kind in words with an icon
  (Truth, Dare, Burning building; never colour alone), who drew it ("Drawn by
  you" or a seat name), a "Swapped" chip, and the text. Burning building says
  three are in a burning building; viewers who are not choosing see the three
  candidates listed. With no prompt it says who is choosing, and at the end
  that everyone has had their turns.
- **The result**: during `result` the three candidates with their fates are the
  centrepiece for everyone; otherwise the previous turn sits under the card as
  "Last turn" ("Ada did the dare (+2)", "passed on the truth (0)").
- **18+**: a badge on the table while `edition` is `naughty`.

## Moves

- `pick`: one button per offered kind; the first is the filled one.
- `done` (filled) and `skip` (labelled Pass), then `swap` as a quiet button with
  "1 swap left in the match" or "No swaps left" from `swaps_left`.
- `assign`: three rows, one per candidate, each a radio group of the three fate
  labels read from `detail.fates` (never written here). Fates are mutually
  exclusive: choosing a fate another row holds gives that row this row's old
  fate (`chooseFate` in `fate-assignment.ts`). "Confirm fates" stays disabled
  until all three differ, then sends the server's own `assign` option whose
  `choice` matches (`assignOption` / `assignmentChoice`). The unsent fates are a
  per-version table draft, so they survive a refresh.
- `next`: "Next turn" for the player whose turn it was.

The instruction is said once, by the turn notice; the dock adds only the swap
count and the fates progress. A named-player candidate shows that seat's name.
Phones keep the three fates side by side with the radio dot above its word.

## Checks

`apps/web/src/tests/truth-or-dare.test.tsx` (parser, fates, table, 18+ gate) and
`tests/browser/truth-or-dare.spec.ts` (two friends, the 18+ gate, a match
against a bot). `tests/browser/truth-or-dare-tutorial-player.ts` drives one
learner decision for the tutorial walkthrough.
