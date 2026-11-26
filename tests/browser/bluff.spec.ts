import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import type { components } from '../../packages/api-client/src/generated/schema';
import { attachPreviewAccess, openGameSetup, requestAs, roomAs, type RoomView } from './helpers';

type Card = components['schemas']['CardView'];

test.use({ trace: 'off', screenshot: 'off' });

/** Rooms this test made, with every human who must leave before the room closes. */
const owned = new Map<Page, { id?: string; humans: Page[]; contexts: BrowserContext[] }>();

async function closeRoom(host: Page, id: string, humans: Page[]) {
  const response = await requestAs(host, `rooms/${id}`);
  if (response.status() === 404) return;
  expect(response.status()).toBe(200);
  if (((await response.json()) as RoomView).status === 'playing')
    expect((await requestAs(host, `rooms/${id}/abandon`, 'POST')).status()).toBe(200);
  for (const human of [...humans].reverse())
    expect([200, 404]).toContain((await requestAs(human, `rooms/${id}/leave`, 'POST')).status());
  expect((await requestAs(host, `rooms/${id}`)).status()).toBe(404);
}

test.afterEach(async ({ page }) => {
  test.setTimeout(60000);
  const run = owned.get(page);
  if (!run) return;
  try {
    if (run.id) await closeRoom(page, run.id, run.humans);
  } finally {
    for (const context of run.contexts) await context.close();
    owned.delete(page);
  }
});

async function act(actor: Page, roomId: string, action: components['schemas']['Action']) {
  const view = await roomAs(actor, roomId);
  const response = await requestAs(actor, `rooms/${roomId}/actions`, 'POST', {
    match_id: view.match_id,
    expected_version: view.match_version,
    action_id: crypto.randomUUID(),
    action,
  });
  expect(response.status()).toBeLessThan(300);
  return (await response.json()) as RoomView;
}

/** Long hands overlap: tap the exposed left edge of a card, where its rank corner sits. */
async function chooseCard(actor: Page, card: Card) {
  await actor
    .getByRole('group', { name: 'Your hand', exact: true })
    .getByRole('button', { name: card.label, exact: true })
    .click({ position: { x: 10, y: 34 } });
}

/** No card id or face of `hidden` appears in this viewer's page or room projection. */
async function expectUnseen(viewer: Page, roomId: string, hidden: Card[], why: string) {
  const json = JSON.stringify(await roomAs(viewer, roomId));
  const html = await viewer.content();
  for (const card of hidden) {
    expect(json, `${why}: ${card.id} in the room JSON`).not.toContain(`"${card.id}"`);
    expect(html, `${why}: ${card.label} in the page`).not.toContain(`aria-label="${card.label}"`);
  }
}

const RANK_NAMES: Record<string, string> = {
  A: 'Aces',
  '2': 'Twos',
  '3': 'Threes',
  '4': 'Fours',
  '5': 'Fives',
  '6': 'Sixes',
  '7': 'Sevens',
  '8': 'Eights',
  '9': 'Nines',
  '10': 'Tens',
  J: 'Jacks',
  Q: 'Queens',
  K: 'Kings',
};
/** How the table writes a rank in a sentence: "as 7s", "as Queens". */
const plural = (rank: string) =>
  ({ A: 'Aces', J: 'Jacks', Q: 'Queens', K: 'Kings' })[rank] ?? `${rank}s`;

