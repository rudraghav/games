import type { Locator } from '@playwright/test';
import type { TutorialDriver } from './tutorial-depth-run';

function button(surface: Locator, name: string | RegExp) {
  return surface
    .getByRole('button', { name, exact: typeof name === 'string', disabled: false })
    .filter({ visible: true })
    .first();
}

function namedCard(surface: Locator, label: string) {
  return button(
    surface,
    new RegExp('^' + label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '(?:[,. ·]|$)', 'i'),
  );
}

/** Play the tutorial through the controls available to this learner, including hand selections. */
export const playCardDecision: TutorialDriver = async (page, before, step) => {
  const game = before.game!;
  const table = page.locator('#tutorial-game-table');
  const coach = page.getByRole('region', { name: 'Tutorial coach' });
  const choices = game.actions;
  const option = (type: string) => choices.find((item) => item.action.type === type);
  const handCard = (id?: string | null) => game.hand.find((card) => card.id === id);
  const click = (name: string | RegExp) => button(table, name).click();
  switch (game.game_id) {
    case 'uno':
    case 'uno-no-mercy': {
      const direct = coach.locator('.turn-coach__action button:enabled');
      if (await direct.count()) {
        await direct.first().click();
        return;
      }
      const play = option('play');
      if (play) {
        const card = handCard(play.action.card);
        await namedCard(
          table.getByRole('group', { name: 'Your hand', exact: true }),
          card!.label,
        ).click();
        const choice = button(
          table,
          /^Choose (Red|Green|Yellow|Blue)|^Play .* (Red|Green|Yellow|Blue)$|^Swap with |^Play |^Stack /i,
        );
        await choice.click();
      } else {
        await click(/^(?:UNO!|Catch |Draw |Take |Choose |Pass$|Challenge)/i);
      }
      return;
    }
    case 'deal':
    case 'deal-no-mercy': {
      const end = option('end_turn');
      if (
        end &&
        (step % 4 === 0 || choices.every((o) => ['end_turn', 'rearrange'].includes(o.action.type)))
      ) {
        await click(/^End turn/i);
        return;
      }
      const play =
        option('settle_debt') ??
        option('property') ??
        choices.find(
          (o) => o.action.type === 'play' && handCard(o.action.card)?.effect === 'pass_go',
        ) ??
        option('bank') ??
        option('discard');
      const dialog = page.getByRole('dialog').last();
      if (play?.action.card) {
        await namedCard(
          table.getByRole('group', { name: 'Your hand', exact: true }),
          handCard(play.action.card)!.label,
        ).click();
        await button(
          dialog,
          /^(?:Place in |Add to |Bank for|Bank |Draw |Play |Discard |Give |Settle |Pay )/i,
        ).click();
      } else {
        if (!(await dialog.isVisible()))
          await click(/^View pending action|^Choose payment|^View .*bill/i);
        if (option('pay')) {
          const shortcut = button(dialog, /^Select bank money$|^Select everything$/);
          if (await shortcut.count()) await shortcut.click();
          const pay = button(dialog, /^Pay [0-9]+M$/);
          const assets = dialog.getByRole('checkbox', { checked: false, disabled: false });
          const available = await assets.count();
          for (let i = 0; i < available && !(await pay.count()); i++) await assets.first().check();
          await pay.click();
          return;
        }
        await button(
          dialog,
          /^(?:Pay |Allow |Accept|Give |Keep |Take |Confirm|Nothing to pay|Keep action blocked)/i,
        ).click();
      }
      return;
    }
    case 'rummy': {
      const discard = option('discard');
      if (discard) {
        await namedCard(table.locator('.rummy-groups'), handCard(discard.action.card)!.label).click(
          { position: { x: 5, y: 9 } },
        );
        await click(discard.label);
      } else {
        const draw = (step === 3 && option('draw_discard')) || option('draw_stock')!;
        await click(draw.label);
      }
      return;
    }
    case 'skyjo': {
      if (option('reveal')) await click(/^Reveal, row/i);
      else if (option('discard') && step % 2 === 0) await click(option('discard')!.label);
      else if (option('swap')) await click(/^Replace, row/i);
      else await click((option('draw_stock') ?? option('draw_discard') ?? choices[0]).label);
      return;
    }
    case 'flip-7': {
      if (option('target_effect'))
        await table.locator('.flip-target-button:enabled').first().click();
      else await click(((step % 3 === 0 && option('stay')) || option('hit') || choices[0]).label);
      return;
    }
    case 'trio': {
      if (option('continue')) await click('Continue');
      else if (step % 2 === 0 && option('reveal_hand')) await click(/^Lowest card ·/);
      else await click((option('reveal_table') ?? choices[0]).label);
      return;
    }
    case 'shithead': {
      const hand = table.getByRole('group', { name: 'Your hand', exact: true });
      if (option('arrange')) {
        for (let i = 0; i < 3; i++) await hand.getByRole('button').nth(i).click();
        await click(/^Keep selected three/);
      } else if (option('play')) {
        const chosen = option('play')!.action.cards![0];
        const card =
          handCard(chosen) ??
          game.players.find((p) => p.id === before.owner_id)?.cards?.find((c) => c?.id === chosen);
        if (!card)
          throw new Error(
            'The playable card was missing from the learner’s visible hand and table',
          );
        await namedCard(
          handCard(chosen) ? hand : table.getByLabel('Your table cards', { exact: true }),
          card.label,
        ).click();
        await click(/^Play selected/);
      } else if (option('flip')) await click(/^Flip hidden/);
      else await click(/^Take pile/);
      return;
    }
    default:
      throw new Error('Unknown card tutorial: ' + game.game_id);
  }
};
