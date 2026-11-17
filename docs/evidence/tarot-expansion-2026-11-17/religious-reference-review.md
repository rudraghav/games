# Religious reference image review — 17 November 2026

Reviewed all 103 religious reference drafts on `staging-5000/contact-sheets/religion-01..03.webp` and their ID/source maps. This is source-identity and image-framing evidence for the staging batch, not proof of deployed artwork, exhaustive theological agreement, browser rendering or reading quality.

The review preserves the distinction between a named depiction and an associated object or person. Exact-captioned statues, paintings, seals and traditional nonhuman forms are valid depictions; a devotee, procession, unrelated god or autonomous weapon scene is not a portrait of the requested figure.

## Result

- 103 unique IDs accepted after inspection and correction; no identity was removed because its initial image was unsuitable.
- 22 exact-source framing corrections: Amaterasu, Baldur, Brigid, Frigg, Fuxi, Hachiman, Heimdall, Hephaestus, Inari, Izanagi, Izanami, Jade Emperor, Njord, Obatala, Oya, Prometheus, Persephone, Queen Mother of the West, Thor, Tiamat, Tyr and Zhong Kui.
- Four wrong-subject or ambiguous images replaced as documented below. All changed images remain sourced artwork; none uses generative face replacement.
- Source crops use actual decoded pixel dimensions, bounded rectangles and 320×400 WebP output. The 22 corrected crops and four replacements were inspected again at 88×110, the small reading-portrait size. All 26 changed files match their recorded byte counts and SHA-256 hashes.

## Replacements and exact attribution

| Identity | Initial problem | Accepted source |
| --- | --- | --- |
| Oshun | The first file explicitly depicted a devotee of Oshun. | [Yeniajayiii’s named statue of Yeye Oshun at the Sacred Grove](https://commons.wikimedia.org/wiki/File:Statue_of_yeye_oshun_at_the_Sacred_Grove_Of_Oshun.jpg), CC BY-SA 4.0; framed face, crown and infant. |
| Yemoja | The first file depicted an Abeokuta procession. | [Luan di Nunes e Cleiton’s explicitly named Iemanjá devotional statue](https://commons.wikimedia.org/wiki/File:Iemanj%C3%A1_yemanj%C3%A1_rainha_do_mar.JPG), CC BY-SA 3.0; this Brazilian depiction and its source’s composited sea background are retained, not presented as a historical portrait. |
| Marduk | The original relief is identified as Ninurta fighting Anzu, with an older disputed Marduk attribution. | [The Merodach/Marduk figure in the 1916 Spence/Evelyn Paul illustration](https://commons.wikimedia.org/wiki/File:Myths_and_legends_of_Babylonia_and_Assyria_(1916)_(14759101646).jpg); the source book’s adjacent text identifies Merodach fighting Tiawath. Source scan records no known restrictions. Separate crop excludes Tiamat. |
| Lugh | The original Millar scene shows Lugh’s autonomous magic spear; it does not establish which combatant is Lugh. | [Seán Fitzgerald’s explicitly captioned Lugh illustration](https://mythicaldonegal.wordpress.com/2021/03/13/lugh/), framed around the single figure’s face, spear and upper body. Recorded as a modern copyrighted reference with attribution; no open licence, permission or historical-portrait claim is asserted. |

Heimdall’s crop was checked against the [University of Gothenburg account of the Asplund painting](https://gupea.ub.gu.se/bitstream/handle/2077/66148/gupea_2077_66148_4.pdf?isAllowed=y&sequence=4), identifying the central figure with the sacred flame. Persephone’s exact vase caption distinguishes her standing with torches from seated Demeter and the initiates. Izanagi/Izanami and Marduk/Tiamat use distinct crops of their respective source compositions, not the same undifferentiated group image.

Brigid’s source is Duncan’s *The Coming of Bride* (1917), a modern Celtic Revival depiction. [Art historian Murdo Macdonald explicitly identifies this work with the pre-Christian goddess bringing spring](https://1890s.ca/duncan_bio/) and distinguishes it from Duncan’s *St Bride* (1913), which depicts the Christian saint. The receipt records that distinction and verification source.

## Review artifacts and limits

Ignored working evidence under `output/tarot-reference-import-20261117/`:

- `religion-review.json`: all 103 IDs, accepted status, source pages and reasons; the four original mismatch explanations are preserved under `replacedSource`.
- `religion-crop-patches.json`: 22 exact-source crop records.
- `religion-replacement-patches.json`: four full updated asset records, including source, rights, crop, dimensions and hashes.
- `religion-corrections-88px.webp` and `religion-replacements-88px.webp`: final visual readbacks.
- `religion-crop-sources/` and `religion-replacement-sources/`: exact public source bytes, metadata, previews and original staged-image backups.

Shared staging manifests, active catalogue identities, generated exports and production assets were not edited by this review. The catalogue owner must merge the accepted metadata before promotion. Traditional iconography and source quality vary: some historical drawings remain low contrast, but the reviewed named subject is visible. This review does not infer a user’s faith or treat the depicted figures as divine messages.
