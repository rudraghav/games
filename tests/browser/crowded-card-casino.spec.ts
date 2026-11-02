import { expect, test, type Locator, type Page } from '@playwright/test';
import {
  midgameScenarios,
  type MidgameScenario,
} from '../../apps/web/src/stories/generated/midgame-scenarios';

const games = [
  'uno',
  'uno-no-mercy',
  'rummy',
  'skyjo',
  'shithead',
  'holdem',
  'teen-patti',
  'blackjack',
];
const fixtures = midgameScenarios.filter((item) => games.includes(item.game));
test.skip(Boolean(process.env.GAMES_TEST_URL), 'Legal projection density review is local-only.');
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

async function scenario(page: Page, item: MidgameScenario) {
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(item.game);
  await page
    .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
    .selectOption(item.id);
  await expect(page.locator('.midgame-review-table')).toHaveAttribute('data-midgame', item.id);
}

async function railEnd(rail: Locator, direction: 'Next' | 'Previous') {
  await rail
    .page()
    .evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
  const button = rail.getByRole('button', { name: new RegExp(`^${direction} `) });
  for (let step = 0; step < 60 && (await button.count()) && (await button.isEnabled()); step++) {
    await button.click();
    await rail.page().evaluate(() => new Promise(requestAnimationFrame));
  }
  if (await button.count()) await expect(button).toBeDisabled();
  const viewport = rail.locator(':scope > .horizontal-rail-viewport');
  const card = viewport.locator('.playing-card')[direction === 'Next' ? 'last' : 'first']();
  await expect
    .poll(() =>
      card.evaluate((node) => {
        const frame = node.closest('.horizontal-rail-viewport')!.getBoundingClientRect();
        const card = node.getBoundingClientRect();
        return card.left >= frame.left - 2 && card.right <= frame.right + 2;
      }),
    )
    .toBe(true);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/design/midgame');
  await expect(page.getByRole('heading', { name: 'Mid-game workspace review' })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
});

test('card and casino legal states contain every public seat preview at narrow and wide sizes', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  const widths = info.project.name === 'phone' ? [320, 390] : [768, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    for (const item of fixtures) {
      await scenario(page, item);
      const report = await page.locator('.midgame-review-table').evaluate((root) => {
        const visible = (node: Element) => (node as HTMLElement).checkVisibility();
        const overrun = [...root.querySelectorAll('.casino-seat .seat-cards .playing-card')]
          .filter(visible)
          .filter((node) => {
            const seat = node.closest('.casino-seat')!.getBoundingClientRect();
            const card = node.getBoundingClientRect();
            return card.left < seat.left - 2 || card.right > seat.right + 2;
          }).length;
        const tiny = [
          ...root.querySelectorAll('button:enabled, input:enabled, select:enabled, summary'),
        ]
          .filter(visible)
          .filter((node) => {
            const box = node.getBoundingClientRect();
            return box.width < 43.5 || box.height < 43.5;
          }).length;
        const seats = [...root.querySelectorAll('.casino-seat')]
          .filter(visible)
          .map((node) => node.getBoundingClientRect());
        const collisions = seats.reduce(
          (count, a, index) =>
            count +
            seats
              .slice(index + 1)
              .filter(
                (b) =>
                  Math.min(a.right, b.right) - Math.max(a.left, b.left) > 2 &&
                  Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 2,
              ).length,
          0,
        );
        return {
          pageOverflow: document.documentElement.scrollWidth > innerWidth,
          overrun,
          tiny,
          collisions,
        };
      });
      expect(report, `${item.id} at ${width}px`).toEqual({
        pageOverflow: false,
        overrun: 0,
        tiny: 0,
        collisions: 0,
      });
    }
  }
});

