# Azul decision accessibility follow-up

Fresh Chromium inspection found a three-yellow-tile draft missing from the
accessibility tree, filled pattern lines without their colour, an unnamed floor
marker, and a scored board whose 25 wall positions were all absent. These were
rendered findings on legal projections, beyond the completed original audit.

The existing Azul renderer now exposes the authorized draft, pattern-line
contents, wall coordinates/colour/occupancy and floor contents/penalties. Empty
floor labels describe potential penalties; occupied positions describe current
penalties. The first-player marker is named explicitly. No game rules, API,
inventory, schema, dependencies or hidden information are changed.

The browser checks compare actual accessibility-tree output with authorized
projection data and exercise keyboard drafting/placement. Separate saved-room
checks establish versioned commits, refresh and agreement between two seats.
The [local receipt](verification.json) records 134 frontend tests and 26 browser
cases passing. The [production receipt](production.json) records application
`3acd70d21d24acdf743cf7f0f76e1d545cd3410e` serving at
<https://games-seven-black.vercel.app>, both hosted saved-room cases passing, clean
logs and unchanged owner state. These automated checks are not a native
screen-reader study.
