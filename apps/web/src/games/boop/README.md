# Boop table

The renderer consumes the public bed, authorized piece pool and server-enumerated
placements, graduations and return choices. Placement remains a direct legal
move. Graduation/return choices preview the affected cells, then require explicit
confirmation; Clear selection resets only that preview. Pending and paused moves
are disabled, and a new match version resets the local choice.

The bed uses the shared `HorizontalRail` with navigation below the full-size
canvas. Six columns retain at least 44-pixel targets at narrow phone widths;
touch scrolling and keyboard focus reveal off-screen columns. Its bounds remain
stable when choosing a graduation. The extended decision area exposes graduation
choices before internal scrolling while retaining a fixed footprint through the
placement/graduation transition.

`tests/browser/crowded-board-party.spec.ts` checks ten legal two-player
projections at 320, 390, 768 and 1440 pixels, including mixed pools and graduation
states. Keyboard placement, preview, clear, pending/paused controls and exact
commit payloads are verified. The current fixtures contain one graduation option
per graduating state; simultaneous overlapping graduation lines and eight-cat
wins are not newly certified by this layout change.
