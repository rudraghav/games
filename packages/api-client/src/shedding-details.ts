import { z } from 'zod';
import type { components } from './generated/schema';

const schema = z.object({
  color: z.string(),
  penalty: z.number().int().nonnegative(),
  direction: z.union([z.literal(1), z.literal(-1)]),
  pending_kind: z.enum(['roulette', 'opening_color', 'challenge']).nullable().default(null),
  next_player: z.string().nullable().default(null),
  elimination_limit: z.number().int().positive().nullable().default(null),
});

export function sheddingDetails(detail: components['schemas']['GameView']['detail']) {
  const data = schema.parse(detail);
  return {
    color: data.color,
    penalty: data.penalty,
    direction: data.direction,
    pendingKind: data.pending_kind,
    nextPlayer: data.next_player,
    eliminationLimit: data.elimination_limit,
  };
}
