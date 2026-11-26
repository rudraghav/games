import { assignmentChoice, type ActionOption } from '@games/api-client';

/** One fate index per candidate, or null while that candidate has none yet. */
export type FateDraft = [number | null, number | null, number | null];

export const emptyFates: FateDraft = [null, null, null];

/**
 * Give candidate `row` the fate `fate`. Fates are mutually exclusive: when another
 * candidate already holds that fate, it takes this candidate's previous fate (or
 * none), so the three can never share one.
 */
export function chooseFate(
  draft: readonly (number | null)[],
  row: number,
  fate: number,
): FateDraft {
  const next = [...draft] as FateDraft;
  const holder = next.findIndex((value, index) => index !== row && value === fate);
  if (holder >= 0) next[holder] = next[row];
  next[row] = fate;
  return next;
}

/** The server's `assign` option for a complete draft, or undefined until all three differ. */
export function assignOption(actions: readonly ActionOption[], draft: readonly (number | null)[]) {
  const choice = assignmentChoice(draft);
  if (!choice) return undefined;
  return actions.find((option) => option.value.type === 'assign' && option.value.choice === choice);
}
