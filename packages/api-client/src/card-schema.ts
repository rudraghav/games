import { z } from 'zod';

/** One projected-card boundary for hands, table cards and nested game details. */
export const cardSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string().default(''),
  color: z.string().default('neutral'),
  subtitle: z.string().default(''),
  suit: z.string().default(''),
  colors: z.array(z.string()).default([]),
  effect: z.string().default(''),
});
