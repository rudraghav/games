import { test, expect, type BrowserContext } from '@playwright/test';
import catalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };
import { boardTutorials, playBoardDecision } from './tutorial-board-player';
import { playCardDecision } from './tutorial-card-player';
import { playPartyDecision } from './tutorial-party-player';
import { runTutorial, type TutorialDriver } from './tutorial-depth-run';

const cards = [
  'uno',
  'uno-no-mercy',
  'deal',
  'deal-no-mercy',
  'rummy',
  'skyjo',
  'flip-7',
  'trio',
  'shithead',
];
const parties = [
  'holdem',
  'teen-patti',
  'blackjack',
  'word-agents',
  'spill-or-chill',
  'most-likely',
  'hot-seat',
  'the-gang',
  'tarot',
];
const drivers = new Map<string, TutorialDriver>();
for (const game of cards) drivers.set(game, playCardDecision);
for (const game of boardTutorials) drivers.set(game, playBoardDecision);
for (const game of parties) drivers.set(game, playPartyDecision);

for (const game of ['roulette', 'slots']) {
  drivers.set(game, async (page) => {
    if (game === 'roulette') await page.getByRole('button', { name: 'Red', exact: true }).click();
    await page.getByRole('button', { name: 'Spin', exact: true }).click();
  });
}

// Secret Santa: three names, the draw, then one pass-the-phone reveal and its Hide.
drivers.set('secret-santa', async (page, before) => {
  const game = before.game!;
  const table = page.locator('#tutorial-game-table');
  const has = (type: string) => game.actions.some((option) => option.action.type === type);
  if (has('hide')) {
    await table.getByRole('button', { name: /^(Hide|Cancel)$/ }).click();
  } else if (has('draw')) {
    await table.getByRole('button', { name: 'Draw names', exact: true }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Draw names', exact: true }).click();
  } else if (has('add_name')) {
    const added = (game.detail.people as unknown[]).length;
    const field = table.getByRole('textbox', { name: 'Add a name', exact: true });
    await field.fill(['Sam', 'Priya', 'Jo', 'Mateo'][added] ?? `Guest ${added + 1}`);
    await field.press('Enter');
  } else {
    await table
      .getByRole('button', { name: /^Show on this phone for / })
      .first()
      .click();
    await table.getByRole('button', { name: /^I’m .+, show who I drew$/ }).click();
  }
});

test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });
// Three independent titles per test learner, each with at most four hands, fit
// the ordinary twelve-room allowance. Every title gets its own browser context.
let guestCookies: Awaited<ReturnType<BrowserContext['cookies']>> = [];
let titlesPlayed = 0;
for (const game of catalogue) {
  test(`mobile tutorial decisions in ${game.id}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'phone', 'This walkthrough exercises touch controls.');
    test.setTimeout(240000);
    page.setDefaultTimeout(20000);
    const driver = drivers.get(game.id);
    if (!driver) throw new Error('Missing mobile tutorial walkthrough for ' + game.id);
    if (titlesPlayed === 3) {
      guestCookies = [];
      titlesPlayed = 0;
    }
    if (guestCookies.length) await page.context().addCookies(guestCookies);
    let longest = 0;
    // A blackjack natural or an early fold can end a short hand before a second decision.
    const goal = game.id === 'tarot' ? 3 : 4;
    for (let attempt = 0; attempt < 4 && longest < goal; attempt++) {
      const turns = await runTutorial(page, game.id, info, driver, attempt);
      longest = Math.max(longest, turns);
    }
    expect(longest, 'A tutorial must be exercised past its opening decision').toBeGreaterThan(1);
    titlesPlayed++;
    guestCookies = (await page.context().cookies()).filter((c) =>
      /^sb-.+-auth-token(?:\.\d+)?$/.test(c.name),
    );
  });
}
