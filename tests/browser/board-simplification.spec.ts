import { expect, test } from '@playwright/test';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Local engine-projection review.');

test('touch selects an edge checkers piece before its rail reveals the neighbour', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'phone', 'Exercises native touch activation.');
  await page.setViewportSize({ width: 320, height: 740 });
  const item = midgameScenarios.find((entry) => entry.id === 'checkers-2-17-2')!;
  const option = item.room.game!.actions!.find((row) => row.label === 'Move B6 to A5')!;
  await page.goto('/design/midgame');
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption('checkers');
  await page.getByLabel('Mid-game scenario').selectOption(item.id);
  const source = page.getByRole('button', { name: 'Select piece B6', exact: true });
  await source.tap();
  await expect(source).toHaveAttribute('aria-pressed', 'true');
  const receipt = page.getByLabel('Submitted action', { exact: true });
  await expect(receipt).toHaveText('No action submitted');
  await page.getByRole('button', { name: option.label, exact: true }).tap();
  expect(JSON.parse((await receipt.textContent())!)).toEqual(option.action);
});

for (const game of ['boop', 'sea-salt-paper']) {
  test(`${game} exposes a single legal combination with its consequence before submission`, async ({
    page,
  }, info) => {
    const type = game === 'boop' ? 'graduate' : 'pair';
    const sample = midgameScenarios.find((item) => {
      const options = item.room.game?.actions || [];
      return (
        item.game === game &&
        options.filter((option) => option.action.type === type).length === 1 &&
        (type !== 'graduate' || options.length === 1)
      );
    })!;
    const option = sample.room.game!.actions!.find((row) => row.action.type === type)!;
    const hand = sample.room.game!.hand.filter((card) => option.action.cards?.includes(card.id));
    const names = hand.map(
      (card) => card.color[0].toUpperCase() + card.color.slice(1) + ' ' + card.value,
    );
    const label = game === 'boop' ? option.label : 'Play ' + names.join(' + ');
    await page.goto('/design/midgame');
    await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(game);
    await page.getByLabel('Mid-game scenario').selectOption(sample.id);
    const button = page.getByRole('button', { name: label, exact: true });
    const receipt = page.getByLabel('Submitted action', { exact: true });
    await expect(button).toBeEnabled();
    await expect(receipt).toHaveText('No action submitted');
    if (game === 'boop') {
      await expect(page.locator('.boop-square[data-highlight="true"]')).toHaveCount(3);
      await expect(page.locator('.boop-status')).toContainText('as adult cats');
    } else {
      await expect(page.locator('.paper-duo-summary')).toContainText('Search one discard pile');
      await expect(page.locator('.paper-hand-cards [aria-pressed="true"]')).toHaveCount(0);
    }
    for (const flag of ['Saving a move', 'Disconnected']) {
      await page.getByRole('checkbox', { name: flag, exact: true }).check();
      await expect(button).toBeDisabled();
      await page.getByRole('checkbox', { name: flag, exact: true }).uncheck();
    }
    await button.focus();
    await expect(button).toBeInViewport();
    await page.screenshot({ path: info.outputPath('one-choice.png') });
    await button.press('Enter');
    expect(JSON.parse((await receipt.textContent())!)).toEqual(option.action);
  });
}
