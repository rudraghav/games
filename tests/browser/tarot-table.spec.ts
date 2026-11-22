import { expect, test, type Page } from '@playwright/test';
import { tarotReadingExample } from '../../apps/web/src/stories/fixtures/tarot-reading';
import cardGuide from '../../packages/api-client/src/generated/tarot-card-guide.json' with { type: 'json' };
import { drawTarotCard, openGameSetup, requestAs, roomAs } from './helpers';

test.use({ trace: 'off', screenshot: 'off' });
test.skip(!!process.env.GAMES_TEST_URL, 'Synthetic reading responses use local development only.');

const deck = (page: Page) =>
  page.getByRole('group', { name: 'Choose from your shuffled 78-card deck' });

type Drawn = { id: string; label: string; subtitle?: string; orientation?: string | null };
/** The same draw with fixed orientations: the middle card reversed, the others upright. */
function withMiddleReversed<Card extends Drawn>(cards: Card[]) {
  return cards.map((card, index) => {
    const orientation = index === 1 ? ('reversed' as const) : ('upright' as const);
    return {
      ...card,
      orientation,
      subtitle: cardGuide.find((entry) => entry.id === card.id)![orientation].short,
    };
  });
}

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
    // The first back lies in the back row: its tap strip is short, its picture a full card.
    expect(firstCardBox!.height).toBeGreaterThanOrEqual(44);
    expect((await cards.first().locator('.tarot-fan-face').boundingBox())!.height).toBeGreaterThan(
      140,
    );
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

    // Browsing the deck never sends a draw to the server.
    const submissions: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST' && request.url().endsWith(`/rooms/${roomId}/actions`))
        submissions.push(request.url());
    });
    // No back is a toggle: there is no lifted state to confirm.
    await expect(deck(page).locator('button[aria-pressed]')).toHaveCount(0);
    // All 78 backs in three overlapped rows in a native scroller; the readout says which
    // are in view.
    const ribbon = page.locator('.tarot-deck');
    const range = page.locator('.tarot-deck-range');
    await expect(range).toHaveText(/^Cards 1–\d+ of 78$/);
    const shownAtStart = Number((await range.textContent())!.match(/–(\d+) of/)![1]);
    // Even the narrowest phone shows fifteen or more backs at once.
    expect(shownAtStart).toBeGreaterThanOrEqual(15);
    expect(await cards.evaluateAll((backs) => new Set(backs.map((back) => back.getAttribute('data-row'))).size)).toBe(3);
    // Every back keeps a tap strip of at least 44px each way.
    expect(
      await cards.evaluateAll((backs) =>
        Math.min(
          ...backs.flatMap((back) => {
            const box = back.getBoundingClientRect();
            return [box.width, box.height];
          }),
        ),
      ),
    ).toBeGreaterThanOrEqual(44);
    // The strips never overlap, so a tap always belongs to exactly one back.
    expect(
      await cards.evaluateAll((backs) => {
        const boxes = backs.map((back) => back.getBoundingClientRect());
        return boxes.some((a, i) =>
          boxes.some(
            (b, j) =>
              j > i &&
              a.left < b.right - 0.5 &&
              b.left < a.right - 0.5 &&
              a.top < b.bottom - 0.5 &&
              b.top < a.bottom - 0.5,
          ),
        );
      }),
    ).toBe(false);
    expect(await ribbon.evaluate((view) => view.scrollWidth > view.clientWidth * 2)).toBe(true);
    expect(await ribbon.evaluate((view) => getComputedStyle(view).overflowX)).toBe('auto');
    expect(await ribbon.evaluate((view) => getComputedStyle(view).scrollSnapType)).toContain('x');
    // An arrow pages by about a screenful.
    await page.getByRole('button', { name: 'Next tarot cards' }).click();
    await expect(range).not.toHaveText(/^Cards 1–/);
    // The page turn glides; read where it comes to rest.
    await ribbon.evaluate(
      (view) =>
        new Promise<void>((resolve) => {
          let last = -1;
          let still = 0;
          const check = () => {
            still = view.scrollLeft === last ? still + 1 : 0;
            last = view.scrollLeft;
            if (still >= 8) resolve();
            else requestAnimationFrame(check);
          };
          check();
        }),
    );
    const paged = Number((await range.textContent())!.match(/^Cards (\d+)–/)![1]);
    expect(paged).toBeGreaterThan(shownAtStart / 2);
    expect(paged).toBeLessThanOrEqual(shownAtStart + 1);
    // Scrolling by wheel, trackpad or finger is the browser's own; the readout follows it.
    await ribbon.evaluate((view) => view.scrollTo({ left: view.scrollWidth, behavior: 'instant' }));
    await expect(range).toHaveText(/^Cards \d+–78 of 78$/);
    await expect(cards.last()).toBeInViewport();
    await ribbon.evaluate((view) => view.scrollTo({ left: 0, behavior: 'instant' }));
    await expect(range).toHaveText(/^Cards 1–\d+ of 78$/);
    await page.getByRole('button', { name: 'Next tarot cards' }).click();
    await expect(range).not.toHaveText(/^Cards 1–/);
    await page.getByRole('button', { name: 'Previous tarot cards' }).click();
    await expect(cards.first()).toBeInViewport();
    await expect(range).toHaveText(/^Cards 1–\d+ of 78$/);
    // The bar under the deck moves through every card and follows the deck back.
    const bar = page.getByRole('slider', { name: 'Scroll the deck', exact: true });
    expect((await bar.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await expect(bar).toHaveValue('0');
    await bar.focus();
    await page.keyboard.press('End');
    await expect(range).toHaveText(/^Cards \d+–78 of 78$/);
    await expect(bar).toHaveAttribute('aria-valuetext', /^Cards \d+ to 78 of 78$/);
    await page.keyboard.press('Home');
    await expect(range).toHaveText(/^Cards 1–\d+ of 78$/);
    await ribbon.evaluate((view) => view.scrollTo({ left: 132, behavior: 'instant' }));
    await expect(bar).toHaveValue('132');
    await ribbon.evaluate((view) => view.scrollTo({ left: 0, behavior: 'instant' }));
    expect(submissions).toHaveLength(0);
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(0);

    // A rejected save leaves the deck as it was, and the same back can be tried again.
    await page.route(
      `**/api/backend/v1/rooms/${roomId}/actions`,
      (route) => route.fulfill({ status: 503, json: { detail: 'Synthetic failed card pick.' } }),
      { times: 1 },
    );
    await cards.nth(2).click();
    await expect(page.locator('.room-error')).toBeVisible();
    expect(submissions).toHaveLength(1);
    await expect(cards).toHaveCount(78);
    await expect(cards.nth(2)).toBeEnabled();
    await expect(page.locator('.tarot-spread .tarot-name')).toHaveCount(0);
    expect(await pulses()).toEqual([]);

    // One click reveals the card. The rest of a double click in the same burst is dropped,
    // so one gesture never saves two cards.
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
    // The server decides how the card lands; the page says it in words wherever it shows.
    const landed = (await first.getAttribute('data-orientation'))!;
    expect(['upright', 'reversed']).toContain(landed);
    const spoken = landed === 'reversed' ? `${name}, reversed` : name;
    await expect(page.getByRole('status').filter({ hasText: `You drew ${name}` })).toHaveText(
      `You drew ${landed === 'reversed' ? `${name}, reversed,` : name} for where you are.`,
    );
    await expect(first).toHaveAccessibleName(new RegExp(`^Card 1, Where you are: ${spoken}\\. `));
    await expect(first.locator('.tarot-reversed-word')).toHaveCount(landed === 'reversed' ? 1 : 0);
    await expect(first.locator('.tarot-art')).toHaveCSS(
      'rotate',
      landed === 'reversed' ? '180deg' : 'none',
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
    await expect(page.locator('.tarot-deck-range')).toHaveText(/^Cards \d+–77 of 77$/);
    // Cards fill each column from the back row to the front: 77 backs end with card 77
    // in the middle row. Up and Down move between rows, Left and Right along a row.
    await page.keyboard.press('ArrowUp');
    await expect(page.locator(':focus')).toHaveAccessibleName(/^Face-down card 76 of 77/);
    await page.keyboard.press('ArrowLeft');
    await expect(page.locator(':focus')).toHaveAccessibleName(/^Face-down card 73 of 77/);
    await page.keyboard.press('ArrowDown');
    await expect(page.locator(':focus')).toHaveAccessibleName(/^Face-down card 74 of 77/);
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(':focus')).toHaveAccessibleName(/^Face-down card 77 of 77/);
    await expect(page.locator(':focus')).toBeInViewport();
    expect(await pulses()).toEqual([12]);
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(1);
    expect(submissions).toHaveLength(2);
    // Enter reveals the focused card. Native repeat on a held key must not turn one
    // keypress into two draws.
    await page.keyboard.down('Enter');
    await page.keyboard.down('Enter');
    await page.keyboard.down('Enter');
    await page.keyboard.up('Enter');
    const second = page.locator('.tarot-spread-slot').nth(1);
    await expect(second.locator('.tarot-name')).not.toBeEmpty();
    await expect(second).toBeFocused();
    await expect.poll(pulses).toEqual([12, 12]);
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(2);
    expect(submissions).toHaveLength(3);
    // WebKit's native Tab policy skips ordinary buttons; Option-Tab includes all controls.
    const tab = browserName === 'webkit' ? 'Alt+Tab' : 'Tab';
    // The revealed card is the next stop: it opens its own page.
    await page.keyboard.press(tab);
    await expect(page.locator(':focus')).toHaveAccessibleName(/^View .+ card/);
    await expect(second.locator('button.tarot-card')).toBeFocused();
    await page.keyboard.press(tab);
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

test('a phone swipe or the bar scrolls the deck, a vertical swipe scrolls the table and one tap reveals a card', async ({
  page,
  browserName,
  isMobile,
}) => {
  test.skip(!isMobile || browserName !== 'chromium', 'Sends native touch input through Chromium.');
  await page.setViewportSize({ width: 390, height: 680 });
  await soloRoom(page, async (roomId) => {
    const cards = deck(page).locator('button.tarot-card');
    await expect(cards).toHaveCount(78);
    const ribbon = page.locator('.tarot-deck');
    const range = page.locator('.tarot-deck-range');
    await expect(range).toHaveText(/^Cards 1–\d+ of 78$/);
    // Three rows of about eight backs across a phone, each with a 44px tap strip.
    const shown = Number((await range.textContent())!.match(/–(\d+) of/)![1]);
    expect(shown).toBeGreaterThanOrEqual(20);
    expect(shown).toBeLessThanOrEqual(30);
    await expect(page.locator('.tarot-lift-hint')).toContainText(
      'Swipe the cards or drag the bar. Tap a card to reveal it.',
    );
    const start = (await cards.nth(14).boundingBox())!;
    const x = start.x + start.width / 2;
    const y = start.y + start.height * 0.6;
    const session = await page.context().newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', px = x, py = y) =>
      session.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: type === 'touchEnd' ? [] : [{ x: px, y: py }],
      });
    try {
      // A sideways drag moves the deck itself; it never reveals a card.
      await touch('touchStart');
      for (let step = 1; step <= 8; step++) await touch('touchMove', x - step * 22);
      await touch('touchEnd');
      await expect.poll(() => ribbon.evaluate((view) => view.scrollLeft)).toBeGreaterThan(100);
      await expect(range).not.toHaveText(/^Cards 1–/);
      await expect(cards).toHaveCount(78);
      expect((await roomAs(page, roomId)).game!.community).toHaveLength(0);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );

      // A finger dragged along the bar under the deck moves through every card.
      const bar = page.getByRole('slider', { name: 'Scroll the deck', exact: true });
      const track = (await bar.boundingBox())!;
      const barY = track.y + track.height / 2;
      await touch('touchStart', track.x + track.width * 0.5, barY);
      for (let step = 1; step <= 8; step++)
        await touch('touchMove', track.x + track.width * (0.5 + step * 0.06), barY);
      await touch('touchEnd');
      await expect(range).toHaveText(/^Cards \d+–78 of 78$/);
      await expect(cards.last()).toBeInViewport();
      await touch('touchStart', track.x + track.width * 0.9, barY);
      for (let step = 1; step <= 8; step++)
        await touch('touchMove', track.x + track.width * (0.9 - step * 0.11), barY);
      await touch('touchEnd');
      await expect(range).toHaveText(/^Cards 1–\d+ of 78$/);
      await expect(cards).toHaveCount(78);

      // A vertical drag that starts on the backs still scrolls the page, and draws nothing.
      await page.evaluate(() => window.scrollTo(0, 0));
      const backs = (await cards.nth(11).boundingBox())!;
      const dragX = backs.x + backs.width / 2;
      const dragY = backs.y + backs.height * 0.6;
      await touch('touchStart', dragX, dragY);
      for (let step = 1; step <= 8; step++) await touch('touchMove', dragX, dragY - step * 15);
      await touch('touchEnd');
      await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(0);
      await expect(cards).toHaveCount(78);
      expect((await roomAs(page, roomId)).game!.community).toHaveLength(0);

      // One tap on a back, here in the back row, reveals it.
      const target = cards.nth(9);
      await target.scrollIntoViewIfNeeded();
      await expect(target).toHaveAttribute('data-row', '0');
      await target.tap();
      await expect(cards).toHaveCount(77);
      await expect(page.locator('.tarot-spread .tarot-name')).toHaveCount(1);
      expect((await roomAs(page, roomId)).game!.community).toHaveLength(1);
    } finally {
      await session.detach();
    }
  });
});

