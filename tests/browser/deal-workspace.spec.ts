import { expect, test, type Locator, type Page } from '@playwright/test';
import { dealScenarios } from '../../apps/web/src/stories/generated/deal-scenarios';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';

// These are public projections from real engines. No room/account/data writes.
test.skip(Boolean(process.env.GAMES_TEST_URL), 'The review route is local-only.');
const fixture = (id: string) => dealScenarios.find((item) => item.id === id)!;
const own = (page: Page) => page.locator('.deal-player[data-own="true"]');
const hand = (page: Page) => page.getByRole('group', { name: 'Your hand', exact: true });
const panel = (page: Page) => page.locator('.table-decision-panel');
const command = (page: Page) => page.locator('.deal-command-dock');

async function selectScenario(page: Page, id: string) {
  await page.getByRole('combobox', { name: 'Deal scenario', exact: true }).selectOption(id);
  await expect(page.locator('.deal-workspace')).toBeVisible();
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}
async function submitted(page: Page) {
  return JSON.parse((await page.getByLabel('Submitted action', { exact: true }).textContent())!);
}
async function capture(page: Page, id: string) {
  await page.screenshot({
    path: test.info().outputPath(`${id.replaceAll(':', '-')}.png`),
  });
}

async function exposedAction(action: Locator) {
  // Scroll boundaries can round by a fraction of a pixel; hit tests below still
  // require the top and bottom of the actual control to be unobscured.
  await expect(action).toBeInViewport({ ratio: 0.99 });
  expect(
    await action.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const panel = element.closest('.table-decision-panel')!.getBoundingClientRect();
      return (
        box.top >= panel.top &&
        box.bottom <= panel.bottom &&
        box.left >= panel.left &&
        box.right <= panel.right &&
        [box.top + 2, box.bottom - 2].every((y) =>
          element.contains(document.elementFromPoint(box.left + box.width / 2, y)),
        )
      );
    }),
    'The complete action is inside the panel and unobscured',
  ).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/design/deal');
  await expect(
    page.getByRole('heading', { name: 'Deal workspace review', exact: true }),
  ).toBeVisible();
});

test('all complex Deal decisions fit the viewport and preserve hand privacy and printed identities', async ({
  page,
}) => {
  for (const item of dealScenarios) {
    await selectScenario(page, item.id);
    await expect(hand(page).getByRole('button')).toHaveCount(item.room.game!.hand.length);
    await expect(page.locator('.deal-opponents .private-hand')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (item.id === 'collections') {
      await expect(own(page).getByLabel(/^Boardwalk, bank value 4M/)).toBeVisible();
      await expect(own(page).getByLabel('Complete set', { exact: true })).toHaveCount(1);
      await expect(own(page).locator('.deal-collection').first().locator('footer')).toContainText(
        'Rent 9M',
      );
      await own(page).getByLabel('Inspect Brown · set 1', { exact: true }).click();
      const info = page.getByRole('dialog', { name: 'Card info', exact: true });
      await expect(info.getByText('✓ Mediterranean Avenue', { exact: true })).toBeVisible();
      await expect(info.getByText('✓ Baltic Avenue', { exact: true })).toBeVisible();
      await capture(page, 'collections');
      await page.keyboard.press('Escape');
    }
    if (item.id === 'no-mercy') {
      await page.locator('.deal-quick-rules summary').click();
      await expect(page.getByText(/No Mercy uses the Games house deck/)).toBeVisible();
    }
  }
});

test('a phone hand exposes complete Deal faces', async ({ page }) => {
  await selectScenario(page, 'information-hand');
  for (const [width, visible] of [
    [320, 3],
    [390, 4],
  ]) {
    await page.setViewportSize({ width, height: 640 });
    await expect
      .poll(() =>
        hand(page).evaluate((element) => {
          const viewport = element.getBoundingClientRect();
          return [...element.querySelectorAll('button.playing-card')].filter((card) => {
            const face = card.getBoundingClientRect();
            return face.left >= viewport.left - 1 && face.right <= viewport.right + 1;
          }).length;
        }),
      )
      .toBeGreaterThanOrEqual(visible);
  }
});

test('first selection exposes exact property destinations and commits each in one click', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  for (const destination of ['brown:0', 'brown:1']) {
    await page.evaluate(() => sessionStorage.clear());
    await selectScenario(page, 'placement');
    await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
    const card = hand(page).getByRole('button', { name: /^Baltic Avenue, bank value 1M/ });
    await card.focus();
    await card.press('Space');
    await expect(card).toHaveAttribute('aria-pressed', 'true');
    await expect(panel(page)).toBeVisible();
    const choices = panel(page).getByRole('group', { name: 'Card moves', exact: true });
    await expect(choices.getByRole('button')).toHaveCount(2);
    const place = choices.getByRole('button', {
      name: destination === 'brown:0' ? /^Place in Brown set 1/ : /^Place in new Brown set 2/,
    });
    await exposedAction(place);
    await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
      'No action submitted',
    );
    await capture(page, `placement-${destination}`);
    await place.click();
    const expected = fixture('placement').transitions.find(
      (item) => item.action.choice === destination,
    )!;
    expect(await submitted(page)).toEqual(expected.action);
    await expect(own(page).getByLabel('Complete set', { exact: true })).toHaveCount(
      destination === 'brown:0' ? 1 : 0,
    );
    await expect(own(page).locator('.deal-collection')).toHaveCount(
      destination === 'brown:0' ? 1 : 2,
    );
  }
  await selectScenario(page, 'rearrange');
  await own(page)
    .getByRole('button', { name: /^Baltic Avenue, bank value 1M/ })
    .click();
  const move = panel(page).getByRole('button', { name: /^Move to Brown set 1/ });
  await expect(move).toContainText('Free move, uses no play');
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  await move.click();
  expect(await submitted(page)).toEqual(fixture('rearrange').transitions[0].action);
  await expect(page.locator('.deal-turn-controls')).toContainText('3 plays left');
});

