import { expect, test, type Page } from '@playwright/test';
import catalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };
import {
  attachPreviewAccess,
  entryAction,
  startBotTable,
  requestAs,
  roomAs,
  type RoomView,
} from './helpers';

test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

async function withMatch(
  page: Page,
  game: string,
  mode: 'play' | 'tutorial',
  play: (room: RoomView) => Promise<void>,
) {
  await attachPreviewAccess(page);
  await page.goto(`/games/${game}`);
  if (mode === 'tutorial')
    await page.getByRole('button', { name: 'Rules & tutorial', exact: true }).click();
  const created = page.waitForResponse(
    (r) => r.request().method() === 'POST' && r.url().endsWith(`/games/${game}/play`),
  );
  const manifest = catalogue.find((entry) => entry.id === game)!;
  const action = mode === 'tutorial' ? 'Play tutorial' : entryAction(manifest);
  await page.getByRole('button', { name: action, exact: true }).click();
  if (mode === 'play' && manifest.bots_supported && manifest.min_players < manifest.max_players)
    await startBotTable(page);
  const response = await created;
  expect(response.ok()).toBe(true);
  const room = (await response.json()) as RoomView;
  try {
    await expect(page.getByRole('button', { name: 'Rules & tutorial', exact: true })).toBeVisible();
    const coach = page.getByRole('region', { name: 'Tutorial coach' });
    if (mode === 'tutorial') {
      await expect(coach).toBeVisible();
      await expect(page).toHaveURL(new RegExp('tutorial=' + room.match_id));
    } else {
      await expect(coach).toHaveCount(0);
      await expect(page).not.toHaveURL(/tutorial=/);
    }
    await play(room);
  } finally {
    if ((await roomAs(page, room.id)).status === 'playing') {
      expect((await requestAs(page, `rooms/${room.id}/abandon`, 'POST')).ok()).toBe(true);
    }
    expect((await requestAs(page, `rooms/${room.id}/leave`, 'POST')).ok()).toBe(true);
    expect((await requestAs(page, `rooms/${room.id}`)).status()).toBe(404);
  }
}

test('all games group optional tutorials and illustrated rules without starting a session', async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await attachPreviewAccess(page);
  if (info.project.name === 'phone') await page.setViewportSize({ width: 320, height: 640 });
  const writes: string[] = [];
  page.on('request', (r) => {
    const path = new URL(r.url()).pathname;
    if (
      path === '/api/dev-session' ||
      (!['GET', 'HEAD', 'OPTIONS'].includes(r.method()) &&
        (path.startsWith('/api/') || path.includes('/auth/')))
    )
      writes.push(path);
  });
  for (const game of catalogue) {
    await page.goto(`/games/${game.id}`);
    const disclosure = page.getByRole('button', { name: 'Rules & tutorial', exact: true });
    const tutorial = page.getByRole('button', { name: 'Play tutorial', exact: true });
    await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    await expect(disclosure).toBeInViewport({ ratio: 1 });
    await expect(tutorial).toBeHidden();
    await disclosure.click();
    await expect(disclosure).toHaveAttribute('aria-expanded', 'true');
    const rules = page.getByRole('article', { name: `${game.name} rulebook`, exact: true });
    await expect(rules.getByRole('button', { name: 'Play tutorial', exact: true })).toBeVisible();
    await expect(rules.getByRole('heading', { name: 'In pictures', exact: true })).toBeVisible();
    await expect(
      rules.getByRole('heading', { name: 'Rules reference', exact: true }),
    ).toBeVisible();
    for (const rule of game.rules) await expect(rules).toContainText(rule);
    await expect(rules.getByRole('img')).toHaveCount(3);
    for (const picture of await rules.getByRole('img').all()) {
      await expect(picture).toBeVisible();
      await expect(picture).toHaveAccessibleName(/\S/);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (game.id === 'boop') {
      await rules.scrollIntoViewIfNeeded();
      await page.screenshot({ path: info.outputPath('illustrated-boop.png') });
    }
    await disclosure.click();
    await expect(disclosure).toHaveAttribute('aria-expanded', 'false');
    await expect(tutorial).toBeHidden();
  }
  expect(writes).toEqual([]);
});

