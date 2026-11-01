'use client';
import { createBrowserClient } from '@supabase/ssr';
import { createApi, startDevelopmentSession } from '@games/api-client';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key ? createBrowserClient(url, key) : null;
let creatingSession: Promise<void> | null = null;
let hasDevelopmentSession = false;

export async function ensureSession() {
  if (creatingSession) return creatingSession;
  creatingSession = (async () => {
    if (supabase) {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        const result = await supabase.auth.signInAnonymously();
        if (result.error)
          throw new Error('We could not start your guest session. Please try again.');
      }
    } else if (process.env.NEXT_PUBLIC_DEV_AUTH === 'true' && !hasDevelopmentSession) {
      await startDevelopmentSession();
      hasDevelopmentSession = true;
    }
  })();
  try {
    await creatingSession;
  } finally {
    creatingSession = null;
  }
}

export const api = createApi(async () => {
  await ensureSession();
  return supabase ? (await supabase.auth.getSession()).data.session?.access_token || null : null;
});
