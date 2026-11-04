import { expect, test, type Locator, type Page } from '@playwright/test';
import { dealScenarios } from '../../apps/web/src/stories/generated/deal-scenarios';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Synthetic review routes are local only.');
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });
const panel = (page: Page) => page.locator('.table-decision-panel');

async function collectionBounds(root: Locator) {
  return root.evaluate((node) => {
    const collections = node.querySelector('.deal-collections')!;
    const outer = collections.getBoundingClientRect();
    const groups = [...collections.querySelectorAll('.deal-collection')];
    const bounds = groups.map((group) => group.getBoundingClientRect());
    return {
      count: groups.length,
      rows: new Set(bounds.map((b) => Math.round(b.y))).size,
      horizontalOverflow: collections.scrollWidth > collections.clientWidth + 1,
      outside: bounds.filter((b) => b.left < outer.left - 1 || b.right > outer.right + 1).length,
      overlaps: bounds.flatMap((a, i) =>
        bounds
          .slice(i + 1)
          .filter(
            (b) =>
              Math.min(a.right, b.right) - Math.max(a.left, b.left) > 1 &&
              Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 1,
          ),
      ).length,
    };
  });
}

for (const edition of ['classic', 'no-mercy']) {
  test(`Deal ${edition}: thirteen own and opponent sets wrap into reachable rows`, async ({
    page,
  }, info) => {
    for (const width of info.project.name === 'phone' ? [320, 390] : [768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/design/deal');
      await page
        .getByRole('combobox', { name: 'Deal scenario', exact: true })
        .selectOption(`crowded-${edition}`);
      const own = page.locator('.deal-board-scroll');
      await expect(own.locator('.deal-collection')).toHaveCount(13);
      const report = await collectionBounds(own);
      expect(report).toMatchObject({
        count: 13,
        horizontalOverflow: false,
        outside: 0,
        overlaps: 0,
      });
      expect(report.rows).toBeGreaterThan(1);
      // Ten bank cards read as denominations with counts, all on the table at once.
      const notes = await own.locator('.deal-bank-note').evaluateAll((items) =>
        items.map((item) => ({
          value: Number.parseInt(item.querySelector('b')!.textContent!, 10),
          count: Number(item.getAttribute('data-count')),
          visible: item.getBoundingClientRect().height > 0,
        })),
      );
      expect(notes.reduce((sum, note) => sum + note.count, 0)).toBe(10);
      expect(notes.every((note) => note.visible)).toBe(true);
      await expect(own.locator('.deal-bank > header strong')).toHaveText(
        `${notes.reduce((sum, note) => sum + note.value * note.count, 0)}M`,
      );
      const lastInfo = own.getByRole('button', { name: /^Inspect / }).last();
      await lastInfo.focus();
      await lastInfo.press('Enter');
      await expect(page.getByRole('dialog', { name: 'Card info', exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(lastInfo).toBeFocused();
      await expect(lastInfo).toBeInViewport();
      await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
      await page
        .getByRole('combobox', { name: 'Deal scenario', exact: true })
        .selectOption(`crowded-opponent-${edition}`);
      await page.getByRole('button', { name: /^Inspect Alexandra/ }).click();
      const inspector = page.locator('.opponent-panel-inspection');
      await expect(inspector.locator('.deal-collection')).toHaveCount(13);
      expect(await collectionBounds(inspector)).toMatchObject({
        count: 13,
        horizontalOverflow: false,
        outside: 0,
        overlaps: 0,
      });
      await inspector
        .getByRole('button', { name: /^Inspect / })
        .last()
        .focus();
      await expect(inspector.getByRole('button', { name: /^Inspect / }).last()).toBeInViewport();
      await page.keyboard.press('Escape');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}

test('a pending steal shows the actual wild, permits inspection and commits only the legal response', async ({
  page,
}, info) => {
  const fixture = dealScenarios.find((s) => s.id === 'crowded-sly-response')!;
  const publicTarget = fixture.room.game!.detail!.pending_action as {
    transfers: { cards: string[] }[];
  };
  const targetId = publicTarget.transfers[0].cards[0];
  const target = fixture.room
    .game!.players.flatMap((p) => Object.values(p.properties ?? {}).flat())
    .find((c) => c.id === targetId)!;
  for (const width of info.project.name === 'phone' ? [320, 390] : [768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/design/deal');
    await page
      .getByRole('combobox', { name: 'Deal scenario', exact: true })
      .selectOption(fixture.id);
    await expect(panel(page)).toBeVisible();
    // One sentence names the exact wild, its active colour and the set it leaves.
    await expect(panel(page).locator('.deal-resolution-headline')).toContainText(
      'wants to Sly Deal your Wild Green/Dark blue (Green active, 4M) from your Green set 2',
    );
    await expect(panel(page).locator('.deal-transfer-list > li')).toHaveCount(1);
    for (const name of [/^Accept Sly Deal$/, /^Just Say No$/]) {
      const button = panel(page).getByRole('button', { name });
      await expect(button).toBeVisible();
      await expect(button).toBeInViewport({ ratio: 1 });
    }
    await panel(page)
      .getByRole('button', { name: `Card info: ${target.label}`, exact: true })
      .click();
    await expect(page.getByRole('dialog', { name: 'Card info', exact: true })).toBeVisible();
    await page.keyboard.press('Escape');
    await panel(page).getByRole('button', { name: 'View table', exact: true }).click();
    await expect(
      panel(page).getByRole('button', { name: 'Resume move', exact: true }),
    ).toBeVisible();
    await panel(page).getByRole('button', { name: 'Resume move', exact: true }).click();
    const response = fixture.room.game!.actions!.find((o) => o.action.type === 'no')!;
    for (const flag of ['Saving a move', 'Disconnected']) {
      await page.getByLabel(flag, { exact: true }).check();
      await expect(
        panel(page).getByRole('button', { name: 'Just Say No', exact: true }),
      ).toBeDisabled();
      await page.getByLabel(flag, { exact: true }).uncheck();
    }
    const control = panel(page).getByRole('button', { name: 'Just Say No', exact: true });
    await control.focus();
    await control.press('Space');
    expect(JSON.parse(await page.getByLabel('Submitted action').innerText())).toEqual(
      response.action,
    );
    await page.getByRole('button', { name: 'Reset scenario', exact: true }).click();
    await panel(page).getByRole('button', { name: 'Accept Sly Deal', exact: true }).click();
    expect(JSON.parse(await page.getByLabel('Submitted action').innerText())).toEqual(
      fixture.room.game!.actions!.find((option) => option.action.type === 'accept')!.action,
    );
    await expect(
      page.locator('.deal-board-scroll .playing-card').filter({ hasText: target.label }),
    ).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('both Deal editions keep every legal midgame collection inside its board at four widths', async ({
  page,
}, info) => {
  // Every legal Deal midgame state at two widths; generous for a loaded dev server.
  test.setTimeout(360000);
  const cases = midgameScenarios.filter((entry) => ['deal', 'deal-no-mercy'].includes(entry.game));
  expect(new Set(cases.map((entry) => entry.game)).size).toBe(2);
  for (const width of info.project.name === 'phone' ? [320, 390] : [768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/design/midgame');
    for (const item of cases) {
      await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(item.game);
      await page
        .getByRole('combobox', { name: 'Mid-game scenario', exact: true })
        .selectOption(item.id);
      await expect(page.locator('.midgame-review-table')).toHaveAttribute('data-midgame', item.id);
      const report = await collectionBounds(page.locator('.deal-board-scroll'));
      expect(report, `${item.id} at ${width}`).toMatchObject({
        horizontalOverflow: false,
        outside: 0,
        overlaps: 0,
      });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  }
});
