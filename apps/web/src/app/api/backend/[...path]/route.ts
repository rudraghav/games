import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

const ROUTES: [RegExp, string[]][] = [
  [/^v1\/games$/, ['GET']],
  [/^v1\/me$/, ['GET']],
  [/^v1\/profile$/, ['PUT']],
  [/^v1\/rooms$/, ['POST']],
  [/^v1\/rooms\/join$/, ['POST']],
  [/^v1\/rooms\/[\da-f-]{36}$/, ['GET']],
  [/^v1\/rooms\/[\da-f-]{36}\/reading$/, ['GET', 'POST']],
  [
    /^v1\/rooms\/[\da-f-]{36}\/(heartbeat|start|actions|chat|claim-host|invite|abandon|leave)$/,
    ['POST'],
  ],
  [/^v1\/rooms\/[\da-f-]{36}\/(ready|settings)$/, ['PUT']],
  [/^v1\/rooms\/[\da-f-]{36}\/members\/[\da-f-]{36}$/, ['DELETE']],
];

async function proxy(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const path = (await context.params).path.join('/');
  if (!ROUTES.some(([pattern, methods]) => pattern.test(path) && methods.includes(request.method)))
    return new Response('Not found', { status: 404 });
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
  try {
    const response = await fetch(
      new URL(`/${path}`, process.env.BACKEND_INTERNAL_URL || 'http://127.0.0.1:8217'),
      {
        method: request.method,
        headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.text(),
        cache: 'no-store',
        signal: AbortSignal.timeout(path.endsWith('/reading') ? 75000 : 15000),
      },
    );
    return new Response(response.body, {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'private, no-store' },
    });
  } catch (error) {
    console.error(
      '[games/proxy] Backend request failed',
      error instanceof Error ? error.name : 'Unknown',
    );
    return Response.json(
      { detail: 'The table is temporarily unreachable. Please reconnect.' },
      { status: 503 },
    );
  }
}
export { proxy as GET, proxy as POST, proxy as PUT, proxy as DELETE };
