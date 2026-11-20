import { expect, test, type Page } from '@playwright/test';
import { rouletteDetails, slotsDetails } from '../../packages/api-client/src/chance-details';
import { attachPreviewAccess, requestAs, roomAs, type RoomView } from './helpers';

type Game = 'roulette' | 'slots';
type Owned = { page: Page; id: string };
const red = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
const triples: Record<string, number> = { seven: 100, star: 15, bell: 12, lemon: 8, cherry: 5 };
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

async function launch(page: Page, game: Game, owned: Owned[], tutorial = false) {
  await page.goto('/games/' + game);
  if (tutorial) {
    await page.getByRole('button', { name: 'Rules & tutorial', exact: true }).click();
    await expect(page.getByRole('article', { name: /rulebook/ }).getByRole('img')).toHaveCount(3);
  }
  const created = page.waitForResponse(
    (r) =>
      r.request().method() === 'POST' &&
      new URL(r.url()).pathname.endsWith('/games/' + game + '/play'),
  );
  await page
    .getByRole('button', { name: tutorial ? 'Play tutorial' : 'Play solo', exact: true })
    .click();
  const response = await created;
  expect(response.status()).toBe(200);
  const room = (await response.json()) as RoomView;
  owned.push({ page, id: room.id });
  await expect(page).toHaveURL((url) => url.pathname === '/games/' + game + '/play/' + room.id);
  expect(room.game!.detail.history).toEqual([]);
  expect(room.game!.players[0].chips).toBe(100);
  expect(room.members).toHaveLength(1);
  await expect(page.getByRole('region', { name: 'Tutorial coach' })).toHaveCount(tutorial ? 1 : 0);
  return room;
}

async function close(owned: Owned) {
  const { page, id } = owned;
  const current = await requestAs(page, 'rooms/' + id);
  if (current.status() === 404) return;
  expect(current.status()).toBe(200);
  if ((await current.json()).status === 'playing')
    expect((await requestAs(page, 'rooms/' + id + '/abandon', 'POST')).status()).toBe(200);
  expect((await requestAs(page, 'rooms/' + id + '/leave', 'POST')).status()).toBe(200);
  expect((await requestAs(page, 'rooms/' + id)).status()).toBe(404);
}

async function spin(page: Page, room: RoomView) {
  const saved = page.waitForResponse(
    (r) =>
      r.request().method() === 'POST' &&
      new URL(r.url()).pathname.endsWith('/rooms/' + room.id + '/actions'),
  );
  await page.getByRole('button', { name: 'Spin', exact: true }).click();
  const response = await saved;
  expect(response.status()).toBe(200);
  const after = (await response.json()) as RoomView;
  expect(after.match_id).toBe(room.match_id);
  expect(after.match_version).toBe(room.match_version! + 1);
  return after;
}

async function fits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const wager = page.getByRole('button', { name: 'Spin', exact: true });
  if (await wager.count()) {
    const box = await wager.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  }
}

function verifySettlement(
  game: Game,
  room: RoomView,
  stake: number,
  choice: string,
  previous: number,
  i: number,
) {
  const view = room.game!;
  let actual;
  let expected;
  if (game === 'roulette') {
    const detail = rouletteDetails(view.detail);
    actual = detail.history.at(-1)!;
    const expectedColor = actual.pocket === 0 ? 'green' : red.has(actual.pocket) ? 'red' : 'black';
    expect(actual.color).toBe(expectedColor);
    expect(actual.choice).toBe(choice);
    expected =
      choice === 'red'
        ? expectedColor === 'red'
          ? 2
          : 0
        : Number(choice) === actual.pocket
          ? 36
          : 0;
  } else {
    const detail = slotsDetails(view.detail);
    actual = detail.history.at(-1)!;
    const symbols = actual.reels;
    expected =
      new Set(symbols).size === 1
        ? triples[symbols[0]]
        : symbols.filter((s) => s === 'cherry').length === 2
          ? 2
          : 0;
    expect(actual.multiplier).toBe(expected);
    expect(detail.winning_outcomes).toBe(492);
    expect(detail.return_numerator / detail.total_outcomes).toBe(0.9375);
  }
  expect(actual).toMatchObject({
    spin: i,
    stake,
    payout: stake * expected,
    net: stake * (expected - 1),
    balance: previous + stake * (expected - 1),
  });
  expect(view.players[0].chips).toBe(actual.balance);
  expect(view.players[0].score).toBe(actual.balance - 100);
  expect(view.detail.history).toHaveLength(i);
  expect(view.detail.spins_remaining).toBe(5 - i);
  expect(Object.keys(view.detail).sort()).toEqual(
    (game === 'slots'
      ? [
          'chips',
          'history',
          'paytable',
          'return_numerator',
          'spin_limit',
          'spins_remaining',
          'starting_chips',
          'total_outcomes',
          'winning_outcomes',
        ]
      : ['history', 'spin_limit', 'spins_remaining']
    ).sort(),
  );
  return actual;
}

