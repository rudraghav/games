import { beforeEach, describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { RoomScreen } from '@/features/room/Room';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/rooms/legacy-room',
}));
vi.mock('@/features/room/useRoom', () => ({
  useRoom: () => ({
    room: { data: currentRoom, error: null, isFetching: false },
    me: {
      data: { profile: playerId ? { id: playerId } : null },
      isSuccess: true,
      error: null,
      isFetching: false,
    },
    mutation: { isPending: false },
    live: false,
  }),
}));
const room = mapRoom(
  fixtures.find((item) => item.room.game_id === 'uno' && item.room.capacity === 2)!.room,
);
let currentRoom = room;
let playerId: string | null = null;

function renderRoom() {
  const cache = new QueryClient();
  const html = renderToStaticMarkup(
    <QueryClientProvider client={cache}>
      <RoomScreen id={currentRoom.id} />
    </QueryClientProvider>,
  );
  cache.clear();
  return html;
}

describe('Room entry identity boundary', () => {
  beforeEach(() => {
    currentRoom = room;
    playerId = null;
  });

  it('keeps unresolved identity out of seat and game controls', () => {
    const html = renderRoom();
    expect(html).toContain('Player details unavailable');
    expect(html).toContain('Try again');
    expect(html).not.toContain('Take an open seat');
    expect(html).not.toContain('I’m ready');
    expect(html).not.toContain('Your actions');
  });

  it('presents an authorized solo start as a reading without group-room controls', () => {
    const tarot = mapRoom(fixtures.find((item) => item.room.game_id === 'tarot')!.room);
    currentRoom = { ...tarot, status: 'lobby', game: null };
    playerId = tarot.ownerId;
    const html = renderRoom();
    expect(html).toContain('Pop Tarot');
    expect(html).toContain('Your private reading');
    expect(html).toContain('Start reading');
    expect(html).toContain('Reading options');
    expect(html).toContain('href="/games/tarot"');
    expect(html).not.toContain('Room options');
    expect(html).not.toContain('Open chat');
    expect(html).not.toContain('I’m ready');
    expect(html).not.toContain('Component preview');
  });
});
