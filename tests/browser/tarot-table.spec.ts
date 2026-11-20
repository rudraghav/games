import { expect, test, type Page } from '@playwright/test';
import { tarotReadingExample } from '../../apps/web/src/stories/fixtures/tarot-reading';
import { drawTarotCard, openGameSetup, requestAs, roomAs } from './helpers';

test.use({ trace: 'off', screenshot: 'off' });
test.skip(!!process.env.GAMES_TEST_URL, 'Synthetic reading responses use local development only.');

const deck = (page: Page) =>
  page.getByRole('group', { name: 'Choose from your shuffled 78-card deck' });

async function soloRoom(
  page: Page,
  run: (roomId: string) => Promise<void>,
  inspectSetup?: () => Promise<void>,
) {
  let roomId: string | undefined;
  try {
    await page.goto('/');
    await openGameSetup(page, 'tarot');
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Spread QA');
    await inspectSetup?.();
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/games\/tarot\/play\/[\da-f-]+$/);
    roomId = new URL(page.url()).pathname.split('/').at(-1)!;
    await run(roomId);
  } finally {
    if (roomId) {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      const response = await requestAs(page, `rooms/${roomId}`);
      if (response.ok() && (await response.json()).status === 'playing')
        expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
      expect((await requestAs(page, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
    }
  }
}

test('solo setup omits seats and invitations and reading options retain saved reading navigation', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await soloRoom(
    page,
    async (roomId) => {
      const toolbar = page.locator('.room-toolbar');
      await expect(toolbar.getByRole('button', { name: 'Open chat', exact: true })).toHaveCount(0);
      await toolbar.getByRole('button', { name: 'Reading options', exact: true }).click();
      const options = page.getByRole('dialog', { name: 'Reading options', exact: true });
      await expect(
        options.getByRole('link', { name: 'Saved readings', exact: true }),
      ).toHaveAttribute('href', '/profile');
      await expect(
        options.getByRole('link', { name: 'Back to Tarot', exact: true }),
      ).toHaveAttribute('href', '/games/tarot');
      await expect(options.getByRole('button', { name: 'Open chat', exact: true })).toHaveCount(0);
      await expect(options.getByRole('button', { name: 'Game activity', exact: true })).toHaveCount(
        0,
      );
      await expect(
        options.getByRole('button', { name: 'Replace invite link and code', exact: true }),
      ).toHaveCount(0);
      await options.getByRole('button', { name: 'Close dialog', exact: true }).click();
      // A legacy paused solo room resumes directly without multiplayer lobby controls.
      expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).ok()).toBe(true);
      await page.reload();
      await expect(
        page.getByRole('heading', { name: 'Your next spread', exact: true }),
      ).toBeVisible();
      await expect(page.getByRole('group', { name: 'Invite friends', exact: true })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'I’m ready', exact: true })).toHaveCount(0);
      await page.getByRole('button', { name: 'Start reading', exact: true }).click();
      await expect(deck(page).locator('button.tarot-card')).toHaveCount(78);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    },
    async () => {
      const setup = page.getByRole('dialog', { name: 'Create room', exact: true });
      const seats = setup.getByRole('combobox', { name: 'Seats', exact: true });
      const game = setup.getByRole('combobox', { name: 'The game', exact: true });
      await expect(seats).toHaveCount(0);
      await expect(setup).toContainText('A private space for your own reading.');
      await expect(setup).not.toContainText('Invite-only.');
      await game.selectOption('uno');
      await expect(seats).toBeVisible();
      await expect(setup).toContainText('Invite-only. Share a link or room code to add friends.');
      await game.selectOption('tarot');
      await expect(seats).toHaveCount(0);
      await expect(setup).not.toContainText('Invite-only.');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    },
  );
});

