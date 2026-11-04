import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dealScenarios } from '../../apps/web/src/stories/generated/deal-scenarios';

// These are public projections from real engines. No room/account/data writes.
test.skip(Boolean(process.env.GAMES_TEST_URL), 'The review route is local-only.');
const captureDir = 'output/playwright/deal-workspace';
const fixture = (id: string) => dealScenarios.find((item) => item.id === id)!;
const own = (page: Page) => page.locator('.deal-player[data-own="true"]');
const hand = (page: Page) => page.getByRole('group', { name: 'Your hand', exact: true });
const panel = (page: Page) => page.locator('.table-decision-panel');
const command = (page: Page) => page.locator('.deal-command-dock');

async function selectScenario(page: Page, id: string) {
  await page.getByRole('combobox', { name: 'Deal scenario', exact: true }).selectOption(id);
  await expect(page.locator('.deal-workspace')).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}
async function submitted(page: Page) {
  return JSON.parse(await page.getByLabel('Submitted action', { exact: true }).innerText());
}
async function capture(page: Page, id: string) {
  await mkdir(captureDir, { recursive: true });
  await page.screenshot({
    path: `${captureDir}/${test.info().project.name}-${id}.png`,
    fullPage: true,
  });
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design/deal');
  await expect(
    page.getByRole('heading', { name: 'Deal workspace review', exact: true }),
  ).toBeVisible();
});

