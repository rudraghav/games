import { describe, expect, it } from 'vitest';
import { QueryClient } from '@tanstack/react-query';
import type { Room } from '@games/api-client';
import { acceptRoomSnapshot } from '@/features/room/room-snapshot';
import { keys } from '@/shared/query-keys';

// Only revision, identity and presence participate in this cache contract.
const room = (revision: number, matchId = 'first', connected = true) =>
  ({ id: 'room-a', revision, matchId, members: [{ id: 'player', connected }] }) as Room;

describe('Monotonic room snapshots at every cache ingress', () => {
  it.each(['action', 'heartbeat', 'bot', 'rematch'])(
    'a delayed GET cannot overwrite %s',
    async (source) => {
      const cache = new QueryClient({ defaultOptions: { queries: { retry: false } } });
      const key = keys.room('room-a');
      cache.setQueryData(key, room(10));
      let release!: (value: Room) => void;
      const read = cache.fetchQuery({
        queryKey: key,
        queryFn: () =>
          new Promise<Room>((resolve) => {
            release = resolve;
          }),
        structuralSharing: (old, next) => acceptRoomSnapshot(old as Room | undefined, next as Room),
      });
      const committed = room(12, source === 'rematch' ? 'second' : 'first');
      cache.setQueryData<Room>(key, (old) => acceptRoomSnapshot(old, committed));
      release(room(11));
      await read;
      expect(cache.getQueryData<Room>(key)).toEqual(committed);
      cache.clear();
    },
  );
  it('refreshes presence at the same revision and accepts a distinct room', () => {
    const old = room(12);
    expect(acceptRoomSnapshot(old, room(12, 'first', false)).members[0].connected).toBe(false);
    const other = { ...room(1), id: 'room-b' };
    expect(acceptRoomSnapshot(old, other)).toEqual(other);
    expect(acceptRoomSnapshot(old, room(12))).toBe(old);
  });
});
