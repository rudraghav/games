import type { Card } from '@games/api-client';

/** Immediate grid change from the viewer's projected cards, before round scoring. */
export function swapImpact(cards: PlayerGrid, slot: number, drawn: string) {
  const column = slot % 4;
  const clears = [column, column + 4, column + 8].every(
    (index) => index === slot || cards[index]?.value === drawn,
  );
  const old = cards[slot];
  if (!old) {
    return {
      label: clears ? 'Clears · ?' : '?',
      description: clears ? 'clears column, point change unknown' : 'point change unknown',
    };
  }
  const change = Number(drawn) - Number(old.value) - (clears ? 3 * Number(drawn) : 0);
  const signed = change > 0 ? `+${change}` : String(change);
  return {
    label: clears ? `Clears · ${signed}` : signed,
    description: `${clears ? 'clears column, ' : ''}${signed} grid ${Math.abs(change) === 1 ? 'point' : 'points'}`,
  };
}

type PlayerGrid = readonly (Pick<Card, 'value'> | null)[];
