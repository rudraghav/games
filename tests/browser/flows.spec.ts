import { expect, test } from '@playwright/test';
import { requestAs, openRoomOptions } from './helpers';
import gameCatalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };

test('the complete catalogue and every table scenario fit the viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Choose a game', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Create .+ room$/ })).toHaveCount(
    gameCatalogue.length,
  );
  await expect(page.getByRole('button', { name: 'Create Pop Tarot room' })).toBeVisible();
  for (const selector of ['.game-art--board', '.game-art--words']) {
    expect(
      await page
        .locator(selector)
        .first()
        .evaluate((element) => getComputedStyle(element).display),
    ).toBe('grid');
  }
  await page.goto('/design');
  const scenarioCount = await page.getByLabel('Table scenario').locator('option').count();
  for (let i = 0; i < scenarioCount; i++) {
    await page.getByLabel('Table scenario').selectOption(String(i));
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);
    if (
      (await page.getByLabel('Table scenario').locator('option:checked').innerText()).includes(
        'Gem Market',
      )
    ) {
      expect(
        await page.locator('.gem-tier .development-card').evaluateAll((cards) =>
          cards.every((card) => {
            const cost = card.querySelector('.development-cost')!.getBoundingClientRect();
            const bounds = card.getBoundingClientRect();
            return cost.bottom <= bounds.bottom && cost.right <= bounds.right;
          }),
        ),
      ).toBe(true);
    }
  }
});

test('independent guests create, join, chat, play, refresh and switch games', async ({
  page,
  browser,
}) => {
  const guestContext = await browser.newContext({ viewport: page.viewportSize()! });
  const guest = await guestContext.newPage();
  let ownedRoomId: string | undefined;
  let friendJoined = false;
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Uno room', exact: true }).click();
    const setup = page.getByRole('dialog');
    await setup.getByRole('textbox', { name: 'Your name', exact: true }).fill('Browser Host');
    await setup.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await openRoomOptions(setup);
    await setup
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill('Browser verification table');
    await setup.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    const roomPath = new URL(page.url()).pathname;
    ownedRoomId = roomPath.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    await guest.goto('/');
    await guest.getByRole('button', { name: 'Join a room', exact: true }).click();
    const join = guest.getByRole('dialog');
    await join.getByRole('textbox', { name: 'Your name', exact: true }).fill('Browser Friend');
    await join.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
    await join.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect(guest).toHaveURL(page.url());
    friendJoined = true;
    await page.getByRole('button', { name: 'I’m ready', exact: true }).click();
    await guest.getByRole('button', { name: 'I’m ready', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: 'Start game', exact: true }).click();
    await expect(page.getByRole('group', { name: 'Your hand', exact: true })).toBeVisible();
    await expect(guest.getByRole('group', { name: 'Your hand', exact: true })).toBeVisible();
    await guest.reload();
    await expect(
      guest.getByRole('group', { name: 'Your hand', exact: true }).getByRole('button'),
    ).toHaveCount(7);
    const apiPath = `/api/backend${roomPath.replace('/rooms/', '/v1/rooms/')}`;
    const snapshot = await (await page.request.get(apiPath)).json();
    const actorPage = snapshot.game.current_player === snapshot.owner_id ? page : guest;
    const actorView = await (await actorPage.request.get(apiPath)).json();
    const decision = actorView.game.actions.find((option: { action: { type: string } }) =>
      ['draw', 'choose'].includes(option.action.type),
    );
    expect(decision).toBeTruthy();
    await actorPage.getByRole('button', { name: decision.label, exact: true }).click();
    await expect
      .poll(async () => (await (await page.request.get(apiPath)).json()).match_version)
      .toBeGreaterThan(snapshot.match_version);
    const visibleChat = page
      .getByRole('region', { name: 'Room chat', exact: true })
      .filter({ visible: true });
    await expect(visibleChat).toHaveCount(0);
    const openChat = page.getByRole('button', { name: 'Open chat', exact: true });
    await expect(openChat).toHaveAttribute('aria-expanded', 'false');
    await openChat.click();
    await expect(page.locator('.room-chat-button')).toHaveAttribute('aria-expanded', 'true');
    const chat = page
      .getByRole('region', { name: 'Room chat', exact: true })
      .filter({ visible: true });
    await chat.getByRole('textbox', { name: 'Message your room' }).fill('Ready for a good game.');
    await chat.getByRole('button', { name: 'Send message', exact: true }).click();
    await expect(chat.getByText('Ready for a good game.', { exact: true })).toBeVisible();
    const close = page.getByRole('button', { name: 'Close dialog', exact: true });
    if (await close.isVisible()) await close.click();
    else await page.getByRole('button', { name: 'Close chat', exact: true }).click();
    await expect(visibleChat).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open chat', exact: true })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    await page.getByRole('button', { name: 'Room options', exact: true }).click();
    await page.getByRole('button', { name: 'End this match', exact: true }).click();
    await page.getByRole('button', { name: 'Yes, end this match', exact: true }).click();
    await page.getByRole('button', { name: 'Change game and settings', exact: true }).click();
    await page.getByRole('combobox', { name: 'The game', exact: true }).selectOption('skyjo');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await page.getByRole('button', { name: 'Choose game', exact: true }).click();
    await expect(page.locator('.room-title > span')).toHaveText('Skyjo');
    await expect(guest.locator('.room-title > span')).toHaveText('Skyjo');
    await expect(page.getByRole('heading', { name: 'Players', exact: true })).toBeVisible();
    await expect(guest.getByRole('heading', { name: 'Players', exact: true })).toBeVisible();
  } finally {
    try {
      if (ownedRoomId) {
        const current = await requestAs(page, `rooms/${ownedRoomId}`);
        if (current.status() !== 404) {
          expect(current.status()).toBe(200);
          if ((await current.json()).status === 'playing')
            expect((await requestAs(page, `rooms/${ownedRoomId}/abandon`, 'POST')).ok()).toBe(true);
          if (friendJoined)
            expect((await requestAs(guest, `rooms/${ownedRoomId}/leave`, 'POST')).ok()).toBe(true);
          expect((await requestAs(page, `rooms/${ownedRoomId}/leave`, 'POST')).ok()).toBe(true);
          expect((await requestAs(page, `rooms/${ownedRoomId}`)).status()).toBe(404);
        }
      }
    } finally {
      await guestContext.close();
    }
  }
});

