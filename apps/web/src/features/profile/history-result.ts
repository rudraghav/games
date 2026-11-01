import type { Game } from '@games/api-client/catalog';

/** Saved history uses the same declared units and outcome semantics as the table. */
export function historyResult(game: Game, score: number, won: boolean) {
  if (game.id === 'tarot') return 'A little perspective';
  const points = `${score} ${game.scoreLabel.toLocaleLowerCase()}`;
  if (game.playMode === 'cooperative')
    return `${won ? 'You won together' : 'Team defeat'}${game.scoreOrder === 'none' ? '' : ` · ${points}`}`;
  if (won) return 'You won ✦';
  return game.scoreOrder === 'none' ? 'Match finished' : points;
}
