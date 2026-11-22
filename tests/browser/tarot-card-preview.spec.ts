import { mkdir } from 'node:fs/promises';
import { expect, test, type Locator, type Page } from '@playwright/test';
import cardGuide from '../../packages/api-client/src/generated/tarot-card-guide.json' with { type: 'json' };
import { tarotReadingExample } from '../../apps/web/src/stories/fixtures/tarot-reading';
import { drawTarotCard, openGameSetup, requestAs, roomAs } from './helpers';

// An action that cannot complete fails well inside the test's own time, so the room is
// always closed by the test that opened it.
test.use({ trace: 'off', screenshot: 'off', actionTimeout: 15000 });
test.skip(!!process.env.GAMES_TEST_URL, 'Constructed orientations use local development only.');

/** Set to a folder to keep pictures of the preview for a design review. */
const shots = process.env.TAROT_PREVIEW_SHOTS;
async function shot(page: Page, name: string) {
  if (!shots) return;
  await mkdir(shots, { recursive: true });
  await page.screenshot({ path: `${shots}/${name}.png` });
}

let openRoom: string | undefined;
async function closeRoom(page: Page, roomId: string) {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
  const response = await requestAs(page, `rooms/${roomId}`);
  if (response.ok() && (await response.json()).status === 'playing')
    expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
  expect((await requestAs(page, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
  openRoom = undefined;
}
// A test that runs out of time loses its page before its own cleanup can use it; this
// hook still has the page, so the room is closed either way.
test.afterEach(async ({ page }) => {
  if (openRoom) await closeRoom(page, openRoom);
});

async function soloRoom(page: Page, run: (roomId: string) => Promise<void>) {
  try {
    await page.goto('/');
    await openGameSetup(page, 'tarot');
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Preview QA');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/games\/tarot\/play\/[\da-f-]+$/);
    openRoom = new URL(page.url()).pathname.split('/').at(-1)!;
    await run(openRoom);
  } finally {
    if (openRoom && !page.isClosed()) await closeRoom(page, openRoom);
  }
}

type Orientation = 'upright' | 'reversed';
const guideFor = (name: string) => cardGuide.find((entry) => entry.name === name)!;
const preview = (page: Page) => page.locator('.tarot-preview');
const slotCard = (page: Page, index: number) =>
  page
    .locator('.tarot-spread-slot')
    .nth(index)
    .getByRole('button', { name: /^View .+ card/ });

/** The reveal scrolls its slot into view; a preview opened mid-scroll would close again. */
async function settled(page: Page) {
  await page
    .locator('.tarot-spread .tarot-card')
    .evaluateAll((cards) =>
      Promise.race([
        Promise.allSettled(
          cards.flatMap((card) => card.getAnimations().map((animation) => animation.finished)),
        ),
        new Promise((resolve) => setTimeout(resolve, 2000)),
      ]),
    );
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          new Promise<boolean>((resolve) => {
            const from = scrollY;
            requestAnimationFrame(() => requestAnimationFrame(() => resolve(scrollY === from)));
          }),
      ),
    )
    .toBe(true);
}

/** The preview once its opening animation has finished, with where it and its card are. */
async function shownPreview(page: Page, card: Locator) {
  const panel = preview(page);
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute('data-placed', 'true');
  await panel.evaluate((element) =>
    Promise.all(element.getAnimations().map((animation) => animation.finished)),
  );
  const [box, anchor, viewport] = [
    (await panel.boundingBox())!,
    (await card.boundingBox())!,
    await page.evaluate(() => ({
      width: document.documentElement.clientWidth,
      height: innerHeight,
    })),
  ];
  // Fully inside the viewport, with the margin the layout promises.
  expect(box.x).toBeGreaterThanOrEqual(8);
  expect(box.y).toBeGreaterThanOrEqual(8);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width - 8);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height - 8);
  // Never over the card it describes.
  const apart =
    box.x >= anchor.x + anchor.width ||
    box.x + box.width <= anchor.x ||
    box.y >= anchor.y + anchor.height ||
    box.y + box.height <= anchor.y;
  expect(apart, 'the preview stays clear of its card').toBe(true);
  // Nothing inside is cut off or pushed out sideways.
  expect(
    await panel.evaluate(
      (element) =>
        element.scrollWidth <= element.clientWidth + 1 &&
        element.scrollHeight <= element.clientHeight + 1,
    ),
  ).toBe(true);
  return { panel, box, anchor };
}

