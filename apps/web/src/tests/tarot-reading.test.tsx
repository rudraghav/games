import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ReadingSkeleton, TarotReading, readableCredit } from '@/games/tarot/TarotReading';
import { readingAsText } from '@/games/tarot/reading-text';
import { positionMeaning, spreadPositions } from '@/games/tarot/spread';
import { tarotReadingCards, tarotReadingExample } from '@/stories/fixtures/tarot-reading';
import { syntheticAstrologyReading } from '@/stories/fixtures/astrology';
import * as characterCatalogue from '@games/api-client/characters';
import type { TarotCharacter } from '@games/api-client/characters';

const originalCharacterLookup = characterCatalogue.tarotCharacter;

function referenceIdentity(character: TarotCharacter) {
  const { id, name, source, lane, aliases, sourceAliases } = character;
  return { id, name, source, lane, aliases, sourceAliases };
}

function sourcedArtwork(character: TarotCharacter) {
  return {
    ...referenceIdentity(character),
    imageType: 'character',
    origin: 'sourced',
    artworkVersion: 'character-art-v2',
    image: `/characters/character-art-v2/${character.id}.webp`,
    alt: `Character image of ${character.name} from ${character.source}`,
    width: 400,
    height: 500,
    bytes: 4000,
    sha256: '0'.repeat(64),
    credit: 'Character studio',
    sourcePage: `https://example.org/characters/${character.id}`,
    filePage: `https://example.org/characters/${character.id}#image`,
    remoteImage: `https://example.org/images/${character.id}.png`,
    rights: 'copyright-reference',
    rightsNote: 'Copyrighted character reference; no reuse license is asserted.',
  } satisfies TarotCharacter;
}

beforeEach(() => {
  vi.spyOn(characterCatalogue, 'tarotCharacter').mockImplementation((name, source) => {
    const character = originalCharacterLookup(name, source);
    return character ? sourcedArtwork(character) : undefined;
  });
});
afterEach(() => vi.restoreAllMocks());

