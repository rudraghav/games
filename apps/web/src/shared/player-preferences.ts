'use client';
import { useSyncExternalStore } from 'react';
import { z } from 'zod';
const schema = z.object({ name: z.string(), avatar: z.number() });
const event = 'games:player';
function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(event, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(event, callback);
  };
}
export function useHasPlayed() {
  return useSyncExternalStore(
    subscribe,
    () => !!localStorage.getItem('games:player:v1'),
    () => false,
  );
}
export function rememberedPlayer() {
  if (typeof window === 'undefined') return null;
  try {
    const parsed = schema.safeParse(JSON.parse(localStorage.getItem('games:player:v1') || 'null'));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}
export function rememberPlayer(name: string, avatar: number) {
  localStorage.setItem('games:player:v1', JSON.stringify({ name, avatar }));
  window.dispatchEvent(new Event(event));
}
