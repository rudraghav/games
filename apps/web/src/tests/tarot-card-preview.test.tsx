import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { tarotCardGuide } from '@games/api-client/card-guide';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { tarotReadingCards, tarotReadingExample } from '@/stories/fixtures/tarot-reading';
import {
  PREVIEW_GAP,
  PREVIEW_MARGIN,
  TarotCardPreview,
  TarotCardPreviewPanel,
  placePreview,
  tarotPreviewContent,
  type PreviewLayout,
} from '@/games/tarot/TarotCardPreview';
import { TarotReading } from '@/games/tarot/TarotReading';
import { TarotTable } from '@/games/tarot/TarotTable';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/games/tarot/play/preview',
}));

const visibleText = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const ace = tarotCardGuide('wands-01')!;

describe('what a drawn card’s preview says', () => {
  it('gives the drawn side’s keywords and one-line meaning, with the essence', () => {
    const upright = tarotPreviewContent(ace, 'upright');
    const reversed = tarotPreviewContent(ace, 'reversed');
    expect(upright.name).toBe('Ace of Wands');
    expect(upright.family).toBe(`Suit of Wands · ${ace.number_label}`);
    expect(tarotPreviewContent(tarotCardGuide('major-13')!).family).toBe('Major Arcana · XIII');
    expect(upright.short).toBe(ace.upright.short);
    expect(reversed.short).toBe(ace.reversed.short);
    expect(upright.short).not.toBe(reversed.short);
    // A handful of keywords from the drawn side only; the card's page lists every one.
    for (const [content, side] of [
      [upright, ace.upright],
      [reversed, ace.reversed],
    ] as const) {
      expect(content.keywords.length).toBeGreaterThanOrEqual(3);
      expect(content.keywords.length).toBeLessThanOrEqual(5);
      expect(content.keywords).toEqual(side.keywords.slice(0, 5));
      // The same extra line in words, for the card's accessible description.
      expect(content.description).toBe(`Keywords: ${content.keywords.join(', ')}. ${side.short}`);
    }
    expect(upright.essence).toBe(ace.essence);
    expect(reversed.essence).toBe(ace.essence);
  });

  it('shows the picture as drawn, the position and the orientation in words', () => {
    const upright = renderToStaticMarkup(
      <TarotCardPreviewPanel guide={ace} orientation="upright" position="Where you are" />,
    );
    const reversed = renderToStaticMarkup(
      <TarotCardPreviewPanel guide={ace} orientation="reversed" position="What is shifting" />,
    );
    // Supplementary: a tooltip, never a dialog, and the picture is decoration.
    expect(upright).toContain('role="tooltip"');
    expect(upright).not.toContain('role="dialog"');
    expect(upright).toContain('<div class="tarot-preview-stage" aria-hidden="true">');
    expect(upright).not.toContain('<button');
    expect(upright).toContain('data-orientation="upright"');
    expect(reversed).toContain('data-orientation="reversed"');
    // Only the picture turns; the name stays upright and the word says so.
    expect(upright).not.toContain('tarot-card--reversed');
    expect(reversed).toContain('class="tarot-card tarot-card--reversed"');
    expect(reversed).toContain(
      '<span class="tarot-name">Ace of Wands</span><span class="tarot-reversed-word">Reversed</span>',
    );
    expect(upright).toContain('<span class="tarot-preview-orientation">Upright</span>');
    expect(reversed).toContain('<span class="tarot-preview-orientation">Reversed</span>');
    expect(visibleText(upright)).toContain('Drawn as Where you are');
    expect(visibleText(reversed)).toContain('Drawn as What is shifting');
    for (const [html, side, other] of [
      [upright, ace.upright, ace.reversed],
      [reversed, ace.reversed, ace.upright],
    ] as const) {
      const text = visibleText(html);
      expect(text).toContain(`Suit of Wands · ${ace.number_label}`);
      expect(text).toContain(side.short);
      expect(text).toContain(ace.essence);
      expect(html.match(/<li>/g)).toHaveLength(Math.min(5, side.keywords.length));
      for (const keyword of side.keywords.slice(0, 5))
        expect(html).toContain(`<li>${keyword}</li>`);
      // Never the other side's line.
      expect(text).not.toContain(other.short);
      expect(text.endsWith('Click for the full card')).toBe(true);
    }
  });

  it('leaves love, work, advice, symbols and the rest to the full card page', () => {
    for (const orientation of ['upright', 'reversed'] as const) {
      const html = renderToStaticMarkup(
        <TarotCardPreviewPanel guide={ace} orientation={orientation} position="Your next move" />,
      );
      for (const side of [ace.upright, ace.reversed])
        for (const kept of [side.meaning, side.love, side.work, side.self, side.advice])
          expect(html).not.toContain(kept);
      expect(html).not.toContain(ace.figure);
      for (const symbol of ace.symbols) expect(html).not.toContain(symbol.meaning);
      for (const question of ace.questions) expect(html).not.toContain(question);
      for (const item of Object.values(ace.correspondences)) expect(html).not.toContain(item.gloss);
      for (const heading of ['In love', 'In work', 'Try this', 'Symbols'])
        expect(html).not.toContain(heading);
    }
  });
});

