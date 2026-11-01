import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { boopDetails, paperDetails } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { BoopTable } from '@/games/boop/BoopTable';
import { PaperTable } from '@/games/sea/PaperTable';

describe('Sea Salt & Paper and boop decision surfaces', () => {
  it('renders both limits with illustrated, named controls and all bed squares', () => {
    const selected = fixtures.filter((f) => ['sea-salt-paper', 'boop'].includes(f.room.game_id));
    expect(selected).toHaveLength(4);
    for (const fixture of selected) {
      const room = mapRoom(fixture.room);
      const Table = room.gameId === 'boop' ? BoopTable : PaperTable;
      const html = renderToStaticMarkup(
        <Table
          room={room}
          match={room.game!}
          selfId={fixture.selfId}
          onAction={() => undefined}
          pending={false}
        />,
      );
      expect(html).toContain('/game-art/');
      expect(html).not.toContain('Current bet');
      if (room.gameId === 'boop') {
        expect(html.match(/class="boop-square"/g)).toHaveLength(36);
        expect(html).toContain('Select kitten: 8 available');
        expect(html).toContain('Select cat: 0 available');
        expect(html).toContain('Place kitten at A1');
      } else {
        expect(html).toContain('Draw two · keep one');
        expect(html).toContain('aria-label="Your private hand"');
        expect(html).toContain('Take discard 1:');
        expect(html).toContain('First to');
      }
    }
  });

  it('requires a private draft selection before exposing a keep action', () => {
    const fixture = fixtures.find((f) => f.room.game_id === 'sea-salt-paper')!;
    const room = mapRoom(fixture.room);
    const match = room.game!;
    const cards = paperDetails(match.detail).discard_tops.filter((card) => card !== null);
    const choosing = {
      ...match,
      phase: 'choosing',
      actions: [],
      detail: { ...match.detail, private_options: cards },
    };
    const html = renderToStaticMarkup(
      <PaperTable
        room={room}
        match={choosing}
        selfId={fixture.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(html).toContain('Choose a card to keep');
    expect(html).toContain('Only you can see these choices.');
    expect(html).not.toContain('Keep selected');
    expect(html).not.toContain('Draw two · keep one');
  });

  it('disables placement while a move is pending and rejects invalid wire details', () => {
    const fixture = fixtures.find((f) => f.room.game_id === 'boop')!;
    const room = mapRoom(fixture.room);
    const html = renderToStaticMarkup(
      <BoopTable
        room={room}
        match={room.game!}
        selfId={fixture.selfId}
        onAction={() => undefined}
        pending
      />,
    );
    expect(html.match(/disabled=""/g)).toHaveLength(38);
    const detail = room.game!.detail;
    expect(() => boopDetails({ ...detail, last_move: 36 })).toThrow();
    expect(() => boopDetails({ ...detail, pools: { player: { cat: 9, kitten: 0 } } })).toThrow();
    const paper = fixtures.find((f) => f.room.game_id === 'sea-salt-paper')!.room.game!.detail;
    expect(() => paperDetails({ ...paper, pile_counts: [0] })).toThrow();
    expect(() => paperDetails({ ...paper, own_points: -1 })).toThrow();
  });
});
