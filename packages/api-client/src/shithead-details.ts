import { z } from 'zod';
import { cardSchema } from './card-schema';
import type { components } from './generated/schema';

const count = z.number().int().nonnegative();
const details = z.object({
  stages: z.record(z.string(), z.enum(['setup', 'hand', 'face_up', 'face_down', 'out'])),
  hand_counts: z.record(z.string(), count),
  hidden_slots: z.record(z.string(), z.array(z.boolean()).length(3)),
  pile_count: count,
  burned_count: count,
  comparison_rank: z.string().nullable(),
  low_required: z.boolean(),
  settings: z.object({ seven_low: z.boolean(), transparent_three: z.boolean() }),
  finish_order: z.array(z.string()),
  loser: z.string().nullable(),
  last_play: z
    .object({
      player: z.string(),
      type: z.enum(['play', 'burn', 'pickup', 'failed_flip']),
      count,
      burned: count.optional(),
      cards: z.array(cardSchema).optional(),
      card: cardSchema.optional(),
    })
    .nullable(),
});
export const shitheadDetails = (detail: components['schemas']['GameView']['detail']) =>
  details.parse(detail);
