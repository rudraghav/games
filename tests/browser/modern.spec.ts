import { expect, test } from '@playwright/test';
import { requestAs, roomAs, type RoomView, openRoomOptions } from './helpers';

test('modern covers and every modern table fit with readable touch controls', async ({ page }) => {
  await page.goto('/');
  for (const name of ['Flip 7', 'Trio', 'Azul']) {
    const tile = page.getByRole('button', { name: `Create ${name} room`, exact: true });
    await expect(tile).toBeVisible();
    await expect(tile.locator('.game-art--modern-numbers, .game-art--azul')).toHaveCount(1);
  }
  await page.goto('/design');
  for (const name of ['Flip 7', 'Trio', 'Azul']) {
    for (const limit of ['minimum', 'maximum']) {
      await page.getByLabel('Table scenario').selectOption({ label: `${name} · ${limit} seats` });
      await expect(page.locator('.modern-game')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const controls = page.locator('.modern-game button:enabled:visible');
      expect(await controls.count()).toBeGreaterThan(0);
      expect(
        await controls.evaluateAll((buttons) =>
          buttons.every((button) => {
            const box = button.getBoundingClientRect();
            return box.width >= 43.5 && box.height >= 43.5;
          }),
        ),
      ).toBe(true);
      if (limit === 'maximum')
        await page.locator('.modern-game').screenshot({
          path: test.info().outputPath(`${name.toLowerCase().replace(' ', '-')}-maximum.png`),
        });
    }
  }
});

test('friends click modern game decisions and refresh the saved table', async ({
  page,
  browser,
  baseURL,
}) => {
  const contexts = [];
  const players = [page];
  let roomId: string | undefined;
  async function checked(actor: typeof page, path: string, method = 'POST', data?: unknown) {
    const response = await requestAs(actor, path, method, data);
    expect(response.status()).toBeLessThan(300);
    return response.json();
  }
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Flip 7 room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Modern Host');
    await openRoomOptions(page);
    await page
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill('Modern controls verification');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('3');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    roomId = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    for (let seat = 1; seat < 3; seat++) {
      const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
      contexts.push(context);
      const friend = await context.newPage();
      players.push(friend);
      await friend.goto('/');
      await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
      await friend
        .getByRole('textbox', { name: 'Your name', exact: true })
        .fill(`Modern Friend ${seat}`);
      await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
      await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
      await expect(friend).toHaveURL(page.url());
    }
    const identities: string[] = await Promise.all(
      players.map(async (actor) => (await checked(actor, 'me', 'GET')).profile.id),
    );
    const pages = new Map(identities.map((id, index) => [id, players[index]]));
    for (const game of ['flip-7', 'trio', 'azul']) {
      await checked(page, `rooms/${roomId}/settings`, 'PUT', {
        game_id: game,
        capacity: 3,
        settings: {},
      });
      for (const actor of players)
        await checked(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true });
      let snapshot: RoomView = await checked(page, `rooms/${roomId}/start`);
      await Promise.all(players.map((actor) => actor.reload()));
      const decisions = game === 'trio' ? 3 : 2;
      let lastActor = page;
      for (let move = 0; move < decisions; move++) {
        if (snapshot.status === 'finished') break;
        const actor = pages.get(snapshot.game!.current_player!)!;
        lastActor = actor;
        await expect(actor.locator('.modern-game')).toBeVisible();
        const version = snapshot.match_version!;
        if (game === 'azul') {
          await actor
            .locator(
              snapshot.game!.phase === 'drafting'
                ? '.azul-draft-button:enabled'
                : '.azul-pattern-line:enabled',
            )
            .first()
            .click();
        } else if (game === 'trio') {
          if (snapshot.game!.phase === 'review')
            await actor.getByRole('button', { name: 'Continue', exact: true }).click();
          else await actor.locator('.trio-table-cards button:enabled').first().click();
        } else {
          await actor.locator('.action-panel button:enabled').first().click();
        }
        await expect
          .poll(async () => (await roomAs(page, roomId!)).match_version)
          .toBe(version + 1);
        snapshot = await roomAs(page, roomId);
      }
      const version = snapshot.match_version;
      await lastActor.reload();
      await expect(lastActor.locator('.modern-game')).toBeVisible();
      expect((await roomAs(lastActor, roomId)).match_version).toBe(version);
      expect(
        await lastActor.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBe(true);
      await lastActor
        .locator('.modern-game')
        .screenshot({ path: test.info().outputPath(`${game}-real-decisions.png`) });
      if (snapshot.status === 'playing') await checked(page, `rooms/${roomId}/abandon`);
    }
  } finally {
    try {
      if (roomId) {
        const snapshot = await roomAs(page, roomId);
        if (snapshot.status === 'playing') await checked(page, `rooms/${roomId}/abandon`);
        for (const actor of players.slice(1)) await checked(actor, `rooms/${roomId}/leave`);
        const closed: RoomView = await checked(page, `rooms/${roomId}/leave`);
        expect(closed.status).toBe('closed');
      }
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
    }
  }
});
