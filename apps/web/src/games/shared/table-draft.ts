'use client';
import { useCallback, useState } from 'react';

type Update<T> = T | ((current: T) => T);

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.sessionStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

/**
 * The viewer's own unsent choice, kept for this tab across refresh and reconnect.
 * Scope it to one decision (room, match and the round or version it belongs to)
 * so it can never carry into a later decision. Store only ids the viewer already
 * sees; legal actions still decide whether a restored choice can be used.
 */
export function useTableDraft<T>(scope: string, initial: T) {
  const key = `games:draft:${scope}`;
  const [state, setState] = useState(() => ({ key, value: read(key, initial) }));
  if (state.key !== key) setState({ key, value: read(key, initial) });
  const value = state.key === key ? state.value : initial;
  const empty = JSON.stringify(initial);
  const update = useCallback(
    (next: Update<T>) =>
      setState((current) => {
        const base = current.key === key ? current.value : (JSON.parse(empty) as T);
        const value = typeof next === 'function' ? (next as (current: T) => T)(base) : next;
        try {
          if (value === null || value === undefined || JSON.stringify(value) === empty)
            window.sessionStorage.removeItem(key);
          else window.sessionStorage.setItem(key, JSON.stringify(value));
        } catch {
          // Private browsing can refuse storage; the choice still works in memory.
        }
        return { key, value };
      }),
    [key, empty],
  );
  return [value, update] as const;
}
