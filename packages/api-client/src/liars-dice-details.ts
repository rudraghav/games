import { z } from 'zod';
import type { components } from './generated/schema';

const face = z.number().int().min(1).max(6);
const count = z.number().int().nonnegative();
const bid = z.object({ player: z.string(), quantity: z.number().int().positive(), face }).strict();

/**
 * Liar's Dice's personalized projection. Strict on purpose: while dice are hidden
 * the view holds one dice list (the viewer's own); every die appears only in a
 * reveal, so an unexpected key is refused rather than shown.
 */
const liarsDiceSchema = z
  .object({
    round: z.number().int().positive(),
    dice: z.array(face).max(5),
    total_dice: count,
    wild_ones: z.boolean(),
    bid: bid.nullable(),
    bids: z.array(bid),
    starter: z.string(),
    out: z.array(z.string()),
    reveal: z
      .object({
        caller: z.string(),
        bidder: z.string(),
        quantity: z.number().int().positive(),
        face,
        count,
        held: z.boolean(),
        loser: z.string(),
        eliminated: z.boolean(),
        dice: z.record(z.string(), z.array(face).max(5)),
      })
      .strict()
      .nullable(),
  })
  .strict();

export type LiarsDiceBid = z.infer<typeof bid>;
export type LiarsDiceDetails = ReturnType<typeof liarsDiceDetails>;

export function liarsDiceDetails(detail: components['schemas']['GameView']['detail']) {
  const data = liarsDiceSchema.parse(detail);
  return {
    round: data.round,
    dice: data.dice,
    totalDice: data.total_dice,
    wildOnes: data.wild_ones,
    bid: data.bid,
    bids: data.bids,
    starter: data.starter,
    out: data.out,
    reveal: data.reveal,
  };
}
