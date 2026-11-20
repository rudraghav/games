import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { CardTable } from '@/games/shared/CardTable';
import { RummyTable } from '@/games/rummy/RummyTable';
import { SkyjoTable } from '@/games/skyjo/SkyjoTable';
import { swapImpact } from '@/games/skyjo/swap-impact';
import type { TableProps } from '@/games/types';

function props(game: string): TableProps {
  const fixture = fixtures.find((item) => item.room.game_id === game)!;
  const room = mapRoom(fixture.room);
  return {
    room,
    match: room.game!,
    selfId: fixture.selfId,
    onAction: () => undefined,
    pending: false,
  };
}

it('compares immediate Skyjo grid changes, including negative and hidden column clears', () => {
  const grid = (a: string | null, b: string, c: string) =>
    [a, null, null, null, b, null, null, null, c].map((v) => (v === null ? null : { value: v }));
  expect(swapImpact(grid('8', '1', '2'), 0, '4').label).toBe('-4');
  expect(swapImpact(grid('8', '4', '4'), 0, '4').label).toBe('Clears · -16');
  expect(swapImpact(grid('1', '-2', '-2'), 0, '-2').label).toBe('Clears · +3');
  expect(swapImpact(grid(null, '4', '4'), 0, '4').label).toBe('Clears · ?');
  expect(swapImpact(grid(null, '4', '1'), 0, '4').label).toBe('?');
});

describe('Card table decisions stay with their cards', () => {
  it('marks the one authorized Uno card and offers its named play in the dock', () => {
    const p = props('uno');
    const playable = p.match.hand[0];
    const html = renderToStaticMarkup(
      <CardTable
        {...p}
        match={{
          ...p.match,
          actions: [
            {
              ...p.match.actions[0],
              label: 'Play this card',
              value: { ...p.match.actions[0].value, type: 'play', card: playable.id },
            },
          ],
        }}
      />,
    );
    expect(html.match(/data-playable="true"/g)).toHaveLength(1);
    expect(html).not.toContain('>Play this card<');
    expect(html).toContain(`>Play ${playable.label}<`);
    expect(html).not.toContain('or draw');
    expect(html).toContain('is the current colour');
    // The playable card leads the hand, so the card the instruction means is in view.
    const hand = html.slice(html.indexOf('card-hand'));
    expect(hand.match(/<button[^>]*aria-label="([^"]+)"/)?.[1]).toBe(`${playable.label}, playable`);
  });
  it('keeps Uno colour and challenge decisions available without an unrelated card selection', () => {
    const p = props('uno');
    const html = renderToStaticMarkup(
      <CardTable
        {...p}
        match={{
          ...p.match,
          actions: [
            {
              ...p.match.actions[0],
              label: 'Choose red',
              value: { ...p.match.actions[0].value, type: 'choose', card: '', color: 'red' },
            },
          ],
        }}
      />,
    );
    expect(html).toContain('Choose the colour for the next play.');
    // A colour swatch keeps the server label as its name and shows the colour and count.
    expect(html).toContain('aria-label="Choose red"');
    expect(html).toContain('<span>Red</span>');
    expect(html).toMatch(/\d+ in hand/);
  });
  it('puts Rummy draw moves on their piles once and blocks both while saving', () => {
    const p = props('rummy');
    const html = renderToStaticMarkup(<RummyTable {...p} pending />);
    expect(html.match(/aria-label="Draw from stock"/g)).toHaveLength(1);
    expect(html.match(/aria-label="Take discard"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-label="Draw from stock"[^>]*disabled=""/);
    expect(html).toMatch(/aria-label="Take discard"[^>]*disabled=""/);
    // The dock points at the piles instead of repeating their draw buttons.
    expect(renderToStaticMarkup(<RummyTable {...p} />)).toContain('Draw: tap the stock or the');
    expect(html).not.toContain('Move selected card');
  });
  it('puts the viewer’s Skyjo grid first even when the viewer is the last seat', () => {
    const p = props('skyjo');
    const selfId = p.match.players.at(-1)!.id;
    const html = renderToStaticMarkup(<SkyjoTable {...p} selfId={selfId} />);
    expect(html.indexOf('data-own="true"')).toBeLessThan(html.indexOf('class="opponent-panel'));
    expect(html).toContain('aria-label="Your Skyjo grid"');
    expect(html.match(/class="skyjo-grid"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Revealed grid summary"');
    expect(html).toContain('hidden');
  });
  it('names legal Skyjo targets by action and position, and never exposes a hidden rank', () => {
    const p = props('skyjo');
    const html = renderToStaticMarkup(<SkyjoTable {...p} room={{ ...p.room, paused: true }} />);
    expect(html).toContain('aria-label="Reveal, row 1, column 1"');
    expect(html).toMatch(/aria-label="Reveal, row 1, column 1"[^>]*disabled=""/);
    expect(html).not.toContain('>Reveal card 1<');
    expect(html).toContain('Game paused');
  });
});
