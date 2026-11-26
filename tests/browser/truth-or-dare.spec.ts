import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { openGameSetup, openRoomOptions, requestAs, roomAs, type RoomView } from './helpers';

/*
 * Truth or Dare through the real UI: two friends in one room, the 18+ gate, and one
 * player against bots to the end. The adult deck and fates are read from the server's
 * own prompt file at run time, only to prove they never reach a friendly room.
 */
const prompts = readFileSync(
  new URL('../../backend/app/games/truth_or_dare/prompts.py', import.meta.url),
  'utf8',
);
const list = (name: string) => {
  // Up to the first closing bracket that ends a line: one-line and multi-line lists.
  const block = prompts.match(new RegExp(`^${name} = \\[([\\s\\S]*?)\\]\\s*$`, 'm'))?.[1] ?? '';
  return [...block.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((match) => match[1]);
};
const friendlyFates = list('FRIENDLY_FATES');
const naughtyOnlyFates = list('NAUGHTY_FATES').filter((fate) => !friendlyFates.includes(fate));
const adultLines = [...list('NAUGHTY_TRUTHS'), ...list('NAUGHTY_DARES')].filter(
  (line) => line.length >= 25,
);

type Detail = {
  edition: string;
  fates: string[];
  prompt: {
    player: string;
    kind: string;
    text: string | null;
    candidates: { label: string | null; player: string | null }[] | null;
    swapped: boolean;
  } | null;
  last_result: { player: string; outcome: string; points: number; fates: number[] | null } | null;
  scores: Record<string, number>;
  swaps_left: Record<string, number>;
};
const detail = (room: RoomView) => room.game!.detail as unknown as Detail;

// Every room a test opens is closed afterwards, even when the test fails part-way.
const owned = new Map<string, { id?: string; players: Page[]; contexts: BrowserContext[] }>();
test.afterEach(async ({ page }, info) => {
  test.setTimeout(60000);
  const record = owned.get(info.testId);
  owned.delete(info.testId);
  if (!record) return;
  try {
    if (record.id) {
      const response = await requestAs(page, `rooms/${record.id}`);
      if (response.status() === 200) {
        if (((await response.json()) as RoomView).status === 'playing')
          expect((await requestAs(page, `rooms/${record.id}/abandon`, 'POST')).status()).toBe(200);
        for (const player of [...record.players].reverse())
          expect([200, 404]).toContain(
            (await requestAs(player, `rooms/${record.id}/leave`, 'POST')).status(),
          );
      }
      expect((await requestAs(page, `rooms/${record.id}`)).status()).toBe(404);
    }
  } finally {
    for (const context of record.contexts) await context.close();
  }
});

async function checked(actor: Page, path: string, method = 'POST', body?: unknown) {
  const response = await requestAs(actor, path, method, body);
  expect(response.status(), path).toBeLessThan(300);
  return response.json();
}

async function createRoom(page: Page, name: string, adults = false) {
  await page.goto('/');
  const dialog = await openGameSetup(page, 'Truth or Dare');
  await dialog.getByRole('textbox', { name: 'Your name', exact: true }).fill(name);
  await dialog.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
  if (adults) {
    await openRoomOptions(dialog);
    await dialog.getByRole('checkbox', { name: 'Naughty edition (18+)', exact: true }).check();
    const confirm = dialog.getByRole('checkbox', {
      name: 'Everyone in this room is 18 or older',
      exact: true,
    });
    await expect(confirm).toBeVisible();
    await expect(dialog.getByRole('button', { name: 'Create room', exact: true })).toBeDisabled();
    await page.screenshot({ path: test.info().outputPath('gate-create.png') });
    await confirm.check();
  }
  await dialog.getByRole('button', { name: 'Create room', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
  return {
    id: new URL(page.url()).pathname.split('/').at(-1)!,
    code: await page.locator('.room-code').innerText(),
  };
}

async function joinRoom(friend: Page, code: string, name: string) {
  await friend.goto('/');
  await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
  await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill(name);
  await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
  await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
  await expect(friend).toHaveURL(/\/rooms\/[\da-f-]+$/);
}

/** Neither the adult deck nor an adult-only fate is anywhere in a friendly room. */
async function expectFriendly(actor: Page, roomId: string) {
  // The lists were really read: an empty list would make this check vacuous.
  expect(naughtyOnlyFates.length).toBeGreaterThan(0);
  expect(adultLines.length).toBeGreaterThan(50);
  const view = await roomAs(actor, roomId);
  expect(detail(view).edition).toBe('friendly');
  expect(detail(view).fates).toEqual(friendlyFates);
  const json = JSON.stringify(view);
  const text = await actor.locator('body').innerText();
  for (const fate of naughtyOnlyFates) {
    const word = new RegExp(`\\b${fate}\\b`);
    expect(word.test(json), 'adult fate in the room JSON').toBe(false);
    expect(word.test(text), 'adult fate on the page').toBe(false);
  }
  for (const line of adultLines) {
    expect(json.includes(line), 'adult prompt in the room JSON').toBe(false);
    expect(text.includes(line), 'adult prompt on the page').toBe(false);
  }
}

test('two friends answer, swap, pass and save three from a burning building', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.setTimeout(180000);
  const record = {
    players: [page] as Page[],
    contexts: [] as BrowserContext[],
    id: undefined as string | undefined,
  };
  owned.set(info.testId, record);
  const room = await createRoom(page, 'Dare Host');
  record.id = room.id;
  const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  record.contexts.push(context);
  const friend = await context.newPage();
  record.players.push(friend);
  await joinRoom(friend, room.code, 'Dare Friend');
  const players = [page, friend];
  const ids: string[] = await Promise.all(
    players.map(async (actor) => (await checked(actor, 'me', 'GET')).profile.id),
  );
  const byId = new Map(ids.map((id, i) => [id, players[i]]));
  for (const actor of players)
    await checked(actor, `rooms/${room.id}/ready`, 'PUT', { ready: true });
  await checked(page, `rooms/${room.id}/start`);
  await Promise.all(players.map((actor) => actor.reload()));

  const current = async () => {
    const view = await roomAs(page, room.id);
    const id = view.game!.current_player!;
    return { view, id, actor: byId.get(id)!, other: byId.get(ids.find((x) => x !== id)!)! };
  };

  // Turn 1: a truth, swapped once, then done.
  let turn = await current();
  await expect(
    turn.actor.getByRole('button', { name: 'Burning building', exact: true }),
  ).toBeVisible();
  await turn.actor.getByRole('button', { name: 'Truth', exact: true }).click();
  await expect.poll(async () => detail(await roomAs(page, room.id)).prompt?.kind).toBe('truth');
  let prompt = detail(await roomAs(page, room.id)).prompt!;
  await expect(turn.actor.getByText(prompt.text!, { exact: true })).toBeVisible();
  await expect(turn.other.getByText(prompt.text!, { exact: true })).toBeVisible();
  await expect(turn.other.getByText(/^Drawn by Dare (Host|Friend)/)).toBeVisible();
  await expect(turn.other.getByRole('button', { name: 'Done', exact: true })).toHaveCount(0);
  await expect(turn.actor.getByText('1 swap left in the match', { exact: true })).toBeVisible();
  await turn.actor.screenshot({ path: info.outputPath('mid.png'), fullPage: true });
  await turn.actor.getByRole('button', { name: 'Swap for another', exact: true }).click();
  await expect.poll(async () => detail(await roomAs(page, room.id)).prompt?.swapped).toBe(true);
  prompt = detail(await roomAs(page, room.id)).prompt!;
  await expect(turn.actor.getByText(prompt.text!, { exact: true })).toBeVisible();
  await expect(turn.actor.getByText('No swaps left', { exact: true })).toBeVisible();
  await expect(turn.actor.getByText('Swapped', { exact: true })).toBeVisible();
  await expect(
    turn.actor.getByRole('button', { name: 'Swap for another', exact: true }),
  ).toHaveCount(0);
  await turn.actor.getByRole('button', { name: 'Done', exact: true }).click();
  await expect.poll(async () => detail(await roomAs(page, room.id)).scores[turn.id]).toBe(1);
  await expect(turn.other.getByText('answered the truth (+1)')).toBeVisible();
  await expectFriendly(page, room.id);

  // Turn 2: the friend takes a dare and passes on it.
  turn = await current();
  await turn.actor.getByRole('button', { name: 'Dare', exact: true }).click();
  await expect.poll(async () => detail(await roomAs(page, room.id)).prompt?.kind).toBe('dare');
  await turn.actor.getByRole('button', { name: 'Pass', exact: true }).click();
  await expect
    .poll(async () => detail(await roomAs(page, room.id)).last_result?.outcome)
    .toBe('passed');
  expect(detail(await roomAs(page, room.id)).scores[turn.id]).toBe(0);
  await expect(turn.other.getByText(/passed on the dare \(0\)/)).toBeVisible();

  // Turn 3: burning building, three different fates through the radio rows.
  turn = await current();
  await turn.actor.getByRole('button', { name: 'Burning building', exact: true }).click();
  await expect.poll(async () => detail(await roomAs(page, room.id)).prompt?.kind).toBe('burning');
  const burning = detail(await roomAs(page, room.id));
  const names = burning.prompt!.candidates!.map((candidate) => candidate.label!);
  const confirm = turn.actor.getByRole('button', { name: 'Confirm fates', exact: true });
  await expect(confirm).toBeDisabled();
  for (const name of names) await expect(turn.other.getByText(name, { exact: true })).toBeVisible();
  const order = [1, 2, 0];
  for (const [row, fate] of order.entries())
    await turn.actor
      .getByRole('group', { name: names[row], exact: true })
      .getByRole('radio', { name: burning.fates[fate], exact: true })
      .check();
  // Choosing a fate another row holds swaps them, so the three never share one.
  await turn.actor
    .getByRole('group', { name: names[0], exact: true })
    .getByRole('radio', { name: burning.fates[2], exact: true })
    .check();
  await expect(
    turn.actor
      .getByRole('group', { name: names[1], exact: true })
      .getByRole('radio', { name: burning.fates[1], exact: true }),
  ).toBeChecked();
  await expect(confirm).toBeEnabled();
  await turn.actor.screenshot({ path: info.outputPath('assign.png'), fullPage: true });
  await confirm.click();
  await expect.poll(async () => (await roomAs(page, room.id)).game!.phase).toBe('result');
  expect(detail(await roomAs(page, room.id)).last_result!.fates).toEqual([2, 1, 0]);
  for (const actor of players) {
    const fates = actor.getByRole('list', { name: 'Fates chosen', exact: true });
    await expect(fates).toBeVisible();
    for (const [row, fate] of [2, 1, 0].entries())
      for (const part of [names[row], burning.fates[fate]])
        await expect(fates.getByRole('listitem').nth(row)).toContainText(part);
  }
  await expect(turn.other.getByRole('button', { name: 'Next turn', exact: true })).toHaveCount(0);
  await turn.actor.screenshot({ path: info.outputPath('result.png'), fullPage: true });
  await turn.actor.getByRole('button', { name: 'Next turn', exact: true }).click();
  await expect.poll(async () => (await roomAs(page, room.id)).game!.phase).toBe('choose');
  for (const actor of players) await expectFriendly(actor, room.id);
});

test('the 18+ edition asks the host to confirm and gates a joining friend once', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.setTimeout(120000);
  const record = {
    players: [page] as Page[],
    contexts: [] as BrowserContext[],
    id: undefined as string | undefined,
  };
  owned.set(info.testId, record);
  const room = await createRoom(page, 'Gate Host', true);
  record.id = room.id;
  // The host confirmed in the dialog and goes straight to the lobby.
  await expect(page.getByText('This room uses the 18+ edition. Continue?')).toHaveCount(0);
  await expect(page.locator('.lobby .adults-badge')).toHaveText('18+');
  const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  record.contexts.push(context);
  const friend = await context.newPage();
  record.players.push(friend);
  await joinRoom(friend, room.code, 'Gate Friend');
  const gate = friend.getByRole('heading', { name: 'This room uses the 18+ edition. Continue?' });
  await expect(gate).toBeVisible();
  await expect(friend.locator('.lobby, .table-layout, .room-panel')).toHaveCount(0);
  await expect(friend.getByRole('button', { name: 'I’m ready', exact: true })).toHaveCount(0);
  await friend.screenshot({ path: info.outputPath('gate-join.png') });
  await friend.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(friend.locator('.lobby .adults-badge')).toHaveText('18+');
  await friend.reload();
  await expect(friend.locator('.lobby')).toBeVisible();
  await expect(gate).toHaveCount(0);
  for (const actor of [page, friend])
    await checked(actor, `rooms/${room.id}/ready`, 'PUT', { ready: true });
  await checked(page, `rooms/${room.id}/start`);
  await friend.reload();
  await expect(friend.locator('.truth-or-dare-game .adults-badge')).toHaveText('18+');
  expect(detail(await roomAs(friend, room.id)).edition).toBe('naughty');
  // A new tab has not confirmed this room yet and is asked again.
  const fresh = await context.newPage();
  await fresh.goto(friend.url());
  await expect(
    fresh.getByRole('heading', { name: 'This room uses the 18+ edition. Continue?' }),
  ).toBeVisible();
  await expect(fresh.locator('.truth-or-dare-game')).toHaveCount(0);
  await fresh.close();
});

test('one player plays Truth or Dare against a bot to the end', async ({ page }, info) => {
  test.setTimeout(240000);
  const record = {
    players: [page] as Page[],
    contexts: [] as BrowserContext[],
    id: undefined as string | undefined,
  };
  owned.set(info.testId, record);
  await page.goto('/');
  const dialog = await openGameSetup(page, 'Truth or Dare');
  await dialog.getByRole('textbox', { name: 'Your name', exact: true }).fill('Solo Dare');
  await dialog
    .getByRole('group', { name: 'Play with', exact: true })
    .getByRole('button', { name: 'Bots' })
    .click();
  await dialog.getByRole('button', { name: 'Play game', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
  record.id = new URL(page.url()).pathname.split('/').at(-1)!;
  const selfId = (await checked(page, 'me', 'GET')).profile.id as string;
  const kinds = ['Truth', 'Dare', 'Burning building'];
  let moves = 0;
  for (let guard = 0; guard < 80; guard++) {
    const view = await roomAs(page, record.id);
    if (view.status === 'finished' || view.game?.phase === 'finished') break;
    const actions = view.game?.actions ?? [];
    if (!actions.length) {
      await page.waitForTimeout(700);
      continue;
    }
    const types = actions.map((option) => option.action.type);
    const before = view.match_version;
    if (types.includes('pick'))
      await page.getByRole('button', { name: kinds[moves % 3], exact: true }).click();
    else if (types.includes('assign')) {
      const data = detail(view);
      for (const [row, candidate] of data.prompt!.candidates!.entries())
        await page
          .getByRole('group', { name: candidate.label!, exact: true })
          .getByRole('radio', { name: data.fates[row], exact: true })
          .check();
      await page.getByRole('button', { name: 'Confirm fates', exact: true }).click();
    } else if (types.includes('next'))
      await page.getByRole('button', { name: 'Next turn', exact: true }).click();
    else
      await page
        .getByRole('button', { name: moves % 4 === 3 ? 'Pass' : 'Done', exact: true })
        .click();
    moves++;
    await expect.poll(async () => (await roomAs(page, record.id!)).match_version).not.toBe(before);
  }
  const final = await roomAs(page, record.id);
  expect(final.game!.phase).toBe('finished');
  expect(final.game!.winners!.length).toBeGreaterThan(0);
  expect(detail(final).scores[selfId]).toBeGreaterThanOrEqual(0);
  await expect(page.getByText('Everyone has had their turns.').first()).toBeVisible();
  await expectFriendly(page, record.id);
});