for (const game of ['four-in-a-row', 'tarot']) {
  test(`normal ${game} can turn the tutorial on and off in the same saved match`, async ({
    page,
  }) => {
    await withMatch(page, game, 'play', async (room) => {
      const coach = page.getByRole('region', { name: 'Tutorial coach' });
      const open = page.getByRole('button', { name: 'Rules & tutorial', exact: true });
      const dialog = page.getByRole('dialog');
      const toggle = dialog.getByRole('switch', { name: 'Step-by-step tutorial', exact: true });
      const ordinaryAction = game === 'tarot' ? /^Face-down card 1 of / : /^Drop in column 4$/;
      await expect(page.getByRole('button', { name: ordinaryAction })).toBeEnabled();
      const before = await roomAs(page, room.id);
      let tutorialUrl: string;
      for (const enable of [true, false, true]) {
        await open.click();
        await expect(dialog.getByRole('heading', { name: 'Rules reference' })).toBeVisible();
        await expect(toggle).toBeChecked({ checked: !enable });
        await toggle.click();
        await expect(toggle).toBeChecked({ checked: enable });
        await dialog.getByRole('button', { name: 'Close dialog' }).click();
        await expect(coach).toBeVisible({ visible: enable });
        if (enable) {
          await expect(page).toHaveURL(new RegExp('tutorial=' + room.match_id));
          tutorialUrl = page.url();
          await page.reload();
        } else {
          await expect(page).not.toHaveURL(/tutorial=/);
          // Opening an earlier saved tutorial link respects the player's later Off choice.
          await page.goto(tutorialUrl!);
        }
        await expect(open).toBeVisible();
        await expect(coach).toBeVisible({ visible: enable });
      }
      const after = await roomAs(page, room.id);
      expect(after.match_id).toBe(before.match_id);
      expect(after.match_version).toBe(before.match_version);
    });
  });
}

test('play beyond three real moves with a bot, resume the saved guide and continue the same game', async ({
  page,
}, info) => {
  await withMatch(page, 'four-in-a-row', 'tutorial', async (room) => {
    const coach = page.getByRole('region', { name: 'Tutorial coach' });
    expect(room.members.filter((member) => member.is_bot)).toHaveLength(1);
    for (let step = 1; step <= 4; step++) {
      await expect(coach).toContainText(step <= 3 ? `Guided move ${step} of 3` : 'Guided move 4');
      if (step === 4) {
        await expect(coach.getByRole('button', { name: 'Finish tutorial' })).toBeVisible();
        await page.reload();
        await expect(coach).toContainText('Guided move 4');
      }
      const before = await roomAs(page, room.id);
      const selfMoves = (before.activity ?? []).filter(
        (move) => move.actor_id === room.owner_id,
      ).length;
      // Start through the teaching card, then use the normal board control for the same lesson.
      const surface = step === 2 ? page.locator('#tutorial-game-table') : coach;
      await surface
        .getByRole('button', { name: /^Drop in column /i })
        .first()
        .click();
      await expect
        .poll(
          async () =>
            ((await roomAs(page, room.id)).activity ?? []).filter(
              (move) => move.actor_id === room.owner_id,
            ).length,
        )
        .toBe(selfMoves + 1);
      if (step === 1) {
        await expect
          .poll(async () =>
            ((await roomAs(page, room.id)).activity ?? []).some((move) =>
              room.members.some((member) => member.is_bot && member.id === move.actor_id),
            ),
          )
          .toBe(true);
        await expect(coach.locator('.turn-coach__feedback')).toBeVisible();
        await page.reload();
        await expect(coach).toContainText('Guided move 2 of 3');
        await coach.getByRole('button', { name: 'Illustrated rules' }).click();
        await expect(page.getByRole('dialog').getByRole('img')).toHaveCount(3);
        await page.getByRole('button', { name: 'Close dialog' }).click();
        await coach.scrollIntoViewIfNeeded();
        await page.screenshot({ path: info.outputPath('saved-bot-lesson.png') });
      }
    }
    await coach.getByRole('button', { name: 'Finish tutorial' }).click();
    await expect(coach).toHaveCount(0);
    await expect(page).not.toHaveURL(/tutorial=/);
    await page.reload();
    await expect(page.locator('.room-table-frame')).toBeVisible();
    await expect(coach).toHaveCount(0);
    expect((await roomAs(page, room.id)).match_id).toBe(room.match_id);
  });
});

