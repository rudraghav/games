# Expanded Tarot reference library — 17 November 2026

## Current local catalogue

The final identity set contains **5,636 references**, including the preserved original 48, with **5,588 reviewed added local images**. The cast, image manifest, source lenses and matching index are promoted locally and frozen for release checks. This document does not claim a push, deployment or live release. The first-stage 1,342-reference review is preserved below as historical evidence.

| Category | References |
| --- | ---: |
| Original character cast | 48 |
| Actors and film-makers | 1,095 |
| Science and invention | 603 |
| Rulers and historical leaders | 334 |
| Political and civic leaders | 550 |
| Sport | 755 |
| Writers and thinkers | 563 |
| Music and performers | 755 |
| Additional fictional characters | 291 |
| Religious and mythological figures | 116 |
| Visual artists and architects | 301 |
| Other public figures | 201 |
| Specific meme scenes | 24 |

The selection combines curated public article lists with explicit Indian regional cinema, major fictional franchises, religious traditions and source-specific meme scenes. Familiarity tiers distinguish major, regional and supporting references. This is broad curated coverage, not a claim that every name is universally famous. Actors and the roles they perform are separate identities; sources identify the actual character incarnation. Religious figures carry their named tradition, and related forms share a family only to avoid repetitive comparisons in one reading.

### Acquisition, factual context and repair

The intake script resolves canonical Wikipedia articles and Wikidata entities, uses bounded cached requests, and writes atomic checkpoints. Its initial lead image is a draft candidate, never sufficient proof of the depicted person. Each retained final addition has an image reviewed in a contact sheet, with flagged subjects checked against source captions, institutional pages or exact character profiles. Tiny stamps, collages, maps, generic objects, wrong people and uncertain portraits trigger repair. Recognizable names are preserved while a better exact source or an explicitly labelled original illustration is obtained.

The historical 81 visual exclusions were reconciled individually: six had already returned through earlier repairs, 67 distinct individuals were restored, four ambiguous mantles are represented by explicit existing individuals, and four genuine groups remain outside the individual comparison pool. The separate Nightwing mantle was consolidated into Dick Grayson; Nightwing/DC Comics and DC Universe aliases preserve lookup. Other group/editorial holds remain recorded rather than silently deleted.

Source contexts use concrete public work, documented story events or named religious symbolism. Full article introductions remain in the ignored cache; published contexts are bounded to 100 words/600 characters with revision/source URLs and attribution. The extractor keeps complete sentences within paragraphs, excludes unsupported warning-marked claims and first-person praise, and avoids namesake paragraphs. Editorial paraphrases and primary museum/university facts are labelled separately from verbatim Wikipedia excerpts. Seven conservative-extractor exceptions were manually summarized from the complete source introductions. Rich context stays server-side; the browser registry contains only display identity and image credit metadata.

### Image treatment and honest provenance

Most images are exact source-linked photographs, role stills, illustrations, historical depictions or named statues. Where no authenticated likeness survives, a clear attributed historical depiction can be used without claiming photographic authenticity. Verified artworks may represent artists such as Banksy when no portrait is appropriate; these have explicit artwork titles and institutional attribution links. Generated symbolic illustrations are labelled as original illustrations, never surviving or authenticated faces. Native originals remain preserved, and exact generation prompts and hashes are in [additional historical illustration prompts](additional-historical-illustration-prompts.json), the root historical prompt record, and the relevant music/religious review records.

Ordinary portraits are 320×400 WebP; specific memes may use 320×240. Source crops have measured decoded dimensions, rectangles, byte counts and SHA-256 hashes. Full sources and final corrections were checked at large size and at 88×110; memes were additionally checked in their wider final presentation. Images were not identified through facial resemblance. Modern statue photographs and non-free depicted artwork do not inherit an open licence merely because a photographer supplied one; the importer gives declared non-free metadata precedence. Rights metadata records actual source claims and credits, not fabricated permission.

### Evidence and verification boundary

Review receipts are split by batch and reviewer, with compact durable correction sheets and source-binding notes in this directory. [Fiction recovery](fiction-review.md), [cultural recovery](baseline-cultural-recovery.md), [religious recovery](religious-missing-reference-review.md), [visual-art source repairs](visual-art-source-repairs.md), [final ruler framing](ruler-recovery-final10.md), and [meme source notes](memes.md) document the difficult cases. The final promoted manifest must require `reviewStatus: accepted` and match every exact file/hash; no pending image may enter the active catalogue. Canonical IDs, QIDs and all normalized name/source alias combinations are unique.

Manual visual review establishes composition, source binding and useful framing. It does not provide forensic identity authentication, settle every historical attribution dispute, or guarantee every future AI analogy. The app’s canonical lookup binds a named reference to its exact reviewed image; the Tarot comparison remains an interpretation. Reading evaluations, astrology-toggle scenarios, saved-room/browser evidence and release status are recorded separately by the parent task.

