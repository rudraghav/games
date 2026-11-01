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
      const file = html.match(/href="\/playing-cards\/([a-z0-9_]+\.svg)"/)?.[1];
      expect(html).toContain('role="img"');
      expect(file).toBeTruthy();
      const svg = readFileSync(resolve(root, file!), 'utf8');
      expect(svg).not.toMatch(/<script|<foreignObject|\bonload\s*=|\bonerror\s*=|javascript:/i);
      expect(createHash('sha256').update(svg).digest('hex')).toBe(source.files[file!]);
      faces.add(file!);
    }
    expect(faces.size).toBe(54);
    expect(Object.keys(source.files)).toHaveLength(54);
  });
});
