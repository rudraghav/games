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
    // An explicit Off overrides an old tutorial URL, including in another tab.
    localStorage.setItem(name, enabled ? '1' : '0');
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
      if (!matchId || !playerId) return null;
      const name = key(matchId, playerId);
      const override = overrides.get(name);
      if (override !== undefined) return override;
      try {
        const value = localStorage.getItem(name);
        return value === null ? null : value === '1';
      } catch {
        return null;
      }
    },
    () => null,
  );
}
