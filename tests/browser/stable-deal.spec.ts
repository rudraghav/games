import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { dealScenarios } from '../../apps/web/src/stories/generated/deal-scenarios';

// Engine-generated projections only: this suite never creates rooms or uses the API.
test.skip(Boolean(process.env.GAMES_TEST_URL), 'The design review route is local-only.');

const regions = [
  '.deal-opponents',
  '.deal-center',
  '.deal-board-scroll',
  '.deal-command-dock',
  '.deal-hand-dock',
] as const;
const own = (page: Page) => page.locator('.deal-player[data-own="true"]');
const hand = (page: Page) => page.getByRole('group', { name: 'Your hand', exact: true });
const panel = (page: Page) => page.locator('.table-decision-panel');

async function bounds(page: Page) {
  return page.evaluate(
    (selectors) => {
      return selectors.map((selector) => {
        const element = document.querySelector(selector)!;
        const rect = element.getBoundingClientRect();
        return { x: rect.x + scrollX, y: rect.y + scrollY, width: rect.width, height: rect.height };
      });
    },
    [...regions],
  );
}

async function stable(page: Page, before: Awaited<ReturnType<typeof bounds>>) {
  const after = await bounds(page);
  for (const [index, value] of after.entries()) {
    for (const key of ['x', 'y', 'width', 'height'] as const) {
      expect(Math.abs(value[key] - before[index][key]), `${regions[index]} ${key}`).toBeLessThan(1);
    }
  }
  for (let index = 1; index < after.length; index += 1) {
    expect(after[index - 1].y + after[index - 1].height).toBeLessThanOrEqual(after[index].y + 1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

async function scenario(page: Page, id: string) {
  await page.getByRole('combobox', { name: 'Deal scenario', exact: true }).selectOption(id);
  await expect(page.locator('.deal-workspace')).toBeVisible();
  await page.evaluate(async () => document.fonts.ready);
}

async function capture(page: Page, name: string) {
  const dir = 'output/playwright/stable-deal';
  await mkdir(dir, { recursive: true });
  await page.screenshot({ path: `${dir}/${test.info().project.name}-${name}.png`, fullPage: true });
}

async function submitted(page: Page) {
  return JSON.parse(await page.getByLabel('Submitted action', { exact: true }).innerText());
}

test.beforeEach(async ({ page }) => {
  // Review the requested phone portrait canvas explicitly; the device preset is shorter.
  if (test.info().project.name === 'phone') await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design/deal');
  await expect(
    page.getByRole('heading', { name: 'Deal workspace review', exact: true }),
  ).toBeVisible();
});

test('every mid-game fixture has distinct fixed rows, visible opponent summaries and private hands', async ({
  page,
}) => {
  for (const item of dealScenarios) {
    await scenario(page, item.id);
    const geometry = await bounds(page);
    await stable(page, geometry);
    await expect(hand(page).getByRole('button')).toHaveCount(item.room.game!.hand.length);
    await expect(page.locator('.deal-opponents .private-hand')).toHaveCount(0);
    await expect(page.locator('.deal-opponents .opponent-panel')).toHaveCount(
      item.room.game!.players.length - 1,
    );
    for (const summary of await page.locator('.deal-opponents .opponent-panel').all()) {
      await expect(summary.locator('.opponent-panel-summary')).toBeVisible();
      await expect(summary.getByRole('button', { name: /^Inspect / })).toBeVisible();
    }
    if (item.id === 'collections') {
      const name = own(page)
        .getByLabel(/^Mediterranean Avenue, bank value 1M/)
        .locator('.property-name');
      const wordLines = await name.evaluate((element) => {
        const text = element.firstChild!;
        const range = document.createRange();
        range.setStart(text, 0);
        range.setEnd(text, 'Mediterranean'.length);
        return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
      });
      expect(wordLines, 'A property word must stay intact on compact cards').toBe(1);
    }
    expect(geometry[3].height).toBeLessThanOrEqual(112);
    const stage = await page.locator('.deal-workspace').boundingBox();
    expect(stage!.height).toBeLessThanOrEqual(page.viewportSize()!.height + 1);
  }
});

test('selecting existing and new property piles preserves the table and hand', async ({ page }) => {
  await scenario(page, 'placement');
  const initial = await bounds(page);
  const card = hand(page).getByRole('button', { name: /^Baltic Avenue, bank value 1M/ });
  await card.focus();
  await card.press('Space');
  await expect(card).toHaveAttribute('aria-pressed', 'true');
  await stable(page, initial);
  await own(page).getByRole('button', { name: 'Place here', exact: true }).click();
  await stable(page, initial);
  await own(page).getByRole('button', { name: 'New Brown · set 2', exact: true }).click();
  await stable(page, initial);
  await page
    .locator('.deal-command-dock')
    .getByRole('button', { name: 'Place property', exact: true })
    .click();
  expect(await submitted(page)).toMatchObject({
    type: 'property',
    color: 'brown',
    choice: 'brown:1',
  });
  await stable(page, initial);
  await expect(own(page).locator('.deal-collection')).toHaveCount(2);
});

test('swap previews use actual public cards and changing player or canceling bank clears the old move', async ({
  page,
}) => {
  await scenario(page, 'forced');
  const initial = await bounds(page);
  await hand(page)
    .getByRole('button', { name: /^Forced deal, bank value 3M/ })
    .click();
  await expect(panel(page)).toBeVisible();
  const player = panel(page).getByRole('combobox', { name: 'Player', exact: true });
  const move = panel(page).getByRole('combobox', { name: 'Card move', exact: true });
  await player.selectOption({ label: 'Dev' });
  await move.selectOption({ label: 'Dev · Take Kentucky Avenue · Give Mediterranean Avenue' });
  await expect(panel(page).getByLabel('Move preview')).toContainText('TakeKentucky Avenue3M');
  await expect(panel(page).getByLabel('Move preview')).toContainText('GiveMediterranean Avenue1M');
  await stable(page, initial);
  await player.selectOption({ label: 'Mira' });
  await expect(move).toHaveValue('');
  await expect(panel(page).getByLabel('Move preview')).toHaveCount(0);
  await expect(
    panel(page).getByRole('button', { name: 'Play Forced deal', exact: true }),
  ).toBeDisabled();
  await stable(page, initial);
  await panel(page).getByRole('button', { name: 'Bank for 3M', exact: true }).click();
  await expect(
    panel(page).getByRole('button', { name: 'Confirm · bank 3M', exact: true }),
  ).toBeVisible();
  await stable(page, initial);
  await panel(page).getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(move).toHaveValue('');
  await move.selectOption({ label: 'Mira · Take Pacific Avenue · Give Oriental Avenue' });
  await expect(panel(page).getByLabel('Move preview')).toContainText('TakePacific Avenue4M');
  await expect(panel(page).getByLabel('Move preview')).toContainText('GiveOriental Avenue1M');
  await stable(page, initial);
  await capture(page, 'swap-selected');
  await panel(page).getByRole('button', { name: 'View table', exact: true }).click();
  await expect(panel(page)).toHaveAttribute('data-peeking', 'true');
  await expect(panel(page).getByRole('combobox', { name: 'Player', exact: true })).toBeHidden();
  await stable(page, initial);
  await panel(page).getByRole('button', { name: 'Resume move', exact: true }).click();
  await expect(move).not.toHaveValue('');
  await page.locator('.deal-board-scroll').focus();
  await page.keyboard.down('Space');
  await expect(panel(page)).toHaveAttribute('data-peeking', 'true');
  await page.keyboard.up('Space');
  await expect(panel(page)).toHaveAttribute('data-peeking', 'false');
  await stable(page, initial);
  await panel(page).getByRole('button', { name: 'Close move options', exact: true }).click();
  const inspectTarget = page.getByRole('button', { name: 'Inspect Mira', exact: true });
  await inspectTarget.click();
  const inspection = page.getByRole('dialog', { name: 'Mira · public table', exact: true });
  await expect(inspection.getByLabel(/^Pacific Avenue, bank value 4M/)).toBeVisible();
  await expect(inspection.locator('.deal-collection').first()).toBeInViewport({ ratio: 1 });
  await expect(inspection.locator('.private-hand')).toHaveCount(0);
  await capture(page, 'swap-public-inspect');
  await page.keyboard.press('Escape');
  await expect(inspectTarget).toBeFocused();
  await stable(page, initial);
  await page.getByRole('button', { name: 'Choose move options', exact: true }).click();
  await expect(move).not.toHaveValue('');
  await panel(page).getByRole('button', { name: 'Play Forced deal', exact: true }).click();
  const fixture = dealScenarios.find((item) => item.id === 'forced')!;
  const expected = fixture.transitions.find(
    (transition) =>
      transition.action.target === fixture.room.members[2].id &&
      transition.action.cards?.[0] === fixture.room.game!.players[0].properties!['sky:0'][0].id,
  )!;
  expect(await submitted(page)).toEqual(expected.action);
});

test('payment toggles, counter actions and public inspect keep geometry and restore focus', async ({
  page,
}) => {
  await scenario(page, 'payment-bank');
  const initial = await bounds(page);
  await expect(panel(page)).toBeVisible();
  await panel(page).getByRole('button', { name: 'Close move options', exact: true }).click();
  const two = own(page).getByRole('button', { name: '2M, bank value 2M', exact: true });
  await two.click();
  await stable(page, initial);
  await expect(
    page.locator('.deal-command-dock').getByRole('button', { name: 'Pay 2M', exact: true }),
  ).toBeDisabled();
  await two.click();
  await expect(
    page.locator('.deal-command-dock').getByRole('button', { name: 'Pay 0M', exact: true }),
  ).toBeDisabled();
  await stable(page, initial);
  await two.click();
  await own(page).getByRole('button', { name: '4M, bank value 4M', exact: true }).click();
  await page.getByRole('button', { name: 'Choose move options', exact: true }).click();
  await expect(panel(page).locator('.deal-payment-total')).toContainText('1M overpayment');
  await capture(page, 'payment-selected');
  await panel(page).getByRole('button', { name: 'Close move options', exact: true }).click();
  const inspect = page
    .locator('.deal-opponents')
    .getByRole('button', { name: /^Inspect / })
    .first();
  const inspectedName = (await inspect.getAttribute('aria-label'))!.slice('Inspect '.length);
  await inspect.click();
  const inspection = page.getByRole('dialog', {
    name: `${inspectedName} · public table`,
    exact: true,
  });
  await expect(inspection).toBeVisible();
  await expect(inspection.locator('.private-hand')).toHaveCount(0);
  await capture(page, 'public-inspect');
  await page.keyboard.press('Escape');
  await expect(inspection).toHaveCount(0);
  await expect(inspect).toBeFocused();
  await stable(page, initial);
  await page
    .locator('.deal-command-dock')
    .getByRole('button', { name: 'Pay 6M', exact: true })
    .click();
  expect(await submitted(page)).toEqual(
    dealScenarios.find((item) => item.id === 'payment-bank')!.transitions[0].action,
  );
  await stable(page, initial);
  await scenario(page, 'counter');
  const counterInitial = await bounds(page);
  await panel(page).getByRole('button', { name: 'Just say no', exact: true }).click();
  expect(await submitted(page)).toMatchObject({ type: 'no' });
  await stable(page, counterInitial);
  await page.getByRole('button', { name: 'Choose move options', exact: true }).click();
  await expect(
    panel(page).getByRole('heading', { name: 'Action blocked', exact: true }),
  ).toBeVisible();
});

test('rent preview matches the committed house, hotel and Double the Rent bill', async ({
  page,
}) => {
  await scenario(page, 'doubled-rent');
  const fixture = dealScenarios.find((item) => item.id === 'doubled-rent')!;
  const rent = fixture.room.game!.hand.find((card) => card.id === fixture.focusCard)!;
  const initial = await bounds(page);
  await hand(page)
    .getByRole('button', { name: new RegExp(`^${rent.label}, bank value`) })
    .click();
  await expect(panel(page)).toBeVisible();
  const choice = panel(page).getByRole('combobox', { name: 'Card move', exact: true });
  // A single legal set is selected immediately; multiple sets require an exact choice.
  if (await choice.count())
    await choice.selectOption(JSON.stringify(fixture.transitions[0].action));
  await expect(panel(page).getByLabel('Move preview')).toContainText('18M rent');
  await expect(panel(page).getByLabel('Move preview')).toContainText('from each other player');
  await stable(page, initial);
  await capture(page, 'rent-18M');
  await panel(page)
    .getByRole('button', { name: `Play ${rent.label}`, exact: true })
    .click();
  expect(await submitted(page)).toEqual(fixture.transitions[0].action);
  await page.getByRole('button', { name: 'Choose move options', exact: true }).click();
  await expect(
    panel(page).getByRole('region', { name: 'Pending action', exact: true }),
  ).toContainText('18M');
  await stable(page, initial);
});
