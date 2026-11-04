# Boop table

The renderer consumes the public bed, authorized piece pool and server-enumerated
placements, graduations and return choices. Placement remains a direct legal
move. Graduation/return choices preview the affected cells, then require explicit
confirmation; Clear selection resets only that preview. Pending and paused moves
are disabled, and a new match version resets the local choice.

The bed uses the shared `HorizontalRail` with navigation below; on phones it
borrows the page gutter so six 44px squares fit at 320px, and on laptops it sits
beside its controls (capped by viewport height) so the whole bed and any choice
fit one screen. A status line shows the viewer's colour, an instruction only for
the seat that can act (others see whom they wait for) and the latest turn's
effects: booped pieces are listed by owner and marked on the bed (arrow on the new
square, dashed "off" square when booped off), graduated or returned squares are
dashed. The engine adds `last_graduation` (owner, cells, kittens) for this.

While graduating, the choice panel replaces the piece pool above the bed in a
content-sized dock; Confirm/Clear stay sticky in view. The selected line is a
filled button with a focus ring. The unsent choice survives a refresh for the
same match version (`useTableDraft`). Finished matches name the winner from the
viewer's seat; engine end messages name a colour, never "you".

`tests/browser/crowded-board-party.spec.ts` checks ten legal two-player
projections at 320, 390, 768 and 1440 pixels, including mixed pools and graduation
states. Keyboard placement, preview, clear, pending/paused controls and exact
commit payloads are verified. The current fixtures contain one graduation option
per graduating state; simultaneous overlapping graduation lines and eight-cat
wins are not newly certified by this layout change.
