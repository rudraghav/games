# Science reference review — batches 001 and 002

Visually inspected all 405 new references in immutable `science-001` (234) and `science-002` (171), across all 11 contact sheets. This is distinct from the earlier 177-reference science baseline and the separately reviewed 18-reference `science-003` batch.

395 of these 405 are accepted after inspection, including 84 exact-source framing corrections. Each of those 84 full sources was inspected; individual bounded rectangles use actual decoded dimensions and preserve the named subject. All final before/after pairs were inspected at 88×110. Final changed images total 1,425,350 bytes and match their recorded byte counts and SHA-256 hashes. Two final headwear/hair margins were enlarged and checked again. No details were generated, retouched or invented.

Ten identities remain pending source repair; their names are retained:

| Identity | Source problem |
| --- | --- |
| Aglaonike | [The source depicts two anonymous women in a ritual/moon scene](https://commons.wikimedia.org/wiki/File:Greek_vase_painting_Diana_Taurica_Hamilton_collection.jpg), with no identification of either as Aglaonike. |
| Anthemius of Tralles | The source is a book title page, not a figure. |
| Bi Sheng | The source is a printing exhibit and associated artifacts. |
| Cleopatra the Alchemist | [The 1618 source is explicitly an imaginative depiction](https://commons.wikimedia.org/wiki/File:Cleopatra_the_alchemist.jpg), but its tiny figure within a seal is not useful at reading size; needs a clearer named depiction. |
| Du Shi | The source contains waterwheel/smelting diagrams. |
| Jan Swammerdam | [The familiar image derives from Hartman Hartmanzoon in a Rembrandt painting](https://micro.magnet.fsu.edu/optics/timeline/people/swammerdam.html), not an established Swammerdam likeness. |
| Taqi al-Din | The observatory group contains many figures; [the astronomical heritage account remains uncertain between two men](https://web.astronomicalheritage.net/index.php/show-entity?action=map&identity=184&idsubentity=1). No arbitrary individual crop was accepted. |
| Archytas | [The turban bust's old identification relied on a false coin](https://commons.wikimedia.org/wiki/File:Archytas_of_Tarentum_MAN_Napoli_Inv5607.jpg); the current image is the same disputed subject. |
| Daniel C. Tsui | The existing portrait is too blurred; a clearer exact source is needed. |
| Thomas Bayes | [The source describes an unknown later Presbyterian clergyman](https://commons.wikimedia.org/wiki/File:Thomas_Bayes.gif), not an established Bayes likeness. |

Historical depictions are treated separately from false sitters. János Bolyai's accepted image is the explicitly named 2012 Ferenc Márkos reconstruction, [documented as such by Óbuda University](https://uni-obuda.hu/wp-content/uploads/2022/07/hirmondo_2022_junius.pdf); it is not asserted to be a surviving contemporary portrait. Dioscorides was cropped to the seated author on the left, [distinguished by the source caption from Heuresis on the right](https://commons.wikimedia.org/wiki/File:Dioscorides_Vienna_(detail)_(cropped).jpg).

Ignored artifacts under `output/tarot-reference-import-20261117/` are `science-review.json` (405 individual receipts), `science-crop-patches.json` (84 accepted crop records), and `science-review-sources/` (public source bytes, metadata, rectangles, original staged-image backups and six `corrections-88-*.png` readbacks). Sources were fetched with three workers and a 3 MB per-image cap; one oversized unscaled PNG was fetched as a smaller official thumbnail before continuing.

Shared staging manifests and active/production exports were not edited. The catalogue owner must merge accepted metadata before promotion and separately repair the ten pending sources. Low-light, aged or historically low-resolution depictions retain their source characteristics. This does not establish browser, deployed-asset or generated-reading quality.