test('each pick is revealed in its slot, named and focused; the deck is one Tab stop', async ({
  page,
  browserName,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    const recorded: VibratePattern[] = [];
    Object.defineProperty(window, '__tarotPickPulses', { configurable: true, value: recorded });
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: (pattern: VibratePattern) => {
        recorded.push(pattern);
        return true;
      },
    });
  });
  // This records optional API calls; it does not establish physical device feedback.
  const pulses = () =>
    page.evaluate(
      () => (window as typeof window & { __tarotPickPulses?: VibratePattern[] }).__tarotPickPulses,
    );
  await soloRoom(page, async (roomId) => {
    await expect(
      page.getByRole('heading', { name: 'Choose card 1 of 3 · Where you are' }),
    ).toBeVisible();
    const cards = deck(page).locator('button.tarot-card');
    await expect(cards).toHaveCount(78);
    await expect(page.locator('.turn-notice')).toHaveCount(0);
    await page.evaluate(async () => {
      await document.fonts.ready;
      window.scrollTo(0, 0);
    });
    const firstCardBox = await cards.first().boundingBox();
    expect(firstCardBox!.y).toBeGreaterThanOrEqual(0);
    expect(firstCardBox!.y).toBeLessThan(250);
    expect(firstCardBox!.height).toBeGreaterThanOrEqual(140);
    expect(
      await page
        .locator('.tarot-pick-area, .tarot-spread')
        .evaluateAll((elements) =>
          elements.map((element) =>
            element.classList.contains('tarot-pick-area') ? 'deck' : 'spread',
          ),
        ),
    ).toEqual(['deck', 'spread']);
    expect(await cards.evaluateAll((all) => all.filter((card) => card.tabIndex === 0).length)).toBe(
      1,
    );
    await expect(cards.first()).toHaveAccessibleName('Face-down card 1 of 78, for where you are');
    // Empty slots are drop targets, not tappable card backs.
    await expect(page.locator('.tarot-spread .tarot-card--back')).toHaveCount(0);
    await expect(page.locator('.tarot-spread-slot[data-next] .tarot-slot-empty')).toHaveText(
      'Your next card lands here',
    );

    // Lifting a card, then changing your mind, never sends a draw to the server.
    const lifted = deck(page).getByRole('button', { pressed: true });
    const submissions: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().endsWith(`/rooms/${roomId}/actions`))
        submissions.push(request.url());
    });
    await expect(lifted).toHaveCount(0);
    await cards.first().click();
    await expect(cards.first()).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Next tarot cards' }).click();
    await expect(lifted).toHaveCount(0);
    await page.getByRole('button', { name: 'Previous tarot cards' }).click();
    await expect(cards.first()).toBeInViewport();
    await cards.nth(2).click();
    await expect(cards.first()).toHaveAttribute('aria-pressed', 'false');
    await expect(cards.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(lifted).toHaveCount(1);
    expect(submissions).toHaveLength(0);
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(0);

    // A rejected confirmation retains the lifted choice for a retry.
    await page.route(
      `**/api/backend/v1/rooms/${roomId}/actions`,
      (route) => route.fulfill({ status: 503, json: { detail: 'Synthetic failed card pick.' } }),
      { times: 1 },
    );
    await cards.nth(2).click();
    await expect(page.locator('.room-error')).toBeVisible();
    await expect(cards.nth(2)).toHaveAttribute('aria-pressed', 'true');
    expect(submissions).toHaveLength(1);
    await expect(cards).toHaveCount(78);
    await expect(page.locator('.tarot-spread .tarot-name')).toHaveCount(0);
    expect(await pulses()).toEqual([]);

    // Two rapid confirmations during the same render must save only one card.
    await cards.nth(2).evaluate((button: HTMLButtonElement) => {
      button.click();
      button.click();
    });
    const first = page.locator('.tarot-spread-slot').first();
    await expect(first.locator('.tarot-name')).not.toBeEmpty();
    const name = (await first.locator('.tarot-name').textContent())!;
    await expect(first).toBeFocused();
    await expect(first).toBeInViewport({ ratio: 0.9 });
    await expect(page.getByRole('status').filter({ hasText: `You drew ${name}` })).toHaveText(
      `You drew ${name} for where you are.`,
    );
    for (const selector of ['.eyebrow', '.tarot-name', '.tarot-card-meaning']) {
      const size = await first
        .locator(selector)
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
      expect(size, selector).toBeGreaterThanOrEqual(11);
    }
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(1);
    await expect.poll(pulses).toEqual([12]);
    expect(submissions).toHaveLength(2);

    // Back to the deck, then a keyboard pick with arrow keys.
    await page.getByRole('button', { name: 'Choose card 2 of 3', exact: true }).click();
    await expect(deck(page).locator('button.tarot-card[tabindex="0"]')).toBeFocused();
    await page.keyboard.press('End');
    await expect(cards.last()).toBeFocused();
    await expect(cards.last()).toBeInViewport();
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator(':focus')).toHaveAccessibleName(/^Face-down card 76 of 77/);
    expect(await pulses()).toEqual([12]);
    // Native repeat on a held Enter key must not turn one keypress into two activations.
    await page.keyboard.down('Enter');
    await page.keyboard.down('Enter');
    await page.keyboard.down('Enter');
    await page.keyboard.up('Enter');
    await expect(cards.nth(75)).toHaveAttribute('aria-pressed', 'true');
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(1);
    expect(submissions).toHaveLength(2);
    await cards.nth(75).press('Space');
    const second = page.locator('.tarot-spread-slot').nth(1);
    await expect(second.locator('.tarot-name')).not.toBeEmpty();
    await expect(second).toBeFocused();
    await expect.poll(pulses).toEqual([12, 12]);
    // WebKit's native Tab policy skips ordinary buttons; Option-Tab includes all controls.
    await page.keyboard.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
    await expect(page.locator(':focus')).toHaveText('Choose card 3 of 3');

    // A refresh mid-spread keeps both cards and does not replay the reveal.
    const names = await page.locator('.tarot-spread .tarot-name').allTextContents();
    await page.reload();
    await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(names);
    await expect(page.locator('[data-fresh]')).toHaveCount(0);
    expect(await pulses()).toEqual([]);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await drawTarotCard(page);
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeVisible();
    await expect(page.locator('.tarot-spread .tarot-name')).toHaveCount(3);
    expect(await pulses()).toEqual([]);
    expect(
      await page
        .locator('.tarot-spread-slot')
        .nth(2)
        .locator('.tarot-card')
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe('none');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
});

