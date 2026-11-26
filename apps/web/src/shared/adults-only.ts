'use client';
import { useCallback, useSyncExternalStore } from 'react';

/** The room setting that switches Truth or Dare to its 18+ (naughty) edition. */
export const ADULTS_ONLY = 'adults_only';

/** True when a room's (or the dialog's) settings turn the 18+ edition on. */
export function adultsOnly(
  settings: Record<string, boolean | undefined> | null | undefined,
  defaults: readonly { key: string; default: boolean }[] = [],
) {
  const fallback = defaults.find((setting) => setting.key === ADULTS_ONLY)?.default ?? false;
  return settings?.[ADULTS_ONLY] ?? fallback;
}

/**
 * Create room and Room settings: whether the dialog's choices use the 18+ edition,
 * and whether the host still has to confirm everyone in the room is 18 or older.
 */
export function adultsGate(
  mode: 'create' | 'join' | 'configure',
  gameSettings: readonly { key: string; default: boolean }[],
  settings: Record<string, boolean | undefined>,
  confirmed: boolean,
) {
  const wanted =
    mode !== 'join' &&
    gameSettings.some((setting) => setting.key === ADULTS_ONLY) &&
    adultsOnly(settings, gameSettings);
  return { wanted, blocked: wanted && !confirmed };
}

const key = (roomId: string) => `games:adults-only:${roomId}`;
const CHANGE = 'games:adults-only-change';

/** Whether this tab has already confirmed it may see this room's 18+ edition. */
export function adultsOnlyConfirmed(roomId: string) {
  try {
    return window.sessionStorage.getItem(key(roomId)) === 'confirmed';
  } catch {
    return false;
  }
}

/**
 * Remember, for this tab only, that the viewer confirmed this room's 18+ edition.
 * The host's tick in Create room counts, so they are not asked again on arrival.
 */
export function rememberAdultsOnly(roomId: string) {
  try {
    window.sessionStorage.setItem(key(roomId), 'confirmed');
  } catch {
    // Private browsing can refuse storage; the confirmation still holds in memory.
    memory.add(roomId);
  }
  window.dispatchEvent(new Event(CHANGE));
}

const memory = new Set<string>();

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(CHANGE, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/** The per-room confirmation as React state: [confirmed, confirm]. Never confirmed on the server. */
export function useAdultsOnlyConsent(roomId: string) {
  const confirmed = useSyncExternalStore(
    subscribe,
    () => memory.has(roomId) || adultsOnlyConfirmed(roomId),
    () => false,
  );
  const confirm = useCallback(() => rememberAdultsOnly(roomId), [roomId]);
  return [confirmed, confirm] as const;
}
