import { expect, test, type Locator, type Page } from '@playwright/test';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Local engine-projected reviews.');
async function open(page: Page, id: string) {
  const fixture = midgameScenarios.find((item) => item.id === id)!;
  await page.goto('/design/midgame');
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(fixture.game);
  await page.getByRole('combobox', { name: 'Mid-game scenario' }).selectOption(fixture.id);
  return fixture;
}

async function checkPhoneTargets(group: Locator) {
  if (group.page().viewportSize()!.width > 600) return;
  expect(
    await group.getByRole('button').evaluateAll((buttons) =>
      buttons.every((button) => {
        const r = button.getBoundingClientRect();
        return r.width >= 44 && r.height >= 44 && r.left >= 0 && r.right <= innerWidth;
      }),
    ),
  ).toBe(true);
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

test('comparing Skyjo swaps shows known and hidden targets while leaving the drawn card in hand', async ({
  page,
}) => {
  const fixture = await open(page, 'skyjo-2-17-6');
  const compare = page.getByRole('button', { name: 'Compare swaps' });
  const own = page.getByRole('group', { name: 'Your Skyjo grid' });
  await compare.click();
  const replacement = own.getByRole('button', {
    name: 'Replace, row 2, column 1, 8, -4 grid points',
    exact: true,
  });
  await expect(replacement).toBeVisible();
  await expect(own.getByRole('button', { name: /point change unknown/ })).toHaveCount(10);
  await checkPhoneTargets(own);
  await compare.click();
  await expect(own.getByRole('button', { name: /grid points|point change unknown/ })).toHaveCount(
    0,
  );
  await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
  await compare.click();
  await replacement.click();
  expect(JSON.parse((await page.getByLabel('Submitted action').textContent())!)).toEqual(
    fixture.next.action,
  );
  await expect(compare).toHaveCount(0);
});

test('a 6 nimmt! card can be compared, changed and cleared before locking', async ({ page }) => {
  const fixture = await open(page, 'six-nimmt-2-17-2');
  const hand = page.getByRole('group', { name: 'Your number cards' });
  const card = (value: string) =>
    hand.getByRole('button', {
      name: fixture.room.game!.hand.find((item) => item.value === value)!.label,
      exact: true,
    });
  await card('20').click();
  await expect(page.getByText('If 20 goes first, it follows 5 in row 1.')).toBeVisible();
  await expect(page.locator('.six-row[data-preview="true"] h3')).toHaveText('Row 1');
  await card('1').click();
  await expect(page.getByText(/^If 1 goes first, choose a row to take/)).toBeVisible();
  if (page.viewportSize()!.width <= 600) {
    expect(
      await page
        .locator('.six-hand-note')
        .evaluate(
          (note) =>
            note.scrollWidth <= note.clientWidth && note.scrollHeight <= note.clientHeight + 1,
        ),
    ).toBe(true);
  }
  await checkPhoneTargets(hand);
  await expect(page.locator('.six-row[data-preview="true"]')).toHaveCount(0);
  await card('1').click();
  await expect(page.getByRole('button', { name: 'Lock my number' })).toBeDisabled();
  await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
});

test('an unambiguous Shithead hand card plays on its first tap', async ({ page }) => {
  const fixture = await open(page, 'shithead-2-17-3');
  const card = page
    .locator('.shithead-private-cards')
    .getByRole('button', { name: '3 ♠', exact: true });
  await page.getByLabel('Saving a move').check();
  await expect(card).toBeDisabled();
  await page.getByLabel('Saving a move').uncheck();
  await card.click({ position: { x: 8, y: 18 } });
  expect(JSON.parse((await page.getByLabel('Submitted action').textContent())!)).toEqual(
    fixture.next.action,
  );
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
