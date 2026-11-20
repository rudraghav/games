import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import catalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };
import {
  drawTarotCard,
  attachPreviewAccess,
  openRoomOptions,
  requestAs,
  roomAs,
  type RoomView,
} from './helpers';

// Entry, persistence and authorization use real local services. No reading is generated.
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });
type OwnedRoom = { id: string; actors: Page[] };
type Run = { rooms: OwnedRoom[]; contexts: BrowserContext[]; readingRequests: number };
const runs = new WeakMap<Page, Run>();

async function watch(page: Page, run: Run) {
  await attachPreviewAccess(page);
  await page.route('**/api/backend/v1/rooms/*/reading', async (route) => {
    if (route.request().method() === 'POST') {
      run.readingRequests++;
      await route.abort();
    } else await route.continue();
  });
}

function own(run: Run, room: RoomView, actor: Page) {
  if (!run.rooms.some((owned) => owned.id === room.id))
    run.rooms.push({ id: room.id, actors: [actor] });
}

async function start(page: Page, run: Run, gameId: string) {
  await page.goto(`/games/${gameId}`);
  const created = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().endsWith(`/games/${gameId}/play`),
  );
  await page
    .getByRole('button', {
      name: gameId === 'tarot' ? 'Start reading' : 'Play with bots',
      exact: true,
    })
    .click();
  const response = await created;
  expect(response.ok()).toBe(true);
  const room = (await response.json()) as RoomView;
  own(run, room, page);
  await expect(page).toHaveURL(
    new RegExp(`/games/${gameId}/${gameId === 'tarot' ? 'play' : 'rooms'}/${room.id}$`),
  );
  return room;
}

async function fits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test.beforeEach(async ({ page }) => {
  const run: Run = { rooms: [], contexts: [], readingRequests: 0 };
  runs.set(page, run);
  await watch(page, run);
});

test.afterEach(async ({ page }, info) => {
  test.setTimeout(45000);
  const run = runs.get(page)!;
  const receipt: { room: string; closed: boolean }[] = [];
  try {
    for (const owned of [...run.rooms].reverse()) {
      const owner = owned.actors[0]!;
      const response = await requestAs(owner, `rooms/${owned.id}`);
      if (response.status() !== 404) {
        expect(response.ok()).toBe(true);
        if ((await response.json()).status === 'playing')
          expect((await requestAs(owner, `rooms/${owned.id}/abandon`, 'POST')).ok()).toBe(true);
        for (const actor of [...owned.actors].reverse())
          expect((await requestAs(actor, `rooms/${owned.id}/leave`, 'POST')).ok()).toBe(true);
      }
      expect((await requestAs(owner, `rooms/${owned.id}`)).status()).toBe(404);
      receipt.push({ room: owned.id, closed: true });
    }
    expect(run.readingRequests).toBe(0);
  } finally {
    await writeFile(
      info.outputPath('cleanup.json'),
      JSON.stringify({ rooms: receipt, readingRequests: run.readingRequests }),
      { mode: 0o600 },
    );
    await Promise.all(run.contexts.map((context) => context.close()));
    runs.delete(page);
  }
});

