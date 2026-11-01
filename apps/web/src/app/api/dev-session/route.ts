import { cookies } from 'next/headers';
import { z } from 'zod';

export async function POST() {
  if (process.env.DEV_AUTH_ENABLED !== 'true' || process.env.VERCEL)
    return new Response('Not found', { status: 404 });
  const store = await cookies();
  if (store.get('games-player')) return Response.json({ ok: true });
  const response = await fetch(
    new URL('/v1/dev/session', process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8217'),
    { method: 'POST', cache: 'no-store' },
  );
  if (!response.ok) return Response.json({ error: 'Player session unavailable.' }, { status: 503 });
  const parsed = z.object({ token: z.string().min(20) }).parse(await response.json());
  store.set('games-player', parsed.token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    maxAge: 604800,
  });
  return Response.json({ ok: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}
