import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'The synthetic gallery is local-only.');
  await page.goto('/design');
});

test('Flip 7 keeps the live hand beside decisions and opponents inspectable by keyboard', async ({
  page,
}) => {
  await page.getByLabel('Table scenario').selectOption({ label: 'Flip 7 · maximum seats' });
  const own = page.locator('.flip-player[data-own="true"]');
  const decision = page.locator('.flip-seven-table .action-panel');
  await expect(own.locator('.flip-card-row')).toBeVisible();
  expect(await own.evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(
    await decision.evaluate((el) => el.getBoundingClientRect().top),
  );
  const opponent = page.locator('.flip-player-grid > .flip-player').first();
  await expect(opponent).not.toHaveAttribute('open');
  await expect(opponent.locator('.flip-round-score')).toBeVisible();
  await opponent.locator('summary').focus();
  await page.keyboard.press('Space');
  await expect(opponent.locator('.flip-card-row')).toBeVisible();
  await expect(own.locator('.flip-card-row')).toBeVisible();
});

test('Azul keeps the center available while all factories can be reached without dragging', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.getByLabel('Table scenario').selectOption({ label: 'Azul · maximum seats' });
  const center = page.getByRole('region', { name: 'Center offer', exact: true });
  await expect(center).toBeVisible();
  const rail = page.locator('.azul-factories');
  if ((page.viewportSize()?.width || 0) <= 600) {
    const next = page.getByRole('button', { name: 'Next factories', exact: true });
    const before = await center.boundingBox();
    await next.click();
    expect(await rail.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    expect(await center.boundingBox()).toEqual(before);
    for (let i = 0; i < 4; i++) await next.click();
    const last = page.getByRole('region', { name: 'Factory 9', exact: true });
    const bounds = await last.boundingBox();
    const frame = await rail.boundingBox();
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(frame!.x + frame!.width + 1);
    await page.getByRole('button', { name: 'Previous factories', exact: true }).click();
    expect(await rail.evaluate((el) => el.scrollLeft)).toBeLessThan(
      await rail.evaluate((el) => el.scrollWidth - el.clientWidth),
    );
  } else {
    await expect(page.getByRole('region', { name: 'Factory 9', exact: true })).toBeVisible();
  }
});

test('number rows expose capacity before committing a private number', async ({ page }) => {
  await page.getByLabel('Table scenario').selectOption({ label: '6 nimmt! · maximum seats' });
  const rows = page.locator('.six-rows');
  const hand = page.getByRole('region', { name: 'Your private number cards' });
  expect(await rows.evaluate((el) => el.getBoundingClientRect().bottom)).toBeLessThanOrEqual(
    await hand.evaluate((el) => el.getBoundingClientRect().top),
  );
  for (const row of await page.locator('.six-row').all()) {
    await expect(row.locator('.six-row-cards > *')).toHaveCount(5);
    expect(
      await row.locator('.six-row-cards').evaluate((el) => el.scrollWidth <= el.clientWidth),
    ).toBe(true);
  }
  await hand.getByRole('button').first().click();
  await expect(page.getByRole('button', { name: 'Lock my number', exact: true })).toBeEnabled();
  await page.getByLabel('Saving a move').check();
  await expect(page.getByRole('button', { name: 'Lock my number', exact: true })).toBeDisabled();
});

test('Hot Seat options appear once and the confirm action fills its row', async ({ page }) => {
  await page.getByLabel('Table scenario').selectOption({ label: 'Hot Seat · maximum seats' });
  await expect(page.locator('.party-prompt .party-options')).toHaveCount(0);
  await expect(page.locator('.party-choice')).toHaveCount(3);
  await page.locator('.party-choice').first().click();
  const confirm = page.getByRole('button', { name: 'Lock in my choice', exact: true });
  await expect(confirm).toBeEnabled();
  expect(
    await confirm.evaluate((el) =>
      Math.abs(el.getBoundingClientRect().width - el.parentElement!.clientWidth),
    ),
  ).toBeLessThanOrEqual(1);
});

test('Gem Market keeps every tier reachable and all four cards readable on phones', async ({
  page,
}) => {
  await page.getByLabel('Table scenario').selectOption({ label: 'Gem Market · maximum seats' });
  if ((page.viewportSize()?.width || 0) <= 600) {
    for (const tier of [1, 2, 3]) {
      await page.getByRole('button', { name: `Tier ${tier}`, exact: true }).click();
      const market = page.getByRole('region', { name: `Tier ${tier} developments`, exact: true });
      await expect(market.getByRole('button')).toHaveCount(4);
      expect(await market.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
      await market.getByRole('button').first().click();
      await expect(market.getByRole('button').first()).toHaveAttribute('aria-pressed', 'true');
    }
  } else {
    for (const tier of [1, 2, 3]) {
      await expect(
        page.getByRole('region', { name: `Tier ${tier} developments`, exact: true }),
      ).toBeVisible();
    }
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('narrow phones retain readable private ranks, complete number rows and touch controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const game of ['Flip 7', 'Trio', 'Azul', 'The Gang', '6 nimmt!', 'Gem Market']) {
    await page.getByLabel('Table scenario').selectOption({ label: `${game} · maximum seats` });
    const tiny = await page.locator('.table-layout button:enabled:visible').evaluateAll((buttons) =>
      buttons
        .filter((button) => {
          const box = button.getBoundingClientRect();
          return box.width < 43.5 || box.height < 43.5;
        })
        .map((button) => button.getAttribute('aria-label') || button.textContent),
    );
    expect(tiny, `${game} narrow-phone controls`).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (game === '6 nimmt!') {
      for (const row of await page.locator('.six-row-cards').all())
        expect(await row.evaluate((el) => el.scrollWidth <= el.clientWidth)).toBe(true);
    }
  }
  await page.getByLabel('Table scenario').selectOption({ label: 'Trio · minimum seats' });
  const hand = page.getByRole('region', { name: 'Your private sorted hand' });
  await expect(hand.locator('.playing-card')).toHaveCount(9);
  expect(
    await hand.locator('.flip-card-row').evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
});
