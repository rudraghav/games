import { expect, test, type Page } from '@playwright/test';
import { requestAs, roomAs, type RoomView } from './helpers';

test('cooperative and number-row tables fit both seat limits with readable controls', async ({
  page,
}) => {
  await page.goto('/design');
  for (const name of ['The Gang', '6 nimmt!']) {
    for (const limit of ['minimum', 'maximum']) {
      await page.getByLabel('Table scenario').selectOption({ label: `${name} · ${limit} seats` });
      await expect(page.locator('.coop-number-game')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        await page.locator('.coop-number-game button:enabled').evaluateAll((buttons) =>
          buttons.every((button) => {
            const box = button.getBoundingClientRect();
            return box.width >= 43.5 && box.height >= 43.5;
          }),
        ),
      ).toBe(true);
      if ((page.viewportSize()?.width || 0) <= 600) {
        const cta = page.locator(
          name === 'The Gang'
            ? '.coop-number-actions > .button:first-child'
            : '.six-hand-panel > .button',
        );
        expect(
          await cta.evaluate(
            (button) =>
              Math.abs(button.getBoundingClientRect().width - button.parentElement!.clientWidth) <=
              1,
          ),
        ).toBe(true);
      }
      if (limit === 'maximum')
        await page.locator('.coop-number-game').screenshot({
          path: test.info().outputPath(`${name === 'The Gang' ? 'gang' : 'six-nimmt'}-maximum.png`),
        });
    }
  }
});

