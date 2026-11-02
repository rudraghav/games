import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dealScenarios } from '../../apps/web/src/stories/generated/deal-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Authorized fixture review is local-only.');
const own = (page: Page) => page.locator('.deal-player[data-own="true"]');
const dialog = (page: Page) => page.getByRole('dialog', { name: 'Card info', exact: true });
async function scenario(page: Page, id: string) {
  await page.getByRole('combobox', { name: 'Deal scenario', exact: true }).selectOption(id);
  await page.evaluate(() => document.fonts.ready);
}
async function bounds(page: Page) {
  return page.locator('.deal-workspace').evaluate((root) =>
    ['.deal-board-scroll', '.deal-command-dock', '.deal-hand-dock'].map((selector) => {
      const rect = root.querySelector(selector)!.getBoundingClientRect();
      return { y: rect.y + scrollY, height: rect.height };
    }),
  );
}
async function unchanged(page: Page, before: Awaited<ReturnType<typeof bounds>>) {
  const after = await bounds(page);
  for (let index = 0; index < before.length; index++) {
    expect(Math.abs(before[index].y - after[index].y)).toBeLessThan(1);
    expect(Math.abs(before[index].height - after[index].height)).toBeLessThan(1);
  }
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
}
async function capture(page: Page, name: string) {
  await mkdir('.vercel/game-info-review', { recursive: true });
  await dialog(page).screenshot({
    path: `.vercel/game-info-review/${test.info().project.name}-${name}.png`,
  });
}
test.beforeEach(async ({ page }) => {
  if (test.info().project.name === 'phone') await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design/deal');
});

test('set Info explains completion, each rent step and buildings without selecting or playing', async ({
  page,
}) => {
  await scenario(page, 'collections');
  const before = await bounds(page);
  const info = own(page).getByRole('button', { name: 'Inspect Brown · set 1', exact: true });
  await info.focus();
  await info.press('Enter');
  await expect(dialog(page)).toContainText('2 of 2 properties');
  await expect(dialog(page)).toContainText('Current rent 9M');
  await expect(dialog(page)).toContainText('House: Add to a complete street set. Rent +3M.');
  await expect(dialog(page)).toContainText('Hotel: Add after a house. Rent +4M.');
  const ladder = dialog(page).getByRole('table');
  await expect(ladder.getByRole('row', { name: '1 property 1M', exact: true })).toBeVisible();
  await expect(ladder.getByRole('row', { name: '2 properties 2M', exact: true })).toBeVisible();
  await capture(page, 'deal-complete-set');
  await page.keyboard.press('Escape');
  await expect(info).toBeFocused();
  await unchanged(page, before);
  await expect(page.locator('.playing-card[aria-pressed="true"]')).toHaveCount(0);
});

test('wild information covers every allowed colour and remains available during a payment', async ({
  page,
}) => {
  await scenario(page, 'payment-bank');
  await page.getByRole('button', { name: 'Close move options', exact: true }).click();
  const before = await bounds(page);
  await own(page).getByRole('button', { name: 'Inspect Brown · set 1', exact: true }).click();
  await expect(
    dialog(page).getByRole('heading', { name: 'Wild property', exact: true }),
  ).toBeVisible();
  await expect(dialog(page).getByRole('table')).toHaveCount(10);
  await expect(dialog(page).getByText('None', { exact: true })).toBeVisible();
  await expect(dialog(page)).toContainText('Properties cannot be banked.');
  await expect(dialog(page)).toContainText('Current rent 0M');
  await dialog(page)
    .getByText('Dark blue · 2 properties to complete', { exact: true })
    .scrollIntoViewIfNeeded();
  await expect(
    dialog(page).getByRole('row', { name: '2 properties 8M', exact: true }),
  ).toBeVisible();
  expect(await dialog(page).evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
    true,
  );
  await capture(page, 'deal-wild-rents');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Pay 0M', exact: true })).toBeDisabled();
  await unchanged(page, before);
});

test('large-hand and selected-rent inspection preserve selection, geometry and exact boosted bill', async ({
  page,
}) => {
  await scenario(page, 'information-hand');
  const fixture = dealScenarios.find((item) => item.id === 'information-hand')!;
  const before = await bounds(page);
  const info = page.getByRole('button', { name: 'Card info', exact: true });
  const first = page.locator('.card-hand > button').first();
  await first.click();
  const panel = page.locator('.table-decision-panel');
  if (await panel.count())
    await panel.getByRole('button', { name: 'Close move options', exact: true }).click();
  await info.click();
  for (const card of fixture.room.game!.hand)
    await dialog(page)
      .getByRole('combobox', { name: 'Card to inspect', exact: true })
      .selectOption(card.id);
  await page.keyboard.press('Escape');
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await expect(info).toBeFocused();
  await unchanged(page, before);
  expect(
    await first.evaluate(
      (card) =>
        card.getBoundingClientRect().bottom <=
        card.closest('.deal-hand-dock')!.getBoundingClientRect().bottom + 1,
    ),
  ).toBe(true);

  await scenario(page, 'doubled-rent');
  const rentFixture = dealScenarios.find((item) => item.id === 'doubled-rent')!;
  await info.click();
  await dialog(page)
    .getByRole('combobox', { name: 'Card to inspect', exact: true })
    .selectOption(rentFixture.focusCard!);
  await expect(dialog(page)).toContainText('Rent multiplier this turn: ×2');
  await expect(
    dialog(page).getByRole('region', { name: 'Available rent charges', exact: true }),
  ).toContainText('Brown · set 1: 18M');
  await capture(page, 'deal-rent-18M');
  await page.keyboard.press('Escape');
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
});

test('inspecting an opponent public set restores focus inside its parent dialog and reveals no hand', async ({
  page,
}) => {
  await scenario(page, 'forced');
  const before = await bounds(page);
  const inspectPlayer = page.getByRole('button', { name: 'Inspect Mira', exact: true });
  await inspectPlayer.click();
  const parent = page.getByRole('dialog', { name: 'Mira · public table', exact: true });
  const info = parent.getByRole('button', { name: 'Inspect Green · set 1', exact: true });
  await info.click();
  await expect(dialog(page)).toContainText('1 of 3 properties');
  await expect(dialog(page)).toContainText('2 more needed');
  await expect(dialog(page)).toContainText('Current rent 2M');
  await expect(
    dialog(page).getByRole('table').getByRole('row', { name: '3 properties 7M', exact: true }),
  ).toBeVisible();
  await expect(dialog(page).locator('.private-hand')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(parent).toBeVisible();
  await expect(info).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(inspectPlayer).toBeFocused();
  await unchanged(page, before);
});