test('a pointed-at back comes up, the oracle follows the pointer and one click reveals', async ({
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
    const face = card.locator('.tarot-fan-face');
    const surface = face.locator('.tarot-card');
    const transform = () => surface.evaluate((element) => getComputedStyle(element).transform);
    await expect(instrument).toBeVisible();
    await expect(scene).toHaveAttribute('aria-hidden', 'true');
    await expect(scene).toHaveCSS('pointer-events', 'none');
    // Pointing at a back brings the whole of it above the deck, without moving its target.
    const lane = (await card.boundingBox())!;
    const resting = (await face.boundingBox())!;
    await card.hover();
    await expect(face).toHaveCSS('z-index', '1000');
    await expect.poll(async () => (await face.boundingBox())!.y).toBeLessThan(resting.y - 5);
    expect(await card.boundingBox()).toEqual(lane);
    const area = (await scene.boundingBox())!;
    const move = (fraction: number) =>
      page.mouse.move(area.x + area.width * fraction, area.y + area.height * 0.3);
    const look = () =>
      stage.evaluate(
        (element) =>
          Number.parseFloat(getComputedStyle(element).getPropertyValue('--oracle-look-x')) || 0,
      );
    await move(0.2);
    await expect.poll(look).toBeLessThan(0);
    const firstOrbit = await instrument.evaluate((element) => getComputedStyle(element).transform);
    await move(0.8);
    await expect.poll(look).toBeGreaterThan(0);
    await expect(instrument).not.toHaveCSS('transform', firstOrbit);
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(0);

    // One click reveals. While the draw is saved, the chosen back stays raised and lit.
    let release = () => {};
    const held = new Promise<void>((resolve) => (release = resolve));
    await page.route(
      `**/api/backend/v1/rooms/${roomId}/actions`,
      async (route) => {
        await held;
        await route.continue();
      },
      { times: 1 },
    );
    await card.click();
    await expect(card).toHaveAttribute('data-picked', 'true');
    await expect(card).toBeDisabled();
    await expect(page.locator('.tarot-lift-hint')).toHaveText('Drawing your card…');
    await expect(face).toHaveCSS('z-index', '1002');
    await move(0.2);
    await expect.poll(transform).toMatch(/^matrix3d\(/);
    const firstAngle = await transform();
    await move(0.8);
    await expect.poll(transform).not.toBe(firstAngle);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await move(0.25);
    await expect.poll(transform).toBe('none');
    await expect.poll(look).toBe(0);
    await expect(instrument).toBeVisible();
    release();
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

test('the gallery opens any card page, moves between cards and returns to the same place', async ({
  page,
  isMobile,
}) => {
  await soloRoom(page, async (roomId) => {
    const opener = page.getByRole('button', { name: 'Explore the deck', exact: true });
    await opener.click();
    const dialog = page.getByRole('dialog', { name: 'The whole cosmic cast', exact: true });
    const grid = dialog.getByRole('list', { name: 'Tarot cards', exact: true });
    const tiles = grid.getByRole('button');
    await expect(tiles).toHaveCount(78);
    // The grid is one Tab stop; arrow keys, Home and End move inside it.
    expect(await tiles.evaluateAll((all) => all.filter((tile) => tile.tabIndex === 0).length)).toBe(
      1,
    );
    await dialog.getByRole('button', { name: 'Cups', exact: true }).click();
    await expect(tiles).toHaveCount(14);
    await expect(tiles.first()).toHaveAttribute('tabindex', '0');
    await tiles.first().focus();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByRole('button', { name: 'Two of Cups', exact: true })).toBeFocused();
    const columns = await grid.evaluate((list) => {
      const tops = [...list.children].map((item) => Math.round(item.getBoundingClientRect().top));
      return tops.filter((top) => top === tops[0]).length;
    });
    await page.keyboard.press('ArrowDown');
    await expect(tiles.nth(1 + columns)).toBeFocused();
    await page.keyboard.press('ArrowUp');
    await expect(tiles.nth(1)).toBeFocused();
    await page.keyboard.press('End');
    await expect(dialog.getByRole('button', { name: 'King of Cups', exact: true })).toBeFocused();
    await page.keyboard.press('Home');
    await expect(dialog.getByRole('button', { name: 'Ace of Cups', exact: true })).toBeFocused();
    expect(await tiles.evaluateAll((all) => all.filter((tile) => tile.tabIndex === 0).length)).toBe(
      1,
    );

    // Open a card from the middle of a scrolled list.
    const ten = dialog.getByRole('button', { name: 'Ten of Cups', exact: true });
    await ten.scrollIntoViewIfNeeded();
    const scrolled = await dialog.evaluate((element) => element.scrollTop);
    await ten.focus();
    await page.keyboard.press('Enter');
    const cardPage = dialog.locator('.tarot-guide');
    await expect(cardPage).toHaveAttribute('data-card', 'cups-10');
    // Both orientations for every card, opening upright: nothing here knows the shuffle.
    await expect(cardPage).toHaveAttribute('data-orientation', 'upright');
    await expect(dialog.getByRole('tab', { name: 'Upright', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(dialog.getByRole('tab', { name: 'Reversed', exact: true })).toBeVisible();
    await expect(cardPage.locator('.tarot-guide-position')).toHaveCount(0);
    const heading = dialog.getByRole('heading', { name: 'Ten of Cups', exact: true });
    await expect(heading).toBeFocused();
    // The page opens at its top: on a phone that is the picture, with the heading under it.
    expect(await dialog.evaluate((element) => element.scrollTop)).toBe(0);
    if (!isMobile) await expect(heading).toBeInViewport();
    await expect(dialog.getByRole('status')).toHaveText('Ten of Cups, Card 10 of 14');
    const entry = cardGuide.find((card) => card.id === 'cups-10')!;
    await expect(cardPage).toContainText(entry.upright.meaning);
    await expect(cardPage).toContainText(entry.figure);
    await dialog.getByRole('tab', { name: 'Reversed', exact: true }).click();
    await expect(cardPage).toHaveAttribute('data-orientation', 'reversed');
    await expect(cardPage).toContainText(entry.reversed.meaning);
    await expect(cardPage.locator('.tarot-guide-card .tarot-name')).toHaveCSS('rotate', 'none');

    // Next and Previous stay inside the Cups filter, wrap at the ends and keep focus.
    const next = dialog.getByRole('button', { name: 'Next card', exact: true });
    const previous = dialog.getByRole('button', { name: 'Previous card', exact: true });
    for (const control of [next, previous, dialog.getByRole('button', { name: 'All cards' })]) {
      const box = (await control.boundingBox())!;
      // Layout can report a 44px control a hair under (43.99998): compare to a hundredth.
      expect(Math.round(Math.min(box.width, box.height) * 100) / 100).toBeGreaterThanOrEqual(44);
      await expect(control).toBeInViewport();
    }
    await next.click();
    await expect(cardPage).toHaveAttribute('data-card', 'cups-11');
    await expect(cardPage).toHaveAttribute('data-orientation', 'upright');
    await expect(next).toBeFocused();
    await expect(dialog.getByRole('status')).toHaveText('Page of Cups, Card 11 of 14');
    await previous.click();
    await previous.click();
    await expect(cardPage).toHaveAttribute('data-card', 'cups-09');
    for (let step = 0; step < 9; step++) await previous.click();
    await expect(cardPage).toHaveAttribute('data-card', 'cups-14');
    await next.click();
    await expect(cardPage).toHaveAttribute('data-card', 'cups-01');
    await previous.click();
    await previous.click();
    await previous.click();
    await previous.click();
    await previous.click();
    await expect(cardPage).toHaveAttribute('data-card', 'cups-10');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(await dialog.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
      true,
    );

    // Escape leaves the card page first: same filter, same scroll, focus on the card.
    await page.keyboard.press('Escape');
    await expect(dialog).toBeVisible();
    await expect(cardPage).toHaveCount(0);
    await expect(tiles).toHaveCount(14);
    await expect(dialog.getByRole('button', { name: 'Cups', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await expect(ten).toBeFocused();
    expect(await dialog.evaluate((element) => element.scrollTop)).toBe(scrolled);
    // The Back button does the same from a card reached with Next.
    await ten.click();
    await expect(heading).toBeFocused();
    await next.click();
    await dialog.getByRole('button', { name: 'All cards' }).click();
    await expect(dialog.getByRole('button', { name: 'Page of Cups', exact: true })).toBeFocused();
    await expect(
      dialog.getByRole('button', { name: 'Page of Cups', exact: true }),
    ).toBeInViewport();
    // A second Escape closes the dialog and returns to its opener.
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    if (!isMobile) await expect(opener).toBeFocused();
    // Reopening starts from the gallery, and browsing never touched the spread.
    await opener.click();
    await expect(tiles).toHaveCount(14);
    await dialog.getByRole('button', { name: 'Close dialog', exact: true }).click();
    expect((await roomAs(page, roomId)).game!.community).toHaveLength(0);
    await expect(deck(page).locator('button.tarot-card')).toHaveCount(78);
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
    // Constructed: the same three cards with the middle one reversed, whatever was dealt.
    const cards = withMiddleReversed(room.game!.community);
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
          game: {
            ...body.game,
            community: cards,
            phase: 'finished',
            message: 'Your reading is ready.',
            actions: [],
          },
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
                  orientation: cards[index].orientation,
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
          `${['Where you are', 'What is shifting', 'Your next move'][index]}${card.label}${index === 1 ? ' · Reversed' : ''}`,
      ),
    );
    for (const jump of await jumps.all())
      expect((await jump.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await jumps.nth(2).click();
    await expect(page.locator(`#reading-${cards[2].id}`)).toBeInViewport();
    // Each section names its position, what it asks, and how the card was drawn.
    await expect(page.locator('.tarot-position-meaning')).toHaveText([
      'UprightA starting point to reflect on.',
      'ReversedWhat could be changing or asking for attention.',
      'UprightOne possible direction to consider.',
    ]);
    // A reversed card turns its picture only, in the spread and beside its section; the
    // name stays the right way up and the word "Reversed" is printed with it.
    const slots = page.locator('.tarot-spread-slot');
    expect(
      await slots.evaluateAll((all) => all.map((slot) => slot.getAttribute('data-orientation'))),
    ).toEqual(['upright', 'reversed', 'upright']);
    await expect(slots.nth(1)).toHaveAccessibleName(
      `Card 2, What is shifting: ${cards[1].label}, reversed. ${cards[1].subtitle}`,
    );
    await expect(slots.nth(1).locator('.tarot-card-meaning')).toHaveText(cards[1].subtitle);
    await expect(slots.nth(1).locator('.tarot-art')).toHaveCSS('rotate', '180deg');
    await expect(slots.nth(1).locator('.tarot-name')).toHaveCSS('rotate', 'none');
    await expect(slots.nth(1).locator('.tarot-name')).toHaveText(cards[1].label);
    await expect(slots.nth(1).locator('.tarot-reversed-word')).toHaveText('Reversed');
    expect(
      await slots
        .nth(1)
        .locator('.tarot-reversed-word')
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
    ).toBeGreaterThanOrEqual(11);
    await expect(slots.nth(0).locator('.tarot-art')).toHaveCSS('rotate', 'none');
    await expect(page.locator('.tarot-spread .tarot-reversed-word')).toHaveCount(1);
    const thumbnails = page.locator('.tarot-reading-card-heading .tarot-card');
    await expect(thumbnails.nth(1).locator('.tarot-art')).toHaveCSS('rotate', '180deg');
    await expect(thumbnails.nth(0).locator('.tarot-art')).toHaveCSS('rotate', 'none');
    await expect(thumbnails.nth(1)).toHaveAccessibleName(`View ${cards[1].label} card, reversed`);
    // Per card: what it says about the question, then its figures, then the plot twist.
    const firstCard = page.locator('.tarot-reading article').first();
    await expect(firstCard.locator('h4')).toHaveText([
      'What this card says about your question',
      'Your connections',
      'The plot twist',
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
    // The full card page opens on the side the card was drawn, and still offers the other.
    const detail = page.getByRole('dialog', { name: cards[0].label, exact: true });
    await expect(detail).toContainText(
      'Where you are. A starting point to reflect on. Drawn upright.',
    );
    await expect(detail.locator('.tarot-guide')).toHaveAttribute('data-orientation', 'upright');
    await expect(detail.locator('.tarot-guide-position')).toHaveText('Drawn as Where you are');
    await expect(detail.locator('.tarot-guide-lead:visible')).toHaveText(cards[0].subtitle);
    const firstEntry = cardGuide.find((entry) => entry.id === cards[0].id)!;
    await expect(detail).toContainText(firstEntry.upright.meaning);
    await expect(detail).toContainText(firstEntry.figure);
    await expect(detail.getByRole('tab', { name: 'Reversed', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    expect(await detail.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
      true,
    );
    await page.keyboard.press('Escape');
    await expect(detail).toHaveCount(0);
    await expect(thumbnail).toBeFocused();
    await page
      .locator('.tarot-spread')
      .getByRole('button', { name: `View ${cards[1].label} card, reversed`, exact: true })
      .click();
    const turned = page.getByRole('dialog', { name: cards[1].label, exact: true });
    await expect(turned).toContainText(
      'What is shifting. What could be changing or asking for attention. Drawn reversed.',
    );
    await expect(turned.locator('.tarot-guide')).toHaveAttribute('data-orientation', 'reversed');
    await expect(turned.getByRole('tab', { name: 'Reversed', exact: true })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await expect(turned.locator('.tarot-guide-showing')).toHaveText('Shown reversed');
    await expect(turned.locator('.tarot-guide-position')).toHaveText('Drawn as What is shifting');
    await expect(turned.locator('.tarot-guide-lead:visible')).toHaveText(cards[1].subtitle);
    await expect(turned).toContainText(
      cardGuide.find((entry) => entry.id === cards[1].id)!.reversed.meaning,
    );
    await turned.getByRole('tab', { name: 'Upright', exact: true }).click();
    await expect(turned.locator('.tarot-guide')).toHaveAttribute('data-orientation', 'upright');
    await page.keyboard.press('Escape');
    await expect(turned).toHaveCount(0);
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
      expect(copied).toContain(`2. What is shifting: ${cards[1].label} (reversed)`);
      expect(copied).toContain(`Next small move: ${tarotReadingExample.next_step}`);
      // The copy follows the page: each card's reading, its figure, then the plot twist.
      expect(copied).toContain(
        '\nMichael Scott (The Office): Synthetic connection line.\nPlot twist: ',
      );
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

test('a Fun reading says what each figure means for the question, between the card and its plot twist', async ({
  page,
}) => {
  await soloRoom(page, async (roomId) => {
    for (let card = 0; card < 3; card++) await drawTarotCard(page);
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeVisible();
    // The prompt invites context without making the form taller.
    await expect(page.getByRole('textbox', { name: 'What’s on your mind?' })).toHaveAttribute(
      'placeholder',
      'Ask your question and add what’s going on. Specifics make the reading more useful.',
    );
    const cards = (await roomAs(page, roomId)).game!.community;
    const bridge =
      'For your question, that could look like asking your teacher for one small brief this week. Then there is a real request to finish for before the urge to start something new arrives.';
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
              reading_style: 'fun',
              question: 'What is getting in the way of finishing my course?',
              message: '',
              reading: {
                ...tarotReadingExample,
                cards: tarotReadingExample.cards.map((card, index) => ({
                  ...card,
                  card_id: cards[index].id,
                  pop_culture: bridge,
                  characters: [
                    {
                      name: 'Michael Scott',
                      source: 'The Office',
                      evidence: 'A synthetic reviewed scene.',
                      connection: 'Synthetic editorial move.',
                    },
                  ],
                })),
              },
            },
          })
        : route.abort(),
    );
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.reload();
      const first = page.locator('.tarot-reading article').first();
      await expect(first.locator('h4')).toHaveText([
        'What this card says about your question',
        'How it could play out',
        'The plot twist',
      ]);
      const figure = first.locator('.tarot-character-connections li');
      await expect(figure.locator('.tarot-character-copy > p')).toHaveText(
        'Synthetic editorial move.',
      );
      const block = figure.locator('.tarot-figure-bridge');
      await expect(block.getByRole('heading')).toHaveText('What this means for your question');
      await expect(block.locator('p')).toHaveText(bridge);
      await expect(page.locator('.tarot-figure-bridge')).toHaveCount(3);
      // Reading order on screen: the card's answer, the move, its bridge, then the plot twist.
      const tops = await Promise.all(
        [
          first.locator('.tarot-perspectives').first(),
          figure.locator('.tarot-character-copy > p'),
          block,
          first.locator('.tarot-quirky-read'),
        ].map(async (part) => (await part.boundingBox())!.y),
      );
      expect([...tops].sort((a, b) => a - b)).toEqual(tops);
      expect(
        await block.locator('p').evaluate((node) => parseFloat(getComputedStyle(node).fontSize)),
      ).toBeGreaterThanOrEqual(15);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
});
