import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { openGameSetup, openRoomOptions, requestAs, roomAs, type RoomView } from './helpers';

/**
 * Housie at a real table: two people in separate browsers call, mark by hand and
 * claim, and one person plays a whole match against a bot. Every room created
 * here is closed again, also when a step fails.
 */
type Owned = { id?: string; players: Page[]; contexts: BrowserContext[] };
const owned = new WeakMap<Page, Owned>();

test.use({ trace: 'off', screenshot: 'off' });

test.afterEach(async ({ page }) => {
  test.setTimeout(60000);
  const run = owned.get(page);
  if (!run) return;
  try {
    if (run.id) {
      const response = await requestAs(page, `rooms/${run.id}`);
      if (response.status() !== 404) {
        expect(response.status()).toBe(200);
        if (((await response.json()) as RoomView).status === 'playing')
          expect((await requestAs(page, `rooms/${run.id}/abandon`, 'POST')).status()).toBe(200);
        for (const actor of run.players)
          expect([200, 404]).toContain(
            (await requestAs(actor, `rooms/${run.id}/leave`, 'POST')).status(),
          );
        expect((await requestAs(page, `rooms/${run.id}`)).status()).toBe(404);
      }
    }
  } finally {
    for (const context of run.contexts) await context.close();
  }
});

const detailKeys = [
  'auto_mark',
  'called',
  'claimable',
  'last_called',
  'marked',
  'prizes',
  'ticket',
].sort();

const numbersOf = (ticket: (number | null)[][]) =>
  ticket.flat().filter((value): value is number => value !== null);

async function shownTicket(actor: Page) {
  return (
    await actor
      .locator('.housie-ticket [data-housie-number]')
      .evaluateAll((cells) => cells.map((cell) => Number(cell.getAttribute('data-housie-number'))))
  ).sort((a, b) => a - b);
}

