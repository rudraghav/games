import { expect, test, type Page } from '@playwright/test';
import {
  midgameScenarios,
  type MidgameScenario,
} from '../../apps/web/src/stories/generated/midgame-scenarios';
import catalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Legally reached scenario review is local-only.');
test.use({ trace: 'off', screenshot: 'only-on-failure' });

async function scenario(page: Page, item: MidgameScenario) {
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(item.game);
  await page
    .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
    .selectOption(item.id);
  await expect(page.locator('.midgame-review-table')).toHaveAttribute('data-midgame', item.id);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design/midgame');
  await expect(page.getByRole('heading', { name: 'Mid-game workspace review' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
});

test('all legally reached mid-game projections preserve readable cards and usable controls at both player limits', async ({
  page,
}) => {
  test.setTimeout(240000);
  const issues: unknown[] = [];
  expect(new Set(midgameScenarios.map((item) => item.game))).toEqual(
    new Set(catalogue.map((game) => game.id)),
  );
  for (const game of catalogue) {
    for (const seats of new Set([game.min_players, game.max_players]))
      expect(
        midgameScenarios.some(
          (item) => item.game === game.id && item.seats === seats && item.step > 1,
        ),
      ).toBe(true);
  }
  for (const item of midgameScenarios) {
    await scenario(page, item);
    const missingArtwork = await page.locator('.midgame-review-table').evaluate(async (root) => {
      const sources = [...root.querySelectorAll('svg image')]
        .filter((node) => (node as HTMLElement).checkVisibility())
        .map((node) => node.getAttribute('href'))
        .filter((path): path is string => Boolean(path));
      const results = await Promise.all(
        [...new Set(sources)].map(async (path) => {
          const image = new Image();
          image.src = path;
          try {
            await image.decode();
            return null;
          } catch {
            return path;
          }
        }),
      );
      return results.filter(Boolean);
    });
    const report = await page.locator('.midgame-review-table').evaluate((root) => {
      const visible = (node: Element) => (node as HTMLElement).checkVisibility();
      const tiny = [
        ...root.querySelectorAll(
          'button:not(:disabled),input:not(:disabled),select:not(:disabled),summary',
        ),
      ]
        .filter(visible)
        .filter((node) => {
          const box = node.getBoundingClientRect();
          return box.width < 43.5 || box.height < 43.5;
        })
        .map((node) => node.getAttribute('aria-label') || node.textContent?.trim());
      const clipped = [...root.querySelectorAll('.playing-card')]
        .filter(visible)
        .flatMap((card) => {
          const bounds = card.getBoundingClientRect();
          return [
            ...card.querySelectorAll(
              '.property-name,.property-value,.card-action-name,.card-center,.grid-card-value',
            ),
          ]
            .filter(visible)
            .filter((part) => {
              const range = document.createRange();
              range.selectNodeContents(part);
              const text = range.getBoundingClientRect();
              return (
                text.left < bounds.left - 2 ||
                text.right > bounds.right + 2 ||
                text.top < bounds.top - 2 ||
                text.bottom > bounds.bottom + 2
              );
            })
            .map((part) => `${card.getAttribute('aria-label')}: ${part.className}`);
        });
      return { overflow: document.documentElement.scrollWidth > innerWidth, tiny, clipped };
    });
    if (report.overflow || report.tiny.length || report.clipped.length || missingArtwork.length)
      issues.push({ scenario: item.label, id: item.id, report, missingArtwork });
  }
  expect(issues).toEqual([]);
});

test('selecting a mid-game card keeps the public table and hand in place', async ({ page }) => {
  test.setTimeout(120000);
  const selected = new Set<string>();
  for (const item of midgameScenarios.filter((entry) =>
    ['uno', 'uno-no-mercy', 'deal', 'deal-no-mercy', 'rummy', 'shithead'].includes(entry.game),
  )) {
    const key = `${item.game}:${item.seats}:${item.room.game!.phase}`;
    if (selected.has(key)) continue;
    await scenario(page, item);
    const card = page.locator('.midgame-review-table .card-hand > button:not(:disabled)').first();
    if (!(await card.count())) continue;
    selected.add(key);
    const positions = () =>
      card.evaluate((node) => {
        const hand = node.closest('.hand-rail,.hand-scroll')!;
        const table = node.closest('.table-layout')!;
        return {
          hand: hand.getBoundingClientRect().top + scrollY,
          table: table.getBoundingClientRect().top + scrollY,
        };
      });
    const before = await positions();
    await card.focus();
    await card.press('Space');
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    const after = await positions();
    expect(Math.abs(before.hand - after.hand), `${item.label}: hand position`).toBeLessThanOrEqual(
      2,
    );
    expect(
      Math.abs(before.table - after.table),
      `${item.label}: table position`,
    ).toBeLessThanOrEqual(2);
  }
  expect(selected.size).toBeGreaterThanOrEqual(10);
});

test('legal split, insurance, declaration, challenge and round-closing continuations render without API writes', async ({
  page,
}) => {
  const writes: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/backend/'))
      writes.push(new URL(request.url()).pathname);
  });
  const required = [
    ['blackjack', 'split'],
    ['blackjack', 'insurance'],
    ['rummy', 'declare'],
    ['uno', 'challenge'],
    ['skyjo', 'next_round'],
    ['boop', 'graduate'],
    ['sea-salt-paper', 'steal'],
    ['deal-no-mercy', 'keep'],
  ];
  for (const [game, action] of required) {
    const item = midgameScenarios.find(
      (entry) =>
        entry.game === game &&
        (entry.next.action.type === action || entry.room.game!.phase === action),
    );
    expect(item, `Legally reached ${game}/${action} must exist`).toBeTruthy();
    await scenario(page, item!);
    const move = item!.room.game!.actions!.find(
      (option) => JSON.stringify(option.action) === JSON.stringify(item!.next.action),
    )!;
    if (game === 'rummy') {
      const index = item!.room.game!.hand.findIndex((card) => card.id === item!.next.action.card);
      await page.locator('.rummy-groups .card-hand > button').nth(index).click();
      await page.getByRole('button', { name: move.label, exact: true }).click();
    } else if (game === 'sea-salt-paper') {
      const target = item!.room.members.find((member) => member.id === item!.next.action.target)!;
      await page.getByRole('button', { name: `${target.name} · random card`, exact: true }).click();
    } else if (game === 'deal-no-mercy') {
      const card = item!.room
        .game!.players.flatMap((player) => [
          ...(player.bank || []),
          ...Object.values(player.properties || {}).flat(),
        ])
        .find((card) => card.id === item!.next.action.card)!;
      const name = card.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await page.getByRole('button', { name: new RegExp(`^${name}, bank value`) }).click();
      await page.getByRole('button', { name: 'Keep card', exact: true }).click();
    } else {
      await page.getByRole('button', { name: move.label, exact: true }).click();
    }
    const summary = page.getByText('Recorded legal continuation', { exact: true });
    if (!(await summary.evaluate((node) => (node.parentElement as HTMLDetailsElement).open)))
      await summary.click();
    await expect(page.getByLabel('Submitted action')).toHaveText(JSON.stringify(item!.next.action));
    if (game === 'blackjack' && action === 'split')
      await expect(page.locator('.blackjack-hand')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  // Finishing the third Tarot choice uses a local unavailable-reading cache;
  // it never calls the generation endpoint while reviewing this table.
  const tarot = midgameScenarios.find(
    (item) => item.game === 'tarot' && item.next.game.phase === 'reading',
  )!;
  await scenario(page, tarot);
  const summary = page.getByText('Recorded legal continuation', { exact: true });
  if (!(await summary.evaluate((node) => (node.parentElement as HTMLDetailsElement).open)))
    await summary.click();
  await page.getByRole('button', { name: 'Apply recorded legal move', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeDisabled();
  expect(writes).toEqual([]);
});