test('swapping needs only a take choice and exact give CTA and never retains a hidden target', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await selectScenario(page, 'forced');
  await hand(page)
    .getByRole('button', { name: /^Forced deal, bank value 3M/ })
    .click();
  const takes = panel(page).getByRole('radiogroup', { name: 'Property you take', exact: true });
  await expect(
    panel(page).getByRole('radiogroup', { name: 'Choose a player', exact: true }),
  ).toHaveCount(0);
  await expect(takes.getByRole('radio')).toHaveCount(2);
  await exposedAction(takes.getByRole('radio').first());
  await capture(page, 'forced-first-selection-320');
  await takes.getByRole('radio', { name: /^Take Kentucky Avenue from Dev/ }).click();
  const swaps = panel(page).getByRole('group', { name: 'Complete swap', exact: true });
  await expect(
    swaps.getByRole('button', { name: /^Swap Mediterranean Avenue for Dev’s Kentucky Avenue/ }),
  ).toBeEnabled();
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  await panel(page).getByRole('button', { name: 'Change property', exact: true }).click();
  await expect(swaps).toHaveCount(0);
  await takes.getByRole('radio', { name: /^Take Pacific Avenue from Mira/ }).click();
  await expect(swaps.getByRole('button', { name: /Kentucky Avenue/ })).toHaveCount(0);
  const swap = swaps.getByRole('button', {
    name: /^Swap Oriental Avenue for Mira’s Pacific Avenue/,
  });
  await expect(swap).toBeEnabled();
  await exposedAction(swaps.getByRole('button').first());
  await capture(page, 'forced-swap');
  await swap.focus();
  await exposedAction(swap);
  await swap.click();
  const selected = fixture('forced').transitions.find(
    (item) =>
      item.action.target === fixture('forced').room.members[2].id &&
      item.action.cards?.[0] === fixture('forced').room.game!.players[0].properties!['sky:0'][0].id,
  )!;
  expect(await submitted(page)).toEqual(selected.action);
});

