import { z } from 'zod';
import type { components } from './generated/schema';

type Detail = components['schemas']['GameView']['detail'];
const chips = z.number().int().nonnegative();
const positive = z.number().int().positive();
const ledger = z.object({
  spin: positive,
  stake: positive,
  payout: chips,
  net: z.number().int(),
  balance: chips,
});
const session = z.object({ spin_limit: positive, spins_remaining: chips });
const pocket = z.number().int().min(0).max(36);
const roulette = session.extend({
  history: z.array(
    ledger.extend({
      choice: z.string(),
      pocket,
      color: z.enum(['red', 'black', 'green']),
    }),
  ),
});
const symbol = z.enum(['cherry', 'lemon', 'bell', 'star', 'seven']);
const result = z.enum([
  'triple_seven',
  'triple_star',
  'triple_bell',
  'triple_lemon',
  'triple_cherry',
  'two_cherries',
  'miss',
]);
const slots = session.extend({
  chips,
  starting_chips: positive,
  history: z.array(
    ledger.extend({
      reels: z.array(symbol).length(3),
      result,
      multiplier: chips,
    }),
  ),
  paytable: z.array(z.object({ result, label: z.string(), multiplier: chips, ways: chips })),
  total_outcomes: positive,
  winning_outcomes: chips,
  return_numerator: chips,
});
export type RouletteSpin = z.infer<typeof roulette>['history'][number];
export type SlotSpin = z.infer<typeof slots>['history'][number];
export type SlotSymbol = z.infer<typeof symbol>;
export const rouletteDetails = (detail: Detail) => roulette.parse(detail);
export const slotsDetails = (detail: Detail) => slots.parse(detail);
