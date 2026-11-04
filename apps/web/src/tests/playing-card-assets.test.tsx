import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { PlayingCard } from '@games/ui';

describe('Licensed standard card faces', () => {
  it('renders the complete deck from pinned, non-executable local artwork', () => {
    const root = resolve('apps/web/public/playing-cards');
    const source = JSON.parse(readFileSync(resolve(root, 'SOURCE.json'), 'utf8'));
    const expected = ['♣', '♦', '♥', '♠'].flatMap((suit) =>
      ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'].map((value) => ({
        suit,
        value,
        color: suit === '♥' || suit === '♦' ? 'red' : 'black',
      })),
    );
    expected.push(
      { suit: '', value: 'Joker', color: 'red' },
      { suit: '', value: 'Joker', color: 'black' },
    );
    const faces = new Set<string>();
    for (const card of expected) {
      const html = renderToStaticMarkup(
        <PlayingCard
          card={{
            ...card,
            id: `${card.value}-${card.suit}-${card.color}`,
            label: `${card.value} ${card.suit}`,
            subtitle: '',
          }}
        />,
      );
      // Tables draw the compact derivative; it must come from a pinned master of the same face.
      const derived = html.match(/href="\/playing-cards\/(web\/([a-z0-9_]+)\.webp)"/);
      expect(html).toContain('role="img"');
      expect(derived).toBeTruthy();
      const [, file, name] = derived!;
      const bytes = readFileSync(resolve(root, file));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(source.derived.files[file]);
      const master = `${name}.svg`;
      const svg = readFileSync(resolve(root, master), 'utf8');
      expect(svg).not.toMatch(/<script|<foreignObject|\bonload\s*=|\bonerror\s*=|javascript:/i);
      expect(createHash('sha256').update(svg).digest('hex')).toBe(source.files[master]);
      faces.add(master);
    }
    expect(faces.size).toBe(54);
    expect(Object.keys(source.files)).toHaveLength(54);
    expect(Object.keys(source.derived.files)).toHaveLength(54);
  });
});
