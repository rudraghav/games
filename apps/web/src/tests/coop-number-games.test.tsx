import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { gangDetails, sixNimmtDetails } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { GangTable } from '@/games/coop-number/GangTable';
import { SixNimmtTable } from '@/games/coop-number/SixNimmtTable';

describe('Cooperative poker and number-row decisions', () => {
  it('renders both seat limits with private cards and deliberate move controls', () => {
    const selected = fixtures.filter((f) => ['the-gang', 'six-nimmt'].includes(f.room.game_id));
    expect(selected).toHaveLength(4);
    for (const fixture of selected) {
      const room = mapRoom(fixture.room);
      const Table = room.gameId === 'the-gang' ? GangTable : SixNimmtTable;
      const html = renderToStaticMarkup(
        <Table
          room={room}
          match={room.game!}
          selfId={fixture.selfId}
          onAction={() => undefined}
          pending={false}
        />,
      );
      expect(html).toContain(room.gameId === 'the-gang' ? 'Everyone can choose' : 'Lock my number');
      expect(html).toContain(
        room.gameId === 'the-gang' ? 'Your pocket cards' : 'Choose one number',
      );
      expect(html).toContain('disabled=""');
      expect(html).not.toContain('Current bet');
    }
  });

  it('a locked number renders only the viewer’s own choice and waiting state', () => {
    const fixture = fixtures.find((f) => f.room.game_id === 'six-nimmt')!;
    const room = mapRoom(fixture.room);
    const match = room.game!;
    const card = match.hand[0];
    const locked = {
      ...match,
      actions: [],
      hand: match.hand.slice(1),
      detail: {
        ...match.detail,
        selected_players: [fixture.selfId],
        own_selection: card,
      },
    };
    const html = renderToStaticMarkup(
      <SixNimmtTable
        room={room}
        match={locked}
        selfId={fixture.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(html).toContain('Your number is locked');
    expect(html).toContain('Their numbers stay secret');
    expect(html).not.toContain('Lock my number');
    expect(html).not.toContain('Revealed, in order');
  });

  it('rejects impossible chips, oversized rows and malformed penalties at the wire boundary', () => {
    const gang = fixtures.find((f) => f.room.game_id === 'the-gang')!.room.game!.detail;
    const six = fixtures.find((f) => f.room.game_id === 'six-nimmt')!.room.game!.detail;
    expect(() => gangDetails({ ...gang, chips: { player: 7 } })).toThrow();
    expect(() => sixNimmtDetails({ ...six, row_penalties: [-1, 1, 1, 1] })).toThrow();
    const row = (six.rows as unknown[][])[0];
    expect(() =>
      sixNimmtDetails({ ...six, rows: [Array(6).fill(row[0]), row, row, row] }),
    ).toThrow();
  });
});
