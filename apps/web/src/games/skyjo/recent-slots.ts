'use client';
import { useState } from 'react';
import type { Match } from '@games/api-client';

type Cells = Record<string, string[]>;

/** Each slot's public identity: a revealed card id, "hidden" or "removed". */
function publicCells(match: Match): Cells {
  return Object.fromEntries(
    match.players.map((player) => [
      player.id,
      player.cards.map((card, slot) =>
        player.removedSlots.includes(slot) ? 'removed' : card ? card.id : 'hidden',
      ),
    ]),
  );
}

/**
 * The grid slots changed by the latest public move, per player, so the table can
 * point at what just happened (a replaced card, a turned card, a cleared column).
 * Only already public faces are compared. Highlights reset with each round and
 * are not shown during round review, where every card turns over at once.
 */
export function useRecentSlots(match: Match, round: number): Record<string, number[]> {
  const cells = publicCells(match);
  const key = `${round}:${match.phase}:${JSON.stringify(cells)}`;
  const [memory, setMemory] = useState({
    key,
    round,
    cells,
    changed: {} as Record<string, number[]>,
  });
  if (memory.key !== key) {
    const changed: Record<string, number[]> = {};
    const reviewing = ['between_rounds', 'finished'].includes(match.phase);
    if (memory.round === round && !reviewing)
      for (const [id, list] of Object.entries(cells)) {
        const before = memory.cells[id];
        if (!before) continue;
        const slots = list.flatMap((cell, slot) => (cell !== before[slot] ? [slot] : []));
        if (slots.length) changed[id] = slots;
      }
    const keep = memory.round === round && !reviewing && !Object.keys(changed).length;
    setMemory({ key, round, cells, changed: keep ? memory.changed : changed });
  }
  return memory.key === key ? memory.changed : {};
}
