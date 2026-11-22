import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';
import { proxyFailure } from '@/lib/proxy-diagnostics';
import {
  isBackendRoute,
  playerSearchRoute,
  progressRoute,
  savedReadingRoute,
  utcOffset,
} from '@/lib/backend-routes';

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const path = (await context.params).path.join('/');
  if (!isBackendRoute(path, request.method)) return new Response('Not found', { status: 404 });
  const origin = request.headers.get('origin');
  if (request.method !== 'GET' && origin) {
    try {
      if (new URL(origin).host !== request.headers.get('host'))
        return Response.json(
          { detail: 'Open this room on the same site to continue.' },
          { status: 403 },
        );
    } catch {
      return new Response('Invalid origin', { status: 403 });
    }
  }
  const authorization = request.headers.get('authorization');
  const dev =
    process.env.DEV_AUTH_ENABLED === 'true' && !process.env.VERCEL
      ? (await cookies()).get('games-player')?.value
      : null;
  if (!authorization && !dev && path !== 'v1/games')
    return new Response('Session required', { status: 401 });
  const headers = new Headers({ 'Content-Type': 'application/json' });
  if (authorization || dev) headers.set('Authorization', authorization || `Bearer ${dev}`);
  const target = new URL(`/${path}`, process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8217');
  if (savedReadingRoute.test(path)) {
    const styles = request.nextUrl.searchParams.getAll('style');
    if (styles.length > 1 || styles.some((style) => style !== 'classic' && style !== 'fun')) {
      return Response.json({ detail: 'Choose Fun or Classic.' }, { status: 422 });
    }
    if (styles.length) target.searchParams.set('style', styles[0]);
  }
  if (playerSearchRoute.test(path)) {
    // Only the search text travels on; the backend checks its length and rate.
    const terms = request.nextUrl.searchParams.getAll('q');
    if (terms.length !== 1 || terms[0].length > 32)
      return Response.json({ detail: 'Type at least 2 letters to search.' }, { status: 422 });
    target.searchParams.set('q', terms[0]);
  }
  if (progressRoute.test(path)) {
    // A day boundary only; a missing or odd value falls back to the server's UTC day.
    const offset = utcOffset(request.nextUrl.searchParams.getAll('tz_offset'));
    if (offset) target.searchParams.set('tz_offset', offset);
  }
  const started = performance.now();
  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
      cache: 'no-store',
      signal: AbortSignal.timeout(path.endsWith('/reading') ? 120000 : 15000),
    });
    if (response.status >= 500)
      console.error('[games/proxy]', proxyFailure(path, request.method, started, response.status));
    return new Response(response.body, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error('[games/proxy]', proxyFailure(path, request.method, started, 503, error));
    return Response.json(
      { detail: 'The table is temporarily unreachable. Please reconnect.' },
      { status: 503 },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
