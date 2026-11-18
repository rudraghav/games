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

test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });
// Each worker reuses only its own authenticated guest, in memory. Every game has a new
// room and browser context, and the final read verifies that the learner left the room.
let guestCookies: Awaited<ReturnType<BrowserContext['cookies']>> = [];
for (const game of catalogue) {
  test(`mobile tutorial decisions in ${game.id}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'phone', 'This walkthrough exercises touch controls.');
    test.setTimeout(240000);
    const driver = drivers.get(game.id);
    if (!driver) throw new Error('Missing mobile tutorial walkthrough for ' + game.id);
    if (guestCookies.length) await page.context().addCookies(guestCookies);
    let longest = 0;
    // A blackjack natural or an early fold can end a short hand before a second decision.
    const goal = game.id === 'tarot' ? 3 : 4;
    for (let attempt = 0; attempt < 4 && longest < goal; attempt++) {
      const turns = await runTutorial(page, game.id, info, driver, attempt);
      longest = Math.max(longest, turns);
    }
    expect(longest, 'A tutorial must be exercised past its opening decision').toBeGreaterThan(1);
    guestCookies = (await page.context().cookies()).filter((c) =>
      /^sb-.+-auth-token(?:\.\d+)?$/.test(c.name),
    );
  });
}
