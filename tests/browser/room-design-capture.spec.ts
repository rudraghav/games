import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { requestAs, roomAs, openRoomOptions } from './helpers';

const captureOnly = process.env.GAMES_DESIGN_CAPTURE === '1';
test.skip(!captureOnly, 'Capture-only design audit, explicitly opt in.');
test.use({ trace: 'off', screenshot: 'off' });

test('capture all current local table projections before design changes', async ({ page }) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'The gallery is local-only.');
  test.setTimeout(180000);
  const dir = 'output/playwright/room-design-audit/local-before';
  await mkdir(dir, { recursive: true });
  await page.goto('/design');
  const choices = await page.getByLabel('Table scenario').locator('option').allTextContents();
  const snapshots = [];
  for (let i = 0; i < choices.length; i++) {
    await page.getByLabel('Table scenario').selectOption(String(i));
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    const shot = `${dir}/${test.info().project.name}-${String(i).padStart(2, '0')}.png`;
    await page.screenshot({ path: shot, fullPage: true });
    const measurement = await page.evaluate(() => ({
      width: innerWidth,
      documentWidth: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));
    snapshots.push({ index: i, label: choices[i], screenshot: shot, ...measurement });
  }
  await writeFile(`${dir}/${test.info().project.name}.json`, JSON.stringify(snapshots, null, 2));
});

test('capture production lobby and representative human game tables', async ({
  page,
  browser,
  baseURL,
}) => {
  test.skip(!process.env.GAMES_TEST_URL, 'Explicit production origin is required.');
  test.skip(
    test.info().project.name !== 'desktop',
    'Reuse the same four guests for both viewport sizes.',
  );
  test.setTimeout(360000);
  const dir = 'output/playwright/room-design-audit/production-before';
  await mkdir(dir, { recursive: true });
  const contexts = [];
  const players: Page[] = [page];
  let id: string | undefined;
  const captures: object[] = [];
  async function call(actor: Page, path: string, method = 'POST', data?: unknown) {
    const r = await requestAs(actor, path, method, data);
    expect(r.status(), `${method} ${path.split('/').at(-1)}`).toBeLessThan(300);
    return r.json();
  }
  async function capture(actor: Page, step: string, locator = '.room-main') {
    for (const [viewport, width, height] of [
      ['desktop', 1440, 1000],
      ['phone', 390, 844],
    ] as const) {
      await actor.setViewportSize({ width, height });
      await actor.evaluate(async () => {
        await document.fonts.ready;
      });
      const target = actor.locator(locator);
      await expect(target).toBeVisible();
      const screenshot = `${dir}/${step}-${viewport}.png`;
      await target.screenshot({ path: screenshot, mask: [actor.locator('.invite-panel')] });
      captures.push({
        step,
        viewport,
        screenshot,
        documentWidth: await actor.evaluate(() => document.documentElement.scrollWidth),
        viewportWidth: width,
      });
    }
  }
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Uno room', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill('Audit Host with a long name');
    await openRoomOptions(page);
    await page
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill('Design audit private room');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('4');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    id = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    await capture(page, '01-lobby-one');
    for (let i = 1; i < 4; i++) {
      const context = await browser.newContext({
        baseURL,
        viewport: { width: 1440, height: 1000 },
      });
      contexts.push(context);
      const friend = await context.newPage();
      players.push(friend);
      await friend.goto('/');
      await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
      await friend
        .getByRole('textbox', { name: 'Your name', exact: true })
        .fill(`Audit Friend ${i} with long name`);
      await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
      await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
      await expect(friend).toHaveURL(page.url());
      await call(friend, `rooms/${id}/heartbeat`);
    }
    await capture(page, '02-lobby-four');
    const identities = await Promise.all(
      players.map(async (actor) => (await call(actor, 'me', 'GET')).profile.id),
    );
    const byId = new Map(identities.map((value, index) => [value, players[index]]));
    for (const [index, game] of [
      'uno',
      'deal',
      'holdem',
      'rummy',
      'skyjo',
      'word-agents',
      'azul',
      'most-likely',
    ].entries()) {
      let snapshot = await roomAs(page, id);
      if (snapshot.status === 'playing') await call(page, `rooms/${id}/abandon`);
      await call(page, `rooms/${id}/settings`, 'PUT', { game_id: game, capacity: 4, settings: {} });
      for (const actor of players) {
        await call(actor, `rooms/${id}/heartbeat`);
        await call(actor, `rooms/${id}/ready`, 'PUT', { ready: true });
      }
      snapshot = await call(page, `rooms/${id}/start`);
      const actor = byId.get(snapshot.game!.current_player) || page;
      await actor.reload();
      await expect(actor.locator('.table-announcement')).toBeVisible();
      await capture(actor, `${String(index + 3).padStart(2, '0')}-${game}`);
      if (game === 'uno' || game === 'holdem') {
        const own = await roomAs(actor, id);
        const decision = own.game!.actions.find((a) =>
          game === 'uno' ? a.action.type === 'draw' : ['call', 'check'].includes(a.action.type),
        );
        if (decision) {
          await actor.setViewportSize({ width: 390, height: 844 });
          await actor.getByRole('button', { name: decision.label, exact: true }).click();
          await expect
            .poll(async () => (await roomAs(actor, id!)).match_version)
            .toBeGreaterThan(own.match_version!);
          await capture(actor, `${String(index + 3).padStart(2, '0')}-${game}-after-move`);
        }
      }
    }
  } finally {
    if (id) {
      const snapshot = await roomAs(page, id);
      if (snapshot.status === 'playing') await call(page, `rooms/${id}/abandon`);
      for (const actor of [...players].reverse()) await call(actor, `rooms/${id}/leave`);
      expect((await requestAs(page, `rooms/${id}`)).status()).toBe(404);
    }
    await Promise.all(contexts.map((context) => context.close()));
    await writeFile(
      `${dir}/captures.json`,
      JSON.stringify(
        {
          origin: baseURL,
          source: process.env.GAMES_RELEASE_SHA,
          guestCount: players.length,
          ownRoomClosed: true,
          captures,
        },
        null,
        2,
      ),
    );
  }
});

