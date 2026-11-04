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
in the same component layer in the original release. The expansion below replaces
that delivery fallback for every minor card.

No Dribbble, licensed commercial deck, franchise artwork or third-party card
illustrations are bundled. Research and reusable-library licence decisions live
in `docs/DESIGN_REFERENCES.md`.
## Delivery derivatives

The original PNG masters remain intact. `pnpm exec node scripts/prepare_card_art.mjs`
creates 960px WebP atlases for app delivery. The shared app image loader resolves
these static files, avoiding the image-optimization endpoint that returned 404
in the first Vercel Services preview. Storybook can still display the PNG masters.

## Complete deck, 1 November 2026

Four new original `minor-{wands,cups,swords,pentacles}-v1.png` masters contain
14 distinct narrative scenes per suit in rank order Ace through King. Spare
decorative cells are not counted as cards. All 78 cards now use illustration
cells registered in `packages/ui/src/lib/tarot-artwork.ts`; none uses a pip-only
placeholder. Existing major PNG masters are unchanged. Matching WebP derivatives
use 1024px width for minors, preserving their available detail.

The source atlases were inspected before mapping. Wands/Cups have taller court
rows, while Swords/Pentacles use approximately equal rows. Explicit pixel
rectangles and clipped SVG viewports preserve aspect ratios without neighboring
card bleed. Card names, focus/selection and all interaction remain editable code.
The app's deck dialog and the All78 Storybook story expose the canonical artwork
catalogue, never the hidden shuffled engine order. Automated coverage proves
78 unique bounded cells, available PNG/WebP assets and illustrated rendering.
See [prompt set and provenance](ART_PROMPTS.md).

Tall Wands/Cups Queen and King panels use top-aligned framing. A focused live
review caught that centered cropping removed their heads despite valid source
rectangles. Four specific focal alignments now preserve faces/crowns; a browser
geometry regression checks pinned head centers in both viewport sizes. Focused
before/after captures distinguish actual production evidence from local fixes.

## Five focused corrections, 2 November 2026

Only Two/Six/Eight of Cups and Eight/Nine of Pentacles use new single-card `-v2`
masters. The previous atlases remain intact. Source review and actual browser
frames at 320/390/1440 confirm respectively 2, 6, 8 cups and 8, 9 pentacles,
with their relationship, nostalgia, departure, craft and independent-garden
motifs. Full-frame `meet` preserves every symbol and face; other 73 card mappings
remain unchanged. Delivery derivatives are 512px WebP; PNG masters remain 1024×1536.
This original deck art is distinct from the separately credited character portraits.

## Symbol-count corrections and full-bleed framing, 3 November 2026

A card-by-card audit found number cards whose suit symbols did not match their
rank. Twelve were corrected by local retouching of the original atlas cell (no
image generation, no external service): symbols were moved, duplicated from the
same card, or removed with patch-based fill from the surrounding scene. Each
result is a single-card master `minor-<id>-v2.png` at the cell's own size, with
a 512px-capped WebP derivative (same settings as `scripts/prepare_card_art.mjs`).
The v1 atlases are unchanged.

| Card | Before | Change |
| --- | --- | --- |
| Five of Wands | 7 staves | removed the unheld staff behind the centre and the headband fighter's second staff |
| Seven of Wands | 8 | removed the far-right raised stave |
| Eight of Wands | 9 | removed the top flying wand and its trail |
| Nine of Wands | 12 (11 standing + 1 held) | removed the three staves behind the head: 4 + 4 standing + 1 held |
| Ten of Cups | 8 | two more cups continue the rainbow arc |
| Five of Swords | 7 (5 carried + 2 on the sand) | removed the two swords on the sand |
| Six of Swords | 4 | two more swords stand behind the four in the boat |
| Eight of Swords | 5 | three smaller swords stand further back (3 left, 5 right) |
| Nine of Swords | 8 | the wall swords are re-spaced to nine, behind her hair |
| Ten of Swords | 11 | removed the centre sword |
| Five of Pentacles | 4 | the window holds 1 + 2 + 2 |
| Ten of Pentacles | 9 | ten coins re-spaced along the same arch |

All 78 faces now render with `slice` framing. The five 2 November masters
(1024×1536) are cropped by viewBox to the atlas-cell aspect (1024×1303) at
checked offsets, so they no longer show suit-coloured bands. Every counted
symbol stays inside the frame for art boxes from 0.746 (desktop spread) to 0.82
(phone spread). Five Pentacles cells (03, 05, 06, 07, 10) crop from the bottom
so the coins at their top stay whole, like the Wands/Cups queens and kings.

### Verified symbol counts (checklist for any art change)

Counted on the delivered WebP, framed as `TarotCard` frames it (gallery aspect
0.786), plus 3–6× crops of the cell. Overlap and bundle cards were checked at 4×.

| Card | Count | Note |
| --- | --- | --- |
| wands-01 | 1 | |
| wands-02 | 2 | |
| wands-03 | 3 | |
| wands-04 | 4 | garland posts |
| wands-05 | 5 | retouched |
| wands-06 | 1 | traditional count is 6 (rider's staff only); not yet corrected |
| wands-07 | 7 | retouched: 1 held + 6 raised |
| wands-08 | 8 | retouched |
| wands-09 | 9 | retouched |
| wands-10 | 10 | bundle, counted on the tips at 6× |
| cups-01 | 1 | |
| cups-02 | 2 | 2 Nov master |
| cups-03 | 3 | |
| cups-04 | 4 | 3 on the grass + 1 offered |
| cups-05 | 5 | 3 spilled + 2 standing |
| cups-06 | 6 | 2 Nov master |
| cups-07 | 7 | |
| cups-08 | 8 | 2 Nov master |
| cups-09 | 9 | |
| cups-10 | 10 | retouched |
| swords-01 | 1 | |
| swords-02 | 2 | |
| swords-03 | 3 | |
| swords-04 | 4 | 3 on the wall + 1 by the bed |
| swords-05 | 5 | retouched: all five carried |
| swords-06 | 6 | retouched |
| swords-07 | 7 | 5 carried (3 hilts + 2 blades) + 2 left in the ground |
| swords-08 | 8 | retouched |
| swords-09 | 9 | retouched |
| swords-10 | 10 | retouched |
| pentacles-01 | 1 | |
| pentacles-02 | 2 | |
| pentacles-03 | 3 | top-aligned framing |
| pentacles-04 | 4 | the two coins under the boots are partly cropped at every aspect |
| pentacles-05 | 5 | retouched, top-aligned |
| pentacles-06 | 6 | 5 above + 1 given, top-aligned |
| pentacles-07 | 7 | top-aligned |
| pentacles-08 | 8 | 2 Nov master |
| pentacles-09 | 9 | 2 Nov master |
| pentacles-10 | 10 | retouched, top-aligned |

The 22 major arcana show their named archetypes, and the 16 court cards show
one figure with the suit symbol (heads kept on the tall Wands/Cups courts).

