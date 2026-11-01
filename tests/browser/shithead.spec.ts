import { expect, test } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { requestAs, roomAs, type RoomView } from './helpers';

test('Shithead tables keep setup, public and blind cards distinct at both seat limits', async ({
  page,
}) => {
  await page.goto('/design');
  for (const limit of ['minimum', 'maximum']) {
    await page.getByLabel('Table scenario').selectOption({ label: `Shithead · ${limit} seats` });
    await expect(page.locator('.shithead-game')).toBeVisible();
    await expect(page.locator('.shithead-workspace .playing-card')).toHaveCount(6);
    await expect(page.locator('.shithead-player-table')).toHaveCount(limit === 'minimum' ? 2 : 5);
    await expect(page.locator('.shithead-player-table .playing-card--back')).toHaveCount(
      (limit === 'minimum' ? 2 : 5) * 3,
    );
    await expect(page.getByRole('button', { name: /Keep selected three face-up/ })).toBeDisabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(
      await page.locator('.shithead-game').evaluate((element) =>
        Array.from(element.children).every((panel) => {
          const rect = panel.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= innerWidth;
        }),
      ),
    ).toBe(true);
    const controls = page.locator('.shithead-game button:enabled');
    expect(
      await controls.evaluateAll((elements) =>
        elements.every((element) => {
          const r = element.getBoundingClientRect();
          return r.width >= 43.5 && r.height >= 43.5;
        }),
      ),
    ).toBe(true);
    expect(
      await page.locator('.shithead-workspace .card-hand').evaluate((element) => {
        const cards = Array.from(element.children).map((card) => card.getBoundingClientRect());
        return cards.every((card, index) => index === 0 || card.left >= cards[index - 1].right + 5);
      }),
    ).toBe(true);
    if (limit === 'maximum')
      await page.screenshot({
        path: test.info().outputPath('shithead-maximum.png'),
        scale: 'css',
        fullPage: true,
      });
    const confirm = page.getByRole('button', { name: /Keep selected three face-up/ });
    await page.getByLabel('Saving a move').check();
    await expect(confirm).toBeDisabled();
    await page.getByLabel('Saving a move').uncheck();
    await page.getByLabel('Disconnected').check();
    await expect(confirm).toBeDisabled();
    await page.getByLabel('Disconnected').uncheck();
  }
});

test('friends choose real table cards, play a hand card and restore the saved table', async ({
  page,
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  const friend = await context.newPage();
  const players = [page, friend];
  let id: string | undefined;
  async function checked(
    actor: typeof page,
    path: string,
    method = 'POST',
    data?: unknown,
  ): Promise<RoomView> {
    const response = await requestAs(actor, path, method, data);
    expect(response.status()).toBeLessThan(300);
    return response.json();
  }
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Shithead room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Palace Host');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    id = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    await friend.goto('/');
    await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
    await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Palace Friend');
    await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
    await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect(friend).toHaveURL(page.url());
    for (const actor of players)
      await actor.getByRole('button', { name: 'I’m ready', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Start game', exact: true }).click();
    await expect.poll(async () => (await roomAs(page, id!)).status).toBe('playing');
    const identities = await Promise.all(
      players.map(async (actor) =>
        (await requestAs(actor, 'me')).json().then((data) => data.profile.id as string),
      ),
    );
    for (const actor of players) {
      let snapshot = await roomAs(actor, id);
      await actor.reload();
      await expect(
        actor.getByRole('button', { name: /Keep selected three face-up/ }),
      ).toBeVisible();
      for (const [index, card] of snapshot.game!.hand.slice(0, 3).entries()) {
        const button = actor.getByRole('button', { name: card.label, exact: true });
        if (index === 2) {
          await button.focus();
          await actor.keyboard.press('Space');
        } else await button.click();
      }
      await actor.getByRole('button', { name: /Keep selected three face-up/ }).click();
      await expect
        .poll(async () => (await roomAs(actor, id!)).match_version)
        .toBe(snapshot.match_version! + 1);
    }
    const start = await roomAs(page, id);
    const actor = players[identities.indexOf(start.game!.current_player!)];
    await actor.reload();
    const snapshot = await roomAs(actor, id);
    const option = snapshot.game!.actions.find((o) => o.action.type === 'play')!;
    expect(option).toBeTruthy();
    for (const cardId of option.action.cards!) {
      const card = snapshot.game!.hand.find((card) => card.id === cardId)!;
      await actor.getByRole('button', { name: card.label, exact: true }).click();
    }
    await actor.getByRole('button', { name: /^Play selected/ }).click();
    await expect
      .poll(async () => (await roomAs(actor, id!)).match_version)
      .toBe(snapshot.match_version! + 1);
    const saved = await roomAs(actor, id);
    await actor.reload();
    await expect(actor.locator('.shithead-pile')).toBeVisible();
    expect((await roomAs(actor, id)).game!.detail.pile_count).toBe(saved.game!.detail.pile_count);
    // Blind positions have only occupied-slot booleans, never wire card IDs.
    expect(
      Object.values(saved.game!.detail.hidden_slots as Record<string, unknown[]>)
        .flat()
        .every((v) => typeof v === 'boolean'),
    ).toBe(true);
    expect(await actor.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    // Explicit stale retry stays authoritative and never repeats a committed move.
    const stale = await requestAs(actor, `rooms/${id}/actions`, 'POST', {
      match_id: snapshot.match_id,
      expected_version: snapshot.match_version,
      action_id: randomUUID(),
      action: option.action,
    });
    expect(stale.status()).toBe(409);
  } finally {
    if (id) {
      const read = await requestAs(page, `rooms/${id}`);
      if (read.ok() && (await read.json()).status === 'playing')
        await checked(page, `rooms/${id}/abandon`);
      for (const actor of [friend, page]) await checked(actor, `rooms/${id}/leave`);
      expect((await requestAs(page, `rooms/${id}`)).status()).toBe(404);
    }
    await context.close();
  }
});
