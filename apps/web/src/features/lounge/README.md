# Lounge and catalogue

Lounge composes the existing header, compact home actions, member-room shortcuts
and shared room dialog. Games and Rooms use shared accessible segmented tabs. Games is the default catalogue; Rooms groups active/waiting and finished memberships separately. Inactive panels stay mounted to preserve game filters. Browsing never creates a guest identity; existing authorized profile data remains usable without local preference storage. GameLibrary owns search, group size and category
selection; findGames intersects them with an exact/alias match and bounded typo
fallback. Aliases include poker, draughts, Codenames, Splendor, Kalah and Palace
while preserving the actual edition names. Just me/Solo + bots preserve Bots
mode when opening supported games. Join accepts codes and full invite links.

GameTile and ChoiceGroup are shared UI primitives; GameArt composes the same card
and board vocabulary as the tables. Metadata comes from the generated backend
catalogue, including fixed two-player and solo labels. Filter controls keep 44px
targets, visible focus, selected states, an announced count and a recovery action
for zero results. Filters never create a guest or room. Existing room membership
and profiles are loaded only after the player has saved play.

Check search aliases, category/player intersections, zero-result recovery,
keyboard focus, reduced motion and phone overflow in the browser suite. Selected
visual references and evidence are in docs/DESIGN_REFERENCES.md.
The current dashboard captures and verified private-entry/solo behavior are in
docs/evidence/dashboard-2026-11-01. Catalogue covers reuse real card metadata and
original shared illustration assets; no second component or token system exists.

Room setup stays on one focused screen. Optional avatar colours and room name /
game rules appear on demand; Friends/Bots and seat count remain immediate. The
header Games link reveals its panel. Focused browser checks exercise tab keys,
filter retention, no-account browsing, member-only shortcuts, errors/retry and
phone first-fold spacing. Current captures: `docs/evidence/dashboard-tabs-2026-11-02`.
