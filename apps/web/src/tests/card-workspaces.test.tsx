import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { CardTable } from '@/games/shared/CardTable';
import { RummyTable } from '@/games/rummy/RummyTable';
import { SkyjoTable } from '@/games/skyjo/SkyjoTable';
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

describe('Card table decisions stay with their cards', () => {
  it('marks only authoritative playable Uno cards and waits for a selection before card moves', () => {
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
    expect(html).toContain('Choose a card to play.');
    expect(html).not.toContain('or draw');
    expect(html).toContain('is the current colour');
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
    expect(html).toContain('>Choose red<');
  });
  it('puts Rummy draw moves on their piles once and blocks both while saving', () => {
    const p = props('rummy');
    const html = renderToStaticMarkup(<RummyTable {...p} pending />);
    expect(html.match(/aria-label="Draw from stock"/g)).toHaveLength(1);
    expect(html.match(/aria-label="Take discard"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-label="Draw from stock"[^>]*disabled=""/);
    expect(html).toMatch(/aria-label="Take discard"[^>]*disabled=""/);
    expect(renderToStaticMarkup(<RummyTable {...p} />)).toContain(
      'Draw from either available pile.',
    );
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
