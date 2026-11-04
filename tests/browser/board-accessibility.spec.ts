import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  midgameScenarios,
  type MidgameScenario,
} from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Local legal-projection accessibility checks.');
test.use({ trace: 'off', screenshot: 'only-on-failure', reducedMotion: 'reduce' });

async function scenario(page: Page, game: string) {
  const fixture = midgameScenarios.find((entry) => entry.game === game && entry.step === 8)!;
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(game);
  await page
    .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
    .selectOption(fixture.id);
  return fixture;
}

function playerName(fixture: MidgameScenario, seat: number) {
  const id = fixture.room.game!.players[seat].id;
  return fixture.room.members.find((member) => member.id === id)!.name;
}

async function expectImagesInTree(container: Locator, labels: string[]) {
  await expect(container.getByRole('img')).toHaveCount(labels.length);
  const snapshot = await container.ariaSnapshot();
  for (const label of labels) {
    await expect(container.getByRole('img', { name: label, exact: true })).toHaveCount(1);
    expect(snapshot).toContain(`img "${label}"`);
  }
}

async function inspectOverview(page: Page, labels: string[]) {
  const opener = page.getByRole('button', { name: 'View whole board', exact: true });
  const submitted = page.getByLabel('Submitted action', { exact: true });
  await opener.click();
  const dialog = page.getByRole('dialog');
  await expectImagesInTree(dialog, labels);
  // Read-only inspection adds no moves or extra keyboard stops.
  await expect(
    dialog.locator('button, a[href], input, select, textarea, [tabindex="0"]'),
  ).toHaveCount(1);
  const close = dialog.getByRole('button', { name: 'Close dialog', exact: true });
  await expect(close).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(close).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(close).toBeFocused();
  await expect(submitted).toHaveText('No action submitted');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
  await expect(submitted).toHaveText('No action submitted');
}

async function keyboardMove(page: Page, fixture: MidgameScenario, label: string) {
  for (const key of ['Enter', 'Space']) {
    await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
    const control = page.getByRole('button', { name: label, exact: true });
    await expect(control).toBeEnabled();
    await control.focus();
    await page.keyboard.press(key);
    await expect
      .poll(async () => {
        const recorded = await page.getByLabel('Submitted action', { exact: true }).textContent();
        return recorded === 'No action submitted' ? null : JSON.parse(recorded!);
      })
      .toEqual(fixture.next.action);
  }
}

test.beforeEach(async ({ page }) => {
  await page.goto('/design/midgame');
});

test('Four exposes occupied and empty squares without adding moves to its overview', async ({
  page,
}) => {
  const fixture = await scenario(page, 'four-in-a-row');
  const game = fixture.room.game!;
  const cells = game.community!;
  expect(cells.some((cell) => cell.value === '')).toBe(true);
  expect(cells.some((cell) => cell.value === '1')).toBe(true);
  expect(cells.some((cell) => cell.value === '2')).toBe(true);
  const labels = cells.map(
    (cell) =>
      `${cell.label}: ${cell.value ? playerName(fixture, Number(cell.value) - 1) : 'empty'}`,
  );
  expect(labels).toHaveLength(42);
  await expectImagesInTree(
    page.getByRole('group', { name: 'Playing surface', exact: true }),
    labels,
  );
  await inspectOverview(page, labels);
  const option = game.actions!.find((entry) => entry.action.choice === fixture.next.action.choice)!;
  await keyboardMove(page, fixture, option.label);
});

test('Mancala names both players pits and stores in the table and read-only overview', async ({
  page,
}) => {
  const fixture = await scenario(page, 'mancala');
  const game = fixture.room.game!;
  const pits = game.community!;
  const labels = pits.map(
    (card, index) =>
      `${playerName(fixture, index < 7 ? 0 : 1)} · ${card.label}: ${card.value} ${card.value === '1' ? 'seed' : 'seeds'}`,
  );
  expect(labels).toHaveLength(14);
  const board = page.locator('.mancala-board');
  await expectImagesInTree(board, [labels[6], labels[13]]);
  const snapshot = await board.ariaSnapshot();
  for (const [index, card] of pits.entries()) {
    if (index === 6 || index === 13) continue;
    const option = game.actions!.find((entry) => entry.action.choice === card.id);
    const label = option
      ? `${option.label} · ${playerName(fixture, index < 7 ? 0 : 1)}`
      : labels[index];
    await expect(board.getByRole('button', { name: label, exact: true })).toHaveCount(1);
    expect(snapshot).toContain(`button "${label}"`);
  }
  await inspectOverview(page, labels);
  const option = game.actions!.find((entry) => entry.action.choice === fixture.next.action.choice)!;
  const owner = playerName(fixture, Number(option.action.choice) < 7 ? 0 : 1);
  await keyboardMove(page, fixture, `${option.label} · ${owner}`);
});
