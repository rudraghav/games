import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
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
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Setup review uses local sessions only.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const dir = '.vercel/room-setup-review';
  await mkdir(dir, { recursive: true });
  const widths = testInfo.project.name === 'phone' ? [320, 390] : [1440];
  let roomWrites = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && /\/api\/backend\/v1\/rooms(?:\/join)?$/.test(request.url()))
      roomWrites += 1;
  });
  for (const width of widths) {
    await page.setViewportSize({ width, height: width > 700 ? 1000 : 844 });
    for (const mode of ['create', 'join'] as const) {
      await page
        .getByRole('button', {
          name: mode === 'create' ? 'Create room' : 'Join a room',
          exact: true,
        })
        .click();
      const dialog = page.getByRole('dialog');
      const form = dialog.locator('form');
      const primary = form.locator('button[type="submit"]');
      const cancel = form.getByRole('button', { name: 'Cancel', exact: true });
      const palette = dialog.locator('.avatar-options');
      const avatar = dialog.locator('summary[aria-label="Change avatar"]');
      await dialog.getByRole('textbox', { name: 'Your name', exact: true }).fill('Setup Guest');
      await expect(palette).toBeHidden();
      async function fit() {
        expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
          true,
        );
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await primary.scrollIntoViewIfNeeded();
        const formBox = await form.boundingBox();
        const primaryBox = await primary.boundingBox();
        const cancelBox = await cancel.boundingBox();
        expect(primaryBox!.width).toBeCloseTo(formBox!.width, 0);
        expect(cancelBox!.width).toBeCloseTo(formBox!.width, 0);
        expect(primaryBox!.height).toBeGreaterThanOrEqual(44);
        expect(cancelBox!.height).toBeGreaterThanOrEqual(44);
        expect(cancelBox!.y).toBeGreaterThanOrEqual(primaryBox!.y + primaryBox!.height);
        await expect(primary).toBeInViewport({ ratio: 1 });
      }
      if (mode === 'create') {
        await expect(dialog.getByRole('combobox', { name: 'The game', exact: true })).toHaveValue(
          'uno',
        );
        await expect(dialog.getByRole('button', { name: 'Friends', exact: true })).toHaveAttribute(
          'aria-pressed',
          'true',
        );
        await expect(
          dialog.getByRole('textbox', { name: 'Room name', exact: true, includeHidden: true }),
        ).toBeHidden();
        for (const checkbox of await dialog.getByRole('checkbox', { includeHidden: true }).all())
          await expect(checkbox).toBeHidden();
      }
      await fit();
      await dialog.screenshot({ path: `${dir}/${mode}-${width}-base.png` });
      await avatar.click();
      await expect(palette).toBeVisible();
      await expect(palette.getByRole('button')).toHaveCount(8);
      const dialogBox = await dialog.boundingBox();
      const paletteBox = await palette.boundingBox();
      expect(paletteBox!.x).toBeGreaterThanOrEqual(dialogBox!.x);
      expect(paletteBox!.x + paletteBox!.width).toBeLessThanOrEqual(
        dialogBox!.x + dialogBox!.width,
      );
      await dialog.screenshot({ path: `${dir}/${mode}-${width}-avatar.png` });
      await palette.getByRole('button', { name: 'Avatar colour 8', exact: true }).click();
      await expect(palette).toBeHidden();
      await expect(avatar).toBeFocused();
      await avatar.click();
      const selectedAvatar = palette.getByRole('button', { name: 'Avatar colour 8', exact: true });
      await expect(selectedAvatar).toHaveAttribute('aria-pressed', 'true');
      await selectedAvatar.focus();
      await page.keyboard.press('Escape');
      await expect(palette).toBeHidden();
      await expect(dialog).toBeVisible();
      await expect(avatar).toBeFocused();
      if (mode === 'create') {
        await dialog.getByText('Room options', { exact: true }).click();
        const roomName = dialog.getByRole('textbox', { name: 'Room name', exact: true });
        await expect(roomName).toBeVisible();
        await roomName.fill('Friday table');
        const rules = dialog.getByRole('checkbox');
        expect(await rules.count()).toBeGreaterThan(0);
        const firstRule = rules.first();
        const toggled = !(await firstRule.isChecked());
        await firstRule.setChecked(toggled);
        await dialog.getByRole('button', { name: 'Bots', exact: true }).click();
        await expect(primary).toHaveText('Play game');
        await expect(dialog.getByRole('combobox', { name: 'Seats', exact: true })).toHaveValue('2');
        await expect(roomName).toHaveValue('Friday table');
        await expect(firstRule).toBeChecked({ checked: toggled });
        await fit();
        await dialog.screenshot({ path: `${dir}/create-${width}-bots-options.png` });
        await dialog.getByRole('button', { name: 'Friends', exact: true }).click();
        await expect(primary).toHaveText('Create room');
        await expect(roomName).toHaveValue('Friday table');
        await expect(firstRule).toBeChecked({ checked: toggled });
        await fit();
        await dialog.screenshot({ path: `${dir}/create-${width}-options.png` });
      }
      await cancel.click();
      await expect(dialog).toBeHidden();
    }
  }
  expect(roomWrites).toBe(0);
});
