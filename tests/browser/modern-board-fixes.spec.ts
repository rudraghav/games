import { expect, test, type Page } from '@playwright/test';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Local legal-projection review only.');
test.use({ trace: 'off', screenshot: 'only-on-failure' });

async function scenario(page: Page, game: string, phase?: string) {
  const item = midgameScenarios.find(
    (entry) => entry.game === game && (!phase || entry.room.game!.phase === phase),
  )!;
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(game);
  await page
    .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
    .selectOption(item.id);
  return item;
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design/midgame');
});

test('boop graduation previews and clears without submitting before confirmation', async ({
  page,
}) => {
  const item = await scenario(page, 'boop', 'graduating');
  const choice = item.room.game!.actions!.find((option) => option.action.type === 'graduate')!;
  const button = page.getByRole('button', { name: choice.label, exact: true });
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.boop-square[data-highlight="true"]')).toHaveCount(3);
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Confirm graduation', exact: true }),
  ).toBeDisabled();
  await button.focus();
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Confirm graduation', exact: true }).click();
  await expect(page.getByLabel('Submitted action', { exact: true })).toContainText(
    '"type":"graduate"',
  );
});

test('Paper inspection restores focus and crab selection requires a distinct take', async ({
  page,
}) => {
  await scenario(page, 'sea-salt-paper', 'draw');
  const inspect = page.getByRole('button', { name: /^Inspect discard 1:/ });
  await inspect.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toContainText('Inspecting does not take the card.');
  await expect(dialog.locator('.paper-playing-card__rule')).not.toBeEmpty();
  await page.keyboard.press('Escape');
  await expect(inspect).toBeFocused();
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  const item = await scenario(page, 'sea-salt-paper', 'crab_card');
  const choice = item.room.game!.actions!.find(
    (option) => option.action.type === 'take_inspected',
  )!;
  const options = item.room.game!.detail!.private_options as {
    id: string;
    label: string;
    subtitle: string;
  }[];
  const card = options.find((entry) => entry.id === choice.action.card)!;
  await page.getByRole('button', { name: `${card.label}. ${card.subtitle}`, exact: true }).click();
  await expect(page.locator('.paper-choice-information')).toContainText(card.subtitle);
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  await page.getByRole('button', { name: /^Take selected / }).click();
  await expect(page.getByLabel('Submitted action', { exact: true })).toContainText(
    '"type":"take_inspected"',
  );
});

test('320px boards expose overview, pan controls and the last keyboard action', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  for (const game of ['four-in-a-row', 'reversi', 'checkers', 'mancala']) {
    await scenario(page, game);
    const overview = page.getByRole('button', { name: 'View whole board', exact: true });
    await expect(overview).toBeVisible();
    // Boards that fit show every square; only an overflowing rail needs the pan cue.
    const rail = page.locator('.board-rail');
    if ((await rail.getAttribute('data-overflow')) === 'true')
      await expect(page.locator('.board-pan-hint')).toBeVisible();
    else
      expect(
        await rail.evaluate((node) => {
          const frame = node.getBoundingClientRect();
          return [...node.querySelectorAll('.board-square, .mancala-pit')].every((cell) => {
            const box = cell.getBoundingClientRect();
            return box.left >= frame.left - 1 && box.right <= frame.right + 1;
          });
        }),
      ).toBe(true);
    await overview.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toContainText('Read-only overview.');
    expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
    await page.keyboard.press('Escape');
    await expect(overview).toBeFocused();
    const last =
      game === 'four-in-a-row'
        ? page.getByRole('button', { name: 'Drop in column 7', exact: true })
        : page.locator('.board-rail .horizontal-rail-viewport button:enabled').last();
    await last.focus();
    expect(
      await last.evaluate((node) => {
        const frame = node.closest('.horizontal-rail-viewport')!.getBoundingClientRect();
        const rect = node.getBoundingClientRect();
        return (
          rect.left >= frame.left - 1 &&
          rect.right <= frame.right + 1 &&
          rect.width >= 43.5 &&
          rect.height >= 43.5
        );
      }),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('Gem selected development explains the authoritative shortfall', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  const item = await scenario(page, 'gem-market', 'playing');
  const quotes = item.room.game!.detail!.purchase_quotes as Record<
    string,
    { affordable: boolean; shortfall: number }
  >;
  const card = item.room.game!.community!.find(
    (entry) => quotes[entry.id] && !quotes[entry.id].affordable,
  )!;
  await page
    .locator('.gem-tier[data-active="true"] button.development-card')
    .filter({ hasText: card.label })
    .click();
  const quote = page.getByLabel('Purchase payment', { exact: true });
  await expect(quote).toContainText('Printed cost');
  await expect(quote).toContainText('Discount');
  await expect(quote).toContainText(`Short by ${quotes[card.id].shortfall}`);
  // The tray with the quote stays inside the viewport after the tap.
  const tray = page.getByRole('region', { name: 'Selected development', exact: true });
  const box = (await tray.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  expect(await quote.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
});

test('board overview remains reachable under 200% and 400% CSS content zoom', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  for (const zoom of [2, 4]) {
    await page.evaluate((scale) => {
      document.documentElement.style.zoom = String(scale);
    }, zoom);
    for (const game of ['four-in-a-row', 'reversi', 'checkers', 'mancala']) {
      await scenario(page, game);
      const opener = page.getByRole('button', { name: 'View whole board', exact: true });
      await opener.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate((node) => node.scrollWidth <= node.clientWidth)).toBe(true);
      await page.keyboard.press('Escape');
      await expect(opener).toBeFocused();
      const last = page.locator('.board-rail .horizontal-rail-viewport button:enabled').last();
      await last.focus();
      expect(
        await last.evaluate((node) => {
          const frame = node.closest('.horizontal-rail-viewport')!.getBoundingClientRect();
          const rect = node.getBoundingClientRect();
          return rect.left >= frame.left - 1 && rect.right <= frame.right + 1;
        }),
      ).toBe(true);
    }
  }
});
