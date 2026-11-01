import { expect, test } from '@playwright/test';
import { requestAs, roomAs } from './helpers';

for (const [game, count] of [
  ['Four in a Row', 2],
  ['Reversi', 2],
  ['Word Agents', 4],
  ['Gem Market', 2],
] as const) {
  test(`${game}: independent players use the table controls`, async ({
    page,
    browser,
    baseURL,
  }) => {
    const contexts = await Promise.all(
      Array.from({ length: count - 1 }, () =>
        browser.newContext({
          baseURL,
          viewport: page.viewportSize()!,
        }),
      ),
    );
    const players = [page, ...(await Promise.all(contexts.map((context) => context.newPage())))];
    let id: string | undefined;
    try {
      await page.goto('/');
      await page.getByRole('button', { name: `Create ${game} room`, exact: true }).click();
      await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Expansion Host');
      await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption(String(count));
      await page.getByRole('button', { name: 'Create room', exact: true }).click();
      await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
      id = new URL(page.url()).pathname.split('/').at(-1)!;
      const code = await page.locator('.room-code').innerText();
      for (const [index, friend] of players.slice(1).entries()) {
        await friend.goto('/');
        await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
        await friend
          .getByRole('textbox', { name: 'Your name', exact: true })
          .fill(`Expansion Friend ${index + 1}`);
        await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
        await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
        await expect(friend).toHaveURL(page.url());
      }
      for (const player of players)
        await player.getByRole('button', { name: 'I’m ready', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeEnabled();
      await page.getByRole('button', { name: 'Start game', exact: true }).click();
      await expect.poll(async () => (await roomAs(page, id!)).status).toBe('playing');
      const initial = await roomAs(page, id);
      if (game === 'Four in a Row') {
        for (let move = 0; move < 7; move++) {
          const actor = players[move % 2];
          await expect(
            actor.getByRole('button', { name: `Drop in column ${(move % 2) + 1}`, exact: true }),
          ).toBeEnabled();
          await actor
            .getByRole('button', { name: `Drop in column ${(move % 2) + 1}`, exact: true })
            .click();
          await expect
            .poll(async () => (await roomAs(page, id!)).match_version)
            .toBe(initial.match_version! + move + 1);
        }
        expect((await roomAs(page, id)).status).toBe('finished');
        await expect(
          page.getByRole('button', { name: 'Start rematch', exact: true }),
        ).toBeVisible();
      } else if (game === 'Word Agents') {
        const active = Number(initial.game!.detail.active_team);
        const master = players[active];
        const operative = players[active + 2];
        const key = await roomAs(master, id);
        const hidden = await roomAs(operative, id);
        expect(hidden.game!.community.every((card) => card.color === 'unknown')).toBe(true);
        expect(key.game!.community.every((card) => card.color !== 'unknown')).toBe(true);
        await master
          .getByRole('textbox', { name: 'Your one-word clue', exact: true })
          .fill('Galactic');
        await master.getByRole('button', { name: 'Give clue', exact: true }).click();
        const card = key.game!.community.find(
          (card) => card.color === (active === 0 ? 'coral' : 'blue'),
        )!;
        await expect(
          operative.getByRole('button', { name: card.label, exact: true }),
        ).toBeEnabled();
        await operative.getByRole('button', { name: card.label, exact: true }).click();
        await operative.getByRole('button', { name: `Confirm ${card.label}`, exact: true }).click();
        await expect
          .poll(
            async () =>
              (await roomAs(operative, id!)).game!.community.filter(
                (card) => card.subtitle === 'revealed',
              ).length,
          )
          .toBe(1);
      } else if (game === 'Gem Market') {
        for (const color of ['pearl', 'sapphire', 'ruby'])
          await page.getByRole('button', { name: `Select ${color}`, exact: true }).click();
        await expect(
          page.getByRole('button', { name: 'Take selected gems', exact: true }),
        ).toBeEnabled();
        await page.getByRole('button', { name: 'Take selected gems', exact: true }).click();
      } else {
        const decision = initial.game!.actions[0];
        await page.getByRole('button', { name: decision.label, exact: true }).click();
        await expect
          .poll(
            async () =>
              (await roomAs(page, id!)).game!.community.filter((card) => card.value === '1').length,
          )
          .toBe(4);
      }
      await expect
        .poll(async () => (await roomAs(page, id!)).match_version)
        .toBeGreaterThan(initial.match_version!);
      await page.reload();
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
    } finally {
      if (id) {
        const current = await roomAs(page, id);
        if (current.status === 'playing') await requestAs(page, `rooms/${id}/abandon`, 'POST');
        for (const player of players) await requestAs(player, `rooms/${id}/leave`, 'POST');
      }
      await Promise.all(contexts.map((context) => context.close()));
    }
  });
}
