import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { openGameSetup, openRoomOptions, requestAs, roomAs, type RoomView } from './helpers';

// Room setup, bot levels, short links and username invitations. The first two
// tests use real rooms with independent guests on each device project; the last
// one renders a lobby from mocked responses for states a real run cannot reach
// on demand (a share sheet, a rate limit). Every real room is closed afterwards.
test.use({ trace: 'off', screenshot: 'only-on-failure', reducedMotion: 'reduce' });

type Owned = {
  id?: string;
  /** Guests seated in the room, host first; they leave in reverse order. */
  actors: Page[];
  contexts: BrowserContext[];
  /** Guests who claimed a username during the test. */
  named: Page[];
  /** Other rooms a guest opened for the test, each closed by its own guest. */
  extra: { actor: Page; id: string }[];
};
const cleanup = new WeakMap<Page, Owned>();

// A timed-out body must not consume the budget needed to close its room.
test.afterEach(async ({ page }) => {
  test.setTimeout(45000);
  const owned = cleanup.get(page);
  if (!owned) return;
  try {
    for (const guest of owned.named)
      expect([200, 409]).toContain((await requestAs(guest, 'profile/username', 'DELETE')).status());
    for (const room of owned.extra)
      expect([200, 404]).toContain(
        (await requestAs(room.actor, `rooms/${room.id}/leave`, 'POST')).status(),
      );
    if (!owned.id) return;
    const response = await requestAs(page, `rooms/${owned.id}`);
    if (response.status() === 404) return;
    expect(response.status()).toBe(200);
    if (((await response.json()) as RoomView).status === 'playing')
      expect((await requestAs(page, `rooms/${owned.id}/abandon`, 'POST')).status()).toBe(200);
    for (const actor of [...owned.actors].reverse())
      expect([200, 404]).toContain(
        (await requestAs(actor, `rooms/${owned.id}/leave`, 'POST')).status(),
      );
    expect((await requestAs(page, `rooms/${owned.id}`)).status()).toBe(404);
  } finally {
    await Promise.all(owned.contexts.map((context) => context.close()));
    cleanup.delete(page);
  }
});

/** Every short-link lookup this page sends, so one page open can be shown to ask once. */
function watchLookups(page: Page) {
  const sent: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path.startsWith('/api/backend/v1/rooms/lookup/')) sent.push(path.split('/').at(-1)!);
  });
  return sent;
}

const lobbySeat = (page: Page, name: string) =>
  page.locator('.lobby-seats .seat').filter({ hasText: name });
const invitePanel = (page: Page) =>
  page.getByRole('group', { name: 'Invite friends', exact: true });

