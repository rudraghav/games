# Final twelve religious references — 17 November 2026

All twelve final 320×400 images and their 88×110 reading-size renderings were inspected. Four existing Hindu identities are accepted; eight missing identities now have separately prepared identity/art patches. Shared manifests and catalogue files remain art-owner integration work.

| Identity | Final depiction and decision |
| --- | --- |
| Shiva Q11378 | Kashinath's named Bangalore statue, photograph by Indianhilbilly; closer frame preserves the head, crescent, trident, snake and meditating hands. |
| Krishna Q42891 | Miskin's *Krishna Holds Up Mount Govardhan*, Metropolitan Museum source; closer frame preserves crown, face and raised hand beneath the mountain. |
| Vishnu Q11380 | Manaku of Guler's named *Gita Govinda* depiction; original full composition retained. |
| Kali Q132127 | Raja Ravi Varma's named Kali depiction; original full composition retained with its existing traditional imagery. |
| Pan Q132582 | Crop only the horned, bearded figure on the left of the Naples Pan-and-Daphnis sculpture; Daphnis excluded. |
| Norse Loki Q133147 | Eighteenth-century SÁM 66 manuscript depiction, distinct from Marvel Loki; complete profile, hat, torso and net remain visible. |
| Susanoo Q272993 | Named central figure in Tsukioka Yoshitoshi's *Susanoo slaying Yamata no Orochi*; retains face, sword arm and storm action. The source-context fragment was replaced with a concise factual paraphrase. |
| Māui Q1791456 | Dietrich Varez's *Māui Snaring the Sun* L48, explicitly a Hawaiian narrative interpretation; crop the main rope-pulling figure. The initially checked landscape sculpture and Manookian photograph were rejected for poor small-card legibility. |
| Pele Q1133063 | Arthur Johnsen's *The Goddess Pele*, the painting commissioned for Hawaiʻi Volcanoes National Park; full image retained. |
| Tangaroa Q1241320 | Carved figure detail from James Webster and Bethany Edmunds's named Māori *Tangaroa karetao-puoro* (Te Papa ME024209). Credit explicitly names this contemporary artwork; it does not claim an authentic likeness. |
| The Dagda Q436436 | Bearded, red-cloaked figure on the right of Jim FitzPatrick's *Dagda and the Woman of Uinnius*; other figure excluded. |
| Tsukuyomi Q595520 | Original AI-assisted symbolic illustration, visibly labelled as such in provenance. No usable named portrait remained at the checked Commons target. Moon/night and mirror symbolism are supported by Kokugakuin University's *Encyclopedia of Shinto*. It makes no claim to an authentic historical portrait. |

Exact sources are recorded per asset. Primary identification links include [Kokugakuin University](https://d-museum.kokugakuin.ac.jp/eos/detail/?id=9136), [Te Papa](https://collections.tepapa.govt.nz/object/1666096), [Jim FitzPatrick](https://jimfitzpatrick.com/product/dagda-and-the-woman-of-uinnius/) and [Dietrich Varez's catalogue](https://dietrichvarez.com/products/l48-maui-snaring-the-sun). Source credits and copyright status remain explicit; modern artwork is not relabelled as openly licensed.

Integration artifacts under `output/tarot-reference-import-20261117/`:

- `religion-missing-8-patches.json`: eight new `{id, character, asset, reason}` records.
- `religion-four-hindu-patches.json`: four existing `{id, asset, reason}` records.
- `religion-missing-12-review.json`: twelve accepted reviews and matching final SHA-256 hashes.
- `religion-missing-12-sources/final-1.png` and `final-2.png`: full-size plus 88×110 readbacks.
- Exact source bytes, source metadata, crop coordinates and existing-image backups remain in the same source folder for integration review.

Tsukuyomi used one built-in image-generation call. The original PNG and exact prompt are retained as `religion-missing-12-sources/tsukuyomi-original.png` and `tsukuyomi-prompt.txt`, with both hashes in the asset provenance. The original output remains under Codex's generated-images directory. The prompt requests a single calm male Japanese moon kami in understated classical robes, holding a plain circular mirror, rendered as textured gouache and ink with a pale moon behind him; it explicitly rejects an authentic-portrait claim, text, invented shrine insignia, fantasy armour and adaptation of an existing game character. The delivered image preserves those constraints.

All twelve final byte counts and SHA-256 hashes were checked against the prepared patches. This is local art inspection and provenance evidence; it does not establish browser, provider, deployment or production verification. No provider reading, production write, shared metadata mutation, or cleanup of retained source evidence occurred.
