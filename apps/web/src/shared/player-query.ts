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
