import { expect, test, type Page } from '@playwright/test';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Local-only legal engine scenario review.');
test.use({ reducedMotion: 'reduce' });

type Bounds = { x: number; y: number; width: number; height: number };
async function anchors(page: Page, selectors: string[]) {
  const values: Record<string, Bounds> = {};
  for (const selector of selectors) {
    const node = page.locator(selector).first();
    values[selector] = await node.evaluate((element) => {
      const r = element.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height };
    });
  }
  return values;
}
async function steady(page: Page, selectors: string[], action: () => Promise<unknown>) {
  const before = await anchors(page, selectors);
  await action();
  await page.evaluate(
    () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
  );
  const after = await anchors(page, selectors);
  for (const selector of selectors)
    for (const field of ['x', 'y', 'width', 'height'] as const)
      expect(
        Math.abs(before[selector][field] - after[selector][field]),
        `${selector} ${field} shifted`,
      ).toBeLessThanOrEqual(2);
}
async function gallery(page: Page, label: string) {
  await page.goto('/design');
  await page.getByLabel('Table scenario').selectOption({ label });
  await page.evaluate(() => document.fonts.ready);
}
async function midgame(page: Page, game: string, phase: string) {
  const fixture = midgameScenarios.find(
    (item) => item.game === game && item.room.game!.phase === phase,
  )!;
  expect(fixture, `Engine reached ${game}/${phase}`).toBeTruthy();
  await page.goto('/design/midgame');
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(game);
  await page.getByLabel('Mid-game scenario').selectOption(fixture.id);
  await page.evaluate(() => document.fonts.ready);
  return fixture;
}

test('hand selections and grouping controls keep card and board wells stationary', async ({
  page,
}) => {
  await gallery(page, 'Uno · maximum seats');
  await steady(page, ['.card-table', '.private-hand', '.action-panel'], () =>
    page.getByRole('group', { name: 'Your hand', exact: true }).getByRole('button').first().click(),
  );
  await steady(page, ['.card-table', '.private-hand', '.action-panel'], () =>
    page.getByRole('button', { name: 'Clear selection', exact: true }).click(),
  );

  await gallery(page, 'Rummy · maximum seats');
  await steady(page, ['.card-table', '.rummy-groups', '.action-panel'], () =>
    page.getByRole('group', { name: 'Ungrouped', exact: true }).getByRole('button').first().click(),
  );
  await expect(page.getByRole('group', { name: /^Move .* to a group$/ })).toBeVisible();

  await gallery(page, 'Shithead · maximum seats');
  await steady(
    page,
    [
      '.shithead-piles',
      '.shithead-private-cards',
      '.shithead-player-table[data-self="true"]',
      '.shithead-opponents',
    ],
    () =>
      page
        .getByRole('group', { name: 'Your hand', exact: true })
        .getByRole('button')
        .first()
        .click(),
  );
  await expect(page.getByRole('button', { name: 'Clear selection', exact: true })).toBeVisible();
});

test('market and simultaneous choices keep the public board visible and stationary', async ({
  page,
}) => {
  await gallery(page, 'Gem Market · maximum seats');
  await steady(page, ['.gem-table', '.gem-wallet', '.action-panel'], () =>
    page.getByRole('button', { name: 'Select pearl', exact: true }).click(),
  );
  await steady(page, ['.gem-table', '.gem-wallet', '.action-panel'], () =>
    page
      .locator('.gem-tier[data-current="true"] .development-card, .gem-tier .development-card')
      .filter({ visible: true })
      .first()
      .click(),
  );

  await gallery(page, 'The Gang · maximum seats');
  await steady(page, ['.gang-community', '.gang-private', '.gang-turn-dock'], () =>
    page.locator('.gang-chip-choice:enabled').first().click(),
  );
  await expect(page.locator('.gang-decision-note')).not.toBeEmpty();

  await gallery(page, '6 nimmt! · maximum seats');
  await steady(page, ['.six-rows', '.six-hand-panel'], () =>
    page.locator('.six-hand .playing-card').first().click(),
  );
  await expect(page.getByRole('button', { name: 'Lock my number' })).toBeEnabled();
});