test('all game pages are public, readable and browse without creating a guest or game', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  const writes: string[] = [];
  const sessions: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (
      request.method() !== 'GET' &&
      request.method() !== 'HEAD' &&
      (path.startsWith('/api/') || path.includes('/auth/'))
    )
      writes.push(path);
    if (path === '/api/dev-session' || path.endsWith('/auth/v1/signup')) sessions.push(path);
  });
  await page.goto('/');
  const tarot = page.getByRole('link', { name: 'Open Pop Tarot', exact: true });
  await expect(tarot).toHaveAttribute('href', '/games/tarot');
  await tarot.click();
  await expect(page).toHaveURL(/\/games\/tarot$/);
  // Old display preferences must not silently create a fresh identity either.
  await page.evaluate(() =>
    localStorage.setItem(
      'games:player:v1',
      JSON.stringify({ name: 'Remembered guest', avatar: 0 }),
    ),
  );
  for (const game of catalogue) {
    await page.goto(`/games/${game.id}`);
    await expect(
      page.getByRole('heading', { name: game.name, exact: true, level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.locator('.game-entry-actions .button--primary')).toHaveText(
      game.id === 'tarot' ? 'Start reading' : 'Play with friends',
    );
    const action = page.getByRole('button', {
      name: game.id === 'tarot' ? 'Start reading' : 'Play with bots',
      exact: true,
    });
    if (game.id === 'tarot' || game.bots_supported) {
      await expect(action).toBeVisible();
      const box = await action.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
      expect(box!.y + box!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
    }
    if (game.id === 'tarot') {
      await expect(
        page.getByRole('button', { name: 'Play with friends', exact: true }),
      ).toHaveCount(0);
    } else
      await expect(
        page.getByRole('button', { name: 'Play with friends', exact: true }),
      ).toBeVisible();
    await fits(page);
  }
  if (info.project.name === 'phone') {
    await page.setViewportSize({ width: 320, height: 640 });
    for (const game of ['tarot', 'uno', 'four-in-a-row', 'spill-or-chill']) {
      await page.goto(`/games/${game}`);
      await page.evaluate(() => scrollTo(0, 0));
      await fits(page);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await page.screenshot({ path: info.outputPath(`${game}-320.png`) });
    }
  }
  const missing = await page.goto('/games/not-a-real-game');
  expect(missing!.status()).toBe(404);
  expect(writes).toEqual([]);
  expect(sessions).toEqual([]);
  expect(
    (await page.context().cookies()).filter((cookie) => /^sb-.+-auth-token/.test(cookie.name)),
  ).toEqual([]);
});

test('Tarot starts once, keeps cards private, survives refresh and protects named and legacy links', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Creates isolated local acceptance games.');
  const run = runs.get(page)!;
  await page.goto('/games/tarot');
  const posts: unknown[] = [];
  await page.route('**/api/backend/v1/games/tarot/play', async (route) => {
    posts.push(route.request().postDataJSON());
    const response = await route.fetch();
    if (response.ok()) own(run, (await response.json()) as RoomView, page);
    await route.fulfill({ response });
  });
  // Two click events in one tick cover rapid tapping while React is updating.
  await page.getByRole('button', { name: 'Start reading', exact: true }).evaluate((button) => {
    (button as HTMLButtonElement).click();
    (button as HTMLButtonElement).click();
  });
  await expect(page).toHaveURL(/\/games\/tarot\/play\/[\da-f-]+$/);
  expect(posts).toHaveLength(1);
  const id = new URL(page.url()).pathname.split('/').at(-1)!;
  const room = await roomAs(page, id);
  expect(room.status).toBe('playing');
  expect(room.capacity).toBe(1);
  expect(room.members).toHaveLength(1);
  expect(room.members[0]!.is_bot).toBe(false);
  expect(room.game!.community).toEqual([]);
  expect(room.game!.detail.deck).toBeUndefined();
  expect(room.game!.detail.order).toBeUndefined();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('heading', { name: /^Choose card 1 of 3/ })).toBeVisible();
  await drawTarotCard(page);
  await expect(page.getByRole('heading', { name: /^Choose card 2 of 3/ })).toBeVisible();
  const picked = await roomAs(page, id);
  expect(picked.match_version).toBe(room.match_version! + 1);
  await page.reload();
  await expect(page.getByRole('heading', { name: /^Choose card 2 of 3/ })).toBeVisible();
  expect((await roomAs(page, id)).game!.community).toEqual(picked.game!.community);
  for (const path of [`/rooms/${id}`, `/games/checkers/rooms/${id}`]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`/games/tarot/play/${id}$`));
    await expect(page.getByRole('heading', { name: /^Choose card 2 of 3/ })).toBeVisible();
  }
  await fits(page);
  await page.screenshot({ path: info.outputPath('tarot-first-pick.png') });
  const outsiderContext = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  run.contexts.push(outsiderContext);
  const outsider = await outsiderContext.newPage();
  await watch(outsider, run);
  await outsider.goto(`/games/checkers/rooms/${id}`);
  await expect(outsider.getByRole('button', { name: 'Try again', exact: true })).toBeVisible();
  expect((await requestAs(outsider, `rooms/${id}`)).status()).toBe(404);
  await expect(outsider.locator('.tarot-table')).toHaveCount(0);
  await expect(outsider).toHaveURL(new RegExp(`/games/checkers/rooms/${id}$`));
});

