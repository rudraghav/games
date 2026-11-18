import { expect, test, type Page } from '@playwright/test';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(
  Boolean(process.env.GAMES_TEST_URL),
  'Uses the local review of authorized game projections.',
);
test.use({ reducedMotion: 'reduce' });

async function open(page: Page, id: string, game: string) {
  await page.goto('/design/midgame');
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(game);
  await page.getByRole('combobox', { name: 'Mid-game scenario' }).selectOption(id);
}

test('a blind or seen Teen Patti player can commit each exact price with one tap', async ({
  page,
}, info) => {
  if (info.project.name === 'phone') await page.setViewportSize({ width: 320, height: 640 });
  for (const label of ['Blind bet', 'Chaal']) {
    const fixture = midgameScenarios.find(
      (item) =>
        item.game === 'teen-patti' &&
        item.room.game!.actions?.some((option) => option.label === label),
    )!;
    const bet = fixture.room.game!.actions!.find((option) => option.label === label)!;
    await open(page, fixture.id, fixture.game);
    const dock = page.getByRole('region', { name: 'Your actions' });
    const prices = dock.getByRole('button', { name: new RegExp(`^${label} \\d+ chips?$`) });
    await expect(prices).toHaveCount(2);
    await expect(dock.getByRole('spinbutton')).toHaveCount(0);
    for (const toggle of ['Saving a move', 'Disconnected']) {
      await page.getByLabel(toggle, { exact: true }).check();
      for (const button of await prices.all()) await expect(button).toBeDisabled();
      await page.getByLabel(toggle, { exact: true }).uncheck();
    }
    await dock.scrollIntoViewIfNeeded();
    await page.screenshot({
      path: test.info().outputPath(`teen-patti-${label.replace(' ', '-')}.png`),
    });
    for (let amount = bet.minimum!; amount <= bet.maximum!; amount += bet.step!) {
      await page.getByRole('button', { name: 'Reset scenario' }).click();
      const cta = dock.getByRole('button', {
        name: `${label} ${amount} ${amount === 1 ? 'chip' : 'chips'}`,
        exact: true,
      });
      await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
      await cta.click();
      expect(JSON.parse((await page.getByLabel('Submitted action').textContent())!)).toEqual({
        ...bet.action,
        amount,
      });
    }
  }
});

test('the party host can advance next to the result before reading a ten-seat breakdown', async ({
  page,
}, info) => {
  if (info.project.name === 'phone') await page.setViewportSize({ width: 320, height: 640 });
  for (const game of ['spill-or-chill', 'hot-seat', 'most-likely']) {
    const fixture = midgameScenarios.find(
      (item) => item.game === game && item.seats === 10 && item.room.game!.phase === 'reveal',
    )!;
    await open(page, fixture.id, game);
    const reveal = page.locator('.party-reveal');
    const hostMove = fixture.room.game!.actions!.find(
      (option) => option.action.type === 'next_prompt',
    )!;
    const advance = reveal.getByRole('button', { name: hostMove.label, exact: true });
    const headline = reveal.getByRole('heading');
    await headline.scrollIntoViewIfNeeded();
    const top = await headline.boundingBox(),
      action = await advance.boundingBox();
    expect(action!.y).toBeGreaterThanOrEqual(top!.y + top!.height - 1);
    const ledger = reveal.locator('.party-reveal__row');
    await expect(ledger).toHaveCount(game === 'spill-or-chill' ? 0 : 10);
    if (game !== 'spill-or-chill')
      expect((await ledger.first().boundingBox())!.y).toBeGreaterThanOrEqual(
        action!.y + action!.height - 1,
      );
    await page.screenshot({ path: test.info().outputPath(`${game}-reveal.png`) });
    await advance.click();
    expect(JSON.parse((await page.getByLabel('Submitted action').textContent())!)).toEqual(
      hostMove.action,
    );
  }
});
