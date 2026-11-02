import { expect, test } from '@playwright/test';
import { requestAs, roomAs, openRoomOptions } from './helpers';

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
    await openRoomOptions(page);
    await page.getByRole('textbox', { name: 'Room name', exact: true }).fill('Dashboard table');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    id = new URL(page.url()).pathname.split('/').at(-1)!;
    const room = await roomAs(page, id);
    expect(room.invite_token).toBeTruthy();
    await page.goto('/');
    await expect(page.locator('.room-shortcut:visible')).toHaveCount(0);
    await page.getByRole('tab', { name: 'Rooms', exact: true }).click();
    const rooms = page.getByRole('region', { name: 'Your rooms', exact: true });
    await expect(
      rooms.getByRole('link', { name: 'Open Dashboard table, Uno', exact: true }),
    ).toBeVisible();
    await expect(page.getByRole('tabpanel', { name: 'Games', exact: true })).toHaveCount(0);
    await friend.goto('/');
    await friend.getByRole('tab', { name: 'Rooms', exact: true }).click();
    await expect(friend.getByRole('heading', { name: 'No rooms yet', exact: true })).toBeVisible();
    await expect(friend.locator('.room-shortcut:visible')).toHaveCount(0);
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
    await friend.getByRole('tab', { name: 'Rooms', exact: true }).click();
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
    await outsider.getByRole('tab', { name: 'Rooms', exact: true }).click();
    await expect(
      outsider.getByRole('heading', { name: 'No rooms yet', exact: true }),
    ).toBeVisible();
    await expect(outsider.locator('.room-shortcut:visible')).toHaveCount(0);
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
      await openRoomOptions(page);
      await page.getByRole('textbox', { name: 'Room name', exact: true }).fill('Cover table');
      await page.getByRole('button', { name: 'Create room', exact: true }).click();
      await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
      id = new URL(page.url()).pathname.split('/').at(-1)!;
      const lobby = page.locator('.lobby-game');
      await expect(lobby.locator('.game-art > span')).toHaveCount(count);
      expect(await inside(lobby, '.game-art > span')).toBe(true);
      await page.goto('/');
      await page.getByRole('tab', { name: 'Rooms', exact: true }).click();
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

