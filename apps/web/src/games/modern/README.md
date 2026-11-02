# Modern game tables

Azul, Trio and Flip 7 consume authorized projections and server-enumerated actions.
Rules, inventory and score calculation remain in their independent backend modules.

## Trio hand-end requests

Lowest/Highest controls include the public target player's name in their
accessible name. They never include an unrevealed rank. Existing keyboard
activation submits the exact server-enumerated request; pending, paused and
review states retain their disabled controls. Browser checks cover three- and
six-seat projections and actual saved three-seat games on desktop and phone,
including public reveal agreement after refresh. Cleared table-slot semantics
and native screen-reader studies are separate from this evidence.

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