test('solo Tarot guides three real picks and leaves the reading and birth details optional', async ({
  page,
}) => {
  let generations = 0;
  await page.route('**/api/backend/v1/rooms/*/reading', async (route) => {
    if (route.request().method() === 'POST') {
      generations++;
      await route.abort();
    } else await route.continue();
  });
  await withMatch(page, 'tarot', 'tutorial', async (room) => {
    expect(room.members).toHaveLength(1);
    const coach = page.getByRole('region', { name: 'Tutorial coach' });
    const tip = page.getByRole('complementary', { name: 'Tutorial tip' });
    const firstCard = page.getByRole('button', { name: /^Face-down card 1 of / });
    const touchCard = () =>
      test.info().project.use.hasTouch ? firstCard.tap() : firstCard.click();
    await page.setViewportSize({ width: 320, height: 640 });
    await coach.getByRole('button', { name: 'Illustrated rules' }).click();
    const rulebook = page.getByRole('dialog');
    const example = rulebook.getByRole('img', {
      name: /A face-down card comes up above its neighbour/,
    });
    const backs = example.locator('.tarot-card--back');
    await expect(backs).toHaveCount(2);
    const covered = (await backs.first().boundingBox())!;
    const lifted = (await backs.last().boundingBox())!;
    expect(lifted.y).toBeLessThan(covered.y);
    expect(lifted.x).toBeLessThan(covered.x + covered.width);
    await expect(rulebook).toContainText('One tap turns it over');
    await rulebook.getByRole('button', { name: 'Close dialog' }).click();
    await coach.getByRole('link', { name: 'Go to cards' }).click();
    await expect(firstCard).toBeFocused();
    expect((await roomAs(page, room.id)).match_version).toBe(room.match_version);
    const scrollToTable = () =>
      page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await scrollToTable();
    await expect(tip).toBeInViewport();
    await expect(tip).toContainText('Pick your first card');
    await tip.getByRole('button', { name: 'Back to full guide' }).click();
    await expect(coach).toBeFocused();
    await expect(tip).toHaveCount(0);
    for (let step = 1; step <= 3; step++) {
      await expect(coach).toContainText(`Card ${step} of 3`);
      await expect(coach).toContainText(/tap/i);
      await coach.getByRole('link', { name: 'Go to cards' }).click();
      await expect(firstCard).toBeFocused();
      // One tap or click reveals the card. The deck drops the rest of a tap burst for
      // 400ms after a draw; a script is faster than a person, so wait that window out.
      await page.waitForTimeout(450);
      await touchCard();
      await expect
        .poll(async () => (await roomAs(page, room.id)).game!.community!.length)
        .toBe(step);
      if (step === 1) {
        await scrollToTable();
        await expect(tip).toBeInViewport();
        await expect(tip).toContainText('Where you are');
        await expect(tip).toContainText('Pick your second card');
        const drawn = (await roomAs(page, room.id)).game!.community![0];
        await expect(tip).toContainText(drawn.label);
        await expect(tip).not.toContainText(await coach.locator('.turn-coach__body p').innerText());
        expect(await tip.evaluate((n) => n.scrollHeight <= n.clientHeight + 1)).toBe(true);
        // Return by scrolling as well as via the shortcut. A stale observation
        // must not leave the compact hint on top of the full explanation.
        await coach.evaluate((n) => n.scrollIntoView({ block: 'center' }));
        await expect(coach).toBeInViewport();
        await expect(tip).toHaveCount(0);
        await scrollToTable();
        await expect(tip).toBeInViewport();
        await page
          .getByRole('button', { name: 'Rules & tutorial', exact: true })
          .evaluate((node) => (node as HTMLButtonElement).click());
        await expect(page.getByRole('dialog')).toBeVisible();
        await expect(page.locator('.turn-coach-float')).toBeHidden();
        await page.getByRole('button', { name: 'Close dialog' }).click();
        await scrollToTable();
        await expect(tip).toBeInViewport();
        await page.screenshot({ path: test.info().outputPath('floating-turn-rule.png') });
        await tip.getByRole('button', { name: 'Hide floating tip' }).click();
        await expect(tip).toHaveCount(0);
        await page.reload();
      } else if (step === 2) {
        await scrollToTable();
        await expect(tip).toContainText('Pick your third card');
      }
    }
    await expect(coach).toContainText('Your spread is ready');
    await scrollToTable();
    await expect(tip).toHaveCount(0);
    await coach.scrollIntoViewIfNeeded();
    await expect(tip).toHaveCount(0);
    await page.reload();
    await expect(coach).toContainText('Your spread is ready');
    await coach.getByRole('button', { name: 'Continue to spread' }).click();
    await expect(coach).toHaveCount(0);
    expect(generations).toBe(0);
  });
});
