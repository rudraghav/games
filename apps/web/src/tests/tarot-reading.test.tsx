import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TarotReading } from '@/games/tarot/TarotReading';
import { tarotReadingCards, tarotReadingExample } from '@/stories/fixtures/tarot-reading';
import { tarotCharacter } from '@games/api-client/characters';

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

  it('identifies a local licensed performer portrait and exposes its source and license', () => {
    const portrait = tarotCharacter('Chihiro', 'Spirited Away')!;
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
    expect(html).toContain('alt="Portrait of Daveigh Chase"');
    expect(html).toContain('English voice by Daveigh Chase');
    expect(html).toContain('Image credits');
    expect(html).toContain(portrait.filePage.replaceAll('&', '&amp;'));
    expect(html).toContain(portrait.licenseUrl);
    expect(html).toContain(portrait.license);
    expect(html).toContain(portrait.credit.replaceAll('&', '&amp;'));
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('resized and converted to WebP');
    expect(html).not.toContain(portrait.remoteImage);
  });

  it('labels cosplay as cosplay rather than a performer or an official character still', () => {
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
    expect(html).toContain('alt="Cosplay depiction of Link"');
    expect(html).toContain('alt="Cosplay depiction of Princess Peach"');
    expect(html.match(/<figcaption>Cosplay photo<\/figcaption>/g)).toHaveLength(2);
    expect(html).not.toContain('Portrait of Cosplayer');
    expect(html).toContain('Link:');
    expect(html).toContain('Princess Peach:');
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

  it('credits distinct characters sharing a performer while deduplicating repeated character credits', () => {
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
    expect(html.match(/alt="Portrait of Amy Poehler"/g)).toHaveLength(3);
    expect(html.match(/Voiced by Amy Poehler/g)).toHaveLength(2);
    expect(html).toContain('Portrayed by Amy Poehler');
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
