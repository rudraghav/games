import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { requestAs, roomAs } from './helpers';

type OwnedRoom = { id?: string; actors: Page[]; contexts: BrowserContext[] };
const cleanup = new WeakMap<Page, OwnedRoom>();

// Hook teardown has a fresh budget after a timed-out test body. Keep the known
// test room and its own contexts alive until membership cleanup has completed.
test.afterEach(async ({ page }) => {
  test.setTimeout(45000);
  const owned = cleanup.get(page);
  if (!owned) return;
  try {
    if (!owned.id) return;
    const response = await requestAs(page, `rooms/${owned.id}`);
    if (response.status() === 404) return;
    expect(response.status()).toBe(200);
    const state = await response.json();
    if (state.status === 'playing')
      expect((await requestAs(page, `rooms/${owned.id}/abandon`, 'POST')).ok()).toBe(true);
    for (const actor of [...owned.actors].reverse())
      expect((await requestAs(actor, `rooms/${owned.id}/leave`, 'POST')).ok()).toBe(true);
    expect((await requestAs(page, `rooms/${owned.id}`)).status()).toBe(404);
  } finally {
    await Promise.all(owned.contexts.map((context) => context.close()));
    cleanup.delete(page);
  }
});

test('room controls, turn notices and a natural result stay clear on narrow layouts', async ({
  page,
  browser,
  baseURL,
}) => {
  const friendContext = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  const friend = await friendContext.newPage();
  let id: string | undefined;
  const owned: OwnedRoom = { actors: [page], contexts: [friendContext] };
  cleanup.set(page, owned);
  const hostName = 'Layout Host with a long name';
  const friendName = 'Layout Friend with long name';
  const phone = test.info().project.name === 'phone';
  async function fits() {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  async function wholeRows(selector: string) {
    expect(
      await page.locator(selector).evaluateAll((buttons) =>
        buttons.every((button) => {
          const frame = button.parentElement!.getBoundingClientRect();
          const box = button.getBoundingClientRect();
          return box.height >= 44 && Math.abs(box.width - frame.width) < 2;
        }),
      ),
    ).toBe(true);
  }
  await page.goto('/');
  await page.getByRole('button', { name: 'Create Four in a Row room', exact: true }).click();
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill(hostName);
  await page
    .getByRole('textbox', { name: 'Room name', exact: true })
    .fill('A good night with friends');
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
  id = new URL(page.url()).pathname.split('/').at(-1)!;
  owned.id = id;
  const code = await page.locator('.room-code').innerText();
  await friend.goto('/');
  await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
  await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill(friendName);
  await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
  await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
  await expect(friend).toHaveURL(page.url());
  owned.actors.push(friend);
  await expect(
    friend
      .locator('.seat')
      .filter({ has: friend.getByText(friendName, { exact: true }) })
      .getByText('you', { exact: true }),
  ).toBeVisible();
  await expect(page.locator('.lobby-seats').getByText(friendName, { exact: true })).toBeVisible();
  expect(
    await page
      .locator('.lobby-seats .seat-name')
      .evaluateAll((names) => names.every((name) => name.scrollWidth <= name.clientWidth + 1)),
  ).toBe(true);
  await fits();
  if (phone) {
    await wholeRows('.lobby-start > .button');
    await wholeRows('.invite-actions > .button');
    expect(
      await page.locator('.lobby-game').evaluate((hero) => {
        const art = hero.querySelector('.game-art')!;
        const title = hero.querySelector('h2')!;
        return (
          getComputedStyle(art).position === 'absolute' &&
          hero.getBoundingClientRect().height < 230 &&
          art.getBoundingClientRect().left >= title.getBoundingClientRect().right - 2
        );
      }),
    ).toBe(true);
  }
  await page.screenshot({
    path: test.info().outputPath('lobby.png'),
    fullPage: true,
    mask: [page.locator('.invite-panel')],
  });
  const options = page.getByRole('button', { name: 'Room options', exact: true });
  await options.click();
  const menu = page.getByRole('dialog', { name: 'Your room', exact: true });
  await expect(menu.getByRole('region', { name: 'Host controls' })).toBeVisible();
  await expect(menu.getByRole('button', { name: 'Replace invite link and code' })).toBeVisible();
  await wholeRows('.room-options-group > .button');
  await menu.screenshot({ path: test.info().outputPath('room-options.png') });
  await page.keyboard.press('Escape');
  await expect(menu).not.toBeVisible();
  await expect(options).toBeFocused();
  for (const actor of [page, friend])
    await actor.getByRole('button', { name: 'I’m ready', exact: true }).click();
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  const snapshot = await roomAs(page, id);
  const actors = new Map<string, Page>([
    [snapshot.owner_id, page],
    [snapshot.members.find((member) => member.id !== snapshot.owner_id)!.id, friend],
  ]);
  for (const column of [0, 1, 0, 1, 0, 1, 0]) {
    const own = await roomAs(page, id);
    const actor = actors.get(own.game!.current_player!)!;
    await expect(actor.locator('.turn-notice strong')).toHaveText('Your turn');
    await actor.getByRole('button', { name: `Drop in column ${column + 1}`, exact: true }).click();
    await expect
      .poll(async () => (await roomAs(actor, id!)).match_version)
      .toBeGreaterThan(own.match_version!);
  }
  await expect(page.getByRole('region', { name: 'Match results' })).toBeVisible();
  await expect(page.getByRole('heading', { name: `${hostName} wins!`, exact: true })).toBeVisible();
  await expect(
    page.getByRole('list', { name: 'Player results' }).getByRole('listitem'),
  ).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole('heading', { name: `${hostName} wins!`, exact: true })).toBeVisible();
  await fits();
  if (phone) await wholeRows('.lobby-start > .button');
  await page.screenshot({
    path: test.info().outputPath('results-rematch.png'),
    fullPage: true,
    mask: [page.locator('.invite-panel')],
  });
  for (const actor of [page, friend])
    await actor.getByRole('button', { name: 'I’m ready', exact: true }).click();
  await page.getByRole('button', { name: 'Start rematch', exact: true }).click();
  await expect(page.locator('.turn-notice strong')).not.toHaveText('Round complete');
});