test('capture a natural local result and rematch arrangement', async ({
  page,
  browser,
  baseURL,
}) => {
  test.skip(
    Boolean(process.env.GAMES_TEST_URL) || test.info().project.name !== 'desktop',
    'One local group, both viewport sizes.',
  );
  const context = await browser.newContext({ baseURL });
  const friend = await context.newPage();
  let id: string | undefined;
  const dir = 'output/playwright/room-design-audit/local-before';
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Four in a Row room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Layout Host');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    id = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    await friend.goto('/');
    await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
    await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Layout Friend');
    await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
    await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect(friend).toHaveURL(page.url());
    for (const actor of [page, friend])
      expect((await requestAs(actor, `rooms/${id}/ready`, 'PUT', { ready: true })).ok()).toBe(true);
    expect((await requestAs(page, `rooms/${id}/start`, 'POST')).ok()).toBe(true);
    for (const column of [0, 1, 0, 1, 0, 1, 0]) {
      const room = await roomAs(page, id);
      const actor = room.game!.current_player === room.owner_id ? page : friend;
      const own = await roomAs(actor, id);
      const action = own.game!.actions.find(
        (option) => option.action.choice === String(column),
      )!.action;
      expect(
        (
          await requestAs(actor, `rooms/${id}/actions`, 'POST', {
            match_id: own.match_id,
            expected_version: own.match_version,
            action_id: crypto.randomUUID(),
            action,
          })
        ).ok(),
      ).toBe(true);
    }
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Layout Host wins!', exact: true }),
    ).toBeVisible();
    for (const [viewport, width, height] of [
      ['desktop', 1440, 1000],
      ['phone', 390, 844],
    ] as const) {
      await page.setViewportSize({ width, height });
      await page.locator('.room-main').screenshot({
        path: `${dir}/result-${viewport}.png`,
        mask: [page.locator('.invite-panel')],
      });
    }
  } finally {
    if (id) {
      const room = await roomAs(page, id);
      if (room.status === 'playing')
        expect((await requestAs(page, `rooms/${id}/abandon`, 'POST')).ok()).toBe(true);
      for (const actor of [friend, page])
        expect((await requestAs(actor, `rooms/${id}/leave`, 'POST')).ok()).toBe(true);
    }
    await context.close();
  }
});
