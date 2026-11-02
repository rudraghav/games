import { expect, test, type Page } from '@playwright/test';
import {
  midgameScenarios,
  type MidgameScenario,
} from '../../apps/web/src/stories/generated/midgame-scenarios';

const games = [
  'four-in-a-row',
  'reversi',
  'checkers',
  'mancala',
  'boop',
  'word-agents',
  'spill-or-chill',
  'most-likely',
  'hot-seat',
  'tarot',
];
const scenarios = midgameScenarios.filter((item) => games.includes(item.game));
test.skip(Boolean(process.env.GAMES_TEST_URL), 'Legal projection review is local-only.');
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

async function show(page: Page, item: MidgameScenario) {
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(item.game);
  await page
    .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
    .selectOption(item.id);
  await expect(page.locator('.midgame-review-table')).toHaveAttribute('data-midgame', item.id);
}
async function reset(page: Page) {
  await page.getByRole('checkbox', { name: 'Saving a move', exact: true }).uncheck();
  await page.getByRole('checkbox', { name: 'Disconnected', exact: true }).uncheck();
  await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
}
async function recorded(page: Page, action: unknown) {
  const disclosure = page.getByText('Recorded legal continuation', { exact: true });
  if (!(await disclosure.evaluate((node) => (node.parentElement as HTMLDetailsElement).open)))
    await disclosure.click();
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    JSON.stringify(action),
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto('/design/midgame');
  await expect(page.getByRole('heading', { name: 'Mid-game workspace review' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
});

test('crowded board, party and Tarot projections keep readable labels and full-size reachable controls', async ({
  page,
}, info) => {
  test.setTimeout(240000);
  const widths = info.project.name === 'phone' ? [320, 390] : [768, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const item of scenarios) {
      await show(page, item);
      const result = await page.locator('.midgame-review-table').evaluate((root) => {
        const visible = (node: Element) => (node as HTMLElement).checkVisibility();
        const controls = [
          ...root.querySelectorAll(
            'button:not(:disabled),input:not(:disabled),select:not(:disabled),summary',
          ),
        ].filter(visible);
        const small = controls
          .filter((node) => {
            const box = node.getBoundingClientRect();
            return box.width < 43.5 || box.height < 43.5;
          })
          .map((node) => node.getAttribute('aria-label') || node.textContent?.trim());
        const clippedText = [
          ...root.querySelectorAll('.word-tile strong,.word-tile > span,.party-choice__label'),
        ]
          .filter(visible)
          .filter((node) => {
            const container = node.closest('.word-tile,.party-choice')!;
            const bounds = container.getBoundingClientRect();
            const range = document.createRange();
            range.selectNodeContents(node);
            const text = range.getBoundingClientRect();
            return (
              text.left < bounds.left - 1 ||
              text.right > bounds.right + 1 ||
              text.top < bounds.top - 1 ||
              text.bottom > bounds.bottom + 1
            );
          })
          .map((node) => node.textContent);
        return { overflow: document.documentElement.scrollWidth > innerWidth, small, clippedText };
      });
      expect(result, `${item.id} at ${width}px`).toEqual({
        overflow: false,
        small: [],
        clippedText: [],
      });
    }
  }
});

test('crowded decisions support keyboard selection, clear, blocked states and exact legal commits', async ({
  page,
}, info) => {
  const writes: string[] = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().includes('/api/backend/'))
      writes.push(new URL(request.url()).pathname);
  });
  const width = info.project.name === 'phone' ? 320 : 1440;
  await page.setViewportSize({ width, height: 900 });
  for (const game of ['four-in-a-row', 'reversi', 'mancala']) {
    const item = midgameScenarios.find((entry) => entry.game === game)!;
    await show(page, item);
    const action = item.room.game!.actions![0];
    const name =
      game === 'four-in-a-row'
        ? `Drop in column ${Number(action.action.choice) + 1}`
        : new RegExp(`^${action.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`);
    const control = page.getByRole('button', { name });
    await control.focus();
    for (const state of ['Saving a move', 'Disconnected']) {
      await page.getByRole('checkbox', { name: state, exact: true }).check();
      await expect(control).toBeDisabled();
      await page.getByRole('checkbox', { name: state, exact: true }).uncheck();
    }
    await control.focus();
    await page.keyboard.press('Enter');
    await recorded(page, action.action);
  }
  const board = midgameScenarios.find(
    (item) => item.game === 'checkers' && item.room.game!.actions!.length > 1,
  )!;
  await show(page, board);
  const [source] = board.next.action.choice.split(':');
  const sourceControl = page.locator('.board-grid > button').nth(Number(source));
  await sourceControl.focus();
  await page.keyboard.press('Space');
  await expect(sourceControl).toHaveAttribute('aria-pressed', 'true');
  await sourceControl.press('Space');
  await expect(sourceControl).toHaveAttribute('aria-pressed', 'false');
  await sourceControl.press('Space');
  const option = board.room.game!.actions!.find(
    (item) => JSON.stringify(item.action) === JSON.stringify(board.next.action),
  )!;
  const destination = page.getByRole('button', { name: option.label, exact: true });
  await destination.focus();
  await page.keyboard.press('Enter');
  await recorded(page, board.next.action);

  const placement = midgameScenarios.find(
    (item) => item.game === 'boop' && item.room.game!.phase === 'placing',
  )!;
  await show(page, placement);
  const place = placement.room.game!.actions!.find(
    (option) =>
      option.action.type === 'place' &&
      option.action.color === 'kitten' &&
      option.action.choice === '5',
  )!;
  const farSquare = page.getByRole('button', { name: place.label, exact: true });
  await farSquare.focus();
  await expect(farSquare).toBeInViewport({ ratio: 1 });
  await page.keyboard.press('Enter');
  await recorded(page, place.action);

  const boop = midgameScenarios.find(
    (item) => item.game === 'boop' && item.room.game!.phase === 'graduating',
  )!;
  await show(page, boop);
  const geometry = () =>
    page.locator('.boop-table').evaluate((root) => {
      const bed = root.querySelector('.boop-bed')!.getBoundingClientRect();
      const dock = root.querySelector('.boop-graduation')!.getBoundingClientRect();
      return { bedTop: bed.top + scrollY, bedHeight: bed.height, dockHeight: dock.height };
    });
  const beforeGraduation = await geometry();
  const graduate = boop.room.game!.actions!.find((item) => item.action.type === 'graduate')!;
  const choice = page.getByRole('button', { name: graduate.label, exact: true });
  await choice.focus();
  await page.keyboard.press('Space');
  await expect(choice).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.boop-square[data-highlight="true"]')).toHaveCount(
    graduate.action.choice.split(',').length,
  );
  await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
  await expect(choice).toHaveAttribute('aria-pressed', 'false');
  await expect(
    page.getByRole('button', { name: 'Confirm graduation', exact: true }),
  ).toBeDisabled();
  await choice.click();
  for (const state of ['Saving a move', 'Disconnected']) {
    await page.getByRole('checkbox', { name: state, exact: true }).check();
    await expect(choice).toBeDisabled();
    await expect(
      page.getByRole('button', { name: 'Confirm graduation', exact: true }),
    ).toBeDisabled();
    await page.getByRole('checkbox', { name: state, exact: true }).uncheck();
  }
  await page.getByRole('button', { name: 'Confirm graduation', exact: true }).focus();
  await page.keyboard.press('Enter');
  await recorded(page, graduate.action);
  const afterGraduation = await geometry();
  for (const key of ['bedTop', 'bedHeight', 'dockHeight'] as const)
    expect(Math.abs(afterGraduation[key] - beforeGraduation[key])).toBeLessThanOrEqual(2);

  const clueScenario = midgameScenarios.find(
    (item) => item.game === 'word-agents' && item.seats === 10 && item.room.game!.phase === 'clue',
  )!;
  await show(page, clueScenario);
  await page
    .getByRole('textbox', { name: 'Your one-word clue', exact: true })
    .fill('Constellation');
  const clueCommit = page.getByRole('button', { name: 'Give clue', exact: true });
  for (const state of ['Saving a move', 'Disconnected']) {
    await page.getByRole('checkbox', { name: state, exact: true }).check();
    await expect(clueCommit).toBeDisabled();
    await page.getByRole('checkbox', { name: state, exact: true }).uncheck();
  }
  await clueCommit.focus();
  await page.keyboard.press('Enter');
  await recorded(page, {
    ...clueScenario.room.game!.actions!.find((option) => option.action.amount === 1)!.action,
    choice: 'Constellation',
  });

  const words = midgameScenarios.find(
    (item) => item.game === 'word-agents' && item.seats === 10 && item.room.game!.phase === 'guess',
  )!;
  await show(page, words);
  const word = words.room.game!.actions!.filter((item) => item.action.type === 'guess').at(-1)!;
  // Use the public board identity rather than any hidden role from another viewer.
  const card = words.room.game!.community!.find((item) => item.id === word.action.choice)!;
  const target = page.getByRole('button', { name: card.label, exact: true });
  await target.focus();
  await expect(target).toBeInViewport({ ratio: 1 });
  await page.keyboard.press('Space');
  await expect(target).toHaveAttribute('aria-pressed', 'true');
  await target.press('Space');
  await expect(target).toHaveAttribute('aria-pressed', 'false');
  await target.press('Space');
  const confirm = page.getByRole('button', { name: `Confirm ${card.label}`, exact: true });
  for (const state of ['Saving a move', 'Disconnected']) {
    await page.getByRole('checkbox', { name: state, exact: true }).check();
    await expect(confirm).toBeDisabled();
    await expect(target).toBeDisabled();
    await page.getByRole('checkbox', { name: state, exact: true }).uncheck();
  }
  await confirm.focus();
  await page.keyboard.press('Enter');
  await recorded(page, word.action);

  for (const game of ['spill-or-chill', 'most-likely', 'hot-seat']) {
    const item = midgameScenarios.find(
      (entry) => entry.game === game && entry.seats === 10 && entry.room.game!.phase !== 'reveal',
    )!;
    await show(page, item);
    const choices = page.locator('.party-choice');
    const last = choices.last();
    await last.focus();
    await page.keyboard.press('Space');
    await expect(last).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.party-choice[aria-pressed="true"]')).toHaveCount(1);
    const expected = item.room
      .game!.actions!.filter((entry) => entry.action.type !== 'next_prompt')
      .at(-1)!;
    for (const state of ['Saving a move', 'Disconnected']) {
      await page.getByRole('checkbox', { name: state, exact: true }).check();
      await expect(page.locator('.party-commit')).toBeDisabled();
      await expect(last).toBeDisabled();
      await page.getByRole('checkbox', { name: state, exact: true }).uncheck();
    }
    await page.locator('.party-commit').focus();
    await page.keyboard.press('Enter');
    await recorded(page, expected.action);
  }
  const tarot = midgameScenarios.find((item) => item.game === 'tarot')!;
  await show(page, tarot);
  const deck = page.locator('.tarot-deck-content button');
  const last = deck.last();
  await last.focus();
  for (const state of ['Saving a move', 'Disconnected']) {
    await page.getByRole('checkbox', { name: state, exact: true }).check();
    await expect(last).toBeDisabled();
    await page.getByRole('checkbox', { name: state, exact: true }).uncheck();
  }
  await last.focus();
  // Fractional card/rail borders can clip less than one CSS pixel at the end.
  await expect(last).toBeInViewport({ ratio: 0.99 });
  await page.keyboard.press('Enter');
  await recorded(page, tarot.room.game!.actions!.at(-1)!.action);
  await reset(page);
  const opener = page.getByRole('button', { name: 'Explore the deck', exact: true });
  await opener.click();
  await expect(page.getByRole('list', { name: 'Tarot illustrations' }).locator('li')).toHaveCount(
    78,
  );
  await page.getByRole('button', { name: 'Major arcana', exact: true }).click();
  await expect(page.getByRole('list', { name: 'Tarot illustrations' }).locator('li')).toHaveCount(
    22,
  );
  await page.keyboard.press('Escape');
  await expect(opener).toBeFocused();
  expect(writes).toEqual([]);
});
