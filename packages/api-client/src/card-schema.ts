import { z } from 'zod';

/** One projected-card boundary for hands, table cards and nested game details. */
export const cardSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    value: z.string().default(''),
    color: z.string().default('neutral'),
    subtitle: z.string().default(''),
    suit: z.string().default(''),
    colors: z.array(z.string()).default([]),
    effect: z.string().default(''),
    set_name: z.string().nullable().optional(),
    set_size: z.number().int().positive().nullable().optional(),
    rent_ladder: z.array(z.number().int().nonnegative()).default([]),
  })
  .transform(({ set_name, set_size, rent_ladder, ...card }) => ({
    ...card,
    setName: set_name ?? null,
    setSize: set_size ?? null,
    rentLadder: rent_ladder,
  }));
