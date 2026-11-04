import { expect, test } from '@playwright/test';

test('table decisions stay near the hand and explain direct grid actions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design');
  const scenario = page.getByLabel('Table scenario');
  await scenario.selectOption({ label: 'Monopoly Deal · maximum seats' });
  const hand = await page.locator('.deal-hand-dock').boundingBox();
  const ownBoard = await page.locator('.deal-player[data-own="true"]').boundingBox();
  const center = await page.locator('.deal-center').boundingBox();
  // Reading order: shared centre, your hand and its actions, then your own bank and sets.
  expect(center!.y + center!.height).toBeLessThanOrEqual(hand!.y);
  expect(hand!.y + hand!.height).toBeLessThanOrEqual(ownBoard!.y);
  await expect(page.getByRole('button', { name: 'End turn' })).toBeVisible();
  const firstCard = page
    .getByRole('group', { name: 'Your hand', exact: true })
    .getByRole('button')
    .first();
  await firstCard.focus();
  await firstCard.press('Enter');
  await expect(firstCard).toHaveAttribute('aria-pressed', 'true');
  const actions = page.getByRole('region', { name: 'Your actions', exact: true });
  const selectedName = (await firstCard.getAttribute('aria-label'))!.split(',')[0];
  await expect(actions.getByText(selectedName, { exact: true })).toBeVisible();
  await expect(
    actions.getByRole('button', { name: 'Choose move options', exact: true }),
  ).toBeEnabled();
  await page.getByRole('button', { name: 'Clear card selection' }).click();
  await expect(firstCard).toHaveAttribute('aria-pressed', 'false');
  await scenario.selectOption({ label: 'Skyjo · maximum seats' });
  // The dock repeats the server's instruction for the seat that can act.
  await expect(
    actions.getByText('Turn over two of your cards to begin.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Waiting for the next move…', { exact: true })).toHaveCount(0);
  const ownGrid = page.locator('.skyjo-player[data-own="true"]');
  await expect(ownGrid.getByRole('button')).toHaveCount(12);
  const name = ownGrid.locator('.seat-copy strong');
  await expect(name).toHaveAttribute('title', 'Alexandra with a rather long name');
  await scenario.selectOption({ label: 'Texas Hold’em · minimum seats' });
  const cards = await page.locator('.private-hand').boundingBox();
  const decisions = await page.getByRole('region', { name: 'Your actions' }).boundingBox();
  if (page.viewportSize()!.width < 600)
    expect(cards!.y + cards!.height).toBeLessThanOrEqual(decisions!.y);
  else {
    expect(Math.abs(cards!.y - decisions!.y)).toBeLessThan(2);
    expect(cards!.x + cards!.width).toBeLessThanOrEqual(decisions!.x);
  }
  expect(
    await page.locator('.action-panel').evaluate((element) => getComputedStyle(element).position),
  ).toBe('relative');
  if (page.viewportSize()!.width < 600) {
    const seats = await page.locator('.casino-seats').boundingBox();
    expect(decisions!.y + decisions!.height).toBeLessThanOrEqual(seats!.y);
  }
  await page.getByLabel('Saving a move', { exact: true }).check();
  await expect(page.getByRole('region', { name: 'Your actions' })).toHaveAttribute(
    'aria-busy',
    'true',
  );
  for (const button of await page.locator('.action-choices button').all())
    await expect(button).toBeDisabled();
  await expect(page.getByRole('spinbutton')).toBeDisabled();
  await page.getByLabel('Saving a move', { exact: true }).uncheck();
  await page.getByLabel('Disconnected', { exact: true }).check();
  await expect(page.getByText('Waiting for players to reconnect.', { exact: true })).toBeVisible();
  for (const button of await page.locator('.action-choices button').all())
    await expect(button).toBeDisabled();
});

test('rummy rank sorting and keyboard grouping retain card identity', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design');
  await page.getByLabel('Table scenario').selectOption({ label: 'Rummy · maximum seats' });
  await page.getByLabel('Sort').selectOption('rank');
  const cards = page.getByRole('group', { name: 'Ungrouped', exact: true }).getByRole('button');
  const labels = await cards.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('aria-label')!),
  );
  const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', 'Joker'];
  const ranks = labels.map((label) => rankOrder.indexOf(label.split(' ')[0]));
  expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  const first = cards.first();
  const label = await first.getAttribute('aria-label');
  await first.focus();
  await first.press('Space');
  await expect(first).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Group 1', exact: true }).click();
  await expect(
    page.getByRole('group', { name: 'Group 1', exact: true }).getByRole('button'),
  ).toHaveAttribute('aria-label', label!);
  const groupedCards = page.locator('.rummy-groups .card-hand > button');
  await expect(groupedCards).toHaveCount(13);
  expect(
    await groupedCards.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('aria-label')!).sort(),
    ),
  ).toEqual([...labels].sort());
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(
    true,
  );
});
