import { expect, test, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import type { components } from '../../packages/api-client/src/generated/schema';
import {
  attachPreviewAccess,
  requestAs,
  roomAs,
  TestTransportError,
  transportTelemetry,
  type RoomView,
} from './helpers';
import { matchPlayer } from './fullmatch-player';

// Explicit long-running acceptance, separate from quick UI regressions. Decisions
// are API-driven from authorized player views; results/rematch/switch are rendered
// and clicked in real independent phone/desktop browser sessions.
test.skip(process.env.GAMES_FULL_MATCHES !== '1', 'Set GAMES_FULL_MATCHES=1 for full matches.');
test.use({ trace: 'off', screenshot: 'off' });

test('every game finishes at both seat limits, renders results, rematches and keeps the group', async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(40 * 60 * 1000);
  // A long match must not turn an obscured UI control into a forty-minute wait.
  page.setDefaultTimeout(15000);
  const contexts = [];
  const players: Page[] = [page];
  let roomId: string | undefined;
  let heartbeatAt = 0;
  const lastMove = new Map<Page, number>();
  const summaries: {
    game: string;
    seats: number;
    moves: number;
    profileHistoryVerified: boolean;
    rematch: boolean;
    midgameChecks: { phase: string; action: string; version: number; selectionStable: boolean }[];
  }[] = [];
  const filter = process.env.GAMES_FULL_MATCH_GAME?.split(',').filter(Boolean);
  const seatFilter = process.env.GAMES_FULL_MATCH_SEATS?.split(',').map(Number);
  if (seatFilter?.some((seats) => !Number.isInteger(seats) || seats < 1))
    throw new Error('Full-match seat filters must be positive integers.');
  const startedAt = new Date().toISOString();
  const origin = new URL(baseURL!).origin;
  const checkoutSha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const workspaceDirty = Boolean(
    execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim(),
  );
  const applicationSourceSha =
    process.env.GAMES_RELEASE_SHA || (workspaceDirty ? null : checkoutSha);
  const project = test.info().project.name;
  const evidence = `.vercel/fullmatches-${project}-${(filter?.join('_') || 'all').replace(/[^a-z0-9_-]/g, '_')}${seatFilter ? '-seats' + seatFilter.join('_') : ''}.json`;
  const omitted: string[] = [];
  let active: {
    game: string;
    seats: number;
    moves?: number;
    naturalResultVerified?: boolean;
    historyVerified?: boolean;
    profileHistoryVerified?: boolean;
    renderedResultsVerified?: boolean;
  } | null = null;
  let complete = false;
  let failureType: string | undefined;
  let failureReason: string | undefined;
  const cleanup: {
    abandonStatus?: number;
    guestLeaveStatuses: number[];
    hostLeaveStatus?: number;
    roomClosed: boolean;
    failed: boolean;
  } = { guestLeaveStatuses: [], roomClosed: false, failed: false };
  async function record() {
    await mkdir('.vercel', { recursive: true });
    await writeFile(
      evidence,
      JSON.stringify(
        {
          startedAt,
          origin,
          checkoutSha,
          applicationSourceSha,
          workspaceDirty,
          sourceState: process.env.GAMES_RELEASE_SHA
            ? 'explicit serving revision'
            : workspaceDirty
              ? 'uncommitted local workspace'
              : 'clean checkout',
          hosted: Boolean(process.env.GAMES_TEST_URL),
          project,
          selectedGames: filter || 'all',
          selectedSeats: seatFilter || 'limits',
          aiEnabled: process.env.GAMES_TEST_AI === '1',
          complete,
          active,
          omitted,
          failureType,
          failureReason,
          transport: transportTelemetry(),
          cleanup,
          cases: summaries,
          decisions:
            'Authorized API projections; rendered result/rematch/change-game controls; optional GAMES_MIDGAME=1 adds refreshed mid-game layout/selection checks.',
          rummyScenario: 'Legal drops; declaration/sequences are independently engine-tested.',
        },
        null,
        2,
      ) + '\n',
      { mode: 0o600 },
    );
  }
  async function checked(player: Page, path: string, method = 'POST', data?: unknown) {
    const response = await requestAs(player, path, method, data);
    const operation =
      path.startsWith('rooms/') && path.split('/').length === 2
        ? 'room snapshot'
        : path.split('/').at(-1);
    expect(response.status(), `${method} ${operation} must succeed`).toBeLessThan(300);
    return response.json();
  }
  async function heartbeats() {
    await Promise.all(players.map((p) => checked(p, `rooms/${roomId}/heartbeat`)));
    heartbeatAt = Date.now();
  }
  try {
    await attachPreviewAccess(page);
    page.setDefaultNavigationTimeout(30000);
    await page.goto('/');
    const catalogue: components['schemas']['GameManifest'][] = await checked(page, 'games', 'GET');
    if (filter?.some((id) => !catalogue.some((game) => game.id === id)))
      throw new Error('The full-match filter contains an unavailable game.');
    // Create only the identities required by the selected acceptance cases.
    const selected = catalogue.filter((game) => !filter || filter.includes(game.id));
    const requiredSeats = selected.flatMap((game) =>
      [...new Set([game.min_players, game.max_players])].filter(
        (seats) => !seatFilter || seatFilter.includes(seats),
      ),
    );
    if (!requiredSeats.length) throw new Error('No selected seat-limit case can run.');
    const maxSeats = Math.max(...requiredSeats);
    const initialGame = selected.find(
      (game) => game.min_players <= maxSeats && game.max_players >= maxSeats,
    )!;
    await page
      .getByRole('button', { name: `Create ${initialGame.name} room`, exact: true })
      .click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Full Match Host');
    await page
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill('Acceptance full matches');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption(String(maxSeats));
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/, { timeout: 45000 });
    roomId = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = maxSeats > 1 ? await page.locator('.room-code').innerText() : '';
    for (let seat = 1; seat < maxSeats; seat++) {
      const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
      context.setDefaultTimeout(15000);
      contexts.push(context);
      const friend = await context.newPage();
      friend.setDefaultNavigationTimeout(30000);
      players.push(friend);
      await attachPreviewAccess(friend);
      await friend.goto('/');
      await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
      await friend
        .getByRole('textbox', { name: 'Your name', exact: true })
        .fill(`Full Match Friend ${seat}`);
      await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
      await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
      await expect(friend).toHaveURL(page.url(), { timeout: 45000 });
    }
    const identities: string[] = await Promise.all(
      players.map(async (player) => (await checked(player, 'me', 'GET')).profile.id),
    );
    const playerById = new Map(identities.map((id, index) => [id, players[index]]));
    // Solo Tarot creation starts immediately; configure the controlled match
    // below from the lobby just as with the other initial-game choices.
    if ((await roomAs(page, roomId!)).status === 'playing')
      await checked(page, `rooms/${roomId}/abandon`);
    for (const [index, game] of catalogue.entries()) {
      if (filter && !filter.includes(game.id)) continue;
      if (game.id === 'tarot' && process.env.GAMES_TEST_AI !== '1') {
        omitted.push(game.id);
        console.log('Full-match Tarot generation omitted: GAMES_TEST_AI=1 is required.');
        continue;
      }
      for (const seats of new Set([game.min_players, game.max_players])) {
        if (seatFilter && !seatFilter.includes(seats)) continue;
        await test.step(`${game.name}: ${seats} seats`, async () => {
          const choose = matchPlayer();
          active = { game: game.id, seats };
          await record();
          let snapshot: RoomView = await checked(page, `rooms/${roomId}/settings`, 'PUT', {
            game_id: game.id,
            capacity: seats,
            settings: {},
          });
          await heartbeats();
          for (const member of snapshot.members.filter((member) => member.seated))
            await checked(playerById.get(member.id)!, `rooms/${roomId}/ready`, 'PUT', {
              ready: true,
            });
          snapshot = await checked(page, `rooms/${roomId}/start`);
          await page.reload();
          await expect(page.locator('.table-announcement')).toBeVisible();
          let moves = 0;
          const midgameChecks: {
            phase: string;
            action: string;
            version: number;
            selectionStable: boolean;
          }[] = [];
          const sampled = new Set<string>();
          let tarotReadingText: string | undefined;
          while (snapshot.status === 'playing' && moves < 3000) {
            if (Date.now() - heartbeatAt > 10000) await heartbeats();
            if (game.id === 'tarot' && snapshot.game?.phase === 'reading') {
              await page.reload();
              const submit = page.getByRole('button', { name: 'Read my cards', exact: true });
              await expect(submit).toBeEnabled();
              await submit.click();
              await expect(page.locator('.tarot-reading')).toBeVisible({ timeout: 74000 });
              await expect(
                page.getByRole('heading', { name: 'The grounded read', exact: true }),
              ).toHaveCount(3);
              await expect(
                page.getByRole('heading', { name: 'The plot twist', exact: true }),
              ).toHaveCount(3);
              await expect(page.locator('.tarot-character-connections')).toHaveCount(3);
              for (const connections of await page.locator('.tarot-character-connections').all()) {
                const count = await connections.getByRole('listitem').count();
                expect(count).toBeGreaterThanOrEqual(1);
                expect(count).toBeLessThanOrEqual(2);
                await expect(connections.locator('.tarot-character-portrait img')).toHaveCount(
                  count,
                );
                for (const image of await connections
                  .locator('.tarot-character-portrait img')
                  .all()) {
                  await image.scrollIntoViewIfNeeded();
                  await expect
                    .poll(() =>
                      image.evaluate((node) => {
                        const photo = node as HTMLImageElement;
                        return photo.complete && photo.naturalWidth > 0;
                      }),
                    )
                    .toBe(true);
                }
              }
              await expect(page.locator('.tarot-image-credits summary')).toHaveText(
                'Image credits',
              );
              tarotReadingText = await page.locator('.tarot-reading').innerText();
              snapshot = await roomAs(page, roomId!);
              break;
            }
            const actor = playerById.get(snapshot.game!.current_player!)!;
            expect(
              Boolean(actor),
              'Every current actor belongs to this independent test group',
            ).toBe(true);
            // Respect production's 180 moves/minute/player limit without weakening it.
            const wait = 365 - (Date.now() - (lastMove.get(actor) || 0));
            if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
            const view = await roomAs(actor, roomId!);
            let selectedAction = choose(view.game!);
            // The ordinary acceptance driver eventually drops in Rummy. First
            // exercise saved draw/discard turns and the fourteen-card workspace.
            if (process.env.GAMES_MIDGAME === '1' && game.id === 'rummy' && moves < seats * 2) {
              selectedAction =
                view.game!.actions.find((option) =>
                  ['draw_stock', 'discard'].includes(option.action.type),
                )?.action || selectedAction;
            }
            const critical = new Set([
              'pay',
              'no',
              'split',
              'double',
              'insurance',
              'sideshow',
              'swap',
              'declare',
              'graduate',
              'promote',
              'place',
              'choose',
              'steal',
            ]);
            const sampleKey = critical.has(selectedAction.type)
              ? `${view.game!.phase}:${selectedAction.type}`
              : view.game!.phase;
            if (
              process.env.GAMES_MIDGAME === '1' &&
              moves >= 2 &&
              !sampled.has(sampleKey) &&
              midgameChecks.length < 8
            ) {
              sampled.add(sampleKey);
              await actor.reload();
              await expect(actor.locator('.table-layout,.tarot-table').first()).toBeVisible();
              await actor.evaluate(() => document.fonts.ready);
              expect(
                await actor.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
              ).toBe(true);
              let selectionStable = false;
              if (
                [
                  'uno',
                  'uno-no-mercy',
                  'deal',
                  'deal-no-mercy',
                  'rummy',
                  'shithead',
                  'six-nimmt',
                ].includes(game.id)
              ) {
                const selectable = actor.locator('.card-hand > button:not(:disabled)').first();
                if (await selectable.count()) {
                  const handPosition = () =>
                    selectable.evaluate((node) => {
                      const rail = node.closest('.hand-rail,.hand-scroll')!;
                      const table = node.closest('.table-layout')!;
                      return {
                        hand: rail.getBoundingClientRect().top + scrollY,
                        table: table.getBoundingClientRect().top + scrollY,
                      };
                    });
                  const before = await handPosition();
                  await selectable.focus();
                  await selectable.press('Space');
                  await expect(selectable).toHaveAttribute('aria-pressed', 'true');
                  const after = await handPosition();
                  expect(
                    Math.abs(after.hand - before.hand),
                    `${game.name}: selection must keep its hand in place`,
                  ).toBeLessThanOrEqual(2);
                  expect(
                    Math.abs(after.table - before.table),
                    `${game.name}: selection must keep its table in place`,
                  ).toBeLessThanOrEqual(2);
                  selectionStable = true;
                  // The modeless move panel can cover the phone command bar.
                  // Dismiss it through the same keyboard control a player uses
                  // before clearing this temporary inspection selection.
                  const movePanel = actor.locator('.table-decision-panel');
                  if (await movePanel.count()) {
                    await actor.keyboard.press('Escape');
                    await expect(movePanel).toHaveCount(0);
                  }
                  const clear = actor
                    .getByRole('button', { name: /^(Clear card selection|Clear selection)$/ })
                    .first();
                  if (await clear.count()) await clear.click();
                }
              }
              midgameChecks.push({
                phase: view.game!.phase,
                action: selectedAction.type,
                version: view.match_version!,
                selectionStable,
              });
            }
            snapshot = await checked(actor, `rooms/${roomId}/actions`, 'POST', {
              match_id: view.match_id,
              action_id: randomUUID(),
              expected_version: view.match_version,
              action: selectedAction,
            });
            lastMove.set(actor, Date.now());
            moves++;
          }
          expect(
            snapshot.status,
            `${game.name} must reach its natural result within the move bound`,
          ).toBe('finished');
          expect(snapshot.game?.players.every((player) => Number.isFinite(player.score))).toBe(
            true,
          );
          expect(snapshot.game?.actions).toHaveLength(0);
          const finishedId = snapshot.match_id;
          const me: components['schemas']['MeView'] = await checked(page, 'me', 'GET');
          const savedResult = me.history.find((match) => match.id === finishedId);
          expect(
            Boolean(savedResult),
            'A naturally finished match must appear in saved history',
          ).toBe(true);
          expect(savedResult?.score).toBe(
            snapshot.game?.players.find((player) => player.id === identities[0])?.score,
          );
          expect(savedResult?.game_id).toBe(game.id);
          const winners = snapshot.game?.winners || [];
          expect(
            savedResult?.winners.length === winners.length &&
              savedResult.winners.every((id) => winners.includes(id)),
          ).toBe(true);
          active = { ...active!, moves, naturalResultVerified: true, historyVerified: true };
          await record();

          // Compare the actual saved result with rendered profile history. Use
          // the server catalogue's semantics, never the frontend formatter.
          const roomURL = page.url();
          await page.goto('/profile');
          const historyRow = page.locator(`.history-row[href="/rooms/${roomId}"]`).first();
          await expect(historyRow.locator('strong')).toHaveText(game.name);
          const historyOutcome = historyRow.locator(':scope > span');
          const won = savedResult!.winners.includes(identities[0]);
          const scoreOrder = game.score_order || 'high';
          const units = (game.score_label || 'Points').toLocaleLowerCase();
          if (game.id === 'tarot') {
            await expect(historyOutcome).toHaveText('A little perspective');
          } else if (game.play_mode === 'cooperative') {
            await expect(historyOutcome).toContainText(won ? 'You won together' : 'Team defeat');
            if (scoreOrder !== 'none')
              await expect(historyOutcome).toContainText(`${savedResult!.score} ${units}`);
          } else if (won) {
            await expect(historyOutcome).toHaveText('You won ✦');
          } else if (scoreOrder === 'none') {
            await expect(historyOutcome).toHaveText('Match finished');
          } else {
            await expect(historyOutcome).toHaveText(`${savedResult!.score} ${units}`);
          }
          if (scoreOrder === 'none') await expect(historyOutcome).not.toContainText('0 points');
          active.profileHistoryVerified = true;
          await record();
          await page.goto(roomURL);
          await page.reload();
          if (game.id === 'tarot') {
            await expect(page.locator('.tarot-reading')).toBeVisible();
            await expect(page.locator('.tarot-reading')).toHaveText(tarotReadingText!, {
              useInnerText: true,
            });
          } else {
            await expect(page.locator('.results .scoreboard > div')).toHaveCount(seats);
            if (seats > 1) {
              await players[1].reload();
              await expect(players[1].locator('.results .scoreboard > div')).toHaveCount(seats);
            }
          }
          expect(
            await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
          ).toBe(true);
          active.renderedResultsVerified = true;
          await record();
          await heartbeats();
          for (const member of snapshot.members.filter(
            (member) => member.seated && member.id !== identities[0],
          ))
            await checked(playerById.get(member.id)!, `rooms/${roomId}/ready`, 'PUT', {
              ready: true,
            });
          await page.getByRole('button', { name: 'I’m ready', exact: true }).click();
          await expect(
            page.getByRole('button', { name: 'Start rematch', exact: true }),
          ).toBeEnabled();
          await page.getByRole('button', { name: 'Start rematch', exact: true }).click();
          await expect
            .poll(async () => (await roomAs(page, roomId!)).match_id !== finishedId)
            .toBe(true);
          expect((await roomAs(page, roomId!)).status).toBe('playing');
          // End only this newly started verification rematch, then use the actual
          // change-game sheet to prove the same group can continue together.
          await checked(page, `rooms/${roomId}/abandon`);
          await page.reload();
          await page.getByRole('button', { name: 'Change game and settings', exact: true }).click();
          const next = catalogue[(index + 1) % catalogue.length];
          await page.getByRole('combobox', { name: 'The game', exact: true }).selectOption(next.id);
          await page
            .getByRole('combobox', { name: 'Seats', exact: true })
            .selectOption(String(next.min_players));
          await page.getByRole('button', { name: 'Choose game', exact: true }).click();
          await expect.poll(async () => (await roomAs(page, roomId!)).game_id).toBe(next.id);
          const changed = await roomAs(page, roomId!);
          expect(changed.members.length).toBe(maxSeats);
          expect(changed.members.every((member) => playerById.has(member.id))).toBe(true);
          summaries.push({
            game: game.id,
            seats,
            moves,
            profileHistoryVerified: true,
            rematch: true,
            midgameChecks,
          });
          active = null;
          await record();
          console.log(JSON.stringify(summaries.at(-1)));
        });
      }
    }
    if (!summaries.length)
      throw new Error('No full-match case ran; Tarot requires GAMES_TEST_AI=1.');
    complete = true;
  } catch (error) {
    failureType = error instanceof Error ? error.name : 'Unknown failure';
    failureReason = error instanceof TestTransportError ? error.reason : undefined;
    throw error;
  } finally {
    try {
      if (roomId) {
        // Only task-owned memberships are closed; source/history/database rows stay.
        try {
          cleanup.abandonStatus = (
            await requestAs(page, `rooms/${roomId}/abandon`, 'POST')
          ).status();
          cleanup.failed ||= cleanup.abandonStatus !== 200;
        } catch {
          cleanup.failed = true;
        }
        for (const friend of players.slice(1)) {
          try {
            const status = (await requestAs(friend, `rooms/${roomId}/leave`, 'POST')).status();
            cleanup.guestLeaveStatuses.push(status);
            // A failed bootstrap can have a context that never joined.
            cleanup.failed ||= status !== 200 && status !== 404;
          } catch {
            cleanup.failed = true;
          }
        }
        try {
          const left = await requestAs(page, `rooms/${roomId}/leave`, 'POST');
          cleanup.hostLeaveStatus = left.status();
          cleanup.roomClosed = left.ok() && (await left.json()).status === 'closed';
          cleanup.failed ||= !cleanup.roomClosed;
        } catch {
          cleanup.failed = true;
        }
      }
      if (cleanup.failed) complete = false;
    } finally {
      try {
        await record();
      } finally {
        await Promise.all(contexts.map((context) => context.close()));
      }
    }
    if (!failureType)
      expect(cleanup.failed, 'Task-owned room memberships must be closed').toBe(false);
  }
});
