import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { openGameSetup, openRoomOptions, requestAs, roomAs, type RoomView } from './helpers';
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
        expect(report.corners, `${item.id} at ${width}px`).toBeGreaterThanOrEqual(
          width === 320 ? 5 : 6,
        );
        // Every card keeps more than half its width, so its centre stays tappable.
        expect(report.minStep).toBeGreaterThanOrEqual(Math.max(44, report.width * 0.5));
        if (playable.size) expect(report.first).toMatch(/, playable/);
        // The first card is clickable at its centre and opens fully when selected.
        const inspect = page.getByRole('button', { name: 'Inspect cards', exact: true });
        await inspect.click();
        await cards.first().click();
        await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
        await expect(cards.first()).toHaveAttribute('aria-pressed', 'true');
        await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
        await inspect.click();
      }
    }
  });

  test('the only complete ordinary play is available beside Draw before selecting a card', async ({
    page,
  }) => {
    const item = midgameScenarios.find((entry) => {
      const game = entry.room.game!;
      const plays = game.actions!.filter((option) => option.action.type === 'play');
      return (
        entry.game === 'uno' &&
        !game.actions!.some((option) => ['end_turn', 'choose'].includes(option.action.type)) &&
        plays.length === 1 &&
        !plays[0].action.color &&
        !plays[0].action.target &&
        entry.next.action.card === plays[0].action.card
      );
    })!;
    await scenario(page, item);
    const card = item.room.game!.hand.find((face) => face.id === item.next.action.card)!;
    const dock = page.getByRole('region', { name: 'Your actions' });
    await expect(page.locator('.uno-hand [aria-pressed="true"]')).toHaveCount(0);
    await expect(dock.getByRole('button', { name: 'Draw a card', exact: true })).toBeEnabled();
    await dock.getByRole('button', { name: `Play ${card.label}`, exact: true }).click();
    expect(JSON.parse((await page.getByLabel('Submitted action').textContent())!)).toEqual(
      item.next.action,
    );
  });

  test('a card tap plays an ordinary move or opens its required choice', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 });
    for (const [id, label, kind] of [
      ['uno-2-17-2', 'Green Skip', 'plain'],
      ['uno-10-31-2', 'Wild +4', 'colour'],
      ['uno-no-mercy-2-17-2', 'Green 1', 'plain'],
      ['uno-no-mercy-6-31-2', 'Wild Reverse +4', 'colour'],
      ['uno-no-mercy-2-11-19', 'Red 7', 'swap'],
    ]) {
      const item = midgameScenarios.find((entry) => entry.id === id)!;
      await scenario(page, item);
      const game = item.room.game!;
      const face = game.hand.find((card) => card.label === label)!;
      const option = game.actions!.find(
        ({ action }) => action.type === 'play' && action.card === face.id,
      )!;
      const drawn = (game.detail!.you_drew as string[] | undefined)?.includes(face.id);
      await page
        .getByRole('group', { name: 'Your hand', exact: true })
        .getByRole('button', {
          name: `${face.label}, playable${drawn ? ', just drawn' : ''}`,
          exact: true,
        })
        .click();
      if (kind !== 'plain') {
        await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
        const choice = page.getByRole('button', {
          name: kind === 'colour' ? option.label : /^Swap with /,
          exact: kind === 'colour',
        });
        await expect(choice).toBeInViewport();
        await choice.click();
      }
      expect(JSON.parse((await page.getByLabel('Submitted action').textContent())!)).toEqual(
        option.action,
      );
    }
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

  // Reached with each "Stack draw cards" choice; every other missed UNO is caught.
  const rules = (game: string, stacking: 'on' | 'off', situation: string) =>
    midgameScenarios.find(
      (entry) => entry.game === game && entry.label.endsWith(`stacking ${stacking} · ${situation}`),
    )!;
  const dockButtons = (page: Page) =>
    page.locator('.uno-dock .action-choices button').allTextContents();

  test('a pending draw offers the stack first when stacking is on and only the draw when it is off', async ({
    page,
  }) => {
    for (const game of ['uno', 'uno-no-mercy']) {
      const on = rules(game, 'on', 'stack on a draw penalty');
      await scenario(page, on);
      const penalty = on.room.game!.detail!.penalty as number;
      expect(on.room.game!.detail!.stacking).toBe(true);
      await expect(page.locator('.uno-situation')).toHaveText(
        `+${penalty} is on you: draw ${penalty} or stack.`,
      );
      await expect(page.locator('.uno-dock .action-context')).toContainText(
        `Stack +${on.room.game!.detail!.stack_floor} or more to pass it on. Drawing passes your turn.`,
      );
      const buttons = await dockButtons(page);
      expect(buttons[0]).toMatch(/^Stack /);
      expect(buttons.at(-1)).toBe(`Draw ${penalty}`);
      // Only draw cards of the floor or higher are lit, whatever their colour.
      const lit = await page
        .locator('.uno-hand .card-hand > [data-playable="true"]')
        .evaluateAll((cards) => cards.map((card) => card.getAttribute('aria-label') || ''));
      expect(lit.length).toBeGreaterThan(0);
      for (const label of lit) expect(label).toMatch(/\+\d+|Draw \d+/);

      const off = rules(game, 'off', 'draw the penalty');
      await scenario(page, off);
      const owed = off.room.game!.detail!.penalty as number;
      expect(off.room.game!.detail!.stacking).toBe(false);
      // The viewer holds a draw card here and still may not stack it.
      expect(off.room.game!.hand.some((card) => card.value.startsWith('+'))).toBe(true);
      await expect(page.locator('.uno-situation')).toHaveText(`+${owed} is on you: draw ${owed}.`);
      // The engine's own message says this in the notice above the table. The dock repeats
      // it only where it has more to add: in No Mercy, how close drawing takes you to the limit.
      expect(off.room.game!.message).toBe(`Draw ${owed}; your turn then passes.`);
      const line = page.locator('.uno-dock .action-context');
      if (game === 'uno') await expect(line).not.toContainText('your turn passes');
      else await expect(line).toContainText(`Draw ${owed}; then your turn passes. You’d hold `);
      expect(await dockButtons(page)).toEqual([`Draw ${owed}`]);
      await expect(page.locator('.uno-hand .card-hand > [data-playable="true"]')).toHaveCount(0);
      await page.getByRole('button', { name: `Draw ${owed}`, exact: true }).click();
      expect(JSON.parse((await page.getByLabel('Submitted action').textContent())!)).toEqual(
        off.next.action,
      );
    }
  });

  test('the card just drawn leads the hand and is the first named move', async ({ page }) => {
    for (const [game, stacking] of [
      ['uno', 'on'],
      ['uno', 'off'],
      ['uno-no-mercy', 'on'],
      ['uno-no-mercy', 'off'],
    ] as const) {
      const item = rules(game, stacking, 'play the card just drawn');
      await scenario(page, item);
      const drawn = item.room.game!.hand.find((card) => card.id === item.next.action.card)!;
      const first = page.locator('.uno-hand .card-hand > .playing-card').first();
      await expect(first).toHaveAttribute('aria-label', `${drawn.label}, playable, just drawn`);
      await expect(first).toHaveClass(/uno-card--new/);
      // Shown in the hand rail without scrolling it sideways.
      const shown = await first.evaluate((card) => {
        const box = card.getBoundingClientRect();
        const rail = card.closest('.hand-scroll')!.getBoundingClientRect();
        return box.left >= rail.left - 1 && box.left + box.width * 0.5 <= rail.right + 1;
      });
      expect(shown, `${item.id} drawn card in the rail`).toBe(true);
      await expect(page.locator('.uno-dock .action-context')).toContainText(
        `You drew ${drawn.label} and it fits: play it now${game === 'uno' ? ', or pass and keep it' : ''}.`,
      );
      // Classic may still pass; No Mercy must play the card it drew.
      expect(await dockButtons(page)).toEqual(
        game === 'uno' ? [`Play ${drawn.label}`, 'Pass'] : [`Play ${drawn.label}`],
      );
      await page.getByRole('button', { name: `Play ${drawn.label}`, exact: true }).click();
      expect(JSON.parse((await page.getByLabel('Submitted action').textContent())!)).toEqual(
        item.next.action,
      );
    }
  });

  test('a seat that misses its next turn is marked for everyone without breaking the strip', async ({
    page,
  }) => {
    for (const [game, stacking] of [
      ['uno', 'on'],
      ['uno', 'off'],
      ['uno-no-mercy', 'on'],
      ['uno-no-mercy', 'off'],
    ] as const) {
      const item = rules(game, stacking, 'a seat misses its next turn');
      const marked = item.room.game!.detail!.missing_turn as string[];
      expect(marked.length).toBeGreaterThan(0);
      await scenario(page, item);
      for (const id of marked) {
        const seat = page.locator(`.player-strip-seat[data-player="${id}"]`);
        await expect(seat).toHaveAttribute('aria-label', /, Misses next turn, /);
        const badge = seat.locator('.seat-badge');
        await expect(badge).toHaveText('Misses next turn');
        await seat.scrollIntoViewIfNeeded();
        // One line, fully inside its seat.
        const fits = await badge.evaluate((node) => {
          const chip = node.getBoundingClientRect();
          const box = node.closest('.seat')!.getBoundingClientRect();
          return chip.height < 24 && chip.left >= box.left && chip.right <= box.right;
        });
        expect(fits, `${item.id} chip`).toBe(true);
      }
      await expect(page.locator('.uno-felt-info')).toContainText(
        /miss(es)? (their|your) next turn/,
      );
      // The "Next" chip names who will really play, never a seat that misses its turn.
      expect(marked).not.toContain(item.room.game!.detail!.next_player);
    }
    // The catch itself says what it costs before anyone commits to it.
    const catching = rules('uno', 'on', 'catch a missed UNO');
    await scenario(page, catching);
    await expect(page.locator('.uno-dock .action-context')).toContainText(
      'catch them for +2 and a missed turn.',
    );
  });
});

