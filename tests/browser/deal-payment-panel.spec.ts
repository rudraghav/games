import { expect, test } from '@playwright/test';
import { dealScenarios } from '../../apps/web/src/stories/generated/deal-scenarios';

test.skip(
  Boolean(process.env.GAMES_TEST_URL),
  'Public engine replays run on the local review route.',
);

for (const id of ['linked-payment-classic', 'linked-payment-no-mercy']) {
  test(
    id + ' pays exact linked assets without leaving the payment panel',
    async ({ page }, info) => {
      if (info.project.name !== 'desktop') await page.setViewportSize({ width: 320, height: 640 });
      const fixture = dealScenarios.find((item) => item.id === id)!;
      await page.goto('/design/deal');
      await page.getByRole('combobox', { name: 'Deal scenario' }).selectOption(id);
      const editor = page.getByRole('region', { name: 'Pending action', exact: true });
      const items = editor.getByRole('group', { name: 'Assets to pay with' });
      const checkboxes = items.getByRole('checkbox');
      const game = fixture.room.game!;
      const self = game.players.find((player) => player.id === fixture.selfId)!;
      const properties = Object.values(self.properties || {}).flat();
      const expected = fixture.transitions[0].action;
      const select = (id: string) =>
        items.getByRole('checkbox', {
          name: new RegExp('^' + properties.find((c) => c.id === id)!.label),
        });
      const total = id.endsWith('classic') ? 9 : 6;
      await expect(checkboxes).toHaveCount(
        game.actions!.find((item) => item.action.type === 'pay')!.eligible_cards!.length,
      );
      const anchor = select(fixture.focusCard!);
      await expect(anchor).toHaveAccessibleName(/Includes .+M total/);
      await anchor.check();
      const attached = items.getByRole('checkbox', {
        name: /Goes with its property/,
        checked: true,
        disabled: true,
      });
      await expect(attached).toHaveCount(id.endsWith('classic') ? 2 : 1);
      await anchor.uncheck();
      await expect(items.getByRole('checkbox', { checked: true })).toHaveCount(0);
      for (const cardId of expected.cards!) await select(cardId).check();
      const commit = editor.getByRole('button', { name: `Pay ${total}M`, exact: true });
      await expect(commit).toBeEnabled();
      await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
        'No action submitted',
      );
      await editor.getByRole('checkbox').last().scrollIntoViewIfNeeded();
      await expect(commit).toBeInViewport({ ratio: 0.98 });
      expect(
        await commit.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.height >= 44 &&
            el.contains(document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2))
          );
        }),
      ).toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await commit.click();
      await expect(page.getByLabel('Submitted action', { exact: true })).toHaveText(
        JSON.stringify(expected),
      );
      await expect(editor).toHaveCount(0);
    },
  );
}
