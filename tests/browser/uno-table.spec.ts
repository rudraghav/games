import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { openGameSetup, requestAs, roomAs, type RoomView } from './helpers';
import {
  midgameScenarios,
  type MidgameScenario,
} from '../../apps/web/src/stories/generated/midgame-scenarios';

test.use({ trace: 'off', screenshot: 'only-on-failure', reducedMotion: 'reduce' });

type OwnedRoom = { id?: string; actors: Page[]; contexts: BrowserContext[] };
const cleanup = new WeakMap<Page, OwnedRoom>();

// A timed-out body must not consume the budget needed to close its room.
test.afterEach(async ({ page }) => {
  test.setTimeout(45000);
  const owned = cleanup.get(page);
  if (!owned) return;
  try {
    if (!owned.id) return;
    const response = await requestAs(page, `rooms/${owned.id}`);
    if (response.status() === 404) return;
    expect(response.status()).toBe(200);
    if (((await response.json()) as RoomView).status === 'playing')
      expect((await requestAs(page, `rooms/${owned.id}/abandon`, 'POST')).status()).toBe(200);
    for (const actor of [...owned.actors].reverse())
      expect((await requestAs(actor, `rooms/${owned.id}/leave`, 'POST')).status()).toBe(200);
    expect((await requestAs(page, `rooms/${owned.id}`)).status()).toBe(404);
  } finally {
    await Promise.all(owned.contexts.map((context) => context.close()));
    cleanup.delete(page);
  }
});

test.describe('Local Uno fixtures', () => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Legally reached Uno scenarios are local-only.');

  async function scenario(page: Page, item: MidgameScenario) {
    await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(item.game);
    await page
      .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
      .selectOption(item.id);
    await expect(page.locator('.midgame-review-table')).toHaveAttribute('data-midgame', item.id);
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
  }
  const longest = (game: string) =>
    midgameScenarios
      .filter((item) => item.game === game)
      .sort((a, b) => b.room.game!.hand.length - a.room.game!.hand.length)[0];

  test.beforeEach(async ({ page }) => {
    await page.goto('/design/midgame');
    await expect(page.getByRole('heading', { name: 'Mid-game workspace review' })).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
  });

  test('long hands lead with playable cards and show many corners on a small phone', async ({
    page,
  }) => {
    for (const game of ['uno', 'uno-no-mercy']) {
      const item = longest(game);
      const playable = new Set(
        item.room.game!.actions!.flatMap((option) =>
          option.action.type === 'play' && option.action.card ? [option.action.card] : [],
        ),
      );
      for (const width of [320, 390]) {
        await page.setViewportSize({ width, height: 640 });
        await scenario(page, item);
        const hand = page.getByRole('group', { name: 'Your hand', exact: true });
        const cards = hand.locator('.playing-card');
        await expect(cards).toHaveCount(item.room.game!.hand.length);
        const report = await hand.evaluate((frame) => {
          const bounds = frame.getBoundingClientRect();
          const cards = [...frame.querySelectorAll<HTMLElement>('.playing-card')];
          // A corner is readable when the card's left 40% is inside the rail window.
          const corners = cards.filter((card) => {
            const box = card.getBoundingClientRect();
            return box.left >= bounds.left - 1 && box.left + box.width * 0.4 <= bounds.right + 1;
          }).length;
          const steps = cards
            .slice(1)
            .map(
              (card, index) =>
                card.getBoundingClientRect().left - cards[index].getBoundingClientRect().left,
            );
          return {
            corners,
            minStep: Math.min(...steps),
            width: cards[0].getBoundingClientRect().width,
            first: cards[0].getAttribute('aria-label') || '',
          };
        });
        // Before this change two cards fit at 320px and three at 390px.
        expect(report.corners, `${item.id} at ${width}px`).toBeGreaterThanOrEqual(
          width === 320 ? 4 : 5,
        );
        // Every card keeps more than half its width, so its centre stays tappable.
        expect(report.minStep).toBeGreaterThanOrEqual(report.width * 0.5);
        if (playable.size) expect(report.first).toMatch(/, playable/);
        // The first card is clickable at its centre and opens fully when selected.
        await cards.first().click();
        await expect(cards.first()).toHaveAttribute('aria-pressed', 'true');
        await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
      }
    }
  });

  test('on a 320px phone the moves stay on screen after choosing a card', async ({ page }) => {
    const item = midgameScenarios.find(
      (entry) =>
        entry.game === 'uno' &&
        entry.room.game!.actions!.some((option) => option.action.type === 'play') &&
        entry.room.game!.hand.length >= 20,
    )!;
    await page.setViewportSize({ width: 320, height: 568 });
    await scenario(page, item);
    const card = page.locator('.uno-hand .card-hand > [data-playable="true"]').first();
    await card.scrollIntoViewIfNeeded();
    await card.click();
    const play = page
      .locator('.uno-dock .action-choices button')
      .filter({ hasText: /^Play / })
      .first();
    await expect(play).toBeVisible();
    const box = (await play.boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(568 + 1);
  });

  test('colour choices show a swatch, the colour name and how many the viewer holds', async ({
    page,
  }) => {
    const item = midgameScenarios.find(
      (entry) =>
        entry.game === 'uno-no-mercy' &&
        entry.room.game!.actions!.every((option) => option.action.type === 'choose'),
    )!;
    await scenario(page, item);
    const hand = item.room.game!.hand;
    for (const option of item.room.game!.actions!) {
      const swatch = page.getByRole('button', { name: option.label, exact: true });
      const colour = option.action.color!;
      await expect(swatch).toHaveAttribute('data-color', colour);
      await expect(swatch).toContainText(colour.charAt(0).toUpperCase() + colour.slice(1));
      await expect(swatch).toContainText(
        `${hand.filter((card) => card.color === colour).length} in hand`,
      );
    }
  });
});

