import { z } from 'zod';
import type { components } from './generated/schema';

const kind = z.enum(['truth', 'dare', 'burning']);
const fateIndex = z.number().int().min(0).max(2);
const tally = z.record(z.string(), z.number().int().nonnegative());
// Exactly one of the two is set: a written archetype, or another player's id.
const candidate = z
  .object({ label: z.string().min(1).nullable(), player: z.string().min(1).nullable() })
  .strict()
  .refine((item) => (item.label === null) !== (item.player === null), {
    message: 'A candidate is either a written label or a player.',
  });
const candidates = z.array(candidate).length(3).nullable();

/**
 * Truth or Dare's shared projection: every viewer receives the same detail. Strict
 * so the undrawn deck can never ride along. The fate labels come from `fates`;
 * the client never writes its own.
 */
const truthOrDareSchema = z
  .object({
    edition: z.enum(['friendly', 'naughty']),
    fates: z.array(z.string().min(1)).length(3),
    burning_building: z.boolean(),
    turns_per_player: z.number().int().min(1).max(10),
    turns_taken: tally,
    prompt: z
      .object({
        player: z.string(),
        kind,
        text: z.string().min(1).nullable(),
        candidates,
        swapped: z.boolean(),
      })
      .strict()
      .nullable(),
    swaps_left: z.record(z.string(), z.number().int().min(0).max(1)),
    last_result: z
      .object({
        player: z.string(),
        kind,
        text: z.string().min(1).nullable(),
        candidates,
        fates: z.array(fateIndex).length(3).nullable(),
        outcome: z.enum(['done', 'passed', 'assigned']),
        points: z.number().int().nonnegative(),
      })
      .strict()
      .nullable(),
    scores: tally,
  })
  .strict();

export type TruthOrDareKind = z.infer<typeof kind>;
export type TruthOrDareCandidate = z.infer<typeof candidate>;
export type TruthOrDareDetails = ReturnType<typeof truthOrDareDetails>;

export function truthOrDareDetails(detail: components['schemas']['GameView']['detail']) {
  const data = truthOrDareSchema.parse(detail);
  return {
    edition: data.edition,
    fates: data.fates as [string, string, string],
    burningBuilding: data.burning_building,
    turnsPerPlayer: data.turns_per_player,
    turnsTaken: data.turns_taken,
    prompt: data.prompt,
    swapsLeft: data.swaps_left,
    lastResult: data.last_result,
    scores: data.scores,
  };
}

/** The six `assign` choices: digit i is the fate index given to candidate i. */
export const fateAssignments = ['012', '021', '102', '120', '201', '210'] as const;

/**
 * The `assign` choice for one fate per candidate, or null until all three
 * candidates hold different fates.
 */
export function assignmentChoice(fates: readonly (number | null)[]) {
  if (fates.length !== 3 || fates.some((fate) => fate === null || fate < 0 || fate > 2))
    return null;
  if (new Set(fates).size !== 3) return null;
  const choice = fates.join('');
  return (fateAssignments as readonly string[]).includes(choice) ? choice : null;
}
