import { expect, test } from '@playwright/test';
import gameCatalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };

test('the complete catalogue and every table scenario fit the viewport', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Good company. Great games.' })).toBeVisible();
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
  context,
}) => {
  const guestContext = await browser.newContext({ viewport: page.viewportSize()! });
  const guest = await guestContext.newPage();
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Uno room', exact: true }).click();
    const setup = page.getByRole('dialog');
    await setup.getByRole('textbox', { name: 'Your name', exact: true }).fill('Browser Host');
    await setup.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await setup
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill('Browser verification table');
    await setup.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    const roomPath = new URL(page.url()).pathname;
    const code = await page.locator('.room-code').innerText();
    await guest.goto('/');
    await guest.getByRole('button', { name: 'Join a room', exact: true }).click();
    const join = guest.getByRole('dialog');
    await join.getByRole('textbox', { name: 'Your name', exact: true }).fill('Browser Friend');
    await join.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
    await join.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect(guest).toHaveURL(page.url());
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
    if (await page.getByRole('button', { name: 'Open chat', exact: true }).isVisible())
      await page.getByRole('button', { name: 'Open chat', exact: true }).click();
    const chat = page
      .getByRole('region', { name: 'Room chat', exact: true })
      .filter({ visible: true });
    await chat.getByRole('textbox', { name: 'Message your room' }).fill('Ready for a good game.');
    await chat.getByRole('button', { name: 'Send message', exact: true }).click();
    await expect(chat.getByText('Ready for a good game.', { exact: true })).toBeVisible();
    const close = page.getByRole('button', { name: 'Close dialog', exact: true });
    if (await close.isVisible()) await close.click();
    await page.getByRole('button', { name: 'Room options', exact: true }).click();
    await page.getByRole('button', { name: 'End this match', exact: true }).click();
    await page.getByRole('button', { name: 'Yes, end this match', exact: true }).click();
    await page.getByRole('button', { name: 'Change game and settings', exact: true }).click();
    await page.getByRole('combobox', { name: 'The game', exact: true }).selectOption('skyjo');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await page.getByRole('button', { name: 'Choose game', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Skyjo', exact: true })).toBeVisible();
    await expect(guest.getByRole('heading', { name: 'Skyjo', exact: true })).toBeVisible();
    // Clean up only this test's memberships through the same authorized API.
    await context.request.post(`/api/backend${roomPath.replace('/rooms/', '/v1/rooms/')}/leave`);
    await guestContext.request.post(
      `/api/backend${roomPath.replace('/rooms/', '/v1/rooms/')}/leave`,
    );
  } finally {
    await guestContext.close();
  }
});

test('Tarot reveals three distinct cards and survives a refresh', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Create Pop Tarot room', exact: true }).click();
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Browser Reader');
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Choose card 1 of 3' })).toBeVisible();
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
});
