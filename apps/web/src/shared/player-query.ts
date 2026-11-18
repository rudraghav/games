import type { QueryClient } from '@tanstack/react-query';
import type { Me } from '@games/api-client';
import { keys } from './query-keys';

/** A room-entry mutation may finish before the dialog's initial profile read. */
export async function refreshPlayer(cache: QueryClient, load: () => Promise<Me>) {
  // Invalidation can reuse an initial in-flight read, including profile:null
  // captured before joining. Cancel it so its late result cannot replace the
  // fresh, authoritative identity established by the completed room mutation.
  await cache.cancelQueries({ queryKey: keys.me, exact: true });
  return cache.fetchQuery({ queryKey: keys.me, queryFn: load, staleTime: 0 });
}

/** Remove only the confirmed departed membership before returning to the lounge. */
export async function forgetRoomMembership(cache: QueryClient, roomId: string) {
  await cache.cancelQueries({ queryKey: keys.me, exact: true });
  cache.setQueryData<Me>(keys.me, (current) =>
    current ? { ...current, rooms: current.rooms.filter((room) => room.id !== roomId) } : current,
  );
  void cache.invalidateQueries({ queryKey: keys.me, exact: true });
}