async function expectContent(page: Page, name: string, orientation: Orientation, position: string) {
  const panel = preview(page);
  const entry = guideFor(name);
  const side = entry[orientation];
  await expect(panel).toHaveAttribute('data-orientation', orientation);
  await expect(panel.locator('.tarot-preview-name')).toHaveText(name);
  await expect(panel.locator('.tarot-preview-family')).toContainText(entry.number_label);
  await expect(panel.locator('.tarot-preview-orientation')).toHaveText(
    orientation === 'reversed' ? 'Reversed' : 'Upright',
  );
  await expect(panel.locator('.tarot-preview-position')).toHaveText(`Drawn as ${position}`);
  await expect(panel.locator('.tarot-preview-keywords > li')).toHaveText(side.keywords.slice(0, 5));
  await expect(panel.locator('.tarot-preview-short')).toHaveText(side.short);
  await expect(panel.locator('.tarot-preview-essence')).toHaveText(entry.essence);
  await expect(panel.locator('.tarot-preview-hint')).toHaveText('Click for the full card');
  // The rest stays on the card's full page.
  for (const kept of [side.meaning, side.love, side.work, side.self, side.advice, entry.figure])
    await expect(panel).not.toContainText(kept);
  // The picture lands as the card was drawn; its name stays the right way up.
  await expect(panel.locator('.tarot-art')).toHaveCSS(
    'rotate',
    orientation === 'reversed' ? '180deg' : 'none',
  );
  await expect(panel.locator('.tarot-name')).toHaveCSS('rotate', 'none');
  await expect(panel.locator('.tarot-reversed-word')).toHaveCount(
    orientation === 'reversed' ? 1 : 0,
  );
  await expect(panel.locator('.tarot-preview-stage')).toHaveAttribute('aria-hidden', 'true');
  await expect(panel).toHaveCSS('pointer-events', 'none');
}