### Final local validation

All 5,588 added assets passed exact byte/hash, bounded dimensions, canonical entity, subject-kind and source-attribution checks. The active exporter and its drift check both pass for all 5,636 references; the semantic index integrity check confirms the same 5,636 identities with sourced public context. The importer compiles and passes Ruff. Final image payload is 86,056,106 bytes (about 82.1 MiB): 5,551 sourced images and 37 declared original illustrations. Rights records contain 2,629 public-domain, 2,458 source-licensed and 464 copyright-reference images; generated illustrations do not claim source licences. There are 25 explicitly labelled artwork references, including four complete calligraphic identity medallions/names.

The final canonical snapshot SHA-256 is `fcec5676f5ade6be8e67e65277b9733d03d84c4f83edf8e1c1f1ad943bd3251f`. The original 48 active image files remain unchanged. The earlier Nightwing mantle image is preserved in `reference-art-v1/archive`, excluded from active counts. Nine group/editorial/superseded-mantle records remain in review history; no otherwise eligible individual is absent solely because its first image failed.

Checks run: `python3 scripts/export_tarot_characters.py`, `python3 scripts/export_tarot_characters.py --check`, `backend/.venv/bin/python scripts/check_tarot_reference_index.py`, `python3 -m py_compile scripts/import_tarot_references.py`, and `backend/.venv/bin/ruff check scripts/import_tarot_references.py`. Parent-owned app tests, reading evaluations and release verification are separate evidence.

## Historical first-stage baseline

The following record describes the earlier 1,342-reference checkpoint, before the requested 5,000-plus expansion and the explicit instruction to repair good names rather than drop them because of weak images. Its exclusions and counts are historical, not the final eligibility decision.


The active catalogue contains **1,342 image-backed references**: the original 48 character identities and artwork remain unchanged, plus 1,294 reviewed additions. The complete library has 264 fictional/folklore characters and 1,078 real people. Every addition has one canonical Wikipedia article, Wikidata entity, locally hosted portrait, source file page, credit and explicit rights metadata. No generated portrait, face search, approximate person search or actor-for-character replacement was used for this expansion.

| New reference category | Accepted |
| --- | ---: |
| Actors and film-makers | 155 |
| Scientists and inventors | 177 |
| Rulers and historical leaders | 111 |
| Political and civic leaders | 155 |
| Athletes and sport | 161 |
| Writers and thinkers | 159 |
| Musicians and performers | 160 |
| Fictional/folklore characters | 216 |
| **New total** | **1,294** |

The selection includes Indian and international references across eras, genders and fields: for example Shah Rukh Khan, Madhuri Dixit, Irrfan Khan, C. V. Raman, Janaki Ammal, A. P. J. Abdul Kalam, Maryam Mirzakhani, Savitribai Phule, Nelson Mandela, Sachin Tendulkar, P. V. Sindhu, Simone Biles, Rabindranath Tagore, Toni Morrison, Lata Mangeshkar and Nina Simone. Fiction includes Hindi-film references from the preserved cast as well as the expanded Harry Potter, Star Wars, Marvel, DC, anime, television, animation and game selections. This is a curated broad library, not a claim of universal cultural representation.

## Acquisition and identity binding

The maintained importer is `scripts/import_tarot_references.py`. Discovery starts from Wikipedia's editorially curated [Vital Articles people list](https://en.wikipedia.org/wiki/Wikipedia:Vital_articles/Level_4/People), [arts list](https://en.wikipedia.org/wiki/Wikipedia:Vital_articles/Level_4/Arts), and their level-five narrative arts, entertainment and sport sublists. Explicit recognizable franchise and Indian/global seeds complement those lists. A broad occupation query was abandoned after a timeout; acquisition uses cached bounded requests instead.

