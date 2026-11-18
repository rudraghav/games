import { expect, type Locator } from '@playwright/test';
import { roomAs } from './helpers';
import type { TutorialDriver } from './tutorial-depth-run';

const button = (table: Locator, name: RegExp) => table.getByRole('button', { name }).first();

/** Play through private choices, wagers, chip streets, clue turns and the three-card spread. */
export const playPartyDecision: TutorialDriver = async (page, before, step) => {
  const game = before.game!;
  const table = page.locator('#tutorial-game-table');
  const has = (type: string) => game.actions.some((option) => option.action.type === type);
  const click = (name: RegExp) => button(table, name).click();
  if (step === 1) {
    const expectedFocus: Record<string, string> = {
      'word-agents': '.clue-form input',
      'teen-patti': '.casino-choice[data-action="bet"] button, .casino-wager input',
      'the-gang': '.gang-chip-choice',
      'hot-seat': '.party-choice',
      'most-likely': '.party-choice',
      'spill-or-chill': '.party-choice',
    };
    if (expectedFocus[game.game_id] && !has('next_prompt')) {
      await page.getByRole('link', { name: 'Go to table' }).click();
      await expect(
        table.locator(expectedFocus[game.game_id]).and(page.locator(':focus')),
      ).toHaveCount(1);
    }
  }
  switch (game.game_id) {
    case 'holdem':
      if (step === 2 && has('raise')) {
        await table.locator('.casino-wager[data-action="raise"] button[type="submit"]').click();
      } else await click(/^Check$|^Call(?: |$)/);
      return;
    case 'teen-patti':
      if (step >= 2 && has('peek')) await click(/^See my cards/i);
      else if (step >= 4 && has('show')) await click(/^Show\b/);
      else if (has('decline')) await click(/^Decline sideshow/);
      else if (has('bet')) {
        const direct = button(table, /^(Blind bet|Chaal) \d/);
        if (await direct.count()) await direct.click();
        else await table.locator('.casino-wager[data-action="bet"] button[type="submit"]').click();
      } else await click(/^Pack|^Show\b/);
      return;
    case 'blackjack':
      if (has('bet'))
        await table.locator('.casino-wager[data-action="bet"] button[type="submit"]').click();
      else if (has('decline')) await click(/^No insurance/);
      else if (has('split')) await click(/^Split/);
      else if (has('hit') && step < 4) await click(/^Hit(?: |$)/);
      else await click(/^Stand(?: |$)/);
      return;
    case 'word-agents':
      if (has('clue')) {
        const sampleClues = [
          ['space', 'moon comet sky star planet satellite rocket sun earth night'],
          ['music', 'drum flute guitar jazz piano violin dance bell'],
          ['animals', 'bear cat dog fox horse lion mouse rabbit tiger whale wolf zebra'],
          ['travel', 'bicycle boat engine pilot rocket ship submarine train station wheel'],
          ['fruit', 'apple cherry lemon olive orange strawberry tomato walnut'],
          ['birds', 'bird eagle feather nest owl parrot swan wing'],
          ['cutlery', 'fork knife spoon plate'],
        ];
        const team = game.detail.active_team === 0 ? 'coral' : 'blue';
        // Only a spymaster's own visible board is consulted for their clue.
        const covered = (words: string) =>
          game.community.filter(
            (c) => c.subtitle !== 'revealed' && words.split(' ').includes(c.label.toLowerCase()),
          );
        const score = (words: string) =>
          covered(words).reduce((n, c) => n + (c.color === team ? 1 : -3), 0);
        const sorted = sampleClues
          .filter(([clue]) => !game.community.some((c) => c.label.toLowerCase() === clue))
          .sort((a, b) => score(b[1]) - score(a[1]));
        await table.getByPlaceholder('One word').fill(sorted[0]?.[0] || 'lanternlight');
        await click(/^Give clue$/);
      } else if (has('end_guesses')) await click(/^End guesses$/);
      else {
        await table.locator('.word-tile:enabled').first().click();
        await click(/^Confirm /);
      }
      return;
    case 'spill-or-chill':
    case 'most-likely':
    case 'hot-seat':
      if (has('next_prompt')) await click(/^Next prompt|^See results/);
      else {
        const choices = table.locator('.party-choice-grid button');
        const pass = step % 4 === 3;
        if (pass) await click(/^Pass/);
        else await choices.nth(step % 2 === 0 ? 1 : 0).click();
        for (let attempt = 0; attempt < before.members.length; attempt++) {
          const action = page.waitForResponse(
            (r) =>
              r.request().method() === 'POST' && r.url().endsWith(`/rooms/${before.id}/actions`),
          );
          await click(/^Lock in my choice|^Confirm pass/);
          const status = (await action).status();
          if (status === 200) return;
          expect(status).toBe(409);
          // A bot can lock in at the same time. Only re-confirm the still-selected
          // option in the original round, exactly as the visible recovery offers.
          const current = await roomAs(page, before.id);
          expect(current.match_id).toBe(before.match_id);
          expect(current.game!.detail.round).toBe(game.detail.round);
          await expect(table.locator('.party-decisions')).toContainText('Lock it in again.');
        }
        throw Error('The party decision did not save after re-confirming');
      }
      return;
    case 'the-gang': {
      if (has('reveal_hand')) {
        await click(/^Reveal my hand/);
        return;
      }
      if (has('next_heist')) {
        await click(/^Next heist$/);
        return;
      }
      // Prefer a free chip to progress the street. The closing chip needs explicit review.
      const chip = button(table, /^(Take|Review) \d-star chip in the cent(er|re)$/);
      await chip.waitFor({ state: 'visible' });
      const review = (await chip.getAttribute('aria-label'))?.startsWith('Review');
      await chip.click();
      if (review) await click(/^Take \d-star chip$/);
      // Leave the claim on the rack while the other crew members rank. Repeatedly
      // swapping free chips keeps resetting the bot timer and never reaches the flop.
      await expect
        .poll(
          async () => {
            const next = (await roomAs(page, before.id)).game!;
            return (
              next.phase !== 'chips' ||
              next.detail.street !== game.detail.street ||
              (next.actions.every((o) => o.action.type !== 'return_chip') &&
                next.detail.taken_chips &&
                Object.hasOwn(next.detail.taken_chips as object, before.owner_id))
            );
          },
          { timeout: 30000 },
        )
        .toBeTruthy();
      return;
    }
    case 'tarot':
      await click(/^Face-down card 1 of /);
      return;
    default:
      throw Error('Unsupported party tutorial');
  }
};
