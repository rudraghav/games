import { z } from 'zod';
import type { components } from './generated/schema';

const number = z.number().int().min(1).max(90);
const prizeKey = z.enum(['early_five', 'top_line', 'middle_line', 'bottom_line', 'full_house']);
const row = z.array(number.nullable()).length(9);

/**
 * Housie's personalized projection. Strict on purpose: the view carries the
 * viewer's own ticket and the numbers already called, never the call order or
 * another player's ticket, so an unexpected key is refused rather than shown.
 */
const housieSchema = z
  .object({
    // `[]` for a viewer who is not seated.
    ticket: z.union([z.array(row).length(3), z.array(row).length(0)]),
    marked: z.array(number).max(15),
    called: z.array(number).max(90),
    last_called: number.nullable(),
    auto_mark: z.boolean(),
    prizes: z
      .array(
        z
          .object({
            key: prizeKey,
            label: z.string().min(1),
            points: z.number().int().positive(),
            winners: z.array(z.string()),
            won_on_call: z.number().int().min(1).max(90).nullable(),
          })
          .strict(),
      )
      .length(5),
    claimable: z.array(prizeKey).max(5),
  })
  .strict();

export type HousiePrizeKey = z.infer<typeof prizeKey>;
export type HousieDetails = ReturnType<typeof housieDetails>;

export function housieDetails(detail: components['schemas']['GameView']['detail']) {
  const data = housieSchema.parse(detail);
  return {
    ticket: data.ticket,
    marked: data.marked,
    called: data.called,
    lastCalled: data.last_called,
    autoMark: data.auto_mark,
    prizes: data.prizes.map((prize) => ({
      key: prize.key,
      label: prize.label,
      points: prize.points,
      winners: prize.winners,
      wonOnCall: prize.won_on_call,
    })),
    claimable: data.claimable,
  };
}