For each candidate, Wikipedia resolves redirects to a canonical article. Its `wikibase_item` supplies the exact entity and its declared `pageimage` supplies the image. Bounded Wikidata entity/instance queries distinguish humans from bands, organizations and fictional groups; manual review then rejects unsuitable images. Source image metadata comes from the [MediaWiki Imageinfo API](https://www.mediawiki.org/wiki/API:Imageinfo) and [Commons machine-readable metadata](https://commons.wikimedia.org/wiki/Help:Machine-readable_data). No query searches for an approximately similar face.

The process is resumable, uses at most four download workers (three used here), requests at most five expensive image metadata records per batch, caps source images at 3 MB and metadata responses at 16 MB, and accepts only Wikimedia image hosts. Downloaded source files are temporary. JSON checkpoints use temporary files plus atomic replacement. Existing original and legacy artwork is preserved. Acquisition is an intake stage: new images require visual review before the catalogue is released.

Person display names use canonical English article titles, preserving useful disambiguation. Correct former spellings remain aliases; the erroneous Wikidata label “Isadora Duncana” was corrected to “Isadora Duncan” without retaining the typo as an alias or changing the stable ID. Fictional sources use curated franchise names where available, with earlier universe labels retained as aliases. Source labels such as Earth-616 and DC Universe normalize to Marvel Comics and DC Comics.

Unreviewed Wikidata descriptions are **not published**. Review caught an incorrect assertion about Kylo Ren. Published descriptions are deterministic category labels such as “Reference from science and invention.” or “Character from Star Wars.” They do not invent current offices, life dates, achievements or personality traits. Editorial exclusions also keep the named extremist/atrocity-leader examples out of this reflective comparison library; ordinary historical and political references are not presented as endorsements.

## What was visually checked

All **1,375 acquired draft images** were inspected in category contact sheets, split across three reviewers: actors/science/politics 490; royalty 145; literature 170; sport/music 330; fiction 240. The checks covered visible subject composition, groups/collages, logos/maps/schematics, severe letterboxing, faint subjects and usefulness at portrait scale. Exact source pages and file metadata were additionally consulted for flagged cases. The original 48 were checked for unchanged data, rather than claimed as newly re-reviewed in this expansion.

**81 draft images were excluded**, including nonportrait calligraphy/maps, a Su Song clock schematic, ambiguous coin issuers, multi-person reliefs, superhero collages/groups, a Sappho vase, postage stamps with tiny subjects and back-facing sports portraits. The putative Robert Hooke portrait was rejected because the source identifies the sitter as unknown and the Hooke attribution as conjectural. Belinda Clark and Captain Ahab were excluded after tighter framing still failed to produce a clear portrait. Rejected drafts are absent from the public asset directory; exact decisions and source URLs remain in `reference-art-v1/review.json`.

**53 accepted images received manually chosen source crops**: 16 people/historical depictions, 30 sport/music portraits and seven fictional images. The crop coordinates, actual decoded source dimensions and exact source image URLs are recorded. Crops do not generate, retouch or replace a subject. Actual image dimensions were measured because returned thumbnail bytes sometimes differed from the API's requested thumbnail dimensions. The corrections were inspected at 88×110, including a browser render using the shared portrait CSS for the fictional corrections; a second reviewer read back the resulting sheets.

Retained compact evidence:

- [People and historical depiction corrections](reference-review/people-corrections.webp): all 16 accepted.
- [Sport before/after at 88×110](reference-review/sport-corrections-88.png): 15 accepted.
- [Music before/after at 88×110](reference-review/music-corrections-88.png): 15 accepted.
- [Fiction at 88×110](reference-review/fiction-corrections-88.png): seven accepted; Ahab is shown as the rejected comparison and is not active.

A page-to-image association is not by itself proof that every historical sitter is authentic. Historical statues, busts, illustrations, paintings and performance poses are retained as depictions, not represented as photographs from life. Visual QA does not establish forensic facial identity, settle every disputed attribution, or certify every source's claims. These limits are separate from the exact app lookup: a reading's canonical name/source resolves only to that identity's reviewed local asset. The analogy between a Tarot card and that public identity remains interpretive.

## Assets and rights

All 1,294 new portraits are 320×400 WebP files, totaling **20,121,348 bytes** (about 19.2 MiB); the largest is 69,120 bytes. Images preserve the whole source in an ivory frame unless a reviewed source crop is recorded. The local assets avoid remote hotlink failures and unbounded original image payloads.

New manifest rights metadata contains 662 public-domain entries, 433 entries with the source's actual license and license URL, and 199 copyright-reference entries. Copyright-reference entries explicitly do not assert an open reuse license. Credits, source article, source file, original media URL, modifications, dimensions and file hashes remain available per asset. This records source metadata; it does not manufacture permission or independently adjudicate rights.

## Verification and scope

- Original 48 identity objects compared equal to the pre-expansion Git version; original active images and legacy archive were not modified.
- All 1,342 IDs are unique. The 1,294 new Wikidata entities are unique; canonical/alias lookup loaded successfully with no ambiguous name/source pairs.
- Every new identity joins its exact entity, source article and `person`/`character` image type. Active public WebPs exactly match the manifest; excluded entities and orphan files are absent.
- `python3 scripts/export_tarot_characters.py` and `--check` both passed for all 1,342 references: exact bytes/hashes, bounded dimensions, 4:5 aspect, required sources, credits and rights metadata.
- `backend/.venv/bin/ruff check scripts/import_tarot_references.py`, `python3 -m py_compile scripts/import_tarot_references.py` and a bounded cached resume passed.
- No AI provider calls, production room writes or production data changes occurred in this acquisition/review work. Full reading evaluations, app scenarios and release proof are recorded separately by the parent task.

Local review scratch is under the exact ignored `output/tarot-reference-import-20261117` path. Rejected drafts were moved there before review closeout; the durable exclusion/crop receipt is committed. Source caches and superseded contact sheets are disposable after final verification. Existing services, databases, browser sessions, original assets and archives are preserved.
