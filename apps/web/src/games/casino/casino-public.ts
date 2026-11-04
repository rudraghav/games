import { z } from 'zod';
import type { Match } from '@games/api-client';

/**
 * Casino projection fields read straight from the server's public detail.
 * Each is optional so an older saved match still renders; nothing here is
 * derived from hidden cards. (The shared api-client parsers strip these keys.)
 */
const ids = z.array(z.string());
const chips = z.record(z.string(), z.number().int().nonnegative());
const pokerHand = z.object({
  category: z.string(),
  description: z.string(),
  short: z.string().optional(),
  cards: z.array(z.object({ id: z.string() })).default([]),
});
const teenHand = z.object({
  category: z.string(),
  description: z.string(),
  short: z.string(),
  rank: z.array(z.number().int()),
});
const holdem = z.object({
  contributions: chips.default({}),
  live_pots: z
    .array(
      z.object({
        amount: z.number().int().nonnegative(),
        eligible: ids,
        all_in: ids.default([]),
      }),
    )
    .default([]),
  hand_evaluations: z.record(z.string(), pokerHand).default({}),
});
const teen = z.object({
  paid: chips.nullable().default(null),
  out_reasons: z.record(z.string(), z.enum(['packed', 'lost_sideshow', 'lost_show'])).default({}),
  sideshow_result: z
    .object({
      requester: z.string(),
      target: z.string(),
      accepted: z.boolean(),
      loser: z.string().nullable(),
    })
    .nullable()
    .default(null),
  finish_reason: z.enum(['show', 'pot_limit', 'packed']).nullable().default(null),
  hand_evaluations: z.record(z.string(), teenHand).default({}),
  own_evaluation: teenHand.nullable().default(null),
});
const publicHand = z.object({
  size: z.number().int().nonnegative(),
  bet: z.number().int().nonnegative(),
  total: z.number().int(),
  soft: z.boolean(),
  done: z.boolean(),
  split: z.boolean(),
});
const blackjack = z.object({
  public_hands: z.record(z.string(), z.array(publicHand)).default({}),
  insured: chips.default({}),
});

const safe = <T>(schema: z.ZodType<T>, detail: Match['detail']): T => {
  const parsed = schema.safeParse(detail);
  return parsed.success ? parsed.data : schema.parse({});
};

export type HoldemPublic = z.infer<typeof holdem>;
export type TeenPublic = z.infer<typeof teen>;
export type TeenHand = z.infer<typeof teenHand>;
export type BlackjackPublicHand = z.infer<typeof publicHand>;

export const holdemPublic = (match: Match) => safe(holdem, match.detail);
export const teenPublic = (match: Match) => safe(teen, match.detail);
export const blackjackPublic = (match: Match) => safe(blackjack, match.detail);
