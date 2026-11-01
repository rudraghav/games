import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TarotReading } from '@/games/tarot/TarotReading';
import { tarotReadingCards, tarotReadingExample } from '@/stories/fixtures/tarot-reading';

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
