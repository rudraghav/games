# Playable tutorials

`lessons.ts` maps catalogue IDs to short goals, three illustrated rules and
action-specific explanations. Each picture is a labelled worked example using
the table's card faces, pieces or diagrams. `TurnCoach` reads the current
learner's projected options and committed room activity. Practice opponents are
the game's regular server-driven bots. Tarot uses its private spread positions.

`GameRulebook` is the same document on the public game page and at the table.
It shows the aim, three figures with captions and accessible picture descriptions,
and the full published rules under game-specific topic headings. The rules stay
in catalogue order. `rulebook-topics.ts` supplies heading boundaries and the
catalogue owns the rule text. The caller may supply a tutorial control beside
the aim. Reading the document never changes coaching or starts a session.

A suggested move requiring a choice hands focus to a table control. A simple
fully specified move can use the room's existing action handler. Projected
availability, failed saves, paused tables, bot recovery and spectator privacy
follow normal play. Local guide preferences contain match/player identifiers
and progress only. Reading generation is always the player's explicit choice.

While the full coach is offscreen, the compact hint names the current decision
and offers a return to the full explanation. Finishing the lesson clears the
floating hint so the spread or game table stays visible. The full coach shows the learner's
confirmed action and any subsequent public bot reply. Azul counts a chosen offer
and its destination as one guided decision. Card and board hints use the same
authorized card effects, discard analysis and move previews as the table.
Rummy uses the projected hand after the suggested discard to explain whether
all non-jokers count toward the loss or only unmatched cards count.
After scoring an Azul round, the starter can begin the next round directly from
the coach. Tile and pattern-line choices still use the board.

Verify guide enrollment and persistence with `tests/browser/guided-play.spec.ts`.
The phone suite in `tests/browser/tutorial-depth.spec.ts` opens the rulebook and
plays multiple decisions per game. It compares the live suggestion with legal
options and the feedback with the saved move, then exits the guide and closes
the test room. Screenshots and private projections stay in local test output.

Secret Santa offers many edits at once, so `organiser-direction.ts` picks the
one that moves the draw forward: add a name until a draw is offered, then draw,
then show or hide one name. `focusMove` lands on the matching control.
