# Modern game tables

Azul, Trio and Flip 7 consume authorized projections and server-enumerated actions.
Rules, inventory and score calculation remain in their independent backend modules.

## Trio hand-end requests

Lowest/Highest controls include the public target player's name in their
accessible name. They never include an unrevealed rank. Existing keyboard
activation submits the exact server-enumerated request; pending, paused and
review states retain their disabled controls. Browser checks cover three- and
six-seat projections and actual saved three-seat games on desktop and phone,
including public reveal agreement after refresh. Naturally reached collection
checkpoints expose cleared table positions as named static images; their slot
numbers remain stable and they never become reveal controls. Native screen-reader
studies remain separate from these browser checks.

## Trio reveals and waiting seats

This turn's reveals say whose card each one is from the viewer's seat ("You",
a name with an ellipsis and a full-name title, or "Table N") and which end was
asked for ("lowest"/"highest", from the public `edge` on each hand reveal). A
status line says what the strip means now (looking for another 7; no match, the
cards go back when the actor continues; a trio collected). The strip reserves its
full height, so the first reveal never moves the hands below it. On phones and
tablets it sticks to the top of the screen while a turn has reveals, so asking the
last player keeps the answer in view; from an 860px table the hands and their
Lowest/Highest controls sit in a side column with the strip right above them.
Continue is part of the strip. Waiting seats see whom they are waiting for, never
the actor's instruction, and the dock disappears at match end. Your own row reads
"You". Results count trios ("1 trio", "3 trios").

Activity keeps every public reveal with its value, as before. Whether that history
should be redacted once a turn ends (a memory-aid setting) is a product decision
outside this table; no private hand ever enters it.

## Flip 7 decisions

Freeze, Flip Three and an extra Second Chance are given on the player rows, never
in a scrolling dock: every eligible row gets a control ("Freeze", "Flip Three",
"Freeze yourself", "Take Flip Three") whose accessible name states the
consequence ("Give Freeze to Ana: banks 23"). Ineligible rows are dimmed and the
dock explains the card. Every row shows its cards as chips (numbers sorted, then
modifiers and actions), status ("Busted on 8" with the repeated pair outlined,
"Frozen", "Stayed"), the points at stake or banked, and public effect notes from
the projection's `effects` ("Frozen by Bartholomew", "Flip Three from Ana").
Opening a row shows the full cards; that choice belongs to the viewer and survives
every turn. Your own cards wrap instead of scrolling sideways. Waiting seats see
who is deciding; a seat that could be targeted is told what it would cost them.
Round review ranks totals with the distance to 200.

## Azul drafting and placement

Taking tiles is staged in the tab before anything is sent: tapping a colour
highlights it (and the remainder that will slide to the centre) and the dock
shows the chosen tiles, the marker cost when taking first from the centre, and
every destination with its consequence ("completes", "3/4 filled", "−3 pts",
"Holds red", "Full"). Choosing a line or the floor sends the draft and then, in
the very next saved state only, the placement that was previewed; the server
still decides both. Tapping the colour again or the close button cancels. The
staged choice survives a refresh through `useTableDraft` (room, match, version).

The dock is sized to its content and pinned while a choice is open, so drafted
tiles never collapse to a zero-height row. Waiting seats see "Bea is placing 3
red tiles" with the tiles, never the actor's instruction. Round review and the
final table list each player's wall gain, floor loss, bonuses by type and total;
only the starter gets "Start round N". Opponent boards stay folded but their
summary is a one-glance mini board (pattern lines and wall dots), score, wall
count and floor loss. On phones the factories form a compact one-row-per-factory
list instead of a two-wide carousel, so every offer can be compared at once.
Consequences, floor penalties and the floor total use at least 12px text.

## Azul decision information

Tile art is decorative; named semantic objects expose the public state needed
for decisions. The draft names every tile. Pattern-line controls describe their
existing colour/count, available spaces and legal fit/overflow consequences.
Each of the 25 wall positions names row, column, colour and occupied/empty state.
Each of the seven floor positions identifies its contents and applicable penalty;
empty positions explicitly describe the penalty only when filled. The first-player
marker is named at the centre and on the floor.

These static descriptions add no keyboard stops or move handlers. Draft and
placement controls still submit the exact current server option, with pending
and paused moves disabled. Shared artwork, dimensions and responsive composition
remain unchanged. Browser checks inspect the accessibility tree, keyboard moves,
saved refresh and another seat's public view. Native screen-reader user studies
remain separate evidence. See `backend/app/games/azul/README.md` for the rules.