test('a drawn card previews on hover and focus, and opens its page on click while choosing', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Hover and keyboard focus belong to the desktop project.');
  const problems: string[] = [];
  page.on('pageerror', (error) => problems.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') problems.push(message.text());
  });
  await soloRoom(page, async () => {
    await drawTarotCard(page);
    // Still choosing: the drawn card is already a button for its page.
    await expect(page.locator('.tarot-table')).toHaveAttribute('data-phase', 'choosing');
    const slot = page.locator('.tarot-spread-slot').first();
    const card = slotCard(page, 0);
    await expect(card).toBeVisible();
    await expect(slot).toBeFocused();
    const name = (await slot.locator('.tarot-name').textContent())!;
    const orientation = (await slot.getAttribute('data-orientation')) as Orientation;
    await expect(card).toHaveAccessibleName(
      `View ${name} card${orientation === 'reversed' ? ', reversed' : ''}`,
    );
    const side = guideFor(name)[orientation];
    // A keyboard or screen reader user hears the same extra line.
    await expect(card).toHaveAccessibleDescription(
      `Keywords: ${side.keywords.slice(0, 5).join(', ')}. ${side.short}`,
    );
    await expect(card).not.toHaveAttribute('data-tip');
    await expect(preview(page)).toHaveCount(0);
    await settled(page);

    // Hover: the preview grows out of the card, beside or around it, never over it.
    await card.hover();
    await expect(preview(page)).toHaveCSS('animation-name', 'tarot-preview-in');
    const { panel, box, anchor } = await shownPreview(page, card);
    await expectContent(page, name, orientation, 'Where you are');
    // A noticeably larger picture than the card on the table.
    const picture = (await panel.locator('.tarot-card').boundingBox())!;
    expect(picture.width).toBeGreaterThan(anchor.width * 1.25);
    expect(box.width).toBeGreaterThan(300);
    await expect(page.locator('.tooltip')).toHaveCount(0);
    await shot(page, `choosing-${test.info().project.name}-${orientation}`);

    // Moving away puts it down.
    await page.mouse.move(4, 4);
    await expect(preview(page)).toHaveCount(0);

    // So do scrolling, resizing and Escape, while the pointer stays where it is.
    await card.hover();
    await expect(preview(page)).toBeVisible();
    await page.evaluate(() => document.dispatchEvent(new Event('scroll')));
    await expect(preview(page)).toHaveCount(0);
    await page.mouse.move(4, 4);
    await card.hover();
    await expect(preview(page)).toBeVisible();
    await page.setViewportSize({ width: 1300, height: 1000 });
    await expect(preview(page)).toHaveCount(0);
    await page.mouse.move(4, 4);
    await card.hover();
    await expect(preview(page)).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(preview(page)).toHaveCount(0);
    await page.mouse.move(4, 4);

    // Click: the full page opens, named after the card, and the preview is gone.
    await card.hover();
    await expect(preview(page)).toBeVisible();
    await card.click();
    const dialog = page.getByRole('dialog', { name, exact: true });
    await expect(dialog).toBeVisible();
    await expect(preview(page)).toHaveCount(0);
    await expect(dialog.locator('.tarot-guide')).toHaveAttribute('data-orientation', orientation);
    await expect(dialog.locator('.tarot-guide-position')).toHaveText('Drawn as Where you are');
    await expect(dialog).toContainText(side.advice);
    // The pick is still in progress behind the page.
    await expect(page.locator('.tarot-table')).toHaveAttribute('data-phase', 'choosing');

    // Escape closes it, focus returns to the card, and the preview waits to be asked again.
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(card).toBeFocused();
    await page.waitForTimeout(500);
    await expect(preview(page)).toHaveCount(0);
    await page.mouse.move(4, 4);
    await card.hover();
    await expect(preview(page)).toBeVisible();
    await page.mouse.move(4, 4);
    await expect(preview(page)).toHaveCount(0);

    // Keyboard: Tab from the revealed slot lands on its card and shows the same preview.
    await slot.focus();
    await page.keyboard.press('Tab');
    await expect(card).toBeFocused();
    await shownPreview(page, card);
    await expectContent(page, name, orientation, 'Where you are');
    // On the light table the focus ring is the app's own colour, not the velvet's.
    await expect(card).toHaveCSS('outline-color', 'rgb(175, 117, 53)');
    await shot(page, `choosing-${test.info().project.name}-keyboard`);
    // The preview is a description, not a dialog: focus never moves into it.
    await expect(panel).toHaveRole('tooltip');
    await expect(card).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(preview(page)).toHaveCount(0);
    await expect(card).toBeFocused();
    // Enter opens the page; closing it returns focus without reopening the preview.
    await page.keyboard.press('Enter');
    await expect(dialog).toBeVisible();
    await expect(preview(page)).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(card).toBeFocused();
    await page.waitForTimeout(500);
    await expect(preview(page)).toHaveCount(0);
    // Leaving and coming back by keyboard asks for it again; blur puts it down.
    await slot.focus();
    await page.keyboard.press('Tab');
    await expect(preview(page)).toBeVisible();
    await slot.focus();
    await expect(preview(page)).toHaveCount(0);

    // Reduced motion: no scale, only a short fade.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await card.hover();
    await expect(preview(page)).toHaveCSS('animation-name', 'tarot-preview-fade');
    await shownPreview(page, card);
    await page.mouse.move(4, 4);
    await expect(preview(page)).toHaveCount(0);
    // Showing, hiding and opening the page raised no errors or React warnings.
    expect(problems).toEqual([]);
  });
});

