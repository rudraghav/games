/** Scoped deployment HTTP checks. Tokens stay in memory and never enter output. */
import catalogue from '../packages/api-client/src/generated/catalog.json' with { type: 'json' };
const target = new URL(process.env.GAMES_TEST_URL || 'http://invalid.local');
if (
  target.protocol !== 'https:' ||
  !(
    target.hostname === 'games-seven-black.vercel.app' ||
    /^games-[a-z0-9]+-rudraghavs-projects\.vercel\.app$/.test(target.hostname)
  )
) {
  throw new Error('Set the exact personal Games deployment URL.');
}
const headers = process.env.VERCEL_OIDC_TOKEN
  ? { 'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN }
  : {};
for (const path of [
  '/api/backend/v1/games',
  '/tarot/major-01.png',
  ...['01', '02', '03', '04'].map((sheet) => `/tarot/major-${sheet}.webp`),
  ...['wands', 'cups', 'swords', 'pentacles'].map((suit) => `/tarot/minor-${suit}-v1.webp`),
  '/game-art/boop-pieces-v1.webp',
  '/game-art/paper-symbols-v1.webp',
  '/design',
  '/api/backend/v1/me',
  '/api/dev-session',
]) {
  const start = Date.now();
  const response = await fetch(new URL(path, target), {
    headers,
    redirect: 'manual',
    method: path === '/api/dev-session' ? 'POST' : 'GET',
  });
  const summary = {
    path: path.split('?')[0],
    status: response.status,
    kind: response.headers.get('content-type'),
    ms: Date.now() - start,
  };
  if (path.endsWith('/games') && response.ok) {
    const games = await response.json();
    summary.games = games.length;
    if (
      games.length !== catalogue.length ||
      catalogue.some((game) => !games.some((entry) => entry.id === game.id))
    )
      throw new Error('Serving catalogue differs from the release catalogue.');
    if (
      !games.every(
        (game) =>
          ['competitive', 'cooperative', 'solo'].includes(game.play_mode) &&
          ['high', 'low', 'none'].includes(game.score_order) &&
          typeof game.score_label === 'string',
      )
    )
      throw new Error('Serving catalogue is missing result semantics.');
  }
  console.log(summary);
  const expected = path.endsWith('/me')
    ? 401
    : ['/api/dev-session', '/design'].includes(path)
      ? 404
      : 200;
  if (response.status !== expected) throw new Error(`Unexpected status at ${path}`);
  if (!response.bodyUsed) await response.body?.cancel();
}
