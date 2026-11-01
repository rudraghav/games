import { describe, it, expect } from 'vitest';
import { games } from '@games/api-client/catalog';
import { matchesGame, discoveryRank } from '@/features/lounge/catalogue-search';

describe('Modern and social game discovery', () => {
  it('finds all optional-drink party games without changing category or spelling', () => {
    expect(
      games.filter((game) => matchesGame(game, 'drinking', 10, 'party')).map((g) => g.id),
    ).toEqual(['spill-or-chill', 'most-likely', 'hot-seat']);
    expect(
      games.filter((game) => matchesGame(game, 'flip seven', 3, 'modern')).map((g) => g.id),
    ).toEqual(['flip-7']);
  });
  it('puts the new modern games first while preserving every catalogue entry', () => {
    const sorted = [...games].sort((a, b) => discoveryRank(a.id) - discoveryRank(b.id));
    expect(sorted.slice(0, 4).map((game) => game.id)).toEqual([
      'the-gang',
      'shithead',
      'sea-salt-paper',
      'boop',
    ]);
    expect(new Set(sorted.map((game) => game.id)).size).toBe(games.length);
    expect(games.filter((game) => matchesGame(game, '', 4, 'modern')).map((g) => g.id)).toEqual(
      expect.arrayContaining(['trio', 'flip-7', 'azul', 'word-agents', 'gem-market']),
    );
  });
});
