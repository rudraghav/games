import { expect, test, type Page } from '@playwright/test';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Local legal-projection accessibility checks.');
test.use({ trace: 'off', screenshot: 'only-on-failure', reducedMotion: 'reduce' });

async function scenario(page: Page, seats: number, phase = 'revealing') {
  const fixture = midgameScenarios.find(
    (entry) => entry.game === 'trio' && entry.seats === seats && entry.room.game!.phase === phase,
  )!;
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption('trio');
  await page
    .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
    .selectOption(fixture.id);
  return fixture;
}

test.beforeEach(async ({ page }) => {
  await page.goto('/design/midgame');
});

for (const seats of [3, 6]) {
  test(`Trio ${seats}-seat hand requests name each public target without revealing ranks`, async ({
    page,
  }) => {
    const fixture = await scenario(page, seats);
    const game = fixture.room.game!;
    const hands = page.locator('.trio-hands');
    const controls = hands.getByRole('button');
    await expect(controls).toHaveCount(seats * 2);
    const tree = await hands.ariaSnapshot();
    const labels: string[] = [];
    for (const player of game.players) {
      const name = fixture.room.members.find((member) => member.id === player.id)!.name;
      for (const [edge, visible] of [
        ['low', 'Lowest'],
        ['high', 'Highest'],
      ]) {
        const label = `${visible} card · ${name}`;
        labels.push(label);
        const button = hands.getByRole('button', { name: label, exact: true });
        await expect(button).toHaveText(visible);
        expect(tree).toContain(`button "${label}"`);
        const legal = game.actions!.some(
          (option) =>
            option.action.type === 'reveal_hand' &&
            option.action.target === player.id &&
            option.action.choice === edge,
        );
        if (legal) await expect(button).toBeEnabled();
        else await expect(button).toBeDisabled();
      }
    }
    // The complete control name consists only of the action and public name;
    // no private rank or card identity can be appended unnoticed.
    expect(
      await controls.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-label'))),
    ).toEqual(labels);
    const submitted = page.getByLabel('Submitted action', { exact: true });
    for (const state of ['Saving a move', 'Disconnected']) {
      await page.getByRole('checkbox', { name: state, exact: true }).check();
      for (const button of await controls.all()) await expect(button).toBeDisabled();
      await expect(submitted).toHaveText('No action submitted');
      await page.getByRole('checkbox', { name: state, exact: true }).uncheck();
    }
    for (const [edge, key] of [
      ['low', 'Enter'],
      ['high', 'Space'],
    ]) {
      await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
      const option = game.actions!.find(
        (entry) =>
          entry.action.type === 'reveal_hand' &&
          entry.action.choice === edge &&
          entry.action.target !== fixture.selfId,
      )!;
      expect(option).toBeDefined();
      const name = fixture.room.members.find((member) => member.id === option.action.target)!.name;
      const label = `${edge === 'low' ? 'Lowest' : 'Highest'} card · ${name}`;
      const button = hands.getByRole('button', { name: label, exact: true });
      await expect(button).toBeEnabled();
      await button.focus();
      await page.keyboard.press(key);
      await expect
        .poll(async () => {
          const recorded = await submitted.textContent();
          return recorded === 'No action submitted' ? null : JSON.parse(recorded!);
        })
        .toEqual(option.action);
    }
    await scenario(page, seats, 'review');
    for (const label of labels)
      await expect(hands.getByRole('button', { name: label, exact: true })).toBeDisabled();
    await expect(submitted).toHaveText('No action submitted');
  });
}
