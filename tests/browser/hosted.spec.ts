import { expect, test, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { requestAs, roomAs } from './helpers';
import type { components } from '../../packages/api-client/src/generated/schema';
import gameCatalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };

// An explicit live check, not part of routine local runs. Four guest identities
// are reused across the catalogue to respect Supabase's anonymous signup limit.
test.skip(!process.env.GAMES_TEST_URL, 'Set the exact hosted Games testing URL.');
test.use({ trace: 'off', screenshot: 'off' });

test('personal cloud: all games, private views, revisions and a saved reading', async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(600000);
  const others = await Promise.all(
    Array.from({ length: 3 }, () =>
      browser.newContext({ baseURL, viewport: { width: 390, height: 844 } }),
    ),
  );
  const players = [page, ...(await Promise.all(others.map((context) => context.newPage())))];
  let id: string | undefined;
  async function checked(player: Page, path: string, method = 'POST', data?: unknown) {
    const response = await requestAs(player, path, method, data);
    expect(response.ok(), `${method} ${path.split('/').at(-1)} status ${response.status()}`).toBe(
      true,
    );
    return response.json();
  }
  try {
    if (process.env.VERCEL_OIDC_TOKEN) {
      for (const player of players)
        await player.context().route(`${new URL(baseURL!).origin}/**`, (route) =>
          route.continue({
            headers: {
              ...route.request().headers(),
              'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN!,
            },
          }),
        );
    }
    await page.goto('/');
    await expect(page.getByRole('button', { name: /^Create .+ room$/ })).toHaveCount(
      gameCatalogue.length,
    );
    await page.getByRole('button', { name: 'Create Word Agents room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Cloud Test Host');
    await page
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill('Automated preview verification');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/, { timeout: 45000 });
    id = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    for (const [index, friend] of players.slice(1).entries()) {
      await friend.goto('/');
      await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
      await friend
        .getByRole('textbox', { name: 'Your name', exact: true })
        .fill(`Cloud Test Friend ${index + 1}`);
      await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
      await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
      await expect(friend).toHaveURL(page.url(), { timeout: 45000 });
    }
    const identities = await Promise.all(
      players.map(async (player) => (await checked(player, 'me', 'GET')).profile.id),
    );
    const catalogue: components['schemas']['GameManifest'][] = await checked(page, 'games', 'GET');
    for (const manifest of catalogue) {
      await checked(page, `rooms/${id}/settings`, 'PUT', {
        game_id: manifest.id,
        capacity: manifest.min_players,
        settings: {},
      });
      const lobby = await roomAs(page, id);
      for (const member of lobby.members.filter((member) => member.seated)) {
        const player = players[identities.indexOf(member.id)];
        await checked(player, `rooms/${id}/heartbeat`);
        await checked(player, `rooms/${id}/ready`, 'PUT', { ready: true });
      }
      const started = await checked(page, `rooms/${id}/start`);
      expect(started.game.game_id).toBe(manifest.id);
      // Unauthenticated requests never receive the personalized projection.
      const unauthorized = await page.request.get(`/api/backend/v1/rooms/${id}`, {
        headers: process.env.VERCEL_OIDC_TOKEN
          ? {
              'x-vercel-trusted-oidc-idp-token': process.env.VERCEL_OIDC_TOKEN,
            }
          : {},
        maxRedirects: 0,
      });
      expect(unauthorized.status()).toBe(401);
      await page.reload();
      await expect(page.locator('.table-announcement')).toBeVisible();
      const actor = players[identities.indexOf(started.game.current_player)];
      const view = await roomAs(actor, id);
      const options = view.game!.actions;
      const option =
        options.find((option) =>
          [
            'draw',
            'check',
            'call',
            'stand',
            'fold',
            'flip',
            'drop',
            'place',
            'take',
            'choose',
          ].includes(option.action.type),
        ) || options[0];
      expect(option).toBeTruthy();
      const action = { ...option.action };
      if (option.input === 'amount') action.amount = option.minimum ?? 0;
      if (option.input === 'cards') {
        const eligible = option.eligible_cards || [];
        action.cards = eligible.slice(0, option.maximum ?? eligible.length);
      }
      if (option.input === 'text') action.choice = 'galactic';
      const payload = {
        match_id: view.match_id,
        action_id: randomUUID(),
        expected_version: view.match_version,
        action,
      };
      const moved = await checked(actor, `rooms/${id}/actions`, 'POST', payload);
      expect(moved.match_version).toBe(view.match_version! + 1);
      const retried = await checked(actor, `rooms/${id}/actions`, 'POST', payload);
      expect(retried.match_version).toBe(moved.match_version);
      const stale = await requestAs(actor, `rooms/${id}/actions`, 'POST', {
        ...payload,
        action_id: randomUUID(),
      });
      expect(stale.status()).toBe(409);
      if (manifest.id === 'word-agents') {
        const masters = view.game!.detail.spymasters;
        if (!Array.isArray(masters)) throw new Error('Spymaster roles missing from projection.');
        const spy = players[identities.indexOf(String(masters[0]))];
        const operative =
          players[
            identities.indexOf(
              view.game!.players.find((player) => !masters.includes(player.id))!.id,
            )
          ];
        expect(
          (await roomAs(spy, id)).game!.community.every((card) => card.color !== 'unknown'),
        ).toBe(true);
        expect(
          (await roomAs(operative, id)).game!.community.every((card) => card.color === 'unknown'),
        ).toBe(true);
      }
      if (manifest.id === 'tarot') {
        for (let pick = 0; pick < 2; pick++) {
          const current = await roomAs(actor, id);
          await checked(actor, `rooms/${id}/actions`, 'POST', {
            match_id: current.match_id,
            action_id: randomUUID(),
            expected_version: current.match_version,
            action: current.game!.actions[pick].action,
          });
        }
        if (process.env.GAMES_TEST_AI === '1') {
          const reading = await checked(actor, `rooms/${id}/reading`, 'POST', {
            match_id: moved.match_id,
            question: 'How can I bring more creativity into my week?',
          });
          expect(reading.status).toBe('complete');
          await page.reload();
          expect((await checked(actor, `rooms/${id}/reading`, 'GET')).reading).toEqual(
            reading.reading,
          );
        }
      }
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
      console.log(`Hosted ${manifest.id}: create/start/action/retry/conflict/refresh passed`);
      if ((await roomAs(page, id)).status === 'playing') await checked(page, `rooms/${id}/abandon`);
    }
    const chat = await checked(page, `rooms/${id}/chat`, 'POST', {
      body: 'Cloud verification complete.',
      kind: 'message',
    });
    expect(
      chat.messages.some(
        (message: { body: string }) => message.body === 'Cloud verification complete.',
      ),
    ).toBe(true);
    await expect(page.getByTitle('Live updates connected')).toBeVisible();
  } finally {
    if (id) {
      const current = await roomAs(page, id);
      if (current.status === 'playing') await requestAs(page, `rooms/${id}/abandon`, 'POST');
      for (const player of players) await requestAs(player, `rooms/${id}/leave`, 'POST');
    }
    await Promise.all(others.map((context) => context.close()));
  }
});
