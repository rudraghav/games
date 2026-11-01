/** Scoped deployment HTTP checks. Tokens stay in memory and never enter output. */
const target = new URL(process.env.GAMES_TEST_URL || 'http://invalid.local');
if (target.protocol !== 'https:' || !(target.hostname === 'games-seven-black.vercel.app' || /^games-[a-z0-9]+-rudraghavs-projects\.vercel\.app$/.test(target.hostname))) {
  throw new Error('Set the exact personal Games deployment URL.');
}
const headers = process.env.VERCEL_OIDC_TOKEN
  ? { 'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN } : {};
for (const path of ['/api/backend/v1/games', '/tarot/major-01.png', ...['01', '02', '03', '04'].map((sheet) => `/tarot/major-${sheet}.webp`), '/api/backend/v1/me', '/api/dev-session']) {
  const start = Date.now();
  const response = await fetch(new URL(path, target), { headers, redirect: 'manual', method: path === '/api/dev-session' ? 'POST' : 'GET' });
  const summary = { path: path.split('?')[0], status: response.status, kind: response.headers.get('content-type'), ms: Date.now() - start };
  if (path.endsWith('/games') && response.ok) summary.games = (await response.json()).length;
  console.log(summary);
  const expected = path.endsWith('/me') ? 401 : path.endsWith('/api/dev-session') ? 404 : 200;
  if (response.status !== expected) throw new Error(`Unexpected status at ${path}`);
  if (!response.bodyUsed) await response.body?.cancel();
}
