# Tarot card guide

Original reference text for all 78 cards, in both orientations. It is what the
card page shows when someone opens a card, and it gives the engine and the reading
a one-line meaning for a card drawn upright or reversed.

| Piece                 | Where                                                         |
| --------------------- | ------------------------------------------------------------- |
| Source of truth       | `backend/app/games/tarot/card-guide.json`                     |
| Loader and model      | `backend/app/games/tarot/card_guide.py`                       |
| Rules as tests        | `backend/tests/test_tarot_card_guide.py`                      |
| Export for the client | `scripts/export_tarot_card_guide.py` (`--check` in contracts) |
| Generated copy        | `packages/api-client/src/generated/tarot-card-guide.json`     |
| Typed accessor        | `packages/api-client/src/tarot-card-guide.ts`                 |
| Card page             | `apps/web/src/games/tarot/TarotCardGuide.tsx`                 |
| Styles                | `packages/ui/src/styles/tarot-guide.css`                      |

Edit the JSON, run `backend/.venv/bin/python scripts/export_tarot_card_guide.py`,
then the backend test and `apps/web/src/tests/tarot-card-guide.test.tsx`.

## Using it

```python
from app.games.tarot.card_guide import guide, short_meaning

short_meaning("cups-05")              # today's deck.py sentence, unchanged
short_meaning("cups-05", "reversed")  # the reversed one-liner
guide("major-13").reversed.keywords
```

`deck.card_meaning(card_id, orientation)` returns these one-liners, so a drawn
card's `subtitle` and the meaning sent to a reading are the guide's line for the
orientation the card was drawn in. The upright line must stay equal to
`TarotCard.meaning` in `deck.py` (a test holds them together).

`card_guide.py` imports only the standard library and Pydantic. It does not import
the reading, provider, style or reference modules, and a test starts a clean
interpreter to prove it.

```ts
import { tarotCardGuide, tarotShortMeaning } from '@games/api-client/card-guide';
```

```tsx
<TarotCardGuide cardId="cups-05" orientation="reversed" position="What is shifting" />
```

`orientation` chooses the side shown first; both sides are always in the page
behind the Upright / Reversed switch. The page sizes itself from its own container,
so give it a block-level parent with a real width (not a centred grid item).

## Data model

One object per card, in deck order. The model is strict: unknown keys are rejected.

| Field             | Rule                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `id`, `name`      | Exactly the ids and names of `deck.py` (`major-00` … `pentacles-14`)                                                      |
| `arcana`, `suit`  | `major` with `suit: null`, or `minor` with one of the four suits                                                          |
| `number_label`    | `0`, `I` … `XXI` for the majors; `Ace` … `King` for the minors                                                            |
| `essence`         | One line, at most 90 characters                                                                                           |
| `figure`          | 2–3 sentences, 180–420 characters: who is in our illustration, and the archetype                                          |
| `symbols`         | 3–5 of `{ symbol ≤ 40, meaning 40–140 }`, each visible in our illustration                                                |
| `upright`         | `short`, `keywords` (4–6, one or two words), `meaning` (200–420), `love`, `work`, `self` (60–170 each), `advice` (50–150) |
| `reversed`        | The same shape; `short` is at most 110 characters                                                                         |
| `correspondences` | `element`, `astrology`, `number`, each `{ name, gloss 40–130 }`                                                           |
| `questions`       | Two reflective questions, 40–140 characters, each ending in `?`                                                           |

`upright.short` is the existing `deck.py` sentence for that card, character for
character, so readings generated today do not change. A test and the exporter both
fail if the two drift apart.

## Describing our own deck

`figure` and `symbols` describe the Games illustrations, not the
Rider-Waite-Smith drawings. All 78 cells were cropped from the masters with the
viewBoxes in `packages/ui/src/lib/tarot-artwork.ts` and looked at before the text
was written. Where our scene differs from the familiar one, the guide describes
ours. Some examples:

- The Chariot is drawn by a black panther and a white lioness, not sphinxes.
- The Moon shows a cloaked walker with a lantern between a dog and a wolf; there
  is no crayfish.
- The Sun's rider is a laughing adult on a white horse in a sunflower field.
- Judgement shows a crowd of all ages looking up; there are no coffins.
- The Tower shows falling stones and banners and nobody falling.
- The Devil's chain hangs slack between two people sitting back to back.
- Ten of Swords: the swords fan across the night sky above a figure who sits
  upright, watching the sun rise.
- Five of Pentacles: a door stands open with someone waiting to welcome the
  travellers in.
- Eight of Swords: an open path runs away behind the bound figure.
- Three of Swords: the pierced heart glows; no person is shown.

If an illustration is replaced, re-read its `figure` and `symbols`.

## Tone rules

- Warm, plain, specific. Second person, present tense. British spelling, like `deck.py`.
- Reflective, never predictive: no "you will", no timing, no yes-or-no verdicts.
- No medical, legal or financial directives.
- Upright is not automatically good. Reversed is not bad luck: it is the same theme
  blocked, turned inward, delayed, overdone or resisted, with what would help.
- No fear language for Death, The Devil, The Tower, Three of Swords, Ten of Swords
  and Five of Pentacles. The test holds a word list for those six.
- No sexual content, slurs or fan-fiction vocabulary anywhere.
- Gender-neutral unless the illustration clearly shows otherwise.
- Every card reads as its own card. A test fails if any six-word run or any whole
  sentence appears on two different cards, or if a reversed field reuses a six-word
  run from its upright field.