async function fitsViewport(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

/** Every visible control inside `scope` offers at least a 44px target. */
async function expectTouchTargets(page: Page, scope: string) {
  const small = await page.locator(scope).evaluate((root) =>
    [...root.querySelectorAll<HTMLElement>('button, select, input:not([type="checkbox"]), a[href]')]
      .filter((control) => control.offsetParent !== null)
      .map((control) => {
        const box = control.getBoundingClientRect();
        return { name: control.getAttribute('aria-label') || control.textContent, h: box.height };
      })
      .filter((control) => control.h < 43.5),
  );
  expect(small).toEqual([]);
}

test('a host seats a renamed Easy bot beside a friend, edits bots in the lobby and shares the short link', async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(150000);
  const origin = new URL(baseURL!).origin;
  const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  const friend = await context.newPage();
  const owned: Owned = { actors: [page], contexts: [context], named: [], extra: [] };
  cleanup.set(page, owned);
  for (const actor of [page, friend]) actor.setDefaultTimeout(15000);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin });

  // Create: Friends mode, three seats, two bots — then one, renamed and Easy.
  await page.goto('/');
  const setup = await openGameSetup(page, 'Uno');
  await setup.getByRole('textbox', { name: 'Your name', exact: true }).fill('Setup Host');
  await setup.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('3');
  await openRoomOptions(setup);
  await setup.getByRole('textbox', { name: 'Room name', exact: true }).fill('Setup invites table');
  const bots = setup.getByRole('group', { name: 'Bots', exact: true });
  await expect(bots.getByRole('status')).toHaveText('0');
  await expect(setup.getByRole('group', { name: 'Bot players', exact: true })).toHaveCount(0);
  await expect(bots.getByRole('button', { name: 'Fewer bots', exact: true })).toBeDisabled();
  await bots.getByRole('button', { name: 'More bots', exact: true }).click();
  await bots.getByRole('button', { name: 'More bots', exact: true }).click();
  await expect(bots.getByRole('status')).toHaveText('2');
  // Two bots fill every other seat: the room would start at once, like Bots mode.
  await expect(bots.getByRole('button', { name: 'More bots', exact: true })).toBeDisabled();
  await expect(setup.getByRole('button', { name: 'Play game', exact: true })).toBeVisible();
  const players = setup.getByRole('group', { name: 'Bot players', exact: true });
  const first = players.getByRole('textbox', { name: 'Bot 1 name', exact: true });
  const second = players.getByRole('textbox', { name: 'Bot 2 name', exact: true });
  await expect(first).toHaveValue('Bot Ada');
  await expect(second).toHaveValue('Bot Bo');
  for (const index of [1, 2])
    await expect(
      players
        .getByRole('group', { name: `Bot ${index} difficulty`, exact: true })
        .getByRole('button', { name: 'Hard', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  await players
    .getByRole('group', { name: 'Set all bots to', exact: true })
    .getByRole('button', { name: 'Medium', exact: true })
    .click();
  for (const index of [1, 2])
    await expect(
      players
        .getByRole('group', { name: `Bot ${index} difficulty`, exact: true })
        .getByRole('button', { name: 'Medium', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  // A duplicate name is explained in place and nothing is sent.
  await first.fill('Rookie');
  await second.fill('rookie');
  await expect(players.getByRole('alert')).toHaveText(
    'Two bots are called “Rookie”. Give each bot its own name.',
  );
  let creates = 0;
  page.on('request', (request) => {
    if (request.method() === 'POST' && new URL(request.url()).pathname === '/api/backend/v1/rooms')
      creates++;
  });
  await setup.getByRole('button', { name: 'Play game', exact: true }).click();
  await expect(players.getByRole('alert')).toBeVisible();
  expect(creates).toBe(0);
  await expectTouchTargets(page, '[role="dialog"]');
  await fitsViewport(page);
  // Back to one bot: a mixed table, which opens its lobby for the friend.
  await bots.getByRole('button', { name: 'Fewer bots', exact: true }).click();
  await expect(players.getByRole('alert')).toHaveCount(0);
  await expect(players.getByRole('group', { name: 'Set all bots to', exact: true })).toHaveCount(0);
  await players
    .getByRole('group', { name: 'Bot 1 difficulty', exact: true })
    .getByRole('button', { name: 'Easy', exact: true })
    .click();
  const creation = page.waitForResponse(
    (response) => response.url().endsWith('/v1/rooms') && response.request().method() === 'POST',
  );
  await setup.getByRole('button', { name: 'Create room', exact: true }).click();
  const created = await creation;
  expect(created.status()).toBe(201);
  expect(created.request().postDataJSON()).toMatchObject({
    capacity: 3,
    bots: 1,
    bot_seats: [{ name: 'Rookie', level: 'easy' }],
  });
  const roomId = ((await created.json()) as RoomView).id;
  owned.id = roomId;
  await expect(page).toHaveURL(new RegExp(`/games/uno/rooms/${roomId}$`));

  // Lobby: the bot arrives as chosen; the room waits instead of starting.
  let room = await roomAs(page, roomId);
  expect(room.status).toBe('lobby');
  const bot = room.members.find((member) => member.is_bot)!;
  expect(bot).toMatchObject({ name: 'Rookie', bot_level: 'easy' });
  const level = page.getByRole('combobox', { name: 'Rookie difficulty', exact: true });
  await expect(level).toHaveValue('easy');
  const update = () =>
    page.waitForResponse(
      (response) =>
        response.url().includes(`/rooms/${roomId}/bots/`) &&
        response.request().method() === 'PATCH',
    );
  let patched = update();
  await level.selectOption('medium');
  expect((await patched).status()).toBe(200);
  await expect(level).toHaveValue('medium');
  expect((await roomAs(page, roomId)).members.find((m) => m.id === bot.id)?.bot_level).toBe(
    'medium',
  );
  // Rename in place: Escape keeps the name, Enter saves the new one.
  await page.getByRole('button', { name: 'Rename Rookie', exact: true }).click();
  const rename = page.getByRole('textbox', { name: 'New name for Rookie', exact: true });
  await expect(rename).toBeFocused();
  await rename.fill('Never saved');
  await rename.press('Escape');
  await expect(rename).toHaveCount(0);
  await expect(lobbySeat(page, 'Rookie')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Rename Rookie', exact: true })).toBeFocused();
  await page.getByRole('button', { name: 'Rename Rookie', exact: true }).click();
  await rename.fill('Setup Host');
  await expect(page.getByRole('alert').filter({ hasText: 'already called' })).toBeVisible();
  await rename.fill('Ace');
  patched = update();
  await rename.press('Enter');
  expect((await patched).status()).toBe(200);
  await expect(lobbySeat(page, 'Ace')).toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Ace difficulty', exact: true })).toHaveValue(
    'medium',
  );
  // "Add bot" seats a Hard bot, as before; its level can be changed right away.
  await page.getByRole('button', { name: 'Add bot', exact: true }).click();
  await expect(page.getByRole('button', { name: /^Remove .+ bot$/ })).toHaveCount(2);
  room = await roomAs(page, roomId);
  const added = room.members.find((member) => member.is_bot && member.id !== bot.id)!;
  expect(added.bot_level).toBe('hard');
  const addedLevel = page.getByRole('combobox', { name: `${added.name} difficulty`, exact: true });
  await expect(addedLevel).toHaveValue('hard');
  patched = update();
  await addedLevel.selectOption('easy');
  expect((await patched).status()).toBe(200);
  await expect(addedLevel).toHaveValue('easy');
  await expectTouchTargets(page, '.lobby-seats');
  await page.getByRole('button', { name: `Remove ${added.name} bot`, exact: true }).click();
  await expect(page.getByRole('button', { name: /^Remove .+ bot$/ })).toHaveCount(1);

  // Invite panel: grouped code, short link as text, copy confirmations.
  const panel = invitePanel(page);
  room = await roomAs(page, roomId);
  expect(room.code).toMatch(/^\d{6}$/);
  const grouped = `${room.code.slice(0, 3)} ${room.code.slice(3)}`;
  await expect(panel.locator('.room-code')).toHaveText(grouped);
  await expect(panel.locator('.invite-link')).toHaveText(`${new URL(origin).host}/r/${room.code}`);
  await expect(panel).toContainText('1 open seat');
  await panel.getByRole('button', { name: 'Copy code', exact: true }).click();
  await expect(panel.getByRole('button', { name: 'Code copied', exact: true })).toBeVisible();
  await expect(panel.getByRole('status').filter({ hasText: 'Code copied.' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(room.code);
  await panel.getByRole('button', { name: 'Copy link', exact: true }).click();
  await expect(panel.getByRole('status').filter({ hasText: 'Link copied.' })).toBeVisible();
  // The copied link is the short one, never the long invite token.
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `${origin}/r/${room.code}`,
  );
  // Share appears only where the browser can open a share sheet.
  const canShare = await page.evaluate(() => typeof navigator.share === 'function');
  await expect(panel.getByRole('button', { name: 'Share', exact: true })).toHaveCount(
    canShare ? 1 : 0,
  );
  await expectTouchTargets(page, '.invite-panel');
  await fitsViewport(page);

  // A wrong code keeps the guest on the join screen with the server's words.
  const wrong = room.code === '000000' ? '000001' : '000000';
  const friendLookups = watchLookups(friend);
  const hostLookups = watchLookups(page);
  await friend.goto(`/r/${wrong}`);
  const join = friend.getByRole('dialog', { name: 'Join room', exact: true });
  const code = join.getByRole('textbox', { name: 'Room code', exact: true });
  await expect(code).toHaveValue(`${wrong.slice(0, 3)} ${wrong.slice(3)}`);
  await expect(code).toHaveAttribute('inputmode', 'numeric');
  await join.getByRole('textbox', { name: 'Your name', exact: true }).fill('Setup Friend');
  let joining = friend.waitForResponse(
    (response) => response.url().endsWith('/rooms/join') && response.request().method() === 'POST',
  );
  await join.getByRole('button', { name: 'Join the room', exact: true }).click();
  const refused = await joining;
  expect(refused.status()).toBeGreaterThanOrEqual(400);
  expect(refused.status()).toBeLessThan(500);
  const refusal = ((await refused.json()) as { detail: string }).detail;
  await expect(join.getByRole('alert')).toHaveText(refusal);
  await expect(friend).toHaveURL(new RegExp(`/r/${wrong}$`));
  // A visitor in no room cannot be a member, so opening the link asked nothing.
  expect(friendLookups).toEqual([]);
  // Typing groups the digits; a dash or space is accepted too.
  await code.fill('');
  await code.pressSequentially(room.code);
  await expect(code).toHaveValue(grouped);
  await fitsViewport(friend);

  // The short link itself. The friend now has a table of their own, so the page
  // asks whether they are already in this room: once per page open, never twice.
  const own = await requestAs(friend, 'rooms', 'POST', {
    name: 'Setup Friend',
    avatar: 2,
    game_id: 'uno',
    room_name: 'Setup friend’s own table',
    capacity: 2,
    settings: {},
    bots: 0,
  });
  expect(own.status()).toBe(201);
  owned.extra.push({ actor: friend, id: ((await own.json()) as RoomView).id });
  await friend.goto(`/r/${room.code}`);
  await expect(code).toHaveValue(grouped);
  expect(friendLookups).toEqual([room.code]);
  await friend.reload();
  await expect(code).toHaveValue(grouped);
  expect(friendLookups).toEqual([room.code, room.code]);
  // Opening a friend's link, even twice, leaves the join itself untouched.
  await join.getByRole('textbox', { name: 'Your name', exact: true }).fill('Setup Friend');
  joining = friend.waitForResponse(
    (response) => response.url().endsWith('/rooms/join') && response.request().method() === 'POST',
  );
  await join.getByRole('button', { name: 'Join the room', exact: true }).click();
  expect((await joining).status()).toBe(200);
  owned.actors.push(friend);
  await expect(friend).toHaveURL(new RegExp(`/games/uno/rooms/${roomId}$`));
  await expect(lobbySeat(page, 'Setup Friend')).toBeVisible();
  // A guest reads a bot's level as text and gets no bot controls.
  const friendBot = lobbySeat(friend, 'Ace');
  await expect(friendBot.locator('.seat-badge')).toHaveText('Medium');
  await expect(friend.getByRole('combobox', { name: 'Ace difficulty', exact: true })).toHaveCount(
    0,
  );
  await expect(friend.getByRole('button', { name: /^(Rename|Remove) / })).toHaveCount(0);
  await expect(invitePanel(friend).locator('.room-code')).toHaveText(grouped);

  // People already in the room land straight on their table from the short link.
  for (const member of [page, friend]) {
    await member.goto(`/r/${room.code}`);
    await expect(member).toHaveURL(new RegExp(`/games/uno/rooms/${roomId}$`));
    await expect(member.getByRole('dialog', { name: 'Join room', exact: true })).toHaveCount(0);
    await expect(invitePanel(member)).toBeVisible();
  }
  expect(hostLookups).toEqual([room.code]);
  expect(friendLookups).toEqual([room.code, room.code, room.code]);
  // The older long link still works for someone who is not in the room yet.
  expect(room.invite_token).toBeTruthy();
  expect((await roomAs(page, roomId)).members.filter((member) => !member.is_bot)).toHaveLength(2);
});

test('a guest claims a username, is found by search, and answers invitations from the home page', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.setTimeout(210000);
  const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  const friend = await context.newPage();
  const owned: Owned = { actors: [page], contexts: [context], named: [], extra: [] };
  cleanup.set(page, owned);
  for (const actor of [page, friend]) actor.setDefaultTimeout(15000);
  const tag = randomUUID().replaceAll('-', '').slice(0, 10);
  const username = `pw_${info.project.name === 'phone' ? 'p' : 'd'}${tag}`;
  const friendName = `Invited ${tag.slice(0, 5)}`;

  // The friend saves a profile, then claims a username on the profile page.
  await friend.goto('/profile');
  await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill(friendName);
  const handle = friend.getByRole('textbox', { name: 'Username', exact: true });
  await friend.getByRole('button', { name: 'Save profile', exact: true }).click();
  await expect(friend.getByText('Looking good. Your profile is saved.')).toBeVisible();
  await expect(handle).toBeEnabled();
  const form = friend.locator('.username-form');
  await expect(form).toContainText('3 to 20 letters, numbers or underscores.');
  await handle.fill('@A b');
  await expect(handle).toHaveValue('ab');
  await form.getByRole('button', { name: 'Save username', exact: true }).click();
  await expect(form.getByRole('alert')).toHaveText('Use 3 to 20 letters, numbers or underscores.');
  // Typed with capitals and an @: stored lowercase without it.
  await handle.fill(`@${username.toUpperCase()}`);
  await expect(handle).toHaveValue(username);
  const saving = friend.waitForResponse(
    (response) =>
      response.url().endsWith('/profile/username') && response.request().method() === 'PUT',
  );
  await form.getByRole('button', { name: 'Save username', exact: true }).click();
  const saved = await saving;
  expect(saved.status()).toBe(200);
  expect(saved.request().postDataJSON()).toEqual({ username });
  owned.named.push(friend);
  await expect(form.getByRole('status')).toHaveText(`Saved. Friends can find you as @${username}.`);
  await expect(form.getByRole('button', { name: 'Remove username', exact: true })).toBeVisible();
  await expectTouchTargets(friend, '.username-form');
  await fitsViewport(friend);
  await friend.goto('/');
  await expect(friend.getByRole('region', { name: 'Invitations', exact: true })).toHaveCount(0);

  // The host opens a two-seat room and finds the friend by username.
  await page.goto('/');
  const setup = await openGameSetup(page, 'Uno');
  await setup.getByRole('textbox', { name: 'Your name', exact: true }).fill('Invite Host');
  await setup.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
  await openRoomOptions(setup);
  await setup
    .getByRole('textbox', { name: 'Room name', exact: true })
    .fill('Username invite table');
  const creation = page.waitForResponse(
    (response) => response.url().endsWith('/v1/rooms') && response.request().method() === 'POST',
  );
  await setup.getByRole('button', { name: 'Create room', exact: true }).click();
  const created = await creation;
  expect(created.status()).toBe(201);
  // A plain friends room sends no bot seats at all.
  expect(created.request().postDataJSON()).not.toHaveProperty('bot_seats');
  const roomId = ((await created.json()) as RoomView).id;
  owned.id = roomId;
  await expect(page).toHaveURL(new RegExp(`/games/uno/rooms/${roomId}$`));
  const panel = invitePanel(page);
  // The host has no username of their own; inviting still works.
  await expect(panel.getByRole('button', { name: 'choose a username', exact: true })).toBeVisible();
  const search = panel.getByRole('searchbox', { name: 'Find a friend by username', exact: true });
  await search.fill(username.slice(0, 1));
  await expect(panel).toContainText('Type the first 2 letters of a friend’s username.');
  const searching = page.waitForResponse((response) => response.url().includes('/players/search?'));
  await search.fill(`@${username.slice(0, 9).toUpperCase()}`);
  expect((await searching).status()).toBe(200);
  const invite = panel.getByRole('button', {
    name: `Invite ${friendName} (@${username})`,
    exact: true,
  });
  await expect(invite).toBeVisible();
  await expect(panel.getByRole('list', { name: 'Players found', exact: true })).toContainText(
    `@${username}`,
  );
  await expectTouchTargets(page, '.invite-panel');
  await fitsViewport(page);
  const sent = (method: string) =>
    page.waitForResponse(
      (response) =>
        response.url().includes(`/rooms/${roomId}/invites`) &&
        response.request().method() === method,
    );
  let answered = sent('POST');
  await invite.click();
  expect((await answered).status()).toBe(200);
  await expect(panel.getByRole('status').filter({ hasText: 'Invitation sent' })).toHaveText(
    `Invitation sent to ${friendName}.`,
  );
  const cancel = panel.getByRole('button', {
    name: `Cancel invitation to ${friendName}`,
    exact: true,
  });
  await expect(cancel).toBeVisible();
  await expect(
    panel.getByRole('button', { name: `${friendName} (@${username}) is invited`, exact: true }),
  ).toBeDisabled();
  expect((await roomAs(page, roomId)).pending_invites).toEqual([
    expect.objectContaining({ username, name: friendName }),
  ]);

  // The invitation reaches the friend's open home page without a reload.
  const invitations = friend.getByRole('region', { name: 'Invitations', exact: true });
  await expect(invitations).toContainText('Invite Host invited you to Username invite table', {
    timeout: 40000,
  });
  await expect(invitations).toContainText('Uno · 1 of 2 players');
  await expectTouchTargets(friend, '.invitations');
  await fitsViewport(friend);
  // The host takes it back; it leaves the friend's home page on the next check.
  answered = sent('DELETE');
  await cancel.click();
  expect((await answered).status()).toBe(200);
  await expect(panel.getByRole('status').filter({ hasText: 'cancelled' })).toHaveText(
    `Invitation to ${friendName} cancelled.`,
  );
  await expect(cancel).toHaveCount(0);
  await friend.reload();
  await expect(friend.getByRole('heading', { name: 'Choose a game', exact: true })).toBeVisible();
  await expect
    .poll(
      async () =>
        ((await (await requestAs(friend, 'me')).json()) as { invitations: unknown[] }).invitations,
    )
    .toEqual([]);
  await expect(invitations).toHaveCount(0);

  // Invited again, the friend declines: nothing is joined and the host sees it clear.
  answered = sent('POST');
  await invite.click();
  expect((await answered).status()).toBe(200);
  await friend.reload();
  const decline = invitations.getByRole('button', {
    name: 'Decline invitation to Username invite table',
    exact: true,
  });
  await expect(decline).toBeVisible();
  const declining = friend.waitForResponse(
    (response) =>
      response.url().endsWith(`/invitations/${roomId}`) && response.request().method() === 'DELETE',
  );
  await decline.click();
  expect((await declining).status()).toBe(200);
  await expect(invitations).toHaveCount(0);
  await expect(friend.getByRole('status').filter({ hasText: 'Declined' })).toHaveText(
    'Declined Invite Host’s invitation.',
  );
  await expect(friend).toHaveURL(/\/$/);
  expect((await requestAs(friend, `rooms/${roomId}`)).status()).toBe(404);
  await expect(cancel).toHaveCount(0, { timeout: 20000 });

  // Invited a third time, the friend joins and lands at the table.
  answered = sent('POST');
  await invite.click();
  expect((await answered).status()).toBe(200);
  await friend.reload();
  const accepting = friend.waitForResponse(
    (response) =>
      response.url().endsWith(`/invitations/${roomId}/accept`) &&
      response.request().method() === 'POST',
  );
  await invitations
    .getByRole('button', { name: 'Join Username invite table', exact: true })
    .click();
  expect((await accepting).status()).toBe(200);
  owned.actors.push(friend);
  await expect(friend).toHaveURL(new RegExp(`/games/uno/rooms/${roomId}$`));
  await expect(lobbySeat(friend, friendName).getByText('you', { exact: true })).toBeVisible();
  await expect(lobbySeat(page, friendName)).toBeVisible();
  await expect(cancel).toHaveCount(0);
  const room = await roomAs(page, roomId);
  expect(room.pending_invites).toEqual([]);
  expect(room.members.filter((member) => member.seated)).toHaveLength(2);
  // The invited guest sees their own handle in the panel, with no prompt to choose one.
  await expect(invitePanel(friend)).toContainText(`Friends can find you as @${username}.`);
  await friend.goto('/');
  await expect(friend.getByRole('heading', { name: 'Choose a game', exact: true })).toBeVisible();
  await expect(invitations).toHaveCount(0);
});

test.describe('Lobby states from mocked responses', () => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Mocked lobby states are local-only.');

  const self = '0a0a0a0a-0000-4000-8000-000000000001';
  const roomId = '0b0b0b0b-0000-4000-8000-000000000002';
  const botId = `bot:${'a'.repeat(32)}`;
  const member = (id: string, name: string, extra: Record<string, unknown> = {}) => ({
    id,
    name,
    avatar: 1,
    ready: false,
    seated: true,
    connected: true,
    last_seen: 0,
    is_bot: false,
    bot_level: null,
    ...extra,
  });

  async function mockLobby(page: Page, code: string, ownerId = self) {
    const room = {
      id: roomId,
      name: 'Friday game night',
      code,
      game_id: 'uno',
      owner_id: ownerId,
      capacity: 4,
      settings: {},
      status: 'lobby',
      revision: 1,
      match_id: null,
      match_version: null,
      members: [
        member(self, 'Mock Host'),
        member(botId, 'Bot Ada', { is_bot: true, ready: true, bot_level: 'easy' }),
      ],
      messages: [],
      game: null,
      paused: false,
      missing_players: [],
      invite_token: 'A_private_invite_token_1234567890',
      pending_invites: [{ username: 'priya_r', name: 'Priya', avatar: 4 }],
      bot_pending: false,
      bot_due_at: null,
      last_action: null,
      activity: [],
    };
    const calls: string[] = [];
    await page.addInitScript(() =>
      localStorage.setItem('games:player:v1', JSON.stringify({ name: 'Mock Host', avatar: 1 })),
    );
    await page.route('**/api/dev-session', (route) => route.fulfill({ status: 200, body: '{}' }));
    await page.route('**/api/backend/v1/**', (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname.replace('/api/backend/v1/', '');
      calls.push(`${route.request().method()} ${path}${url.search}`);
      if (path === 'me')
        return route.fulfill({
          json: {
            profile: { id: self, name: 'Mock Host', avatar: 1, username: null },
            anonymous: true,
            rooms: [],
            history: [],
            invitations: [],
          },
        });
      if (path === 'players/search') {
        const q = url.searchParams.get('q') || '';
        if (q.startsWith('zz'))
          return route.fulfill({
            status: 429,
            json: { detail: 'Too many searches. Try again in a minute.' },
          });
        if (q.startsWith('xx'))
          return route.fulfill({ status: 500, body: 'Internal Server Error' });
        return route.fulfill({
          json: {
            players: [
              { username: 'sam_plays', name: 'Sam', avatar: 2 },
              { username: 'samira', name: 'Samira', avatar: 5 },
            ].filter((player) => player.username.startsWith(q)),
          },
        });
      }
      if (path === `rooms/${roomId}/invites`)
        return route.fulfill({ status: 409, json: { detail: 'Sam is already in this room.' } });
      if (path.startsWith(`rooms/${roomId}/invites/`))
        return route.fulfill({
          status: 403,
          json: { detail: 'Only the host or the player who sent this invitation can cancel it.' },
        });
      if (path === 'profile/username')
        return route.fulfill({ status: 409, json: { detail: 'That username is taken.' } });
      return route.fulfill({ json: room });
    });
    return calls;
  }

  test('Share uses the share sheet with the room name, code and short link when the browser has one', async ({
    page,
    baseURL,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'share', {
        configurable: true,
        value: async (data: ShareData) => {
          (window as unknown as { shared: ShareData[] }).shared = [data];
        },
      });
    });
    await mockLobby(page, '482913');
    await page.goto(`/games/uno/rooms/${roomId}`);
    const panel = invitePanel(page);
    await expect(panel.locator('.room-code')).toHaveText('482 913');
    await panel.getByRole('button', { name: 'Share', exact: true }).click();
    await expect(panel.getByRole('status').filter({ hasText: 'Invite shared.' })).toBeVisible();
    expect(
      await page.evaluate(() => (window as unknown as { shared: ShareData[] }).shared),
    ).toEqual([
      {
        title: 'Friday game night',
        text: 'Join my Uno room, code 482 913',
        url: `${new URL(baseURL!).origin}/r/482913`,
      },
    ]);
    await expectTouchTargets(page, '.invite-panel');
    await fitsViewport(page);
  });

  test('without a share sheet the copies lead; search explains empty, failed and rate-limited results', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'share', { configurable: true, value: undefined });
    });
    const calls = await mockLobby(page, 'ABCD1234');
    await page.goto(`/games/uno/rooms/${roomId}`);
    const panel = invitePanel(page);
    // An older room keeps its 8-character code, shown as it is.
    await expect(panel.locator('.room-code')).toHaveText('ABCD1234');
    await expect(panel.locator('.invite-link')).toContainText('/r/ABCD1234');
    await expect(panel.getByRole('button', { name: 'Share', exact: true })).toHaveCount(0);
    await expect(panel.getByRole('button', { name: 'Copy link', exact: true })).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Copy code', exact: true })).toBeVisible();
    await expect(panel.getByRole('button', { name: 'Cancel invitation to Priya' })).toBeVisible();

    const search = panel.getByRole('searchbox', { name: 'Find a friend by username', exact: true });
    const results = panel.locator('.friend-results');
    await search.fill('s');
    await expect(results).toHaveCount(0);
    expect(calls.filter((call) => call.includes('players/search'))).toEqual([]);
    // Typing quickly sends one search for the settled text, not one per key.
    await search.pressSequentially('am', { delay: 30 });
    await expect(panel.getByRole('button', { name: 'Invite Sam (@sam_plays)' })).toBeVisible();
    expect(calls.filter((call) => call.includes('players/search'))).toEqual([
      'GET players/search?q=sam',
    ]);
    // Results arriving do not move what is below them.
    const before = await results.boundingBox();
    await search.fill('sa');
    await expect(panel.getByRole('button', { name: 'Invite Samira (@samira)' })).toBeVisible();
    expect(await results.boundingBox()).toEqual(before);
    await search.fill('qq');
    await expect(results).toContainText('No one has a username starting with “qq”.');
    expect(await results.boundingBox()).toEqual(before);
    await search.fill('zz');
    await expect(results.getByRole('alert')).toHaveText(
      'Too many searches. Try again in a minute.',
    );
    await search.fill('xx');
    await expect(results.getByRole('alert')).toHaveText(
      'Search isn’t working right now. Try again in a moment.',
    );
    expect(await results.boundingBox()).toEqual(before);
    // The server's own words explain an invitation it refuses.
    await search.fill('sam_');
    await panel.getByRole('button', { name: 'Invite Sam (@sam_plays)' }).click();
    await expect(panel.getByRole('alert').filter({ hasText: 'already' })).toHaveText(
      'Sam is already in this room.',
    );
    // Choosing a username from the panel shows the server's message when it is taken.
    await panel.getByRole('button', { name: 'choose a username', exact: true }).click();
    await panel.getByRole('textbox', { name: 'Username', exact: true }).fill('@Taken');
    await panel.getByRole('button', { name: 'Save username', exact: true }).click();
    await expect(panel.getByRole('alert').filter({ hasText: 'taken' })).toHaveText(
      'That username is taken.',
    );
    await expectTouchTargets(page, '.invite-panel');
    await fitsViewport(page);
  });

  test('a Cancel the server refuses shows the server’s words and keeps the invitation listed', async ({
    page,
  }) => {
    // This tab remembers sending the invitation, so a guest is offered Cancel.
    await page.addInitScript(
      (key) => sessionStorage.setItem(key, JSON.stringify(['priya_r'])),
      `games:invited:${roomId}`,
    );
    await mockLobby(page, '482913', '0c0c0c0c-0000-4000-8000-000000000003');
    await page.goto(`/games/uno/rooms/${roomId}`);
    const panel = invitePanel(page);
    await panel.getByRole('button', { name: 'Cancel invitation to Priya', exact: true }).click();
    await expect(panel.getByRole('alert')).toHaveText(
      'Only the host or the player who sent this invitation can cancel it.',
    );
    await expect(panel).toContainText('@priya_r');
    await expect(
      panel.getByRole('button', { name: 'Cancel invitation to Priya', exact: true }),
    ).toBeEnabled();
  });

  test('a guest who is not the host cannot cancel someone else’s invitation or edit bots', async ({
    page,
  }) => {
    await mockLobby(page, '482913', '0c0c0c0c-0000-4000-8000-000000000003');
    await page.goto(`/games/uno/rooms/${roomId}`);
    const panel = invitePanel(page);
    await expect(panel).toContainText('@priya_r');
    await expect(panel.getByRole('button', { name: /^Cancel invitation/ })).toHaveCount(0);
    await expect(lobbySeat(page, 'Ada').locator('.seat-badge')).toHaveText('Easy');
    await expect(page.getByRole('combobox', { name: /difficulty$/ })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /^(Rename|Remove) / })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Add bot', exact: true })).toHaveCount(0);
  });
});
