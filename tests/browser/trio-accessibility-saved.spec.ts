import { expect, test, type Page } from '@playwright/test';
import { trioDetails } from '../../packages/api-client/src/modern-details';
import { attachPreviewAccess, openRoomOptions, requestAs, roomAs, type RoomView } from './helpers';

test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });
type Option = NonNullable<RoomView['game']>['actions'][number];

async function verifyRequests(page: Page, room: RoomView) {
  const expected = room.game!.players.flatMap((player) => {
    const name = room.members.find((member) => member.id === player.id)!.name;
    return [`Lowest card · ${name}`, `Highest card · ${name}`];
  });
  const controls = page.locator('.trio-end-actions button');
  await expect(controls).toHaveCount(expected.length);
  // Exact public-name-only labels ensure no private rank is included, even for
  // another player's hidden hand. Never capture or log a private hand to test this.
  expect(
    await controls.evaluateAll((buttons) =>
      buttons.map((button) => button.getAttribute('aria-label')),
    ),
  ).toEqual(expected);
  for (const label of expected)
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveCount(1);
}

async function verifyReveals(page: Page, room: RoomView) {
  const revealed = trioDetails(room.game!.detail).revealed;
  const region = page.locator('.trio-reveals');
  await expect(region.getByRole('img')).toHaveCount(revealed.length);
  const rows = region.locator(':scope > div');
  for (const [index, reveal] of revealed.entries()) {
    const owner =
      reveal.owner === 'table'
        ? `Table ${reveal.slot + 1}`
        : room.members.find((member) => member.id === reveal.owner)!.name;
    await expect(
      rows.nth(index).getByRole('img', { name: reveal.card.label, exact: true }),
    ).toHaveCount(1);
    await expect(rows.nth(index).locator(':scope > span')).toHaveText(owner);
  }
  const tree = await region.ariaSnapshot();
  for (const reveal of revealed) expect(tree).toContain(`img "${reveal.card.label}"`);
}

async function keyboardMove(page: Page, before: RoomView, option: Option, key: 'Enter' | 'Space') {
  const target = before.members.find((member) => member.id === option.action.target)?.name;
  const label =
    option.action.type === 'continue'
      ? 'Continue'
      : `${option.action.choice === 'low' ? 'Lowest' : 'Highest'} card · ${target}`;
  const control = page.getByRole('button', { name: label, exact: true });
  await expect(control).toBeEnabled();
  await control.focus();
  const actionResponse = page.waitForResponse(
    (response) =>
      response.url().endsWith(`/rooms/${before.id}/actions`) &&
      response.request().method() === 'POST',
  );
  await page.keyboard.press(key);
  const response = await actionResponse;
  expect(response.status()).toBe(200);
  expect(response.request().postDataJSON().action).toEqual(option.action);
  const moved = (await response.json()) as RoomView;
  expect(moved.match_version).toBe(before.match_version! + 1);
  return moved;
}

test('Trio keyboard requests identify the player and preserve only public reveals after refresh', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.setTimeout(180000);
  const contexts = await Promise.all(
    Array.from({ length: 2 }, () =>
      browser.newContext({ baseURL, viewport: page.viewportSize()!, reducedMotion: 'reduce' }),
    ),
  );
  const players = [page, ...(await Promise.all(contexts.map((context) => context.newPage())))];
  const joined = [page];
  let roomId: string | undefined;
  try {
    for (const actor of players) await attachPreviewAccess(actor);
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Trio room', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill(`Trio access host ${info.project.name}`);
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('3');
    await openRoomOptions(page);
    await page
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill(`Trio accessibility verification ${info.project.name}`);
    const createdResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/backend/v1/rooms') && response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    const created = await createdResponse;
    expect(created.status()).toBe(201);
    roomId = ((await created.json()) as RoomView).id;
    await expect(page).toHaveURL(new RegExp(`/rooms/${roomId}$`));
    const code = await page.locator('.room-code').innerText();
    for (const [index, friend] of players.slice(1).entries()) {
      await friend.goto('/');
      await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
      await friend
        .getByRole('textbox', { name: 'Your name', exact: true })
        .fill(`Trio access friend${index + 1} ${info.project.name}`);
      await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
      const joinedResponse = friend.waitForResponse((response) =>
        response.url().endsWith('/api/backend/v1/rooms/join'),
      );
      await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
      expect((await joinedResponse).status()).toBe(200);
      joined.push(friend);
      await expect(friend).toHaveURL(page.url());
    }
    const identities = await Promise.all(
      players.map(async (actor) => (await (await requestAs(actor, 'me')).json()).profile.id),
    );
    for (const actor of players) {
      expect((await requestAs(actor, `rooms/${roomId}/heartbeat`, 'POST')).status()).toBe(200);
      expect(
        (await requestAs(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true })).status(),
      ).toBe(200);
    }
    expect((await requestAs(page, `rooms/${roomId}/start`, 'POST')).status()).toBe(200);
    const started = await roomAs(page, roomId);
    const actorId = started.game!.current_player!;
    const actor = players[identities.indexOf(actorId)];
    const targetId = identities.find((id) => id !== actorId)!;
    await Promise.all(players.map((person) => person.reload()));
    for (const person of players) await verifyRequests(person, await roomAs(person, roomId));

    // Use only the authorized option list: ask the same opponent's low then high
    // ends without inspecting their private ranks or forcing a particular match.
    for (const [index, edge] of ['low', 'high'].entries()) {
      const before = await roomAs(actor, roomId);
      const option = before.game!.actions.find(
        (item) =>
          item.action.type === 'reveal_hand' &&
          item.action.target === targetId &&
          item.action.choice === edge,
      );
      expect(option, 'The authorized hand-end request is available').toBeTruthy();
      const moved = await keyboardMove(actor, before, option!, index === 0 ? 'Enter' : 'Space');
      const publicReveals = trioDetails(moved.game!.detail).revealed;
      expect(publicReveals).toHaveLength(index + 1);
      expect(publicReveals.at(-1)!.owner).toBe(targetId);
      await verifyReveals(actor, moved);
      for (const person of players) {
        await person.reload();
        const saved = await roomAs(person, roomId);
        expect(saved.match_version).toBe(moved.match_version);
        expect(trioDetails(saved.game!.detail).revealed).toEqual(publicReveals);
        await verifyRequests(person, saved);
        await verifyReveals(person, saved);
      }
    }
    const review = await roomAs(actor, roomId);
    const continuation = review.game!.actions.find((option) => option.action.type === 'continue');
    if (continuation) {
      const next = await keyboardMove(actor, review, continuation, 'Enter');
      expect(trioDetails(next.game!.detail).revealed).toEqual([]);
      expect(next.game!.current_player).not.toBe(actorId);
      for (const person of players) {
        await person.reload();
        const saved = await roomAs(person, roomId);
        expect(saved.match_version).toBe(next.match_version);
        expect(trioDetails(saved.game!.detail).revealed).toEqual([]);
        await verifyReveals(person, saved);
      }
    }
  } finally {
    try {
      if (roomId) {
        const state = await roomAs(page, roomId);
        if (state.status === 'playing')
          expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
        for (const friend of joined.slice(1))
          expect((await requestAs(friend, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
        expect((await requestAs(page, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
        for (const person of joined)
          expect((await requestAs(person, `rooms/${roomId}`)).status()).toBe(404);
      }
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
    }
  }
});
