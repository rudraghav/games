import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { join } from 'node:path';
import { openGameSetup, requestAs, roomAs, type RoomView } from './helpers';

/** Rooms this file creates, with every human who must leave for each to close. */
const owned = new Map<string, Page[]>();

async function closeRoom(id: string, humans: Page[]) {
  const [host] = humans;
  const before = await requestAs(host, `rooms/${id}`);
  if (before.status() === 404) return void owned.delete(id);
  expect(before.status()).toBe(200);
  if (((await before.json()) as RoomView).status === 'playing')
    expect((await requestAs(host, `rooms/${id}/abandon`, 'POST')).status()).toBe(200);
  for (const human of [...humans].reverse())
    expect([200, 404]).toContain((await requestAs(human, `rooms/${id}/leave`, 'POST')).status());
  expect((await requestAs(host, `rooms/${id}`)).status()).toBe(404);
  owned.delete(id);
}

test.use({ trace: 'off' });
test.afterEach(async () => {
  test.setTimeout(60000);
  for (const [id, humans] of [...owned]) await closeRoom(id, humans);
});

/** Optional evidence screenshots for the release notes, outside the test output. */
async function evidence(page: Page, name: string) {
  const dir = process.env.GAMES_SHOT_DIR;
  if (!dir) return;
  const width = page.viewportSize()!.width;
  await page.screenshot({ path: join(dir, `liars-dice-${name}-${width}.png`), fullPage: true });
}

const DETAIL_KEYS = [
  'bid',
  'bids',
  'dice',
  'out',
  'reveal',
  'round',
  'starter',
  'total_dice',
  'wild_ones',
];

/** While dice are hidden, the viewer's projection and page hold their own dice and nobody else's. */
async function onlyOwnDice(actor: Page, roomId: string) {
  const view = await roomAs(actor, roomId);
  const detail = view.game!.detail as Record<string, unknown> & { dice: number[]; bid: unknown };
  expect(view.game!.phase).toBe('bidding');
  expect(Object.keys(detail).sort()).toEqual(DETAIL_KEYS);
  expect(detail.reveal).toBeNull();
  // One dice list in the whole room JSON: the viewer's own.
  expect(JSON.stringify(view).match(/"dice":/g)).toHaveLength(1);
  for (const player of view.game!.players) expect(player.cards ?? []).toHaveLength(0);
  await expect(actor.locator('.liars-dice-reveal')).toHaveCount(0);
  await expect
    .poll(() =>
      actor
        .locator('.liars-dice-own .liars-die')
        .evaluateAll((dice) => dice.map((die) => Number(die.getAttribute('data-face')))),
    )
    .toEqual(detail.dice);
  // The only dice drawn as pictures are the viewer's own and the standing bid's face.
  await expect(actor.locator('.liars-dice-game .liars-die[role="img"]')).toHaveCount(
    detail.dice.length + (detail.bid ? 1 : 0),
  );
  return view;
}

async function bidThroughBuilder(actor: Page, face: string, extra: number) {
  await actor.getByRole('button', { name: new RegExp(`^${face}, `) }).click();
  for (let i = 0; i < extra; i++) await actor.getByRole('button', { name: 'One more' }).click();
  const button = actor.getByRole('button', { name: /^Bid \d+ × / });
  await expect(button).toBeEnabled();
  const label = (await button.innerText()).trim();
  await button.click();
  return label;
}

async function savedAfter(actor: Page, roomId: string, version: number) {
  await expect
    .poll(async () => (await roomAs(actor, roomId)).match_version ?? 0, { timeout: 20000 })
    .toBeGreaterThan(version);
  return roomAs(actor, roomId);
}

