import { z } from 'zod';
import type { components } from './generated/schema';

type Detail = components['schemas']['GameView']['detail'];
const counts = z.record(z.string(), z.number().int().nonnegative());
const colors = z.enum(['blue', 'yellow', 'red', 'black', 'white']);
const card = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  color: z.string(),
  subtitle: z.string(),
  suit: z.string(),
});
const trio = z.object({
  revealed: z.array(z.object({ owner: z.string(), slot: z.number().int(), card })),
  failed: z.boolean(),
});
const flip = z.object({
  round: z.number().int().positive(),
  status: z.record(z.string(), z.enum(['active', 'stayed', 'busted', 'frozen'])),
  round_scores: counts,
  at_risk: counts,
  pending_card: z.string(),
  dealer: z.string(),
});
const azul = z.object({
  round: z.number().int().positive(),
  factories: z.array(z.array(colors)),
  center: z.array(colors),
  marker: z.boolean(),
  draft: z.array(colors),
  lines: z.record(z.string(), z.array(z.array(colors)).length(5)),
  walls: z.record(z.string(), z.array(z.array(colors.nullable()).length(5)).length(5)),
  floors: z.record(z.string(), z.array(z.union([colors, z.literal('first')])).max(7)),
  starter: z.string(),
  last_scores: z.record(
    z.string(),
    z.object({
      wall: z.number().int(),
      floor: z.number().int(),
      bonus: z.number().int().optional(),
    }),
  ),
});

export const trioDetails = (detail: Detail) => trio.parse(detail);
export const flipSevenDetails = (detail: Detail) => flip.parse(detail);
export const azulDetails = (detail: Detail) => azul.parse(detail);