test('room setup and the in-room options offer the stacking toggle with each game’s default', async ({
  page,
}) => {
  test.setTimeout(60000);
  const owned: OwnedRoom = { actors: [page], contexts: [] };
  cleanup.set(page, owned);
  page.setDefaultTimeout(15000);
  // Off for Uno, on for No Mercy; classic also keeps its 7/0 option.
  const offered = async (dialog: ReturnType<Page['getByRole']>, game: string) => {
    await dialog.getByRole('combobox', { name: 'The game', exact: true }).selectOption(game);
    await openRoomOptions(dialog);
    const stack = dialog.getByRole('checkbox', { name: 'Stack draw cards', exact: true });
    await expect(stack).toBeVisible();
    await expect(stack).toBeChecked({ checked: game === 'uno-no-mercy' });
    await expect(dialog.getByRole('checkbox', { name: /Stack draw-two/ })).toHaveCount(0);
    await expect(
      dialog.getByRole('checkbox', { name: '7 swaps & 0 passes', exact: true }),
    ).toHaveCount(game === 'uno' ? 1 : 0);
  };
  await page.goto('/');
  const setup = await openGameSetup(page, 'Uno No Mercy');
  await offered(setup, 'uno-no-mercy');
  await offered(setup, 'uno');
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Uno options host');
  await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
  const creation = page.waitForResponse(
    (response) => response.url().endsWith('/v1/rooms') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  const created = await creation;
  expect(created.status()).toBe(201);
  owned.id = ((await created.json()) as RoomView).id;
  await expect(page).toHaveURL(new RegExp(`/rooms/${owned.id}$`));
  // The host's in-room dialog lists the same options; nothing is saved here.
  await page.getByRole('button', { name: 'Change game and settings', exact: true }).click();
  const options = page.getByRole('dialog', { name: 'Room settings', exact: true });
  await expect(options).toBeVisible();
  await offered(options, 'uno');
  await offered(options, 'uno-no-mercy');
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
    const deal = async () => {
      // A deal that ran out of steps without ending is put away before the next one.
      if ((await roomAs(page, roomId)).status === 'playing')
        expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
      for (const member of [page, friend]) {
        expect((await requestAs(member, `rooms/${roomId}/heartbeat`, 'POST')).status()).toBe(200);
        expect(
          (await requestAs(member, `rooms/${roomId}/ready`, 'PUT', { ready: true })).status(),
        ).toBe(200);
      }
      expect((await requestAs(page, `rooms/${roomId}/start`, 'POST')).status()).toBe(200);
    };
    let actor = page;
    let before = await roomAs(page, roomId);
    const plainPlay = (room: RoomView) =>
      room.status === 'playing'
        ? room.game!.actions.find(
            ({ action }) => action.type === 'play' && !action.color && !action.target,
          )
        : undefined;
    // Reach a normal card play using only each actor's current legal projection. About
    // one No Mercy deal in fifty ends first: taking the first legal move can stack draws
    // until someone passes 25 cards and is out. Such a deal is simply dealt again.
    for (let attempt = 0; attempt < 5 && !plainPlay(before); attempt++) {
      await deal();
      before = await roomAs(page, roomId);
      for (let step = 0; step < 40 && before.status === 'playing'; step++) {
        actor = before.game!.current_player === before.owner_id ? page : friend;
        before = await roomAs(actor, roomId);
        if (plainPlay(before)) break;
        const option = before.game!.actions.find(({ action }) => action.type !== 'uno');
        if (!option) break;
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
      if (plainPlay(before)) before = await roomAs(actor, roomId);
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
    const play = actor
      .locator('.uno-dock')
      .getByRole('button', { name: option!.label, exact: true });
    await actor.route(
      '**/api/backend/v1/rooms/*/actions',
      (route) =>
        route.fulfill({ status: 503, json: { detail: 'Controlled unavailable response' } }),
      { times: 1 },
    );
    const failure = actor.waitForResponse((response) =>
      response.url().endsWith(`/rooms/${roomId}/actions`),
    );
    await card.click();
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
    const inspect = actor.getByRole('button', { name: 'Inspect cards', exact: true });
    await inspect.click();
    await expect(hand.getByRole('button', { pressed: true })).toHaveCount(0);
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    expect((await roomAs(actor, roomId)).match_version).toBe(before.match_version);
    await inspect.click();
    const retry = actor.waitForResponse((response) =>
      response.url().endsWith(`/rooms/${roomId}/actions`),
    );
    await card.click();
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