test('opponent inspections expose only public assets without replacing the own board', async ({
  page,
}) => {
  await gallery(page, 'Skyjo · maximum seats');
  await expect(page.locator('.skyjo-grid')).toHaveCount(1);
  await expect(page.locator('.skyjo-mini-grid')).toHaveCount(7);
  const own = await page.getByRole('group', { name: 'Your Skyjo grid', exact: true }).innerHTML();
  await page.getByRole('button', { name: 'Inspect Dev', exact: true }).click();
  const inspector = page.getByRole('dialog', { name: 'Dev · public table', exact: true });
  await expect(inspector.locator('button.playing-card')).toHaveCount(0);
  await expect(inspector.getByRole('img', { name: /^Face-down card, row/ })).toHaveCount(12);
  await inspector.getByRole('button', { name: 'Close dialog' }).click();
  expect(await page.getByRole('group', { name: 'Your Skyjo grid', exact: true }).innerHTML()).toBe(
    own,
  );

  await gallery(page, 'Shithead · maximum seats');
  await page.getByRole('button', { name: 'Inspect Dev', exact: true }).click();
  const table = page.getByRole('dialog', { name: 'Dev · public table', exact: true });
  await expect(table.getByRole('img', { name: /^Hidden card [123]$/ })).toHaveCount(3);
  await expect(table.locator('button.playing-card')).toHaveCount(0);
  await table.getByRole('button', { name: 'Close dialog' }).click();
});

test('legal mid-game private selections and public targets stay in fixed decision areas', async ({
  page,
}) => {
  await midgame(page, 'word-agents', 'guess');
  await steady(page, ['.word-board', '.word-action-dock'], () =>
    page.locator('.word-board button:enabled').first().click(),
  );
  await expect(page.getByRole('button', { name: /^Confirm / })).toBeEnabled();

  await midgame(page, 'sea-salt-paper', 'choosing');
  await steady(page, ['.paper-source-dock', '.paper-hand'], () =>
    page.locator('.paper-private-choice .paper-playing-card').first().click(),
  );
  const keepChoices = page.getByRole('button', { name: /^Keep selected/ });
  await expect(keepChoices).toHaveCount(2);
  for (const choice of await keepChoices.all())
    expect(
      await choice.evaluate((node) => {
        const box = node.getBoundingClientRect();
        const dock = node.closest('.decision-dock')!.getBoundingClientRect();
        return box.top >= dock.top && box.bottom <= dock.bottom;
      }),
    ).toBe(true);

  await midgame(page, 'boop', 'graduating');
  await steady(page, ['.boop-bed', '.boop-graduation'], () =>
    page.locator('.boop-graduation button').first().focus(),
  );
  expect(await page.locator('.boop-square[data-highlight="true"]').count()).toBeGreaterThan(0);
});

test('Azul board and supply retain their places after the recorded draft is committed', async ({
  page,
}) => {
  await midgame(page, 'azul', 'drafting');
  await page.getByText('Recorded legal continuation', { exact: true }).click();
  const board = page.locator('.azul-player-board[data-own="true"]');
  await steady(page, ['.azul-player-board[data-own="true"]', '.azul-supply'], async () => {
    await page.getByRole('button', { name: 'Apply recorded legal move' }).click();
  });
  await expect(page.locator('.azul-table')).toHaveAttribute('data-phase', 'placing');
  await expect(board.getByRole('button', { name: /^Place on pattern line/ }).first()).toBeVisible();
});

