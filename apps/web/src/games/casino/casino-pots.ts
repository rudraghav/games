/** Settled pots as players read them; amounts and awards stay exactly as saved. */
export type SettledPot = {
  amount: number;
  winners: string[];
  eligible: string[];
  awards: Record<string, number>;
  odd_chips: string[];
};
export type PotGroup = {
  name: string;
  amount: number;
  winners: string[];
  eligible: string[];
  awards: Record<string, number>;
  oddChips: string[];
  /** Players who could win the previous pot but not this one: they were all in below it. */
  allInBelow: string[];
};

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((id) => b.includes(id));

/**
 * The engine settles every contribution layer separately. Layers that the same
 * players could win are one pot to a player, so they are shown together and only
 * a change in who could win starts a side pot.
 */
export function groupSettledPots(pots: SettledPot[]): PotGroup[] {
  const groups: PotGroup[] = [];
  for (const pot of pots) {
    const last = groups.at(-1);
    if (last && pot.eligible.length && sameSet(last.eligible, pot.eligible)) {
      last.amount += pot.amount;
      for (const [id, amount] of Object.entries(pot.awards))
        last.awards[id] = (last.awards[id] ?? 0) + amount;
      for (const id of pot.winners) if (!last.winners.includes(id)) last.winners.push(id);
      for (const id of pot.odd_chips) if (!last.oddChips.includes(id)) last.oddChips.push(id);
      continue;
    }
    groups.push({
      name: '',
      amount: pot.amount,
      winners: [...pot.winners],
      eligible: [...pot.eligible],
      awards: { ...pot.awards },
      oddChips: [...pot.odd_chips],
      allInBelow: last ? last.eligible.filter((id) => !pot.eligible.includes(id)) : [],
    });
  }
  return groups.map((group, index) => ({
    ...group,
    name: groups.length === 1 ? 'Pot' : index === 0 ? 'Main pot' : `Side pot ${index}`,
  }));
}

export type LivePot = { amount: number; eligible: string[]; all_in: string[] };

/** While betting there is one pot until someone is all in; the server groups them. */
export function livePotNames(pots: LivePot[]) {
  return pots.map((pot, index) =>
    pots.length === 1 ? 'Pot' : index === 0 ? 'Main pot' : `Side pot ${index}`,
  );
}
