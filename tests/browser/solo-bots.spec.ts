import { expect, test, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import type { components } from '../../packages/api-client/src/generated/schema';
import { attachPreviewAccess, requestAs, roomAs, type RoomView } from './helpers';
import { matchPlayer } from './fullmatch-player';

type Manifest = components['schemas']['GameManifest'];
type Me = components['schemas']['MeView'];
type Summary = {
  game: string;
  seats: number;
  botCount: number;
  humanMoves: number;
  finalVersion: number;
  clientDrives: number;
  result: boolean;
  history: boolean;
  profile: boolean;
  rematch: boolean;
  switch: boolean;
  roomClosed: boolean;
};
type Run = {
  rooms: Set<string>;
  close: (id: string) => Promise<void>;
  record: () => Promise<void>;
  complete: boolean;
  cleanup: boolean;
};
const runs = new WeakMap<Page, Run>();

// Explicit slow acceptance. Bots must advance through useRoom's real browser
// driver; this test never requests a bot action or calls the drive endpoint.
test.skip(process.env.GAMES_SOLO_BOTS !== '1', 'Set GAMES_SOLO_BOTS=1 for solo acceptance.');
test.use({ trace: 'off', screenshot: 'off' });
test.afterEach(async ({ page }) => {
  test.setTimeout(45000);
  const run = runs.get(page);
  if (!run) return;
  for (const id of run.rooms) {
    try {
      await run.close(id);
    } catch {
      run.cleanup = false;
    }
  }
  if (!run.cleanup) run.complete = false;
  await run.record();
  expect(run.cleanup, 'Only the test-owned rooms must close after the last human leaves').toBe(
    true,
  );
});

test('one human plays every multiplayer game with the real bot driver', async ({
  page,
  baseURL,
}) => {
  const filter = process.env.GAMES_SOLO_BOT_GAMES?.split(',').filter(Boolean);
  const origin = new URL(baseURL!).origin;
  // Remote snapshots/actions have higher round-trip costs. Keep the same move
  // and stall bounds, with enough total time to retain the original QA group.
  test.setTimeout(
    (['127.0.0.1', 'localhost'].includes(new URL(origin).hostname) ? 40 : 75) * 60 * 1000,
  );
  const runTag = randomUUID().slice(0, 8);
  const project = test.info().project.name;
  const checkoutSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const workspaceDirty = Boolean(
    execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(),
  );
  const summaries: Summary[] = [];
  const driver = { requests: 0, successes: 0, failures: 0 };
  const matchDrives = new Map<string, number>();
  const setup = {
    autoStart: false,
    clickedMove: false,
    addRemove: false,
    retry: false,
    reconnect: false,
  };
  let active: { game: string; humanMoves: number; version: number | null } | null = null;
  let groupRoomId: string | undefined;
  let failure: string | undefined;
  const startedAt = new Date().toISOString();
  const evidence = `.vercel/solo-bots-${project}-${runTag}.json`;
  const run: Run = {
    rooms: new Set<string>(),
    complete: false,
    cleanup: true,
    close: async (id) => {
      const before = await requestAs(page, `rooms/${id}`);
      if (before.status() === 404) {
        run.rooms.delete(id);
        return;
      }
      expect(before.status(), 'Read own room before cleanup').toBe(200);
      if (((await before.json()) as RoomView).status === 'playing') {
        const abandoned = await requestAs(page, `rooms/${id}/abandon`, 'POST');
        expect(abandoned.status(), 'End only this task-owned unfinished match').toBe(200);
      }
      const left = await requestAs(page, `rooms/${id}/leave`, 'POST');
      expect(left.status(), 'Leave only this task-owned room').toBe(200);
      expect((await left.json()).status, 'Last human closes a room containing bots').toBe('closed');
      expect(
        (await requestAs(page, `rooms/${id}`)).status(),
        'Closed room is no longer readable',
      ).toBe(404);
      run.rooms.delete(id);
    },
    record: async () => {
      await mkdir('.vercel', { recursive: true });
      await writeFile(
        evidence,
        JSON.stringify(
          {
            startedAt,
            origin,
            hosted: !['127.0.0.1', 'localhost'].includes(new URL(origin).hostname),
            project,
            checkoutSha,
            applicationSourceSha:
              process.env.GAMES_RELEASE_SHA || (workspaceDirty ? null : checkoutSha),
            sourceState: process.env.GAMES_RELEASE_SHA
              ? 'explicit serving revision'
              : workspaceDirty
                ? 'uncommitted local workspace'
                : 'clean checkout',
            selectedGames: filter || 'all multiplayer games',
            complete: run.complete,
            cleanup: run.cleanup,
            active,
            failure,
            setup,
            driver,
            cases: summaries,
            decisions:
              'One group room per viewport respects room-creation limits. Human authorized projections only; bots advance exclusively through the rendered client driver. Human API moves trigger the normal visible-tab refresh path. The shared group room closes after all selected games.',
            rummyScenario:
              'The human may legally drop; bot declarations and complete rule coverage are independently verified.',
          },
          null,
          2,
        ) + '\n',
        { mode: 0o600 },
      );
    },
  };
  runs.set(page, run);
  page.on('response', (response) => {
    if (
      response.request().method() !== 'POST' ||
      !/\/rooms\/[^/]+\/bots\/drive$/.test(new URL(response.url()).pathname)
    )
      return;
    driver.requests++;
    if (response.ok()) {
      driver.successes++;
      const matchId = response.request().postDataJSON()?.match_id as string | undefined;
      if (matchId) matchDrives.set(matchId, (matchDrives.get(matchId) || 0) + 1);
    } else driver.failures++;
  });

  async function checked<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
    const response = await requestAs(page, path, method, data);
    // Never include a response body, private projection or authenticated request
    // in assertions/evidence. The operation and HTTP status suffice to diagnose.
    expect(response.status(), `${method} ${path.split('/').at(-1)} must succeed`).toBeLessThan(300);
    return response.json();
  }
  async function refreshVisibleTab() {
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
  }
  async function create(game: Manifest): Promise<RoomView> {
    let room: RoomView;
    if (groupRoomId) {
      room = await roomAs(page, groupRoomId);
      const bots = room.members.filter((member) => member.is_bot);
      for (const bot of bots.slice(game.min_players - 1))
        await checked(`rooms/${room.id}/members/${encodeURIComponent(bot.id)}`, 'DELETE');
      room = await checked<RoomView>(`rooms/${room.id}/settings`, 'PUT', {
        game_id: game.id,
        capacity: game.min_players,
        settings: {},
      });
      const missing = game.min_players - room.members.length;
      if (missing > 0)
        room = await checked<RoomView>(`rooms/${room.id}/bots`, 'POST', { count: missing });
    } else {
      room = await checked<RoomView>('rooms', 'POST', {
        name: 'Solo Match Host',
        avatar: 2,
        game_id: game.id,
        room_name: 'Solo acceptance',
        capacity: game.min_players,
        settings: {},
        bots: game.min_players - 1,
      } satisfies components['schemas']['CreateRoom']);
      groupRoomId = room.id;
      run.rooms.add(room.id);
    }
    await checked(`rooms/${room.id}/ready`, 'PUT', { ready: true });
    return checked<RoomView>(`rooms/${room.id}/start`, 'POST');
  }

  try {
    await attachPreviewAccess(page);
    await page.goto('/');
    // The same single guest identity is reused for this viewport's entire run.
    await page.getByRole('button', { name: 'Play with bots', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Solo Match Host');
    await page
      .getByRole('group', { name: 'Play with', exact: true })
      .getByRole('button', { name: 'Bots', exact: true })
      .click();
    await page
      .getByRole('combobox', { name: 'The game', exact: true })
      .selectOption('four-in-a-row');
    await page.getByRole('button', { name: 'Play game', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/, { timeout: 45000 });
    const setupId = new URL(page.url()).pathname.split('/').at(-1)!;
    run.rooms.add(setupId);
    const setupRoom = await roomAs(page, setupId);
    expect(setupRoom.status).toBe('playing');
    expect(setupRoom.members.filter((member) => member.is_bot)).toHaveLength(1);
    setup.autoStart = true;
    const identity = (await checked<Me>('me')).profile!.id;

    // Two controlled transport failures exercise both automatic retry and the
    // explicit recovery button. No move is committed while these are injected.
    let blocked = 0;
    await page.route('**/bots/drive', async (route) => {
      if (blocked < 2) {
        blocked++;
        await route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: '{"detail":"Temporary test interruption"}',
        });
      } else await route.continue();
    });
    const beforeClick = await roomAs(page, setupId);
    await page.getByRole('button', { name: 'Drop in column 4', exact: true }).click();
    setup.clickedMove = true;
    await expect(page.getByRole('button', { name: 'Retry bot moves', exact: true })).toBeVisible({
      timeout: 15000,
    });
    expect(blocked).toBe(2);
    const afterClick = await roomAs(page, setupId);
    expect(afterClick.match_version).toBe((beforeClick.match_version ?? 0) + 1);
    await page.getByRole('button', { name: 'Retry bot moves', exact: true }).click();
    await expect
      .poll(async () => (await roomAs(page, setupId)).match_version, { timeout: 15000 })
      .toBe((beforeClick.match_version ?? 0) + 2);
    setup.retry = true;
    await page.unroute('**/bots/drive');
    const preserved = (await roomAs(page, setupId)).match_version;
    await page.context().setOffline(true);
    await page.waitForTimeout(700);
    await page.context().setOffline(false);
    await page.reload();
    await expect(page.locator('.table-announcement')).toBeVisible();
    expect((await roomAs(page, setupId)).match_version).toBe(preserved);
    setup.reconnect = true;
    await checked(`rooms/${setupId}/abandon`, 'POST');
    await page.reload();
    const remove = page.getByRole('button', { name: /^Remove .+ bot$/ });
    await expect(remove).toHaveCount(1);
    await remove.click();
    await expect
      .poll(
        async () => (await roomAs(page, setupId)).members.filter((member) => member.is_bot).length,
      )
      .toBe(0);
    await page.getByRole('button', { name: 'Add bot', exact: true }).click();
    await expect(remove).toHaveCount(1);
    setup.addRemove = true;
    await run.close(setupId);
    await run.record();

    const catalogue = (await checked<Manifest[]>('games')).filter((game) => game.id !== 'tarot');
    expect(catalogue).toHaveLength(25);
    if (filter?.some((id) => !catalogue.some((game) => game.id === id)))
      throw new Error('Solo filter contains an unavailable multiplayer game.');
    for (const game of catalogue) {
      if (filter && !filter.includes(game.id)) continue;
      await test.step(game.name, async () => {
        const choose = matchPlayer();
        let snapshot = await create(game);
        const roomId = snapshot.id;
        const naturalMatchId = snapshot.match_id!;
        const clientDrives = () => matchDrives.get(naturalMatchId) || 0;
        const members = snapshot.members.map((member) => member.id).sort();
        const botCount = snapshot.members.filter((member) => member.is_bot).length;
        expect(botCount).toBe(game.min_players - 1);
        expect(snapshot.members.find((member) => member.id === identity)?.is_bot).toBe(false);
        let humanMoves = 0;
        let lastMove = 0;
        let lastAdvance = Date.now();
        let version = snapshot.match_version;
        active = { game: game.id, humanMoves, version };
        await run.record();
        await page.goto(`/rooms/${roomId}`);
        await expect(page.locator('.table-announcement')).toBeVisible();
        try {
          while (snapshot.status === 'playing' && (snapshot.match_version ?? 0) < 4000) {
            snapshot = await roomAs(page, roomId);
            if (snapshot.status !== 'playing') break;
            if (snapshot.match_version !== version) {
              version = snapshot.match_version;
              lastAdvance = Date.now();
            }
            expect(
              Date.now() - lastAdvance,
              `${game.name} must keep progressing through the client driver`,
            ).toBeLessThan(45000);
            const view = snapshot.game!;
            const ownUno = view.actions?.some((option) => option.action.type === 'uno');
            const gangWaiting =
              game.id === 'the-gang' &&
              view.phase === 'chips' &&
              !(view.detail?.pending_players as string[] | undefined)?.includes(identity);
            if (view.actions?.length && !gangWaiting && (!snapshot.bot_pending || ownUno)) {
              const wait = 365 - (Date.now() - lastMove);
              if (wait > 0) await page.waitForTimeout(wait);
              const response = await requestAs(page, `rooms/${roomId}/actions`, 'POST', {
                match_id: snapshot.match_id!,
                action_id: randomUUID(),
                expected_version: snapshot.match_version!,
                // Let the rummy opponent actually draw/discard before the
                // human's later legal drop ends this focused browser scenario.
                action:
                  game.id === 'teen-patti' && clientDrives() === 0
                    ? {
                        ...view.actions.find((option) => option.action.type === 'bet')!.action,
                        amount: view.actions.find((option) => option.action.type === 'bet')!
                          .minimum!,
                      }
                    : game.id === 'rummy' && humanMoves < 4
                      ? {
                          ...view.actions.find(
                            (option) =>
                              option.action.type ===
                              (view.phase === 'draw' ? 'draw_stock' : 'discard'),
                          )!.action,
                        }
                      : choose(view),
              } satisfies components['schemas']['Move']);
              // Another legal simultaneous/reaction decision can commit first.
              // A conflict refreshes this actor's view; it never replays blindly.
              expect(
                [200, 409],
                'Projected human move either commits or refreshes a stale version',
              ).toContain(response.status());
              if (response.ok()) {
                humanMoves++;
                lastMove = Date.now();
              }
              await refreshVisibleTab();
            } else await page.waitForTimeout(250);
            active = { game: game.id, humanMoves, version: snapshot.match_version };
          }
          expect(snapshot.status, `${game.name} must finish naturally`).toBe('finished');
          expect(snapshot.game?.actions).toHaveLength(0);
          expect(snapshot.game?.players.every((player) => Number.isFinite(player.score))).toBe(
            true,
          );
          if (botCount)
            await expect
              .poll(clientDrives, { message: 'The actual browser must have driven bot moves' })
              .toBeGreaterThan(0);
          const finishedId = snapshot.match_id;
          const saved = (await checked<Me>('me')).history.find((match) => match.id === finishedId);
          expect(Boolean(saved), 'Natural result is saved to the human profile').toBe(true);
          expect(saved?.game_id).toBe(game.id);
          expect(saved?.score).toBe(
            snapshot.game?.players.find((player) => player.id === identity)?.score,
          );
          expect([...saved!.winners].sort()).toEqual([...(snapshot.game?.winners || [])].sort());
          await refreshVisibleTab();
          await expect(page.locator('.results .scoreboard > div')).toHaveCount(game.min_players);
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          await page.goto('/profile');
          await expect(
            page.locator(`.history-row[href="/rooms/${roomId}"]`).first().locator('strong'),
          ).toHaveText(game.name);
          await page.goto(`/rooms/${roomId}`);
          await page.getByRole('button', { name: 'I’m ready', exact: true }).click();
          await expect(
            page.getByRole('button', { name: 'Start rematch', exact: true }),
          ).toBeEnabled();
          await page.getByRole('button', { name: 'Start rematch', exact: true }).click();
          await expect
            .poll(async () => (await roomAs(page, roomId)).match_id !== finishedId)
            .toBe(true);
          expect((await roomAs(page, roomId)).status).toBe('playing');
          await checked(`rooms/${roomId}/abandon`, 'POST');
          await page.reload();
          await page.getByRole('button', { name: 'Change game and settings', exact: true }).click();
          const next = catalogue.find(
            (candidate) => candidate.id === (game.id === 'uno' ? 'four-in-a-row' : 'uno'),
          )!;
          await page.getByRole('combobox', { name: 'The game', exact: true }).selectOption(next.id);
          await page
            .getByRole('combobox', { name: 'Seats', exact: true })
            .selectOption(String(Math.max(next.min_players, members.length)));
          await page.getByRole('button', { name: 'Choose game', exact: true }).click();
          await expect.poll(async () => (await roomAs(page, roomId)).game_id).toBe(next.id);
          const changed = await roomAs(page, roomId);
          expect(changed.status).toBe('lobby');
          expect(changed.members.map((member) => member.id).sort()).toEqual(members);
          summaries.push({
            game: game.id,
            seats: game.min_players,
            botCount,
            humanMoves,
            finalVersion: snapshot.match_version!,
            clientDrives: clientDrives(),
            result: true,
            history: true,
            profile: true,
            rematch: true,
            switch: true,
            roomClosed: false,
          });
          active = null;
          await run.record();
          console.log(JSON.stringify(summaries.at(-1)));
        } finally {
          await run.record();
        }
      });
    }
    expect(summaries.length).toBe(filter?.length || 25);
    run.complete = true;
  } catch (error) {
    failure = error instanceof Error ? error.name : 'Unknown failure';
    throw error;
  } finally {
    if (groupRoomId && run.rooms.has(groupRoomId)) {
      await run.close(groupRoomId);
      for (const summary of summaries) summary.roomClosed = true;
    }
    await page.context().setOffline(false);
    await run.record();
  }
});
