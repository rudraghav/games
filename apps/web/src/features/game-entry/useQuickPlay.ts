'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@games/api-client';
import { api } from '@/lib/session';
import { roomPath } from '@/shared/game-paths';
import { keys } from '@/shared/query-keys';
import { rememberPlayer } from '@/shared/player-preferences';
import { refreshPlayer } from '@/shared/player-query';

type LaunchFailure = { message: string; newLaunch: boolean };
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function storedRequest(key: string) {
  try {
    const value = sessionStorage.getItem(key);
    return value && uuid.test(value) ? value : null;
  } catch {
    return null;
  }
}

export function useQuickPlay(gameId: string) {
  const router = useRouter();
  const cache = useQueryClient();
  const [pending, setPending] = useState(false);
  const [failure, setFailure] = useState<LaunchFailure | null>(null);
  const request = useRef<string | null>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const key = `games:launch:${gameId}`;
  const reading = gameId === 'tarot';

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function start() {
    // The ref closes the gap before React paints the disabled button.
    if (busy.current) return;
    busy.current = true;
    setPending(true);
    setFailure(null);
    if (failure?.newLaunch) request.current = crypto.randomUUID();
    request.current ??= storedRequest(key) ?? crypto.randomUUID();
    try {
      sessionStorage.setItem(key, request.current);
    } catch {
      // Storage restrictions still permit same-page recovery with the ref.
    }
    try {
      const room = await api.quickPlay(gameId, request.current);
      cache.setQueryData(keys.room(room.id), room);
      if (!mounted.current) return;
      const player = room.members.find((member) => member.id === room.ownerId);
      if (player) {
        try {
          rememberPlayer(player.name, player.avatar);
        } catch {
          // A saved game must remain reachable when preference storage is blocked.
        }
      }
      // Cancel any pre-launch profile read so its late result cannot erase
      // the identity committed by quick play. Read failure recovers in the game.
      await refreshPlayer(cache, () => api.me()).catch(() => undefined);
      if (!mounted.current) return;
      try {
        sessionStorage.removeItem(key);
      } catch {
        // The server still recognizes the same request if it remains stored.
      }
      router.push(roomPath(room));
    } catch (error) {
      if (!mounted.current) return;
      const status = error instanceof ApiError ? error.status : undefined;
      setFailure(
        status === 409 || status === 410
          ? { message: 'That session has ended or changed.', newLaunch: true }
          : {
              message:
                status === 429
                  ? 'Too many starts. Try again later.'
                  : status === 401
                    ? 'Reconnect to start.'
                    : `Couldn’t start your ${reading ? 'reading' : 'game'}.`,
              newLaunch: false,
            },
      );
    } finally {
      busy.current = false;
      if (mounted.current) setPending(false);
    }
  }

  return {
    start,
    pending,
    failure,
    label: pending
      ? 'Starting…'
      : failure?.newLaunch
        ? `Start a new ${reading ? 'reading' : 'game'}`
        : failure
          ? 'Try again'
          : reading
            ? 'Start reading'
            : 'Play with bots',
  };
}
