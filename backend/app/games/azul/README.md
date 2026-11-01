# Azul

Standard colored-wall board, audited 1 November 2026 against Next Move's
[publisher rules](https://cdn.svc.asmodee.net/production-nextmove/uploads/sites/4/2024/06/EN-Azul-Rules-Next-Move-web.pdf).
Games draws its own geometric tiles; the gray-wall variant is not offered.

2–4 seats. There are 100 tiles: 20 in each of five colors, plus one first-player
marker. Use 5/7/9 factories with four tiles each. Draft all tiles of one color
from a factory (move its remainder to center) or from center (first taker also
receives the marker). Place the draft in one matching or empty pattern line
of capacity 1–5, provided its wall row lacks that color, or place it on the
floor. Excess falls to the seven-space floor; further overflow is discarded.

After all offers empty, complete lines move one tile to the fixed matching
wall position, top to bottom. A solitary tile scores one; contiguous horizontal
and vertical runs score separately when present. Remaining complete-line tiles
are discarded; unfinished lines persist. Floor costs are 1,1,2,2,2,3,3, clamped
at zero. The marker selects the next starter. Only an empty bag receives the
shuffled discard; underfilled factories remain legal if supply is exhausted.

A completed wall row ends the game after everyone's scoring. Add 2 per complete
row, 7 per column, 10 per five-of-color. Highest score wins, then most complete
rows; an exact tie is shared. First seat starts initially, replacing the printed
travel-based suggestion. An explicit round review precedes the next offer.

Games exhaustion convention: the publisher allows underfilled factories but
does not specify a completely empty new offer. If normal round scoring leaves
every tile locked on boards and no tile to offer, Games finishes with standard
bonuses and tie breaks. It never reclaims unfinished lines or invents tiles.
This documented safeguard also handles a persisted zero-offer preparation state.
Its regression constructs a conserved board; natural-play reachability of that
arrangement has not been established. Ordinary seeded matches ended by a row.

Acceptance: 100-tile conservation; draft/overflow/marker/adjacency/bonus tests;
illegal rows rejected; seeded complete 2/4-seat matches; no bag order exposed;
conserved zero-offer completion and nonzero underfilled-offer continuation.
