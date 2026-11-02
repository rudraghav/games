import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { RoomActivity } from '@/features/room/RoomActivity';
import { dealScenarios } from '@/stories/generated/deal-scenarios';

const fixture = dealScenarios.find((item) => item.id === 'collections')!;
describe('Committed room activity', () => {
  it('maps old saved snapshots with no activity and renders a useful empty state', () => {
    const room = mapRoom(fixture.room);
    expect(room.activity).toEqual([]);
    expect(renderToStaticMarkup(<RoomActivity room={room} />)).toContain(
      'Moves appear here as you play.',
    );
  });
  it('renders only authoritative public event cards and readable people/destinations', () => {
    const publicCard = fixture.room.game!.players[0].properties!['blue:0'][0];
    const room = mapRoom({
      ...fixture.room,
      activity: [
        {
          version: 3,
          actor_id: fixture.selfId,
          type: 'property',
          label: 'Placed a property',
          targets: [fixture.room.members[1].id],
          cards: [publicCard],
          destination: 'Dark blue · set 1',
          amount: null,
          count: 1,
        },
      ],
    });
    room.game!.hand = [{ ...room.game!.hand[0], id: 'secret', label: 'PRIVATE HAND CANARY' }];
    const html = renderToStaticMarkup(<RoomActivity room={room} />);
    expect(html).toContain('Boardwalk');
    expect(html).toContain('Dev');
    expect(html).toContain('Dark blue · set 1');
    expect(html).not.toContain('PRIVATE HAND CANARY');
    expect(html).not.toContain(fixture.selfId);
    expect(html).toContain('Move 2');
    expect(html).toContain('View card');
  });
  it('shows count-only private choices without substituting a face or action payload', () => {
    const room = mapRoom({
      ...fixture.room,
      activity: [
        {
          version: 2,
          actor_id: fixture.selfId,
          type: 'draw',
          label: 'Drew cards',
          cards: [],
          targets: [],
          amount: null,
          destination: null,
          count: 2,
        },
      ],
    });
    const html = renderToStaticMarkup(<RoomActivity room={room} />);
    expect(html).toContain('2 cards');
    expect(html).not.toContain('playing-card');
    expect(html).not.toContain('Boardwalk');
  });
});
