import { expect, test, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { requestAs, roomAs } from './helpers';

for (const [id, name] of [
  ['spill-or-chill', 'Spill or Chill'],
  ['most-likely', 'Most Likely'],
  ['hot-seat', 'Hot Seat'],
] as const) {
  test(`${name}: choices lock, reveal together and survive refresh`, async ({
    page,
    browser,
    baseURL,
  }) => {
    const contexts = await Promise.all(
      Array.from({ length: 2 }, () =>
        browser.newContext({ baseURL, viewport: page.viewportSize()! }),
      ),
    );
    const players = [page, ...(await Promise.all(contexts.map((context) => context.newPage())))];
    let roomId: string | undefined;
    try {
      await page.goto('/');
      await page.getByRole('button', { name: `Create ${name} room`, exact: true }).click();
      await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Party Host');
      await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('3');
      await page.getByRole('button', { name: 'Create room', exact: true }).click();
      await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
      roomId = new URL(page.url()).pathname.split('/').at(-1)!;
      const code = await page.locator('.room-code').innerText();
      for (const [i, friend] of players.slice(1).entries()) {
        await friend.goto('/');
        await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
        await friend
          .getByRole('textbox', { name: 'Your name', exact: true })
          .fill(`Party Friend ${i + 1}`);
        await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
        await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
        await expect(friend).toHaveURL(page.url());
      }
      for (const player of players)
        await player.getByRole('button', { name: 'I’m ready', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeEnabled();
      await page.getByRole('button', { name: 'Start game', exact: true }).click();
      await expect(page.locator('.party-table')).toBeVisible();
      expect((await roomAs(page, roomId)).game!.detail.sip_prompts).toBe(false);

      async function choose(actor: Page, text: string) {
        const snapshot = await roomAs(actor, roomId!);
        const before = snapshot.match_version!;
        // Independent pages synchronize asynchronously. Wait for the same visible
        // submission count before clicking, rather than retrying a stale mutation.
        if (id !== 'spill-or-chill') {
          const submitted = snapshot.game!.detail.submitted;
          expect(Array.isArray(submitted)).toBe(true);
          await expect(actor.locator('.party-decisions')).toContainText(
            `${(submitted as string[]).length} of 3 locked in`,
          );
        }
        await actor.locator('.party-choice').filter({ hasText: text }).click();
        await actor.getByRole('button', { name: 'Lock in my choice', exact: true }).click();
        await expect
          .poll(async () => (await roomAs(actor, roomId!)).match_version!)
          .toBe(before + 1);
      }

      if (id === 'spill-or-chill') {
        await expect(
          players[1].getByRole('button', { name: 'Lock in my choice', exact: true }),
        ).toHaveCount(0);
        await choose(page, 'Share · I answered aloud');
        expect((await roomAs(page, roomId)).game!.players[0].score).toBe(1);
      } else if (id === 'most-likely') {
        await choose(page, 'Party Friend 1');
        const hidden = (await roomAs(players[1], roomId)).game!.detail;
        expect(hidden.result).toBeNull();
        expect(hidden.own_choice).toBeNull();
        await expect(page.locator('.party-locked')).toBeVisible();
        // Another player's decision can arrive before the nominal next seat.
        await choose(players[2], 'Party Host');
        await choose(players[1], 'Party Host');
        expect((await roomAs(page, roomId)).game!.players[0].score).toBe(1);
      } else {
        await choose(page, 'A ·');
        const hidden = (await roomAs(players[1], roomId)).game!.detail;
        expect(hidden.result).toBeNull();
        expect(hidden.own_choice).toBeNull();
        await choose(players[2], 'B ·');
        await choose(players[1], 'A ·');
        expect((await roomAs(page, roomId)).game!.players[1].score).toBe(1);
      }
      for (const player of players) await expect(player.locator('.party-reveal')).toBeVisible();
      if (process.env.GAMES_PARTY_CAPTURE === '1') {
        await mkdir('output/playwright/party-live-captures-2026-11-01', { recursive: true });
        await page.locator('.table-layout').screenshot({
          path: `output/playwright/party-live-captures-2026-11-01/${id}-${test.info().project.name}.png`,
        });
      }
      await page.getByRole('button', { name: 'Next prompt', exact: true }).click();
      await expect.poll(async () => (await roomAs(page, roomId!)).game!.detail.round).toBe(2);
      await players[1].reload();
      await expect(players[1].locator('.party-table__topline')).toContainText('Round 2 of 6');
      for (const player of players) {
        await expect
          .poll(() => player.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
          .toBe(true);
      }
    } finally {
      if (roomId) {
        const current = await roomAs(page, roomId);
        if (current.status === 'playing') await requestAs(page, `rooms/${roomId}/abandon`, 'POST');
        for (const player of players.slice(1))
          await requestAs(player, `rooms/${roomId}/leave`, 'POST');
        await requestAs(page, `rooms/${roomId}/leave`, 'POST');
      }
      await Promise.all(contexts.map((context) => context.close()));
    }
  });
}
