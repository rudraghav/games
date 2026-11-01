import { z } from 'zod';
import type { components } from './generated/schema';

type Detail = components['schemas']['GameView']['detail'];
const count = z.number().int().nonnegative();
const counts = z.record(z.string(), count);
const card = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  suit: z.string(),
  color: z.string(),
  subtitle: z.string(),
});
const paper = z.object({
  round: count,
  target: z.number().int().positive(),
  caller: z.string().nullable(),
  protected: z.array(z.string()),
  pile_counts: z.array(count).length(2),
  discard_tops: z.array(card.nullable()).length(2),
  private_options: z.array(card),
  own_points: count,
  own_bonus: count,
  instant_mermaids: z.string().nullable(),
  round_result: z.record(
    z.string(),
    z.object({ card_points: count, color_bonus: count, award: count }),
  ),
});
const boop = z.object({
  pools: z.record(z.string(), z.object({ kitten: count.max(8), cat: count.max(8) })),
  retired: counts,
  reserve: counts,
  moves: count,
  last_move: z.number().int().min(0).max(35).nullable(),
  last_pushes: z.array(
    z.object({
      from: z.number().int().min(0).max(35),
      to: z.number().int().min(-1).max(35),
      owner: z.string(),
      kind: z.enum(['kitten', 'cat']),
    }),
  ),
});
export const paperDetails = (detail: Detail) => paper.parse(detail);
export const boopDetails = (detail: Detail) => boop.parse(detail);
