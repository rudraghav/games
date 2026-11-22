import type { Game } from '@games/api-client/catalog';
import {
  discoveryRank,
  gameMinutes,
  matchesGame,
  teamGames,
  teamsNote,
  type Category,
} from './catalogue-search';

/** The library view a collection's "See all" opens. */
export interface LibraryPreset {
  category: Category;
  /** The Players select: 0 is any group size. */
  players: number;
}

export interface Collection {
  id: 'quick-bots' | 'teams' | 'game-night' | 'two-players' | 'solo';
  title: string;
  /** One plain line under the title. */
  note: string;
  /** What "See all" sets in the library below. */
  preset: LibraryPreset;
  /** Rail cards read "You + bots" and open the game ready to play alone. */
  withBots?: boolean;
  pick: (games: readonly Game[]) => Game[];
}

const RAIL_LIMIT = 12;
const byDiscovery = (a: Game, b: Game) => discoveryRank(a.id) - discoveryRank(b.id);

/**
 * The home page's curated rails, in order. Each is a small, named shelf by
 * occasion; the full library below stays the complete list.
 */
export const collections: readonly Collection[] = [
  {
    id: 'quick-bots',
    title: 'Quick with bots',
    note: 'Twenty minutes at most, and bots fill the other seats.',
    preset: { category: 'solo', players: 0 },
    withBots: true,
    // Short means the longest listed length is 20 minutes or less.
    pick: (games) => games.filter((game) => game.botsSupported && gameMinutes(game).longest <= 20),
  },
  {
    id: 'teams',
    title: 'For teams',
    note: teamsNote,
    preset: { category: 'teams', players: 0 },
    pick: (games) =>
      teamGames.flatMap((id) => {
        const game = games.find((item) => item.id === id);
        return game ? [game] : [];
      }),
  },
  {
    id: 'game-night',
    title: 'Game night',
    note: 'Party games and games for four or more.',
    preset: { category: 'party', players: 0 },
    pick: (games) =>
      games
        .filter((game) => matchesGame(game, '', 0, 'party') && game.maxPlayers >= 4)
        .sort(byDiscovery),
  },
  {
    id: 'two-players',
    title: 'Two players',
    note: 'Made for two, or just as good with two.',
    preset: { category: 'all', players: 2 },
    pick: (games) =>
      games
        .filter((game) => game.minPlayers <= 2 && game.maxPlayers >= 2)
        // Games made for exactly two come first.
        .sort(
          (a, b) => Number(b.maxPlayers === 2) - Number(a.maxPlayers === 2) || byDiscovery(a, b),
        ),
  },
  {
    id: 'solo',
    title: 'On your own',
    note: 'No one else needed.',
    preset: { category: 'solo', players: 1 },
    pick: (games) =>
      games
        .filter((game) => game.minPlayers === 1 && game.family !== 'organiser')
        .sort(byDiscovery),
  },
];

/** A collection's rail: at most a dozen games, never the same game twice. */
export function collectionGames(collection: Collection, games: readonly Game[]) {
  return [...new Set(collection.pick(games))].slice(0, RAIL_LIMIT);
}
