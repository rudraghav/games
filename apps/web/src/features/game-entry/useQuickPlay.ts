'use client';
import { gameById } from '@games/api-client/catalog';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@games/api-client';
import { api } from '@/lib/session';
import { roomPath } from '@/shared/game-paths';
import { keys } from '@/shared/query-keys';
import { rememberPlayer } from '@/shared/player-preferences';
import { refreshPlayer } from '@/shared/player-query';

import { setGuideEnabled } from '@/shared/tutorial/guide-preference';

type LaunchMode = 'play' | 'tutorial';
type LaunchFailure = { mode: LaunchMode; message: string; newLaunch: boolean };
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
  const [pending, setPending] = useState<LaunchMode | null>(null);
  const [failure, setFailure] = useState<LaunchFailure | null>(null);
  const request = useRef<Partial<Record<LaunchMode, string>>>({});
  const busy = useRef(false);
  const mounted = useRef(true);
  const reading = gameId === 'tarot';
  const organising = gameById(gameId).family === 'organiser';
  const noun = reading ? 'reading' : organising ? 'draw' : 'game';

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function start(mode: LaunchMode = 'play') {
    // The ref closes the gap before React paints the disabled button.
    if (busy.current) return;
    busy.current = true;
    setPending(mode);
    setFailure(null);
    const key = mode === 'tutorial' ? `games:launch:tutorial:${gameId}` : `games:launch:${gameId}`;
    if (failure?.mode === mode && failure.newLaunch) request.current[mode] = crypto.randomUUID();
    const requestId = (request.current[mode] ??= storedRequest(key) ?? crypto.randomUUID());
    try {
      sessionStorage.setItem(key, requestId);
    } catch {
      // Storage restrictions still permit same-page recovery with the ref.
    }
    try {
      const room = await api.quickPlay(gameId, requestId);
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
      if (mode === 'tutorial' && room.matchId) {
        setGuideEnabled(room.matchId, room.ownerId, true);
        router.push(`${roomPath(room)}?tutorial=${encodeURIComponent(room.matchId)}`);
      } else {
        router.push(roomPath(room));
      }
    } catch (error) {
      if (!mounted.current) return;
      const status = error instanceof ApiError ? error.status : undefined;
      setFailure(
        status === 409 || status === 410
          ? { mode, message: 'That session has ended or changed.', newLaunch: true }
          : {
              mode,
              message:
                status === 429
                  ? 'Too many starts. Try again later.'
                  : status === 401
                    ? 'Reconnect to start.'
                    : `Couldn’t start your ${noun}.`,
              newLaunch: false,
            },
      );
    } finally {
      busy.current = false;
      if (mounted.current) setPending(null);
    }
  }

  return {
    start,
    pending,
    failure,
    label(mode: LaunchMode) {
      if (pending === mode) return 'Starting…';
      if (failure?.mode === mode) {
        if (failure.newLaunch)
          return mode === 'tutorial' ? 'Start a new tutorial' : `Start a new ${noun}`;
        return 'Try again';
      }
      if (mode === 'tutorial') return 'Play tutorial';
      return reading
        ? 'Start reading'
        : organising
          ? 'Organise a draw'
          : gameById(gameId).playMode === 'solo'
            ? 'Play solo'
            : 'Play with bots';
    },
  };
}
