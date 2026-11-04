import { expect, test, type Page } from '@playwright/test';
import {
  midgameScenarios,
  type MidgameScenario,
} from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Legally reached Uno scenarios are local-only.');
test.use({ trace: 'off', screenshot: 'only-on-failure', reducedMotion: 'reduce' });

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