test('Tarot reveals three distinct cards and survives a refresh', async ({ page }) => {
  let tarotRoomId: string | undefined;
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Pop Tarot room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Browser Reader');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    tarotRoomId = new URL(page.url()).pathname.split('/').at(-1)!;
    await expect(page.getByRole('heading', { name: 'Choose card 1 of 3' })).toBeVisible();
    await page.getByRole('button', { name: 'Explore the deck', exact: true }).click();
    const gallery = page.getByRole('dialog', { name: 'The whole cosmic cast' });
    await expect(gallery.locator('.tarot-deck-gallery .tarot-card')).toHaveCount(78);
    for (const suit of ['Wands', 'Cups', 'Swords', 'Pentacles']) {
      await gallery.getByRole('button', { name: suit, exact: true }).click();
      await expect(gallery.locator('.tarot-deck-gallery .tarot-card')).toHaveCount(14);
      if (suit === 'Wands' || suit === 'Cups') {
        await gallery
          .locator('svg image')
          .first()
          .evaluate(async (element) => {
            const bitmap = new Image();
            bitmap.src = element.getAttribute('href')!;
            await bitmap.decode();
          });
        for (const rank of ['Queen', 'King']) {
          const art = gallery.locator(`.tarot-card[aria-label="${rank} of ${suit}"] svg`);
          await art.scrollIntoViewIfNeeded();
          // Pinned head centers in the original tall atlas panels. Center-cropping
          // hid these points even though every image loaded and every cell was valid.
          const faceVisible = await art.evaluate(
            (element, headOffset) => {
              const svg = element as SVGSVGElement;
              const view = svg.viewBox.baseVal;
              const point = svg.createSVGPoint();
              point.x = view.x + view.width / 2;
              point.y = view.y + headOffset;
              const matrix = svg.getScreenCTM();
              if (!matrix) return false;
              const face = point.matrixTransform(matrix);
              const frame = svg.getBoundingClientRect();
              return (
                face.x > frame.left &&
                face.x < frame.right &&
                face.y > frame.top &&
                face.y < frame.bottom
              );
            },
            suit === 'Wands' ? 65 : 85,
          );
          expect(faceVisible, `${rank} of ${suit} must keep its head in frame`).toBe(true);
          if (process.env.GAMES_TEST_URL && rank === 'Queen')
            await art
              .locator('..')
              .locator('..')
              .screenshot({
                path: test
                  .info()
                  .outputPath(`court-${suit.toLowerCase()}-${rank.toLowerCase()}.png`),
              });
        }
        await gallery.evaluate((element) => {
          element.scrollTop = 0;
        });
      }
    }
    await gallery.getByRole('button', { name: 'Major arcana', exact: true }).click();
    await expect(gallery.locator('.tarot-deck-gallery .tarot-card')).toHaveCount(22);
    expect(await gallery.evaluate((element) => element.scrollWidth <= element.clientWidth)).toBe(
      true,
    );
    await gallery.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    const closeDeck = gallery.getByRole('button', { name: 'Close dialog', exact: true });
    await expect(closeDeck).toBeInViewport();
    await closeDeck.click();
    await expect(gallery).toHaveCount(0);
    await page.getByRole('button', { name: 'Explore the deck', exact: true }).click();
    await page.keyboard.press('Escape');
    await expect(gallery).toHaveCount(0);
    for (const position of [4, 17, 65]) {
      await page.getByRole('button', { name: `Choose card ${position}`, exact: true }).click();
      await expect(
        page.getByRole('button', { name: `Choose card ${position}`, exact: true }),
      ).toHaveCount(0);
    }
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeVisible();
    await expect(
      page.getByText(/Google may use questions and readings to improve its products/),
    ).toBeVisible();
    const names = await page.locator('.tarot-spread .tarot-name').allTextContents();
    expect(new Set(names).size).toBe(3);
    await page.reload();
    await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(names);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
      .toBe(true);
  } finally {
    if (tarotRoomId) {
      const current = await requestAs(page, `rooms/${tarotRoomId}`, 'GET');
      if (current.ok() && (await current.json()).status === 'playing')
        expect((await requestAs(page, `rooms/${tarotRoomId}/abandon`, 'POST')).status()).toBe(200);
      expect((await requestAs(page, `rooms/${tarotRoomId}/leave`, 'POST')).status()).toBe(200);
      expect((await requestAs(page, `rooms/${tarotRoomId}`, 'GET')).status()).toBe(404);
    }
  }
});
