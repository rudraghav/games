import { expect, test } from '@playwright/test';
import { attachPreviewAccess, startBotTable, requestAs, roomAs, type RoomView } from './helpers';

test.use({ reducedMotion: 'reduce', trace: 'off', screenshot: 'off' });

for (const game of ['deal', 'deal-no-mercy']) {
  test(`${game} preserves a failed card decision until the move is saved`, async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'phone', 'Exercises the phone decision panel.');
    test.skip(
      Boolean(process.env.GAMES_TEST_URL) && process.env.GAMES_MARKET_DEAL_LIVE !== '1',
      'Hosted checks create a private QA game.',
    );
    await page.setViewportSize({ width: 320, height: 640 });
    await attachPreviewAccess(page);
    await page.goto('/games/' + game);
    const launch = page.waitForResponse(
      (r) =>
        r.request().method() === 'POST' &&
        new URL(r.url()).pathname.endsWith('/games/' + game + '/play'),
    );
    await page.getByRole('button', { name: 'Play with bots', exact: true }).click();
    await startBotTable(page);
    const response = await launch;
    expect(response.status()).toBe(200);
    const initial: RoomView = await response.json();
    try {
      const match = initial.game!;
      const move =
        match.actions.find((option) => option.action.type === 'bank') ??
        match.actions.find((option) => option.action.type === 'property')!;
      const index = match.hand.findIndex((card) => card.id === move.action.card);
      expect(index).toBeGreaterThanOrEqual(0);
      const panel = page.locator('.table-decision-panel');
      const card = page.locator('.deal-hand-dock .card-hand button.playing-card').nth(index);
      const cash = move.action.type === 'bank' && match.hand[index].subtitle === 'MONEY';
      if (!cash) await card.click();
      const commit = cash
        ? card
        : move.action.type === 'bank'
          ? panel.getByRole('button', { name: /^Bank for/ })
          : panel.locator('.deal-choice-list[data-mode="action"] button').first();
      await expect(commit).toBeEnabled();
      const path = '/rooms/' + initial.id + '/actions';
      const onMove = () =>
        page.waitForResponse(
          (r) => r.request().method() === 'POST' && new URL(r.url()).pathname.endsWith(path),
        );
      // Fail this browser's request before it reaches the room service.
      await page.route(
        '**' + path,
        (route) =>
          route.fulfill({
            status: 503,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Try again.' }),
          }),
        { times: 1 },
      );
      const failed = onMove();
      await commit.click();
      expect((await failed).status()).toBe(503);
      await expect(page.locator('.room-error')).toBeVisible();
      await expect(commit).toBeEnabled();
      const unchanged = await roomAs(page, initial.id);
      expect(unchanged.match_version).toBe(initial.match_version);
      expect(unchanged.game?.hand).toEqual(match.hand);
      await page.reload();
      await expect(commit).toBeEnabled();
      const success = onMove();
      await commit.click();
      const accepted = await success;
      expect(accepted.status()).toBe(200);
      const saved: RoomView = await accepted.json();
      expect(saved.match_version).toBe(initial.match_version! + 1);
      expect(saved.game!.hand.some((c) => c.id === move.action.card)).toBe(false);
      const owner = saved.game!.players.find((p) => p.id === saved.owner_id)!;
      const destination =
        move.action.type === 'bank' ? owner.bank : Object.values(owner.properties || {}).flat();
      expect(destination?.filter((c) => c.id === move.action.card)).toHaveLength(1);
      await expect(panel).toHaveCount(0);
      await page.reload();
      expect((await roomAs(page, initial.id)).match_version).toBe(saved.match_version);
      await expect(page.locator('.deal-hand-dock .playing-card--selected')).toHaveCount(0);
    } finally {
      const current = await roomAs(page, initial.id);
      if (current.status === 'playing')
        expect((await requestAs(page, 'rooms/' + initial.id + '/abandon', 'POST')).status()).toBe(
          200,
        );
      expect((await requestAs(page, 'rooms/' + initial.id + '/leave', 'POST')).status()).toBe(200);
      expect((await requestAs(page, 'rooms/' + initial.id)).status()).toBe(404);
    }
  });
}