test('a phone scrub lifts the card under the finger and a vertical swipe scrolls the table', async ({
  page,
  browserName,
  isMobile,
}) => {
  test.skip(!isMobile || browserName !== 'chromium', 'Sends native touch input through Chromium.');
  await page.setViewportSize({ width: 390, height: 680 });
  await soloRoom(page, async (roomId) => {
    const cards = deck(page).locator('button.tarot-card');
    await expect(cards).toHaveCount(78);
    const target = cards.nth(3);
    const face = target.locator('.tarot-fan-face');
    const initialFace = await face.boundingBox();
    const start = await cards.first().boundingBox();
    const end = await target.boundingBox();
    expect(start).not.toBeNull();
    expect(end).not.toBeNull();
    const x = start!.x + start!.width / 2;
    const y = start!.y + start!.height * 0.6;
    const lastX = end!.x + end!.width / 2;
    const session = await page.context().newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', px = x, py = y) =>
      session.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x: px, y: py }],
      });
    try {
      await touch('touchStart');
      for (let step = 1; step <= 6; step++) await touch('touchMove', x + ((lastX - x) * step) / 6);
      await touch('touchEnd');
      await expect(target).toHaveAttribute('aria-pressed', 'true');
      await expect.poll(async () => (await face.boundingBox())!.y).toBeLessThan(initialFace!.y - 5);
      await expect(page.locator('.tarot-spread .tarot-name')).toHaveCount(0);

      const previousTop = await page.evaluate(() => scrollY);
      await touch('touchStart');
      for (let step = 1; step <= 8; step++) await touch('touchMove', x, y - step * 15);
      await touch('touchEnd');
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(previousTop);
      await expect(target).toHaveAttribute('aria-pressed', 'true');
      expect((await roomAs(page, roomId)).game!.community).toHaveLength(0);
      // The lifted picture itself is the target, including the side that used to overlap a neighbour.
      await target.scrollIntoViewIfNeeded();
      const raised = (await face.boundingBox())!;
      await page.touchscreen.tap(raised.x + raised.width * 0.78, raised.y + raised.height * 0.4);
      await expect(cards).toHaveCount(77);
      expect((await roomAs(page, roomId)).game!.community).toHaveLength(1);
    } finally {
      await session.detach();
    }
  });
});