test('friends move ranking chips, reveal hands and lock private number selections', async ({
  page,
  browser,
  baseURL,
}) => {
  const contexts = [];
  const players: Page[] = [page];
  let roomId: string | undefined;
  async function checked(actor: Page, path: string, method = 'POST', body?: unknown) {
    const response = await requestAs(actor, path, method, body);
    expect(response.status()).toBeLessThan(300);
    return response.json();
  }
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create The Gang room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Crew Host');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('3');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    roomId = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    for (let i = 1; i < 3; i++) {
      const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
      contexts.push(context);
      const friend = await context.newPage();
      players.push(friend);
      await friend.goto('/');
      await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
      await friend
        .getByRole('textbox', { name: 'Your name', exact: true })
        .fill(`Crew Friend ${i}`);
      await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
      await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
      await expect(friend).toHaveURL(page.url());
    }
    const ids: string[] = await Promise.all(
      players.map(async (actor) => (await checked(actor, 'me', 'GET')).profile.id),
    );
    const byId = new Map(ids.map((id, i) => [id, players[i]]));
    for (const actor of players)
      await checked(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true });
    await checked(page, `rooms/${roomId}/start`);
    await Promise.all(players.map((actor) => actor.reload()));

    async function chip(actor: Page, rank: number, count: number, holder?: string) {
      await actor.reload();
      await expect(actor.getByText(`${count}/3 chips taken`, { exact: true })).toBeVisible();
      await actor
        .getByRole('button', {
          name: `${rank}-star chip${holder ? ` held by ${holder}` : ' in the center'}`,
          exact: true,
        })
        .click();
      await actor.getByRole('button', { name: `Take ${rank}-star chip`, exact: true }).click();
      await expect
        .poll(
          async () =>
            ((await roomAs(actor, roomId!)).game!.detail.chips as Record<string, number | null>)[
              ids[players.indexOf(actor)]
            ],
        )
        .toBe(rank);
    }
    await chip(page, 1, 0);
    await chip(players[1], 1, 1, 'Crew Host');
    expect(
      ((await roomAs(page, roomId)).game!.detail.chips as Record<string, number | null>)[ids[0]],
    ).toBeNull();
    await expect(
      players[1].getByRole('button', { name: 'Return my chip', exact: true }),
    ).toBeVisible();
    await players[1].getByRole('button', { name: 'Return my chip', exact: true }).click();
    await expect
      .poll(
        async () =>
          Object.values(
            (await roomAs(page, roomId!)).game!.detail.chips as Record<string, number | null>,
          ).filter((chip) => chip !== null).length,
      )
      .toBe(0);
    await chip(players[1], 1, 0);
    await chip(players[2], 2, 1);
    await expect(page.getByText('2/3 chips taken', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: '3-star chip in the center', exact: true }).click();
    await expect(
      page.getByText(
        'Taking this last free chip closes the round and reveals more community cards.',
        { exact: true },
      ),
    ).toBeVisible();
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(0);
    await page.getByRole('button', { name: 'Take 3-star chip', exact: true }).click();
    await expect.poll(async () => (await roomAs(page, roomId!)).game!.community.length).toBe(3);

    let snapshot: RoomView = await roomAs(page, roomId);
    while (snapshot.game!.phase === 'chips') {
      const actor = byId.get(snapshot.game!.current_player!)!;
      snapshot = await roomAs(actor, roomId);
      const chips = Object.values(snapshot.game!.detail.chips as Record<string, number | null>);
      const move = snapshot.game!.actions.find(
        (o) => o.action.type === 'claim_chip' && !chips.includes(o.action.amount),
      )!;
      snapshot = await checked(actor, `rooms/${roomId}/actions`, 'POST', {
        match_id: snapshot.match_id,
        expected_version: snapshot.match_version,
        action_id: crypto.randomUUID(),
        action: move.action,
      });
    }
    await Promise.all(players.map((actor) => actor.reload()));
    for (let i = 0; i < 3; i++) {
      snapshot = await roomAs(page, roomId);
      const actor = byId.get(snapshot.game!.current_player!)!;
      await expect(
        actor.getByRole('button', { name: 'Reveal my hand', exact: true }),
      ).toBeVisible();
      await actor.getByRole('button', { name: 'Reveal my hand', exact: true }).click();
      await expect
        .poll(async () => ((await roomAs(page, roomId!)).game!.detail.revealed as string[]).length)
        .toBe(i + 1);
    }
    await page.locator('.gang-game').screenshot({ path: test.info().outputPath('gang-live.png') });
    await checked(page, `rooms/${roomId}/abandon`);
    await checked(page, `rooms/${roomId}/settings`, 'PUT', {
      game_id: 'six-nimmt',
      capacity: 3,
      settings: {},
    });
    for (const actor of players)
      await checked(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true });
    await checked(page, `rooms/${roomId}/start`);
    await Promise.all(players.map((actor) => actor.reload()));
    for (let i = 0; i < players.length; i++) {
      const actor = players[i];
      await expect(actor.getByText(`${i}/3 locked`, { exact: true })).toBeVisible();
      const view = await roomAs(actor, roomId);
      const card = view.game!.hand[0];
      await actor.getByRole('button', { name: card.label, exact: true }).click();
      await actor.getByRole('button', { name: 'Lock my number', exact: true }).click();
      if (i < 2) {
        const hidden = (await roomAs(players[i + 1], roomId)).game!;
        expect(hidden.detail.own_selection).toBeNull();
        expect(hidden.community).toHaveLength(0);
        await expect(actor.getByText('Your number is locked', { exact: true })).toBeVisible();
      }
    }
    await expect.poll(async () => (await roomAs(page, roomId!)).game!.community.length).toBe(3);
    snapshot = await roomAs(page, roomId);
    const revealed = snapshot.game!.community.map((card) => Number(card.value));
    expect(revealed).toEqual([...revealed].sort((a, b) => a - b));
    while (snapshot.game!.phase === 'take_row') {
      const actor = byId.get(snapshot.game!.current_player!)!;
      await expect(actor.getByRole('button', { name: 'Take row 1', exact: true })).toBeVisible();
      await actor.getByRole('button', { name: 'Take row 1', exact: true }).click();
      const previousVersion = snapshot.match_version!;
      await expect
        .poll(async () => (await roomAs(page, roomId!)).match_version)
        .toBeGreaterThan(previousVersion);
      snapshot = await roomAs(page, roomId);
    }
    const reviewer = byId.get(snapshot.game!.current_player!)!;
    await expect(
      reviewer.getByRole('button', { name: 'Next selection', exact: true }),
    ).toBeVisible();
    await page
      .locator('.six-game')
      .screenshot({ path: test.info().outputPath('six-nimmt-live.png') });
    await reviewer.getByRole('button', { name: 'Next selection', exact: true }).click();
    await expect.poll(async () => (await roomAs(page, roomId!)).game!.detail.trick).toBe(2);
    await players[1].reload();
    await expect(players[1].getByText('Choose one number', { exact: true })).toBeVisible();
    for (const actor of players)
      expect(await actor.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
  } finally {
    if (roomId) {
      const latest = await roomAs(page, roomId);
      if (latest.status === 'playing') await checked(page, `rooms/${roomId}/abandon`);
      for (const actor of players.slice(1)) await checked(actor, `rooms/${roomId}/leave`);
      await checked(page, `rooms/${roomId}/leave`);
    }
    await Promise.all(contexts.map((context) => context.close()));
  }
});
