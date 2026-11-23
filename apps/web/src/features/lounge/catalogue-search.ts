import type { Game } from '@games/api-client/catalog';
import Fuse from 'fuse.js';

/**
 * Kinds of game. They are the search vocabulary ("cards", "board games") and
 * the party shelf behind the With friends occasion; the home page's own
 * filters are the occasions in `occasions.ts`.
 */
export const categories = [
  { value: 'all', label: 'All games' },
  { value: 'modern', label: 'Modern favourites' },
  { value: 'cards', label: 'Cards' },
  { value: 'casino', label: 'Casino' },
  { value: 'boards', label: 'Board games' },
  { value: 'party', label: 'Party' },
  { value: 'teams', label: 'For teams' },
  { value: 'cooperative', label: 'Co-op' },
  { value: 'solo', label: 'Solo + bots' },
] as const;
export type Category = (typeof categories)[number]['value'];
const families: Record<Category, readonly string[]> = {
  all: [],
  modern: [
    'flip-seven',
    'trio',
    'azul',
    'words',
    'gems',
    'grid',
    'cooperative-poker',
    'number-rows',
    'paper',
    'boop',
  ],
  cards: [
    'palace',
    'shedding',
    'property',
    'rummy',
    'grid',
    'flip-seven',
    'trio',
    'cooperative-poker',
    'number-rows',
    'paper',
  ],
  casino: ['casino'],
  boards: ['board', 'mancala', 'gems', 'azul', 'boop'],
  party: [
    'palace',
    'words',
    'shedding',
    'grid',
    'party',
    'flip-seven',
    'trio',
    'cooperative-poker',
    'number-rows',
    'organiser',
  ],
  // For teams is a hand-picked list of games, not a set of families: see `teamGames`.
  teams: [],
  cooperative: [],
  solo: ['tarot', 'casino'],
};

/**
 * Games picked for colleagues, in the order the section shows them. A game is
 * here only if what it shows by default is fine in a work setting:
 *
 * - No casino tables (Hold'em, Teen Patti, Blackjack, Roulette, Slots) and no
 *   poker-table look, so the cooperative The Gang is left out too.
 * - No drinking games. Spill or Chill is out: its answers are whatever people
 *   say aloud, so nothing we reviewed controls what comes up. Most Likely and
 *   Hot Seat are in: every prompt on screen comes from their reviewed decks
 *   (48 each; friendly votes and A/B preferences, nothing about alcohol,
 *   romance or put-downs) and their optional sip prompts are off by default.
 * - No game whose name or premise would be awkward at work (Shithead) and no
 *   elimination variants that leave colleagues watching (the No Mercy decks).
 *
 * Secret Santa is included as the organiser's tool for a team gift exchange.
 */
export const teamGames: readonly string[] = [
  'most-likely',
  'hot-seat',
  'word-agents',
  'uno',
  'flip-7',
  'six-nimmt',
  'trio',
  'skyjo',
  'secret-santa',
  'sea-salt-paper',
  'azul',
  'gem-market',
];
/** The honest line shown wherever the team picks are. */
export const teamsNote =
  'Picked for colleagues: no betting games, and drink prompts stay off unless you turn them on.';

export const teamSizes = [
  { value: 'small', label: '2–4', min: 2, max: 4 },
  { value: 'medium', label: '5–8', min: 5, max: 8 },
  { value: 'large', label: '9+', min: 9, max: Infinity },
] as const;
export const teamTimes = [
  { value: 'quick', label: 'Under 15 min' },
  { value: 'standard', label: '15–30 min' },
] as const;
export type TeamSize = (typeof teamSizes)[number]['value'];
export type TeamTime = (typeof teamTimes)[number]['value'];
export interface TeamFilters {
  size?: TeamSize | '';
  time?: TeamTime | '';
}

/** A game's listed length in minutes: "10–20" is 10 to 20, "15" is 15 to 15. */
export function gameMinutes(game: Pick<Game, 'minutes'>) {
  const numbers = (game.minutes.match(/\d+/g) ?? []).map(Number);
  const shortest = numbers[0] ?? 0;
  return { shortest, longest: numbers.at(-1) ?? shortest };
}

/**
 * The two quick filters inside For teams. A group size matches when the game
 * seats some group in that range (an organiser's draw fits any group). "Under
 * 15 min" means the game can finish in under 15 minutes (its shortest listed
 * length); "15–30 min" means it is listed from 15 minutes up to 30 at most.
 */
