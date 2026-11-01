import type { Game } from '@games/api-client/catalog';

export const categories = [
  { value: 'all', label: 'All games' },
  { value: 'cards', label: 'Cards' },
  { value: 'boards', label: 'Board games' },
  { value: 'party', label: 'Party' },
  { value: 'solo', label: 'Solo' },
] as const;
export type Category = (typeof categories)[number]['value'];
const families: Record<Category, readonly string[]> = {
  all: [],
  cards: ['shedding', 'property', 'casino', 'rummy', 'grid'],
  boards: ['board', 'mancala', 'gems'],
  party: ['words', 'shedding', 'grid'],
  solo: ['tarot', 'casino'],
};
const aliases: Record<string, string> = {
  holdem: 'poker texas hold em',
  'teen-patti': 'poker flush',
  rummy: 'indian 13 card',
  'word-agents': 'codenames words teams',
  'gem-market': 'splendor gems',
  checkers: 'draughts',
  mancala: 'kalah seeds',
  tarot: 'reading fortune',
};
export function matchesGame(game: Game, query: string, players: number, category: Category) {
  const text = `${game.name} ${game.subtitle} ${aliases[game.id] || ''}`.toLocaleLowerCase();
  return (
    query
      .trim()
      .toLocaleLowerCase()
      .split(/\s+/)
      .every((word) => text.includes(word)) &&
    (!players || (game.minPlayers <= players && game.maxPlayers >= players)) &&
    (category === 'all' || families[category].includes(game.family)) &&
    (category !== 'solo' || game.minPlayers === 1)
  );
}