test('two friends bid, raise, call and roll on while each sees only their own dice', async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(180000);
  const contexts: BrowserContext[] = [];
  const humans: Page[] = [page];
  let roomId: string | undefined;
  try {
    await page.goto('/');
    await openGameSetup(page, 'liars-dice');
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Dice Host');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    roomId = new URL(page.url()).pathname.split('/').at(-1)!;
    owned.set(roomId, humans);
    const code = await page.locator('.room-code').innerText();
    const use = test.info().project.use;
    const context = await browser.newContext({
      baseURL,
      viewport: page.viewportSize()!,
      isMobile: use.isMobile,
      hasTouch: use.hasTouch,
      userAgent: use.userAgent,
      deviceScaleFactor: use.deviceScaleFactor,
    });
    contexts.push(context);
    const friend = await context.newPage();
    humans.push(friend);
    await friend.goto('/');
    await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
    await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Dice Friend');
    await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
    await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect(friend).toHaveURL(page.url());
    for (const actor of humans)
      expect((await requestAs(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true })).ok()).toBe(
        true,
      );
    expect((await requestAs(page, `rooms/${roomId}/start`, 'POST')).ok()).toBe(true);
    await Promise.all(humans.map((actor) => actor.reload()));
    const ids = await Promise.all(
      humans.map(async (actor) => (await (await requestAs(actor, 'me')).json()).profile.id),
    );
    const byId = new Map(ids.map((id: string, i) => [id, humans[i]]));

    let view = await roomAs(page, roomId);
    expect(view.game!.detail.total_dice).toBe(10);
    for (const actor of humans) await onlyOwnDice(actor, roomId);
    const opener = byId.get(view.game!.current_player!)!;
    const follower = humans.find((actor) => actor !== opener)!;
    await expect(follower.getByRole('button', { name: /^Bid / })).toHaveCount(0);

    // The opening bid: twos, stepped up to two of them.
    await expect(opener.getByRole('button', { name: /^twos, 1 to 10$/ })).toBeEnabled();
    expect(await bidThroughBuilder(opener, 'twos', 1)).toBe('Bid 2 × twos');
    view = await savedAfter(opener, roomId, view.match_version!);
    expect(view.game!.detail.bid).toMatchObject({ quantity: 2, face: 2 });
    await expect(follower.locator('.liars-dice-bid h2')).toHaveText('2 × twos');
    for (const actor of humans) await onlyOwnDice(actor, roomId);

    // The raise: a higher face keeps the quantity, so threes start at two.
    await expect(follower.getByRole('button', { name: /^ones, / })).toBeEnabled();
    await expect(follower.getByRole('button', { name: /^threes, 2 to 10$/ })).toBeEnabled();
    expect(await bidThroughBuilder(follower, 'threes', 0)).toBe('Bid 2 × threes');
    view = await savedAfter(follower, roomId, view.match_version!);
    expect(view.game!.detail.bid).toMatchObject({ quantity: 2, face: 3 });
    await expect(opener.locator('.liars-dice-history li')).toHaveCount(2);
    await expect(opener.getByRole('button', { name: 'Call liar', exact: true })).toBeEnabled();
    for (const actor of humans) await onlyOwnDice(actor, roomId);
    await evidence(opener, 'mid');
    // Public history says the bid aloud and never a die.
    const activity = JSON.stringify(view.activity);
    expect(activity).toContain('Bid 2 × threes');

    // The call: every die is shown to both players, with the outcome in words.
    await opener.getByRole('button', { name: 'Call liar', exact: true }).click();
    view = await savedAfter(opener, roomId, view.match_version!);
    expect(view.game!.phase).toBe('reveal');
    const reveal = view.game!.detail.reveal as {
      dice: Record<string, number[]>;
      held: boolean;
      loser: string;
    };
    expect(Object.keys(reveal.dice).sort()).toEqual([...ids].sort());
    for (const actor of humans) {
      await expect(actor.locator('.liars-dice-reveal .liars-die')).toHaveCount(10);
      await expect(actor.locator('.liars-dice-reveal h3')).toContainText(
        reveal.held ? 'The bid of 2 × threes held' : 'The bid of 2 × threes failed',
      );
      await expect(actor.locator('.liars-dice-reveal [data-loser="true"]')).toContainText(
        'loses a die',
      );
    }
    await evidence(opener, 'reveal');

    // The loser rolls the next round; the dice are private again.
    const roller = byId.get(view.game!.current_player!)!;
    expect(view.game!.current_player).toBe(reveal.loser);
    await roller.getByRole('button', { name: 'Roll the next round', exact: true }).click();
    view = await savedAfter(roller, roomId, view.match_version!);
    expect(view.game!.detail.round).toBe(2);
    expect(view.game!.detail.total_dice).toBe(9);
    for (const actor of humans) await onlyOwnDice(actor, roomId);
    await expect(roller.locator('.liars-dice-bid h2')).toHaveText('No bid yet');
  } finally {
    if (roomId && owned.has(roomId)) await closeRoom(roomId, humans);
    for (const context of contexts) await context.close();
  }
});

test('one player plays Liar’s Dice against a bot to the finish', async ({ page }) => {
  test.setTimeout(420000);
  await page.goto('/');
  await openGameSetup(page, 'liars-dice');
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Dice Solo');
  await page
    .getByRole('group', { name: 'Play with', exact: true })
    .getByRole('button', { name: 'Bots', exact: true })
    .click();
  await page.getByRole('button', { name: 'Play game', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/, { timeout: 45000 });
  const roomId = new URL(page.url()).pathname.split('/').at(-1)!;
  owned.set(roomId, [page]);
  let view = await roomAs(page, roomId);
  expect(view.members.filter((member) => member.is_bot)).toHaveLength(1);
  let moves = 0;
  for (let i = 0; i < 400 && view.game?.phase !== 'finished'; i++) {
    const types = (view.game?.actions ?? []).map((option) => option.action.type);
    if (!types.length) {
      await page.waitForTimeout(700);
      view = await roomAs(page, roomId);
      continue;
    }
    const version = view.match_version!;
    if (types.includes('next_round')) {
      await page.getByRole('button', { name: 'Roll the next round', exact: true }).click();
    } else if (types.includes('call_liar')) {
      await page.getByRole('button', { name: 'Call liar', exact: true }).click();
    } else {
      await page.locator('.liars-dice-face:enabled').first().click();
      await page.getByRole('button', { name: /^Bid \d+ × / }).click();
    }
    moves++;
    view = await savedAfter(page, roomId, version);
  }
  expect(view.game!.phase).toBe('finished');
  expect(moves).toBeGreaterThan(2);
  expect(view.game!.winners).toHaveLength(1);
  await expect(page.locator('.liars-dice-reveal__winner')).toContainText(
    'the last player with dice',
  );
  await closeRoom(roomId, [page]);
});