for (const game of ['roulette', 'slots'] as const) {
  test(
    game + ' plays five mobile spins and reopens the exact previous session from history',
    async ({ page, browser, baseURL }, info) => {
      test.skip(info.project.name !== 'phone', 'This case exercises a 320px touch viewport.');
      test.skip(
        Boolean(process.env.GAMES_TEST_URL) && process.env.GAMES_CHANCE_LIVE !== '1',
        'Set GAMES_CHANCE_LIVE=1 to create hosted QA sessions.',
      );
      test.setTimeout(200000);
      const otherContext = await browser.newContext({
        baseURL,
        viewport: { width: 320, height: 640 },
        hasTouch: true,
        reducedMotion: 'reduce',
      });
      const other = await otherContext.newPage();
      const owned: Owned[] = [];
      try {
        await Promise.all([
          attachPreviewAccess(page),
          attachPreviewAccess(other),
          page.setViewportSize({ width: 320, height: 640 }),
        ]);
        let room = await launch(page, game, owned);
        const originalId = room.match_id!;
        let submitted = 0;
        page.on('request', (r) => {
          if (
            r.method() === 'POST' &&
            new URL(r.url()).pathname.endsWith('/rooms/' + room.id + '/actions')
          )
            submitted++;
        });
        const archive = 'chance-sessions/' + originalId;
        let tutorial = await launch(other, game, owned, true);
        for (let i = 0; i < 2; i++) {
          const coach = other.getByRole('region', { name: 'Tutorial coach' });
          await expect(coach).toBeVisible();
          if (game === 'roulette')
            await other.getByRole('button', { name: 'Red', exact: true }).click();
          tutorial = await spin(other, tutorial);
          await expect(coach.locator('.turn-coach__feedback')).toBeVisible();
        }
        expect(tutorial.game!.detail.history).toHaveLength(2);
        await close(owned[1]);
        expect((await requestAs(page, archive)).status()).toBe(404);
        const odds = page.locator('details').filter({
          has: page.locator('summary', {
            hasText: game === 'slots' ? 'Paytable and odds' : 'Payouts and odds',
          }),
        });
        await odds.locator('summary').click();
        await expect(odds).toContainText(game === 'slots' ? '93.75%' : '97.3%');
        await odds.locator('summary').click();
        let balance = 100;
        for (let i = 1; i <= 5; i++) {
          const stake = page.getByRole('spinbutton', { name: 'Stake', exact: true });
          const before = room.match_version;
          await stake.fill('0');
          await expect(page.getByRole('button', { name: 'Spin', exact: true })).toBeDisabled();
          await stake.fill(String(i + 1));
          const choice = i % 2 ? 'red' : '0';
          if (game === 'roulette') {
            await page.getByRole('combobox', { name: 'Single number' }).selectOption('17');
            if (choice === 'red')
              await page.getByRole('button', { name: 'Red', exact: true }).click();
            else await page.getByRole('combobox', { name: 'Single number' }).selectOption(choice);
          }
          const unchanged = await roomAs(page, room.id);
          expect(unchanged.match_version).toBe(before);
          expect(unchanged.game!.detail.history).toEqual(room.game!.detail.history);
          expect(submitted).toBe(i - 1);
          await fits(page);
          room = await spin(page, room);
          const settled = verifySettlement(game, room, i + 1, choice, balance, i);
          balance = settled.balance;
          expect(submitted).toBe(i);
          const latest = page.getByRole('region', { name: 'Latest spin' });
          await expect(latest).toContainText(
            `Staked ${settled.stake} · Returned ${settled.payout}`,
          );
          if ('pocket' in settled) {
            await expect(
              page.getByRole('img', {
                name: `Single-zero roulette wheel. Spin ${i} landed on ${settled.pocket} ${settled.color}.`,
                exact: true,
              }),
            ).toBeVisible();
          } else {
            const faces = settled.reels.map((symbol) => symbol[0].toUpperCase() + symbol.slice(1));
            await expect(page.locator('.slot-face-name')).toHaveText(faces);
            await expect(
              page.getByRole('img', { name: 'Payline: ' + faces.join(', ') + '.', exact: true }),
            ).toBeVisible();
          }
          if (i === 2) {
            await page.reload();
            expect((await roomAs(page, room.id)).game!.detail.history).toEqual(
              room.game!.detail.history,
            );
          }
        }
        expect(room.status).toBe('finished');
        expect(room.game!.actions).toEqual([]);
        expect(room.game!.winners).toEqual(balance > 100 ? [room.owner_id] : []);
        const original = await requestAs(page, archive);
        expect(original.status()).toBe(200);
        const saved = await original.json();
        expect(saved.detail.history).toEqual(room.game!.detail.history);
        expect(saved.players[0].chips).toBe(balance);
        expect((await requestAs(other, archive)).status()).toBe(404);
        const restarted = page.waitForResponse(
          (r) =>
            r.request().method() === 'POST' &&
            new URL(r.url()).pathname.endsWith('/rooms/' + room.id + '/start'),
        );
        await page.getByRole('button', { name: 'Play again', exact: true }).click();
        const newRoom = (await (await restarted).json()) as RoomView;
        expect(newRoom.match_id).not.toBe(originalId);
        expect(newRoom.game!.detail.history).toEqual([]);
        expect(newRoom.game!.players[0].chips).toBe(100);
        await close(owned[0]);
        await page.goto('/profile');
        const route = '/games/' + game + '/results/' + originalId;
        await page.locator('a.history-row[href="' + route + '"]').click();
        await expect(page).toHaveURL((url) => url.pathname === route);
        const title = game === 'slots' ? 'Slots results' : 'Roulette results';
        await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
        await expect(page.locator('.chance-history li')).toHaveCount(5);
        for (const [index, row] of [...saved.detail.history].reverse().entries()) {
          await expect(page.locator('.chance-history li').nth(index)).toContainText(
            'Staked ' + row.stake + ' · Returned ' + row.payout + ' · Balance ' + row.balance,
          );
        }
        await page.reload();
        await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
        await fits(page);
        expect(await (await requestAs(page, archive)).json()).toEqual(saved);
        expect((await requestAs(other, archive)).status()).toBe(404);
      } finally {
        try {
          for (const target of owned.reverse()) await close(target);
        } finally {
          await otherContext.close();
        }
      }
    },
  );
}
