'use client';
import { useEffect, useId, useState } from 'react';
import { supabase } from '@/lib/session';

/** Separate private query results across account changes, including changes in another tab. */
export function usePrivateViewScope(localPlayer?: string) {
  const screen = useId();
  const [identity, setIdentity] = useState<string>();
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      setIdentity(session?.user.id ?? 'signed-out');
    });
    return () => data.subscription.unsubscribe();
  }, []);
  return supabase ? identity : (localPlayer ?? screen);
}
