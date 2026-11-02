import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TarotReading } from '@/games/tarot/TarotReading';
import { tarotReadingCards, tarotReadingExample } from '@/stories/fixtures/tarot-reading';
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
    expect(html.match(/The grounded read/g)).toHaveLength(3);
    expect(html.match(/The plot twist/g)).toHaveLength(3);
    expect(html.match(/Your character energy/g)).toHaveLength(3);
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
    expect(html).not.toContain('Your character energy');
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
});
