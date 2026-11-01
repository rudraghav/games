import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { BoopPiece, PaperCardArt, paperCardKinds, PaperPlayingCard } from '@games/ui';

describe('Complete illustrated game pieces', () => {
  it('maps every cat variant and all14 ocean symbols to distinct complete atlas cells', () => {
    const cats = (['coral', 'blue'] as const).flatMap((color) =>
      (['kitten', 'cat'] as const).map((kind) =>
        renderToStaticMarkup(<BoopPiece color={color} kind={kind} label={`${color} ${kind}`} />),
      ),
    );
    const ocean = paperCardKinds.map((kind) => renderToStaticMarkup(<PaperCardArt kind={kind} />));
    for (const group of [cats, ocean]) {
      const cells = group.map((html) => html.match(/viewBox="([^"]+)"/)?.[1]);
      expect(new Set(cells).size).toBe(group.length);
      expect(cells.every(Boolean)).toBe(true);
      expect(group.every((html) => html.includes('xMidYMid meet'))).toBe(true);
    }
    expect(cats).toHaveLength(4);
    expect(ocean).toHaveLength(14);
    for (const atlas of ['boop-pieces-v1', 'paper-symbols-v1']) {
      for (const extension of ['png', 'webp'])
        expect(
          readFileSync(`apps/web/public/game-art/${atlas}.${extension}`).length,
        ).toBeGreaterThan(1000);
    }
  });
  it('keeps card meaning accessible alongside decorative illustration in pending selection', () => {
    const html = renderToStaticMarkup(
      <PaperPlayingCard
        card={{
          id: 'blue-boat',
          label: 'Blue boat',
          suit: 'boat',
          color: 'blue',
          value: 'Boat',
          subtitle: 'Play two boats for an extra turn.',
        }}
        selected
        disabled
        onClick={() => undefined}
      />,
    );
    expect(html).toContain('aria-label="Blue boat. Play two boats for an extra turn."');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('disabled=""');
    expect(html).toContain('paper-symbols-v1.webp');
  });
});
