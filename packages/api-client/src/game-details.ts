import { z } from 'zod';
import type { components } from './generated/schema';

type Detail = components['schemas']['GameView']['detail'];
const counts = z.record(z.string(), z.number().int().nonnegative());
const boardSchema = z.object({
  rows: z.number().int().min(1).max(8),
  columns: z.number().int().min(1).max(8),
  draw: z.boolean(),
  last_move: z.number().int().nullable(),
  outcome_reason: z
    .enum(['four-in-a-row', 'board-full', 'no-pieces', 'no-legal-move', 'quiet-limit', 'threefold'])
    .nullable()
    .default(null),
  winning_cells: z.array(z.number().int().min(0).max(63)).default([]),
});
const wordsSchema = z.object({
  active_team: z.number().int().min(0).max(1),
  clue: z.string(),
  clue_count: z.number().int(),
  guesses_left: z.number().int(),
  role: z.enum(['spymaster', 'operative']),
  teams: z.record(z.string(), z.number().int().min(0).max(1)),
  spymasters: z.array(z.string()).length(2),
  remaining: z.array(z.number().int().nonnegative()).length(2),
});
const gemsSchema = z.object({
  bank: counts,
  tokens: z.record(z.string(), counts),
  bonuses: z.record(z.string(), counts),
  card_info: z.record(
    z.string(),
    z.object({
      tier: z.number().int().min(1).max(3),
      bonus: z.string(),
      points: z.number().int().nonnegative(),
      cost: counts,
    }),
  ),
  patron_costs: z.record(z.string(), counts),
  final_round: z.boolean(),
  purchase_quotes: z
    .record(z.string(), z.object({
      cost: counts,
      discount: counts,
      spend: counts,
      missing_colors: counts,
      shortfall: z.number().int().nonnegative(),
      affordable: z.boolean(),
      after: counts.nullable(),
    }))
    .default({}),
  return_count: z.number().int().nonnegative().default(0),
  reservation_limit: z.boolean().default(false),
});

export function boardDetails(detail: Detail) {
  const data = boardSchema.parse(detail);
  return {
    rows: data.rows,
    columns: data.columns,
    draw: data.draw,
    lastMove: data.last_move,
    outcomeReason: data.outcome_reason,
    winningCells: data.winning_cells,
  };
}
export function wordsDetails(detail: Detail) {
  const data = wordsSchema.parse(detail);
  return {
    activeTeam: data.active_team,
    clue: data.clue,
    clueCount: data.clue_count,
    guessesLeft: data.guesses_left,
    role: data.role,
    teams: data.teams,
    spymasters: data.spymasters,
    remaining: data.remaining,
  };
}
export function gemsDetails(detail: Detail) {
  const data = gemsSchema.parse(detail);
  return {
    bank: data.bank,
    tokens: data.tokens,
    bonuses: data.bonuses,
    cardInfo: data.card_info,
    patronCosts: data.patron_costs,
    finalRound: data.final_round,
    purchaseQuotes: data.purchase_quotes,
    returnCount: data.return_count,
    reservationLimit: data.reservation_limit,
  };
}
