import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TarotCard } from '@games/ui';
import { mapCard } from '@games/api-client/mappers';
import { tarotCardGuide } from '@games/api-client/card-guide';
import { TarotReading } from '@/games/tarot/TarotReading';
import { TarotCardPage } from '@/games/tarot/TarotCardPage';
import {
  galleryCards,
  galleryNeighbour,
  galleryStep,
  gallerySuits,
} from '@/games/tarot/TarotDeckGallery';
import { readingAsText } from '@/games/tarot/reading-text';
import { nameWithOrientation, orientationOf } from '@/games/tarot/orientation';
import { tarotReadingCards, tarotReadingExample } from '@/stories/fixtures/tarot-reading';

const visibleText = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

// The middle card was drawn reversed: saved with its section and shown on its card.
const reversedReading = {
  ...tarotReadingExample,
  cards: tarotReadingExample.cards.map((card, index) => ({
    ...card,
    orientation: index === 1 ? ('reversed' as const) : ('upright' as const),
  })),
};
const reversedCards = tarotReadingCards.map((card, index) => ({
  ...card,
  orientation: index === 1 ? ('reversed' as const) : ('upright' as const),
  subtitle: tarotCardGuide(card.id)![index === 1 ? 'reversed' : 'upright'].short,
}));

describe('a card drawn reversed', () => {
  it('turns only the picture, keeps the name upright and says Reversed in words', () => {
    const upright = renderToStaticMarkup(<TarotCard id="wands-01" name="Ace of Wands" />);
    const reversed = renderToStaticMarkup(<TarotCard id="wands-01" name="Ace of Wands" reversed />);
    expect(upright).not.toContain('tarot-card--reversed');
    expect(upright).not.toContain('Reversed');
    expect(upright).toContain('aria-label="Ace of Wands"');
    expect(reversed).toContain('class="tarot-card tarot-card--reversed"');
    expect(reversed).toContain('aria-label="Ace of Wands, reversed"');
    // The name plate is the same element with the same text; the word sits beside it.
    expect(reversed).toContain(
      '<span class="tarot-name">Ace of Wands</span><span class="tarot-reversed-word">Reversed</span>',
    );
    const button = renderToStaticMarkup(
      <TarotCard
        id="wands-01"
        name="Ace of Wands"
        label="View Ace of Wands card"
        reversed
        onClick={() => {}}
      />,
    );
    expect(button).toContain('aria-label="View Ace of Wands card, reversed"');
    // A face-down back never carries an orientation, whatever it is passed.
    const back = renderToStaticMarkup(<TarotCard reversed />);
    expect(back).not.toContain('reversed');
    expect(back).not.toContain('Reversed');
  });

  it('reads orientation from the wire card and treats anything older as upright', () => {
    const wire = {
      id: 'wands-01',
      label: 'Ace of Wands',
      color: 'wands',
      subtitle: '',
      value: '1',
      suit: 'wands',
    };
    expect(mapCard({ ...wire, orientation: 'reversed' }).orientation).toBe('reversed');
    expect(mapCard({ ...wire, orientation: 'upright' }).orientation).toBe('upright');
    // Other games' cards keep the shape they had: no orientation key at all.
    expect('orientation' in mapCard(wire)).toBe(false);
    expect('orientation' in mapCard({ ...wire, orientation: null })).toBe(false);
    expect(() => mapCard({ ...wire, orientation: 'sideways' as never })).toThrow();
    expect(orientationOf(mapCard(wire))).toBe('upright');
    expect(orientationOf({ orientation: 'reversed' })).toBe('reversed');
    expect(orientationOf({ orientation: 'sideways' })).toBe('upright');
    expect(orientationOf(undefined)).toBe('upright');
    expect(nameWithOrientation('Ace of Wands', 'reversed')).toBe('Ace of Wands, reversed');
    expect(nameWithOrientation('Ace of Wands', 'upright')).toBe('Ace of Wands');
  });

  it('is named reversed in the summary, the card heading, the thumbnail and the meaning', () => {
    const html = renderToStaticMarkup(
      <TarotReading reading={reversedReading} cards={reversedCards} summary cardMeanings />,
    );
    // Jump list: the word, not just a turned picture.
    expect(html).toContain(
      '<strong>Ace of Wands<span class="tarot-summary-reversed"> · Reversed</span></strong>',
    );
    expect(html).toContain('<strong>The Fool</strong>');
    // Per-card heading: the orientation pill is real.
    expect(
      html.match(/<p class="tarot-position-meaning" data-orientation="(\w+)"><span>(\w+)<\/span>/g),
    ).toEqual([
      '<p class="tarot-position-meaning" data-orientation="upright"><span>Upright</span>',
      '<p class="tarot-position-meaning" data-orientation="reversed"><span>Reversed</span>',
      '<p class="tarot-position-meaning" data-orientation="upright"><span>Upright</span>',
    ]);
    expect(html).toContain('aria-label="View Ace of Wands card, reversed"');
    expect(html).toContain('aria-label="View The Fool card"');
    expect(html.match(/tarot-card--reversed/g)).toHaveLength(1);
    // The title equals the card name here, so the eyebrow carries the word on its own.
    expect(visibleText(html)).toContain('What is shifting · Reversed');
    // The Classic view's card meaning is the reversed line, never the upright one.
    expect(html).toContain(tarotCardGuide('wands-01')!.reversed.short);
    expect(html).not.toContain(tarotCardGuide('wands-01')!.upright.short);
  });

  it('falls back to the drawn card for a reading saved before sections carried orientation', () => {
    const html = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={reversedCards} />,
    );
    expect(html).toContain('data-orientation="reversed"><span>Reversed</span>');
    const upright = renderToStaticMarkup(
      <TarotReading reading={tarotReadingExample} cards={tarotReadingCards} />,
    );
    expect(upright).not.toContain('Reversed');
    expect(upright).not.toContain('tarot-card--reversed');
  });

  it('is copied and shared as (reversed)', () => {
    const text = readingAsText({ reading: reversedReading, cards: reversedCards });
    expect(text).toContain('1. Where you are: The Fool (upright)');
    expect(text).toContain('2. What is shifting: Ace of Wands (reversed)');
    expect(text).toContain('3. Your next move: Strength (upright)');
    // The saved section wins over the card list; an older section uses the card.
    expect(readingAsText({ reading: reversedReading, cards: tarotReadingCards })).toContain(
      'Ace of Wands (reversed)',
    );
    expect(readingAsText({ reading: tarotReadingExample, cards: reversedCards })).toContain(
      'Ace of Wands (reversed)',
    );
    expect(readingAsText({ reading: tarotReadingExample, cards: tarotReadingCards })).not.toContain(
      'reversed',
    );
  });
});