describe('where the preview goes', () => {
  const sizes: Record<PreviewLayout, { width: number; height: number }> = {
    side: { width: 640, height: 430 },
    stack: { width: 400, height: 390 },
    compact: { width: 400, height: 320 },
  };
  const measured: [PreviewLayout, number][] = [];
  const measure = (layout: PreviewLayout, maxWidth: number) => {
    measured.push([layout, maxWidth]);
    return { width: Math.min(sizes[layout].width, maxWidth), height: sizes[layout].height };
  };
  const place = (
    anchor: { left: number; top: number; width: number; height: number },
    viewport: { width: number; height: number },
  ) => {
    measured.length = 0;
    const box = {
      left: anchor.left,
      top: anchor.top,
      right: anchor.left + anchor.width,
      bottom: anchor.top + anchor.height,
    };
    const placement = placePreview(box, viewport, measure);
    const size = measured.findLast(([layout]) => layout === placement.layout)!;
    const width = Math.min(sizes[placement.layout].width, size[1]);
    const height = placement.maxHeight ?? sizes[placement.layout].height;
    const panel = {
      left: placement.left,
      top: placement.top,
      right: placement.left + width,
      bottom: placement.top + height,
    };
    // Always inside the viewport and never over the card, with the promised gap.
    expect(panel.left).toBeGreaterThanOrEqual(PREVIEW_MARGIN);
    expect(panel.top).toBeGreaterThanOrEqual(PREVIEW_MARGIN);
    expect(panel.right).toBeLessThanOrEqual(viewport.width - PREVIEW_MARGIN);
    expect(panel.bottom).toBeLessThanOrEqual(viewport.height - PREVIEW_MARGIN);
    const clear = Math.max(
      panel.left - box.right,
      box.left - panel.right,
      panel.top - box.bottom,
      box.top - panel.bottom,
    );
    expect(clear).toBeGreaterThanOrEqual(PREVIEW_GAP);
    return placement;
  };
  const desktop = { width: 1440, height: 900 };

  it('sits to the right of the card on a wide screen, or to the left without room', () => {
    const first = place({ left: 392, top: 270, width: 190, height: 285 }, desktop);
    expect(first).toMatchObject({ layout: 'side', side: 'right', left: 392 + 190 + PREVIEW_GAP });
    expect(first.maxHeight).toBeUndefined();
    const third = place({ left: 858, top: 270, width: 190, height: 285 }, desktop);
    expect(third).toMatchObject({ layout: 'side', side: 'left', left: 858 - PREVIEW_GAP - 640 });
    // The middle card has a little less than the full width on its right: the panel narrows.
    const middle = place({ left: 625, top: 270, width: 190, height: 285 }, desktop);
    expect(middle).toMatchObject({ layout: 'side', side: 'right' });
    expect(middle.maxWidth).toBeLessThan(640);
    expect(middle.maxWidth).toBeGreaterThanOrEqual(500);
  });

  it('is centred on the card and kept inside the top and bottom edges', () => {
    const centred = place({ left: 392, top: 300, width: 190, height: 285 }, desktop);
    expect(centred.top).toBe(300 + 285 / 2 - 430 / 2);
    expect(place({ left: 392, top: 20, width: 190, height: 285 }, desktop).top).toBe(
      PREVIEW_MARGIN,
    );
    expect(place({ left: 392, top: 700, width: 110, height: 165 }, desktop).top).toBe(
      900 - PREVIEW_MARGIN - 430,
    );
  });

  it('goes above or below the card in a narrow window', () => {
    const phone = { width: 390, height: 844 };
    const high = place({ left: 22, top: 258, width: 108, height: 163 }, phone);
    expect(high).toMatchObject({ layout: 'stack', side: 'below', left: PREVIEW_MARGIN });
    expect(high.maxWidth).toBe(390 - PREVIEW_MARGIN * 2);
    const low = place({ left: 260, top: 560, width: 108, height: 163 }, phone);
    expect(low).toMatchObject({ layout: 'stack', side: 'above' });
    expect(low.top).toBe(560 - PREVIEW_GAP - 390);
    // Neither side has the full height: the shorter version, before anything is cut.
    const middle = place({ left: 140, top: 380, width: 108, height: 163 }, phone);
    expect(middle.layout).toBe('compact');
    expect(middle.maxHeight).toBeUndefined();
    // A very short window: the shorter version on the roomier side, cut to fit.
    const short = place(
      { left: 140, top: 150, width: 108, height: 163 },
      { width: 390, height: 520 },
    );
    expect(short).toMatchObject({ layout: 'compact', side: 'below' });
    expect(short.maxHeight).toBe(520 - PREVIEW_MARGIN - (150 + 163 + PREVIEW_GAP));
  });

  it('uses the narrow layout beside the card when only that fits', () => {
    // 1100 wide: the middle card has under 500px on either side and little height above or below.
    const middle = place(
      { left: 455, top: 270, width: 190, height: 285 },
      { width: 1100, height: 760 },
    );
    expect(middle).toMatchObject({ layout: 'stack', side: 'right', maxWidth: 400 });
  });
});

