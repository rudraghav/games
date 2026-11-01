import { expect, test } from '@playwright/test';
import catalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };

test('browsing filters intersect, reset deliberately and keep keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#games');
  const library = page.getByRole('region', { name: 'Games' });
  const search = library.getByRole('searchbox', { name: 'Search games' });
  const tiles = library.getByRole('button', { name: /^Create .+ room$/ });

  await library.getByRole('button', { name: 'Cards', exact: true }).click();
  await library.getByRole('combobox', { name: 'Players', exact: true }).selectOption('4');
  await search.fill('SEA SALT & PAPER');
  await expect(tiles).toHaveCount(1);
  await expect(tiles).toHaveAccessibleName('Create Sea Salt & Paper room');
  await expect(library.getByRole('status')).toHaveText('1 game');

  await library.getByRole('combobox', { name: 'Players', exact: true }).selectOption('5');
  await expect(library.getByRole('heading', { name: 'No games found' })).toBeVisible();
  await library.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(search).toBeFocused();
  await expect(search).toHaveValue('');
  await expect(tiles).toHaveCount(catalogue.length);
  await expect(library.getByRole('button', { name: 'All games', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(library.getByRole('button', { name: 'All games', exact: true })).toBeInViewport();

  const cooperative = library.getByRole('button', { name: 'Co-op', exact: true });
  await cooperative.focus();
  await page.keyboard.press('Enter');
  await expect(cooperative).toHaveAttribute('aria-pressed', 'true');
  await library.getByRole('combobox', { name: 'Players', exact: true }).selectOption('6');
  await expect(tiles).toHaveCount(1);
  await expect(tiles).toHaveAccessibleName('Create The Gang room');
  await search.fill('not a game');
  await search.press('Escape');
  await expect(search).toBeFocused();
  await expect(tiles).toHaveCount(1);
  await expect(cooperative).toHaveAttribute('aria-pressed', 'true');
  await expect(library.getByRole('combobox', { name: 'Players', exact: true })).toHaveValue('6');

  await search.fill('gang');
  await library.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(search).toBeFocused();
  await expect(tiles).toHaveCount(1);
  await expect(page.locator('html')).toHaveJSProperty(
    'scrollWidth',
    await page.evaluate(() => innerWidth),
  );
});

test('mobile browsing keeps primary actions in full rows and filters within the page', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  const actions = page.locator('.hero-actions');
  const buttons = actions.getByRole('button');
  if (testInfo.project.name === 'phone') {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 844 });
      const actionBounds = await actions.boundingBox();
      const first = await buttons.nth(0).boundingBox();
      const second = await buttons.nth(1).boundingBox();
      expect(actionBounds).not.toBeNull();
      expect(first!.width).toBeCloseTo(actionBounds!.width, 0);
      expect(second!.width).toBeCloseTo(actionBounds!.width, 0);
      expect(second!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
      expect(first!.height).toBeGreaterThanOrEqual(44);
      expect(second!.height).toBeGreaterThanOrEqual(44);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
    await page.setViewportSize({ width: 390, height: 844 });
  }
  const library = page.getByRole('region', { name: 'Games' });
  await library.scrollIntoViewIfNeeded();
  const solo = library.getByRole('button', { name: 'Solo + bots', exact: true });
  await solo.focus();
  await page.keyboard.press('Enter');
  await expect(solo).toBeInViewport();
  await expect(solo).toHaveAttribute('aria-pressed', 'true');
  await library.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(library.getByRole('button', { name: 'All games', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(library.getByRole('button', { name: 'All games', exact: true })).toBeInViewport();
  await expect(library.getByRole('status')).toHaveText(`${catalogue.length} games`);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('browsing.png') });
});

test('new catalogue illustrations and complete numeric symbols fit their mobile posters', async ({
  page,
}, testInfo) => {
  await page.goto('/#games');
  const widths = testInfo.project.name === 'phone' ? [320, 390] : [1440];
  for (const width of widths) {
    if (testInfo.project.name === 'phone') await page.setViewportSize({ width, height: 844 });
    for (const name of ['The Gang', 'Sea Salt & Paper', 'boop.', '6 nimmt!']) {
      const poster = page
        .getByRole('button', { name: `Create ${name} room`, exact: true })
        .locator('.game-poster');
      expect(
        await poster.evaluate((element) => {
          const bounds = element.getBoundingClientRect();
          const within = (box: DOMRect) =>
            box.left >= bounds.left - 1 &&
            box.right <= bounds.right + 1 &&
            box.top >= bounds.top - 1 &&
            box.bottom <= bounds.bottom + 1;
          return [
            ...element.querySelectorAll(
              '.card-corner, .grid-card-value, .gang-cover-chip, .paper-card-art, .boop-piece',
            ),
          ].every((part) => within(part.getBoundingClientRect()));
        }),
        `${name} at ${width}px`,
      ).toBe(true);
      if (name === '6 nimmt!') await expect(poster.getByText('104', { exact: true })).toBeVisible();
      await poster.screenshot({
        path: testInfo.outputPath(`${name.replace(/[^a-z0-9]+/gi, '-')}-${width}.png`),
      });
    }
  }
});

test('room setup groups profile and game fields with full phone action rows', async ({
  page,
}, testInfo) => {
  await page.goto('/');
  if (testInfo.project.name === 'phone') await page.setViewportSize({ width: 320, height: 844 });
  for (const mode of ['create', 'join'] as const) {
    await page
      .getByRole('button', {
        name: mode === 'create' ? 'Create room' : 'Join a room',
        exact: true,
      })
      .click();
    const dialog = page.getByRole('dialog');
    const form = dialog.locator('form');
    const primary = form.getByRole('button', {
      name: mode === 'create' ? 'Create room' : 'Join the room',
      exact: true,
    });
    const cancel = form.getByRole('button', { name: 'Cancel', exact: true });
    await dialog.getByRole('button', { name: 'Avatar colour 8', exact: true }).click();
    await expect(
      dialog.getByRole('button', { name: 'Avatar colour 8', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
    if (testInfo.project.name === 'phone') {
      await primary.scrollIntoViewIfNeeded();
      const formBox = await form.boundingBox();
      const primaryBox = await primary.boundingBox();
      const cancelBox = await cancel.boundingBox();
      expect(primaryBox!.width).toBeCloseTo(formBox!.width, 0);
      expect(cancelBox!.width).toBeCloseTo(formBox!.width, 0);
      expect(cancelBox!.y).toBeGreaterThanOrEqual(primaryBox!.y + primaryBox!.height);
      if (mode === 'create') {
        const seats = await dialog
          .getByRole('combobox', { name: 'Seats', exact: true })
          .boundingBox();
        const roomName = await dialog
          .getByRole('textbox', { name: 'Room name', exact: true })
          .boundingBox();
        expect(roomName!.y).toBeGreaterThanOrEqual(seats!.y + seats!.height);
        expect(roomName!.width).toBeCloseTo(formBox!.width, 0);
      }
    }
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await dialog.screenshot({ path: testInfo.outputPath(`${mode}-setup.png`) });
    if (testInfo.project.name === 'phone') {
      await form.locator('.form-footer').scrollIntoViewIfNeeded();
      await dialog.screenshot({ path: testInfo.outputPath(`${mode}-actions.png`) });
    }
    await cancel.click();
    await expect(dialog).not.toBeVisible();
  }
});