describe('card pages', () => {
  it('opens a drawn card on the side it was drawn, with its position, and still offers both', async () => {
    // The guide loads on demand: the first render shows the loading line.
    const loading = renderToStaticMarkup(<TarotCardPage cardId="wands-01" />);
    expect(visibleText(loading)).toBe('Opening the card…');
    await import('@/games/tarot/TarotCardGuide');
    await new Promise((resolve) => setTimeout(resolve, 0));
    const drawn = renderToStaticMarkup(
      <TarotCardPage cardId="wands-01" orientation="reversed" position="What is shifting" />,
    );
    expect(drawn).toContain('data-card="wands-01" data-orientation="reversed"');
    expect(drawn).toContain('class="tarot-guide-card" data-reversed="true"');
    expect(visibleText(drawn)).toContain('Drawn as What is shifting');
    expect(visibleText(drawn)).toContain('Shown reversed');
    for (const side of ['upright', 'reversed'] as const)
      expect(drawn).toContain(tarotCardGuide('wands-01')![side].meaning);
    // From the gallery there is no draw: the page opens upright with no position line.
    const browsed = renderToStaticMarkup(<TarotCardPage cardId="wands-01" />);
    expect(browsed).toContain('data-card="wands-01" data-orientation="upright"');
    expect(visibleText(browsed)).not.toContain('Drawn as');
  });

  it('lists the gallery in printed order under each suit filter', () => {
    expect(gallerySuits.map((suit) => suit.label)).toEqual([
      'All 78',
      'Major arcana',
      'Wands',
      'Cups',
      'Swords',
      'Pentacles',
    ]);
    const all = galleryCards();
    expect(all).toHaveLength(78);
    expect(all[0]).toEqual({ id: 'major-00', name: 'The Fool' });
    expect(new Set(all.map((card) => card.id)).size).toBe(78);
    expect(galleryCards('major')).toHaveLength(22);
    for (const suit of ['wands', 'cups', 'swords', 'pentacles'] as const) {
      const cards = galleryCards(suit);
      expect(cards).toHaveLength(14);
      expect(cards.map((card) => card.id)).toEqual(
        Array.from({ length: 14 }, (_, rank) => `${suit}-${String(rank + 1).padStart(2, '0')}`),
      );
    }
    // Every gallery card has a page to open.
    for (const card of all) expect(tarotCardGuide(card.id)?.name).toBe(card.name);
  });

  it('moves through the grid with arrow keys, Home and End, and wraps Previous / Next', () => {
    // 14 cards, 4 to a row: rows of 4, 4, 4, 2.
    expect(galleryStep('ArrowRight', 0, 14, 4)).toBe(1);
    expect(galleryStep('ArrowRight', 13, 14, 4)).toBe(13);
    expect(galleryStep('ArrowLeft', 0, 14, 4)).toBe(0);
    expect(galleryStep('ArrowLeft', 5, 14, 4)).toBe(4);
    expect(galleryStep('ArrowDown', 1, 14, 4)).toBe(5);
    expect(galleryStep('ArrowDown', 9, 14, 4)).toBe(13);
    // Below the last full row there is no card: land on the last one. On the last row, stay.
    expect(galleryStep('ArrowDown', 11, 14, 4)).toBe(13);
    expect(galleryStep('ArrowDown', 12, 14, 4)).toBe(12);
    expect(galleryStep('ArrowUp', 5, 14, 4)).toBe(1);
    expect(galleryStep('ArrowUp', 2, 14, 4)).toBe(2);
    expect(galleryStep('Home', 9, 14, 4)).toBe(0);
    expect(galleryStep('End', 2, 14, 4)).toBe(13);
    expect(galleryStep('Enter', 2, 14, 4)).toBeNull();
    expect(galleryStep('a', 2, 14, 4)).toBeNull();
    expect(galleryNeighbour(0, 14, -1)).toBe(13);
    expect(galleryNeighbour(13, 14, 1)).toBe(0);
    expect(galleryNeighbour(4, 14, 1)).toBe(5);
  });
});