export function matchesTeamFilters(game: Game, filters: TeamFilters = {}) {
  const size = teamSizes.find((item) => item.value === filters.size);
  if (
    size &&
    game.family !== 'organiser' &&
    (game.maxPlayers < size.min || game.minPlayers > size.max)
  )
    return false;
  if (!filters.time) return true;
  const { shortest, longest } = gameMinutes(game);
  return filters.time === 'quick' ? shortest < 15 : shortest >= 15 && longest <= 30;
}
const discoveryOrder = [
  'the-gang',
  'shithead',
  'sea-salt-paper',
  'boop',
  'six-nimmt',
  'flip-7',
  'trio',
  'azul',
  'spill-or-chill',
  'most-likely',
  'hot-seat',
  'tarot',
];
/** Curated discovery order is separate from the engine registry's stable order. */
export function discoveryRank(id: string) {
  const rank = discoveryOrder.indexOf(id);
  return rank < 0 ? discoveryOrder.length : rank;
}
const aliases: Record<string, string> = {
  holdem: 'poker texas hold em',
  'teen-patti': 'poker flush',
  roulette: 'european roulette wheel single zero red black straight up',
  slots: 'slot machine fruit machine one armed bandit reels payline',
  rummy: 'indian 13 card',
  'word-agents': 'codenames words teams',
  'gem-market': 'splendor gems',
  checkers: 'draughts',
  mancala: 'kalah seeds',
  tarot: 'reading fortune',
  'flip-7': 'flip seven push luck modern recent',
  trio: 'memory matching modern recent',
  azul: 'tiles mosaic drafting modern board',
  'spill-or-chill': 'drinking drinks sip truth questions party',
  'most-likely': 'drinking drinks sip voting party',
  'hot-seat': 'drinking drinks sip predictions party',
  'the-gang': 'cooperative co op poker heist team',
  'six-nimmt': '6 nimmt 6nimmt take 5 take five numbers bullheads',
  'sea-salt-paper': 'sea salt and paper origami cards collection',
  boop: 'cats kittens bed board',
  shithead: 'shit head palace china hand ten two slide shedding',
  'secret-santa':
    'secret santa gift exchange draw names drawnames name draw kris kringle kriskindle christmas xmas presents organiser organizer party group',
};
function searchableText(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[’']/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** The three casino tables that are also card games. */
const casinoCardTables = ['holdem', 'teen-patti', 'blackjack'];

/**
 * The shelves a game sits on, as words. The home page no longer lists shelves
 * as filters, so typing "cards", "board games", "party" or "co-op" in the
 * search box is how someone browses by kind of game.
 */
function shelfWords(game: Game) {
  const words: string[] = categories
    .filter(
      ({ value }) =>
        value !== 'all' &&
        value !== 'teams' &&
        value !== 'solo' &&
        (value === 'cooperative'
          ? game.playMode === 'cooperative'
          : families[value].includes(game.family) ||
            (value === 'cards' && casinoCardTables.includes(game.id))),
    )
    .map(({ label }) => label);
  if (game.playMode === 'cooperative') words.push('cooperative');
  if (game.minPlayers === 1 || game.botsSupported) words.push('solo', 'bots');
  return words.join(' ');
}

export function matchesGame(game: Game, query: string, players: number, category: Category) {
  const casino = game.family === 'casino';
  const text = searchableText(
    `${game.name} ${game.subtitle} ${aliases[game.id] || ''} ${shelfWords(game)}`,
  );
  const casinoCards = category === 'cards' && casino && casinoCardTables.includes(game.id);
  return (
    searchableText(query)
      .split(/\s+/)
      .every((word) => text.includes(word)) &&
    (!players ||
      // One organiser runs a draw for the whole group, whatever its size.
      game.family === 'organiser' ||
      (game.maxPlayers >= players &&
        (game.minPlayers <= players || (players === 1 && game.botsSupported)))) &&
    (category === 'all' ||
      (category === 'teams'
        ? teamGames.includes(game.id)
        : category === 'solo'
          ? game.minPlayers === 1 || game.botsSupported
          : category === 'cooperative'
            ? game.playMode === 'cooperative'
            : casinoCards || families[category].includes(game.family))) &&
    (category !== 'solo' || game.minPlayers === 1 || game.botsSupported)
  );
}

/** Exact names/aliases win; a bounded fuzzy fallback also accepts ordinary typos. */
export function findGames(
  games: readonly Game[],
  query: string,
  players: number,
  category: Category,
  /** Only read inside For teams; every other category ignores it. */
  team: TeamFilters = {},
) {
  const teams = category === 'teams';
  const eligible = games.filter(
    (game) =>
      matchesGame(game, '', players, category) && (!teams || matchesTeamFilters(game, team)),
  );
  const normalized = searchableText(query);
  const exact = eligible.filter((game) => matchesGame(game, query, players, category));
  if (!normalized || exact.length)
    return exact.sort((a, b) =>
      // The team picks keep their curated order; everything else its discovery order.
      teams
        ? teamGames.indexOf(a.id) - teamGames.indexOf(b.id)
        : discoveryRank(a.id) - discoveryRank(b.id),
    );
  if (normalized.length < 3) return [];
  const index = new Fuse(
    eligible.map((game) => ({
      game,
      name: searchableText(game.name),
      aliases: searchableText(aliases[game.id] || ''),
    })),
    {
      keys: [
        { name: 'name', weight: 0.8 },
        { name: 'aliases', weight: 0.2 },
      ],
      threshold: 0.28,
      ignoreLocation: true,
      minMatchCharLength: 3,
    },
  );
  return index.search(normalized).map((result) => result.item.game);
}
