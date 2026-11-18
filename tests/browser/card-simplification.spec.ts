import { expect, test, type Page } from '@playwright/test';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Local engine-projected reviews.');
async function open(page: Page, id: string) {
  const fixture = midgameScenarios.find((item) => item.id === id)!;
  await page.goto('/design/midgame');
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(fixture.game);
  await page.getByRole('combobox', { name: 'Mid-game scenario' }).selectOption(fixture.id);
  return fixture;
}

test('winning Rummy discard offers the exact declaration in one tap', async ({ page }) => {
  const fixture = midgameScenarios.find(
    (item) => item.game === 'rummy' && item.next.action.type === 'declare',
  )!;
  await open(page, fixture.id);
  const win = page.getByRole('group', { name: 'Winning discards' }).getByRole('button', {
    name: fixture.room.game!.actions!.find(
      (item) => item.action.type === 'declare' && item.action.card === fixture.next.action.card,
    )!.label,
  });
  await page.getByLabel('Saving a move').check();
  await expect(win).toBeDisabled();
  await page.getByLabel('Saving a move').uncheck();
  await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
  await win.focus();
  await win.press('Enter');
  expect(JSON.parse((await page.getByLabel('Submitted action').textContent())!)).toEqual(
    fixture.next.action,
  );
  await expect(page.getByRole('region', { name: 'Rummy score explanation' })).toBeVisible();
});

test('one selected Shithead card offers its exact full rank and still allows a smaller play', async ({
  page,
}) => {
  const fixture = await open(page, 'shithead-5-1-62-crowded');
  const game = fixture.room.game!;
  const groups = game.hand.reduce<Record<string, string[]>>((byRank, c) => {
    (byRank[c.value] ??= []).push(c.id);
    return byRank;
  }, {});
  const option = game.actions!.find(
    ({ action }) =>
      action.type === 'play' &&
      (action.cards?.length ?? 0) > 1 &&
      Object.values(groups).some(
        (ids) =>
          ids.length === action.cards!.length && ids.every((id) => action.cards!.includes(id)),
      ),
  )!;
  const card = game.hand.find((c) => c.id === option.action.cards![0])!;
  await page
    .locator('.shithead-private-cards')
    .getByRole('button', { name: card.label, exact: true })
    // The fanned hand exposes the rank/suit at each card's leading corner.
    .click({ position: { x: 5, y: 12 } });
  const play = page.getByRole('button', {
    name: `Play all ${option.action.cards!.length} ${card.value}s`,
    exact: true,
  });
  await expect(page.getByRole('button', { name: 'Play selected · 1' })).toBeEnabled();
  await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
  await page.getByLabel('Disconnected').check();
  await expect(play).toBeDisabled();
  await page.getByLabel('Disconnected').uncheck();
  await play.click();
  expect(JSON.parse((await page.getByLabel('Submitted action').textContent())!)).toEqual(
    option.action,
  );
});

test('Shithead setup uses one stable action row while choosing the three cards', async ({
  page,
}) => {
  const width = test.info().project.name === 'phone' ? 390 : 320;
  await page.setViewportSize({ width, height: 740 });
  await page.goto('/design');
  await page.getByLabel('Table scenario').selectOption({ label: 'Shithead · maximum seats' });
  const dock = page.getByRole('region', { name: 'Your Shithead actions' });
  const hand = page.locator('.shithead-private-cards');
  await expect(hand.getByRole('button')).toHaveCount(6);
  await page.evaluate(() => document.fonts.ready);
  const anchors = () =>
    page
      .locator(
        '.shithead-private-cards, .shithead-actions, .shithead-player-table[data-self="true"], .shithead-opponents',
      )
      .evaluateAll((elements) =>
        elements.map((element) => {
          const r = element.getBoundingClientRect();
          return [r.top + window.scrollY, r.height];
        }),
      );
  const initial = await anchors();
  expect((await dock.boundingBox())!.height).toBeLessThan(115);
  for (let index = 0; index < 3; index++) {
    await hand.getByRole('button').nth(index).click();
    expect(await anchors()).toEqual(initial);
  }
  await expect(dock.getByRole('button', { name: /Keep selected three face-up/ })).toBeEnabled();
  await hand.getByRole('button').nth(3).click();
  await expect(
    page.getByText('You’ve chosen three. Tap a chosen card to swap it out first.'),
  ).toBeVisible();
  await expect(hand.getByRole('button', { pressed: true })).toHaveCount(3);
  expect(await anchors()).toEqual(initial);
  await dock.getByRole('button', { name: 'Clear selection' }).click();
  await expect(hand.getByRole('button', { pressed: true })).toHaveCount(0);
  expect(await anchors()).toEqual(initial);
  await dock.scrollIntoViewIfNeeded();
  await page.screenshot({ path: test.info().outputPath(`setup-${width}.png`) });
});
