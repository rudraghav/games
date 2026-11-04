import { expect, test, type Page } from '@playwright/test';
import { partyDetails } from '../../packages/api-client/src/party-details';
import { attachPreviewAccess, openRoomOptions, requestAs, roomAs } from './helpers';

// One shared room, three identities and a second host tab cover all party modes.
// Trace/screenshot output stays off because a party choice can be private.
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

async function receiveLatest(page: Page) {
  // Exercise the existing reconnection heartbeat without reloading the local draft.
  await page.evaluate(() => window.dispatchEvent(new Event('online')));
}

test('party drafts survive same-prompt updates but never carry into a new prompt across tabs', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.setTimeout(240000);
  const contexts = await Promise.all(
    Array.from({ length: 2 }, () =>
      browser.newContext({ baseURL, viewport: page.viewportSize()!, reducedMotion: 'reduce' }),
    ),
  );
  const friends = await Promise.all(contexts.map((context) => context.newPage()));
  const players = [page, ...friends];
  const sibling = await page.context().newPage();
  for (const actor of [...players, sibling]) actor.setDefaultTimeout(15000);
  let roomId: string | undefined;
  const joined: Page[] = [];
  try {
    for (const actor of [...players, sibling]) await attachPreviewAccess(actor);
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Hot Seat room', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill(`Recovery host ${info.project.name}`);
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('3');
    await openRoomOptions(page);
    await page
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill(`Party recovery verification ${info.project.name}`);
    const creation = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/backend/v1/rooms') && response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    const created = await creation;
    expect(created.status()).toBe(201);
    roomId = (await created.json()).id as string;
    await expect(page).toHaveURL(new RegExp(`/rooms/${roomId}$`));
    const code = await page.locator('.room-code').innerText();
    for (const [index, friend] of friends.entries()) {
      await friend.goto('/');
      await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
      await friend
        .getByRole('textbox', { name: 'Your name', exact: true })
        .fill(`Recovery friend ${index + 1}`);
      await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
      const joining = friend.waitForResponse(
        (response) =>
          response.url().endsWith('/rooms/join') && response.request().method() === 'POST',
      );
      await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
      expect((await joining).status()).toBe(200);
      joined.push(friend);
      await expect(friend).toHaveURL(page.url());
    }
    await sibling.goto(page.url());
    const identities = await Promise.all(
      players.map(
        async (actor) => (await (await requestAs(actor, 'me')).json()).profile.id as string,
      ),
    );
    const hostId = identities[0];
    expect((await (await requestAs(sibling, 'me')).json()).profile.id).toBe(hostId);

    async function submit(actor: Page, label: RegExp) {
      const before = await roomAs(actor, roomId!);
      const data = partyDetails(before.game!.detail);
      await receiveLatest(actor);
      await expect(actor.locator('.party-table__topline')).toContainText(
        `Round ${data.round} of 6`,
      );
      if (data.mode !== 'spill-or-chill')
        await expect(actor.locator('.party-decisions')).toContainText(
          `${data.submitted.length} of 3 locked in`,
        );
      await actor
        .locator('.party-choice')
        .filter({ has: actor.locator('.party-choice__label').filter({ hasText: label }) })
        .click();
      const response = actor.waitForResponse(
        (result) =>
          result.url().endsWith(`/rooms/${roomId}/actions`) && result.request().method() === 'POST',
      );
      await actor.locator('.party-commit').click();
      const result = await response;
      expect(result.status()).toBe(200);
      const after = await result.json();
      expect(after.match_version).toBe(before.match_version! + 1);
      return after;
    }

    async function nextPrompt(actor: Page, round: number) {
      await receiveLatest(actor);
      const next = actor.getByRole('button', { name: 'Next prompt', exact: true });
      await expect(next).toBeEnabled();
      const response = actor.waitForResponse(
        (result) =>
          result.url().endsWith(`/rooms/${roomId}/actions`) && result.request().method() === 'POST',
      );
      await next.click();
      expect((await response).status()).toBe(200);
      await receiveLatest(page);
      await expect(page.locator('.party-table__topline')).toContainText(`Round ${round} of 6`);
    }

    for (const mode of ['hot-seat', 'most-likely', 'spill-or-chill'] as const) {
      if (mode !== 'hot-seat') {
        expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
        expect(
          (
            await requestAs(page, `rooms/${roomId}/settings`, 'PUT', {
              game_id: mode,
              capacity: 3,
              settings: {},
            })
          ).status(),
        ).toBe(200);
      }
      for (const actor of players) {
        expect((await requestAs(actor, `rooms/${roomId}/heartbeat`, 'POST')).status()).toBe(200);
        expect(
          (await requestAs(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true })).status(),
        ).toBe(200);
      }
      expect((await requestAs(page, `rooms/${roomId}/start`, 'POST')).status()).toBe(200);
      await receiveLatest(page);
      await expect(page.locator('.party-table')).toHaveAttribute('data-mode', mode);
      await expect(page.locator('.party-table__topline')).toContainText('Round 1 of 6');
      if (mode === 'spill-or-chill') {
        // Match starters rotate. Reach this identity's spotlight using legal turns.
        for (let rotations = 0; rotations < players.length; rotations++) {
          const data = partyDetails((await roomAs(page, roomId)).game!.detail);
          if (data.spotlight === hostId) break;
          const actor = players[identities.indexOf(data.spotlight)];
          await submit(actor, /^Pass/);
          await nextPrompt(actor, data.round + 1);
        }
        expect(partyDetails((await roomAs(page, roomId)).game!.detail).spotlight).toBe(hostId);
      }
      const draftLabel =
        mode === 'hot-seat' ? /^A ·/ : mode === 'most-likely' ? /^Recovery friend 1$/ : /^Spill ·/;
      const draft = page
        .locator('.party-choice')
        .filter({ has: page.locator('.party-choice__label').filter({ hasText: draftLabel }) });
      await draft.click();
      await expect(draft).toHaveAttribute('aria-pressed', 'true');
      const versionBeforeInspect = (await roomAs(page, roomId)).match_version;
      if (mode !== 'spill-or-chill') await submit(friends[0], /^Pass/);
      await receiveLatest(page);
      if (mode !== 'spill-or-chill')
        await expect(page.locator('.party-decisions')).toContainText('1 of 3 locked in');
      await expect(draft).toHaveAttribute('aria-pressed', 'true');
      await expect(page.locator('.party-commit')).toBeEnabled();
      expect((await roomAs(page, roomId)).match_version).toBe(
        versionBeforeInspect! + (mode === 'spill-or-chill' ? 0 : 1),
      );

      // The same identity commits a different answer in another tab.
      await submit(sibling, /^Pass/);
      await receiveLatest(page);
      if (mode !== 'spill-or-chill') {
        await expect(page.locator('.party-locked')).toContainText('Your choice: Passed');
        expect(partyDetails((await roomAs(page, roomId)).game!.detail).ownChoice).toBe('pass');
        await submit(friends[1], /^Pass/);
      }
      await receiveLatest(page);
      await expect(page.locator('.party-reveal')).toBeVisible();
      const revealed = partyDetails((await roomAs(page, roomId)).game!.detail);
      const advancing =
        revealed.spotlight === hostId ? sibling : players[identities.indexOf(revealed.spotlight)];
      await nextPrompt(advancing, revealed.round + 1);
      if (mode === 'spill-or-chill') {
        // Only the spotlight can answer. Rotate back to this identity's next turn.
        for (let rotations = 0; rotations < players.length; rotations++) {
          const data = partyDetails((await roomAs(page, roomId)).game!.detail);
          if (data.spotlight === hostId) break;
          const actor = players[identities.indexOf(data.spotlight)];
          await submit(actor, /^Pass/);
          await nextPrompt(actor, data.round + 1);
        }
        expect(partyDetails((await roomAs(page, roomId)).game!.detail).spotlight).toBe(hostId);
      }
      await expect(page.locator('.party-choice[aria-pressed="true"]')).toHaveCount(0);
      await expect(
        page.getByRole('button', { name: 'Lock in my choice', exact: true }),
      ).toBeDisabled();
      expect(partyDetails((await roomAs(page, roomId)).game!.detail).ownChoice).toBeNull();
      // The new prompt requires and saves a fresh, deliberate choice.
      await submit(page, /^Pass/);
      const saved = await roomAs(page, roomId);
      const savedChoice = partyDetails(saved.game!.detail);
      expect(savedChoice.ownChoice).toBe('pass');
      await page.reload();
      if (savedChoice.result) await expect(page.locator('.party-reveal')).toBeVisible();
      else await expect(page.locator('.party-locked')).toContainText('Your choice: Passed');
      const refreshed = await roomAs(page, roomId);
      expect(refreshed.match_version).toBe(saved.match_version);
      expect(partyDetails(refreshed.game!.detail).ownChoice).toBe('pass');
    }
  } finally {
    try {
      if (roomId) {
        const current = await roomAs(page, roomId);
        if (current.status === 'playing')
          expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
        for (const friend of joined)
          expect((await requestAs(friend, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
        expect((await requestAs(page, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
        for (const actor of [page, ...joined])
          expect((await requestAs(actor, `rooms/${roomId}`)).status()).toBe(404);
      }
    } finally {
      await sibling.close();
      await Promise.all(contexts.map((context) => context.close()));
    }
  }
});