describe('saved Tarot reading presentation', () => {
  it('keeps optional catalogue background collapsed and escapes it without changing the connection', () => {
    const evidence = 'Public context <not markup> & exact saved punctuation.';
    const reading = {
      ...tarotReadingExample,
      cards: tarotReadingExample.cards.map((card, index) => ({
        ...card,
        characters: card.characters.map((character, characterIndex) => ({
          ...character,
          ...(index === 0 && characterIndex === 0 ? { evidence } : {}),
        })),
      })),
    };
    const html = renderToStaticMarkup(<TarotReading reading={reading} cards={tarotReadingCards} />);
    expect(html.match(/class="tarot-character-evidence"/g)).toHaveLength(1);
    expect(html).toContain('<details class="tarot-character-evidence">');
    expect(html).toContain('Public context &lt;not markup&gt; &amp; exact saved punctuation.');
    expect(html).toContain(`Background for ${reading.cards[0].characters[0].name}`);
    expect(html.indexOf(reading.cards[0].characters[0].connection)).toBeLessThan(
      html.indexOf('class="tarot-character-evidence"'),
    );
    const legacy = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} />,
    );
    expect(legacy).not.toContain('tarot-character-evidence');
  });

  it('labels an artist’s work explicitly rather than presenting it as their portrait', () => {
    const work = {
      ...sourcedArtwork(originalCharacterLookup('Chihiro', 'Spirited Away')!),
      id: 'banksy',
      name: 'Banksy',
      source: 'Visual arts',
      kind: 'person',
      imageType: 'artwork',
      artworkTitle: 'Well Hung Lover',
      artworkAttributionUrl: 'https://example.org/work',
      alt: 'Well Hung Lover, a mural by Banksy; not a portrait of the artist',
    } satisfies TarotCharacter;
    vi.mocked(characterCatalogue.tarotCharacter).mockReturnValue(work);
    const html = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} />,
    );
    expect(html).toContain('Artwork reference');
    expect(html).toContain(work.artworkTitle);
    expect(html).toContain(work.alt);
    expect(html).not.toContain('Original illustration');
  });

  it.each(['religious_figure', 'meme'] as const)(
    'keeps a %s image tied to its exact source and subject',
    (kind) => {
      const reference = {
        ...sourcedArtwork(originalCharacterLookup('Chihiro', 'Spirited Away')!),
        id: `review-${kind}`,
        name: kind === 'meme' ? 'Confused Travolta' : 'Nataraja',
        source:
          kind === 'meme' ? 'Pulp Fiction — reaction meme' : 'Hindu tradition — Shiva as dancer',
        kind,
        imageType: kind,
        image: `/characters/reference-art-v1/review-${kind}.webp`,
        alt:
          kind === 'meme'
            ? 'Vincent Vega looking around in Pulp Fiction'
            : 'Nataraja, a traditional depiction of Shiva dancing',
      } satisfies TarotCharacter;
      vi.mocked(characterCatalogue.tarotCharacter).mockImplementation((name, source) =>
        name === reference.name && source === reference.source ? reference : undefined,
      );
      const reading = {
        ...tarotReadingExample,
        cards: [
          {
            ...tarotReadingExample.cards[0],
            characters: [
              {
                name: reference.name,
                source: reference.source,
                connection:
                  'The supplied scene or symbol offers a specific reflection on this moment.',
              },
            ],
          },
        ],
      };
      const html = renderToStaticMarkup(
        <TarotReading reading={reading} cards={tarotReadingCards} />,
      );
      expect(html).toContain(reference.image);
      expect(html).toContain(reference.alt);
      expect(html).toContain(reference.source);
      expect(html).not.toContain('Original illustration');
      expect(html).not.toContain('Chihiro');
    },
  );

  it('shows a real person as themselves with an exact identity and public-work source', () => {
    const person = {
      ...sourcedArtwork(originalCharacterLookup('Chihiro', 'Spirited Away')!),
      id: 'marie-curie',
      name: 'Marie Curie',
      source: 'Physics and chemistry',
      kind: 'person',
      imageType: 'person',
      image: '/characters/reference-art-v1/marie-curie.webp',
      alt: 'Portrait of Marie Curie',
      credit: 'Source portrait credit',
    } satisfies TarotCharacter;
    vi.mocked(characterCatalogue.tarotCharacter).mockImplementation((name, source) =>
      name === person.name && source === person.source ? person : undefined,
    );
    const reading = {
      ...tarotReadingExample,
      cards: [
        {
          ...tarotReadingExample.cards[0],
          characters: [
            {
              name: person.name,
              source: person.source,
              connection: 'Her sustained experimental work offers a metaphor for patient practice.',
            },
          ],
        },
      ],
    };
    const html = renderToStaticMarkup(<TarotReading reading={reading} cards={tarotReadingCards} />);
    expect(html).toContain('Your connections');
    expect(html).toContain('alt="Portrait of Marie Curie"');
    expect(html).toContain(person.image);
    expect(html).toContain('Physics and chemistry');
    expect(html).not.toContain('Chihiro');
    expect(html).not.toContain('performer');
  });

  it('shows all three perspectives and explained character connections for each selected card', () => {
    const reading = {
      ...tarotReadingExample,
      cards: tarotReadingExample.cards.map((card, index) => ({
        ...card,
        characters:
          index === 0
            ? [
                ...card.characters,
                {
                  name: 'Chihiro',
                  source: 'Spirited Away',
                  connection:
                    'Her first uncertain steps into an unfamiliar world mirror this card’s willingness to begin.',
                },
              ]
            : card.characters,
      })),
    };
    const html = renderToStaticMarkup(<TarotReading reading={reading} cards={tarotReadingCards} />);
    // With no question on the page the heading speaks to the spread in general.
    expect(html.match(/>What this card says</g)).toHaveLength(3);
    expect(html).not.toContain('The grounded read');
    expect(html.match(/The plot twist/g)).toHaveLength(3);
    expect(html.match(/Your connections/g)).toHaveLength(3);
    const asked = renderToStaticMarkup(
      <TarotReading reading={reading} cards={tarotReadingCards} question="How can I make room?" />,
    );
    expect(asked.match(/>What this card says about your question</g)).toHaveLength(3);
    // Reading order per card: what it says, then its figures, then the plot twist.
    const first = asked.slice(asked.indexOf('<article'), asked.indexOf('</article>'));
    expect(first.indexOf('What this card says about your question')).toBeLessThan(
      first.indexOf('Your connections'),
    );
    expect(first.indexOf('Your connections')).toBeLessThan(first.indexOf('The plot twist'));
    // These bounded WebPs must work through the Services public route without
    // depending on the unavailable root image-optimization endpoint.
    expect(html).not.toContain('/_next/image');
    for (const section of reading.cards) {
      for (const character of section.characters) {
        expect(html).toContain(character.name);
        expect(html).toContain(character.source);
      }
    }
  });

  it('preserves an older analogy without pretending missing quirky sections were written', () => {
    const reading = {
      ...tarotReadingExample,
      cards: tarotReadingExample.cards.map((card) => ({
        ...card,
        quirky_interpretation: null,
        characters: [],
        pop_culture: 'An earlier saved character analogy, kept exactly as written.',
      })),
    };
    const html = renderToStaticMarkup(<TarotReading reading={reading} cards={tarotReadingCards} />);
    expect(html.match(/An earlier saved character analogy/g)).toHaveLength(3);
    expect(html).not.toContain('The plot twist');
    expect(html).not.toContain('Your connections');
    expect(html).not.toContain('tarot-character-portrait');
    expect(html).not.toContain('Image credits');
  });

  it('shows the character with source credit without inventing a license or performer caption', () => {
    const portrait = sourcedArtwork(originalCharacterLookup('Chihiro', 'Spirited Away')!);
    const reading = {
      ...tarotReadingExample,
      cards: [
        {
          ...tarotReadingExample.cards[0],
          characters: [
            { name: 'Chihiro', source: 'Spirited Away', connection: 'A brave first step.' },
          ],
        },
      ],
    };
    const html = renderToStaticMarkup(<TarotReading reading={reading} cards={tarotReadingCards} />);
    expect(html.includes(portrait.image) || html.includes(encodeURIComponent(portrait.image))).toBe(
      true,
    );
    expect(html).toContain('alt="Character image of Chihiro Ogino from Spirited Away"');
    expect(html).not.toContain('Daveigh Chase');
    expect(html).not.toContain('<figcaption>');
    expect(html).toContain('Image credits');
    expect(html).toContain(portrait.filePage.replaceAll('&', '&amp;'));
    expect(html).toContain(portrait.rightsNote);
    expect(html).not.toContain('creativecommons.org');
    expect(html).toContain(portrait.credit.replaceAll('&', '&amp;'));
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('framed to 4:5 and converted to WebP');
    expect(html).not.toContain(portrait.remoteImage);
  });

  it('uses generated character art with the character alt and plain credits when there is no external source', () => {
    const link = originalCharacterLookup('Link', 'The Legend of Zelda')!;
    const illustration = {
      ...referenceIdentity(link),
      imageType: 'illustration',
      origin: 'generated',
      artworkVersion: 'illustrated-v1',
      image: '/characters/illustrated-v1/link.webp',
      alt: 'Illustration of Link',
      width: 400,
      height: 500,
      bytes: 4000,
      sha256: '0'.repeat(64),
      credit: 'Games character illustration',
    } satisfies TarotCharacter;
    vi.mocked(characterCatalogue.tarotCharacter).mockImplementation((name, source) => {
      const character = originalCharacterLookup(name, source);
      return character?.id === 'link'
        ? illustration
        : character
          ? sourcedArtwork(character)
          : undefined;
    });
    const reading = {
      ...tarotReadingExample,
      cards: [
        {
          ...tarotReadingExample.cards[0],
          characters: [
            {
              name: 'Link',
              source: 'The Legend of Zelda',
              connection: 'Try the next small quest.',
            },
            { name: 'Princess Peach', source: 'Super Mario', connection: 'Keep your own agency.' },
          ],
        },
      ],
    };
    const html = renderToStaticMarkup(<TarotReading reading={reading} cards={tarotReadingCards} />);
    expect(html).toContain('alt="Illustration of Link"');
    expect(html).toContain('<figcaption>Original illustration</figcaption>');
    expect(html).toContain('alt="Character image of Princess Peach from Super Mario"');
    expect(html).not.toContain('Cosplay');
    expect(html).not.toContain('Portrait of');
    expect(html).toContain('Link: Games character illustration');
    expect(html).toContain('Link:');
    expect(html).toContain('Princess Peach:');
  });

  it('retains genuine source licenses when character artwork includes one', () => {
    vi.mocked(characterCatalogue.tarotCharacter).mockImplementation((name, source) => {
      const character = originalCharacterLookup(name, source);
      return character
        ? {
            ...sourcedArtwork(character),
            rights: 'licensed',
            rightsNote: undefined,
            license: 'CC BY 4.0',
            licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
          }
        : undefined;
    });
    const html = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} />,
    );
    expect(html).toContain('CC BY 4.0');
    expect(html).toContain('href="https://creativecommons.org/licenses/by/4.0/"');
    expect(html).not.toContain('no reuse license is asserted');
  });

  it('never falls back to an actor or cosplay photo for a recognized character', () => {
    vi.mocked(characterCatalogue.tarotCharacter).mockImplementation((name, source) => {
      const character = originalCharacterLookup(name, source);
      return character
        ? {
            ...referenceIdentity(character),
            imageType: 'performer',
            image: `/characters/${character.id}.webp`,
            width: 400,
            height: 500,
            bytes: 4000,
            sha256: '0'.repeat(64),
            credit: 'Photo creator',
            performer: 'A performer',
            performerLabel: 'Portrayed by',
            license: 'CC BY 4.0',
            licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
            sourcePage: 'https://example.org/performer',
            filePage: 'https://example.org/performer#image',
            remoteImage: 'https://example.org/images/performer.png',
          }
        : undefined;
    });
    const html = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} />,
    );
    expect(html.match(/data-has-portrait="false"/g)).toHaveLength(3);
    expect(html).not.toContain('<img');
    expect(html).not.toContain('A performer');
    expect(html).not.toContain('Image credits');
    expect(html).toContain(tarotReadingExample.cards[0].characters[0].connection);
  });

  it('preserves unrecognized or mismatched saved references without attaching another face', () => {
    const reading = {
      ...tarotReadingExample,
      cards: [
        {
          ...tarotReadingExample.cards[0],
          characters: [
            {
              name: 'Michael Scott',
              source: 'Frozen',
              connection: 'Keep this earlier saved text.',
            },
            {
              name: 'A different Chihiro',
              source: 'Spirited Away',
              connection: 'Do not guess a face.',
            },
          ],
        },
      ],
    };
    const html = renderToStaticMarkup(<TarotReading reading={reading} cards={tarotReadingCards} />);
    expect(html).toContain('Keep this earlier saved text.');
    expect(html).toContain('Do not guess a face.');
    expect(html.match(/data-has-portrait="false"/g)).toHaveLength(2);
    expect(html).not.toContain('<img');
    expect(html).not.toContain('Image credits');
  });

  it('keeps distinct character artwork while deduplicating repeated character credits', () => {
    const characters = [
      { name: 'Joy', source: 'Inside Out', connection: 'Leave room for a little delight.' },
      {
        name: 'Leslie Knope',
        source: 'Parks and Recreation',
        connection: 'Make a plan with care.',
      },
      { name: 'Joy', source: 'Inside Out', connection: 'Carry that delight into your next step.' },
    ];
    const reading = {
      ...tarotReadingExample,
      cards: tarotReadingExample.cards.map((card, i) => ({ ...card, characters: [characters[i]] })),
    };
    const html = renderToStaticMarkup(<TarotReading reading={reading} cards={tarotReadingCards} />);
    expect(html.match(/alt="Character image of Joy from Inside Out"/g)).toHaveLength(2);
    expect(html).toContain('alt="Character image of Leslie Knope from Parks and Recreation"');
    expect(html).toContain('/character-art-v2/joy.webp');
    expect(html).toContain('/character-art-v2/leslie-knope.webp');
    const credits = html.slice(html.indexOf('<details'), html.indexOf('</details>'));
    expect(credits.match(/Joy:/g)).toHaveLength(1);
    expect(credits.match(/Leslie Knope:/g)).toHaveLength(1);
    expect(credits.match(/<li>/g)).toHaveLength(2);
  });

  it('renders generated text as text rather than executable markup', () => {
    const reading = {
      ...tarotReadingExample,
      next_step: '<script>window.untrusted = true</script>',
    };
    const html = renderToStaticMarkup(<TarotReading reading={reading} cards={tarotReadingCards} />);
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>');
  });

  it('shows each discussed card beside its section heading', () => {
    const html = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} />,
    );
    expect(html.match(/class="tarot-reading-card-heading"/g)).toHaveLength(3);
    // Each thumbnail is a button that opens the full card. Its hover preview replaces the
    // plain tooltip, so the two never show together.
    for (const card of tarotReadingCards)
      expect(html).toContain(
        `<button class="tarot-card tarot-card--compact" aria-label="View ${card.label} card" type="button"`,
      );
    expect(html).not.toContain('data-tip="Open the full card"');
  });

  it('states each position, what it asks and that the card is upright', () => {
    const html = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} />,
    );
    for (const meaning of spreadPositions.map((position) => position.meaning))
      expect(html).toContain(`<span>Upright</span>${meaning}</p>`);
    expect(positionMeaning('An older saved position')).toBeUndefined();
  });

  it('opens with a short summary only where the page asks for one', () => {
    const plain = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} />,
    );
    expect(plain).not.toContain('tarot-summary');
    const html = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} summary />,
    );
    expect(html.indexOf('In short')).toBeLessThan(html.indexOf('<article'));
    expect(html).toContain(`<p class="tarot-summary-lead">${tarotReadingExample.introduction}</p>`);
    // The summary repeats the step once; the closing block stays the single full version.
    expect(html.match(/class="tarot-next-step"/g)).toHaveLength(1);
    expect(html.split(tarotReadingExample.next_step)).toHaveLength(3);
    for (const card of tarotReadingCards) {
      expect(html).toContain(`href="#reading-${card.id}"`);
      expect(html).toContain(`<article id="reading-${card.id}">`);
    }
    expect(html.match(/<article/g)).toHaveLength(3);
  });

  it('offers the saved copy only when the page knows where it lives', () => {
    const plain = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} />,
    );
    expect(plain).toContain('Copy reading');
    expect(plain).not.toContain('Saved reading');
    const html = renderToStaticMarkup(
      <TarotReading
        reading={tarotReadingExample}
        cards={tarotReadingCards}
        savedHref="/games/tarot/readings/example"
      />,
    );
    expect(html).toContain('href="/games/tarot/readings/example"');
    // Share appears only after the browser reports a share sheet.
    expect(html).not.toContain('>Share<');
  });

  it('copies the reading as plain text with the question, positions and one next step', () => {
    const text = readingAsText({
      reading: {
        ...tarotReadingExample,
        cards: tarotReadingExample.cards.map((card, index) =>
          index === 1 ? { ...card, title: 'A spark that wants an outlet' } : card,
        ),
      },
      cards: tarotReadingCards,
      question: '  How can I make room for a hobby?  ',
    });
    const blocks = text.split('\n\n');
    expect(blocks[0]).toBe(tarotReadingExample.title);
    expect(blocks[1]).toBe('Question: How can I make room for a hobby?');
    expect(blocks[2]).toBe(`In short: ${tarotReadingExample.introduction}`);
    const fool = tarotReadingExample.cards[0];
    expect(blocks[3]).toBe(
      [
        '1. Where you are: The Fool (upright)',
        fool.interpretation,
        `${fool.characters[0].name} (${fool.characters[0].source}): ${fool.characters[0].connection}`,
        `Plot twist: ${fool.quirky_interpretation}`,
      ].join('\n'),
    );
    expect(blocks[4].split('\n').slice(0, 2)).toEqual([
      '2. What is shifting: Ace of Wands (upright)',
      'A spark that wants an outlet',
    ]);
    expect(blocks.at(-2)).toBe(`Next small move: ${tarotReadingExample.next_step}`);
    expect(blocks.at(-1)).toBe('A playful reflection, not a prediction.');
    // Portraits, credits and the chart drawing stay on the page.
    expect(text).not.toContain('Image credits');
    expect(readingAsText({ reading: tarotReadingExample, cards: tarotReadingCards })).not.toContain(
      'Question:',
    );
  });

  it('copies each figure, what its move means for the question and any chart perspective', () => {
    const scene = 'She opens a small library for children in her home county.';
    const bridge =
      'For your question, that could look like leaving the sketchbook open on the kitchen table. Then the hobby is already in your hands when a free ten minutes turns up.';
    const reading = {
      ...tarotReadingExample,
      astrology: syntheticAstrologyReading,
      cards: tarotReadingExample.cards.map((card) => ({
        ...card,
        pop_culture: bridge,
        characters: [
          {
            ...card.characters[0],
            evidence: scene,
            connection: 'Put the supplies straight into someone’s hands.',
          },
        ],
      })),
    };
    const text = readingAsText({
      reading,
      cards: tarotReadingCards,
      question: 'Room for a hobby?',
    });
    const first = text.split('\n\n')[3].split('\n');
    expect(first.slice(2)).toEqual([
      'Michael Scott (The Office): Put the supplies straight into someone’s hands.',
      `What this means for your question: ${bridge}`,
      `Plot twist: ${tarotReadingExample.cards[0].quirky_interpretation}`,
    ]);
    // The scene is the portrait's caption on the page, not part of the copied reading.
    expect(text).not.toContain(scene);
    const { interpretation } = syntheticAstrologyReading;
    expect(text).toContain(`Western perspective\n${interpretation.western!.normal}`);
    expect(text).toContain(`How it meets your cards: ${interpretation.tarot_connection}`);
    expect(text.split('\n\n').at(-2)).toBe(`From your chart: ${interpretation.next_step}`);
    // With no question the bridge speaks to the spread in general.
    expect(readingAsText({ reading, cards: tarotReadingCards })).toContain(
      `What this could mean for you: ${bridge}`,
    );
  });

  it('puts what a Fun figure means for the question right after its move', () => {
    const bridge =
      'For your question, that could look like asking your teacher for one small brief. Then there is a real request to finish for.';
    const fun = {
      ...tarotReadingExample,
      cards: tarotReadingExample.cards.map((card) => ({
        ...card,
        pop_culture: bridge,
        characters: [
          {
            ...card.characters[0],
            evidence: 'A reviewed scene from the source.',
            connection: 'Ask someone for a small brief.',
          },
        ],
      })),
    };
    const html = renderToStaticMarkup(
      <TarotReading
        reading={fun}
        readingStyle="fun"
        cards={tarotReadingCards}
        question="What is getting in my way?"
      />,
    );
    expect(html.match(/<h5>What this means for your question<\/h5>/g)).toHaveLength(3);
    expect(html.match(/class="tarot-figure-bridge"/g)).toHaveLength(3);
    const first = html.slice(html.indexOf('<article'), html.indexOf('</article>'));
    const order = [
      'What this card says about your question',
      'How it could play out',
      'A reviewed scene from the source.',
      '<p>Ask someone for a small brief.</p>',
      'What this means for your question',
      bridge,
      'The plot twist',
    ].map((part) => first.indexOf(part));
    expect(order.every((position) => position >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    // The move stays the only direct paragraph of the figure's copy.
    expect(first.match(/class="tarot-character-copy"><p>/g)).toHaveLength(1);
    const blank = renderToStaticMarkup(
      <TarotReading reading={fun} readingStyle="fun" cards={tarotReadingCards} />,
    );
    expect(blank.match(/<h5>What this could mean for you<\/h5>/g)).toHaveLength(3);
    expect(blank).not.toContain('What this means for your question');
    expect(blank).not.toContain('about your question');
  });

  it('renders a reading saved before the bridge exactly as it was', () => {
    const older = {
      ...tarotReadingExample,
      cards: tarotReadingExample.cards.map((card) => ({
        ...card,
        interpretation: 'What competing ideas are currently vying for attention in your mind?',
        characters: [{ ...card.characters[0], evidence: 'A reviewed scene from the source.' }],
      })),
    };
    const fun = renderToStaticMarkup(
      <TarotReading reading={older} readingStyle="fun" cards={tarotReadingCards} question="Why?" />,
    );
    expect(fun).not.toContain('tarot-figure-bridge');
    expect(fun.match(/The grounded read/g)).toHaveLength(3);
    const first = fun.slice(fun.indexOf('<article'), fun.indexOf('</article>'));
    // The portrait led the card, then the grounded read and the plot twist together.
    expect(first.indexOf('How it could play out')).toBeLessThan(first.indexOf('The grounded read'));
    expect(first.indexOf('The grounded read')).toBeLessThan(first.indexOf('The plot twist'));
    expect(first.match(/class="tarot-perspectives"/g)).toHaveLength(1);
    // An older Classic reading that only asked keeps its own heading too.
    const classic = renderToStaticMarkup(
      <TarotReading reading={older} cards={tarotReadingCards} question="Why?" />,
    );
    expect(classic.match(/The grounded read/g)).toHaveLength(3);
    expect(classic).not.toContain('What this card says');
  });

  it('shows the shape of a reading while a saved view opens', () => {
    const waiting = renderToStaticMarkup(<ReadingSkeleton label="Opening your reading…" />);
    expect(waiting).toContain('role="status"');
    expect(waiting).toContain('<span class="sr-only">Opening your reading…</span>');
    // Beside another status line, the placeholder is decoration only.
    const quiet = renderToStaticMarkup(<ReadingSkeleton />);
    expect(quiet).toContain('aria-hidden="true"');
    expect(quiet).not.toContain('role="status"');
    for (const html of [waiting, quiet]) expect(html).not.toContain('class="tarot-reading"');
  });

  it('ends with one next move that folds in the chart advice', () => {
    const reading = { ...tarotReadingExample, astrology: syntheticAstrologyReading };
    const html = renderToStaticMarkup(<TarotReading reading={reading} cards={tarotReadingCards} />);
    expect(html.match(/class="tarot-next-step"/g)).toHaveLength(1);
    expect(html).not.toContain('A small next move');
    expect(html).toContain('From your chart:');
    expect(html).toContain(syntheticAstrologyReading.interpretation.next_step);
  });

  it('reads raw source URLs in credits as their site name', () => {
    expect(readableCredit('http://www.nbc.com/The_Office/images/office_michael_1024x78.jpg')).toBe(
      'nbc.com',
    );
    expect(
      readableCredit(
        'Cropped and reduced from image at http://killing-eve.wikia.com/wiki/Villanelle',
      ),
    ).toBe('Cropped and reduced from image at killing-eve.wikia.com');
    expect(readableCredit('Phantom Films; film still')).toBe('Phantom Films; film still');
  });
});
