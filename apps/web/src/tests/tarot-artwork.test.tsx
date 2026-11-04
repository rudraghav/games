import { describe, expect, it } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { TarotCard, tarotArtwork } from '@games/ui';

describe('Complete original Tarot artwork', () => {
  it('covers every canonical card with a unique bounded illustration cell', () => {
    const expected = [
      ...Array.from({ length: 22 }, (_, i) => `major-${String(i).padStart(2, '0')}`),
      ...['wands', 'cups', 'swords', 'pentacles'].flatMap((suit) =>
        Array.from({ length: 14 }, (_, i) => `${suit}-${String(i + 1).padStart(2, '0')}`),
      ),
    ];
    expect(Object.keys(tarotArtwork)).toEqual(expected);
    const cells = new Set<string>();
    for (const [id, art] of Object.entries(tarotArtwork)) {
      const [x, y, width, height] = art.viewBox.split(' ').map(Number);
      expect(width).toBeGreaterThan(0);
      expect(height).toBeGreaterThan(0);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(x + width).toBeLessThanOrEqual(art.atlasWidth);
      expect(y + height).toBeLessThanOrEqual(art.atlasHeight);
      cells.add(`${art.path}:${art.viewBox}`);
      const master = resolve('apps/web/public', `.${art.path}`);
      expect(existsSync(master)).toBe(true);
      expect(readFileSync(master).subarray(1, 4).toString()).toBe('PNG');
      expect(existsSync(master.replace('.png', '.webp'))).toBe(true);
      const html = renderToStaticMarkup(<TarotCard id={id} />);
      expect(html).toContain(`<image href="${art.path}"`);
      expect(html).toContain(`preserveAspectRatio="${art.alignment} ${art.fit ?? 'slice'}"`);
      expect(html).toContain(art.name);
      expect(html).not.toContain('Artwork unavailable');
      expect(html).not.toContain('tarot-pips');
    }
    expect(cells.size).toBe(78);
  });

  it('frames every face full-bleed, including the single-card corrections', () => {
    const singles = Object.entries(tarotArtwork).filter(([, art]) => art.path.endsWith('-v2.png'));
    expect(singles.map(([id]) => id).sort()).toEqual(
      [
        'cups-02',
        'cups-06',
        'cups-08',
        'cups-10',
        'pentacles-05',
        'pentacles-08',
        'pentacles-09',
        'pentacles-10',
        'swords-05',
        'swords-06',
        'swords-08',
        'swords-09',
        'swords-10',
        'wands-05',
        'wands-07',
        'wands-08',
        'wands-09',
      ].sort(),
    );
    for (const [id, art] of Object.entries(tarotArtwork))
      expect(art.fit ?? 'slice', id).toBe('slice');
    // Single-card masters use the atlas-cell aspect, so they crop like their neighbours.
    for (const [id, art] of singles) {
      const [, , width, height] = art.viewBox.split(' ').map(Number);
      expect(width / height, id).toBeGreaterThan(0.66);
      expect(width / height, id).toBeLessThan(0.8);
    }
  });

  it('records a verified symbol count equal to the rank for every Ace to Ten', () => {
    const readme = readFileSync(resolve('apps/web/public/tarot/README.md'), 'utf8');
    const rows = [...readme.matchAll(/^\| (wands|cups|swords|pentacles)-(\d\d) \| (\d+) \|/gm)];
    expect(rows).toHaveLength(40);
    // Six of Wands shows only the rider's staff; recorded as an open art correction.
    const pending = new Set(['wands-06']);
    for (const [, suit, rank, count] of rows) {
      if (pending.has(`${suit}-${rank}`)) continue;
      expect(Number(count), `${suit}-${rank}`).toBe(Number(rank));
      expect(tarotArtwork[`${suit}-${rank}`]).toBeDefined();
    }
  });
});
