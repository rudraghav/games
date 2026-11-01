import type { Game } from '@games/api-client/catalog';

export const categories = [
  { value: 'all', label: 'All games' },
  { value: 'modern', label: 'Modern favourites' },
  { value: 'cards', label: 'Cards' },
  { value: 'boards', label: 'Board games' },
  { value: 'party', label: 'Party' },
  { value: 'cooperative', label: 'Co-op' },
  { value: 'solo', label: 'Solo' },
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
    'shedding',
    'property',
    'casino',
    'rummy',
    'grid',
    'flip-seven',
    'trio',
    'cooperative-poker',
    'number-rows',
    'paper',
  ],
  boards: ['board', 'mancala', 'gems', 'azul', 'boop'],
  party: [
    'words',
    'shedding',
    'grid',
    'party',
    'flip-seven',
    'trio',
    'cooperative-poker',
    'number-rows',
  ],
  cooperative: [],
  solo: ['tarot', 'casino'],
};
const discoveryOrder = [
  'the-gang',
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

export function matchesGame(game: Game, query: string, players: number, category: Category) {
  const text = searchableText(`${game.name} ${game.subtitle} ${aliases[game.id] || ''}`);
  return (
    searchableText(query)
      .split(/\s+/)
      .every((word) => text.includes(word)) &&
    (!players || (game.minPlayers <= players && game.maxPlayers >= players)) &&
    (category === 'all' ||
      (category === 'cooperative'
        ? game.playMode === 'cooperative'
        : families[category].includes(game.family))) &&
    (category !== 'solo' || game.minPlayers === 1)
  );
}
