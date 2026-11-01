import type { components } from '../../packages/api-client/src/generated/schema';

type Game = components['schemas']['GameView'];
type Action = components['schemas']['Action'];
type Pick = <T>(items: T[]) => T;

/** Uses only one authorized actor view and public chip/row information. */
export function coopNumberAction(game: Game, pick: Pick): Action | undefined {
  const actions = game.actions || [];
  if (game.game_id === 'the-gang') {
    const chips = Object.values((game.detail?.chips || {}) as Record<string, number | null>);
    const free = actions.filter(
      (o) => o.action.type === 'claim_chip' && !chips.includes(o.action.amount),
    );
    // Free-chip picks make progress without sharing anybody's pocket cards.
    return {
      ...pick(free.length ? free : actions.filter((o) => o.action.type !== 'return_chip')).action,
    };
  }
  if (game.game_id !== 'six-nimmt') return undefined;
  const rows = actions.filter((o) => o.action.type === 'take_row');
  if (rows.length) {
    const penalties = game.detail?.row_penalties as number[];
    const lowest = Math.min(...rows.map((o) => penalties[Number(o.action.choice)]));
    return { ...pick(rows.filter((o) => penalties[Number(o.action.choice)] === lowest)).action };
  }
  return { ...pick(actions).action };
}
