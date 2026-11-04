'use client';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ApiError, type Action, type Room } from '@games/api-client';
import { api, ensureSession, supabase } from '@/lib/session';
import { keys } from '@/shared/query-keys';
import { acceptRoomSnapshot } from './room-snapshot';

function subscribeToNetwork(notify: () => void) {
  window.addEventListener('online', notify);
  window.addEventListener('offline', notify);
  return () => {
    window.removeEventListener('online', notify);
    window.removeEventListener('offline', notify);
  };
}

/**
 * How this tab is talking to the table: `offline` (no network), `reconnecting`
 * (the server is unreachable), `live` (realtime updates) or `connected` (polling).
 */
export type RoomConnection = 'offline' | 'reconnecting' | 'live' | 'connected';

export function useRoom(id: string) {
  const cache = useQueryClient();
  const [live, setLive] = useState(false);
  const online = useSyncExternalStore(
    subscribeToNetwork,
    () => navigator.onLine,
    () => true,
  );
  const me = useQuery({ queryKey: keys.me, queryFn: () => api.me() });
  const room = useQuery({
    queryKey: keys.room(id),
    queryFn: () => api.room(id),
    structuralSharing: (current, incoming) =>
      acceptRoomSnapshot(current as Room | undefined, incoming as Room),
    refetchInterval: live ? 15000 : 4000,
    refetchOnWindowFocus: 'always',
    refetchOnReconnect: 'always',
    retry: (count, error) => count < 2 && (!(error instanceof ApiError) || error.status >= 500),
  });
  useEffect(() => {
    let cancelled = false;
    const heartbeat = () => {
      if (document.visibilityState !== 'visible' || cancelled) return;
      void api
        .heartbeat(id)
        .then((snapshot) => {
          if (!cancelled)
            cache.setQueryData<Room>(keys.room(id), (current) =>
              acceptRoomSnapshot(current, snapshot),
            );
        })
        .catch(() => {
          if (!cancelled) setLive(false);
        });
    };
    heartbeat();
    const interval = window.setInterval(heartbeat, 15000);
    window.addEventListener('online', heartbeat);
    document.addEventListener('visibilitychange', heartbeat);
    const client = supabase;
    const channel = client?.channel(`room:${id}`, { config: { private: true } });
    if (channel && client)
      void ensureSession()
        .then(async () => {
          if (cancelled) return;
          const token = (await client.auth.getSession()).data.session?.access_token;
          await client.realtime.setAuth(token);
          channel
            .on('broadcast', { event: 'state_changed' }, () => {
              void cache.invalidateQueries({ queryKey: keys.room(id) });
            })
            .subscribe((status) => {
              if (!cancelled) {
                setLive(status === 'SUBSCRIBED');
                if (status === 'SUBSCRIBED') heartbeat();
              }
            });
        })
        .catch(() => {
          if (!cancelled) setLive(false);
        });
    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener('online', heartbeat);
      document.removeEventListener('visibilitychange', heartbeat);
      if (channel && client) void client.removeChannel(channel);
    };
  }, [cache, id]);
  const mutation = useMutation({
    mutationFn: (operation: () => Promise<Room>) => operation(),
    onSuccess: (snapshot) => {
      cache.setQueryData<Room>(keys.room(id), (current) => acceptRoomSnapshot(current, snapshot));
    },
    onError: () => {
      void cache.invalidateQueries({ queryKey: keys.room(id) });
    },
  });
  // A connected human drives a single due, persisted bot action. The server
  // serializes competing drivers and ignores stale/repeated versions safely.
  const {
    mutate: driveBot,
    isPending: drivingBot,
    isError: botFailed,
    error: botError,
    reset: retryBots,
    variables: driven,
  } = useMutation({
    mutationFn: ({ matchId, version }: { matchId: string; version: number }) =>
      api.driveBots(id, matchId, version),
    onSuccess: (snapshot) =>
      cache.setQueryData<Room>(keys.room(id), (current) => acceptRoomSnapshot(current, snapshot)),
    onError: () => void cache.invalidateQueries({ queryKey: keys.room(id) }),
    retry: (count, error) => count < 1 && (!(error instanceof ApiError) || error.status >= 500),
    retryDelay: 1500,
  });
  const selfId = me.data?.profile?.id;
  const { botPending, paused, matchId, matchVersion, botDueAt } = room.data || {};
  useEffect(() => {
    if (botFailed && driven && (driven.matchId !== matchId || driven.version !== matchVersion))
      retryBots();
  }, [botFailed, driven, matchId, matchVersion, retryBots]);
  useEffect(() => {
    if (
      !selfId ||
      !online ||
      !botPending ||
      paused ||
      !matchId ||
      matchVersion == null ||
      drivingBot ||
      botFailed
    )
      return;
    const timeout = window.setTimeout(
      () => driveBot({ matchId, version: matchVersion }),
      Math.max(800, (botDueAt ?? 0) * 1000 - Date.now()),
    );
    return () => window.clearTimeout(timeout);
  }, [
    selfId,
    online,
    botPending,
    paused,
    matchId,
    matchVersion,
    botDueAt,
    drivingBot,
    botFailed,
    driveBot,
  ]);
  function move(action: Action) {
    const current = cache.getQueryData<Room>(keys.room(id));
    if (!current?.matchId || current.matchVersion == null || mutation.isPending) return;
    const actionId = crypto.randomUUID();
    mutation.mutate(() => api.move(id, current.matchId!, current.matchVersion!, action, actionId));
  }
  // Room reads retry and refresh every few seconds, so a failing read is the
  // reliable sign that the server cannot be reached.
  const connection: RoomConnection = !online
    ? 'offline'
    : room.isError
      ? 'reconnecting'
      : live
        ? 'live'
        : 'connected';
  return { room, me, live, connection, mutation, move, botError, retryBots };
}
