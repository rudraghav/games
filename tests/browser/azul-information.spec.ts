import { expect, test } from '@playwright/test';
import { azulDetails } from '../../packages/api-client/src/modern-details';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Legal projection review is local-only.');
test.use({ reducedMotion: 'reduce', trace: 'off' });

test('Azul explains fit, overflow, occupied floor penalties and the first-player marker before a move', async ({
  page,
}) => {
  const scenario = midgameScenarios.find((item) => {
    if (item.game !== 'azul' || item.room.game!.phase !== 'placing') return false;
    const data = azulDetails(item.room.game!.detail);
    return item.room.game!.actions!.some((option) => {
      if (option.action.type !== 'place_tiles' || option.action.choice === 'floor') return false;
      const row = Number(option.action.choice);
      return data.draft.length > row + 1 - data.lines[item.selfId][row].length;
    });
  })!;
  expect(scenario, 'Reachable placement with actual overflow').toBeTruthy();
  const data = azulDetails(scenario.room.game!.detail);
  const writes: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/backend/'))
      writes.push(request.url());
  });
  await page.goto('/design/midgame');
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption('azul');
  await page
    .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
    .selectOption(scenario.id);
  const own = page.locator('.azul-player-board[data-own="true"]');
  const penalties = [1, 1, 2, 2, 2, 3, 3];
  const floorHeld = data.floors[scenario.selfId].length;
  const cost = (overflow: number) =>
    penalties.slice(floorHeld, Math.min(7, floorHeld + overflow)).reduce((sum, n) => sum + n, 0);
  for (const option of scenario.room.game!.actions!.filter(
    (entry) => entry.action.type === 'place_tiles' && entry.action.choice !== 'floor',
  )) {
    const row = Number(option.action.choice);
    const held = data.lines[scenario.selfId][row].length;
    const spaces = row + 1 - held;
    const fits = Math.min(spaces, data.draft.length);
    const overflow = Math.max(0, data.draft.length - spaces);
    const button = own.getByRole('button', {
      name: new RegExp(`^Place on pattern line ${row + 1},`),
    });
    await expect(button).toHaveAccessibleName(
      new RegExp(`${fits} tiles fit, ${overflow} go to floor`),
    );
    // Fit, completion and the exact floor cost are on the line before the move.
    await expect(button.locator('.azul-pattern-consequence')).toHaveText(
      `${held + fits === row + 1 ? 'completes' : `${held + fits}/${row + 1} filled`}${
        overflow ? ` ${overflow} to floor −${cost(overflow)}` : ''
      }`,
    );
    if (overflow)
      await expect(button).toHaveAccessibleName(
        new RegExp(`costing ${cost(overflow)} point${cost(overflow) === 1 ? '' : 's'}`),
      );
  }
  // Single-column layouts pin every destination, with its cost, beside the drafted tiles.
  if ((page.viewportSize()?.width ?? 0) <= 1000) {
    const choices = page.getByRole('group', { name: 'Where the tiles go', exact: true });
    await expect(choices.getByRole('button')).toHaveCount(6);
    await expect(
      choices.getByRole('button', {
        name: new RegExp(`^Choose the floor: ${data.draft.length} tile`),
      }),
    ).toHaveAccessibleName(new RegExp(`costing ${cost(data.draft.length)} point|no cost`));
  }
  await expect(own.locator('.azul-floor-cell > small')).toHaveText([
    '−1',
    '−1',
    '−2',
    '−2',
    '−2',
    '−3',
    '−3',
  ]);
  for (const cell of await own.locator('.azul-floor-cell').all())
    await expect(cell.locator('small')).toBeVisible();
  const occupied = midgameScenarios.find(
    (item) =>
      item.game === 'azul' && azulDetails(item.room.game!.detail).floors[item.selfId].length > 0,
  )!;
  expect(occupied, 'Reachable occupied-floor projection').toBeTruthy();
  await page
    .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
    .selectOption(occupied.id);
  const filled = own.locator('.azul-floor-cell').filter({ has: page.locator('.azul-tile') });
  expect(await filled.count()).toBeGreaterThan(0);
  for (const cell of await filled.all()) {
    await expect(cell.locator('.azul-tile')).toBeVisible();
    await expect(cell.locator('small')).toBeVisible();
    await expect(cell.locator('small')).toHaveText(/−[123]/);
  }
  await expect(own.locator('.azul-floor')).toContainText(/Floor · −[1-9]\d* points?/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.goto('/design');
  await page.getByLabel('Table scenario').selectOption({ label: 'Azul · maximum seats' });
  await expect(
    page.getByText('First from the centre: start next round and add the marker to your floor.'),
  ).toBeVisible();
  expect(writes).toEqual([]);
});
