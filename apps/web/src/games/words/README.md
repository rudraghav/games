# Word Agents table

The renderer consumes the viewer's authorized key or operative board and the
server's enumerated clue/guess options. It never infers hidden agents. Operatives
select a word, can clear it by selecting it again, then confirm; spymasters enter
a one-word clue and an allowed count. Pending or paused moves disable inputs.

The whole 5×5 board fits every width down to 320px: on phones words drop to
mixed case at 12px and long words carry soft hyphens so they wrap as
"Light-house", never as a bare split; identity labels shorten to Red / Blue /
Neutral / Assassin. Revealed words are covered (striped face and a check mark,
"revealed" in the accessible name), and the latest reveal is outlined.

The header only ever shows the clue being guessed. In the clue phase it reads
"Waiting for <spymaster>'s clue" (or "Give your clue"), and a "what just
happened" strip says who chose which word, what it turned out to be, and why the
previous team's turn ended, from the engine's public `last_reveal`, `last_clue`
and `turn_end`. Everyone sees "You · <team> <role>" beside the team counts, and
waiting copy names the team that is acting. At match end the header names the
winning team and the reason.

Drafts: the typed clue, count and selected word are `useTableDraft` state
scoped to room, match and match version. They survive refresh, stay visible
while a move is saving ("Saving GRASS…") and after a failed save, and vanish
when the version moves on. The clue form explains why Give clue is disabled
(spaces, non-letters, a word still on the board) before submitting.

On phones the acting player's dock (clue form or Confirm / End guesses) is a
compact sticky bar at the bottom of the screen so the board stays visible.
Watching seats get a flat, non-raised board.

`tests/browser/crowded-board-party.spec.ts` checks four- and ten-seat legal
projections at 320, 390, 768 and 1440 pixels, including long words in operative
and spymaster views. Keyboard clue/guess selection, clearing, pending/paused
states and exact action payloads are checked separately. This is mounted
projection evidence; saved multiplayer and full-match behavior have separate
verification suites.
