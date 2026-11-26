import { expect } from '@playwright/test';
import type { TutorialDriver } from './tutorial-depth-run';

/**
 * One real Liar's Dice decision through the table, as a learner on a phone makes
 * it: roll the next round after a reveal, call liar on every second turn that
 * allows it, otherwise choose the first offered face and bid its lowest quantity.
 */
export const playLiarsDiceDecision: TutorialDriver = async (page, before, step) => {
  const table = page.locator('#tutorial-game-table');
  const types = before.game!.actions.map((option) => option.action.type);
  if (types.includes('next_round')) {
    await table.getByRole('button', { name: 'Roll the next round', exact: true }).click();
    return;
  }
  const bids = types.includes('bid');
  if (types.includes('call_liar') && (!bids || step % 2 === 0)) {
    await table.getByRole('button', { name: 'Call liar', exact: true }).click();
    return;
  }
  await table.locator('.liars-dice-face:enabled').first().click();
  const bid = table.getByRole('button', { name: /^Bid \d+ × / });
  await expect(bid).toBeEnabled();
  await bid.click();
};