test('two friends call, mark by hand and claim while the other player calls', async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(420000);
  const run: Owned = { players: [page], contexts: [] };
  owned.set(page, run);
  await page.goto('/');
  await openGameSetup(page, 'housie');
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Caller Ada');
  await openRoomOptions(page);
  const autoMark = page.getByRole('checkbox', { name: 'Mark called numbers for me', exact: true });
  await expect(autoMark).toBeChecked();
  await autoMark.uncheck();
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
  run.id = new URL(page.url()).pathname.split('/').at(-1)!;
  const roomId = run.id;
  const code = await page.locator('.room-code').innerText();
  const use = test.info().project.use;
  const context = await browser.newContext({
    baseURL,
    viewport: page.viewportSize()!,
    userAgent: use.userAgent,
    deviceScaleFactor: use.deviceScaleFactor,
    isMobile: use.isMobile,
    hasTouch: use.hasTouch,
  });
  run.contexts.push(context);
  const friend = await context.newPage();
  run.players.push(friend);
  await friend.goto('/');
  await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
  await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Friend Ben');
  await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
  await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
  await expect(friend).toHaveURL(page.url());
  const players = [page, friend];
  for (const actor of players)
    expect((await requestAs(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true })).status()).toBe(
      200,
    );
  expect((await requestAs(page, `rooms/${roomId}/start`, 'POST')).status()).toBe(200);
  await Promise.all(players.map((actor) => actor.reload()));
  const ids = await Promise.all(
    players.map(async (actor) => (await (await requestAs(actor, 'me')).json()).profile.id),
  );
  const byId = new Map(ids.map((id, index) => [id, players[index]]));
  const views = await Promise.all(players.map((actor) => roomAs(actor, roomId)));
  const tickets = views.map((view) => view.game!.detail.ticket as (number | null)[][]);
  expect(views[0].settings).toMatchObject({ auto_mark: false });

  /** Each viewer's JSON and screen hold their own ticket and the called numbers only. */
  async function checkSecrecy() {
    for (const [index, actor] of players.entries()) {
      const view = await roomAs(actor, roomId);
      const json = JSON.stringify(view);
      const detail = view.game!.detail;
      expect(Object.keys(detail).sort()).toEqual(detailKeys);
      expect(json).not.toMatch(/"(bag|tickets|order|seed)"/);
      const other = tickets[1 - index];
      for (const row of other) expect(json).not.toContain(JSON.stringify(row));
      expect(detail.ticket).toEqual(tickets[index]);
      await expect(actor.locator('.housie-ticket [data-housie-number]')).toHaveCount(15);
      expect(await shownTicket(actor)).toEqual(numbersOf(tickets[index]).sort((a, b) => a - b));
      // Numbers only on the other ticket never appear on this player's ticket.
      const mine = new Set(numbersOf(tickets[index]));
      const ticketText = await actor.locator('.housie-ticket').innerText();
      const shown = new Set((ticketText.match(/\d+/g) ?? []).map(Number));
      for (const number of numbersOf(other))
        if (!mine.has(number)) expect(shown.has(number)).toBe(false);
      // The 1–90 board marks exactly the numbers called so far, nothing about the rest.
      const board = await actor
        .locator('.housie-board__grid li[data-called]')
        .evaluateAll((items) => items.map((item) => Number(item.textContent?.match(/\d+/)?.[0])));
      expect(board.sort((a, b) => a - b)).toEqual(
        [...(detail.called as number[])].sort((a, b) => a - b),
      );
    }
  }

  await checkSecrecy();
  let tapped = false;
  let offTurnClaim: string | null = null;
  let calls = 0;
  while (!offTurnClaim && calls < 90) {
    // The caller calls through the table.
    let view = await roomAs(page, roomId);
    const callerId = view.game!.current_player!;
    const caller = byId.get(callerId)!;
    const before = await Promise.all(players.map((actor) => actor.content()));
    await caller.reload();
    await caller.getByRole('button', { name: 'Call the next number', exact: true }).click();
    calls++;
    await expect
      .poll(async () => ((await roomAs(page, roomId)).game!.detail.called as number[]).length)
      .toBe(calls);
    view = await roomAs(page, roomId);
    const number = view.game!.detail.last_called as number;
    // Before it was called, nothing on either screen singled this number out.
    for (const html of before) {
      expect(html).not.toContain(`housie-ball__number">${number}<`);
      expect(html).not.toMatch(new RegExp(`data-called="true"[^>]*>${number}<`));
    }
    for (const [index, actor] of players.entries()) {
      await actor.reload();
      await expect(actor.locator('.housie-ball__number')).toHaveText(String(number));
      // Auto-mark is off: a called number on your own ticket waits for you.
      if (numbersOf(tickets[index]).includes(number)) {
        const cell = actor.locator(`.housie-cell[data-housie-number="${number}"]`);
        await expect(cell).toHaveAttribute('data-called', 'true');
        await expect(cell).not.toHaveAttribute('data-marked', 'true');
        if (!tapped) {
          await cell.click();
          tapped = true;
        } else {
          await actor.getByRole('button', { name: `Mark ${number}`, exact: true }).click();
        }
        await expect
          .poll(async () => (await roomAs(actor, roomId)).game!.detail.marked as number[])
          .toContain(number);
        await actor.reload();
        await expect(cell).toHaveAttribute('data-marked', 'true');
      }
    }
    // A claim belongs to whoever has it, whether or not it is their turn to call.
    const current = (await roomAs(page, roomId)).game!.current_player;
    for (const [index, actor] of players.entries()) {
      const own = await roomAs(actor, roomId);
      const claim = own.game!.actions.find((option) => option.action.type === 'claim');
      if (!claim || ids[index] === current) continue;
      await actor.reload();
      const button = actor.getByRole('button', { name: claim.label, exact: true });
      await expect(button).toBeVisible();
      await button.click();
      await expect
        .poll(async () => {
          const prizes = (await roomAs(actor, roomId)).game!.detail.prizes as {
            key: string;
            winners: string[];
          }[];
          return prizes.find((prize) => prize.key === claim.action.choice)!.winners;
        })
        .toContain(ids[index]);
      offTurnClaim = claim.action.choice!;
      await actor.reload();
      await expect(
        actor.locator(`.housie-prize[data-prize="${offTurnClaim}"]`).getByText(/You/),
      ).toBeVisible();
      await actor
        .locator('.housie-game')
        .screenshot({ path: test.info().outputPath('housie-two-player-claim.png') });
      break;
    }
    if (calls % 6 === 0) await checkSecrecy();
  }
  expect(tapped, 'A number was marked by tapping the ticket').toBe(true);
  expect(offTurnClaim, 'A prize was claimed by the player who was not calling').toBeTruthy();
  await checkSecrecy();
});

