import { expect, test, type Locator, type Page, type Response } from '@playwright/test';
import { azulDetails } from '../../packages/api-client/src/modern-details';
import { attachPreviewAccess, openRoomOptions, requestAs, roomAs, type RoomView } from './helpers';

test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });
type Option = NonNullable<RoomView['game']>['actions'][number];

/** One keyboard decision on a staged colour: the client saves the draft, then the previewed placement. */
async function keyboardDecision(
  page: Page,
  before: RoomView,
  draft: Option,
  destination: Locator,
  key: 'Enter' | 'Space',
) {
  await expect(destination).toBeEnabled();
  await destination.focus();
  const moves: { action: Option['action']; room: RoomView; status: number }[] = [];
  const saved = new Promise<void>((resolve) => {
    const listener = async (response: Response) => {
      if (
        !response.url().endsWith(`/rooms/${before.id}/actions`) ||
        response.request().method() !== 'POST'
      )
        return;
      moves.push({
        action: response.request().postDataJSON().action,
        room: (await response.json()) as RoomView,
        status: response.status(),
      });
      if (moves.length === 2) {
        page.off('response', listener);
        resolve();
      }
    };
    page.on('response', listener);
  });
  await page.keyboard.press(key);
  await saved;
  expect(moves.map((move) => move.status)).toEqual([200, 200]);
  expect(moves[0].action).toEqual(draft.action);
  expect(moves[0].room.match_version).toBe(before.match_version! + 1);
  expect(moves[1].action.type).toBe('place_tiles');
  expect(moves[1].room.match_version).toBe(before.match_version! + 2);
  return { drafted: moves[0].room, placed: moves[1].room, placement: moves[1].action };
}

async function verifyStaged(page: Page, view: RoomView, option: Option) {
  const data = azulDetails(view.game!.detail);
  const source =
    option.action.choice === 'center' ? data.center : data.factories[Number(option.action.choice)];
  const count = source.filter((color) => color === option.action.color).length;
  expect(count).toBeGreaterThan(0);
  const region = page.getByRole('region', { name: 'Your drafted tiles', exact: true });
  const group = region.getByRole('group', { name: 'Selected tiles', exact: true });
  await expect(
    group.getByRole('img', { name: `${option.action.color} tile`, exact: true }),
  ).toHaveCount(count);
  await expect(group.getByRole('img', { name: 'First-player marker', exact: true })).toHaveCount(
    option.action.choice === 'center' && data.marker ? 1 : 0,
  );
  expect(await group.ariaSnapshot()).toContain(`img "${option.action.color} tile"`);
}

async function verifyPlayerBoard(page: Page, view: RoomView, playerId: string) {
  const name = view.members.find((member) => member.id === playerId)!.name;
  const data = azulDetails(view.game!.detail);
  const board = page.locator('details.azul-player-board').filter({
    has: page.locator('summary strong', { hasText: name }),
  });
  if ((await board.getAttribute('open')) === null) {
    await board.locator('summary').focus();
    await page.keyboard.press('Enter');
  }
  const wall = board.getByRole('group', { name: 'Wall', exact: true });
  await expect(wall.getByRole('img')).toHaveCount(25);
  // This fresh match has not scored a round: all wall spaces retain their
  // positional/color identity instead of announcing an already-placed tile.
  expect(data.walls[playerId].flat().every((tile) => tile === null)).toBe(true);
  await expect(
    wall.getByRole('img', { name: 'Row 1, column 1: empty blue space', exact: true }),
  ).toHaveCount(1);
  const wallTree = await wall.ariaSnapshot();
  for (let row = 1; row <= 5; row++)
    for (let column = 1; column <= 5; column++)
      expect(wallTree).toContain(`Row ${row}, column ${column}: empty `);
  for (const [row, tiles] of data.lines[playerId].entries()) {
    const line = board.getByRole('button', {
      name: new RegExp(`^Place on pattern line ${row + 1},`),
    });
    await expect(line).toHaveAccessibleName(
      new RegExp(tiles.length ? `; ${tiles.length} ${tiles[0]} tiles` : '; empty'),
    );
  }
  const floor = board.locator('.azul-floor');
  await expect(floor.getByRole('img')).toHaveCount(7);
  const penalties = [1, 1, 2, 2, 2, 3, 3];
  const floorTree = await floor.ariaSnapshot();
  for (const [slot, penalty] of penalties.entries()) {
    const tile = data.floors[playerId][slot];
    const contents = tile === 'first' ? 'first-player marker' : tile ? `${tile} tile` : 'empty';
    const label = `Floor slot ${slot + 1}: ${contents}, ${penalty} penalty ${penalty === 1 ? 'point' : 'points'}${tile ? '' : ' when filled'}`;
    await expect(floor.getByRole('img', { name: label, exact: true })).toHaveCount(1);
    expect(floorTree).toContain(`img "${label}"`);
  }
}

