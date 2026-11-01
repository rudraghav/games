import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { RoomScreen } from '@/features/room/Room';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('@/features/room/useRoom', () => ({
  useRoom: () => ({
    room: { data: room, error: null, isFetching: false },
    me: { data: { profile: null }, isSuccess: true, error: null, isFetching: false },
    mutation: { isPending: false },
    live: false,
  }),
}));
const room = mapRoom(
  fixtures.find((item) => item.room.game_id === 'uno' && item.room.capacity === 2)!.room,
);

describe('Room entry identity boundary', () => {
  it('keeps unresolved identity out of seat and game controls', () => {
    const html = renderToStaticMarkup(<RoomScreen id={room.id} />);
    expect(html).toContain('Player details unavailable');
    expect(html).toContain('Try again');
    expect(html).not.toContain('Take an open seat');
    expect(html).not.toContain('I’m ready');
    expect(html).not.toContain('Your actions');
  });
});