test('the oracle and foil respond to the pointer while the lifted card stays playable', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Checks a fine pointer. The touch gesture is covered separately.');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await soloRoom(page, async (roomId) => {
    const stage = page.locator('.tarot-fan-stage');
    const scene = stage.locator('.tarot-oracle-scene');
    const instrument = scene.locator('.tarot-oracle-instrument');
    const card = deck(page).getByRole('button', { name: /^Face-down card 3 of 78,/ });
    const surface = card.locator('.tarot-fan-face .tarot-card');
    const transform = () => surface.evaluate((element) => getComputedStyle(element).transform);
    await expect(instrument).toBeVisible();
    await expect(scene).toHaveAttribute('aria-hidden', 'true');
    await expect(scene).toHaveCSS('pointer-events', 'none');
    await card.click();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    const area = (await scene.boundingBox())!;
    const lane = (await card.boundingBox())!;
    const move = (fraction: number) =>
      page.mouse.move(area.x + area.width * fraction, area.y + area.height * 0.3);
    await move(0.2);
    await expect.poll(transform).toMatch(/^matrix3d\(/);
    const look = () =>
      stage.evaluate(
        (element) =>
          Number.parseFloat(getComputedStyle(element).getPropertyValue('--oracle-look-x')) || 0,
      );
    await expect.poll(look).toBeLessThan(0);
    const firstAngle = await transform();
    const firstOrbit = await instrument.evaluate((element) => getComputedStyle(element).transform);
    await move(0.8);
    await expect.poll(look).toBeGreaterThan(0);
    await expect.poll(transform).not.toBe(firstAngle);
    await expect(instrument).not.toHaveCSS('transform', firstOrbit);
    expect(await card.boundingBox()).toEqual(lane);
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await move(0.25);
    await expect.poll(transform).toBe('none');
    await expect.poll(look).toBe(0);
    await expect(instrument).toBeVisible();
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await card.press('Enter');
    await expect(page.locator('.tarot-spread-slot .tarot-name')).toHaveCount(1);
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(1);
  });
});

