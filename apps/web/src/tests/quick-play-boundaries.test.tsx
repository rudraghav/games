import { describe, expect, it } from 'vitest';
import { games } from '@games/api-client/catalog';
import { isBackendRoute } from '@/lib/backend-routes';

describe('Intentful quick-play proxy boundary', () => {
  it('permits a versioned POST for every registered game', () => {
    for (const game of games) {
      const path = `v1/games/${game.id}/play`;
      expect(isBackendRoute(path, 'POST')).toBe(true);
      for (const method of ['GET', 'PUT', 'PATCH', 'DELETE'])
        expect(isBackendRoute(path, method)).toBe(false);
    }
  });

  it('does not expose arbitrary actions or encoded path traversal', () => {
    for (const path of [
      'v1/games/tarot/play/admin',
      'v1/games/tarot/reading',
      'v1/games/../play',
      'v1/games/%2e%2e/play',
      'v1/games/Tarot/play',
      `v1/games/${'a'.repeat(33)}/play`,
      'v1/games//play',
    ])
      expect(isBackendRoute(path, 'POST')).toBe(false);
  });
});
