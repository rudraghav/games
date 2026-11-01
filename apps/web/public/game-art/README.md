# Games-owned illustrated pieces

Created with the built-in ImageGen tool on 1 November 2026. Existing art masters
are preserved. Matching WebP files are delivery derivatives, not alternate art.
Original generation files remain in Codex's generated-image directory.

## boop. cat pieces

`boop-pieces-v1.png` is a transparent 1254×1254 atlas with four 627×627 cells:
coral kitten, coral cat, blue kitten, blue cat in reading order. The original
illustrations match the warm lounge and are not the publisher's wooden tokens.
`BoopPiece` uses complete clipped SVG viewports with aspect-ratio-preserving
meet alignment; no face or tail needs to be cropped to fit the board.

Prompt direction: four full-body sitting cats in an exact 2×2 transparent atlas,
coral/orange and dusky blue, visibly small curious kittens and larger confident
adult cats. Original gouache/cut-paper editorial illustration, soft shading,
restrained texture, clear ink contours and readable 48px silhouettes. All paws,
ears and tails visible; no words, numbers, clothing, logos, backgrounds or
existing franchise likenesses. The exact generation prompt is saved in PROMPTS.json; normalized reusable
direction is given here.

## Sea Salt & Paper symbols

`paper-symbols-v1.png` is a transparent 1254×1254 atlas with sixteen equal cells.
Reading order: crab, boat, fish, swimmer, shark, mermaid, shell, octopus, penguin,
sailor, lighthouse, shoal, penguin-colony, captain, decorative wave, decorative
star. The last two are unused. Fourteen original folded-paper illustrations
serve the complete base deck without reproducing publisher illustrations.

Generation direction: a square transparent 4×4 symbol atlas, one independent
complete object per cell with generous empty margins, cohesive editorial paper
folds and warm tactile shading, no text, logos or card borders. This direction
describes the supplied master; the exact original paper prompt was not retained.
The boop prompt in PROMPTS.json is retained verbatim. Both delivery files are
reproducible with `node scripts/prepare_game_art.mjs` (WebP quality 90, alpha 100,
no resizing). All generated original masters remain preserved.
