# Original Pop Tarot artwork

Created for Games with the built-in ImageGen tool on 31 October 2026. Four square
3×2 illustration atlases supply 22 major arcana, in traditional numerical order.
Each cell has a portrait 2:3 aspect ratio. Sheet 4's spare cells contain a celestial
back motif and a suit collage. Existing master files are preserved in place.

The prompt direction: original diverse characters, strong black ink contours,
cobalt/navy/coral/yellow/cream, silkscreen and restrained halftone texture,
full-bleed cells without text, logos or existing franchise characters. Sheets
2–4 use sheet 1 as a visual style reference. Card names/frames/interaction states
remain editable code. The 56 minor arcana use original suit/rank/pip compositions
in the same component layer.

No Dribbble, licensed commercial deck, franchise artwork or third-party card
illustrations are bundled. Research and reusable-library licence decisions live
in `docs/DESIGN_REFERENCES.md`.
## Delivery derivatives

The original PNG masters remain intact. `pnpm exec node scripts/prepare_card_art.mjs`
creates 960px WebP atlases for app delivery. The shared app image loader resolves
these static files, avoiding the image-optimization endpoint that returned 404
in the first Vercel Services preview. Storybook can still display the PNG masters.
