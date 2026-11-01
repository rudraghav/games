'use client';
import { useEffect, useState } from 'react';
import type { Match, Room } from '@games/api-client';
import { casinoSnapshot, casinoTransition, type CasinoTransition } from './casino-transitions';

/** New committed snapshots animate once; resume/refresh establishes a baseline. */
export function useCasinoMotion(room: Room, match: Match, selfId: string, reduced = false) {
  const [state, setState] = useState(() => ({
    input: room,
    snapshot: casinoSnapshot(room, match, selfId),
    event: null as CasinoTransition | null,
    visible: true,
    focused: true,
    online: true,
    suspended: false,
    reduced,
  }));
  let current = state;
  if (state.input !== room || state.reduced !== reduced) {
    const next = casinoSnapshot(room, match, selfId);
    const foreground = state.visible && state.focused && state.online;
    const advanced =
      next.matchId !== state.snapshot.matchId || next.version > state.snapshot.version;
    current = {
      ...state,
      input: room,
      reduced,
      snapshot: advanced || next.version === state.snapshot.version ? next : state.snapshot,
      suspended: !foreground,
      // Cancel the event itself so toggling motion back on cannot replay it.
      event:
        next.paused || reduced
          ? null
          : advanced
            ? foreground && !state.suspended
              ? casinoTransition(state.snapshot, next)
              : null
            : state.event,
    };
    // React's guarded previous-props pattern updates the derived state before
    // committing children, avoiding one frame that would replay an old cue.
    setState(current);
  }
  useEffect(() => {
    const visibility = () => {
      const visible = document.visibilityState === 'visible';
      setState((previous) =>
        previous.visible === visible
          ? previous
          : {
              ...previous,
              visible,
              suspended: true,
              event: null,
            },
      );
    };
    const focus = () =>
      setState((previous) => ({ ...previous, focused: true, suspended: true, event: null }));
    const blur = () =>
      setState((previous) => ({ ...previous, focused: false, suspended: true, event: null }));
    const online = () =>
      setState((previous) => ({ ...previous, online: true, suspended: true, event: null }));
    const offline = () =>
      setState((previous) => ({ ...previous, online: false, suspended: true, event: null }));
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('focus', focus);
    window.addEventListener('blur', blur);
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    return () => {
      document.removeEventListener('visibilitychange', visibility);
      window.removeEventListener('focus', focus);
      window.removeEventListener('blur', blur);
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
    };
  }, []);
  useEffect(() => {
    if (!current.event) return;
    const key = current.event.key;
    const timeout = window.setTimeout(
      () =>
        setState((previous) =>
          previous.event?.key === key ? { ...previous, event: null } : previous,
        ),
      900,
    );
    return () => window.clearTimeout(timeout);
  }, [current.event]);
  return current.event;
}