test('casino decisions keep a compact fixed dock and every legal control can be reached', async ({
  page,
}) => {
  await page.goto('/design/midgame');
  const scenarios = midgameScenarios.filter((item) =>
    ['holdem', 'teen-patti', 'blackjack'].includes(item.game),
  );
  expect(scenarios.some((item) => item.next.action.type === 'split')).toBe(true);
  expect(scenarios.some((item) => item.next.action.type === 'double')).toBe(true);
  let height: number | null = null;
  for (const item of scenarios) {
    await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(item.game);
    await page.getByLabel('Mid-game scenario').selectOption(item.id);
    const dock = page.locator('.casino-decision-shell .action-panel');
    const currentHeight = await dock.evaluate((node) => node.getBoundingClientRect().height);
    expect(
      await dock.evaluate(
        (node) =>
          node.querySelector('.action-context')!.getBoundingClientRect().top >=
          node.getBoundingClientRect().top,
      ),
      `${item.label}: decision heading starts inside the dock`,
    ).toBe(true);
    if (height !== null) expect(currentHeight).toBe(height);
    height = currentHeight;
    const controls = dock.locator('button:enabled,input:enabled,select:enabled');
    const firstButton = dock.locator('button:enabled').first();
    if (await firstButton.count())
      expect(
        await firstButton.evaluate((node) => {
          const box = node.getBoundingClientRect(),
            frame = node.closest('.decision-dock')!.getBoundingClientRect();
          return box.top >= frame.top && box.bottom <= frame.bottom;
        }),
        `${item.label}: first action initially visible`,
      ).toBe(true);
    for (const control of await controls.all()) {
      await control.scrollIntoViewIfNeeded();
      const visible = await control.evaluate((node) => {
        const root = node.closest('.decision-dock')!;
        const r = root.getBoundingClientRect(),
          b = node.getBoundingClientRect();
        return (
          b.top >= r.top && b.bottom <= r.bottom + 1 && b.left >= r.left && b.right <= r.right + 1
        );
      });
      expect(visible, `${item.label}: ${await control.textContent()}`).toBe(true);
    }
  }
  expect(height).toBe((page.viewportSize()?.width || 0) < 701 ? 252 : 192);
});

test('split blackjack hands have explicit navigation while the table and controls stay fixed', async ({
  page,
}) => {
  await page.goto('/design/midgame');
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption('blackjack');
  await page.getByLabel('Mid-game scenario').selectOption('blackjack-7-31-11');
  await page.getByText('Recorded legal continuation', { exact: true }).click();
  await page.getByRole('button', { name: 'Apply recorded legal move' }).click();
  await expect(page.locator('.blackjack-hand')).toHaveCount(2);
  const second = page.locator('.blackjack-hand').nth(1);
  const next = page.getByRole('button', { name: 'Next blackjack hands', exact: true });
  await expect(next).toBeEnabled();
  await steady(page, ['.casino-felt', '.casino-own-cards', '.casino-decision-shell'], () =>
    next.click(),
  );
  expect(
    await second.evaluate((node) => {
      const b = node.getBoundingClientRect(),
        v = node.closest('.blackjack-hands')!.getBoundingClientRect();
      return b.left >= v.left - 2 && b.right <= v.right + 2;
    }),
  ).toBe(true);
});

test('modeless peek resets after the hand closes and reopens its controlled panel', async ({
  page,
}) => {
  await page.goto('/design/deal');
  await page.getByRole('combobox', { name: 'Deal scenario', exact: true }).selectOption('forced');
  const forcedDeal = page
    .getByRole('group', { name: 'Your hand', exact: true })
    .getByRole('button', { name: /^Forced deal, bank value 3M/ });
  await forcedDeal.click();
  const panel = page.getByRole('dialog');
  await panel.getByRole('button', { name: 'View table', exact: true }).click();
  await expect(panel).toHaveAttribute('data-peeking', 'true');
  await page.getByRole('button', { name: 'Clear card selection', exact: true }).click();
  await expect(panel).toHaveCount(0);
  await forcedDeal.click();
  await expect(panel).toHaveAttribute('data-peeking', 'false');
  await expect(panel.getByRole('button', { name: 'View table', exact: true })).toBeVisible();
  await expect(panel.getByRole('combobox', { name: 'Player', exact: true })).toBeVisible();
  await panel.getByRole('button', { name: 'Close move options', exact: true }).click();
  await expect(forcedDeal).toBeFocused();
});
