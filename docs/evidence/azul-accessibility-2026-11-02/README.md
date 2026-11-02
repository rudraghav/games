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
Local checks and production publication are recorded separately in the receipts
and root journal. These automated checks are not a native screen-reader study.
