import type { components } from '../../packages/api-client/src/generated/schema';
import type { TutorialDriver } from './tutorial-depth-run';

type Card = components['schemas']['CardView'];

/** How the table writes a rank in a sentence: "as 7s", "as Queens". */
const plural = (rank: string) =>
  ({ A: 'Aces', J: 'Jacks', Q: 'Queens', K: 'Kings' })[rank] ?? `${rank}s`;

/**
 * One real Bluff decision through the phone table: continue a reveal, start a
 * round honestly with the most-held rank, follow with matching cards, or else
 * alternate between a pass and a call.
 */
export const playBluffDecision: TutorialDriver = async (page, before, step) => {
  const game = before.game!;
  const table = page.locator('#tutorial-game-table');
  const has = (type: string) => game.actions.some((option) => option.action.type === type);
  const hand = game.hand as Card[];
  const choose = async (cards: Card[]) => {
    for (const card of cards)
      await table
        .getByRole('group', { name: 'Your hand', exact: true })
        .getByRole('button', { name: card.label, exact: true })
        // Long hands overlap: tap the exposed left edge, where the rank corner sits.
        .click({ position: { x: 10, y: 34 } });
  };
  if (has('continue')) {
    await table.getByRole('button', { name: 'Continue', exact: true }).click();
    return;
  }
  const starts = game.actions.filter((option) => option.action.type === 'play').length > 1;
  if (starts) {
    const groups = new Map<string, Card[]>();
    for (const card of hand) groups.set(card.value, [...(groups.get(card.value) ?? []), card]);
    const best = [...groups.values()].sort((a, b) => b.length - a.length)[0].slice(0, 4);
    await choose(best);
    // Cards of one rank suggest that rank; the declaration stays the player's tap.
    await table
      .getByRole('button', { name: `Play ${best.length} as ${plural(best[0].value)}`, exact: true })
      .click();
    return;
  }
  const rank = String(game.detail.rank);
  const honest = hand.filter((card) => card.value === rank).slice(0, 4);
  if (honest.length && has('play')) {
    await choose(honest);
    await table
      .getByRole('button', { name: `Play ${honest.length} as ${plural(rank)}`, exact: true })
      .click();
    return;
  }
  await table
    .getByRole('button', {
      name: step % 2 && has('call_bluff') ? 'Call bluff' : 'Pass',
      exact: true,
    })
    .click();
};
