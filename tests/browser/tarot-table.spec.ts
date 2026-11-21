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
    // The viewer's own pick turns over from the back they chose; nothing else is shown.
    expect(
      await first
        .locator('.tarot-card')
        .evaluate((element) => getComputedStyle(element).animationName),
    ).toBe('tarot-flip-face');
    await expect(first.locator('.tarot-flip-back')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.tarot-flip-back')).toHaveCount(1);
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
    // With reduced motion the back never appears over the revealed face.
    expect(
      await page
        .locator('.tarot-spread-slot')
        .nth(2)
        .locator('.tarot-flip-back')
        .evaluateAll((backs) => backs.every((back) => getComputedStyle(back).opacity === '0')),
    ).toBe(true);
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
  browserName,
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
    // The reading opens with its question, then "In short": synthesis, next step, three jumps.
    await expect(page.locator('.tarot-asked')).toHaveText(`You asked${savedQuestion}`);
    const summary = page.getByRole('region', { name: 'In short', exact: true });
    await expect(summary.locator('.tarot-summary-lead')).toHaveText(
      tarotReadingExample.introduction,
    );
    await expect(summary.locator('.tarot-summary-step p')).toHaveText(
      tarotReadingExample.next_step,
    );
    expect(
      await summary.evaluate(
        (panel) =>
          panel.getBoundingClientRect().top <
          document.querySelector('.tarot-spread')!.getBoundingClientRect().bottom,
      ),
      'the summary floats over the lower edge of the table',
    ).toBe(true);
    const jumps = summary.getByRole('list', { name: 'Jump to a card' }).getByRole('link');
    await expect(jumps).toHaveText(
      cards.map(
        (card, index) =>
          `${['Where you are', 'What is shifting', 'Your next move'][index]}${card.label}`,
      ),
    );
    for (const jump of await jumps.all())
      expect((await jump.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await jumps.nth(2).click();
    await expect(page.locator(`#reading-${cards[2].id}`)).toBeInViewport();
    // Each section names its position, what it asks, and that the card is upright.
    await expect(page.locator('.tarot-position-meaning')).toHaveText([
      'UprightA starting point to reflect on.',
      'UprightWhat could be changing or asking for attention.',
      'UprightOne possible direction to consider.',
    ]);
    for (const selector of ['.tarot-perspectives p', '.tarot-summary-step p', '.tarot-next-step p'])
      expect(
        await page
          .locator(selector)
          .first()
          .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
        selector,
      ).toBeGreaterThanOrEqual(15);
    // A thumbnail and a spread card both open the full card; closing returns focus.
    const thumbnail = page
      .locator('.tarot-reading-card-heading')
      .first()
      .getByRole('button', { name: `View ${cards[0].label} card`, exact: true });
    await thumbnail.click();
    const detail = page.getByRole('dialog', { name: cards[0].label, exact: true });
    await expect(detail).toContainText('Where you are. A starting point to reflect on.');
    await expect(detail).toContainText('Upright. This deck reads every card upright.');
    await expect(detail).toContainText(cards[0].subtitle!);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.keyboard.press('Escape');
    await expect(detail).toHaveCount(0);
    await expect(thumbnail).toBeFocused();
    await page
      .locator('.tarot-spread')
      .getByRole('button', { name: `View ${cards[1].label} card`, exact: true })
      .click();
    await expect(page.getByRole('dialog', { name: cards[1].label, exact: true })).toContainText(
      'What is shifting.',
    );
    await page.keyboard.press('Escape');
    // Keeping it: plain text to the clipboard, and the private saved copy.
    const keep = page.getByRole('group', { name: 'Keep this reading', exact: true });
    await expect(keep.getByRole('link', { name: 'Saved reading', exact: true })).toHaveAttribute(
      'href',
      `/games/tarot/readings/${(await roomAs(page, roomId)).match_id}`,
    );
    if (browserName === 'chromium') {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
      await keep.getByRole('button', { name: 'Copy reading', exact: true }).click();
      await expect(keep.getByRole('button', { name: 'Copied', exact: true })).toBeVisible();
      await expect(keep.getByRole('status')).toHaveText('Reading copied.');
      const copied = await page.evaluate(() => navigator.clipboard.readText());
      expect(
        copied.startsWith(`${tarotReadingExample.title}\n\nQuestion: ${savedQuestion}\n\n`),
      ).toBe(true);
      expect(copied).toContain(`1. Where you are: ${cards[0].label} (upright)`);
      expect(copied).toContain(`Next small move: ${tarotReadingExample.next_step}`);
      expect(copied).not.toContain('Michael Scott');
    }
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

test('the table says when a reading is being written, unavailable or offline', async ({
  page,
  context,
}) => {
  await page.setViewportSize({ width: 390, height: 760 });
  await soloRoom(page, async (roomId) => {
    for (let card = 0; card < 3; card++) await drawTarotCard(page);
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeVisible();
    const names = await page.locator('.tarot-spread .tarot-name').allTextContents();
    const table = page.locator('.tarot-table');
    const heading = table.getByRole('heading', { level: 2 });
    const status = page.locator('.tarot-reading-status');
    await expect(heading).toHaveText('Your three-card spread');
    const ready = 'Add a question if you like, then ask for your reading.';
    await expect(status).toHaveText(ready);
    const readyBox = (await status.boundingBox())!;
    // The complete spread sits on its table; every label and meaning stays readable there.
    for (const selector of ['.tarot-spread-slot > .eyebrow', '.tarot-card-meaning'])
      expect(
        await page
          .locator(`.tarot-spread ${selector}`)
          .first()
          .evaluate((element) => {
            const rgb = getComputedStyle(element).color.match(/\d+/g)!.map(Number);
            const channel = (value: number) =>
              value / 255 <= 0.03928 ? value / 255 / 12.92 : ((value / 255 + 0.055) / 1.055) ** 2.4;
            const light =
              0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
            // Against the brightest velvet pixel under the stage's dark wash (#4f333f).
            return (light + 0.05) / (0.0418 + 0.05);
          }),
        selector,
      ).toBeGreaterThanOrEqual(4.5);

    // Constructed: synthetic saved-reading states; no reading is requested.
    let view: Record<string, unknown> = {};
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, (route) =>
      route.request().method() === 'GET'
        ? route.fulfill({
            json: { api_tier: 'paid', question: '', message: '', reading: null, ...view },
          })
        : route.abort(),
    );
    const now = Date.now() / 1000;
    view = {
      status: 'generating',
      progress: {
        stage: 'writing',
        provider: 'Gemini',
        attempt: 1,
        max_attempts: 2,
        started_at: now - 10,
        updated_at: now,
        estimated_percent: 40,
        estimated_seconds_remaining: 20,
      },
    };
    await page.reload();
    await expect(heading).toHaveText('Writing your reading…');
    await expect(heading).toBeInViewport();
    await expect(status).toHaveText('Your three cards are saved while the reading is written.');
    await expect(table).toHaveAttribute('data-reading-state', 'writing');
    // The same line changes in place: asking for a reading does not push the form down.
    expect(Math.abs((await status.boundingBox())!.height - readyBox.height)).toBeLessThanOrEqual(1);
    // Progress keeps the one live announcement; the heading does not repeat it aloud.
    await expect(status).not.toHaveAttribute('role', 'status');
    await expect(
      page.getByRole('region', { name: 'Reading progress' }).getByRole('status'),
    ).toHaveText('Writing your reading.');
    await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(names);

    view = { status: 'unavailable', message: 'Readings are unavailable.' };
    await page.reload();
    await expect(heading).toHaveText('Readings are unavailable right now');
    await expect(status).toHaveText(
      'Your cards are saved. You can ask for your reading once the service is back.',
    );
    await expect(status).toHaveAttribute('role', 'status');
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeDisabled();
    await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(names);

    view = { status: 'ready' };
    await page.reload();
    await expect(heading).toHaveText('Your three-card spread');
    await context.setOffline(true);
    try {
      await expect(heading).toHaveText('You’re offline');
      await expect(status).toHaveText('Your cards are saved. Reconnect to ask for your reading.');
      await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(names);
      await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeDisabled();
    } finally {
      await context.setOffline(false);
    }
    await expect(heading).toHaveText('Your three-card spread');
    await expect(status).toHaveText(ready);
    await expect(status).not.toHaveAttribute('role', 'status');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
});

test('a refused solo-reading invite explains itself and stays on the join page', async ({
  page,
  browser,
}) => {
  const refusal =
    "This is a private Tarot reading, so it can't be joined. Start your own reading from the games library.";
  await soloRoom(page, async (roomId) => {
    const room = await roomAs(page, roomId);
    const visitorContext = await browser.newContext();
    try {
      const visitor = await visitorContext.newPage();
      // Constructed: the service's own refusal (backend/tests/test_tarot_archive.py proves the
      // rule in a disposable database). Nothing reaches the room, so no visitor is ever added.
      let attempts = 0;
      await visitor.route('**/api/backend/v1/rooms/join', (route) => {
        attempts++;
        return route.fulfill({ status: 409, json: { detail: refusal } });
      });
      await visitor.goto(`/join/${room.code}`);
      const join = visitor.getByRole('dialog');
      await join.getByRole('textbox', { name: 'Your name', exact: true }).fill('Visitor');
      await join.getByRole('button', { name: 'Join the room', exact: true }).click();
      await expect(join.getByRole('alert')).toHaveText(refusal);
      await expect(visitor).toHaveURL(/\/join\//);
      expect(attempts).toBe(1);
      expect(await visitor.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    } finally {
      await visitorContext.close();
    }
    // The owner's table is unchanged: one member, no spectator.
    expect((await roomAs(page, roomId)).members).toHaveLength(1);
  });
});