test('each card previews the side it was drawn on, and the preview fits a narrow window', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Hover belongs to the desktop project.');
  await page.setViewportSize({ width: 1440, height: 900 });
  await soloRoom(page, async (roomId) => {
    for (let card = 0; card < 3; card++) {
      await drawTarotCard(page);
      // The deck drops a second activation within 400ms of a draw, as it would a double click.
      await page.waitForTimeout(450);
    }
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeVisible();
    // Constructed: the same three cards with the middle one reversed, whatever was dealt.
    await page.route(new RegExp(`/api/backend/v1/rooms/${roomId}(/heartbeat)?$`), async (route) => {
      const response = await route.fetch();
      const body = await response.json().catch(() => null);
      if (!response.ok() || !Array.isArray(body?.game?.community))
        return route.fulfill({ response });
      const community = body.game.community.map(
        (card: { id: string; subtitle?: string }, index: number) => {
          const orientation: Orientation = index === 1 ? 'reversed' : 'upright';
          return {
            ...card,
            orientation,
            subtitle: cardGuide.find((entry) => entry.id === card.id)![orientation].short,
          };
        },
      );
      await route.fulfill({ response, json: { ...body, game: { ...body.game, community } } });
    });
    await page.reload();
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeVisible();
    const slots = page.locator('.tarot-spread-slot');
    await expect(slots.nth(1)).toHaveAttribute('data-orientation', 'reversed');
    const names = await page.locator('.tarot-spread .tarot-name').allTextContents();
    const positions = ['Where you are', 'What is shifting', 'Your next move'];
    await settled(page);

    // Upright, then straight across to the reversed neighbour: one preview at a time.
    await slotCard(page, 0).hover();
    await shownPreview(page, slotCard(page, 0));
    await expectContent(page, names[0], 'upright', positions[0]);
    await shot(page, 'spread-1440x900-upright');
    await slotCard(page, 1).hover();
    await expect(preview(page)).toHaveAttribute('data-orientation', 'reversed');
    await expect(preview(page)).toHaveCount(1);
    await shownPreview(page, slotCard(page, 1));
    await expectContent(page, names[1], 'reversed', positions[1]);
    await expect(slotCard(page, 1)).toHaveAccessibleName(`View ${names[1]} card, reversed`);
    await shot(page, 'spread-1440x900-reversed');
    await slotCard(page, 2).hover();
    await expect(preview(page).locator('.tarot-preview-name')).toHaveText(names[2]);
    await shownPreview(page, slotCard(page, 2));
    await expectContent(page, names[2], 'upright', positions[2]);
    await shot(page, 'spread-1440x900-third');
    await page.mouse.move(4, 4);
    await expect(preview(page)).toHaveCount(0);

    // A card reached by keyboard gives way to the one the mouse arrives on.
    await slots.nth(1).focus();
    await page.keyboard.press('Tab');
    await expect(slotCard(page, 1)).toBeFocused();
    await expect(preview(page).locator('.tarot-preview-name')).toHaveText(names[1]);
    await slotCard(page, 0).hover();
    await expect(preview(page).locator('.tarot-preview-name')).toHaveText(names[0]);
    await expect(preview(page)).toHaveCount(1);
    await page.mouse.move(4, 4);
    await expect(preview(page)).toHaveCount(0);

    // A narrow window with a mouse: above or below the card, still inside and still clear.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => window.scrollTo(0, 0));
    for (const [index, orientation] of [
      [0, 'upright'],
      [1, 'reversed'],
      [2, 'upright'],
    ] as const) {
      const card = slotCard(page, index);
      await card.scrollIntoViewIfNeeded();
      await settled(page);
      await card.hover();
      const { panel, box, anchor } = await shownPreview(page, card);
      await expectContent(page, names[index], orientation, positions[index]);
      expect(['above', 'below']).toContain(await panel.getAttribute('data-side'));
      expect((await panel.locator('.tarot-card').boundingBox())!.width).toBeGreaterThan(
        anchor.width * 1.2,
      );
      expect(box.width).toBeLessThanOrEqual(374);
      await shot(page, `spread-390x844-${index + 1}-${orientation}`);
      await page.mouse.move(4, 4);
      await expect(preview(page)).toHaveCount(0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
});

test('the thumbnails beside a finished reading preview their cards too', async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, 'Hover belongs to the desktop project.');
  await page.setViewportSize({ width: 1440, height: 900 });
  await soloRoom(page, async (roomId) => {
    for (let card = 0; card < 3; card++) {
      await drawTarotCard(page);
      await page.waitForTimeout(450);
    }
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeVisible();
    const room = await roomAs(page, roomId);
    // Constructed: the dealt cards with the middle one reversed, and a synthetic finished
    // reading for them. No reading is requested from a provider.
    const cards = room.game!.community.map((card, index) => {
      const orientation: Orientation = index === 1 ? 'reversed' : 'upright';
      return {
        ...card,
        orientation,
        subtitle: cardGuide.find((entry) => entry.id === card.id)![orientation].short,
      };
    });
    await page.route(new RegExp(`/api/backend/v1/rooms/${roomId}(/heartbeat)?$`), async (route) => {
      const response = await route.fetch();
      const body = await response.json();
      await route.fulfill({
        response,
        json: {
          ...body,
          status: 'finished',
          revision: body.revision + 1,
          game: { ...body.game, community: cards, phase: 'finished', actions: [] },
        },
      });
    });
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, (route) =>
      route.request().method() === 'GET'
        ? route.fulfill({
            json: {
              status: 'complete',
              api_tier: 'paid',
              question: '',
              message: '',
              reading: {
                ...tarotReadingExample,
                cards: tarotReadingExample.cards.map((card, index) => ({
                  ...card,
                  card_id: cards[index].id,
                  title: cards[index].label,
                  orientation: cards[index].orientation,
                })),
              },
            },
          })
        : route.abort(),
    );
    await page.reload();
    await expect(page.locator('.tarot-reading')).toBeVisible();
    const positions = ['Where you are', 'What is shifting', 'Your next move'];

    // On the velvet: the spread card of a finished reading.
    await page.evaluate(() => window.scrollTo(0, 0));
    await settled(page);
    await slotCard(page, 1).hover();
    await shownPreview(page, slotCard(page, 1));
    await expectContent(page, cards[1].label, 'reversed', positions[1]);
    await shot(page, 'finished-1440x900-spread-reversed');
    await page.mouse.move(4, 4);
    await expect(preview(page)).toHaveCount(0);

    // Beside the reading: each small thumbnail grows into the same preview.
    for (const [index, orientation] of [
      [0, 'upright'],
      [1, 'reversed'],
    ] as const) {
      const thumbnail = page
        .locator('.tarot-reading-card-heading')
        .nth(index)
        .getByRole('button', {
          name: `View ${cards[index].label} card${orientation === 'reversed' ? ', reversed' : ''}`,
          exact: true,
        });
      // Clear of the pinned bars at the top of the page.
      await thumbnail.evaluate((element) =>
        element.scrollIntoView({ block: 'center', behavior: 'instant' }),
      );
      await settled(page);
      await expect(thumbnail).not.toHaveAttribute('data-tip');
      await thumbnail.hover();
      const { panel, anchor } = await shownPreview(page, thumbnail);
      await expectContent(page, cards[index].label, orientation, positions[index]);
      expect((await panel.locator('.tarot-card').boundingBox())!.width).toBeGreaterThan(
        anchor.width * 2,
      );
      await expect(page.locator('.tooltip')).toHaveCount(0);
      await shot(page, `finished-1440x900-thumbnail-${orientation}`);
      await thumbnail.click();
      const dialog = page.getByRole('dialog', { name: cards[index].label, exact: true });
      await expect(dialog).toBeVisible();
      await expect(preview(page)).toHaveCount(0);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(thumbnail).toBeFocused();
      await page.waitForTimeout(400);
      await expect(preview(page)).toHaveCount(0);
      await page.mouse.move(4, 4);
    }
  });
});