test('Azul keyboard drafting and placement retain named tiles and marker after refresh', async ({
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
    await page.getByRole('button', { name: 'Create Azul room', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill(`Azul access host ${info.project.name}`);
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await openRoomOptions(page);
    await page
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill(`Azul accessibility verification ${info.project.name}`);
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
      .fill(`Azul access friend ${info.project.name}`);
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
    for (const actor of players) {
      expect((await requestAs(actor, `rooms/${roomId}/heartbeat`, 'POST')).status()).toBe(200);
      expect(
        (await requestAs(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true })).status(),
      ).toBe(200);
    }
    expect((await requestAs(page, `rooms/${roomId}/start`, 'POST')).status()).toBe(200);

    for (const source of ['factory', 'center'] as const) {
      const publicView = await roomAs(page, roomId);
      const playerId = publicView.game!.current_player!;
      const actor = players[identities.indexOf(playerId)];
      const observer = players.find((other) => other !== actor)!;
      await actor.reload();
      const before = await roomAs(actor, roomId);
      const data = azulDetails(before.game!.detail);
      const draft = before.game!.actions.find(
        (option) =>
          option.action.type === 'draft_tiles' &&
          (source === 'center'
            ? option.action.choice === 'center'
            : option.action.choice !== 'center' &&
              data.factories[Number(option.action.choice)].some(
                (color) => color !== option.action.color,
              )),
      );
      expect(
        draft,
        'The bounded scenario requires a mixed factory then its public center',
      ).toBeTruthy();
      const choice = draft!;
      const sourceName =
        source === 'center' ? 'center' : `factory ${Number(choice.action.choice) + 1}`;
      const control = actor.getByRole('button', {
        name: new RegExp(
          `^Take \\d+ ${choice.action.color} from ${sourceName}( and the first-player marker)?$`,
        ),
      });
      // Choosing a colour is local to this tab: nothing is saved, and a refresh keeps it.
      await expect(control).toBeEnabled();
      await control.focus();
      await actor.keyboard.press('Enter');
      await expect(control).toHaveAttribute('aria-pressed', 'true');
      await verifyStaged(actor, before, choice);
      await actor.reload();
      await expect(control).toHaveAttribute('aria-pressed', 'true');
      await verifyStaged(actor, before, choice);
      expect((await roomAs(actor, roomId)).match_version).toBe(before.match_version);
      const own = actor.locator('.azul-player-board[data-own="true"]');
      const destination =
        source === 'center'
          ? own.getByRole('button', { name: 'Place on floor', exact: true })
          : own.locator('.azul-pattern-line:enabled').first();
      const { drafted, placed, placement } = await keyboardDecision(
        actor,
        before,
        choice,
        destination,
        'Space',
      );
      expect(drafted.game!.phase).toBe('placing');
      const placingData = azulDetails(drafted.game!.detail);
      expect(placingData.draft.length).toBeGreaterThan(0);
      if (source === 'center') {
        expect(placingData.marker).toBe(false);
        expect(placingData.floors[playerId]).toContain('first');
        expect(placement.choice).toBe('floor');
      } else expect(placement.choice).not.toBe('floor');
      const placedData = azulDetails(placed.game!.detail);
      expect(placed.game!.phase).toBe('drafting');
      expect(placedData.draft).toEqual([]);
      if (source === 'factory')
        expect(placedData.lines[playerId][Number(placement.choice)].length).toBeGreaterThan(0);
      else expect(placedData.floors[playerId]).toEqual(['first', ...placingData.draft]);
      await actor.reload();
      const saved = await roomAs(actor, roomId);
      expect(saved.match_version).toBe(placed.match_version);
      expect(saved.game!.detail).toEqual(placed.game!.detail);
      await verifyPlayerBoard(actor, saved, playerId);
      await observer.reload();
      const observed = await roomAs(observer, roomId);
      expect(observed.game!.detail).toEqual(saved.game!.detail);
      await verifyPlayerBoard(observer, observed, playerId);
      expect((await roomAs(actor, roomId)).match_version).toBe(placed.match_version);
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