describe('a drawn card on the table', () => {
  const fixture = fixtures.find(
    (item) => item.room.game_id === 'tarot' && item.room.game?.phase === 'choosing',
  )!;
  const room = mapRoom(fixture.room);
  const short = ace.reversed.short;
  const choosing = {
    ...room.game!,
    community: [
      { ...room.game!.community[0], id: 'wands-01', label: 'Ace of Wands', subtitle: short },
    ].map((card) => ({ ...card, orientation: 'reversed' as const })),
  };

  function table() {
    const cache = new QueryClient();
    const html = renderToStaticMarkup(
      <QueryClientProvider client={cache}>
        <TarotTable
          match={choosing as never}
          room={room}
          selfId={fixture.selfId}
          onAction={() => {}}
          pending={false}
        />
      </QueryClientProvider>,
    );
    cache.clear();
    return html;
  }

  it('is a View card button while the other cards are still being chosen', () => {
    const html = table();
    expect(html).toContain('data-phase="choosing"');
    const spread = html.slice(html.indexOf('class="tarot-spread"'));
    const button = spread.match(/<button class="tarot-card[^>]*>/)![0];
    expect(button).toContain('class="tarot-card tarot-card--reversed"');
    expect(button).toContain('aria-label="View Ace of Wands card, reversed"');
    expect(button).toContain('type="button"');
    expect(button).not.toContain('disabled');
    // The preview replaces the plain tooltip: never two popups for one card.
    expect(button).not.toContain('data-tip');
    expect(spread.match(/<button class="tarot-card/g)).toHaveLength(1);
    // The slot the reveal focuses is unchanged.
    expect(spread).toContain(
      '<div class="tarot-spread-slot" tabindex="-1" data-orientation="reversed" aria-label="Card 1, Where you are: Ace of Wands, reversed.',
    );
    // The card points at one extra line; before the guide loads it is the drawn meaning.
    const describedBy = button.match(/aria-describedby="([^"]+)"/)![1];
    expect(spread).toContain(`<span id="${describedBy}" hidden="">${short}</span>`);
    // Nothing floats until a mouse rests on the card or keyboard focus reaches it.
    expect(html).not.toContain('tarot-preview"');
    expect(html).not.toContain('role="tooltip"');
  });

  it('wraps a card without changing it when there is nothing to preview', () => {
    const plain = renderToStaticMarkup(
      <TarotCardPreview className="tarot-flip">
        {(describedBy) => <span data-described={String(describedBy)} />}
      </TarotCardPreview>,
    );
    expect(plain).toBe('<div class="tarot-flip"><span data-described="undefined"></span></div>');
    const header = renderToStaticMarkup(
      <TarotCardPreview
        as="header"
        className="tarot-reading-card-heading"
        card={{ id: 'wands-01', label: 'Ace of Wands' }}
      >
        {(describedBy) => <span data-described={String(describedBy)} />}
      </TarotCardPreview>,
    );
    // No meaning to say yet: no description, and no dangling reference to one.
    expect(header).toBe(
      '<header class="tarot-reading-card-heading"><span data-described="undefined"></span></header>',
    );
  });

  it('gives a reading’s thumbnails the same description in place of the plain tooltip', () => {
    const cards = tarotReadingCards.map((card) => ({
      ...card,
      subtitle: tarotCardGuide(card.id)!.upright.short,
    }));
    const html = renderToStaticMarkup(<TarotReading reading={tarotReadingExample} cards={cards} />);
    expect(html.match(/<header class="tarot-reading-card-heading">/g)).toHaveLength(3);
    for (const card of cards) {
      const button = html.match(
        new RegExp(
          `<button class="tarot-card tarot-card--compact" aria-label="View ${card.label} card"[^>]*>`,
        ),
      )![0];
      expect(button).not.toContain('data-tip');
      const describedBy = button.match(/aria-describedby="([^"]+)"/)![1];
      expect(html).toContain(`<span id="${describedBy}" hidden="">${card.subtitle}</span>`);
    }
  });
});
