# Complete Uno and Deal card audit — 1 November 2026

All 245 canonical faces and legal property orientations were exported directly
from the four engine decks: Uno 54, Uno No Mercy 68, Deal 56, Deal No Mercy 67.
Physical duplicate copies are excluded; similar semantic cards remain separate.
The stable source is apps/web/src/stories/generated/card-faces.json, guarded by
scripts/export_card_faces.py --check. The dated bots-ui inventory stays frozen.

Four Card inventory Storybook stories render every face in normal and compact
sizes. Before/after captures cover 38 semantic groups at each of 390×844 and
1440×1000 (76 images per round). Every final group was opened and visually
reviewed. checks.json retains the complete matrix; 17 selected original PNGs
preserve visible defects, action variants and corrected art. A Storybook rebuild
interrupted the last desktop groups; those four were freshly recaptured after
waiting for all 67 faces and 13 groups. No runtime change was needed.

One shared PlayingCard renderer distinguishes 24 Deal effects with original
Lucide-based motifs, all 10 property groups, every paired wild and all 10 any-color
orientations. Rail uses train/tracks, utilities power/water, and eight districts
reuse distinct original illustrated scenes. Money has readable vector ornament.
Rents display every eligible color. Paired cards print both names; wilds mark
active orientation. Full accessible names retain all colors, value and orientation.
Light/dark blue and railroad/utilities do not depend on color alone. Draw cards
show layered cards and truthful counts; reverse draw, skip everyone, discard all
and roulette keep distinct symbols and real labels.

The audit fixed compact Repossession overflowing its card and compact +10 escaping
its inner face. Long compact names deliberately wrap; full accessible names stay
intact. Card rank, action, bank value, allowed colors and rules were unchanged.

Verification: 3 inventory units plus 5 table units pass; 2 exhaustive browser cases
check 980 cards for painted-text bounds, text collisions, page width and inner-face
draw-counter bounds. Web/browser types and focused lint pass. Selected, disabled
and back states were captured/reviewed. Engine/multiplayer/release verification
is recorded separately. To repeat, run Storybook, set GAMES_CARD_STORY_URL to its
origin and run tests/browser/card-inventory.spec.ts. The explicit switch keeps
the regular suite independent of a running Storybook server.