test('natural long hands expose first and last cards through explicit rail controls', async ({
  page,
}, info) => {
  const cases = [
    ['uno', 40],
    ['uno-no-mercy', 24],
    ['shithead', 20],
  ] as const;
  for (const [game, minimum] of cases) {
    const item = fixtures.find(
      (entry) => entry.game === game && entry.room.game!.hand.length >= minimum,
    )!;
    expect(item).toBeTruthy();
    await scenario(page, item);
    const rail = page
      .locator('.hand-rail')
      .filter({ has: page.getByRole('group', { name: 'Your hand', exact: true }) });
    await expect(rail.locator('.playing-card')).toHaveCount(item.room.game!.hand.length);
    await railEnd(rail, 'Next');
    await railEnd(rail, 'Previous');
    await page.getByLabel('Saving a move').check();
    await expect(rail.locator('button.playing-card:enabled')).toHaveCount(0);
    await page.getByLabel('Saving a move').uncheck();
    await page.getByLabel('Disconnected').check();
    await expect(rail.locator('button.playing-card:enabled')).toHaveCount(0);
    await page.getByLabel('Disconnected').uncheck();
  }
  const blackjack = fixtures.find(
    (item) => item.game === 'blackjack' && item.id.endsWith('-crowded'),
  )!;
  const split = fixtures.find(
    (item) => item.game === 'blackjack' && item.next.action.type === 'split',
  )!;
  const widths = info.project.name === 'phone' ? [320, 390] : [768, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await scenario(page, blackjack);
    const singleHand = page.locator('.blackjack-hand');
    await expect(singleHand).toHaveCount(1);
    await expect
      .poll(
        () =>
          singleHand.evaluate((node) => {
            const available = node.closest('.blackjack-hands')!.getBoundingClientRect().width;
            return Math.abs(node.getBoundingClientRect().width - available);
          }),
        { message: `Single hand fills its available space at ${width}px` },
      )
      .toBeLessThanOrEqual(2);
    const cards = singleHand.locator('.casino-hand-rail');
    await expect(cards.locator('.playing-card')).toHaveCount(5);
    await railEnd(cards, 'Next');
    await railEnd(cards, 'Previous');

    await scenario(page, split);
    const option = split.room.game!.actions!.find((item) => item.action.type === 'split')!;
    await page.getByRole('button', { name: option.label, exact: true }).click();
    const hands = page.locator('.blackjack-hand');
    await expect(hands).toHaveCount(2);
    const active = Number(split.next.game.detail!.active_hand_index);
    await expect(hands.nth(active)).toHaveAttribute('data-active', 'true');
    await expect(page.locator('.casino-decision-shell')).toContainText(
      `Playing hand ${active + 1} of 2`,
    );
    for (const hand of await hands.all()) {
      expect(await hand.evaluate((node) => node.getBoundingClientRect().width)).toBeCloseTo(180, 0);
      await expect(hand.getByRole('group', { name: /^Cards in hand / })).toHaveCount(1);
    }
    const viewport = page.getByRole('group', { name: 'Your blackjack hands', exact: true });
    const outerRail = viewport.locator('..');
    for (const direction of ['Next', 'Previous'] as const) {
      const control = outerRail.getByRole('button', {
        name: `${direction} blackjack hands`,
        exact: true,
      });
      if (await control.count()) {
        await control.scrollIntoViewIfNeeded();
        await expect
          .poll(
            () =>
              control.evaluate((node) => {
                const area = node.closest('.casino-own-cards')!.getBoundingClientRect();
                const button = node.getBoundingClientRect();
                return button.top >= area.top - 2 && button.bottom <= area.bottom + 2;
              }),
            { message: `Split navigation remains vertically reachable at ${width}px` },
          )
          .toBe(true);
      }
      for (
        let step = 0;
        step < 10 && (await control.count()) && (await control.isEnabled());
        step++
      ) {
        await control.click();
        await page.evaluate(() => new Promise(requestAnimationFrame));
      }
      if (await control.count()) await expect(control).toBeDisabled();
      const edge = hands.nth(direction === 'Next' ? 1 : 0);
      await expect
        .poll(
          () =>
            edge.evaluate((node) => {
              const frame = node.closest('.blackjack-hands')!.getBoundingClientRect();
              const hand = node.getBoundingClientRect();
              return hand.left >= frame.left - 2 && hand.right <= frame.right + 2;
            }),
          { message: `Split hand remains fully reachable at ${width}px` },
        )
        .toBe(true);
      await expect(hands.nth(active)).toHaveAttribute('data-active', 'true');
    }
    await expect(page.getByLabel('Submitted action')).toHaveText(JSON.stringify(split.next.action));
  }
});