test('failed Uno saves preserve the exact selection through refresh and a deliberate retry', async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(120000);
  const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  const friend = await context.newPage();
  const owned: OwnedRoom = { actors: [page], contexts: [context] };
  cleanup.set(page, owned);
  for (const actor of [page, friend]) actor.setDefaultTimeout(15000);
  let roomId: string | undefined;
  await page.goto('/');
  await openGameSetup(page, 'Uno');
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Uno recovery host');
  await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
  const creation = page.waitForResponse(
    (response) => response.url().endsWith('/v1/rooms') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  const created = await creation;
  expect(created.status()).toBe(201);
  roomId = ((await created.json()) as RoomView).id;
  owned.id = roomId;
  await expect(page).toHaveURL(new RegExp(`/rooms/${roomId}$`));
  const code = await page.locator('.room-code').innerText();
  await friend.goto('/');
  await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
  await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Uno recovery friend');
  await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
  const joining = friend.waitForResponse(
    (response) => response.url().endsWith('/rooms/join') && response.request().method() === 'POST',
  );
  await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
  expect((await joining).status()).toBe(200);
  owned.actors.push(friend);
  await expect(friend).toHaveURL(page.url());

  for (const game of ['uno', 'uno-no-mercy']) {
    if (game !== 'uno') {
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
    for (const member of [page, friend]) {
      expect((await requestAs(member, `rooms/${roomId}/heartbeat`, 'POST')).status()).toBe(200);
      expect(
        (await requestAs(member, `rooms/${roomId}/ready`, 'PUT', { ready: true })).status(),
      ).toBe(200);
    }
    expect((await requestAs(page, `rooms/${roomId}/start`, 'POST')).status()).toBe(200);
    let actor = page;
    let before = await roomAs(page, roomId);
    const plainPlay = (room: RoomView) =>
      room.game!.actions.find(
        ({ action }) => action.type === 'play' && !action.color && !action.target,
      );
    // Reach a normal card play using only each actor's current legal projection.
    for (let step = 0; step < 40; step++) {
      actor = before.game!.current_player === before.owner_id ? page : friend;
      before = await roomAs(actor, roomId);
      if (plainPlay(before)) break;
      const option = before.game!.actions.find(({ action }) => action.type !== 'uno')!;
      expect(option).toBeTruthy();
      expect(
        (
          await requestAs(actor, `rooms/${roomId}/actions`, 'POST', {
            match_id: before.match_id,
            expected_version: before.match_version,
            action_id: randomUUID(),
            action: option.action,
          })
        ).status(),
      ).toBe(200);
      before = await roomAs(page, roomId);
    }
    const option = plainPlay(before);
    expect(option, `${game} reaches a legal plain card play`).toBeTruthy();
    const face = before.game!.hand.find((card) => card.id === option!.action.card)!;
    const playableIds = new Set(
      before
        .game!.actions.filter(({ action }) => action.type === 'play')
        .map(({ action }) => action.card),
    );
    const duplicateIndex = before
      .game!.hand.filter((card) => card.label === face.label && playableIds.has(card.id))
      .sort((a, b) => a.id.localeCompare(b.id))
      .findIndex((card) => card.id === face.id);
    await actor.reload();
    const hand = actor.getByRole('group', { name: 'Your hand', exact: true });
    const label = face.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const card = hand
      .getByRole('button', { name: new RegExp(`^${label}, playable(?:, just drawn)?$`) })
      .nth(duplicateIndex);
    await card.click();
    const selectedName = await card.getAttribute('aria-label');
    const play = actor
      .locator('.uno-dock')
      .getByRole('button', { name: option!.label, exact: true });
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await actor.route(
      '**/api/backend/v1/rooms/*/actions',
      (route) =>
        route.fulfill({ status: 503, json: { detail: 'Controlled unavailable response' } }),
      { times: 1 },
    );
    const failure = actor.waitForResponse((response) =>
      response.url().endsWith(`/rooms/${roomId}/actions`),
    );
    await play.click();
    expect((await failure).status()).toBe(503);
    await expect(
      actor.getByText('We could not reach the table. Please try again.', { exact: true }),
    ).toBeVisible();
    expect((await roomAs(actor, roomId)).match_version).toBe(before.match_version);
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await expect(play).toBeEnabled();
    await actor.reload();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await expect(play).toBeEnabled();
    // A retained draft remains editable and clearable; it never commits itself.
    await actor.getByRole('button', { name: 'Clear selection', exact: true }).click();
    await expect(hand.getByRole('button', { pressed: true })).toHaveCount(0);
    await card.click();
    const otherName = (
      await hand
        .getByRole('button')
        .evaluateAll((buttons) => buttons.map((button) => button.getAttribute('aria-label')!))
    ).find((label) => label !== selectedName)!;
    const otherCard = hand.getByRole('button', { name: otherName, exact: true }).first();
    await otherCard.click();
    await expect(otherCard).toHaveAttribute('aria-pressed', 'true');
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    expect((await roomAs(actor, roomId)).match_version).toBe(before.match_version);
    const retry = actor.waitForResponse((response) =>
      response.url().endsWith(`/rooms/${roomId}/actions`),
    );
    await play.click();
    const savedResponse = await retry;
    expect(savedResponse.status()).toBe(200);
    expect(savedResponse.request().postDataJSON().action).toEqual(option!.action);
    const saved = (await savedResponse.json()) as RoomView;
    expect(saved.match_version).toBe(before.match_version! + 1);
    await expect(hand.getByRole('button', { pressed: true })).toHaveCount(0);
    await actor.reload();
    await expect(hand.getByRole('button', { pressed: true })).toHaveCount(0);
    const refreshed = await roomAs(actor, roomId);
    expect(refreshed.match_version).toBe(saved.match_version);
    expect(refreshed.game!.hand.some((card) => card.id === face.id)).toBe(false);
  }
});
