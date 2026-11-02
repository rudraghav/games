# Casino table presentation

Hold'em, Teen Patti and Blackjack use the same authorized card, seat, wager and
server-action composition. The renderer does not reconstruct hidden cards,
hand outcomes or legal bets. Card motion retains identity/layout anchors from
contiguous authorized snapshots; refresh and reconnect establish a baseline.

Own card rows use the shared `HorizontalRail`, with explicit previous/next
controls when needed. Blackjack keeps each split hand, wager, total and active
state separate, with a second rail for navigating between hands. A single hand
fills the available area; multiple hands retain their own 180px frames. The hand
navigation buttons sit below the rail so even a 320px screen can reveal an entire
hand. Those buttons remain reachable inside the scrollable own-card area. Long hands
remain scrollable without losing their first card or shrinking the card art.

A public opponent seat previews at most three actual projected faces. When the
projection contains more than three faces, an Inspect control opens the shared
modal with the complete public collection in a rail. Hidden-card counts never
become a public-face inspection or invented card identities. Inspection remains
read-only while a move is pending or play is paused; Escape returns focus to the
exact opener. The public seat count does not imply separate split-hand metadata
that the projection does not supply.

The compact seat grid has two columns on narrow canvases. Seven-seat top corners
leave space for side-seat public-card inspection controls in the larger ring.
This keeps multi-card areas inside their owning seat without changing decisions.

`tests/browser/crowded-card-casino.spec.ts` checks legal engine projections at
320, 390, 768 and 1440 pixels, including five-card Blackjack hands and a recorded
legal split continuation from the existing broader suite. The density exporter
uses bounded policies and pinned seeds, with physical inventory and privacy
assertions. These local projection checks complement saved-room/motion tests;
they do not claim every possible deal or certify a complete live match.