test('simple plays, cash and bank-only actions are available immediately on a 320px selected view', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  const base = fixture('information-hand');
  for (const kind of ['play', 'cash', 'bank-only'] as const) {
    await page.evaluate(() => sessionStorage.clear());
    await selectScenario(page, 'information-hand');
    await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
    const card = base.room.game!.hand.find((item) =>
      kind === 'play'
        ? item.effect === 'pass_go'
        : kind === 'cash'
          ? item.subtitle === 'MONEY'
          : item.effect === 'sly',
    )!;
    const type = kind === 'play' ? 'play' : 'bank';
    const expected = (base.room.game!.actions || []).find(
      (option) => option.action.card === card.id && option.action.type === type,
    )!.action;
    await hand(page)
      .getByRole('button', { name: new RegExp(`^${card.label}, bank value`) })
      .click();
    if (kind === 'cash') {
      expect(await submitted(page)).toEqual(expected);
      await expect(panel(page)).toHaveCount(0);
      continue;
    }
    await expect(panel(page)).toBeVisible();
    await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
      'No action submitted',
    );
    const action = panel(page).getByRole('button', {
      name: kind === 'play' ? /^Play Pass Go/ : new RegExp(`^Bank for ${card.value}$`),
    });
    await exposedAction(action);
    if (kind === 'bank-only')
      await expect(panel(page)).toContainText('Banking makes this money; you lose its action.');
    await expect(panel(page).getByRole('button', { name: /^Confirm/ })).toHaveCount(0);
    await capture(page, `first-selection-320-${kind}`);
    await action.click();
    expect(await submitted(page)).toEqual(expected);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('No Mercy take, keep and give stages expose direct exact actions and block saving or disconnected commits', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const id of ['deal-no-mercy-2-17-24', 'deal-no-mercy-2-17-17', 'deal-no-mercy-2-17-18']) {
    const base = midgameScenarios.find((item) => item.id === id)!;
    await page.goto('/design/midgame');
    await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(base.game);
    await page.getByRole('combobox', { name: 'Mid-game scenario', exact: true }).selectOption(id);
    const expected = base.next.action;
    const options = (base.room.game!.actions || []).filter(
      (option) => option.action.type === expected.type,
    );
    const choices = panel(page).getByRole('group', {
      name: expected.type === 'choose' ? 'Choose the card to take' : 'Keep one, hand out the rest',
      exact: true,
    });
    await expect(choices.getByRole('button')).toHaveCount(options.length);
    await exposedAction(choices.getByRole('button').first());
    await expect(panel(page).getByRole('radio')).toHaveCount(0);
    await expect(page.locator('.deal-opponents .private-hand')).toHaveCount(0);
    await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
      'No action submitted',
    );
    const exactIndex = options.findIndex(
      (option) => option.action.card === expected.card && option.action.target === expected.target,
    );
    expect(exactIndex).toBeGreaterThanOrEqual(0);
    const action = choices.getByRole('button').nth(exactIndex);
    await expect(action).toContainText(
      expected.type === 'choose'
        ? 'Take Park Place'
        : expected.type === 'keep'
          ? 'Keep Park Place'
          : 'Give Wild',
    );
    if (expected.type === 'give') await expect(action).toContainText('to Dev');
    await capture(page, `no-mercy-${expected.type}-320`);
    for (const flag of ['Saving a move', 'Disconnected']) {
      await page.getByLabel(flag, { exact: true }).dispatchEvent('click');
      for (const control of await choices.getByRole('button').all())
        await expect(control).toBeDisabled();
      await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
        'No action submitted',
      );
      await page.getByLabel(flag, { exact: true }).dispatchEvent('click');
      await expect(action).toBeEnabled();
    }
    await action.focus();
    await exposedAction(action);
    await action.press('Enter');
    expect(await submitted(page)).toEqual(expected);
    if (expected.type === 'choose') {
      await page.getByRole('button', { name: 'View pending action', exact: true }).click();
      await expect(panel(page)).toContainText('Park Place');
      await expect(panel(page)).toContainText('Waiting for Alexandra');
      await expect(panel(page).getByRole('button', { name: /^Accept|^Just Say No$/ })).toHaveCount(
        0,
      );
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('all-colour wild destinations are direct, reachable and retain exact legal payloads', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await selectScenario(page, 'information-hand');
  const base = fixture('information-hand');
  const card = base.room.game!.hand.find(
    (item) => item.suit === 'property' && item.colors?.length === 10,
  )!;
  const options = (base.room.game!.actions || []).filter(
    (option) => option.action.card === card.id,
  );
  await hand(page)
    .getByRole('button', { name: /^Wild property, not bankable/ })
    .click();
  const choices = panel(page)
    .getByRole('group', { name: 'Card moves', exact: true })
    .getByRole('button');
  await expect(choices).toHaveCount(3);
  await exposedAction(choices.first());
  const more = panel(page).getByRole('button', {
    name: `All ${options.length} moves`,
    exact: true,
  });
  await expect(more).toBeVisible();
  await more.click();
  await expect(choices).toHaveCount(options.length);
  await panel(page).getByRole('button', { name: 'Fewer moves', exact: true }).click();
  await expect(choices).toHaveCount(3);
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  await more.focus();
  await more.press('Enter');
  await expect(choices).toHaveCount(options.length);
  const last = choices.last();
  await last.focus();
  await exposedAction(last);
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  await expect(panel(page).getByRole('button', { name: /^Bank for/ })).toHaveCount(0);
  await last.press('Enter');
  const actual = await submitted(page);
  expect(options.map((option) => option.action)).toContainEqual(actual);
  expect(actual.type).toBe('property');
  expect(actual.card).toBe(card.id);
  expect(actual.color).toBe(options.at(-1)!.action.color);
  expect(actual.choice).toBe(options.at(-1)!.action.choice);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('changing cards resets expanded move lists without submitting or retaining the previous card', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await selectScenario(page, 'information-hand');
  const wild = hand(page).getByRole('button', { name: /^Wild property, not bankable/ });
  const property = hand(page).getByRole('button', { name: /^Kentucky Avenue, bank value/ });
  const moves = panel(page).getByRole('group', { name: 'Card moves', exact: true });
  await wild.click();
  await panel(page).getByRole('button', { name: 'All 10 moves', exact: true }).click();
  await expect(moves.getByRole('button')).toHaveCount(10);
  await panel(page).getByRole('button', { name: 'Close move options', exact: true }).click();
  await property.click();
  await expect(property).toHaveAttribute('aria-pressed', 'true');
  await expect(wild).toHaveAttribute('aria-pressed', 'false');
  await expect(moves.getByRole('button')).toHaveCount(1);
  await expect(moves.getByRole('button')).toContainText('Place in new Red set 1');
  await expect(panel(page).getByRole('button', { name: 'Fewer moves', exact: true })).toHaveCount(
    0,
  );
  await panel(page).getByRole('button', { name: 'Close move options', exact: true }).click();
  await wild.click();
  await expect(moves.getByRole('button')).toHaveCount(3);
  await expect(
    panel(page).getByRole('button', { name: 'All 10 moves', exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
});

test('expanded Forced Deal properties collapse on changing the take and preserve exact swap choices', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const base = midgameScenarios.find((item) => item.id === 'deal-5-31-17')!;
  await page.goto('/design/midgame');
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(base.game);
  await page
    .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
    .selectOption(base.id);
  const card = base.room.game!.hand.find((item) => item.effect === 'forced')!;
  const options = (base.room.game!.actions || []).filter(
    (option) => option.action.card === card.id && option.action.type === 'play',
  );
  const takeIds = [...new Set(options.map((option) => option.action.choice))];
  expect(takeIds).toHaveLength(4);
  await hand(page)
    .getByRole('button', { name: /^Forced deal, bank value/ })
    .click();
  const takes = panel(page).getByRole('radiogroup', { name: 'Property you take', exact: true });
  const more = panel(page).getByRole('button', { name: 'All 4 properties', exact: true });
  await expect(takes.getByRole('radio')).toHaveCount(3);
  await exposedAction(takes.getByRole('radio').first());
  await more.click();
  await expect(takes.getByRole('radio')).toHaveCount(4);
  await panel(page).getByRole('button', { name: 'Fewer properties', exact: true }).click();
  await expect(takes.getByRole('radio')).toHaveCount(3);
  await more.click();
  await takes.getByRole('radio').last().click();
  const swaps = panel(page).getByRole('group', { name: 'Complete swap', exact: true });
  await expect(swaps.getByRole('button')).toHaveCount(2);
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  await panel(page).getByRole('button', { name: 'Change property', exact: true }).click();
  await expect(takes.getByRole('radio')).toHaveCount(3);
  await expect(swaps).toHaveCount(0);
  await more.click();
  await takes.getByRole('radio').last().click();
  const expected = options
    .filter((option) => option.action.choice === takeIds.at(-1))
    .at(-1)!.action;
  const action = swaps.getByRole('button').last();
  await action.focus();
  await exposedAction(action);
  await action.press('Enter');
  expect(await submitted(page)).toEqual(expected);
});

test('action targets and No Mercy debt gifts are exposed without a separate player step', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  for (const id of ['deal-5-31-7', 'deal-no-mercy-5-31-18']) {
    const base = midgameScenarios.find((item) => item.id === id)!;
    await page.goto('/design/midgame');
    await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(base.game);
    await page.getByRole('combobox', { name: 'Mid-game scenario', exact: true }).selectOption(id);
    const type = id === 'deal-5-31-7' ? 'play' : 'settle_debt';
    const card = base.room.game!.hand.find(
      (item) => item.effect === (type === 'play' ? 'debt' : 'tough'),
    )!;
    const options = (base.room.game!.actions || []).filter(
      (option) => option.action.card === card.id && option.action.type === type,
    );
    await hand(page)
      .getByRole('button', { name: new RegExp(`^${card.label}, bank value`) })
      .click();
    const moves = panel(page).getByRole('group', { name: 'Card moves', exact: true });
    await expect(moves.getByRole('button')).toHaveCount(Math.min(3, options.length));
    await exposedAction(moves.getByRole('button').first());
    if (options.length > 3) {
      await panel(page)
        .getByRole('button', { name: `All ${options.length} moves`, exact: true })
        .click();
      await expect(moves.getByRole('button')).toHaveCount(options.length);
    }
    await expect(
      panel(page).getByRole('radiogroup', { name: 'Choose a player', exact: true }),
    ).toHaveCount(0);
    await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
      'No action submitted',
    );
    const expected = options.at(-1)!.action;
    const recipient = base.room.members.find((member) => member.id === expected.target)!;
    const action = moves.getByRole('button').filter({ hasText: recipient.name });
    await expect(action).toHaveCount(1);
    if (type === 'settle_debt') {
      await expect(action).toHaveText(/^Give Tough luck to /);
      await expect(panel(page).getByRole('button', { name: /^Bank for/ })).toHaveCount(0);
    }
    await action.click();
    expect(await submitted(page)).toEqual(expected);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('countering and counter-countering show the bill, current block and permitted response', async ({
  page,
}) => {
  await selectScenario(page, 'counter');
  await expect(page.getByRole('region', { name: 'Pending action', exact: true })).toContainText(
    '5M',
  );
  await page.getByRole('button', { name: 'Just Say No', exact: true }).click();
  expect(await submitted(page)).toMatchObject({ type: 'no' });
  // The blocker now waits for the collector; the pending action stays viewable.
  await page.getByRole('button', { name: 'View pending action', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Action blocked', exact: true })).toBeVisible();
  await selectScenario(page, 'counter-chain');
  await expect(page.getByRole('heading', { name: 'Action blocked', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Accept the block', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Just Say No', exact: true }).click();
  expect(await submitted(page)).toMatchObject({ type: 'no' });
  await expect(page.getByRole('heading', { name: 'Action blocked', exact: true })).toHaveCount(0);
});

test('payment requires the bill or every payable asset and makes overpayment explicit', async ({
  page,
}) => {
  await selectScenario(page, 'payment-bank');
  await panel(page).getByRole('button', { name: 'Close move options', exact: true }).click();
  await expect(command(page).getByRole('button', { name: 'Pay 0M', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '2M, bank value 2M', exact: true }).click();
  await expect(command(page).getByRole('button', { name: 'Pay 2M', exact: true })).toBeDisabled();
  await page.getByRole('button', { name: '4M, bank value 4M', exact: true }).click();
  await expect(command(page).getByRole('button', { name: 'Pay 6M', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Choose move options', exact: true }).click();
  await expect(page.locator('.deal-payment-total')).toContainText('1M overpayment');
  await expect(own(page).locator('.deal-collection footer')).toContainText('Rent 0M');
  await expect(page.getByText(/No change is given\./)).toBeVisible();
  await capture(page, 'payment');
  await panel(page).getByRole('button', { name: 'Pay 6M', exact: true }).click();
  expect(await submitted(page)).toEqual(fixture('payment-bank').transitions[0].action);
  await selectScenario(page, 'payment-exact');
  await page.getByRole('button', { name: 'Select bank money', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: 'Pay 5M', exact: true })).toBeEnabled();
  await panel(page).getByRole('button', { name: 'Pay 5M', exact: true }).click();
  expect(await submitted(page)).toEqual(
    fixture('payment-exact').transitions.find((item) => item.label === 'Pay exactly')!.action,
  );
  await selectScenario(page, 'payment-insolvent');
  // Assets cannot cover the bill: the panel says so and offers to give everything.
  await expect(panel(page).getByRole('status')).toContainText('You can’t cover 5M');
  await own(page).getByRole('button', { name: '1M, bank value 1M', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: 'Pay 1M', exact: true })).toBeDisabled();
  await panel(page).getByRole('button', { name: 'Select everything', exact: true }).click();
  await expect(panel(page).getByRole('button', { name: 'Pay 2M', exact: true })).toBeEnabled();
  await panel(page).getByRole('button', { name: 'Close move options', exact: true }).click();
  await expect(command(page).getByRole('button', { name: 'Pay 2M', exact: true })).toBeEnabled();
  const wild = own(page).getByRole('button', { name: /^Wild property, not bankable/ });
  await wild.click();
  const info = page.getByRole('dialog', { name: 'Card info', exact: true });
  await expect(info.getByRole('heading', { name: 'Wild property', exact: true })).toBeVisible();
  await expect(info).toContainText('All-colour wilds have no payment value');
  await expect(info.getByText('None', { exact: true })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(wild).toBeFocused();
  await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
    'No action submitted',
  );
  await expect(command(page).getByRole('button', { name: 'Pay 2M', exact: true })).toBeEnabled();
  await command(page).getByRole('button', { name: 'Pay 2M', exact: true }).click();
  const actual = await submitted(page);
  const insolvent = fixture('payment-insolvent');
  expect(actual).toEqual(insolvent.transitions[0].action);
  const ownProperties = insolvent.room.game!.players.find(
    (player) => player.id === insolvent.selfId,
  )!.properties!;
  const wildCard = Object.values(ownProperties)
    .flat()
    .find((card) => card.value === '✧')!;
  expect(actual.cards).not.toContain(wildCard.id);
});

test('pending saves and disconnection disable direct card decisions before submission', async ({
  page,
}) => {
  await selectScenario(page, 'forced');
  await hand(page)
    .getByRole('button', { name: /^Forced deal, bank value 3M/ })
    .click();
  const bank = panel(page).getByRole('button', { name: 'Bank for 3M', exact: true });
  const take = panel(page)
    .getByRole('radiogroup', { name: 'Property you take', exact: true })
    .getByRole('radio')
    .first();
  const swap = panel(page)
    .getByRole('group', { name: 'Complete swap', exact: true })
    .getByRole('button')
    .first();
  const toggle = async (label: string, checked: boolean) => {
    const box = page.getByLabel(label, { exact: true });
    await box.dispatchEvent('click');
    await expect(box).toBeChecked({ checked });
  };
  await toggle('Saving a move', true);
  await expect(take).toBeDisabled();
  await toggle('Saving a move', false);
  await take.click();
  for (const label of ['Saving a move', 'Disconnected']) {
    await toggle(label, true);
    await expect(bank).toBeDisabled();
    await expect(swap).toBeDisabled();
    await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
      'No action submitted',
    );
    await toggle(label, false);
    await expect(bank).toBeEnabled();
    await expect(swap).toBeEnabled();
  }
});
