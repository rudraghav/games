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

Verify through the frontend group and `tests/browser/guided-play.spec.ts`.
