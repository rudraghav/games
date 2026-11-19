import { expect, type Page, type TestInfo } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import { mapRoom } from '../../packages/api-client/src/mappers';
import { describeMove } from '../../apps/web/src/features/room/move-description';
import { practiceDirection } from '../../apps/web/src/shared/tutorial/coach-state';
import { attachPreviewAccess, requestAs, roomAs, type RoomView } from './helpers';

export type TutorialDriver = (page: Page, before: RoomView, step: number) => Promise<void>;

/** The account, match and every learner move are created through the mobile UI.
 * Read the participant's own projection to distinguish a saved turn from a local selection. */
export async function runTutorial(
  page: Page,
  gameId: string,
  info: TestInfo,
  driver: TutorialDriver,
  replay = 0,
) {
  const artifact = (file: string) => info.outputPath(replay ? `replay-${replay}-${file}` : file);
  const steps: {
    phase: string;
    offered: string[];
    hint: string;
    explanation: string;
    actions: string[];
    feedback: string;
    botActions: string[];
  }[] = [];
  await attachPreviewAccess(page);
  await page.goto('/games/' + gameId);
  await page.getByRole('button', { name: 'Rules & tutorial', exact: true }).click();
  const book = page.locator('.game-entry-rules .game-rulebook');
  const pictures = await book
    .getByRole('img')
    .evaluateAll((nodes) => nodes.map((n) => n.getAttribute('aria-label')));
  const captions = await book.locator('figcaption').allTextContents();
  expect(pictures).toHaveLength(3);
  expect(captions).toHaveLength(3);
  expect(pictures.every(Boolean)).toBe(true);
  const creation = page.waitForResponse(
    (r) => r.request().method() === 'POST' && r.url().endsWith('/games/' + gameId + '/play'),
  );
  await book.getByRole('button', { name: 'Play tutorial', exact: true }).click();
  const created = await creation;
  expect(created.ok()).toBe(true);
  const room: RoomView = await created.json();
  const coach = page.getByRole('region', { name: 'Tutorial coach' });
  // A two-player Azul round uses twenty tiles. Follow it through scoring so the
  // transition is covered even when small drafts take more than six decisions.
  const targetSteps = gameId === 'azul' ? 22 : gameId === 'tarot' ? 3 : 6;
  let reachedSecondRound = false;
  let finished = false;
  let closed = false;
  let generationRequests = 0;
  let completed = false;
  const botActions = new Set<string>();
  page.on('request', (r) => {
    if (r.method() === 'POST' && new URL(r.url()).pathname.endsWith('/reading'))
      generationRequests++;
  });
  const snapshot = () => roomAs(page, room.id);
  try {
    expect(room.game_id).toBe(gameId);
    expect(room.members.filter((m) => !m.is_bot)).toHaveLength(1);
    await expect(coach).toBeVisible();
    for (let i = 1; i <= targetSteps; i++) {
      await expect
        .poll(
          async () => {
            const s = await snapshot();
            return s.status === 'finished' || Boolean(s.game?.actions.length);
          },
          { timeout: 60000 },
        )
        .toBe(true);
      const before = await snapshot();
      if (before.status === 'finished') {
        finished = true;
        break;
      }
      const game = before.game!;
      await expect(coach).toHaveAttribute('data-state', 'playing');
      const action = coach.locator('.turn-coach__action');
      const readHint = async () =>
        (
          (await coach.locator('.turn-coach__body h2').allTextContents())[0] ??
          (await action.innerText())
        ).trim();
      if (gameId !== 'tarot') {
        const projection = mapRoom(before).game!;
        const offeredTitles = projection.actions.map((o) => practiceDirection(o, projection).title);
        await expect.poll(async () => offeredTitles.includes(await readHint())).toBe(true);
      }
      const hint = await readHint();
      const explanation =
        (await coach.locator('.turn-coach__body p').allTextContents()).at(-1) ?? '';
      expect(hint.trim()).not.toBe('');
      const version = before.match_version!;
      const ownSince = (s: RoomView) =>
        (s.activity ?? []).filter((m) => m.actor_id === room.owner_id && m.version > version);
      await driver(page, before, i);
      await expect
        .poll(
          async () => {
            const s = await snapshot();
            return gameId === 'tarot'
              ? s.game!.community.length > game.community.length
              : ownSince(s).length > 0;
          },
          { timeout: 18000 },
        )
        .toBe(true);
      const after = await snapshot();
      const committed = ownSince(after).map((m) => m.type);
      if (gameId !== 'tarot')
        expect(game.actions.map((a) => a.action.type)).toContain(committed[0]);
      const feedback = coach.locator('.turn-coach__feedback');
      await expect(feedback).toBeVisible();
      if (gameId === 'tarot') {
        await expect(feedback).toContainText(after.game!.community.at(-1)!.label);
      } else {
        const saved = mapRoom(after);
        const mine = saved.activity.findLast((m) => m.actorId === saved.ownerId)!;
        await expect(feedback.locator('strong')).toHaveText(
          describeMove(saved, mine, saved.ownerId),
        );
      }
      const reply = (after.activity ?? []).filter(
        (m) => m.actor_id !== room.owner_id && m.version > version,
      );
      for (const event of after.activity ?? [])
        if (event.actor_id !== room.owner_id) botActions.add(event.type);
      steps.push({
        phase: game.phase,
        offered: [...new Set(game.actions.map((a) => a.action.type))],
        hint: hint.trim(),
        explanation,
        actions: gameId === 'tarot' ? ['pick'] : committed,
        feedback: await feedback.innerText(),
        botActions: reply.map((m) => m.type),
      });
      if (i === 2) {
        await coach.getByRole('button', { name: 'Illustrated rules' }).click();
        const dialog = page.getByRole('dialog');
        const examples = dialog.locator('.illustrated-rules');
        await expect(examples.locator('figcaption')).toHaveText(captions);
        for (const [index, picture] of pictures.entries()) {
          await expect(examples.getByRole('img').nth(index)).toHaveAccessibleName(picture!);
        }
        await examples.screenshot({ path: artifact('worked-examples.png') });
        await dialog.getByRole('button', { name: 'Close dialog' }).click();
      }
      if (i === 3) {
        await coach.scrollIntoViewIfNeeded();
        await page.screenshot({ path: artifact('later-coach.png') });
        const table = page.locator('#tutorial-game-table');
        await table.scrollIntoViewIfNeeded();
        await page.screenshot({ path: artifact('later-table.png') });
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
          true,
        );
      }
      if (after.status === 'finished') {
        finished = true;
        break;
      }
      if (gameId === 'azul' && Number(after.game?.detail.round) >= 2) {
        reachedSecondRound = true;
        if (i >= 6) break;
      }
    }
    if (gameId === 'tarot') await expect(coach).toContainText('Your spread is ready');
    if (gameId === 'azul') expect(reachedSecondRound).toBe(true);
    expect(steps.length >= 4 || (gameId === 'tarot' && steps.length === 3) || finished).toBe(true);
    await coach
      .getByRole('button', {
        name: gameId === 'tarot' ? 'Continue to spread' : 'Finish tutorial',
        exact: true,
      })
      .click();
    await expect(coach).toHaveCount(0);
    await expect(page).not.toHaveURL(/tutorial=/);
    expect((await snapshot()).match_id).toBe(room.match_id);
    expect(generationRequests).toBe(0);
    completed = true;
  } finally {
    if ((await snapshot()).status === 'playing')
      expect((await requestAs(page, 'rooms/' + room.id + '/abandon', 'POST')).ok()).toBe(true);
    expect((await requestAs(page, 'rooms/' + room.id + '/leave', 'POST')).ok()).toBe(true);
    expect((await requestAs(page, 'rooms/' + room.id)).status()).toBe(404);
    closed = true;
    // Full captions, projected explanations and screenshots remain private test artifacts.
    await writeFile(
      artifact('summary.json'),
      JSON.stringify(
        {
          game: gameId,
          viewport: page.viewportSize(),
          completed,
          finished,
          closed,
          generationRequests,
          pictures,
          captions,
          steps,
          botActions: [...botActions],
        },
        null,
        2,
      ),
    );
  }
  return steps.length;
}
