import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TarotDeckPicker, deckStep } from '@/games/tarot/TarotDeckPicker';

const actions = Array.from({ length: 8 }, (_, index) => ({
  label: `Card ${index + 1}`,
  value: { type: 'draw', choice: `back-${index}` },
}));

function deck(overrides: { pending?: boolean; paused?: boolean } = {}) {
  return renderToStaticMarkup(
    <TarotDeckPicker
      actions={actions as never}
      drawn={0}
      position="Where you are"
      pending={false}
      paused={false}
      deckRef={{ current: null }}
      onDraw={() => {}}
      {...overrides}
    />,
  );
}

describe('the face-down deck', () => {
  it('lays the backs in three rows, column by column, with the front row on top', () => {
    const html = deck();
    expect(html.match(/data-card-index="\d+"/g)).toHaveLength(8);
    // Cards 1, 2, 3 fill the first column from the back row to the front.
    for (const [index, row, column] of [
      [0, 0, 1],
      [1, 1, 1],
      [2, 2, 1],
      [3, 0, 2],
      [7, 1, 3],
    ]) {
      const button = html.match(new RegExp(`<button[^>]*data-card-index="${index}"[^>]*>`))![0];
      expect(button).toContain(`data-row="${row}"`);
      expect(button).toContain(`grid-row:${row + 1}`);
      expect(button).toContain(`grid-column:${column}`);
      expect(button).toContain(`--fan-layer:${row * 100 + column}`);
    }
    // The front row and the very last card have nothing over them.
    expect(html.match(/data-front-row="true"/g)).toHaveLength(3);
    expect(html.match(/<button[^>]*data-card-index="7"[^>]*>/)![0]).toContain('data-front-row');
  });

  it('is one Tab stop of plain buttons: a tap reveals, nothing is lifted first', () => {
    const html = deck();
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html).not.toContain('aria-pressed');
    expect(html).toContain('aria-label="Face-down card 1 of 8, for where you are"');
    expect(html).toContain('Tap a card to reveal it.');
    expect(html).toContain('Click a card to reveal it, or use the arrow keys and Enter.');
    expect(html).not.toMatch(/again/i);
  });

  it('locks every back while a draw is saved or the table is paused', () => {
    for (const html of [deck({ pending: true }), deck({ paused: true })])
      expect(html.match(/<button[^>]*disabled=""/g)).toHaveLength(8);
    expect(deck({ pending: true })).toContain('Drawing your card…');
  });

  it('moves along a row with Left and Right and between rows with Up and Down', () => {
    // 8 cards in 3 rows: columns [0,1,2] [3,4,5] [6,7].
    expect(deckStep('ArrowRight', 0, 8, 3)).toBe(3);
    expect(deckStep('ArrowRight', 3, 8, 3)).toBe(6);
    expect(deckStep('ArrowRight', 6, 8, 3)).toBe(6);
    // No card to the right of the front row's second column: stay.
    expect(deckStep('ArrowRight', 5, 8, 3)).toBe(5);
    expect(deckStep('ArrowLeft', 7, 8, 3)).toBe(4);
    expect(deckStep('ArrowLeft', 1, 8, 3)).toBe(1);
    expect(deckStep('ArrowDown', 0, 8, 3)).toBe(1);
    expect(deckStep('ArrowDown', 2, 8, 3)).toBe(2);
    expect(deckStep('ArrowDown', 7, 8, 3)).toBe(7);
    expect(deckStep('ArrowUp', 4, 8, 3)).toBe(3);
    expect(deckStep('ArrowUp', 3, 8, 3)).toBe(3);
    expect(deckStep('Home', 5, 8, 3)).toBe(0);
    expect(deckStep('End', 1, 8, 3)).toBe(7);
    expect(deckStep('Enter', 1, 8, 3)).toBeNull();
    expect(deckStep('a', 1, 8, 3)).toBeNull();
  });
});
