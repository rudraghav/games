import { z } from 'zod';
import type { components } from './generated/schema';

const group = z
  .object({
    color: z.string(),
    name: z.string(),
    set_size: z.number().int().positive(),
    rent_ladder: z.array(z.number().nonnegative()),
    properties: z.array(z.string()),
  })
  .transform(({ set_size, rent_ladder, ...value }) => ({
    ...value,
    setSize: set_size,
    rentLadder: rent_ladder,
  }));
const schema = z.object({
  moves: z.number().int(),
  rent_multiplier: z.number().int().positive().default(1),
  debts: z.record(z.string(), z.array(z.string())),
  pending: z.string().nullable(),
  payment_amount: z.number().nonnegative().default(0),
  property_groups: z.array(group).default([]),
  collections: z
    .array(
      z
        .object({
          player: z.string(),
          key: z.string(),
          color: z.string(),
          count: z.number().int(),
          set_size: z.number().int().positive(),
          complete: z.boolean(),
          rent: z.number().nonnegative(),
        })
        .transform(({ set_size, ...value }) => ({ ...value, setSize: set_size })),
    )
    .default([]),
  pending_action: z
    .object({
      kind: z.string(),
      actor: z.string(),
      target: z.string(),
      responder: z.string(),
      amount: z.number().nullable(),
      blocked: z.boolean(),
      stage: z.enum(['select', 'counter', 'payment', 'distribution']),
    })
    .nullable()
    .default(null),
});

export function dealDetails(detail: components['schemas']['GameView']['detail']) {
  const data = schema.parse(detail);
  return {
    moves: data.moves,
    rentMultiplier: data.rent_multiplier,
    debts: data.debts,
    pending: data.pending,
    paymentAmount: data.payment_amount,
    propertyGroups: data.property_groups,
    pendingAction: data.pending_action,
    collections: data.collections,
  };
}
export type DealGroup = ReturnType<typeof dealDetails>['propertyGroups'][number];
export type DealDetails = ReturnType<typeof dealDetails>;
