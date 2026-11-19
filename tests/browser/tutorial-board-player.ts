import { expect, type Page } from '@playwright/test';
import { roomAs, type RoomView } from './helpers';

export const boardTutorials = [
  'four-in-a-row',
  'reversi',
  'checkers',
  'mancala',
  'azul',
  'boop',
  'gem-market',
  'six-nimmt',
  'sea-salt-paper',
] as const;

/** Use the live table's public cells, labels and the learner's own authorized choices. */
export async function playBoardDecision(page: Page, before: RoomView, step: number) {
  const table = page.locator('#tutorial-game-table');
  const button = (name: RegExp | string) =>
    table
      .getByRole('button', { name, exact: typeof name === 'string' })
      .filter({ visible: true })
      .first();
  const actions = before.game!.actions;
  const first = actions[0];
  if (['mancala', 'azul'].includes(before.game_id) && step === 1) {
    const coach = page.getByRole('region', { name: 'Tutorial coach' });
    await coach.getByRole('link', { name: 'Go to table' }).tap();
    const valid =
      before.game_id === 'azul'
        ? table.locator('.azul-draft-button:focus')
        : table.locator('.mancala-pit:focus');
    await expect(valid).toHaveCount(1);
  }
  switch (before.game_id) {
    case 'four-in-a-row': {
      const suggested = page.locator('.turn-coach__action button:enabled').first();
      if (step % 2 && (await suggested.count())) {
        await suggested.tap();
        return;
      }
      await button(actions.find((o) => o.action.choice === '3')?.label ?? first.label).tap();
      return;
    }
    case 'reversi': {
      const target = button(first.label);
      await target.tap();
      await expect(table.locator('.board-instruction')).toContainText(/flips .*Tap again/i);
      await target.tap();
      return;
    }
    case 'checkers': {
      const [source, end] = first.action.choice!.split(':');
      const piece = table.locator('button[data-cell="' + source + '"]');
      if ((await piece.getAttribute('aria-pressed')) !== 'true') await piece.tap();
      const dest = table.locator('button[data-cell="' + end + '"]');
      await expect(dest).toHaveAccessibleName(first.label);
      await dest.tap();
      return;
    }
    case 'mancala': {
      const option = step === 1 ? (actions.find((o) => o.action.choice === '2') ?? first) : first;
      const pit = table
        .getByRole('button', { name: new RegExp('^' + option.label.split(' · ')[0] + '\\b') })
        .first();
      await pit.tap();
      await expect(table.locator('.board-instruction')).toContainText(
        /last seed lands.*Tap again/i,
      );
      await pit.tap();
      return;
    }
    case 'boop': {
      if (first.action.type === 'place') {
        const grown = actions.find((o) => o.action.color === 'cat');
        if (grown) await button(/^Select cat:/).tap();
        await table.locator('.boop-square:enabled').first().tap();
      } else {
        await button(first.label).tap();
        const confirm = button(/^Confirm graduation|^Graduate selected|^Confirm return/);
        if (await confirm.isVisible()) await confirm.tap();
      }
      return;
    }
    case 'azul': {
      if (first.action.type === 'next_round') {
        await expect(button(/^Start round \d+$/)).toBeVisible();
        await page
          .getByRole('region', { name: 'Tutorial coach' })
          .getByRole('button', { name: first.label, exact: true })
          .tap({ timeout: 10000 });
        return;
      }
      if (first.action.type === 'draft_tiles') await button(/^Take .*from (factory|center)/i).tap();
      const placement = table.locator('[data-azul-choice]:enabled').first();
      await placement.tap();
      // The UI saves the draft and its previewed destination as one learner decision.
      await expect
        .poll(async () =>
          (await roomAs(page, before.id)).activity?.some(
            (move) =>
              move.actor_id === before.owner_id &&
              move.type === 'place_tiles' &&
              move.version > before.match_version!,
          ),
        )
        .toBe(true);
      return;
    }
    case 'gem-market': {
      if (
        first.action.type === 'return' ||
        first.action.type === 'patron' ||
        first.action.type === 'pass'
      ) {
        await button(first.label).tap();
        return;
      }
      const buying = actions.filter((o) => o.action.type === 'buy');
      let buy;
      for (const opt of buying) {
        const card = table.locator('button[data-card="' + opt.action.card + '"]:visible').first();
        if (await card.count()) {
          buy = card;
          break;
        }
      }
      if (buy) {
        await buy.tap();
        await button(/^Buy/).tap();
        return;
      }
      if (step === 2 && actions.some((o) => o.action.type === 'reserve')) {
        await table
          .locator('.gem-tier[data-active="true"] button.development-card:enabled')
          .first()
          .tap();
        await button(/^Reserve/).tap();
        return;
      }
      const take = actions.find((o) => o.action.type === 'take') ?? first;
      for (const color of take.action.choice!.split(',')) await button('Select ' + color).tap();
      await button('Take selected gems').tap();
      return;
    }
    case 'six-nimmt': {
      if (first.action.type === 'select_number') {
        const card = table.locator('.six-hand button:enabled').first();
        if (await card.count()) await card.tap();
        await button(/^Lock my number$|^Lock \d+$/).tap();
      } else if (first.action.type === 'take_row') {
        const coach = page.getByRole('region', { name: 'Tutorial coach' });
        await coach.getByRole('link', { name: 'Go to table' }).tap();
        await expect(table.locator('button[data-row]:focus')).toHaveAccessibleName(/^Take row/);
        await button(/^Take row/).tap();
      } else await button(first.label).tap();
      return;
    }
    case 'sea-salt-paper': {
      switch (before.game!.phase) {
        case 'draw':
          await button(/^Draw (from|two)/i).tap();
          break;
        case 'choosing':
          await table
            .getByRole('group', { name: 'Cards to keep' })
            .getByRole('button')
            .first()
            .tap();
          await button(/^Keep selected · discard to pile/).tap();
          break;
        case 'playing':
          await button(/^Finish turn$/).tap();
          break;
        default:
          await button(first.label).tap();
      }
      return;
    }
  }
  throw new Error('Unrecognized board tutorial: ' + before.game_id);
}
