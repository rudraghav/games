import { z } from 'zod';
import type { components } from './generated/schema';

const points = z.record(z.string(), z.number().int().nonnegative());
const partySchema = z.object({
  mode: z.enum(['spill-or-chill', 'most-likely', 'hot-seat']),
  round: z.number().int().positive(),
  rounds: z.number().int().min(6).max(20),
  spotlight: z.string(),
  prompt: z.string(),
  options: z.array(z.string()).max(2),
  submitted: z.array(z.string()).max(10),
  own_choice: z.string().nullable(),
  sip_prompts: z.boolean(),
  result: z
    .object({
      choices: z.record(z.string(), z.string()),
      tallies: points,
      answer: z.string().nullable(),
      points,
    })
    .nullable(),
});

/** Validate the personalized projection before it enters a party table. */
export function partyDetails(detail: components['schemas']['GameView']['detail']) {
  const data = partySchema.parse(detail);
  return {
    mode: data.mode,
    round: data.round,
    rounds: data.rounds,
    spotlight: data.spotlight,
    prompt: data.prompt,
    options: data.options,
    submitted: data.submitted,
    ownChoice: data.own_choice,
    sipPrompts: data.sip_prompts,
    result: data.result,
  };
}
