'use client';
import { gameById } from '@games/api-client/catalog';

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError } from '@games/api-client';
import { api } from '@/lib/session';
import { roomPath } from '@/shared/game-paths';
import { keys } from '@/shared/query-keys';
import { rememberPlayer } from '@/shared/player-preferences';
import { refreshPlayer } from '@/shared/player-query';

import { setGuideEnabled } from '@/shared/tutorial/guide-preference';
import { quickPlayIntents, type LaunchMode } from './quick-play-intent';

type LaunchFailure = { mode: LaunchMode; botCount?: number; message: string; newLaunch: boolean };
function subscribeToStorage(listener: () => void) {
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}

export function useQuickPlay(gameId: string) {
  const router = useRouter();
  const cache = useQueryClient();
  const [pending, setPending] = useState<LaunchMode | null>(null);
  const [failure, setFailure] = useState<LaunchFailure | null>(null);
  const requests = useMemo(() => quickPlayIntents(gameId), [gameId]);
  const resumeBotCount = useSyncExternalStore(
    subscribeToStorage,
    requests.resumeBotCount,
    () => null,
  );
  const busy = useRef(false);
  const mounted = useRef(true);
  const handoff = useRef<{ path: string; mode: LaunchMode; botCount?: number; id: string } | null>(
    null,
  );
  const reading = gameId === 'tarot';
  const organising = gameById(gameId).family === 'organiser';
  const noun = reading ? 'reading' : organising ? 'draw' : 'game';

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // A route push schedules navigation. Keep the retry ID through a refresh
      // or failed handoff until the private room has actually become the URL.
      const started = handoff.current;
      if (started && window.location.pathname === started.path) {
        requests.forget(started.mode, started.botCount, started.id);
        requests.settle(started.mode);
      }
    };
  }, [requests]);

  async function start(mode: LaunchMode = 'play', botCount?: number) {
    // The ref closes the gap before React paints the disabled button.
    if (busy.current) return;
    busy.current = true;
    setPending(mode);
    setFailure(null);
    const requestId = requests.begin(mode, botCount);
    try {
      const room = await api.quickPlay(gameId, requestId, botCount);
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
      const path = roomPath(room);
      handoff.current = { path, mode, botCount, id: requestId };
      if (mode === 'tutorial' && room.matchId) {
        setGuideEnabled(room.matchId, room.ownerId, true);
        router.push(`${path}?tutorial=${encodeURIComponent(room.matchId)}`);
      } else {
        router.push(path);
      }
      // Keep the button pending until navigation unmounts this entry. Another
      // tap between the saved response and the route change must not open a room.
    } catch (error) {
      if (!mounted.current) return;
      handoff.current = null;
      const status = error instanceof ApiError ? error.status : undefined;
      const ended = status === 409 || status === 410;
      if (ended) requests.forget(mode, botCount, requestId);
      setFailure(
        ended
          ? { mode, botCount, message: 'That session has ended or changed.', newLaunch: true }
          : {
              mode,
              botCount,
              message:
                status === 429
                  ? 'Too many starts. Try again later.'
                  : status === 401
                    ? 'Reconnect to start.'
                    : `Couldn’t start your ${noun}.`,
              newLaunch: false,
            },
      );
      busy.current = false;
      setPending(null);
    }
  }

  return {
    start,
    pending,
    failure,
    resumeBotCount,
    label(mode: LaunchMode, botCount?: number) {
      if (pending === mode) return 'Starting…';
      if (failure?.mode === mode && failure.botCount === botCount) {
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
