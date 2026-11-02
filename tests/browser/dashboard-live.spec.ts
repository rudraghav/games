import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import type { components } from '../../packages/api-client/src/generated/schema';
import catalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };
import { attachPreviewAccess, openRoomOptions, requestAs, roomAs, type RoomView } from './helpers';

type Me = components['schemas']['MeView'];
type Run = { cleanup: () => Promise<void>; record: () => Promise<void> };
const runs = new WeakMap<Page, Run>();
const widths = [320, 390, 1440] as const;
const friendRoomName = 'Dashboard live friends';
const botRoomName = 'Dashboard live bots';

// One execution uses exactly two identities, including when run against a
// deployment. This test itself exercises all three widths; do not duplicate it.
test.use({ trace: 'off', screenshot: 'off', video: 'off', actionTimeout: 15000 });
test.afterEach(async ({ page }) => {
  test.setTimeout(60000);
  const run = runs.get(page);
  if (!run) return;
  try {
    await run.cleanup();
  } finally {
    await run.record();
  }
});

test('two guests browse every setup, join a private room and play with the real bot driver', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.skip(info.project.name !== 'desktop', 'The desktop execution covers 320, 390 and 1440px.');
  test.setTimeout(240000);
  const startedAt = new Date().toISOString();
  const origin = new URL(baseURL!).origin;
  const evidence = `.vercel/dashboard-live-${Date.now()}-${randomUUID().slice(0, 8)}.json`;
  const friendContext: BrowserContext = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const friend = await friendContext.newPage();
  const ownedRooms = new Set<string>();
  const responseTasks = new Set<Promise<void>>();
  const counts = {
    inspectedGameDialogs: 0,
    inspectedWidths: [] as number[],
    roomSubmissions: 0,
    blockedAIRequests: 0,
    authenticatedPreJoinDenials: 0,
    filterRetentionChecks: 0,
    membershipShortcutChecks: 0,
    friendJoins: 0,
    optionalAvatarAndRulesSaved: false,
    botRoomsAutostarted: 0,
    humanLegalActions: 0,
    clientBotDriveRequests: 0,
    committedClientBotReplies: 0,
    savedBotStateRefreshed: false,
    cleanupClosedRooms: 0,
    cleanupActorDenials: 0,
    cleanupEmptyMemberResponses: 0,
  };
  let complete = false;
  let cleanupComplete = false;
  let failureKind: string | null = null;
  let friendClosed = false;
  let hostId: string | undefined;
  let friendId: string | undefined;

  function track(task: Promise<void>) {
    responseTasks.add(task);
    void task.finally(() => responseTasks.delete(task));
  }
  for (const actor of [page, friend]) {
    await attachPreviewAccess(actor);
    await actor.emulateMedia({ reducedMotion: 'reduce' });
    await actor.route('**/api/backend/v1/rooms/*/reading', async (route) => {
      if (route.request().method() === 'POST') {
        counts.blockedAIRequests++;
        await route.abort();
      } else await route.continue();
    });
    actor.on('response', (response) => {
      const path = new URL(response.url()).pathname;
      if (response.request().method() !== 'POST') return;
      if (path === '/api/backend/v1/rooms') {
        counts.roomSubmissions++;
        if (response.ok())
          track(
            response
              .json()
              .then((body) => {
                if (typeof body.id === 'string') ownedRooms.add(body.id);
              })
              .catch(() => undefined),
          );
      } else if (/\/rooms\/[^/]+\/bots\/drive$/.test(path)) {
        counts.clientBotDriveRequests++;
        if (response.ok())
          track(
            response
              .json()
              .then((body) => {
                const version = response.request().postDataJSON()?.expected_version;
                if (typeof version === 'number' && body.match_version > version)
                  counts.committedClientBotReplies++;
              })
              .catch(() => undefined),
          );
      }
    });
  }

  async function checked<T>(actor: Page, path: string, method = 'GET', data?: unknown): Promise<T> {
    const response = await requestAs(actor, path, method, data);
    expect(response.status(), `${method} dashboard operation must succeed`).toBeLessThan(300);
    return response.json();
  }
  async function record() {
    await mkdir('.vercel', { recursive: true });
    await writeFile(
      evidence,
      JSON.stringify(
        {
          startedAt,
          origin,
          hosted: Boolean(process.env.GAMES_TEST_URL),
          applicationSourceSha: process.env.GAMES_RELEASE_SHA || null,
          sourceState: process.env.GAMES_RELEASE_SHA
            ? 'explicit serving revision'
            : 'local workspace',
          actors: 2,
          games: catalogue.length,
          widths,
          complete: complete && cleanupComplete,
          cleanupComplete,
          failureKind,
          counts,
          decisions:
            'Room setup is inspected without submission. Exactly two guests create two rooms; a human plays a permitted call/check and only the rendered client drives bot replies. No AI generation is permitted.',
        },
        null,
        2,
      ) + '\n',
      { mode: 0o600 },
    );
  }
  async function cleanup() {
    if (cleanupComplete) return;
    // Stop only these pages' polling/bot drivers before ending their rooms.
    await Promise.allSettled([page.goto('about:blank'), friend.goto('about:blank')]);
    await Promise.allSettled([...responseTasks]);
    // Recover a committed create even if its navigation/response was interrupted.
    const meResponse = await requestAs(page, 'me');
    if (meResponse.ok()) {
      const me: Me = await meResponse.json();
      hostId ??= me.profile?.id;
      for (const room of me.rooms)
        if ([friendRoomName, botRoomName].includes(room.name)) ownedRooms.add(room.id);
    }
    for (const id of [...ownedRooms]) {
      const beforeResponse = await requestAs(page, `rooms/${id}`);
      if (beforeResponse.status() === 404) {
        expect((await requestAs(friend, `rooms/${id}`)).status()).toBe(404);
        ownedRooms.delete(id);
        counts.cleanupActorDenials += 2;
        continue;
      }
      expect(beforeResponse.status()).toBe(200);
      const before: RoomView = await beforeResponse.json();
      expect([friendRoomName, botRoomName].includes(before.name)).toBe(true);
      expect(Boolean(hostId && before.owner_id === hostId)).toBe(true);
      if (before.status === 'playing') await checked(page, `rooms/${id}/abandon`, 'POST');
      if (!friendClosed) {
        const friendBefore = await requestAs(friend, `rooms/${id}`);
        if (friendBefore.ok()) await checked(friend, `rooms/${id}/leave`, 'POST');
        else expect(friendBefore.status()).toBe(404);
      }
      const left = await checked<RoomView>(page, `rooms/${id}/leave`, 'POST');
      expect(left.status, 'The last human closes the owned room, including bot seats').toBe(
        'closed',
      );
      expect(left.members).toHaveLength(0);
      counts.cleanupEmptyMemberResponses++;
      for (const actor of [page, friend]) {
        expect((await requestAs(actor, `rooms/${id}`)).status()).toBe(404);
        counts.cleanupActorDenials++;
      }
      counts.cleanupClosedRooms++;
      ownedRooms.delete(id);
    }
    await friendContext.close();
    friendClosed = true;
    cleanupComplete = true;
  }
  runs.set(page, { cleanup, record });

  async function home(actor: Page) {
    await actor.goto('/');
    await expect(actor.getByRole('tab', { name: 'Games', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  }
  async function checkTabs(actor: Page, expectedRooms: number) {
    const search = actor.getByRole('searchbox', { name: 'Search games', exact: true });
    await search.fill('uno');
    await actor.getByRole('combobox', { name: 'Players', exact: true }).selectOption('2');
    await actor.getByRole('button', { name: 'Cards', exact: true }).click();
    const tiles = await actor.locator('.game-tile:visible').count();
    expect(tiles).toBeGreaterThan(0);
    await expect(actor.locator('.room-shortcut:visible')).toHaveCount(0);
    await actor.getByRole('tab', { name: 'Games', exact: true }).press('ArrowRight');
    await expect(actor.getByRole('tab', { name: 'Rooms', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(actor.locator('.room-shortcut:visible')).toHaveCount(expectedRooms);
    await expect(
      actor.getByRole('link', { name: `Open ${friendRoomName}, Uno`, exact: true }),
    ).toBeVisible();
    const botShortcut = actor.getByRole('link', {
      name: `Open ${botRoomName}, ${catalogue.find((game) => game.id === 'holdem')!.name}`,
      exact: true,
    });
    if (expectedRooms === 2) await expect(botShortcut).toBeVisible();
    else await expect(botShortcut).toHaveCount(0);
    await actor.getByRole('tab', { name: 'Rooms', exact: true }).press('ArrowLeft');
    await expect(search).toHaveValue('uno');
    await expect(actor.getByRole('combobox', { name: 'Players', exact: true })).toHaveValue('2');
    await expect(actor.getByRole('button', { name: 'Cards', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(actor.locator('.game-tile:visible')).toHaveCount(tiles);
    expect(await actor.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    counts.filterRetentionChecks++;
    counts.membershipShortcutChecks++;
  }

  try {
    await home(page);
    for (const width of widths) {
      await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
      for (const game of catalogue) {
        await page.getByRole('button', { name: `Create ${game.name} room`, exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Create room', exact: true });
        await expect(dialog.getByRole('combobox', { name: 'The game', exact: true })).toHaveValue(
          game.id,
        );
        const seats = dialog.getByRole('combobox', { name: 'Seats', exact: true });
        const options = await seats.locator('option').evaluateAll((nodes) =>
          nodes.map((node) => ({
            value: Number((node as HTMLOptionElement).value),
            label: node.textContent,
          })),
        );
        expect(options.map((option) => option.value)).toEqual(
          Array.from(
            { length: game.max_players - game.min_players + 1 },
            (_, index) => game.min_players + index,
          ),
        );
        expect(
          options.every(
            (option) =>
              option.label === `${option.value} ${option.value === 1 ? 'player' : 'players'}`,
          ),
        ).toBe(true);
        expect(Number(await seats.inputValue())).toBeGreaterThanOrEqual(game.min_players);
        expect(Number(await seats.inputValue())).toBeLessThanOrEqual(game.max_players);
        await expect(dialog.locator('.room-avatar-picker')).not.toHaveAttribute('open');
        await expect(dialog.locator('.avatar-options')).toBeHidden();
        await expect(
          dialog.getByRole('button', { name: 'Avatar colour 1', exact: true, includeHidden: true }),
        ).toHaveAttribute('aria-pressed', 'true');
        await expect(
          dialog.getByRole('textbox', { name: 'Room name', exact: true, includeHidden: true }),
        ).toBeHidden();
        for (const rule of game.settings) {
          const toggle = dialog.getByRole('checkbox', {
            name: rule.label,
            exact: true,
            includeHidden: true,
          });
          await expect(toggle).toBeHidden();
          expect(await toggle.isChecked()).toBe(rule.default);
        }
        if (game.bots_supported) {
          await expect(
            dialog.getByRole('button', { name: 'Friends', exact: true }),
          ).toHaveAttribute('aria-pressed', 'true');
          await dialog.getByRole('button', { name: 'Bots', exact: true }).click();
          await expect(seats).toHaveValue(String(game.min_players));
          expect(await seats.locator('option').allTextContents()).toEqual(
            options.map(({ value }) => `You + ${value - 1} ${value === 2 ? 'bot' : 'bots'}`),
          );
          await expect(
            dialog.getByRole('button', { name: 'Play game', exact: true }),
          ).toBeVisible();
          await dialog.getByRole('button', { name: 'Friends', exact: true }).click();
        } else
          await expect(dialog.getByRole('group', { name: 'Play with', exact: true })).toHaveCount(
            0,
          );
        const submit = dialog.getByRole('button', { name: 'Create room', exact: true });
        await expect(submit).toBeVisible();
        const cta = await submit.boundingBox();
        expect(
          Boolean(cta && cta.y >= 0 && cta.y + cta.height <= page.viewportSize()!.height),
        ).toBe(true);
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
        await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
        counts.inspectedGameDialogs++;
      }
      counts.inspectedWidths.push(width);
    }
    expect(counts.roomSubmissions).toBe(0);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole('button', { name: 'Create Uno room', exact: true }).click();
    const setup = page.getByRole('dialog', { name: 'Create room', exact: true });
    await setup
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill('Dashboard Live Host');
    await setup.locator('.room-avatar-picker > summary').click();
    await setup.getByRole('button', { name: 'Avatar colour 6', exact: true }).click();
    await openRoomOptions(setup);
    await setup.getByRole('textbox', { name: 'Room name', exact: true }).fill(friendRoomName);
    await setup.getByRole('checkbox', { name: 'Stack draw-two cards', exact: true }).check();
    await setup.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await setup.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect.poll(() => new URL(page.url()).pathname.startsWith('/rooms/')).toBe(true);
    const friendRoomId = new URL(page.url()).pathname.split('/').at(-1)!;
    ownedRooms.add(friendRoomId);
    const room = await roomAs(page, friendRoomId);
    hostId = room.owner_id;
    expect(room.settings.stack_draw_two).toBe(true);
    expect(room.members.find((member) => member.id === hostId)?.avatar).toBe(5);
    expect(room.name).toBe(friendRoomName);
    counts.optionalAvatarAndRulesSaved = true;
    await home(friend);
    await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
    await expect.poll(async () => (await requestAs(friend, 'me')).status()).toBe(200);
    expect((await requestAs(friend, `rooms/${friendRoomId}`)).status()).toBe(404);
    counts.authenticatedPreJoinDenials++;
    await friend
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill('Dashboard Live Friend');
    try {
      await friend
        .getByRole('textbox', { name: 'Room code', exact: true })
        .fill(new URL(`/join/${room.invite_token}`, origin).href);
    } catch {
      throw new Error('The full private invite could not be entered.');
    }
    await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect.poll(() => new URL(friend.url()).pathname === `/rooms/${friendRoomId}`).toBe(true);
    const joined = await roomAs(friend, friendRoomId);
    expect(joined.members).toHaveLength(2);
    friendId = joined.members.find((member) => member.id !== hostId)!.id;
    counts.friendJoins++;
    for (const actor of [page, friend]) {
      await home(actor);
      for (const width of widths) {
        await actor.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
        await checkTabs(actor, 1);
      }
    }
    await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
    const holdem = catalogue.find((game) => game.id === 'holdem')!;
    await page.getByRole('button', { name: `Create ${holdem.name} room`, exact: true }).click();
    const botSetup = page.getByRole('dialog', { name: 'Create room', exact: true });
    await botSetup.getByRole('button', { name: 'Bots', exact: true }).click();
    await botSetup.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await openRoomOptions(botSetup);
    await botSetup.getByRole('textbox', { name: 'Room name', exact: true }).fill(botRoomName);
    await botSetup.getByRole('button', { name: 'Play game', exact: true }).click();
    await expect.poll(() => new URL(page.url()).pathname.startsWith('/rooms/')).toBe(true);
    const botRoomId = new URL(page.url()).pathname.split('/').at(-1)!;
    ownedRooms.add(botRoomId);
    let botRoom = await roomAs(page, botRoomId);
    expect(botRoom.status).toBe('playing');
    expect(botRoom.capacity).toBe(2);
    expect(botRoom.members.filter((member) => member.is_bot)).toHaveLength(1);
    counts.botRoomsAutostarted++;
    expect((await requestAs(friend, `rooms/${botRoomId}`)).status()).toBe(404);
    counts.authenticatedPreJoinDenials++;
    await page.bringToFront();
    await expect
      .poll(
        async () => {
          botRoom = await roomAs(page, botRoomId);
          return botRoom.game!.actions.some((option) =>
            ['call', 'check'].includes(option.action.type),
          );
        },
        { timeout: 45000 },
      )
      .toBe(true);
    const legal = botRoom.game!.actions.find((option) =>
      ['call', 'check'].includes(option.action.type),
    )!;
    const moved = await checked<RoomView>(page, `rooms/${botRoomId}/actions`, 'POST', {
      match_id: botRoom.match_id,
      expected_version: botRoom.match_version,
      action_id: randomUUID(),
      action: legal.action,
    });
    counts.humanLegalActions++;
    const humanVersion = moved.match_version!;
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expect
      .poll(
        async () => {
          const next = await roomAs(page, botRoomId);
          return next.match_version! > humanVersion && counts.committedClientBotReplies > 0;
        },
        { timeout: 45000, intervals: [500, 1000, 2000] },
      )
      .toBe(true);
    const afterBot = await roomAs(page, botRoomId);
    await page.reload();
    await expect(page.locator('.table-layout')).toBeVisible();
    const refreshed = await roomAs(page, botRoomId);
    expect(Boolean(refreshed.match_id === afterBot.match_id)).toBe(true);
    expect(refreshed.match_version!).toBeGreaterThanOrEqual(afterBot.match_version!);
    counts.savedBotStateRefreshed = true;
    await home(page);
    await checkTabs(page, 2);
    await checkTabs(friend, 1);
    expect(counts.inspectedGameDialogs).toBe(catalogue.length * widths.length);
    expect(counts.roomSubmissions).toBe(2);
    expect(counts.blockedAIRequests).toBe(0);
    expect(Boolean(hostId && friendId && hostId !== friendId)).toBe(true);
    complete = true;
  } catch (error) {
    failureKind = error instanceof Error ? error.name : 'Unknown';
    throw error;
  } finally {
    try {
      await cleanup();
    } finally {
      await record();
    }
  }
});
