import { expect, test } from '@playwright/test';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'The complete hand fixture gallery is local-only.');

test('large hands have separate page controls and horizontal focus reveal without moving the page', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design');
  await page.getByLabel('Table scenario').selectOption({ label: 'Uno · maximum seats' });
  const hand = page.getByRole('group', { name: 'Your hand', exact: true });
  const rail = hand.locator('..');
  await expect(rail).toHaveAttribute('data-overflow', 'true');
  await expect(hand.getByRole('button')).toHaveCount(42);
  const previous = rail.getByRole('button', { name: 'Previous cards in your hand', exact: true });
  const next = rail.getByRole('button', { name: 'Next cards in your hand', exact: true });
  await expect(previous).toBeDisabled();
  await expect(next).toBeEnabled();
  const before = await hand.evaluate((node) => node.scrollLeft);
  await next.click();
  await expect.poll(() => hand.evaluate((node) => node.scrollLeft)).toBeGreaterThan(before);
  const pagePosition = await page.evaluate(() => scrollY);
  const last = hand.getByRole('button').last();
  await last.evaluate((node) => (node as HTMLElement).focus({ preventScroll: true }));
  const bounds = await last.boundingBox();
  const viewport = await hand.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(viewport!.x - 1);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport!.x + viewport!.width + 1);
  expect(await page.evaluate(() => scrollY)).toBe(pagePosition);
  await expect(next).toBeDisabled();
  await expect(previous).toBeEnabled();
  const controls = await rail.locator('.rail-navigation').evaluateAll((nodes) =>
    nodes.map((node) => ({
      width: node.getBoundingClientRect().width,
      height: node.getBoundingClientRect().height,
    })),
  );
  expect(controls.every((size) => size.width >= 44 && size.height >= 44)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('small hands keep their full width while Deal navigation leaves two complete card faces on phones', async ({
  page,
}) => {
  await page.goto('/design');
  await page.getByLabel('Table scenario').selectOption({ label: 'Uno · minimum seats' });
  if (page.viewportSize()!.width >= 1000)
    await expect(page.locator('.hand-rail .rail-navigation')).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByLabel('Table scenario').selectOption({ label: 'Monopoly Deal · maximum seats' });
  const hand = page.getByRole('group', { name: 'Your hand', exact: true });
  await expect(hand.locator('..')).toHaveAttribute('data-overflow', 'true');
  const cards = hand.getByRole('button');
  const frame = await hand.boundingBox();
  const second = await cards.nth(1).boundingBox();
  expect(second!.x + second!.width).toBeLessThanOrEqual(frame!.x + frame!.width + 1);
  const area = await cards.first().boundingBox();
  const beforeTop = await hand.evaluate((node) => node.getBoundingClientRect().top + scrollY);
  await cards.first().click();
  expect(await hand.evaluate((node) => node.getBoundingClientRect().top + scrollY)).toBe(beforeTop);
  const afterArea = await cards.first().boundingBox();
  expect(afterArea!.width).toBe(area!.width);
});
