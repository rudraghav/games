import { expect } from '@playwright/test';
import type { TutorialDriver } from './tutorial-depth-run';

/**
 * One learner decision at the Housie table, made through the table itself: a
 * claim first (it closes on the next call), then a mark, then the call. Only
 * this learner's own offered actions are read.
 */
export const playHousieDecision: TutorialDriver = async (page, before) => {
  const table = page.locator('#tutorial-game-table');
  const actions = before.game!.actions;
  const option =
    actions.find((o) => o.action.type === 'claim') ??
    actions.find((o) => o.action.type === 'mark') ??
    actions.find((o) => o.action.type === 'call_number');
  if (!option) throw new Error('The learner has no Housie decision.');
  // Claim, mark and call buttons are named exactly as the server labels them:
  // "Claim Early five", "Mark 42" and "Call the next number".
  const button = table.getByRole('button', { name: option.label, exact: true });
  await expect(button).toBeEnabled();
  await button.click();
};