test('one person plays Housie against a bot to the end', async ({ page }) => {
  test.setTimeout(480000);
  const run: Owned = { players: [page], contexts: [] };
  owned.set(page, run);
  await page.goto('/');
  await openGameSetup(page, 'housie');
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Solo Caller');
  await page
    .getByRole('group', { name: 'Play with', exact: true })
    .getByRole('button', { name: 'Bots', exact: true })
    .click();
  await page.getByRole('button', { name: 'Play game', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/, { timeout: 45000 });
  run.id = new URL(page.url()).pathname.split('/').at(-1)!;
  const roomId = run.id;
  const selfId = (await (await requestAs(page, 'me')).json()).profile.id as string;
  let snapshot = await roomAs(page, roomId);
  expect(snapshot.members.filter((member) => member.is_bot)).toHaveLength(1);
  let lastVersion = snapshot.match_version;
  let lastChange = Date.now();
  let moves = 0;
  while (snapshot.status === 'playing') {
    snapshot = await roomAs(page, roomId);
    if (snapshot.status !== 'playing') break;
    if (snapshot.match_version !== lastVersion) {
      lastVersion = snapshot.match_version;
      lastChange = Date.now();
    }
    expect(Date.now() - lastChange, 'The match keeps moving').toBeLessThan(45000);
    const actions = snapshot.game!.actions;
    const claim = actions.find((option) => option.action.type === 'claim');
    const call = actions.find((option) => option.action.type === 'call_number');
    const option = claim ?? call;
    if (!option || snapshot.bot_pending) {
      await page.waitForTimeout(400);
      continue;
    }
    const button = page.getByRole('button', { name: option.label, exact: true });
    try {
      await expect(button).toBeEnabled({ timeout: 4000 });
    } catch {
      // The table refreshes on its own; a reload catches a missed update.
      await page.reload();
      continue;
    }
    const version = snapshot.match_version!;
    await button.click();
    moves++;
    await expect
      .poll(async () => (await roomAs(page, roomId)).match_version ?? 0, { timeout: 20000 })
      .toBeGreaterThan(version);
  }
  expect(moves).toBeGreaterThan(5);
  const final = await roomAs(page, roomId);
  expect(final.status).toBe('finished');
  const prizes = final.game!.detail.prizes as { key: string; winners: string[] }[];
  expect(prizes.find((prize) => prize.key === 'full_house')!.winners.length).toBeGreaterThan(0);
  expect(final.game!.winners.length).toBeGreaterThan(0);
  await page.reload();
  await expect(page.locator('.housie-game[data-phase="finished"]')).toBeVisible();
  await expect(
    page.locator('.housie-prize[data-prize="full_house"]').getByText(/^Won by /),
  ).toBeVisible();
  // Final scores are the server's: each seat's caption carries its points.
  for (const player of final.game!.players)
    await expect(
      page
        .locator(`[data-player="${player.id}"]`)
        .getByText(
          `${player.count} marked · ${player.score} ${player.score === 1 ? 'point' : 'points'}`,
        ),
    ).toBeVisible();
  expect(final.game!.players.some((player) => player.id === selfId)).toBe(true);
  await page
    .locator('.housie-game')
    .screenshot({ path: test.info().outputPath('housie-finished.png') });
});