test('two friends play, follow, call, reveal and pass with every hidden card kept private', async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(240000);
  const friendContext = await browser.newContext({
    baseURL,
    viewport: page.viewportSize()!,
    hasTouch: test.info().project.use.hasTouch,
    isMobile: test.info().project.use.isMobile,
  });
  const friend = await friendContext.newPage();
  const run = {
    id: undefined as string | undefined,
    humans: [page, friend],
    contexts: [friendContext],
  };
  owned.set(page, run);
  await attachPreviewAccess(page);
  await attachPreviewAccess(friend);
  await page.goto('/');
  await openGameSetup(page, 'Bluff');
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Bluff Host');
  await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
  const roomId = new URL(page.url()).pathname.split('/').at(-1)!;
  run.id = roomId;
  const code = await page.locator('.room-code').innerText();
  await friend.goto('/');
  await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
  await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Bluff Friend');
  await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
  await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
  await expect(friend).toHaveURL(page.url());
  for (const actor of [page, friend])
    expect((await requestAs(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true })).ok()).toBe(
      true,
    );
  expect((await requestAs(page, `rooms/${roomId}/start`, 'POST')).ok()).toBe(true);
  await Promise.all([page.reload(), friend.reload()]);

  const ids = new Map<string, Page>();
  for (const actor of [page, friend]) {
    const me = await (await requestAs(actor, 'me')).json();
    ids.set(me.profile.id, actor);
  }
  const hand = async (actor: Page) => (await roomAs(actor, roomId)).game!.hand as Card[];
  const other = (actor: Page) => (actor === page ? friend : page);
  const current = async () => ids.get((await roomAs(page, roomId)).game!.current_player!)!;

  // The deal: 26 cards each, and neither hand reaches the other viewer.
  const [hostHand, friendHand] = [await hand(page), await hand(friend)];
  expect(hostHand).toHaveLength(26);
  expect(friendHand).toHaveLength(26);
  await expect(page.locator('.bluff-game')).toBeVisible();
  await expectUnseen(page, roomId, friendHand, 'Opening');
  await expectUnseen(friend, roomId, hostHand, 'Opening');

  // A starter picks two cards and declares a rank they do not both hold.
  const starter = await current();
  const follower = other(starter);
  await expect(starter.getByRole('group', { name: 'Rank to declare', exact: true })).toBeVisible();
  await expect(follower.getByRole('group', { name: 'Rank to declare', exact: true })).toHaveCount(
    0,
  );
  const starterHand = await hand(starter);
  const laid = [starterHand[0], starterHand[starterHand.length - 1]];
  for (const card of laid) await chooseCard(starter, card);
  const declared = laid[0].value === 'K' ? 'Q' : 'K';
  await starter
    .getByRole('group', { name: 'Rank to declare', exact: true })
    .getByRole('button', { name: RANK_NAMES[declared], exact: true })
    .click();
  await starter.getByRole('button', { name: `Play 2 as ${plural(declared)}`, exact: true }).click();
  await expect.poll(async () => (await roomAs(page, roomId)).game!.detail.pile_count).toBe(2);
  await expect(
    follower.locator('.bluff-plays').getByText(`played 2 cards as ${plural(declared)}`),
  ).toBeVisible();
  await expect(follower.locator('.bluff-pile')).toContainText('Pile · 2');
  await expectUnseen(follower, roomId, laid, 'Face-down pile');

  // The follower plays one card as the same rank.
  const followerHand = await hand(follower);
  const followed = followerHand[3];
  await chooseCard(follower, followed);
  await follower
    .getByRole('button', { name: `Play 1 as ${plural(declared)}`, exact: true })
    .click();
  await expect.poll(async () => (await roomAs(page, roomId)).game!.detail.pile_count).toBe(3);
  await expectUnseen(starter, roomId, [followed], 'Unrevealed follow');

  // The starter calls: only the called card turns over, never the rest of the pile.
  await starter.getByRole('button', { name: 'Call bluff', exact: true }).click();
  await expect.poll(async () => (await roomAs(page, roomId)).game!.phase).toBe('reveal');
  const reveal = (await roomAs(page, roomId)).game!;
  expect(reveal.community.map((card) => card.id)).toEqual([followed.id]);
  for (const viewer of [page, friend]) {
    const called = viewer.getByRole('group', { name: 'The called play, face up', exact: true });
    await expect(called.getByRole('img')).toHaveCount(1);
    await expect(called.getByRole('img', { name: followed.label, exact: true })).toBeVisible();
  }
  await expectUnseen(follower, roomId, laid, 'Reveal keeps the rest of the pile');
  const honest = followed.value === declared;
  const detail = reveal.detail.reveal as { taker: string; starter: string; truthful: boolean };
  expect(detail.truthful).toBe(honest);
  await expect(page.locator('.bluff-verdict')).toHaveText(
    honest ? 'Honest: every card matches' : 'Bluff: not every card matches',
  );
  await expect(page.locator('.bluff-reveal')).toContainText('the pile · 3 cards');
  await page.locator('.bluff-game').screenshot({
    path: test.info().outputPath(`bluff-reveal-${test.info().project.name}.png`),
  });

  // The next round's starter continues; the taker now holds the three cards.
  const nextStarter = ids.get(detail.starter)!;
  await expect(
    other(nextStarter).getByRole('button', { name: 'Continue', exact: true }),
  ).toHaveCount(0);
  await nextStarter.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect.poll(async () => (await roomAs(page, roomId)).game!.phase).toBe('playing');
  const taker = ids.get(detail.taker)!;
  expect((await hand(taker)).length).toBe(taker === starter ? 27 : 28);

  // Everyone passes after one play: the pile is set aside, face down, for good.
  const lead = (await hand(nextStarter))[0];
  await chooseCard(nextStarter, lead);
  await nextStarter
    .getByRole('group', { name: 'Rank to declare', exact: true })
    .getByRole('button', { name: RANK_NAMES[lead.value], exact: true })
    .click();
  await nextStarter
    .getByRole('button', { name: `Play 1 as ${plural(lead.value)}`, exact: true })
    .click();
  await expect.poll(async () => (await roomAs(page, roomId)).game!.detail.pile_count).toBe(1);
  const passer = other(nextStarter);
  await passer.getByRole('button', { name: 'Pass', exact: true }).click();
  await expect.poll(async () => (await roomAs(page, roomId)).game!.detail.discarded_count).toBe(1);
  await expect(passer.locator('.bluff-aside')).toContainText('1');
  await expectUnseen(passer, roomId, [lead], 'Set-aside pile');
  expect(ids.get((await roomAs(page, roomId)).game!.current_player!)).toBe(nextStarter);
  await expect(
    nextStarter.getByRole('group', { name: 'Rank to declare', exact: true }),
  ).toBeVisible();
  await nextStarter.locator('.bluff-game').screenshot({
    path: test.info().outputPath(`bluff-mid-${test.info().project.name}.png`),
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('one player finishes a match against a bot', async ({ page }) => {
  test.setTimeout(600000);
  const run = { id: undefined as string | undefined, humans: [page], contexts: [] };
  owned.set(page, run);
  await attachPreviewAccess(page);
  await page.goto('/');
  await openGameSetup(page, 'Bluff');
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Bluff Solo');
  await page
    .getByRole('group', { name: 'Play with', exact: true })
    .getByRole('button', { name: 'Bots', exact: true })
    .click();
  await page.getByRole('button', { name: 'Play game', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/, { timeout: 45000 });
  const roomId = new URL(page.url()).pathname.split('/').at(-1)!;
  run.id = roomId;
  expect((await roomAs(page, roomId)).status).toBe('playing');
  // The open table drives the bot through the real browser client.
  await expect(page.locator('.bluff-game')).toBeVisible();
  let snapshot = await roomAs(page, roomId);
  const bot = snapshot.members.find((member) => member.is_bot)!;
  let moves = 0;
  let uiMoves = 0;
  let version = snapshot.match_version;
  let advanced = Date.now();
  while (snapshot.status === 'playing' && moves < 400) {
    snapshot = await roomAs(page, roomId);
    if (snapshot.status !== 'playing') break;
    if (snapshot.match_version !== version) {
      version = snapshot.match_version;
      advanced = Date.now();
    }
    expect(Date.now() - advanced, 'The match keeps moving').toBeLessThan(45000);
    const game = snapshot.game!;
    // The bot's hand never reaches this viewer: only its count.
    expect(JSON.stringify(game)).not.toContain(`"${bot.id}":[`);
    if (!game.actions.length) {
      await page.waitForTimeout(400);
      continue;
    }
    const of = (type: string) => game.actions.filter((option) => option.action.type === type);
    const hand = game.hand as Card[];
    if (of('continue').length) {
      await page.getByRole('button', { name: 'Continue', exact: true }).click();
      uiMoves++;
    } else if (of('play').length > 1) {
      // Start a round honestly with the rank held most often.
      const counts = new Map<string, Card[]>();
      for (const card of hand) counts.set(card.value, [...(counts.get(card.value) ?? []), card]);
      const best = [...counts.values()].sort((a, b) => b.length - a.length)[0].slice(0, 4);
      const option = of('play').find((o) => o.action.choice === best[0].value)!;
      if (uiMoves < 2) {
        for (const card of best) await chooseCard(page, card);
        await page
          .getByRole('button', {
            name: `Play ${best.length} as ${plural(best[0].value)}`,
            exact: true,
          })
          .click();
        uiMoves++;
      } else await act(page, roomId, { ...option.action, cards: best.map((card) => card.id) });
    } else {
      const rank = game.detail.rank as string;
      const honest = hand.filter((card) => card.value === rank).slice(0, 4);
      if (honest.length) {
        const option = of('play')[0];
        await act(page, roomId, { ...option.action, cards: honest.map((card) => card.id) });
      } else await act(page, roomId, of('skip')[0].action);
    }
    moves++;
    await expect
      .poll(async () => (await roomAs(page, roomId)).match_version, { timeout: 15000 })
      .not.toBe(version);
  }
  snapshot = await roomAs(page, roomId);
  expect(snapshot.status).toBe('finished');
  expect(snapshot.game!.phase).toBe('finished');
  expect(snapshot.game!.winners).toHaveLength(1);
  await page.reload();
  await expect(page.locator('.bluff-game')).toBeVisible();
  await expect(page.locator('.table-announcement').first()).toContainText(/win/);
});