test('phone move rows and actor seats remain usable during pending and paused states', async ({
  page,
}) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Synthetic state gallery is local-only.');
  await page.goto('/design');
  await page.getByLabel('Table scenario').selectOption({ label: 'Uno · maximum seats' });
  const actions = page.getByRole('region', { name: 'Your actions', exact: true });
  await expect(actions).toBeVisible();
  if (test.info().project.name === 'phone')
    expect(
      await actions.locator('.decision-control > .button').evaluateAll((buttons) =>
        buttons.every((button) => {
          const bounds = button.getBoundingClientRect();
          return (
            bounds.height >= 44 && Math.abs(bounds.width - button.parentElement!.clientWidth) < 2
          );
        }),
      ),
    ).toBe(true);
  await page.getByLabel('Saving a move', { exact: true }).check();
  await expect(actions).toHaveAttribute('aria-busy', 'true');
  expect(
    await actions
      .getByRole('button')
      .evaluateAll((buttons) => buttons.every((button) => (button as HTMLButtonElement).disabled)),
  ).toBe(true);
  await page.getByLabel('Saving a move', { exact: true }).uncheck();
  await page.getByLabel('Disconnected', { exact: true }).check();
  await expect(actions.getByText('Game paused', { exact: true })).toBeVisible();
  expect(
    await actions
      .getByRole('button')
      .evaluateAll((buttons) => buttons.every((button) => (button as HTMLButtonElement).disabled)),
  ).toBe(true);
  await page.screenshot({ path: test.info().outputPath('paused-actions.png'), fullPage: true });
});

test('new game lobby artwork stays beside the mobile title', async ({ page }) => {
  test.skip(test.info().project.name !== 'phone', 'Phone poster composition.');
  let id: string | undefined;
  const owned: OwnedRoom = { actors: [page], contexts: [] };
  cleanup.set(page, owned);
  await page.goto('/');
  await page.getByRole('button', { name: 'Create The Gang room', exact: true }).click();
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Artwork Review');
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
  id = new URL(page.url()).pathname.split('/').at(-1)!;
  owned.id = id;
  for (const [game, name, capacity] of [
    ['the-gang', 'The Gang', 3],
    ['sea-salt-paper', 'Sea Salt & Paper', 2],
    ['boop', 'boop.', 2],
    ['six-nimmt', '6 nimmt!', 2],
  ] as const) {
    expect(
      (
        await requestAs(page, `rooms/${id}/settings`, 'PUT', {
          game_id: game,
          capacity,
          settings: {},
        })
      ).ok(),
    ).toBe(true);
    await page.reload();
    await expect(page.locator('.lobby-game h2')).toHaveText(name);
    expect(
      await page.locator('.lobby-game').evaluate((hero) => {
        const art = hero.querySelector('.game-art')!.getBoundingClientRect();
        const title = hero.querySelector('h2')!.getBoundingClientRect();
        return art.left >= title.right - 2 && hero.getBoundingClientRect().height < 230;
      }),
    ).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page
      .locator('.lobby-game')
      .screenshot({ path: test.info().outputPath(`${game}-lobby.png`) });
  }
});

