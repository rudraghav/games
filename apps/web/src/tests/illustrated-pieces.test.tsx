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
    // The padded delivery atlas is derived from the preserved v1 master.
    expect(readFileSync('apps/web/public/game-art/paper-symbols-v2.webp').length).toBeGreaterThan(
      1000,
    );
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
    expect(html).toContain('paper-symbols-v2.webp');
  });
  it('paints every scoring colour into the card: band, glyph, name and re-toned art', () => {
    const colors = [
      'navy',
      'turquoise',
      'black',
      'yellow',
      'green',
      'gray',
      'purple',
      'peach',
      'pink',
      'orange',
      'white',
    ];
    const filters = new Set<string>();
    for (const color of colors) {
      const html = renderToStaticMarkup(
        <PaperPlayingCard
          compact
          card={{
            id: `shell-${color}`,
            label: `Shell · ${color}`,
            suit: 'shell',
            color,
            value: 'Shell',
            subtitle: 'Collection',
          }}
        />,
      );
      expect(html).toContain(`data-color="${color}"`);
      expect(html).toContain(`<span>${color}</span>`);
      expect(html).toMatch(/class="lucide lucide-[a-z0-9-]+/);
      expect(html).toContain(`data-tone="${color}"`);
      filters.add(html.match(/<feFuncR type="table" tableValues="([^"]+)"/)![1]);
    }
    expect(filters.size).toBe(colors.length);
    // Library art keeps its original colours: no tone, no filter.
    const plain = renderToStaticMarkup(<PaperCardArt kind="crab" />);
    expect(plain).not.toContain('<filter');
    expect(plain).toContain('paper-symbols-v2.webp');
  });
});