## Correspondences

These are traditional attributions, used consistently and named here. They are a
symbolic vocabulary, not a claim about the world.

- **Suit elements:** Wands Fire, Cups Water, Swords Air, Pentacles Earth.
- **Major Arcana astrology:** the Hermetic Order of the Golden Dawn attributions:
  planets for the Magician (Mercury), High Priestess (Moon), Empress (Venus), Wheel
  of Fortune (Jupiter), Tower (Mars), Sun (Sun) and World (Saturn); zodiac signs,
  Aries to Pisces in order, for the Emperor, Hierophant, Lovers, Chariot, Strength,
  Hermit, Justice, Death, Temperance, Devil, Star and Moon.
- **The three elemental majors:** the Golden Dawn gave the Fool, the Hanged Man and
  Judgement an element alone (Air, Water, Fire). The `astrology` field uses the
  modern planets often paired with them (Uranus, Neptune, Pluto), and each gloss
  says that this is a modern pairing.
- **Major Arcana elements:** the element of the card's sign; for the planet cards,
  the element commonly taught with that planet (Mercury Air, Moon Water, Venus
  Earth, Jupiter Fire, Mars Fire, Sun Fire, Saturn Earth). This last set is a
  modern convention, not a Golden Dawn table.
- **Two to Ten of each suit:** the Golden Dawn decans, three per sign, for example
  Two of Wands "Mars in Aries" and Ten of Pentacles "Mercury in Virgo". The full
  table is in the test.
- **Aces:** the root of their element, shown as "Fire signs", "Water signs", "Air
  signs" or "Earth signs".
- **Court cards:** an elemental pair, "part of suit". This guide uses Page Earth,
  Knight Fire, Queen Water, King Air (the Golden Dawn scheme with the mounted
  Knight as Fire and the King in the place of its Prince as Air). Other books swap
  Knight and King; pick one and keep it, which is what the test enforces. Queens
  take the cardinal sign of their element, Kings the fixed sign and Knights the
  mutable sign; Pages take no single sign and show their element's three signs.
- **Numbers:** plain number symbolism (one as a seed, four as a foundation, and so
  on). Majors above nine mention the single digit they reduce to where it helps.

The allowed names live in `card_guide.py` (`ELEMENT_NAMES`, `ASTROLOGY_NAMES`,
`NUMBER_NAMES`); anything else is rejected when the file loads.

## Sources and licences

The writing is original. Tarot's traditional meanings and attributions are common
knowledge; particular wording in books, sites and datasets is not ours to copy.
Public repositories were consulted on 21 November 2026 only to check that all 78
cards and both orientations were covered and that the traditional themes were
present. Nothing was copied from any of them.

| Consulted                                                       | Licence                                                                                                          | Used for                                                            |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `dariusk/corpora`, `data/divination/tarot_interpretations.json` | README declares CC0 (GitHub shows no licence file). The file credits Mark McElroy's _A Guide to Tarot Meanings_. | Keyword themes per card, compared after writing                     |
| `ekelen/tarot-api`, `static/card_data.json`                     | No licence in the repository. Text is parsed from A. E. Waite's _Pictorial Key to the Tarot_ (1910).             | Confirming 78 cards with upright and reversed fields; overlap check |
| `metabismuth/tarot-json`, `tarot-images.json`                   | MIT                                                                                                              | Card names, numbers and suits only                                  |

Checks run against the finished text:

- Against the `corpora` file: no shared sentence. Four five-word runs coincide, all
  everyday idioms ("one thing at a time", "going through the motions of", "what
  you need to know", "you need in order to").
- Against the `ekelen` file: no shared five-word run.
- Keywords were chosen independently. Where a traditional theme was missing after
  the comparison (for example "victory" for the Chariot and Six of Wands, "love"
  for the Lovers), a plain single word was added.

## Fan-fiction and adult vocabulary

The owner reported seeing "smut and fluff" after selecting a card. A
case-insensitive search of the repository on 21 November 2026 for `smut`, `fluff`,
`nsfw`, `lemon`, `kink` and `fanfic` found none of it in any card, reference or
reading text:

- `smut` occurs only inside "transmutation" in one reference biography in
  `characters.json`.
- `fluff` occurs only as the vocabulary token "fluffy" in
  `semantic_model/tokenizer.json` and in a game-art prompt unrelated to Tarot.
- `lemon` occurs as a slot-machine symbol, the surname of Meadowlark Lemon and the
  album title _Lemonade_.
- `nsfw`, `kink` and `fanfic` do not occur.

No static text in the repository can produce the phrase, so the remaining source
is generated reading prose (or a saved reading in the database, which is outside
the repository). The guide's own test bans this vocabulary in every field.

A second pass on 22 November 2026 covered every field of `characters.json`,
`familiar-*.json` and `reference-lenses.json` that a reading can show (name,
source, description, source context, tradition, reviewed scenes and moves) and
added `hurt/comfort`, `ao3` and shipping tags: none occur. The closest thing that
could reach the screen was different: eight reference biographies describe
adult-industry work ("pornographic film actor", "adult model"), and a Classic
reading shows a chosen reference's source text under "Background". Those eight are
now excluded from new readings (`NEW_READING_EXCLUSIONS` in
`reference_retrieval.py`, tested in `test_tarot_reversals.py`).

The thin dialog the owner saw after selecting a card (one sentence and a fixed
"Upright" note) is replaced by the full card page.