test('late pre-join player response cannot erase the newly joined identity', async ({
  page,
  browser,
  baseURL,
}) => {
  test.skip(
    Boolean(process.env.GAMES_TEST_URL),
    'Deterministic response scheduling is local-only.',
  );
  const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  const friend = await context.newPage();
  const owned: OwnedRoom = { actors: [page], contexts: [context] };
  cleanup.set(page, owned);
  let release!: () => void;
  const lateResponse = new Promise<void>((resolve) => {
    release = resolve;
  });
  let captured!: () => void;
  const capturedNull = new Promise<void>((resolve) => {
    captured = resolve;
  });
  let initial = true;
  let freshProfileRead = false;
  await friend.route('**/api/backend/v1/me', async (route) => {
    if (!initial) {
      const response = await route.fetch();
      freshProfileRead ||= Boolean((await response.json()).profile);
      await route.fulfill({ response });
      return;
    }
    initial = false;
    const response = await route.fetch();
    const body = await response.json();
    expect(body.profile).toBeNull();
    captured();
    await lateResponse;
    await route.fulfill({ response, json: body });
  });
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Uno room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Identity Host');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    owned.id = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    await friend.goto('/');
    await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
    await capturedNull;
    await friend
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill('Late Response Friend');
    await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
    await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect(friend).toHaveURL(page.url());
    owned.actors.push(friend);
    expect(freshProfileRead).toBe(true);
    const ownSeat = friend
      .locator('.lobby-seats .seat')
      .filter({ hasText: 'Late Response Friend' });
    await expect(ownSeat.getByText('you', { exact: true })).toBeVisible();
    release();
    await expect(friend.getByRole('button', { name: 'I’m ready', exact: true })).toBeVisible();
    await friend.getByRole('button', { name: 'I’m ready', exact: true }).click();
    await expect(ownSeat.getByText('Ready to play', { exact: true })).toBeVisible();
    await expect(ownSeat.getByText('you', { exact: true })).toBeVisible();
    expect((await roomAs(friend, owned.id)).members.filter((member) => member.ready)).toHaveLength(
      1,
    );
  } finally {
    // Unblock only the deliberately delayed read; room teardown runs in the hook.
    release();
  }
});

test('committed room entry recovers from a profile read failure without creating again', async ({
  page,
}) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Deterministic error scheduling is local-only.');
  const owned: OwnedRoom = { actors: [page], contexts: [] };
  cleanup.set(page, owned);
  let initial = true;
  let initialLoaded!: () => void;
  const loaded = new Promise<void>((resolve) => {
    initialLoaded = resolve;
  });
  let creates = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/backend/v1/rooms')
      creates++;
  });
  await page.route('**/api/backend/v1/me', async (route) => {
    if (initial) {
      initial = false;
      await route.fulfill({ response: await route.fetch() });
      initialLoaded();
    } else await route.fulfill({ status: 503, json: { detail: 'Temporarily unavailable' } });
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Create Uno room', exact: true }).click();
  await loaded;
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Read Retry Host');
  await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
  owned.id = new URL(page.url()).pathname.split('/').at(-1)!;
  await expect(
    page.getByRole('heading', { name: 'Let’s reconnect your seat.', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Take an open seat', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Create room', exact: true })).toHaveCount(0);
  const retry = page.getByRole('button', { name: 'Try again', exact: true });
  await expect(retry).toBeEnabled();
  await page.unroute('**/api/backend/v1/me');
  await retry.click();
  await expect(
    page
      .locator('.lobby-seats .seat')
      .filter({ hasText: 'Read Retry Host' })
      .getByText('you', { exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'I’m ready', exact: true })).toBeVisible();
  expect(creates).toBe(1);
});
