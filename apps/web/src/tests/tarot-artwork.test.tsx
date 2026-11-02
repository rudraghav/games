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
});
