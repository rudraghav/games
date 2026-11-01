import { expect, test } from '@playwright/test';
import { requestAs, roomAs } from './helpers';

test.use({ trace: 'off', screenshot: 'off' });

test('compact discovery preserves solo intent and clear private setup', async ({ page }, info) => {
  await page.goto('/');
  for (const width of info.project.name === 'phone' ? [320, 390] : [1440]) {
    await page.setViewportSize({ width, height: info.project.name === 'phone' ? 844 : 1000 });
    await page.evaluate(() => document.fonts.ready);
    const first = await page.locator('.game-tile').first().boundingBox();
    expect(first!.y).toBeLessThan(420);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const clippedCovers = await page.locator('.game-tile').evaluateAll((tiles) =>
      tiles.flatMap((tile) => {
        const poster = tile.querySelector('.game-poster')!.getBoundingClientRect();
        return [
          ...tile.querySelectorAll(
            '.game-poster .playing-card, .game-poster .tarot-card, .game-poster .word-tile',
          ),
        ].flatMap((card) => {
          const bounds = card.getBoundingClientRect();
          return bounds.left < poster.left - 1 ||
            bounds.right > poster.right + 1 ||
            bounds.top < poster.top - 1 ||
            bounds.bottom > poster.bottom + 1
            ? [tile.getAttribute('aria-label')]
            : [];
        });
      }),
    );
    expect(clippedCovers).toEqual([]);
  }
  const library = page.getByRole('region', { name: 'Games', exact: true });
  await library.getByRole('combobox', { name: 'Players', exact: true }).selectOption('1');
  const uno = library.getByRole('button', { name: 'Create Uno room', exact: true });
  await expect(uno.getByText('You + bots', { exact: true })).toBeVisible();
  await uno.click();
  const dialog = page.getByRole('dialog', { name: 'Create room', exact: true });
  await expect(dialog.getByRole('button', { name: 'Bots', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(dialog.getByRole('combobox', { name: 'Seats', exact: true })).toHaveValue('2');
  await expect(
    dialog.getByText('Invite-only. Share a link or room code to add friends.', { exact: true }),
  ).toHaveCount(1);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(uno).toBeFocused();
  await library.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(library.getByRole('searchbox', { name: 'Search games' })).toBeFocused();
  await library.getByRole('button', { name: 'Solo + bots', exact: true }).click();
  await uno.click();
  await expect(dialog.getByRole('button', { name: 'Bots', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.keyboard.press('Escape');
});

test('private room shortcuts and pasted invite links stay membership-scoped', async ({
  page,
  browser,
  baseURL,
}) => {
  const friendContext = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  const outsiderContext = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  const friend = await friendContext.newPage();
  const outsider = await outsiderContext.newPage();
  let id: string | undefined;
  let friendJoined = false;
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Uno room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Dashboard Host');
    await page.getByRole('textbox', { name: 'Room name', exact: true }).fill('Dashboard table');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    id = new URL(page.url()).pathname.split('/').at(-1)!;
    const room = await roomAs(page, id);
    expect(room.invite_token).toBeTruthy();
    await page.goto('/');
    const rooms = page.getByRole('region', { name: 'Your rooms', exact: true });
    await expect(
      rooms.getByRole('link', { name: 'Open Dashboard table, Uno', exact: true }),
    ).toBeVisible();
    expect((await rooms.boundingBox())!.y).toBeLessThan(
      (await page.locator('.library-controls').boundingBox())!.y,
    );
    await friend.goto('/');
    await expect(friend.getByRole('region', { name: 'Your rooms', exact: true })).toHaveCount(0);
    await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
    await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Dashboard Friend');
    await friend
      .getByRole('textbox', { name: 'Room code', exact: true })
      .fill(`${baseURL}/join/${room.invite_token}`);
    await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect(friend).toHaveURL(new RegExp(`/rooms/${id}$`));
    friendJoined = true;
    expect((await roomAs(friend, id)).members).toHaveLength(2);
    await friend.goto('/');
    await expect(
      friend
        .getByRole('region', { name: 'Your rooms', exact: true })
        .getByRole('link', { name: 'Open Dashboard table, Uno', exact: true }),
    ).toBeVisible();
    await outsider.goto('/');
    await outsider.getByRole('button', { name: 'Join a room', exact: true }).click();
    await expect(outsider.getByRole('textbox', { name: 'Room code', exact: true })).toBeVisible();
    await expect.poll(async () => (await requestAs(outsider, 'me')).status()).toBe(200);
    await outsider.getByRole('button', { name: 'Cancel', exact: true }).click();
    expect((await requestAs(outsider, `rooms/${id}`)).status()).toBe(404);
    await expect(outsider.getByRole('region', { name: 'Your rooms', exact: true })).toHaveCount(0);
    await page.screenshot({ path: test.info().outputPath('member-dashboard.png') });
  } finally {
    if (id) {
      if (friendJoined)
        expect((await requestAs(friend, `rooms/${id}/leave`, 'POST')).status()).toBe(200);
      expect((await requestAs(page, `rooms/${id}/leave`, 'POST')).status()).toBe(200);
      expect((await requestAs(page, `rooms/${id}`)).status()).toBe(404);
    }
    await friendContext.close();
    await outsiderContext.close();
  }
});

test('canonical board covers keep every cell in lobby and member thumbnails', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: info.project.name === 'phone' ? 320 : 1440, height: 844 });
  const inside = async (container: ReturnType<typeof page.locator>, selector: string) =>
    container.evaluate((element, childSelector) => {
      const outer = element.getBoundingClientRect();
      const cells = [...element.querySelectorAll(childSelector)];
      return cells.every((cell) => {
        const bounds = cell.getBoundingClientRect();
        return (
          bounds.left >= outer.left - 1 &&
          bounds.right <= outer.right + 1 &&
          bounds.top >= outer.top - 1 &&
          bounds.bottom <= outer.bottom + 1
        );
      });
    }, selector);
  for (const [name, count] of [
    ['Checkers', 64],
    ['Reversi', 64],
    ['Four in a Row', 42],
  ] as const) {
    let id: string | undefined;
    try {
      await page.goto('/');
      await page.getByRole('button', { name: `Create ${name} room`, exact: true }).click();
      await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Board Cover QA');
      await page.getByRole('textbox', { name: 'Room name', exact: true }).fill('Cover table');
      await page.getByRole('button', { name: 'Create room', exact: true }).click();
      await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
      id = new URL(page.url()).pathname.split('/').at(-1)!;
      const lobby = page.locator('.lobby-game');
      await expect(lobby.locator('.game-art > span')).toHaveCount(count);
      expect(await inside(lobby, '.game-art > span')).toBe(true);
      await page.goto('/');
      const room = page.getByRole('link', { name: `Open Cover table, ${name}`, exact: true });
      await expect(room).toBeVisible();
      await expect(room.locator('.game-art > span')).toHaveCount(count);
      expect(await inside(room.locator('.room-shortcut-art'), '.game-art > span')).toBe(true);
    } finally {
      if (id) {
        expect((await requestAs(page, `rooms/${id}/leave`, 'POST')).status()).toBe(200);
        expect((await requestAs(page, `rooms/${id}`)).status()).toBe(404);
      }
    }
  }
});
