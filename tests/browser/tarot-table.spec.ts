import { expect, test, type Page } from '@playwright/test';
import { tarotReadingExample } from '../../apps/web/src/stories/fixtures/tarot-reading';
import { requestAs, roomAs } from './helpers';

test.use({ trace: 'off', screenshot: 'off' });
test.skip(!!process.env.GAMES_TEST_URL, 'Synthetic reading responses use local development only.');

const deck = (page: Page) =>
  page.getByRole('group', { name: 'Choose from your shuffled 78-card deck' });

async function soloRoom(page: Page, run: (roomId: string) => Promise<void>) {
  let roomId: string | undefined;
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Pop Tarot room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Spread QA');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
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

test('each pick is revealed in its slot, named and focused; the deck is one Tab stop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await soloRoom(page, async (roomId) => {
    await expect(
      page.getByRole('heading', { name: 'Choose card 1 of 3 · Where you are' }),
    ).toBeVisible();
    const cards = deck(page).locator('button.tarot-card');
    await expect(cards).toHaveCount(78);
    expect(await cards.evaluateAll((all) => all.filter((card) => card.tabIndex === 0).length)).toBe(
      1,
    );
    await expect(cards.first()).toHaveAccessibleName('Face-down card 1 of 78, for where you are');
    // Empty slots are drop targets, not tappable card backs.
    await expect(page.locator('.tarot-spread .tarot-card--back')).toHaveCount(0);
    await expect(page.locator('.tarot-spread-slot[data-next] .tarot-slot-empty')).toHaveText(
      'Your next card lands here',
    );

    await cards.nth(2).click();
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

    // Back to the deck, then a keyboard pick with arrow keys.
    await page.getByRole('button', { name: 'Choose card 2 of 3', exact: true }).click();
    await expect(deck(page).locator('button.tarot-card[tabindex="0"]')).toBeFocused();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect(page.locator(':focus')).toHaveAccessibleName(/^Face-down card \d+ of 77/);
    await page.keyboard.press('Enter');
    const second = page.locator('.tarot-spread-slot').nth(1);
    await expect(second.locator('.tarot-name')).not.toBeEmpty();
    await expect(second).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.locator(':focus')).toHaveText('Choose card 3 of 3');

    // A refresh mid-spread keeps both cards and does not replay the reveal.
    const names = await page.locator('.tarot-spread .tarot-name').allTextContents();
    await page.reload();
    await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(names);
    await expect(page.locator('[data-fresh]')).toHaveCount(0);
    await deck(page).locator('button.tarot-card').first().click();
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
});

test('an unsent question survives a refresh and the deck filter stays pinned', async ({ page }) => {
  await soloRoom(page, async () => {
    for (let card = 0; card < 3; card++)
      await deck(page).locator('button.tarot-card').first().click();
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

test('a finished solo reading offers a one-tap new spread and wraps credits on a phone', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await soloRoom(page, async (roomId) => {
    for (let card = 0; card < 3; card++)
      await deck(page).locator('button.tarot-card').first().click();
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeVisible();
    const room = await roomAs(page, roomId);
    const cards = room.game!.community;
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
              question: '',
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
    await expect.poll(() => sent).toEqual(['ready', 'start']);
  });
});
