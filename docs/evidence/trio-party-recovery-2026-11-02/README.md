# Trio target names and Party draft recovery

A saved-room, two-tab reproduction confirmed that Hot Seat retained the previous
round's uncommitted choice after the same identity submitted Pass and advanced
the prompt in another tab. The failing assertion expected zero selected choices
in round two and observed one. The reproduction room was closed with all member
reads returning 404; no private choices or room identifiers are retained here.

Party drafts now belong to a specific match, mode, round and player. Same-round
updates from friends preserve an uncommitted choice, remote own submissions show
the server's locked state, and new rounds require a fresh choice. The browser
regression covers Hot Seat, Most Likely To and Spill or Chill, including a
spotlight rotation back to the original player.

Trio's Lowest/Highest controls now name their public target without disclosing
unrevealed ranks. Projection checks exercise three/six seats, exact keyboard
actions and blocked states; saved-room checks verify public reveals, refresh and
agreement between independent seats.

No rules, APIs, schema, dependencies or visible composition changed. Automated
accessibility-tree checks do not certify native screen-reader usability, and
cleared Trio table slots are outside the fixtures exercised by this change.
The [local receipt](verification.json) records 134 frontend tests and 18 browser
cases passing, with types, lint and production build. The [production receipt](production.json) records application
`d3328b60cee31c8876bf3428603e557b4c4d16be` serving at
<https://games-seven-black.vercel.app>, all four hosted saved-room cases passing,
clean logs and unchanged owner state. Four hosted QA rooms are closed with their
history retained. Cleanup removed 3,496,914 bytes of task-owned disposable files.