test('Games and Rooms use keyboard tabs, preserve filters and never create a browsing identity', async ({
  page,
}, info) => {
  const sessionRequests: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path === '/api/dev-session' || path.endsWith('/v1/me') || path.endsWith('/auth/v1/signup'))
      sessionRequests.push(path);
  });
  await page.setViewportSize({ width: info.project.name === 'phone' ? 320 : 1440, height: 844 });
  await page.goto('/');
  const games = page.getByRole('tab', { name: 'Games', exact: true });
  const rooms = page.getByRole('tab', { name: 'Rooms', exact: true });
  await expect(games).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[role="tabpanel"]')).toHaveCount(2);
  for (const tab of [games, rooms]) {
    const box = await tab.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  const search = page.getByRole('searchbox', { name: 'Search games', exact: true });
  await search.fill('uno');
  await page.getByRole('combobox', { name: 'Players', exact: true }).selectOption('2');
  await page.getByRole('button', { name: 'Cards', exact: true }).click();
  const tiles = await page.locator('.game-tile').allTextContents();
  await games.focus();
  await games.press('ArrowRight');
  await expect(rooms).toBeFocused();
  await expect(rooms).toHaveAttribute('aria-selected', 'true');
  await expect(rooms).toHaveAttribute('tabindex', '0');
  await expect(games).toHaveAttribute('tabindex', '-1');
  const panel = page.getByRole('tabpanel', { name: 'Rooms', exact: true });
  await expect(panel).toHaveAttribute('id', (await rooms.getAttribute('aria-controls'))!);
  await expect(panel).toHaveAttribute('aria-labelledby', (await rooms.getAttribute('id'))!);
  await expect(panel.getByRole('heading', { name: 'No rooms yet', exact: true })).toBeVisible();
  await expect(page.locator('.game-tile:visible')).toHaveCount(0);
  await rooms.press('ArrowRight');
  await expect(games).toBeFocused();
  await games.press('End');
  await expect(rooms).toBeFocused();
  await rooms.press('Home');
  await expect(games).toBeFocused();
  await games.press('ArrowLeft');
  await expect(rooms).toBeFocused();
  await expect(page.getByRole('navigation', { name: 'Main navigation', exact: true })).toHaveCount(
    0,
  );
  await page.getByRole('link', { name: 'Games home', exact: true }).click();
  await expect(games).toHaveAttribute('aria-selected', 'true');
  await expect(search).toHaveValue('uno');
  await expect(page.getByRole('combobox', { name: 'Players', exact: true })).toHaveValue('2');
  await expect(page.getByRole('button', { name: 'Cards', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  expect(await page.locator('.game-tile').allTextContents()).toEqual(tiles);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(await page.evaluate(() => localStorage.getItem('games:player:v1'))).toBeNull();
  expect(sessionRequests).toEqual([]);
});

test('Rooms loading, retry and membership groups leave Games clear', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('games:player:v1', JSON.stringify({ name: 'Preview member', avatar: 0 })),
  );
  await page.route('**/api/dev-session', (route) => route.fulfill({ status: 200, body: '{}' }));
  let release: () => void = () => undefined;
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  let state: 'waiting' | 'error' | 'ready' = 'waiting';
  await page.route('**/api/backend/v1/me', async (route) => {
    if (state === 'waiting') await waiting;
    await route.fulfill(
      state === 'ready'
        ? {
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              profile: null,
              anonymous: true,
              history: [],
              rooms: [
                {
                  id: '11111111-1111-4111-8111-111111111111',
                  name: 'Waiting table',
                  game_id: 'azul',
                  status: 'lobby',
                  players: 2,
                },
                {
                  id: '22222222-2222-4222-8222-222222222222',
                  name: 'Friday table',
                  game_id: 'uno',
                  status: 'playing',
                  players: 3,
                },
                {
                  id: '33333333-3333-4333-8333-333333333333',
                  name: 'Last game',
                  game_id: 'holdem',
                  status: 'finished',
                  players: 2,
                },
              ],
            }),
          }
        : {
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Unavailable' }),
          },
    );
  });
  await page.goto('/');
  await expect(page.locator('.room-shortcut:visible')).toHaveCount(0);
  await page.getByRole('tab', { name: 'Rooms', exact: true }).click();
  await expect(page.getByText('Loading your rooms…', { exact: true })).toBeVisible();
  state = 'error';
  release();
  await expect(
    page.getByRole('heading', { name: 'Could not load rooms', exact: true }),
  ).toBeVisible();
  state = 'ready';
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  const active = page.getByRole('region', { name: 'In progress and waiting', exact: true });
  await expect(active.getByRole('link')).toHaveCount(2);
  await expect(active.getByRole('link').first()).toHaveAttribute(
    'href',
    '/rooms/22222222-2222-4222-8222-222222222222',
  );
  const finished = page.getByRole('region', { name: 'Finished rooms', exact: true });
  await expect(
    finished.getByRole('link', { name: 'Open Last game, Texas Hold’em', exact: true }),
  ).toBeVisible();
  await page.getByRole('tab', { name: 'Games', exact: true }).click();
  await expect(page.locator('.room-shortcut:visible')).toHaveCount(0);
  await expect(page.getByRole('tabpanel', { name: 'Games', exact: true })).toBeVisible();
});

test('a profile-loaded member keeps owned Rooms without a remembered-player flag', async ({
  page,
}) => {
  let id: string | undefined;
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Uno room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Cache Member');
    await openRoomOptions(page);
    await page.getByRole('textbox', { name: 'Room name', exact: true }).fill('Cached table');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    id = new URL(page.url()).pathname.split('/').at(-1)!;
    const original = await (await requestAs(page, 'me')).json();
    await page.evaluate(() => localStorage.removeItem('games:player:v1'));
    await page.goto('/profile');
    await expect(page.getByRole('textbox', { name: 'Your name', exact: true })).toHaveValue(
      'Cache Member',
    );
    const requests: string[] = [];
    page.on('request', (request) => {
      const path = new URL(request.url()).pathname;
      if (
        path === '/api/dev-session' ||
        path.endsWith('/v1/me') ||
        path.endsWith('/auth/v1/signup')
      )
        requests.push(path);
    });
    await page.getByRole('link', { name: 'Games home', exact: true }).click();
    await expect(page.getByRole('tab', { name: 'Games', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await page.getByRole('tab', { name: 'Rooms', exact: true }).click();
    await expect(
      page.getByRole('link', { name: 'Open Cached table, Uno', exact: true }),
    ).toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('games:player:v1'))).toBeNull();
    expect(requests).toEqual([]);
    const current = await (await requestAs(page, 'me')).json();
    expect(current.profile.id).toBe(original.profile.id);
  } finally {
    if (id) {
      expect((await requestAs(page, `rooms/${id}/leave`, 'POST')).status()).toBe(200);
      expect((await requestAs(page, `rooms/${id}`)).status()).toBe(404);
    }
  }
});