test('returning players keep their profile and can play a bot immediately', async ({
  page,
}, info) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Creates isolated local acceptance games.');
  const run = runs.get(page)!;
  await page.goto('/profile');
  const name = page.getByRole('textbox', { name: 'Your name', exact: true });
  await expect(name).toBeVisible();
  await name.fill('Returning Entry Player');
  await page.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Your profile is saved');
  const before = await (await requestAs(page, 'me')).json();
  const room = await start(page, run, 'four-in-a-row');
  expect(room.status).toBe('playing');
  expect(room.members.filter((member) => member.is_bot)).toHaveLength(1);
  expect(room.members.find((member) => !member.is_bot)?.name).toBe('Returning Entry Player');
  const drop = page.getByRole('button', { name: 'Drop in column 4', exact: true });
  await expect(drop).toBeEnabled();
  await drop.click();
  await expect
    .poll(async () => (await roomAs(page, room.id)).match_version)
    .toBeGreaterThan(room.match_version!);
  await page.reload();
  await expect(page.getByRole('button', { name: 'Drop in column 4', exact: true })).toBeVisible();
  expect((await (await requestAs(page, 'me')).json()).profile.id).toBe(before.profile.id);
  await fits(page);
  await page.screenshot({ path: info.outputPath('bot-game.png') });
});

test('a lost start response retries the same saved game after a reload', async ({ page }) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Injects one lost local response.');
  const run = runs.get(page)!;
  const requests: string[] = [];
  const rooms: RoomView[] = [];
  await page.route('**/api/backend/v1/games/tarot/play', async (route) => {
    requests.push((route.request().postDataJSON() as { request_id: string }).request_id);
    const response = await route.fetch();
    expect(response.ok()).toBe(true);
    const room = (await response.json()) as RoomView;
    own(run, room, page);
    rooms.push(room);
    if (requests.length === 1) await route.abort('failed');
    else await route.fulfill({ response });
  });
  await page.goto('/games/tarot');
  await page.getByRole('button', { name: 'Start reading', exact: true }).click();
  await expect(page.getByText('Couldn’t start your reading.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Try again', exact: true })).toBeEnabled();
  expect(requests).toHaveLength(1);
  await page.reload();
  // Refresh preserves the request key without automatically submitting another start.
  await expect(page.getByRole('heading', { name: 'Pop Tarot', exact: true })).toBeVisible();
  expect(requests).toHaveLength(1);
  await page.getByRole('button', { name: /^(Start reading|Try again)$/ }).click();
  await expect(page).toHaveURL(new RegExp(`/games/tarot/play/${rooms[0]!.id}$`));
  expect(requests).toHaveLength(2);
  expect(new Set(requests).size).toBe(1);
  expect(rooms[1]!.id).toBe(rooms[0]!.id);
  expect(rooms[1]!.match_id).toBe(rooms[0]!.match_id);
  const me = await (await requestAs(page, 'me')).json();
  expect(me.rooms).toHaveLength(1);
});

