/** Scoped deployment HTTP checks. Tokens stay in memory and never enter output. */
import catalogue from '../packages/api-client/src/generated/catalog.json' with { type: 'json' };
import faces from '../apps/web/public/playing-cards/SOURCE.json' with { type: 'json' };
import portraits from '../apps/web/public/characters/character-art-v2/manifest.json' with { type: 'json' };
import { createHash } from 'node:crypto';
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
  ...['gem-districts-v1', 'ceramic-tiles-v1', 'board-tokens-v1', 'table-surfaces-v1'].map(
    (name) => `/game-art/${name}.webp`,
  ),
  ...Object.keys(faces.files).map((name) => `/playing-cards/${name}`),
  ...portraits.map((portrait) => portrait.image),
  '/design',
  '/design/deal',
  '/design/midgame',
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
    summary.botGames = games.filter((game) => game.bots_supported).length;
    if (
      games.length !== catalogue.length ||
      catalogue.some(
        (game) =>
          !games.some(
            (entry) => entry.id === game.id && entry.bots_supported === game.bots_supported,
          ),
      )
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
    : ['/api/dev-session', '/design', '/design/deal', '/design/midgame'].includes(path)
      ? 404
      : 200;
  if (response.status !== expected) throw new Error(`Unexpected status at ${path}`);
  if (
    /^\/(tarot|game-art|playing-cards|characters)\//.test(path) &&
    !summary.kind?.startsWith('image/')
  )
    throw new Error(`Expected artwork at ${path}`);
  const portrait = portraits.find((entry) => entry.image === path);
  if (portrait) {
    const bytes = Buffer.from(await response.arrayBuffer());
    if (
      bytes.length !== portrait.bytes ||
      createHash('sha256').update(bytes).digest('hex') !== portrait.sha256
    )
      throw new Error(`Serving portrait differs from the attributed release asset at ${path}`);
  }
  if (!response.bodyUsed) await response.body?.cancel();
}
