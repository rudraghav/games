import { z } from 'zod';
import type { components } from './generated/schema';

export const bluffRanks = [
  'A',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
] as const;
const rank = z.enum(bluffRanks);
const count = z.number().int().nonnegative();
const play = z.object({ player: z.string(), count: z.number().int().min(1).max(4) }).strict();

/**
 * Bluff's personalized projection. Strict on purpose: the pile is only ever a
 * count and the plays only counts and claimed ranks; the faces of a called play
 * arrive in `community` during a reveal, never here.
 */
const bluffSchema = z
  .object({
    rank: rank.nullable(),
    pile_count: count,
    discarded_count: count,
    plays: z.array(play),
    last_play: play.nullable(),
    passed: z.array(z.string()),
    going_out: z.string().nullable(),
    reveal: z
      .object({
        caller: z.string(),
        player: z.string(),
        rank,
        count: z.number().int().min(1).max(4),
        truthful: z.boolean(),
        taker: z.string(),
        pile_count: count,
        starter: z.string(),
      })
      .strict()
      .nullable(),
  })
  .strict();

export type BluffRank = z.infer<typeof rank>;
export type BluffDetails = ReturnType<typeof bluffDetails>;

export function bluffDetails(detail: components['schemas']['GameView']['detail']) {
  const data = bluffSchema.parse(detail);
  return {
    rank: data.rank,
    pileCount: data.pile_count,
    discardedCount: data.discarded_count,
    plays: data.plays,
    lastPlay: data.last_play,
    passed: data.passed,
    goingOut: data.going_out,
    reveal: data.reveal,
  };
}
