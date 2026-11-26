import type { Game } from '@games/api-client/catalog';
import { discoveryRank, findGames, gameMinutes, matchesGame, teamGames } from './catalogue-search';

/**
 * The one row of filters on the home page. Each is an occasion ("who is
 * playing and how long have we got"), not a kind of game; kinds of game are
 * found by searching.
 */
export const occasions = [
  { value: 'all', label: 'All' },
  { value: 'quick-bots', label: 'Quick with bots' },
  { value: 'friends', label: 'With friends' },
  { value: 'two-players', label: 'Two players' },
  { value: 'solo', label: 'Solo' },
  { value: 'teams', label: 'For teams' },
] as const;
export type Occasion = (typeof occasions)[number]['value'];

/** Longer matches made of quick turns that play well against bots. */
export const quickBotPicks: readonly string[] = ['liars-dice', 'bluff'];

const byDiscovery = (a: Game, b: Game) => discoveryRank(a.id) - discoveryRank(b.id);

/**
 * The games an occasion shows, in the order it shows them. Every game appears
 * once at most.
 *
 * - All: the whole catalogue in discovery order.
 * - Quick with bots: bots can fill the seats and the longest listed length is
 *   20 minutes or less, plus the hand-picked `quickBotPicks`, whose matches run
 *   longer but whose turns are quick and play well against bots.
 * - With friends: the party shelf's games that seat four or more.
 * - Two players: playable by exactly two, the games made for two first.
 * - Solo: nobody else needed (the organiser's tool is not a solo game).
 * - For teams: the documented allowlist, in its own order.
 */
export function occasionGames(occasion: Occasion, games: readonly Game[]): Game[] {
  switch (occasion) {
    case 'quick-bots':
      return games
        .filter(
          (game) =>
            game.botsSupported &&
            (gameMinutes(game).longest <= 20 || quickBotPicks.includes(game.id)),
        )
        .sort(byDiscovery);
    case 'friends':
      return games
        .filter((game) => matchesGame(game, '', 0, 'party') && game.maxPlayers >= 4)
        .sort(byDiscovery);
    case 'two-players':
      return games
        .filter((game) => game.minPlayers <= 2 && game.maxPlayers >= 2)
        .sort(
          (a, b) => Number(b.maxPlayers === 2) - Number(a.maxPlayers === 2) || byDiscovery(a, b),
        );
    case 'solo':
      return games
        .filter((game) => game.minPlayers === 1 && game.family !== 'organiser')
        .sort(byDiscovery);
    case 'teams':
      return teamGames.flatMap((id) => {
        const game = games.find((item) => item.id === id);
        return game ? [game] : [];
      });
    default:
      return [...games].sort(byDiscovery);
  }
}

/** What the grid shows: the occasion's games, narrowed by the search box. */
export function browseGames(games: readonly Game[], query: string, occasion: Occasion): Game[] {
  const pool = occasionGames(occasion, games);
  return query.trim() ? findGames(pool, query, 0, 'all') : pool;
}

/** In Quick with bots a game opens ready to play against bots. */
export function opensWithBots(occasion: Occasion, game: Pick<Game, 'botsSupported'>) {
  return occasion === 'quick-bots' && game.botsSupported;
}
