# Minor-arcana illustration prompts

Created 1 November 2026 with the built-in ImageGen tool, four generation calls.
The input image `major-01.png` was a Games-owned style reference, not an edit
target. No CLI/API fallback, external deck art or fictional-character likenesses
were used. Original generated files remain in Codex's generated-image directory;
selected PNG copies and WebP delivery derivatives are saved in this directory.

These are the normalized final prompt set, preserving each requested scene and
the production constraints for reuse.

## Shared direction

Use case: stylized-concept. New original minor-arcana illustration atlas for a
web game. Modern diverse adults, bold black ink contours, rich navy/cobalt,
vermilion/coral, golden yellow and cream, silkscreen and restrained halftone.
Match the major-sheet reference's editorial quality, readable silhouettes and
coherent anatomy. Portrait 2:3 canvas with four columns and four rows; sixteen
independent full-bleed panels, no gutters, text, numbers, letters, logos or frames.
Fourteen distinct narrative scenes in reading order, then two decorative cells.
Keep subjects centered. No franchise characters or copied commercial deck art.
Cups/Swords/Pentacles additionally requested equal boundaries at 25/50/75 percent;
delivery uses inspected rectangles where generated row heights differ.

## Wands — minor-wands-v1.png

Ace: luminous sprouting wand held from a cloud. Two: traveler holding a globe
with two wands and city vista. Three: woman surveying ships with three staffs.
Four: floral staffs framing a homecoming celebration. Five: friends playfully
sparring with staffs. Six: laurel-crowned rider returning to cheering friends.
Seven: person holding ground on a ridge. Eight: eight meteor-like flying wands.
Nine: resilient tired guardian with bandaged forehead. Ten: burdened person
carrying wands toward town. Page: curious young adult studying a sprouting wand
in a desert. Knight: adventurer on rearing horse with fiery scarf and wand.
Queen: confident queen with sunflower, wand and black cat. King: older king on
lion-patterned throne holding flowering wand. Spare cells: navy wand/star pattern;
coral sun and wand constellation.

## Cups — minor-cups-v1.png

Ace: overflowing cup, hand from cloud, streams and lilies. Two: equal partners
exchanging goblets beneath a winged lion. Three: friends toasting in a garden.
Four: introspective adult ignoring an offered cup. Five: grieving traveler,
spilled cups and two upright cups, distant bridge. Six: adults exchanging flowers
in cup-filled courtyard. Seven: dreamer facing fantastical possibilities in
floating cups. Eight: traveler leaving cups for moonlit mountains. Nine: contented
person beneath an arc of cups. Ten: chosen-family picnic beneath cup rainbow.
Page: curious young adult with fish emerging from cup. Knight: white-horse rider
offering goblet by river. Queen: thoughtful queen cradling lidded cup at water's
edge. King: calm older king on ocean throne with cup and scepter. Spare cells:
navy/gold cup constellation; coral/cream ripples with cup and stars.

## Swords — minor-swords-v1.png

Ace: shining upright sword with crown and olive branch. Two: blindfolded woman
holding crossed swords by moonlit sea. Three: symbolic pierced heart and rain,
no gore. Four: peaceful resting adult beneath displayed swords and stained glass.
Five: conflicted winner as others leave the shore. Six: ferryperson guiding
travelers toward calmer water. Seven: strategic traveler carrying swords from
camp. Eight: loosely bound blindfolded adult with a visible clear path out.
Nine: worried person awake in bed, decorative swords, no violence. Ten: exhausted
adult resting beneath symbolic suspended swords and a hopeful golden dawn,
no injury. Page: alert young adult with sword on windy hill. Knight: determined
rider charging into wind. Queen: perceptive silver-haired queen, upright sword,
open hand. King: thoughtful mature king on mountain throne with butterflies.
Spare cells: navy sword constellation; coral sunbeams and sword.

## Pentacles — minor-pentacles-v1.png

Ace: hand offering luminous pentacle over garden gate. Two: playful juggler with
two coins and infinity ribbon beside waves. Three: three adults collaborating
in a stone workshop. Four: seated adult holding coins tightly, city behind.
Five: two winter travelers outside a glowing window, support nearby. Six:
generous adult sharing coins with balanced scales. Seven: patient gardener
contemplating coin-bearing vine. Eight: focused craftsperson carving a pentacle.
Nine: independent woman with falcon in abundant garden. Ten: multigenerational
adults and dogs in a courtyard. Page: curious learner holding pentacle in fields.
Knight: grounded rider on still dark horse above fertile farmland. Queen:
generous queen on leafy throne with rabbit. King: calm prosperous king on
bull-patterned throne in vineyard. Spare cells: navy pentacle constellation;
coral pentacle sunburst.

## Focused corrections — 2 November 2026

Five built-in ImageGen edits used the existing Cups/Pentacles atlas as the target
and style reference. One 2:3 portrait per call; preserve diverse people, cobalt,
navy, coral, cream, gold, black ink and silkscreen texture. No text, labels,
numbers, border, watermark or additional accidental cup/coin motifs. All counted
objects must remain distinct and safely inside the frame. Selected outputs are
versioned PNG masters alongside the intact v1 atlases, with reproducible WebP derivatives.

- `minor-cups-02-v2`: same two facing adults, one held cup each; winged lion and caduceus above, warm connection; no extra cup on a table.
- `minor-cups-06-v2`: courtyard flower gift, one offered flower cup and five on the foreground ledge; warm nostalgia, arch and roses.
- `minor-cups-08-v2`: moonlit mountain departure, red-cloaked traveller; exactly five cups below three above, all eight fully visible.
- `minor-pentacles-08-v2`: focused craftsperson; one carved disc on the bench and seven on a rack (four plus three), one five-point star on each.
- `minor-pentacles-09-v2`: independent woman, falcon on glove and sunny villa garden; nine vine pentacles in three groups of three, no coin on lap or extra jewellery motif.

Acceptance: manually counted source objects and inspected rendered phone card
frames; all 78 canonical IDs still map uniquely. Generated-image provenance is
retained by this chat; build commands never modify the selected PNG masters.

## Local symbol-count retouching — 3 November 2026

No prompts and no generated imagery: twelve cells were edited from the existing
v1 atlas pixels with local scripts (numpy/scipy patch fill and same-card symbol
copies, composited behind or in front of existing figures). Each became a
`minor-<id>-v2.png` single-card master at the cell's own size; the v1 atlases are
unchanged. The per-card changes and the verified symbol count for every Ace to
Ten are recorded in `README.md`. Any future art change must re-count the
affected cards at the gallery frame and update that table, which a unit test checks.
