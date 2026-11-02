import { expect, test, type Page } from '@playwright/test';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';
import { gemsDetails } from '../../packages/api-client/src/game-details';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Authorized fixture review is local-only.');
test.use({ trace: 'off', screenshot: 'only-on-failure' });
async function scenario(page: Page, id: string) {
  const item = midgameScenarios.find((entry) => entry.id === id)!;
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(item.game);
  await page.getByRole('combobox', { name: 'Mid-game scenario', exact: true }).selectOption(id);
  await expect(page.locator('.midgame-review-table')).toHaveAttribute('data-midgame', id);
}
test.beforeEach(async ({ page }) => {
  if (test.info().project.name === 'phone') await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design/midgame');
});

test('blackjack totals use only visible cards and split hands stay individually readable', async ({
  page,
}) => {
  await scenario(page, 'blackjack-1-17-2');
  await expect(page.getByText('Total 18 · soft', { exact: true })).toBeVisible();
  await expect(page.getByText('Visible dealer total 9', { exact: true })).toBeVisible();
  await expect(
    page.getByLabel('Dealer cards', { exact: true }).locator('.playing-card--back'),
  ).toHaveCount(1);
  await scenario(page, 'blackjack-7-31-11');
  await page.getByRole('button', { name: 'Split pair', exact: true }).click();
  await expect(page.locator('.blackjack-hand')).toHaveCount(2);
  for (const hand of await page.locator('.blackjack-hand').all()) {
    await expect(hand.locator('.blackjack-hand-value')).toHaveText(/^Total \d+( · soft| · bust)?$/);
    await expect(hand).toContainText('chips bet');
  }
});

test('blind play and final Skyjo turns explain the actual current decision', async ({ page }) => {
  const blind = midgameScenarios.find(
    (item) => item.game === 'teen-patti' && item.room.game!.detail?.blind,
  )!;
  await scenario(page, blind.id);
  await expect(page.getByText(/^Blind · Stake 1 · Wager/)).toBeVisible();
  await expect(
    page.getByText('Playing blind. Your cards stay hidden until you choose to look.', {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.locator('.casino-own-hand .playing-card:not(.playing-card--back)')).toHaveCount(
    0,
  );
  const final = midgameScenarios.find(
    (item) =>
      item.game === 'skyjo' &&
      item.room.game!.detail?.finisher &&
      item.room.game!.phase === 'playing',
  )!;
  await scenario(page, final.id);
  await expect(page.getByText(/closed the round. Final turns:/)).toBeVisible();
  await expect(
    page.getByText(/positive round score doubles it unless it is strictly lowest/),
  ).toBeVisible();
});

test('effect instructions and alternate victory conditions are available without hover', async ({
  page,
}) => {
  const freeze = midgameScenarios.find(
    (item) => item.game === 'flip-7' && item.room.game!.detail?.pending_card === 'Freeze',
  )!;
  await scenario(page, freeze.id);
  await expect(
    page.getByText('Freeze banks the chosen player’s round points. Choose an eligible player.', {
      exact: true,
    }),
  ).toBeVisible();
  await scenario(page, 'boop-2-17-8');
  await expect(
    page.getByText('Win with three cats in a row, or eight cats on the bed.', { exact: true }),
  ).toBeVisible();
  await scenario(page, 'uno-2-17-2');
  await page.locator('.card-hand > button[aria-label*="Green Skip"]').click();
  await expect(page.getByText('The next player loses their turn.', { exact: true })).toBeVisible();
});

test('opponent Gem Market tokens are public while reserved card identities remain hidden', async ({
  page,
}) => {
  const item = midgameScenarios.find((entry) => entry.id === 'gem-market-4-31-53')!;
  await scenario(page, item.id);
  const opponent = item.room.game!.players.find((player) => player.id !== item.selfId)!;
  const name = item.room.members.find((member) => member.id === opponent.id)!.name;
  const collection = page
    .locator('.gem-engines details')
    .filter({ has: page.getByText(name, { exact: true }) });
  await collection.locator('summary').click();
  const tokens = page.getByLabel(`${name} public tokens`, { exact: true });
  for (const [color, count] of Object.entries(
    gemsDetails(item.room.game!.detail ?? {}).tokens[opponent.id],
  ))
    await expect(tokens.getByRole('img', { name: `${count} ${color}`, exact: true })).toBeVisible();
  await expect(collection.locator('.gem-card-row .development-card')).toHaveCount(
    Object.values(opponent.properties ?? {}).flat().length,
  );
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
});

test('completed Gang and Paper rounds keep the next action close to the hand and public reveal', async ({
  page,
}) => {
  const gang = midgameScenarios.find(
    (item) =>
      item.game === 'the-gang' &&
      item.room.game!.phase === 'heist_review' &&
      item.room.game!.actions?.some((option) => option.action.type === 'next_heist'),
  )!;
  await scenario(page, gang.id);
  const gangDock = page.getByRole('region', { name: 'Ranking and reveal decisions', exact: true });
  expect((await gangDock.boundingBox())!.height).toBe(112);
  await expect(gangDock.getByRole('button', { name: 'Next heist', exact: true })).toBeVisible();
  const gangGap = await page
    .locator('.gang-table')
    .evaluate(
      (table) =>
        table.querySelector('.gang-revealed')!.getBoundingClientRect().top -
        table.querySelector('.gang-private')!.getBoundingClientRect().bottom,
    );
  expect(gangGap).toBeLessThan(170);
  const paper = midgameScenarios.find(
    (item) =>
      item.game === 'sea-salt-paper' &&
      item.room.game!.phase === 'round_over' &&
      item.room.game!.actions?.some((option) => option.action.type === 'next_round'),
  )!;
  await scenario(page, paper.id);
  const paperDock = page.getByRole('region', { name: 'Draw and card choices', exact: true });
  expect((await paperDock.boundingBox())!.height).toBe(112);
  await expect(paperDock.getByRole('button', { name: 'Next round', exact: true })).toBeVisible();
  const paperGap = await page
    .locator('.paper-table')
    .evaluate(
      (table) =>
        table.querySelector('.paper-hand')!.getBoundingClientRect().top -
        table.querySelector('.paper-heading')!.getBoundingClientRect().bottom,
    );
  expect(paperGap).toBeLessThan(160);
});
