import { describe, expect, it } from 'vitest';
import { games } from '@games/api-client/catalog';
import { matchesGame } from './catalogue-search';

describe('catalogue discovery', () => {
  it('finds familiar alternate game names without changing catalogue identities', () => {
    for (const [query, id] of [
      ['poker', 'holdem'],
      ['codenames', 'word-agents'],
      ['splendor', 'gem-market'],
      ['draughts', 'checkers'],
      ['kalah', 'mancala'],
      ["hold'em", 'holdem'],
      ['6-nimmt!', 'six-nimmt'],
      ['6nimmt', 'six-nimmt'],
      ['boop.', 'boop'],
      ['SEA SALT & PAPER', 'sea-salt-paper'],
      ['Azúl', 'azul'],
    ]) {
      expect(
        games
          .filter((game) => matchesGame(game, query.toUpperCase(), 0, 'all'))
          .some((game) => game.id === id),
      ).toBe(true);
    }
  });
  it('uses cooperative metadata and correct paper family for discovery', () => {
    expect(
      games.filter((game) => matchesGame(game, '', 4, 'cooperative')).map((game) => game.id),
    ).toEqual(['the-gang']);
    for (const category of ['modern', 'cards'] as const) {
      expect(
        games.filter((game) => matchesGame(game, 'origami', 4, category)).map((game) => game.id),
      ).toEqual(['sea-salt-paper']);
    }
    expect(games.filter((game) => matchesGame(game, 'the gang', 2, 'cooperative'))).toEqual([]);
  });
  it('intersects group size and category and handles an empty search', () => {
    const twoPlayerBoards = games.filter((game) => matchesGame(game, ' ', 2, 'boards'));
    expect(twoPlayerBoards.some((game) => game.id === 'checkers')).toBe(true);
    expect(twoPlayerBoards.some((game) => game.id === 'mancala')).toBe(true);
    expect(games.filter((game) => matchesGame(game, '', 10, 'boards'))).toEqual([]);
    expect(games.filter((game) => matchesGame(game, '', 1, 'solo')).map((game) => game.id)).toEqual(
      expect.arrayContaining(['blackjack', 'tarot']),
    );
    expect(games.filter((game) => matchesGame(game, 'not a game', 0, 'all'))).toEqual([]);
  });
});
