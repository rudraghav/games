# Lounge and catalogue

Lounge composes the existing header, hero, recent rooms and room dialog.
GameLibrary owns search, group size and category selection; matchesGame keeps
filtering deterministic. Search includes common aliases such as poker, draughts,
Codenames, Splendor and Kalah while preserving the actual edition names.

GameTile and ChoiceGroup are shared UI primitives; GameArt composes the same card
and board vocabulary as the tables. Metadata comes from the generated backend
catalogue, including fixed two-player and solo labels. Filter controls keep 44px
targets, visible focus, selected states, an announced count and a recovery action
for zero results. Filters never create a guest or room. Existing room membership
and profiles are loaded only after the player has saved play.

Check search aliases, category/player intersections, zero-result recovery,
keyboard focus, reduced motion and phone overflow in the browser suite. Selected
visual references and evidence are in docs/DESIGN_REFERENCES.md.
