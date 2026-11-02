import { expect, test, type Page } from '@playwright/test';
import { attachPreviewAccess, openRoomOptions, requestAs, roomAs, type RoomView } from './helpers';

// Two independent identities share one room; no fixtures, bots or private-state injection.
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

function positionLabels(room: RoomView) {
  const game = room.game!;
  const owner = (seat: number) =>
    room.members.find((member) => member.id === game.players[seat].id)!.name;
  return game.community.map((card, index) =>
    game.game_id === 'four-in-a-row'
      ? `${card.label}: ${card.value ? owner(Number(card.value) - 1) : 'empty'}`
      : `${owner(index < 7 ? 0 : 1)} · ${card.label}: ${card.value} seeds`,
  );
}

async function verifyBoard(page: Page, room: RoomView) {
  const labels = positionLabels(room);
  if (room.game_id === 'four-in-a-row') {
    const board = page.getByRole('group', { name: 'Playing surface', exact: true });
    await expect(board.getByRole('img')).toHaveCount(42);
    const tree = await board.ariaSnapshot();
    for (const label of labels) {
      await expect(board.getByRole('img', { name: label, exact: true })).toHaveCount(1);
      expect(tree).toContain(`img "${label}"`);
    }
  } else {
    const board = page.locator('.mancala-board');
    await expect(board.getByRole('img')).toHaveCount(2);
    for (const slot of [6, 13])
      await expect(board.getByRole('img', { name: labels[slot], exact: true })).toHaveCount(1);
    await expect(board.getByRole('button')).toHaveCount(12);
    const tree = await board.ariaSnapshot();
    expect(tree).toContain(labels[6]);
    expect(tree).toContain(labels[13]);
  }
  const opener = page.getByRole('button', { name: 'View whole board', exact: true });
  await opener.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByRole('img')).toHaveCount(labels.length);
  const overview = await dialog.ariaSnapshot();
  for (const label of labels) {
    await expect(dialog.getByRole('img', { name: label, exact: true })).toHaveCount(1);
    expect(overview).toContain(`img "${label}"`);
  }
  await expect(dialog.getByRole('button')).toHaveCount(1);
  await expect(dialog.getByRole('button', { name: 'Close dialog', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  expect((await roomAs(page, room.id)).match_version).toBe(room.match_version);
}

test('keyboard board moves retain named public positions after a saved refresh', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.setTimeout(180000);
  const friendContext = await browser.newContext({
    baseURL,
    viewport: page.viewportSize()!,
    reducedMotion: 'reduce',
  });
  const friend = await friendContext.newPage();
  let roomId: string | undefined;
  let friendJoined = false;
  try {
    for (const actor of [page, friend]) await attachPreviewAccess(actor);
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Four in a Row room', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill(`Board access host ${info.project.name}`);
    await openRoomOptions(page);
    await page
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill(`Board accessibility verification ${info.project.name}`);
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
    await friend.goto('/');
    await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
    await friend
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill(`Board access friend ${info.project.name}`);
    await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
    const joinedResponse = friend.waitForResponse((response) =>
      response.url().endsWith('/api/backend/v1/rooms/join'),
    );
    await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
    expect((await joinedResponse).status()).toBe(200);
    friendJoined = true;
    await expect(friend).toHaveURL(page.url());
    const players = [page, friend];
    const identities = await Promise.all(
      players.map(async (actor) => (await (await requestAs(actor, 'me')).json()).profile.id),
    );

    for (const game of ['four-in-a-row', 'mancala']) {
      if (game === 'mancala') {
        expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
        expect(
          (
            await requestAs(page, `rooms/${roomId}/settings`, 'PUT', {
              game_id: game,
              capacity: 2,
              settings: {},
            })
          ).status(),
        ).toBe(200);
      }
      for (const actor of players) {
        expect((await requestAs(actor, `rooms/${roomId}/heartbeat`, 'POST')).status()).toBe(200);
        expect(
          (await requestAs(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true })).status(),
        ).toBe(200);
      }
      expect((await requestAs(page, `rooms/${roomId}/start`, 'POST')).status()).toBe(200);
      const started = await roomAs(page, roomId);
      const actor = players[identities.indexOf(started.game!.current_player)];
      await actor.reload();
      await verifyBoard(actor, started);
      const before = await roomAs(actor, roomId);
      const option = before.game!.actions[0];
      const label =
        game === 'four-in-a-row'
          ? option.label
          : `${option.label} · ${before.members.find((member) => member.id === before.game!.current_player)!.name}`;
      const control = actor.getByRole('button', { name: label, exact: true });
      await expect(control).toBeEnabled();
      await control.focus();
      const moveResponse = actor.waitForResponse(
        (response) =>
          response.url().endsWith(`/rooms/${roomId}/actions`) &&
          response.request().method() === 'POST',
      );
      await actor.keyboard.press(game === 'four-in-a-row' ? 'Enter' : 'Space');
      const movedResponse = await moveResponse;
      expect(movedResponse.status()).toBe(200);
      expect(movedResponse.request().postDataJSON().action).toEqual(option.action);
      const moved = (await movedResponse.json()) as RoomView;
      expect(moved.match_version).toBe(before.match_version! + 1);
      expect(moved.game!.community).not.toEqual(before.game!.community);
      await actor.reload();
      const saved = await roomAs(actor, roomId);
      expect(saved.match_version).toBe(moved.match_version);
      expect(saved.game!.community).toEqual(moved.game!.community);
      expect(
        (
          await roomAs(
            players.find((other) => other !== actor)!,
            roomId,
          )
        ).game!.community,
      ).toEqual(saved.game!.community);
      await verifyBoard(actor, saved);
    }
  } finally {
    try {
      if (roomId) {
        const state = await roomAs(page, roomId);
        if (state.status === 'playing')
          expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
        if (friendJoined)
          expect((await requestAs(friend, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
        expect((await requestAs(page, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
        expect((await requestAs(page, `rooms/${roomId}`)).status()).toBe(404);
        if (friendJoined) expect((await requestAs(friend, `rooms/${roomId}`)).status()).toBe(404);
      }
    } finally {
      await friendContext.close();
    }
  }
});