test('friends create from the chosen game, join an invitation and follow changed game routes', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Creates isolated local acceptance games.');
  const run = runs.get(page)!;
  await page.goto('/games/four-in-a-row');
  await page.getByRole('button', { name: 'Play with friends', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Play Four in a Row with friends', exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('combobox', { name: 'The game', exact: true })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: 'Bots', exact: true })).toHaveCount(0);
  await dialog.getByRole('textbox', { name: 'Your name', exact: true }).fill('Entry Host');
  await openRoomOptions(dialog);
  await dialog.getByRole('textbox', { name: 'Room name', exact: true }).fill('Entry friends');
  const created = page.waitForResponse(
    (response) => response.request().method() === 'POST' && response.url().endsWith('/v1/rooms'),
  );
  await dialog.getByRole('button', { name: 'Create room', exact: true }).click();
  const response = await created;
  expect(response.ok()).toBe(true);
  const room = (await response.json()) as RoomView;
  own(run, room, page);
  await expect(page).toHaveURL(new RegExp(`/games/four-in-a-row/rooms/${room.id}$`));
  const friendContext = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  run.contexts.push(friendContext);
  const friend = await friendContext.newPage();
  await watch(friend, run);
  await friend.goto(`/join/${room.invite_token}`);
  await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Entry Friend');
  await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
  await expect(friend).toHaveURL(new RegExp(`/games/four-in-a-row/rooms/${room.id}$`));
  run.rooms.find((owned) => owned.id === room.id)!.actors.push(friend);
  expect((await roomAs(friend, room.id)).members).toHaveLength(2);
  await page.getByRole('button', { name: 'I’m ready', exact: true }).click();
  await friend.getByRole('button', { name: 'I’m ready', exact: true }).click();
  await page.getByRole('button', { name: 'Start game', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Drop in column 4', exact: true })).toBeVisible();
  await expect(friend.getByRole('button', { name: 'Drop in column 4', exact: true })).toBeVisible();
  for (const player of [page, friend]) {
    await player.getByRole('button', { name: 'Game rules', exact: true }).click();
    const rules = player.getByRole('dialog');
    await expect(rules.getByRole('img')).toHaveCount(3);
    await expect(rules.getByRole('heading', { name: 'Rules reference' })).toBeVisible();
    await expect(rules.getByRole('switch', { name: 'Step-by-step tutorial' })).toHaveCount(0);
    await rules.getByRole('button', { name: 'Close dialog' }).click();
  }
  await fits(page);
  await page.screenshot({ path: info.outputPath('friends-game.png') });
  expect((await requestAs(page, `rooms/${room.id}/abandon`, 'POST')).ok()).toBe(true);
  expect(
    (
      await requestAs(page, `rooms/${room.id}/settings`, 'PUT', {
        game_id: 'checkers',
        capacity: 2,
        settings: {},
      })
    ).ok(),
  ).toBe(true);
  await friend.goto(`/games/four-in-a-row/rooms/${room.id}`);
  await expect(friend).toHaveURL(new RegExp(`/games/checkers/rooms/${room.id}$`));
  await expect(friend.locator('.lobby')).toBeVisible();
});

test('a late empty profile cannot replace the identity created by quick play', async ({ page }) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Controls an isolated local profile response.');
  const run = runs.get(page)!;
  await page.goto('/profile');
  await expect(page.getByRole('textbox', { name: 'Your name', exact: true })).toBeVisible();
  expect((await (await requestAs(page, 'me')).json()).profile).toBeNull();
  await page.evaluate(() =>
    localStorage.setItem(
      'games:player:v1',
      JSON.stringify({ name: 'Stale preference', avatar: 0 }),
    ),
  );
  let release!: () => void;
  const delayed = new Promise<void>((resolve) => {
    release = resolve;
  });
  let captured!: () => void;
  const initialRead = new Promise<void>((resolve) => {
    captured = resolve;
  });
  let first = true;
  let freshProfile = false;
  await page.route('**/api/backend/v1/me', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    if (first) {
      first = false;
      expect(body.profile).toBeNull();
      captured();
      await delayed;
      await route.fulfill({ response, json: body }).catch(() => undefined);
    } else {
      freshProfile ||= Boolean(body.profile);
      await route.fulfill({ response, json: body });
    }
  });
  try {
    await page.goto('/games/tarot');
    await initialRead;
    const created = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' && response.url().endsWith('/games/tarot/play'),
    );
    await page.getByRole('button', { name: 'Start reading', exact: true }).click();
    const response = await created;
    expect(response.ok()).toBe(true);
    const room = (await response.json()) as RoomView;
    own(run, room, page);
    await expect(page).toHaveURL(new RegExp(`/games/tarot/play/${room.id}$`));
    release();
    await expect(page.getByRole('heading', { name: /^Choose card 1 of 3/ })).toBeVisible();
    expect(freshProfile).toBe(true);
    await expect(
      page.getByRole('heading', { name: 'Player details unavailable', exact: true }),
    ).toHaveCount(0);
    expect((await roomAs(page, room.id)).members[0]!.name).toBe('Guest');
  } finally {
    release();
  }
});

test('a committed start remains recoverable when its fresh profile read fails', async ({
  page,
}) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Controls isolated local profile failures.');
  const run = runs.get(page)!;
  let blockProfile = false;
  let submissions = 0;
  await page.route('**/api/backend/v1/me', async (route) => {
    if (blockProfile)
      await route.fulfill({ status: 503, json: { detail: 'Temporarily unavailable' } });
    else await route.continue();
  });
  await page.route('**/api/backend/v1/games/tarot/play', async (route) => {
    submissions++;
    const response = await route.fetch();
    expect(response.ok()).toBe(true);
    own(run, (await response.json()) as RoomView, page);
    blockProfile = true;
    await route.fulfill({ response });
  });
  await page.goto('/games/tarot');
  await page.getByRole('button', { name: 'Start reading', exact: true }).click();
  await expect(page).toHaveURL(/\/games\/tarot\/play\/[\da-f-]+$/);
  await expect(
    page.getByRole('heading', { name: 'Reconnect to your game', exact: true }),
  ).toBeVisible();
  expect(submissions).toBe(1);
  blockProfile = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('heading', { name: /^Choose card 1 of 3/ })).toBeVisible();
  expect(submissions).toBe(1);
});