test('an unsent question survives a refresh and the deck filter stays pinned', async ({ page }) => {
  await soloRoom(page, async () => {
    for (let card = 0; card < 3; card++) await drawTarotCard(page);
    const question = page.getByRole('textbox', { name: /What’s on your mind/ });
    await question.fill('Which small habit should I start this month?');
    await page.reload();
    await expect(question).toHaveValue('Which small habit should I start this month?');

    await page.getByRole('button', { name: 'Explore the deck', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await dialog.getByRole('button', { name: 'Pentacles', exact: true }).click();
    await dialog.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(dialog.getByRole('button', { name: 'Swords', exact: true })).toBeInViewport();
    await expect(
      dialog.getByRole('button', { name: 'Close dialog', exact: true }),
    ).toBeInViewport();
    const covered = await dialog.evaluate((element) => {
      const box = element.getBoundingClientRect();
      return document
        .elementFromPoint(box.left + box.width / 2, box.top + 4)
        ?.closest('.modal-heading')
        ? 'heading'
        : 'content';
    });
    expect(covered).toBe('heading');
  });
});

test('a failed saved-reading check retries only GET and restores the question and reading action', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await soloRoom(page, async (roomId) => {
    let recover = false;
    let successfulChecks = 0;
    const methods: string[] = [];
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, (route) => {
      const method = route.request().method();
      methods.push(method);
      if (method !== 'GET') return route.abort();
      if (!recover)
        return route.fulfill({ status: 503, json: { detail: 'Synthetic saved-reading outage.' } });
      successfulChecks += 1;
      return route.fulfill({
        json: { status: 'ready', reading: null, api_tier: 'paid', question: '', message: '' },
      });
    });
    for (let card = 0; card < 3; card++) await drawTarotCard(page);
    const spreadNames = page.locator('.tarot-spread .tarot-name');
    await expect(spreadNames).toHaveCount(3);
    const names = await spreadNames.allTextContents();
    const error = page.getByRole('alert').filter({ hasText: 'Couldn’t check your reading.' });
    await expect(error).toBeVisible();
    const read = page.getByRole('button', { name: 'Read my cards', exact: true });
    await expect(read).toHaveCount(0);
    const question = page.getByRole('textbox', { name: /What’s on your mind/ });
    const draft = 'Which small habit should I give more time to?';
    await question.fill(draft);
    const attemptsBeforeRetry = methods.length;
    recover = true;
    await page.getByRole('button', { name: 'Check status', exact: true }).click();
    await expect(read).toBeEnabled();
    await expect(error).toHaveCount(0);
    await expect(question).toHaveValue(draft);
    await expect(spreadNames).toHaveText(names);
    expect(successfulChecks).toBe(1);
    expect(methods.length).toBeGreaterThan(attemptsBeforeRetry);
    expect(methods.every((method) => method === 'GET')).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
});

test('a finished solo reading offers a one-tap new spread and wraps credits on a phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await soloRoom(page, async (roomId) => {
    for (let card = 0; card < 3; card++) await drawTarotCard(page);
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeVisible();
    const room = await roomAs(page, roomId);
    const cards = room.game!.community;
    const savedQuestion = 'How can I make a little room for a creative hobby this week?';
    const characters = [
      ['Michael Scott', 'The Office'],
      ['Hermione Granger', 'Harry Potter'],
      ['Villanelle', 'Killing Eve'],
    ];
    // Constructed: the finished room and reading are synthetic responses; no reading is requested.
    await page.route(new RegExp(`/api/backend/v1/rooms/${roomId}(/heartbeat)?$`), async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      await route.fulfill({
        response,
        json: {
          ...body,
          status: 'finished',
          revision: body.revision + 1,
          game: { ...body.game, phase: 'finished', message: 'Your reading is ready.', actions: [] },
        },
      });
    });
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, (route) =>
      route.request().method() === 'GET'
        ? route.fulfill({
            json: {
              status: 'complete',
              api_tier: 'paid',
              question: savedQuestion,
              message: '',
              reading: {
                ...tarotReadingExample,
                cards: tarotReadingExample.cards.map((card, index) => ({
                  ...card,
                  card_id: cards[index].id,
                  title: cards[index].label,
                  characters: [
                    {
                      name: characters[index][0],
                      source: characters[index][1],
                      connection: 'Synthetic connection line.',
                    },
                  ],
                })),
              },
            },
          })
        : route.abort(),
    );
    const sent: string[] = [];
    await page.route(
      new RegExp(`/api/backend/v1/rooms/${roomId}/(ready|start)$`),
      async (route) => {
        sent.push(route.request().url().split('/').at(-1)!);
        if (sent.length === 1) {
          await route.fulfill({ status: 503, json: { detail: 'Synthetic rematch failure.' } });
          return;
        }
        const response = await route.fetch({
          method: 'GET',
          url: route
            .request()
            .url()
            .replace(/\/(ready|start)$/, ''),
        });
        await route.fulfill({ response });
      },
    );
    await page.reload();
    await expect(page.locator('.tarot-reading')).toBeVisible();
    await expect(page.locator('.tarot-saved-question')).toHaveText(savedQuestion);
    const again = page.getByRole('button', { name: 'Draw a new spread', exact: true });
    await expect(again).toHaveCount(2);
    await expect(again.first()).toBeInViewport();
    await expect(page.locator('.tarot-reading-card-heading .tarot-card')).toHaveCount(3);
    await page.locator('.tarot-image-credits summary').click();
    await expect(page.locator('.tarot-image-credits li').first()).toContainText(
      'Michael Scott: nbc.com',
    );
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await again.first().click();
    await expect(page.locator('.tarot-intro [role="alert"]')).toHaveText(
      'Couldn’t start a new spread.',
    );
    await expect(again.first()).toBeEnabled();
    expect(sent).toEqual(['ready']);
    await again.first().click();
    await expect.poll(() => sent).toEqual(['ready', 'ready', 'start']);
  });
});
