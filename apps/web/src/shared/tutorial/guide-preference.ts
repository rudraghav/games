'use client';

import { useSyncExternalStore } from 'react';

// Only the opt-in is kept here. Each player's moves and hand come from their saved match.
const overrides = new Map<string, boolean>();
const changed = 'games:guide-changed';

function key(matchId: string, playerId: string) {
  return `games:guide:${matchId}:${playerId}`;
}

export function setGuideEnabled(matchId: string, playerId: string, enabled: boolean) {
  const name = key(matchId, playerId);
  try {
    if (enabled) localStorage.setItem(name, '1');
    else localStorage.removeItem(name);
    overrides.delete(name);
  } catch {
    overrides.set(name, enabled);
  }
  window.dispatchEvent(new Event(changed));
}

function subscribe(callback: () => void) {
  window.addEventListener(changed, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(changed, callback);
    window.removeEventListener('storage', callback);
  };
}

export function useGuideEnabled(matchId: string | null | undefined, playerId: string) {
  return useSyncExternalStore(
    subscribe,
    () => {
      if (!matchId || !playerId) return false;
      const name = key(matchId, playerId);
      try {
        return overrides.get(name) ?? localStorage.getItem(name) === '1';
      } catch {
        return overrides.get(name) ?? false;
      }
    },
    () => false,
  );
}
