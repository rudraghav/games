import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { fixtures } from '@/stories/generated/rooms';
import { mapRoom } from '@games/api-client/mappers';
import { shitheadDetails } from '@games/api-client';
import { ShitheadTable } from '@/games/shithead/ShitheadTable';
import type { TableProps } from '@/games/types';

function props(): TableProps {
  const fixture = fixtures.find((f) => f.room.game_id === 'shithead' && f.room.capacity === 2)!;
  const room = mapRoom(fixture.room);
  return {
    room,
    match: room.game!,
    selfId: fixture.selfId,
    pending: false,
    onAction: () => undefined,
  };
}
describe('Shithead public and private zones', () => {
  it('renders six own setup cards and only anonymous backs for every hidden slot', () => {
    const p = props();
    const html = renderToStaticMarkup(<ShitheadTable {...p} />);
    expect(p.match.hand).toHaveLength(6);
    // Own anonymous slots stay on the board; opponents use a public summary
    // until their explicit inspector opens. No hidden identities are mounted.
    expect(html.match(/playing-card--back/g) || []).toHaveLength(3);
    const opponent = p.room.members.find((member) => member.id !== p.selfId)!;
    expect(html).toContain(`aria-label="Inspect ${opponent.name}"`);
    expect(html).toContain('3 hidden table cards');
    expect(html).toContain('Choose your table cards');
    expect(html).toContain('Not chosen yet');
    expect(html).toContain('Keep selected three face-up');
    expect(html).toContain('2 · reset');
    expect(html).toContain('10 · burn');
    expect(html).not.toContain('7 · low');
    expect(html).not.toContain('3 · transparent');
    expect(shitheadDetails(p.match.detail).hidden_slots[p.selfId]).toEqual([true, true, true]);
  });
  it('validates public hidden-slot shape and exposes no face-down identity field', () => {
    const p = props();
    expect(() =>
      shitheadDetails({ ...p.match.detail, hidden_slots: { [p.selfId]: ['AS:0', true, false] } }),
    ).toThrow();
    const data = shitheadDetails(p.match.detail);
    expect(
      Object.values(data.hidden_slots)
        .flat()
        .every((v) => typeof v === 'boolean'),
    ).toBe(true);
    expect(data.loser).toBeNull();
  });
  it('labels the last player rather than inventing points or a first-place winner', () => {
    const p = props();
    const loser = p.match.players[1].id;
    const html = renderToStaticMarkup(
      <ShitheadTable
        {...p}
        match={{
          ...p.match,
          phase: 'finished',
          currentPlayer: null,
          actions: [],
          winners: [p.selfId],
          detail: { ...p.match.detail, finish_order: [p.selfId], loser },
        }}
      />,
    );
    expect(html).toContain('is last. Everyone else escaped.');
    expect(html).not.toContain('0 points');
  });
});