test('large public blackjack hands remain fully inspectable without committing actions', async ({
  page,
}) => {
  const item = fixtures.find(
    (entry) =>
      entry.game === 'blackjack' &&
      entry.room.game!.players.some(
        (player) =>
          player.id !== entry.selfId &&
          (player.cards?.filter((card) => card !== null).length ?? 0) > 3,
      ),
  )!;
  expect(item).toBeTruthy();
  await scenario(page, item);
  const player = item.room.game!.players.find(
    (entry) =>
      entry.id !== item.selfId && (entry.cards?.filter((card) => card !== null).length ?? 0) > 3,
  )!;
  const publicCards = player.cards?.filter((card) => card !== null) ?? [];
  const name = item.room.members.find((member) => member.id === player.id)!.name;
  const opener = page.getByRole('button', {
    name: `Inspect ${name}'s ${publicCards.length} public cards`,
    exact: true,
  });
  for (const state of ['normal', 'Saving a move', 'Disconnected']) {
    if (state !== 'normal') await page.getByLabel(state).check();
    await opener.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: `${name} · public cards`, exact: true });
    await expect(dialog.locator('.playing-card')).toHaveCount(publicCards.length);
    await expect(dialog.locator('button.playing-card')).toHaveCount(0);
    const rail = dialog.locator('.hand-rail');
    await railEnd(rail, 'Next');
    await railEnd(rail, 'Previous');
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
    await expect(opener).toBeFocused();
    await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
    if (state !== 'normal') await page.getByLabel(state).uncheck();
  }
});

test('all five rummy groups remain distinct and every card stays reachable', async ({ page }) => {
  const item = fixtures.find(
    (entry) => entry.game === 'rummy' && entry.room.game!.hand.length === 14,
  )!;
  await scenario(page, item);
  for (let group = 1; group <= 4; group++) {
    await page
      .getByRole('group', { name: 'Ungrouped', exact: true })
      .locator('button.playing-card')
      .first()
      .click();
    await page.getByRole('button', { name: `Group ${group}`, exact: true }).click();
  }
  await expect(page.locator('.rummy-group')).toHaveCount(5);
  await expect(page.locator('.rummy-groups .playing-card')).toHaveCount(14);
  const overflowStates = await page
    .locator('.rummy-group .horizontal-rail')
    .first()
    .evaluate(async (rail) => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const states = new Set<string | null>();
      for (let frame = 0; frame < 12; frame++) {
        await new Promise(requestAnimationFrame);
        states.add(rail.getAttribute('data-overflow'));
      }
      return [...states];
    });
  expect(overflowStates).toHaveLength(1);
  const overlap = await page.locator('.rummy-groups').evaluate((root) => {
    const groups = [...root.querySelectorAll('.rummy-group')].map((node) =>
      node.getBoundingClientRect(),
    );
    return groups.some((group, index) => index > 0 && group.top < groups[index - 1].bottom - 2);
  });
  expect(overlap).toBe(false);
  for (const rail of await page.locator('.rummy-group .hand-rail').all()) {
    await railEnd(rail, 'Next');
    await railEnd(rail, 'Previous');
  }
  await page.getByLabel('Saving a move').check();
  await expect(page.locator('.rummy-groups button.playing-card:enabled')).toHaveCount(0);
  await expect(page.locator('.rummy-group-controls button:enabled')).toHaveCount(0);
  await page.getByLabel('Saving a move').uncheck();
  await page.getByLabel('Disconnected').check();
  await expect(page.locator('.rummy-groups button.playing-card:enabled')).toHaveCount(0);
  await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
});
