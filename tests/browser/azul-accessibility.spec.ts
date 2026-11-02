import { expect, test, type Locator, type Page } from '@playwright/test';
import { azulDetails } from '../../packages/api-client/src/modern-details';
import {
  midgameScenarios,
  type MidgameScenario,
} from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Local legal-projection accessibility checks.');
test.use({ trace: 'off', screenshot: 'only-on-failure', reducedMotion: 'reduce' });

const colors = ['blue', 'yellow', 'red', 'black', 'white'];
const penalties = [1, 1, 2, 2, 2, 3, 3];

async function scenario(page: Page, id: string) {
  const fixture = midgameScenarios.find((entry) => entry.id === id)!;
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption('azul');
  await page.getByRole('combobox', { name: 'Mid-game scenario', exact: true }).selectOption(id);
  return fixture;
}

async function noFocusStops(container: Locator) {
  await expect(
    container.locator('button, a[href], input, select, textarea, [tabindex="0"]'),
  ).toHaveCount(0);
}

async function wallState(own: Locator, fixture: MidgameScenario) {
  const data = azulDetails(fixture.room.game!.detail);
  const wall = own.getByRole('group', { name: 'Wall', exact: true });
  await expect(wall.getByRole('img')).toHaveCount(25);
  const tree = await wall.ariaSnapshot();
  for (const [row, line] of data.walls[fixture.selfId].entries()) {
    for (const [column, tile] of line.entries()) {
      const contents = tile ? `${tile} tile` : `empty ${colors[(column - row + 5) % 5]} space`;
      const label = `Row ${row + 1}, column ${column + 1}: ${contents}`;
      await expect(wall.getByRole('img', { name: label, exact: true })).toHaveCount(1);
      expect(tree).toContain(`img "${label}"`);
    }
  }
  await noFocusStops(wall);
}

async function recordedKeyboardMove(page: Page, fixture: MidgameScenario, button: Locator) {
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  await expect(button).toBeEnabled();
  await button.focus();
  await page.keyboard.press('Enter');
  await expect
    .poll(async () => {
      const submitted = await page.getByLabel('Submitted action', { exact: true }).textContent();
      return submitted === 'No action submitted' ? null : JSON.parse(submitted!);
    })
    .toEqual(fixture.next.action);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/design/midgame');
});

test('Azul exposes drafted colours, existing lines and every floor penalty before placement', async ({
  page,
}) => {
  const fixture = await scenario(page, 'azul-2-17-6');
  const data = azulDetails(fixture.room.game!.detail);
  expect(data.draft).toEqual(['yellow', 'yellow', 'yellow']);
  expect(data.lines[fixture.selfId][1]).toEqual(['white', 'white']);
  expect(data.floors[fixture.selfId]).toEqual(['first']);
  const own = page.locator('.azul-player-board[data-own="true"]');
  const draft = page.getByRole('group', { name: 'Drafted tiles', exact: true });
  await expect(draft.getByRole('img', { name: 'yellow tile', exact: true })).toHaveCount(3);
  expect((await draft.ariaSnapshot()).match(/img "yellow tile"/g)).toHaveLength(3);
  await noFocusStops(draft);
  const tree = await own.ariaSnapshot();
  for (const [row, line] of data.lines[fixture.selfId].entries()) {
    const spaces = row + 1 - line.length;
    const option = fixture.room.game!.actions!.find(
      (entry) => entry.action.type === 'place_tiles' && entry.action.choice === String(row),
    );
    const contents = line.length ? `${line.length} ${line[0]} tiles` : 'empty';
    const fit = option
      ? `; ${Math.min(spaces, data.draft.length)} tiles fit, ${Math.max(0, data.draft.length - spaces)} go to floor`
      : '';
    const label = `Place on pattern line ${row + 1}, ${spaces} spaces available; ${contents}${fit}`;
    await expect(own.getByRole('button', { name: label, exact: true })).toHaveCount(1);
    expect(tree).toContain(`button "${label}"`);
  }
  for (const [index, penalty] of penalties.entries()) {
    const content = data.floors[fixture.selfId][index];
    const contents = content === 'first' ? 'first-player marker' : `${content} tile`;
    const label = `Floor slot ${index + 1}: ${content ? contents : 'empty'}, ${penalty} penalty point${penalty === 1 ? '' : 's'}${content ? '' : ' when filled'}`;
    const cell = own.getByRole('img', { name: label, exact: true });
    await expect(cell).toHaveCount(1);
    expect(tree).toContain(`img "${label}"`);
    await noFocusStops(cell);
  }
  await wallState(own, fixture);
  const row = Number(fixture.next.action.choice) + 1;
  await recordedKeyboardMove(
    page,
    fixture,
    own.getByRole('button', { name: new RegExp(`^Place on pattern line ${row},`) }),
  );
});

test('Azul distinguishes placed wall tiles from empty coloured spaces after scoring', async ({
  page,
}) => {
  const fixture = await scenario(page, 'azul-2-17-23');
  const data = azulDetails(fixture.room.game!.detail);
  const wall = data.walls[fixture.selfId].flat();
  expect(wall.filter(Boolean)).toHaveLength(3);
  expect(wall.filter((tile) => !tile)).toHaveLength(22);
  const own = page.locator('.azul-player-board[data-own="true"]');
  await wallState(own, fixture);
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
});

test('Azul keeps accessible draft actions and full boards within narrow and wide viewports', async ({
  page,
}) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const fixture = await scenario(page, 'azul-2-17-3');
    const action = fixture.next.action;
    const data = azulDetails(fixture.room.game!.detail);
    const source = action.choice === 'center' ? data.center : data.factories[Number(action.choice)];
    const count = source.filter((color) => color === action.color).length;
    const sourceLabel =
      action.choice === 'center' ? 'center' : `factory ${Number(action.choice) + 1}`;
    const button = page.getByRole('button', {
      name: `Take ${count} ${action.color} from ${sourceLabel}`,
      exact: true,
    });
    await recordedKeyboardMove(page, fixture, button);
    const draft = page.getByRole('group', { name: 'Drafted tiles', exact: true });
    const nextDraft = azulDetails(fixture.next.game.detail).draft;
    await expect(draft.getByRole('img')).toHaveCount(nextDraft.length);
    for (const tile of await draft.getByRole('img').all()) await expect(tile).toBeVisible();
    expect(
      (await draft.ariaSnapshot()).match(new RegExp(`img "${action.color} tile"`, 'g')),
    ).toHaveLength(nextDraft.length);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
  }
});