test('all complex Deal decisions fit the viewport and preserve hand privacy and printed identities', async ({
  page,
}) => {
  for (const item of dealScenarios) {
    await selectScenario(page, item.id);
    await expect(hand(page).getByRole('button')).toHaveCount(item.room.game!.hand.length);
    await expect(page.locator('.deal-opponents .private-hand')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (item.id === 'collections') {
      await expect(own(page).getByLabel(/^Boardwalk, bank value 4M/)).toBeVisible();
      await expect(own(page).getByLabel('Complete set', { exact: true })).toHaveCount(1);
      await expect(own(page).locator('.deal-collection').first().locator('footer')).toContainText(
        'Rent 9M',
      );
      await own(page).getByLabel('Inspect Brown · set 1', { exact: true }).click();
      const info = page.getByRole('dialog', { name: 'Card info', exact: true });
      await expect(info.getByText('✓ Mediterranean Avenue', { exact: true })).toBeVisible();
      await expect(info.getByText('✓ Baltic Avenue', { exact: true })).toBeVisible();
      await capture(page, 'collections');
      await page.keyboard.press('Escape');
    }
    if (item.id === 'no-mercy') {
      await page.locator('.deal-quick-rules summary').click();
      await expect(page.getByText(/No Mercy uses the Games house deck/)).toBeVisible();
    }
  }
});

test('card selection chooses an exact existing/new pile and a free same-color rearrangement', async ({
  page,
}) => {
  await selectScenario(page, 'placement');
  const card = hand(page).getByRole('button', { name: /^Baltic Avenue, bank value 1M/ });
  await card.focus();
  await card.press('Space');
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await own(page).getByRole('button', { name: 'Place here', exact: true }).click();
  await capture(page, 'placement');
  await page.getByRole('button', { name: 'Place property', exact: true }).click();
  expect(await submitted(page)).toMatchObject({
    type: 'property',
    color: 'brown',
    choice: 'brown:0',
  });
  await expect(own(page).getByLabel('Complete set', { exact: true })).toHaveCount(1);
  // A harness reset returns to the same table version, where this tab keeps an unsent
  // card choice across refreshes; forget it so the scenario starts fresh.
  await page.evaluate(() => sessionStorage.clear());
  await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
  await hand(page)
    .getByRole('button', { name: /^Baltic Avenue, bank value 1M/ })
    .click();
  await own(page).getByRole('button', { name: 'New Brown · set 2', exact: true }).click();
  await page.getByRole('button', { name: 'Place property', exact: true }).click();
  expect(await submitted(page)).toMatchObject({
    type: 'property',
    color: 'brown',
    choice: 'brown:1',
  });
  await expect(own(page).locator('.deal-collection')).toHaveCount(2);
  await expect(own(page).getByLabel('Complete set', { exact: true })).toHaveCount(0);
  await selectScenario(page, 'rearrange');
  await own(page)
    .getByRole('button', { name: /^Baltic Avenue, bank value 1M/ })
    .click();
  await own(page).getByRole('button', { name: 'Place here', exact: true }).click();
  await page.getByRole('button', { name: 'Move property', exact: true }).click();
  expect(await submitted(page)).toMatchObject({
    type: 'rearrange',
    color: 'brown',
    choice: 'brown:0',
  });
  await expect(page.locator('.deal-turn-controls')).toContainText('3 plays left');
});

test('changing swap target or canceling bank mode cannot submit an earlier hidden choice', async ({
  page,
}) => {
  await selectScenario(page, 'forced');
  await hand(page)
    .getByRole('button', { name: /^Forced deal, bank value 3M/ })
    .click();
  // The commit button names the move once it is complete, and is disabled until then.
  const play = panel(page).locator('.deal-commit-actions .button--primary');
  const step = (name: string) => panel(page).getByRole('radiogroup', { name, exact: true });
  await expect(play).toBeDisabled();
  await step('Choose a player').getByRole('radio', { name: /^Dev/ }).click();
  await step('Property you take')
    .getByRole('radio', { name: /^Kentucky Avenue/ })
    .click();
  await step('Property you give')
    .getByRole('radio', { name: /^Mediterranean Avenue/ })
    .click();
  await expect(play).toBeEnabled();
  await expect(play).toHaveText('Play Forced deal · take Kentucky Avenue');
  await step('Choose a player').getByRole('radio', { name: /^Mira/ }).click();
  await expect(play).toBeDisabled();
  await expect(page.locator('.deal-move-summary')).toHaveCount(0);
  await page.getByRole('button', { name: 'Bank for 3M', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Confirm · bank 3M', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(play).toBeDisabled();
  await step('Property you take')
    .getByRole('radio', { name: /^Pacific Avenue/ })
    .click();
  await step('Property you give')
    .getByRole('radio', { name: /^Oriental Avenue/ })
    .click();
  await capture(page, 'forced-swap');
  await play.click();
  const selected = fixture('forced').transitions.find(
    (item) =>
      item.action.target === fixture('forced').room.members[2].id &&
      item.action.cards?.[0] === fixture('forced').room.game!.players[0].properties!['sky:0'][0].id,
  )!;
  expect(await submitted(page)).toEqual(selected.action);
});

test('countering and counter-countering show the bill, current block and permitted response', async ({
  page,
}) => {
  await selectScenario(page, 'counter');
  await expect(page.getByRole('region', { name: 'Pending action', exact: true })).toContainText(
    '5M',
  );
  await page.getByRole('button', { name: 'Just Say No', exact: true }).click();
  expect(await submitted(page)).toMatchObject({ type: 'no' });
  // The blocker now waits for the collector; the pending action stays viewable.
  await page.getByRole('button', { name: 'View pending action', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Action blocked', exact: true })).toBeVisible();
  await selectScenario(page, 'counter-chain');
  await expect(page.getByRole('heading', { name: 'Action blocked', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept the block', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Just Say No', exact: true }).click();
  expect(await submitted(page)).toMatchObject({ type: 'no' });
  await expect(page.getByRole('heading', { name: 'Action blocked', exact: true })).toHaveCount(0);
});

test('payment requires the bill or every payable asset and makes overpayment explicit', async ({
  page,
}) => {
  await selectScenario(page, 'payment-bank');
  await panel(page).getByRole('button', { name: 'Close move options', exact: true }).click();
  await expect(command(page).getByRole('button', { name: 'Pay 0M', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '2M, bank value 2M', exact: true }).click();
  await expect(command(page).getByRole('button', { name: 'Pay 2M', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '4M, bank value 4M', exact: true }).click();
  await expect(command(page).getByRole('button', { name: 'Pay 6M', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Choose move options', exact: true }).click();
  await expect(page.locator('.deal-payment-total')).toContainText('1M overpayment');
  await expect(own(page).locator('.deal-collection footer')).toContainText('Rent 0M');
  await expect(page.getByText(/No change is given\./)).toBeVisible();
  await capture(page, 'payment');
  await panel(page).getByRole('button', { name: 'Pay 6M', exact: true }).click();
  expect(await submitted(page)).toEqual(fixture('payment-bank').transitions[0].action);
  await selectScenario(page, 'payment-exact');
  await page.getByRole('button', { name: 'Select bank money', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: 'Pay 5M', exact: true })).toBeEnabled();
  await panel(page).getByRole('button', { name: 'Pay 5M', exact: true }).click();
  expect(await submitted(page)).toEqual(
    fixture('payment-exact').transitions.find((item) => item.label === 'Pay exactly')!.action,
  );
  await selectScenario(page, 'payment-insolvent');
  // Assets cannot cover the bill: the panel says so and offers to give everything.
  await expect(panel(page).getByRole('status')).toContainText('You can’t cover 5M');
  await own(page).getByRole('button', { name: '1M, bank value 1M', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: 'Pay 1M', exact: true })).toBeDisabled();
  await panel(page).getByRole('button', { name: 'Select everything', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: 'Pay 2M', exact: true })).toBeEnabled();
  await panel(page).getByRole('button', { name: 'Close move options', exact: true }).click();
  await expect(command(page).getByRole('button', { name: 'Pay 2M', exact: true })).toBeEnabled();
  await expect(own(page).getByRole('button', { name: /^Wild property, not bankable/ })).toHaveCount(
    0,
  );
  await command(page).getByRole('button', { name: 'Pay 2M', exact: true }).click();
  expect(await submitted(page)).toEqual(fixture('payment-insolvent').transitions[0].action);
});

test('pending saves and disconnection disable an already selected game decision', async ({
  page,
}) => {
  await selectScenario(page, 'forced');
  await hand(page)
    .getByRole('button', { name: /^Forced deal, bank value 3M/ })
    .click();
  await page.getByRole('button', { name: 'Bank for 3M', exact: true }).click();
  const confirm = page.getByRole('button', { name: 'Confirm · bank 3M', exact: true });
  // The harness-only toggles can sit under the open decision panel, so toggle them directly.
  const toggle = async (label: string, checked: boolean) => {
    const box = page.getByLabel(label, { exact: true });
    await box.dispatchEvent('click');
    await expect(box).toBeChecked({ checked });
  };
  await toggle('Saving a move', true);
  await expect(confirm).toBeDisabled();
  await toggle('Saving a move', false);
  await expect(confirm).toBeEnabled();
  await toggle('Disconnected', true);
  await expect(confirm).toBeDisabled();
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
});