test('on a phone a tap opens the card page and no preview ever appears', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Touch belongs to the phone project.');
  await soloRoom(page, async () => {
    await drawTarotCard(page);
    const slot = page.locator('.tarot-spread-slot').first();
    const card = slotCard(page, 0);
    await expect(card).toBeVisible();
    await expect(page.locator('.tarot-table')).toHaveAttribute('data-phase', 'choosing');
    const name = (await slot.locator('.tarot-name').textContent())!;
    await settled(page);
    // Count every preview that is ever added to the page, however briefly.
    await page.evaluate(() => {
      const seen = { count: 0 };
      (window as unknown as { previewsSeen: typeof seen }).previewsSeen = seen;
      new MutationObserver(() => {
        if (document.querySelector('.tarot-preview')) seen.count += 1;
      }).observe(document.body, { childList: true, subtree: true });
    });
    await card.tap();
    const dialog = page.getByRole('dialog', { name, exact: true });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.tarot-guide-position')).toHaveText('Drawn as Where you are');
    await dialog.getByRole('button', { name: 'Close dialog', exact: true }).tap();
    await expect(dialog).toHaveCount(0);
    // Neither a mouse-like move on a touch device nor focus opens one.
    await card.hover();
    await card.focus();
    await page.waitForTimeout(500);
    await expect(preview(page)).toHaveCount(0);
    expect(
      await page.evaluate(
        () => (window as unknown as { previewsSeen: { count: number } }).previewsSeen.count,
      ),
    ).toBe(0);
    await shot(page, 'phone-after-tap');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
});
