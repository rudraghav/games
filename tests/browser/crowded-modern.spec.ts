import { expect, test, type Page } from '@playwright/test';
import {
  midgameScenarios,
  type MidgameScenario,
} from '../../apps/web/src/stories/generated/midgame-scenarios';

const games = ['flip-7', 'trio', 'azul', 'gem-market', 'sea-salt-paper', 'the-gang', 'six-nimmt'];
const scenarios = midgameScenarios.filter((item) => games.includes(item.game));
test.skip(Boolean(process.env.GAMES_TEST_URL), 'Engine projection review is local-only.');
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

async function show(page: Page, item: MidgameScenario) {
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(item.game);
  await page
    .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
    .selectOption(item.id);
  await expect(page.locator('.midgame-review-table')).toHaveAttribute('data-midgame', item.id);
}

async function expandCollections(page: Page) {
  // Index stable details, not the shrinking set of closed details.
  for (const details of await page.locator('.midgame-review-table details').all()) {
    if ((await details.getAttribute('open')) === null) {
      const summary = details.locator(':scope > summary');
      if (await summary.isVisible()) await summary.click();
    }
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/design/midgame');
  await expect(page.getByRole('heading', { name: 'Mid-game workspace review' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
});

test('all seven modern families keep expanded collections within rows at compact and wide widths', async ({
  page,
}, info) => {
  test.setTimeout(240000);
  const widths = info.project.name === 'phone' ? [320, 390] : [768, 1440];
  const failures: unknown[] = [];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const item of scenarios) {
      await show(page, item);
      await expandCollections(page);
      const measured = await page.locator('.midgame-review-table').evaluate((root) => {
        const visible = (element: Element) => (element as HTMLElement).checkVisibility();
        const small = [...root.querySelectorAll('button:enabled,summary')]
          .filter(visible)
          .filter((element) => {
            const box = element.getBoundingClientRect();
            return box.width < 43.5 || box.height < 43.5;
          })
          .map((element) => element.getAttribute('aria-label') || element.textContent?.trim());
        const collections = [
          ...root.querySelectorAll('.gem-bought-cards,.paper-collections .paper-card-row'),
        ]
          .filter(visible)
          .map((row) => {
            const bounds = row.getBoundingClientRect();
            const cards = [...row.children]
              .filter(visible)
              .map((card) => card.getBoundingClientRect());
            return {
              clipped: cards.some(
                (card) =>
                  card.left < bounds.left - 1 ||
                  card.right > bounds.right + 1 ||
                  card.bottom > bounds.bottom + 1,
              ),
              overlap: cards.some((card, index) =>
                cards
                  .slice(index + 1)
                  .some(
                    (other) =>
                      Math.min(card.right, other.right) - Math.max(card.left, other.left) > 1 &&
                      Math.min(card.bottom, other.bottom) - Math.max(card.top, other.top) > 1,
                  ),
              ),
            };
          });
        return {
          pageOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          small,
          clippedCollections: collections.filter((row) => row.clipped || row.overlap).length,
        };
      });
      if (measured.pageOverflow || measured.small.length || measured.clippedCollections)
        failures.push({ id: item.id, width, ...measured });
    }
  }
  expect(failures).toEqual([]);
  for (const game of ['flip-7', 'trio', 'gem-market', 'sea-salt-paper'])
    expect(scenarios.some((item) => item.game === game && item.id.endsWith('-crowded'))).toBe(true);
});

test('private Paper choices have keyboard navigation and explicit selection while blocked actions stay disabled', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: info.project.name === 'phone' ? 320 : 768, height: 900 });
  const item = scenarios.find((entry) => entry.id === 'sea-salt-paper-4-31-63')!;
  await show(page, item);
  const rail = page.locator('.paper-choice-rail');
  const viewport = rail.getByRole('group', { name: 'Discard cards to choose', exact: true });
  const choices = rail.locator('.paper-playing-card');
  await expect(choices).toHaveCount(6);
  if (
    await rail
      .getByRole('button', { name: 'Next cards in discard cards to choose', exact: true })
      .count()
  ) {
    const next = rail.getByRole('button', {
      name: 'Next cards in discard cards to choose',
      exact: true,
    });
    for (let attempts = 0; attempts < 10 && (await next.isEnabled()); attempts++) {
      await next.focus();
      await page.keyboard.press('Enter');
    }
    await expect(next).toBeDisabled();
  }
  const tail = choices.last();
  await tail.focus();
  const bounds = await viewport.boundingBox();
  const card = await tail.boundingBox();
  expect(card!.x).toBeGreaterThanOrEqual(bounds!.x - 1);
  expect(card!.x + card!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
  await page.keyboard.press('Space');
  await expect(tail).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.paper-choice-information strong')).toHaveText('Boat · Black');
  const take = page.getByRole('button', { name: 'Take selected Boat', exact: true });
  await expect(take).toBeEnabled();
  for (const state of ['Saving a move', 'Disconnected']) {
    await page.getByRole('checkbox', { name: state, exact: true }).check();
    await expect(take).toBeDisabled();
    await expect(tail).toBeDisabled();
    await page.getByRole('checkbox', { name: state, exact: true }).uncheck();
  }
  await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
  await expect(tail).toHaveAttribute('aria-pressed', 'false');
  await expect(take).toHaveCount(0);
  await tail.focus();
  await page.keyboard.press('Space');
  await take.focus();
  await page.keyboard.press('Enter');
  await page.getByText('Recorded legal continuation', { exact: true }).click();
  const expected = item.room.game!.actions!.find(
    (option) =>
      option.action.type === 'take_inspected' && option.action.card === 'paper-boat-black-1',
  );
  expect(expected).toBeTruthy();
  await expect(page.getByLabel('Submitted action')).toHaveText(JSON.stringify(expected!.action));
});

test('legally cleared Trio positions keep their names and are never reveal controls', async ({
  page,
}) => {
  for (const item of scenarios.filter(
    (entry) => entry.game === 'trio' && entry.id.endsWith('-crowded'),
  )) {
    await show(page, item);
    const empty = item.room.game!.community!.filter((card) => card.suit === 'empty');
    expect(empty.length).toBeGreaterThan(0);
    const positions = page.locator('.trio-table-cards');
    const tree = await positions.ariaSnapshot();
    for (const card of empty) {
      await expect(positions.getByRole('img', { name: card.label, exact: true })).toHaveCount(1);
      await expect(positions.getByRole('button', { name: card.label, exact: true })).toHaveCount(0);
      expect(tree).toContain(`img "${card.label}"`);
    }
    await expect(positions.locator('.trio-table-slot')).toHaveCount(
      item.room.game!.community!.length,
    );
  }
});
