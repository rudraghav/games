import { expect, test, type Page, type Route } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import type { components } from '../../packages/api-client/src/generated/schema';
import catalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };
import { openGameSetup, requestAs, roomAs, type RoomView } from './helpers';
import { matchPlayer } from './fullmatch-player';

// The home page around the library, progress and rewards. The first group runs
// against mocked progress (every state on demand, no rooms created). The last
// test plays real games against the local backend and closes what it creates.

type Progress = Required<components['schemas']['ProgressView']>;
type Reward = components['schemas']['RewardView'];
type Me = components['schemas']['MeView'];

test.use({ trace: 'off', screenshot: 'off' });

const TEAM_PICKS = 12;
const PLAYER = { name: 'Maya Rao', avatar: 2 };

const badge = (id: string, name: string, description: string, value: number, goal: number) => ({
  id,
  name,
  description,
  earned: value >= goal,
  value: Math.min(value, goal),
  goal,
});
const reward = (
  id: string,
  kind: Reward['kind'],
  name: string,
  requirement: string,
  state: Reward['state'],
  value: number,
  goal: number,
  equipped = false,
): Reward => ({ id, kind, name, requirement, state, equipped, value, goal });

/** A returning player part-way through level 3, with a streak that today has not extended. */
function midLevel(): Progress {
  return {
    xp: 190,
    level: 3,
    level_xp: 150,
    next_level_xp: 300,
    streak: { current: 4, best: 6, played_today: false },
    totals: { games: 12, wins: 5, different_games: 4, with_friends: 6 },
    badges: [
      badge('first-game', 'First game', 'Finish your first game', 1, 1),
      badge('regular', 'Regular', 'Finish 10 games', 12, 10),
      badge('veteran', 'Veteran', 'Finish 50 games', 12, 50),
      badge('five-wins', 'Five wins', 'Win 5 games', 5, 5),
      badge('explorer', 'Explorer', 'Finish 5 different games', 4, 5),
      badge('streak-3', 'Three in a row', 'Play 3 days in a row', 3, 3),
    ],
    rewards: [
      reward('frame-gold', 'frame', 'Gold frame', 'Reach level 2', 'available', 2, 2),
      reward('frame-laurel', 'frame', 'Laurel frame', 'Earn the Five wins badge', 'redeemed', 5, 5),
      reward(
        'frame-confetti',
        'frame',
        'Confetti frame',
        'Earn the Good company badge',
        'available',
        5,
        5,
      ),
      reward('frame-crown', 'frame', 'Crown frame', 'Reach level 8', 'locked', 3, 8),
      reward(
        'back-midnight',
        'card_back',
        'Midnight card back',
        'Reach level 3',
        'redeemed',
        3,
        3,
        true,
      ),
      reward(
        'back-sunrise',
        'card_back',
        'Sunrise card back',
        'Earn the Explorer badge',
        'locked',
        4,
        5,
      ),
    ],
  };
}

function member(change: Partial<Me> = {}): Me {
  return {
    profile: {
      id: '00000000-0000-4000-8000-000000000001',
      ...PLAYER,
      username: null,
      frame: null,
      card_back: 'back-midnight',
    },
    anonymous: true,
    history: [],
    invitations: [],
    rooms: [],
    ...change,
  };
}

const json = (route: Route, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });

/** A player this browser remembers, with mocked identity and progress. No real session. */
async function returning(page: Page, options: { me?: Me; progress?: () => Progress | null }) {
  await page.addInitScript(
    (player) => localStorage.setItem('games:player:v1', JSON.stringify(player)),
    PLAYER,
  );
  await page.route('**/api/dev-session', (route) => json(route, {}));
  await page.route('**/api/backend/v1/me', (route) => json(route, options.me ?? member()));
  await page.route('**/api/backend/v1/progress*', (route) => {
    const body = options.progress ? options.progress() : midLevel();
    return body ? json(route, body) : json(route, { detail: 'Unavailable' }, 503);
  });
}

const fits = async (page: Page) =>
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
const top = async (page: Page, selector: string) =>
  (await page.locator(selector).first().boundingBox())!.y;

async function expectTouchTargets(page: Page, scope: string) {
  const small = await page
    .locator(scope)
    .first()
    .evaluate((root) =>
      [...root.querySelectorAll<HTMLElement>('button, select, input, a[href]')]
        .filter((control) => control.offsetParent !== null)
        .map((control) => {
          const box = control.getBoundingClientRect();
          return { name: control.getAttribute('aria-label') || control.textContent, h: box.height };
        })
        .filter((control) => control.h < 43.5),
    );
  expect(small).toEqual([]);
}

test('a new visitor sees a welcome, the same primary actions and the rails before the library', async ({
  page,
}, info) => {
  const phone = info.project.name === 'phone';
  const asked: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path === '/api/dev-session' || path.includes('/api/backend/')) asked.push(path);
  });
  await page.goto('/');
  // One friendly line, no numbers and no link: there is no progress to show yet.
  const strip = page.locator('.welcome-strip');
  await expect(strip).toHaveAttribute('data-state', 'new');
  await expect(strip).toContainText('Welcome.');
  expect(await strip.innerText()).not.toMatch(/\d/);
  await expect(strip.getByRole('link')).toHaveCount(0);

  // Home order: welcome, the actions, the tabs, the rails, then the whole library.
  const order = [
    await top(page, '.site-header'),
    await top(page, '.welcome-strip'),
    await top(page, '.hero-actions'),
    await top(page, '[role="tablist"]'),
    await top(page, '.game-collection'),
    await top(page, '#games'),
  ];
  expect(order).toEqual([...order].sort((a, b) => a - b));
  expect(order[4]).toBeLessThan(page.viewportSize()!.height);
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Quick with bots',
    'For teams',
    'Game night',
    'Two players',
    'On your own',
    'Games',
  ]);
  await expect(
    page.getByText('Picked for colleagues: no betting games, and drink prompts stay off unless you turn them on.'),
  ).toBeVisible();
  // No promotion sits above the main actions.
  await expect(
    page.locator('.lounge-dashboard > :not(.welcome-strip, .hero, .segmented-tabs)'),
  ).toHaveCount(0);

  // The library is complete, and the rails add no second "Open …" link.
  await expect(page.locator('.game-tile')).toHaveCount(catalogue.length);
  await expect(page.getByRole('link', { name: /^Open / })).toHaveCount(catalogue.length);
  const cards = page.locator('.game-rail-tile');
  expect(await cards.count()).toBeGreaterThan(20);
  // Every card, rail or library, states its players and its length.
  for (const meta of await page
    .locator('.game-rail-tile .game-meta, .game-tile .game-meta')
    .all()) {
    const text = await meta.innerText();
    expect(text).toMatch(/players|Solo|bots|Any group/);
    expect(text).toMatch(/\d\s*min/);
  }
  expect(
    await page
      .locator('.game-rail-tile .game-meta, .game-tile .game-meta')
      .evaluateAll((items) =>
        Math.min(...items.map((item) => parseFloat(getComputedStyle(item).fontSize))),
      ),
  ).toBeGreaterThanOrEqual(11);

  // Browsing asked the server for nothing: no guest, no profile, no progress.
  expect(asked).toEqual([]);

  // The three primary actions still do what they did.
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  const create = page.getByRole('dialog', { name: 'Create room', exact: true });
  await expect(create).toBeVisible();
  await create.getByRole('button', { name: 'Cancel', exact: true }).click();
  await page.getByRole('button', { name: 'Join a room', exact: true }).click();
  const join = page.getByRole('dialog', { name: 'Join room', exact: true });
  await expect(join.getByRole('textbox', { name: 'Room code', exact: true })).toBeVisible();
  await join.getByRole('button', { name: 'Cancel', exact: true }).click();
  const inlineCode = page.getByRole('textbox', { name: 'Room code or invite link', exact: true });
  // The code field sits beside Join a room only where there is room for it.
  if (phone) await expect(inlineCode).toBeHidden();
  else await expect(inlineCode).toBeVisible();

  await page.getByRole('button', { name: 'Play solo', exact: true }).click();
  const library = page.getByRole('region', { name: 'Games', exact: true });
  const solo = library.getByRole('button', { name: 'Solo + bots', exact: true });
  await expect(solo).toHaveAttribute('aria-pressed', 'true');
  await expect(solo).toBeInViewport();
  await expect(solo).toBeFocused();
  await expect(library.getByRole('combobox', { name: 'Players', exact: true })).toHaveValue('1');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // Tabs, search and categories.
  await library.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await library.getByRole('searchbox', { name: 'Search games' }).fill('poker');
  await expect(
    library.getByRole('link', { name: 'Open Texas Hold’em', exact: true }),
  ).toBeVisible();
  await library.getByRole('button', { name: 'Clear search', exact: true }).click();
  await library.getByRole('button', { name: 'Board games', exact: true }).click();
  await expect(library.getByRole('link', { name: 'Open Checkers', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Your games', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'No games yet', exact: true })).toBeVisible();
  await expect(cards.first()).toBeHidden();
  await page.getByRole('tab', { name: 'Games', exact: true }).click();
  await expect(library.getByRole('button', { name: 'Board games', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await fits(page);
});

test('rails scroll inside themselves at 320px and by keyboard, never the page', async ({
  page,
}, info) => {
  const phone = info.project.name === 'phone';
  if (phone) await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await fits(page);
  const teams = page.getByRole('region', { name: 'For teams', exact: true });
  const rail = teams.getByRole('group', { name: 'For teams games', exact: true });
  await teams.scrollIntoViewIfNeeded();
  const size = await rail.evaluate((frame) => ({
    scroll: frame.scrollWidth,
    client: frame.clientWidth,
    left: frame.scrollLeft,
  }));
  expect(size.scroll).toBeGreaterThan(size.client);
  expect(size.left).toBe(0);
  // A cut-off card shows there is more to the side.
  const frame = (await rail.boundingBox())!;
  const boxes = await rail.locator('.game-rail-tile').evaluateAll((items) =>
    items.map((item) => {
      const box = item.getBoundingClientRect();
      return { left: box.left, right: box.right };
    }),
  );
  expect(
    boxes.some((box) => box.left < frame.x + frame.width && box.right > frame.x + frame.width),
  ).toBe(true);
  for (const card of await rail.locator('.game-rail-tile').all())
    expect((await card.boundingBox())!.height).toBeGreaterThanOrEqual(44);

  // Keyboard: focusing a card further along brings it into the rail's view.
  const last = rail.locator('.game-rail-tile').last();
  await last.focus();
  await expect(last).toBeInViewport({ ratio: 0.95 });
  expect(await rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
  expect(await page.evaluate(() => scrollX)).toBe(0);
  await expect(last).toHaveCSS('outline-style', 'solid');
  await fits(page);

  const next = teams.getByRole('button', { name: 'Next games in For teams', exact: true });
  const previous = teams.getByRole('button', { name: 'Previous games in For teams', exact: true });
  if (phone) {
    // Touch scrolling is the control on a phone; the arrows are not drawn.
    await expect(next).toBeHidden();
  } else {
    await expect(next).toBeDisabled();
    // Each press moves most of a rail's width; a few reach the start.
    for (let press = 0; press < 4 && (await previous.isEnabled()); press++) {
      const from = await rail.evaluate((element) => element.scrollLeft);
      await previous.click();
      await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeLessThan(from);
      await page.waitForTimeout(400);
    }
    await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBe(0);
    await expect(previous).toBeDisabled();
    await next.click();
    await expect.poll(() => rail.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    for (const arrow of [next, previous]) {
      const box = (await arrow.boundingBox())!;
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
    }
    // A rail that fits has no arrows at all.
    await expect(
      page
        .getByRole('region', { name: 'On your own', exact: true })
        .getByRole('button', { name: /^(Next|Previous) games/ }),
    ).toHaveCount(0);
  }
  await expectTouchTargets(page, '.game-collections');
  await fits(page);
});

test('See all sets the library filter, and For teams narrows by group size and time', async ({
  page,
}, info) => {
  if (info.project.name === 'phone') await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const library = page.getByRole('region', { name: 'Games', exact: true });
  const tiles = library.getByRole('link', { name: /^Open / });
  const pressed = (name: string) => library.getByRole('button', { name, exact: true });

  await page.getByRole('button', { name: 'See all: Quick with bots', exact: true }).click();
  await expect(pressed('Solo + bots')).toHaveAttribute('aria-pressed', 'true');
  await expect(pressed('Solo + bots')).toBeFocused();
  await expect(library).toBeInViewport();
  await expect(library.getByRole('link', { name: 'Open Uno', exact: true })).toHaveAttribute(
    'href',
    '/games/uno?mode=bots',
  );

  await page.getByRole('button', { name: 'See all: Two players', exact: true }).click();
  await expect(pressed('All games')).toHaveAttribute('aria-pressed', 'true');
  await expect(library.getByRole('combobox', { name: 'Players', exact: true })).toHaveValue('2');
  await expect(library.getByRole('link', { name: 'Open Checkers', exact: true })).toBeVisible();
  await expect(library.getByRole('link', { name: 'Open Pop Tarot', exact: true })).toHaveCount(0);

  await page.getByRole('button', { name: 'See all: Game night', exact: true }).click();
  await expect(pressed('Party')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'See all: On your own', exact: true }).click();
  await expect(pressed('Solo + bots')).toHaveAttribute('aria-pressed', 'true');
  await expect(library.getByRole('combobox', { name: 'Players', exact: true })).toHaveValue('1');

  // For teams: the note, the allowlist, and the two quick filters.
  await page.getByRole('button', { name: 'See all: For teams', exact: true }).click();
  await expect(pressed('For teams')).toHaveAttribute('aria-pressed', 'true');
  await expect(library.getByRole('combobox', { name: 'Players', exact: true })).toHaveValue('0');
  await expect(tiles).toHaveCount(TEAM_PICKS);
  await expect(library.getByRole('status')).toHaveText(`${TEAM_PICKS} games`);
  await expect(
    library.getByText('Picked for colleagues: no betting games, and drink prompts stay off unless you turn them on.', { exact: true }),
  ).toBeVisible();
  for (const name of ['Secret Santa', 'Word Agents', 'Most Likely', 'Hot Seat'])
    await expect(library.getByRole('link', { name: `Open ${name}`, exact: true })).toBeVisible();
  for (const name of [
    'Spill or Chill',
    'Texas Hold’em',
    'Blackjack',
    'Roulette',
    'Slots',
    'Shithead',
  ])
    await expect(library.getByRole('link', { name: `Open ${name}`, exact: true })).toHaveCount(0);

  const sizes = library.getByRole('group', { name: 'Group size', exact: true });
  const times = library.getByRole('group', { name: 'Time', exact: true });
  await expect(sizes.getByRole('button')).toHaveText(['2–4', '5–8', '9+']);
  await expect(times.getByRole('button')).toHaveText(['Under 15 min', '15–30 min']);
  await expectTouchTargets(page, '.team-filters');
  await sizes.getByRole('button', { name: '9+', exact: true }).click();
  await expect(sizes.getByRole('button', { name: '9+', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(tiles).toHaveCount(7);
  await expect(library.getByRole('link', { name: 'Open Azul', exact: true })).toHaveCount(0);
  await times.getByRole('button', { name: 'Under 15 min', exact: true }).click();
  await expect(tiles).toHaveCount(4);
  await expect(library.getByRole('status')).toHaveText('4 games');
  await times.getByRole('button', { name: '15–30 min', exact: true }).click();
  expect(
    await tiles.evaluateAll((items) => items.map((item) => item.getAttribute('aria-label'))),
  ).toEqual(['Open Word Agents', 'Open Flip 7']);
  // Pressing a chosen filter again clears it.
  await sizes.getByRole('button', { name: '9+', exact: true }).click();
  await expect(sizes.getByRole('button', { name: '9+', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(tiles).toHaveCount(4);
  await sizes.getByRole('button', { name: '2–4', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(tiles).toHaveCount(4);
  await fits(page);

  // Reset returns to every game and puts the team filters away.
  await library.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(tiles).toHaveCount(catalogue.length);
  await expect(sizes).toHaveCount(0);
  await pressed('For teams').click();
  await expect(sizes.getByRole('button', { name: '2–4', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(tiles).toHaveCount(TEAM_PICKS);
  await fits(page);
});

test('a returning player sees level, streak and badges, an invitation ticket and rooms to continue', async ({
  page,
}, info) => {
  const phone = info.project.name === 'phone';
  let release: () => void = () => undefined;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  let progressAsked = '';
  await returning(page, {
    me: member({
      invitations: [
        {
          room_id: '44444444-4444-4444-8444-444444444444',
          room_name: 'Friday game night',
          game_id: 'uno',
          from_name: 'Sam Lee',
          from_avatar: 1,
          players: 2,
          capacity: 4,
          created_at: 1763856000,
        },
      ],
      rooms: [
        {
          id: '11111111-1111-4111-8111-111111111111',
          name: 'Tile club',
          game_id: 'azul',
          status: 'lobby',
          players: 2,
          capacity: 4,
        },
        {
          id: '22222222-2222-4222-8222-222222222222',
          name: 'Friday table',
          game_id: 'uno',
          status: 'playing',
          players: 3,
          capacity: 4,
        },
        {
          id: '33333333-3333-4333-8333-333333333333',
          name: 'Last game',
          game_id: 'holdem',
          status: 'finished',
          players: 2,
          capacity: 6,
        },
      ],
    }),
  });
  await page.unroute('**/api/backend/v1/progress*');
  await page.route('**/api/backend/v1/progress*', async (route) => {
    progressAsked = route.request().url();
    await held;
    await json(route, midLevel());
  });
  await page.goto('/');
  const strip = page.locator('.welcome-strip');
  // While progress is on its way the strip holds its place.
  await expect(strip).toHaveAttribute('data-state', 'loading');
  await expect(page.getByRole('region', { name: 'Invitations', exact: true })).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  const before = {
    strip: (await strip.boundingBox())!,
    title: await top(page, '.hero-title'),
    tabs: await top(page, '[role="tablist"]'),
  };
  release();
  await expect(strip).toHaveAttribute('data-state', 'ready');
  // Nothing below moved when the numbers arrived.
  expect((await strip.boundingBox())!.height).toBe(before.strip.height);
  expect(await top(page, '.hero-title')).toBe(before.title);
  expect(await top(page, '[role="tablist"]')).toBe(before.tabs);
  // The player's own day decides the streak, so the request carries their UTC offset.
  expect(new URL(progressAsked).searchParams.get('tz_offset')).toMatch(/^-?\d{1,3}$/);

  await expect(strip).toContainText('Level 3');
  await expect(strip).toContainText('110 XP to level 4');
  await expect(strip).toContainText('4-day streak');
  await expect(strip).toContainText('Play today to keep it going');
  await expect(strip).toContainText('4 of 6 badges');
  await expect(strip).toHaveAttribute('href', '/rewards');
  expect(await strip.innerText()).not.toMatch(/lost|broke|ended|hurry|claim/i);
  expect((await strip.boundingBox())!.height).toBeGreaterThanOrEqual(44);

  // Order: strip, actions, invitations, Continue, tabs, rails.
  const order = [
    await top(page, '.welcome-strip'),
    await top(page, '.hero-actions'),
    await top(page, '.invitations'),
    await top(page, '.continue-rail'),
    await top(page, '[role="tablist"]'),
    await top(page, '.game-collection'),
  ];
  expect(order).toEqual([...order].sort((a, b) => a - b));

  // The invitation is a ticket, with the same region, names and buttons as before.
  const invitations = page.getByRole('region', { name: 'Invitations', exact: true });
  const ticket = invitations.locator('.ticket.invitation');
  await expect(ticket).toHaveCount(1);
  await expect(ticket).toContainText('Sam Lee invited you to Friday game night');
  await expect(ticket).toContainText('Uno · 2 of 4 players');
  await expect(
    invitations.getByRole('button', { name: 'Join Friday game night', exact: true }),
  ).toBeVisible();
  await expect(
    invitations.getByRole('button', {
      name: 'Decline invitation to Friday game night',
      exact: true,
    }),
  ).toBeVisible();
  // The notches are cut out of the paper, not drawn on it.
  expect(
    await ticket
      .locator('.ticket-body')
      .evaluate(
        (body) => getComputedStyle(body).maskImage || getComputedStyle(body).webkitMaskImage,
      ),
  ).toContain('radial-gradient');
  expect(await ticket.evaluate((item) => getComputedStyle(item).flexDirection)).toBe(
    phone ? 'column' : 'row',
  );
  await expectTouchTargets(page, '.invitations');

  // Continue: the match in progress first, then the lobby; finished games stay in the tab.
  const cont = page.getByRole('region', { name: 'Continue', exact: true });
  await expect(cont.getByRole('link')).toHaveCount(2);
  await expect(cont.getByRole('link').nth(0)).toHaveAccessibleName('Continue Friday table, Uno');
  await expect(cont.getByRole('link').nth(1)).toHaveAccessibleName('Continue Tile club, Azul');
  await expect(cont.getByRole('link').first()).toHaveAttribute(
    'href',
    '/games/uno/rooms/22222222-2222-4222-8222-222222222222',
  );
  await expect(cont).not.toContainText('Last game');
  await page.getByRole('tab', { name: 'Your games', exact: true }).click();
  await expect(
    page.getByRole('link', { name: 'Open Last game, Texas Hold’em', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Open Friday table, Uno', exact: true }),
  ).toBeVisible();
  await fits(page);
  if (phone) {
    await page.setViewportSize({ width: 320, height: 844 });
    await fits(page);
    await expect(strip).toContainText('Play today to keep it going');
  }

  await page.getByRole('tab', { name: 'Games', exact: true }).click();
  await strip.click();
  await expect(page).toHaveURL(/\/rewards$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Progress and rewards', exact: true }),
  ).toBeVisible();
});

test('the streak is shown only as it stands, and a failed progress read falls back to the welcome', async ({
  page,
}, info) => {
  // The narrowest phone, where the strip's parts stack and must still hold one height.
  if (info.project.name === 'phone') await page.setViewportSize({ width: 320, height: 844 });
  let state: Progress | null = midLevel();
  await returning(page, { progress: () => state });
  // Each load is judged once its progress reply has been drawn.
  const load = async (open: () => Promise<unknown>) => {
    const answered = page.waitForResponse((response) =>
      new URL(response.url()).pathname.endsWith('/v1/progress'),
    );
    await open();
    await answered;
  };
  await load(() => page.goto('/'));
  const strip = page.locator('.welcome-strip');
  await expect(strip).toContainText('Play today to keep it going');
  const height = (await strip.boundingBox())!.height;

  state = { ...midLevel(), streak: { current: 4, best: 6, played_today: true } };
  await load(() => page.reload());
  await expect(strip).toContainText('4-day streak');
  await expect(strip).not.toContainText('Play today');
  expect((await strip.boundingBox())!.height).toBe(height);

  state = { ...midLevel(), streak: { current: 0, best: 6, played_today: false } };
  await load(() => page.reload());
  await expect(strip).toContainText('Level 3');
  await expect(strip).not.toContainText('streak');
  expect(await strip.innerText()).not.toMatch(/lost|broke|ended|missed/i);
  expect((await strip.boundingBox())!.height).toBe(height);

  state = {
    ...midLevel(),
    xp: 0,
    level: 1,
    level_xp: 0,
    next_level_xp: 50,
    totals: { games: 0, wins: 0, different_games: 0, with_friends: 0 },
  };
  await load(() => page.reload());
  await expect(strip).toHaveAttribute('data-state', 'new');
  await expect(strip).toContainText('Welcome.');
  expect(await strip.innerText()).not.toMatch(/\d/);
  expect((await strip.boundingBox())!.height).toBe(height);

  state = null;
  await load(() => page.reload());
  await expect(strip).toHaveAttribute('data-state', 'new');
  await expect(strip).toContainText('Welcome.');
  await expect(page.getByRole('button', { name: 'Play solo', exact: true })).toBeVisible();
});

test('the code field beside Join a room joins a known player or shows the server’s words', async ({
  page,
}, info) => {
  test.skip(info.project.name === 'phone', 'Phones join through the dialog.');
  await returning(page, {});
  const sent: unknown[] = [];
  await page.route('**/api/backend/v1/rooms/join', async (route) => {
    sent.push(route.request().postDataJSON());
    await json(route, { detail: 'That code doesn’t match an open room.' }, 404);
  });
  await page.goto('/');
  const code = page.getByRole('textbox', { name: 'Room code or invite link', exact: true });
  const join = page.getByRole('button', { name: 'Join a room', exact: true });
  for (const control of [code, join])
    expect((await control.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await code.fill('482913');
  await expect(code).toHaveValue('482 913');
  await code.press('Enter');
  const alert = page.locator('.join-inline-error');
  await expect(alert).toHaveText('That code doesn’t match an open room.');
  await expect(alert).toHaveAttribute('role', 'alert');
  expect(sent).toEqual([{ invite: '482913', ...PLAYER }]);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  // Something that is not a code is refused before anything is sent.
  await code.fill('javascript:alert(1)');
  await join.click();
  await expect(alert).toHaveText('Enter a room code or invite link.');
  expect(sent).toHaveLength(1);
  // Empty, the same button opens the dialog as it always has.
  await code.fill('');
  await expect(alert).toHaveCount(0);
  await join.click();
  await expect(page.getByRole('dialog', { name: 'Join room', exact: true })).toBeVisible();
});

test('rewards: progress, badges, and a coupon from Redeem to Use to In use, with a refusal', async ({
  page,
}, info) => {
  const state = midLevel();
  const find = (id: string) => state.rewards.find((item) => item.id === id)!;
  const calls: string[] = [];
  await returning(page, { progress: () => state });
  await page.route('**/api/backend/v1/rewards/*/redeem*', async (route) => {
    const url = new URL(route.request().url());
    const id = url.pathname.split('/').at(-2)!;
    calls.push(`redeem ${id} ${url.searchParams.has('tz_offset')}`);
    if (id === 'frame-confetti') {
      // The server no longer agrees it is earned, and says so in its own words.
      find(id).state = 'locked';
      find(id).value = 4;
      return json(
        route,
        { detail: 'Earn the Good company badge to redeem the Confetti frame.' },
        409,
      );
    }
    find(id).state = 'redeemed';
    await json(route, state);
  });
  await page.route('**/api/backend/v1/profile/cosmetics*', async (route) => {
    const body = route.request().postDataJSON() as {
      frame: string | null;
      card_back: string | null;
    };
    calls.push(`wear ${JSON.stringify(body)}`);
    for (const item of state.rewards)
      item.equipped = item.id === (item.kind === 'frame' ? body.frame : body.card_back);
    await json(route, state);
  });
  if (info.project.name === 'phone') await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/rewards');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Progress and rewards');
  // Three separate sections, in order.
  await expect(page.getByRole('heading', { level: 2 })).toHaveText([
    'Progress',
    'Badges',
    'Rewards',
  ]);

  const progress = page.getByRole('region', { name: 'Progress', exact: true });
  await expect(
    progress.getByRole('img', { name: 'Level 3, 40 of 150 XP toward level 4', exact: true }),
  ).toBeVisible();
  await expect(progress).toContainText('40 of 150 XP');
  await expect(progress).toContainText('110 XP to level 4');
  await expect(progress).toContainText('4-day streak');
  await expect(progress).toContainText('Best: 6 days');
  await expect(progress.locator('.progress-totals > div')).toHaveText([
    'Games played12',
    'Wins5',
    'Different games4',
    'With friends6',
  ]);

  const badges = page.getByRole('region', { name: 'Badges', exact: true });
  await expect(badges.getByRole('listitem')).toHaveCount(6);
  const earned = badges.getByRole('listitem').filter({ hasText: 'First game' });
  await expect(earned).toHaveAttribute('data-earned', 'true');
  await expect(earned).toContainText('Earned');
  const veteran = badges.getByRole('listitem').filter({ hasText: 'Veteran' });
  await expect(veteran).toHaveAttribute('data-earned', 'false');
  await expect(veteran).toContainText('12 of 50');
  await expect(veteran.getByRole('progressbar', { name: 'Veteran progress' })).toHaveAttribute(
    'value',
    '12',
  );
  // Earned and unearned differ by more than colour: a check and a word, or a bar and a count.
  await expect(veteran).not.toContainText('Earned');

  const rewards = page.getByRole('region', { name: 'Rewards', exact: true });
  const frames = rewards.getByRole('region', { name: 'Avatar frames', exact: true });
  const backs = rewards.getByRole('region', { name: 'Card backs', exact: true });
  await expect(frames.locator('.reward-coupon h4')).toHaveText([
    'Gold frame',
    'Laurel frame',
    'Confetti frame',
    'Crown frame',
  ]);
  await expect(backs.locator('.reward-coupon h4')).toHaveText([
    'Midnight card back',
    'Sunrise card back',
  ]);
  const coupon = (name: string) => rewards.locator('.reward-coupon').filter({ hasText: name });
  // Locked: the requirement and how far along, and nothing to press.
  const crown = coupon('Crown frame');
  await expect(crown).toHaveAttribute('data-state', 'locked');
  await expect(crown).toContainText('Locked');
  await expect(crown).toContainText('Reach level 8');
  await expect(crown).toContainText('3 of 8');
  await expect(crown.getByRole('button')).toHaveCount(0);
  // The stub previews the cosmetic itself.
  await expect(crown.locator('.reward-preview .avatar[data-frame="frame-crown"]')).toBeVisible();
  await expect(
    coupon('Sunrise card back').locator('[data-card-back="back-sunrise"] .playing-card--back'),
  ).toBeVisible();

  // Available -> Redeem.
  const gold = coupon('Gold frame');
  await expect(gold).toHaveAttribute('data-state', 'available');
  await expect(gold).toContainText('Ready to redeem');
  const status = rewards.getByRole('status');
  // The live message has its own reserved line above the coupons.
  const gap = async () => (await gold.boundingBox())!.y - (await status.boundingBox())!.y;
  const before = await gap();
  await gold.getByRole('button', { name: 'Redeem Gold frame', exact: true }).click();
  await expect(status).toHaveText('Gold frame redeemed. It’s yours to use.');
  await expect(gold).toHaveAttribute('data-state', 'redeemed');
  await expect(gold).toContainText('Redeemed');
  // The tear plays once and then lets go.
  await expect(gold).not.toHaveAttribute('data-just-redeemed', 'true', { timeout: 5000 });
  // Redeemed -> Use -> In use, and the frame worn before comes off with it.
  await gold.getByRole('button', { name: 'Use Gold frame', exact: true }).click();
  await expect(status).toHaveText('Now using the gold frame.');
  await expect(gold).toContainText('In use');
  await expect(gold).toHaveAttribute('data-equipped', 'true');
  await expect(
    gold.getByRole('button', { name: 'Take off: Gold frame', exact: true }),
  ).toBeVisible();
  await expect(
    coupon('Laurel frame').getByRole('button', { name: 'Use Laurel frame' }),
  ).toBeVisible();
  // The message did not push the coupons down.
  expect(await gap()).toBe(before);

  await gold.getByRole('button', { name: 'Take off: Gold frame', exact: true }).click();
  await expect(status).toHaveText('Frame taken off.');
  await expect(gold.getByRole('button', { name: 'Use Gold frame', exact: true })).toBeVisible();
  const midnight = coupon('Midnight card back');
  await expect(midnight).toContainText('In use');
  await midnight.getByRole('button', { name: 'Use standard back: Midnight card back' }).click();
  await expect(status).toHaveText('Back to the standard card back.');
  await expect(midnight.getByRole('button', { name: 'Use Midnight card back' })).toBeVisible();
  // Both worn things are always sent together; null takes one off.
  expect(calls).toEqual([
    'redeem frame-gold true',
    'wear {"frame":"frame-gold","card_back":"back-midnight"}',
    'wear {"frame":null,"card_back":"back-midnight"}',
    'wear {"frame":null,"card_back":null}',
  ]);

  // A refused redeem shows the server's sentence on that coupon and re-reads progress.
  const confetti = coupon('Confetti frame');
  await confetti.getByRole('button', { name: 'Redeem Confetti frame', exact: true }).click();
  await expect(confetti.getByRole('alert')).toHaveText(
    'Earn the Good company badge to redeem the Confetti frame.',
  );
  await expect(confetti).toHaveAttribute('data-state', 'locked');
  await expect(confetti).toContainText('4 of 5');
  await expect(confetti.getByRole('button')).toHaveCount(0);
  await expect(status).toHaveText('');

  await expectTouchTargets(page, '.rewards-page');
  await fits(page);
  expect(await page.locator('.rewards-page').innerText()).not.toMatch(
    /buy|price|₹|\$|purchase|claim now|hurry|expires|limited time/i,
  );
});

test('redeeming under reduced motion changes state at once, and the page links back from profile and results', async ({
  page,
}) => {
  const state = midLevel();
  await returning(page, { progress: () => state });
  await page.route('**/api/backend/v1/rewards/*/redeem*', async (route) => {
    state.rewards[0].state = 'redeemed';
    await json(route, state);
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/rewards');
  const gold = page.locator('.reward-coupon').filter({ hasText: 'Gold frame' });
  await gold.getByRole('button', { name: 'Redeem Gold frame', exact: true }).click();
  await expect(gold).toHaveAttribute('data-state', 'redeemed');
  expect(
    await gold.locator('.reward-preview').evaluate((stub) => getComputedStyle(stub).animationName),
  ).toBe('none');
  await expect(
    page.getByRole('region', { name: 'Rewards', exact: true }).getByRole('status'),
  ).toHaveText('Gold frame redeemed. It’s yours to use.');
  await page.goto('/profile');
  await page.getByRole('link', { name: 'Progress and rewards', exact: true }).click();
  await expect(page).toHaveURL(/\/rewards$/);
});

test('someone with no player is told how to start, and a failed read can be retried', async ({
  page,
}) => {
  const asked: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path === '/api/dev-session' || path.endsWith('/v1/me')) asked.push(path);
  });
  await page.goto('/rewards');
  await expect(
    page.getByRole('heading', { name: 'Play a game to get started', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: 'Choose a game', exact: true })).toHaveAttribute(
    'href',
    '/',
  );
  // Looking at the page created no guest.
  expect(asked).toEqual([]);

  let fail = true;
  await page.route('**/api/backend/v1/progress*', (route) =>
    fail ? json(route, { detail: 'Unavailable' }, 503) : json(route, midLevel()),
  );
  await page.route('**/api/backend/v1/me', (route) => json(route, member()));
  await page.reload();
  await expect(
    page.getByRole('heading', { name: 'Your progress didn’t load', exact: true }),
  ).toBeVisible({ timeout: 20000 });
  fail = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await expect(page.getByRole('region', { name: 'Badges', exact: true })).toBeVisible();
});

// ---------------------------------------------------------------------------
// Real games against the local backend.
// ---------------------------------------------------------------------------

const owned = new WeakMap<
  Page,
  { rooms: { actor: Page; id: string }[]; close: (() => Promise<void>)[] }
>();

test.afterEach(async ({ page }) => {
  test.setTimeout(45000);
  const mine = owned.get(page);
  if (!mine) return;
  try {
    // Guests leave before the host, so the host's leave closes the room.
    for (const room of [...mine.rooms].reverse()) {
      const current = await requestAs(room.actor, `rooms/${room.id}`);
      if (current.status() === 404) continue;
      if (((await current.json()) as RoomView).status === 'playing')
        await requestAs(room.actor, `rooms/${room.id}/abandon`, 'POST');
      expect([200, 404]).toContain(
        (await requestAs(room.actor, `rooms/${room.id}/leave`, 'POST')).status(),
      );
    }
    for (const room of mine.rooms)
      expect([404, 403]).toContain((await requestAs(room.actor, `rooms/${room.id}`)).status());
  } finally {
    for (const close of mine.close) await close();
    owned.delete(page);
  }
});

test('real games earn XP and the first badge, unlock a frame to redeem and wear, and a friend sees it', async ({
  page,
  browser,
  baseURL,
}) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Plays real local games and closes their rooms.');
  test.setTimeout(300000);
  const mine = { rooms: [] as { actor: Page; id: string }[], close: [] as (() => Promise<void>)[] };
  owned.set(page, mine);
  const hostName = `Frame Host ${randomUUID().slice(0, 4)}`;
  const progressOf = async (actor: Page) => {
    const response = await requestAs(actor, 'progress');
    expect(response.status()).toBe(200);
    return (await response.json()) as Progress;
  };
  const refresh = () => page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));

  // 1. A real quick game against a bot: Four in a Row, started from the dialog.
  await page.goto('/');
  await openGameSetup(page, 'four-in-a-row');
  await page.getByRole('textbox', { name: 'Your name', exact: true }).fill(hostName);
  await page
    .getByRole('group', { name: 'Play with', exact: true })
    .getByRole('button', { name: 'Bots', exact: true })
    .click();
  await page.getByRole('button', { name: 'Play game', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/, { timeout: 45000 });
  const boardRoom = new URL(page.url()).pathname.split('/').at(-1)!;
  mine.rooms.push({ actor: page, id: boardRoom });
  const self = ((await (await requestAs(page, 'me')).json()) as Me).profile!.id;
  const start = await progressOf(page);
  expect(start.totals.games).toBe(0);
  expect(start.rewards.every((item) => item.state === 'locked')).toBe(true);

  // The human plays legal moves from their own view; the page's own driver moves the bot.
  const choose = matchPlayer();
  let snapshot = await roomAs(page, boardRoom);
  let advanced = Date.now();
  let version = snapshot.match_version;
  while (snapshot.status === 'playing') {
    snapshot = await roomAs(page, boardRoom);
    if (snapshot.status !== 'playing') break;
    if (snapshot.match_version !== version) {
      version = snapshot.match_version;
      advanced = Date.now();
    }
    expect(Date.now() - advanced, 'The match keeps moving').toBeLessThan(45000);
    const view = snapshot.game!;
    if (view.actions?.length && !snapshot.bot_pending) {
      const moved = await requestAs(page, `rooms/${boardRoom}/actions`, 'POST', {
        match_id: snapshot.match_id!,
        action_id: randomUUID(),
        expected_version: snapshot.match_version!,
        action: choose(view),
      } satisfies components['schemas']['Move']);
      expect([200, 409]).toContain(moved.status());
      await refresh();
    }
    await page.waitForTimeout(300);
  }
  expect(snapshot.status).toBe('finished');
  const won = snapshot.game!.winners.includes(self);
  await refresh();

  // 2. Under the result: the progress line, with the rematch controls still usable.
  const line = page.getByRole('region', { name: 'Your progress', exact: true });
  await expect(page.getByRole('region', { name: 'Match results', exact: true })).toBeVisible();
  await expect(line).toContainText('Level 1');
  const first = await progressOf(page);
  // 10 for the game, 15 for a game never played before, 10 more for a win.
  expect(first.xp).toBe(won ? 35 : 25);
  expect(first.level).toBe(1);
  expect(first.totals).toMatchObject({ games: 1, wins: won ? 1 : 0, different_games: 1 });
  expect(first.streak).toEqual({ current: 1, best: 1, played_today: true });
  await expect(line).toContainText(`${50 - first.xp} XP to level 2`);
  await expect(line).toContainText('1-day streak');
  await expect(line.getByRole('link', { name: 'See rewards', exact: true })).toHaveAttribute(
    'href',
    '/rewards',
  );
  const results = (await page.getByRole('region', { name: 'Match results' }).boundingBox())!;
  const lineBox = (await line.boundingBox())!;
  const ready = page.getByRole('button', { name: 'I’m ready', exact: true });
  expect(lineBox.y).toBeGreaterThanOrEqual(results.y + results.height - 1);
  expect((await ready.boundingBox())!.y).toBeGreaterThan(lineBox.y);
  await expect(ready).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);

  // 3. /rewards shows the same XP and the first badge; nothing is redeemable yet.
  await line.getByRole('link', { name: 'See rewards', exact: true }).click();
  await expect(page).toHaveURL(/\/rewards$/);
  const progress = page.getByRole('region', { name: 'Progress', exact: true });
  await expect(progress).toContainText(`${first.xp} of 50 XP`);
  await expect(progress).toContainText(`${first.xp} XP in all`);
  await expect(progress).toContainText('1-day streak');
  await expect(progress.locator('.progress-totals > div').first()).toHaveText('Games played1');
  const badges = page.getByRole('region', { name: 'Badges', exact: true });
  await expect(badges.getByRole('listitem')).toHaveCount(first.badges.length);
  const firstGame = badges.getByRole('listitem').filter({ hasText: 'First game' });
  await expect(firstGame).toHaveAttribute('data-earned', 'true');
  await expect(firstGame).toContainText('Earned');
  await expect(badges.getByRole('listitem').filter({ hasText: 'Regular' })).toContainText(
    '1 of 10',
  );
  const coupons = page.locator('.reward-coupon');
  await expect(coupons).toHaveCount(first.rewards.length);
  const gold = coupons.filter({ hasText: 'Gold frame' });
  await expect(gold).toHaveAttribute('data-state', 'locked');
  await expect(gold).toContainText('Reach level 2');
  await expect(gold).toContainText('1 of 2');
  // Names and requirements are the server's own.
  for (const item of first.rewards)
    await expect(coupons.filter({ hasText: item.name })).toContainText(item.requirement);
  // The server refuses a locked reward and a cosmetic that is not redeemed, in plain words.
  const forced = await requestAs(page, 'rewards/frame-gold/redeem', 'POST');
  expect(forced.status()).toBe(409);
  expect(typeof (await forced.json()).detail).toBe('string');
  expect(
    (
      await requestAs(page, 'profile/cosmetics', 'PUT', { frame: 'frame-gold', card_back: null })
    ).status(),
  ).toBe(409);
  expect((await progressOf(page)).rewards.find((item) => item.id === 'frame-gold')!.state).toBe(
    'locked',
  );

  // 4. A second, different game reaches level 2: five spins of Slots end a session.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/games/slots');
  const created = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      new URL(response.url()).pathname.endsWith('/games/slots/play'),
  );
  await page.getByRole('button', { name: 'Play solo', exact: true }).click();
  const slots = (await (await created).json()) as RoomView;
  mine.rooms.push({ actor: page, id: slots.id });
  for (let spin = 1; spin <= 5; spin++) {
    const saved = page.waitForResponse(
      (response) =>
        response.request().method() === 'POST' &&
        new URL(response.url()).pathname.endsWith(`/rooms/${slots.id}/actions`),
    );
    await page.getByRole('button', { name: 'Spin', exact: true }).click();
    expect((await saved).status()).toBe(200);
  }
  await expect.poll(async () => (await roomAs(page, slots.id)).status).toBe('finished');
  // A solo result carries the same line.
  await expect(page.getByRole('region', { name: 'Your progress', exact: true })).toContainText(
    'Level 2',
  );
  await expect(page.getByRole('button', { name: 'Play again', exact: true })).toBeEnabled();
  const second = await progressOf(page);
  expect(second.xp).toBeGreaterThanOrEqual(50);
  expect(second.level).toBe(2);
  expect(second.totals).toMatchObject({ games: 2, different_games: 2 });
  expect(second.rewards.find((item) => item.id === 'frame-gold')!.state).toBe('available');

  // 5. Redeem the Gold frame and wear it.
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/rewards');
  await expect(gold).toHaveAttribute('data-state', 'available');
  const status = page.getByRole('region', { name: 'Rewards', exact: true }).getByRole('status');
  await gold.getByRole('button', { name: 'Redeem Gold frame', exact: true }).click();
  await expect(status).toHaveText('Gold frame redeemed. It’s yours to use.');
  await expect(gold).toHaveAttribute('data-state', 'redeemed');
  await gold.getByRole('button', { name: 'Use Gold frame', exact: true }).click();
  await expect(status).toHaveText('Now using the gold frame.');
  await expect(gold).toContainText('In use');
  await expect(
    gold.getByRole('button', { name: 'Take off: Gold frame', exact: true }),
  ).toBeVisible();
  const worn = await progressOf(page);
  expect(worn.rewards.find((item) => item.id === 'frame-gold')).toMatchObject({
    state: 'redeemed',
    equipped: true,
  });
  expect(((await (await requestAs(page, 'me')).json()) as Me).profile).toMatchObject({
    frame: 'frame-gold',
  });
  // It survives a reload, and shows on the profile page.
  await page.reload();
  await expect(gold).toContainText('In use');
  await page.goto('/profile');
  await expect(
    page.locator('.avatar-options .avatar[data-frame="frame-gold"]').first(),
  ).toBeVisible();

  // 6. A friend in the same room sees the frame on the host's seat.
  await page.goto('/');
  await openGameSetup(page, 'Uno');
  await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
  await page.getByRole('button', { name: 'Create room', exact: true }).click();
  await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
  const unoRoom = new URL(page.url()).pathname.split('/').at(-1)!;
  mine.rooms.push({ actor: page, id: unoRoom });
  const panel = page.getByRole('group', { name: 'Invite friends', exact: true });
  const code = await panel.locator('.room-code').innerText();
  expect(code).toMatch(/^\d{3} \d{3}$/);
  // The invite panel is a ticket: the code on the stub, the link and actions in the body.
  await expect(panel.locator('.ticket-stub .room-code')).toHaveText(code);
  await expect(panel.locator('.ticket-body .invite-link')).toContainText('/r/');
  await expect(
    panel.locator('.ticket-body').getByRole('button', { name: 'Copy link' }),
  ).toBeVisible();
  await expect(
    panel.locator('.ticket-body').getByRole('button', { name: 'Copy code' }),
  ).toBeVisible();
  const hostSeat = (actor: Page) =>
    actor.locator('.lobby-seats .seat').filter({ hasText: hostName });
  await expect(hostSeat(page).locator('.avatar')).toHaveAttribute('data-frame', 'frame-gold');
  await expect(hostSeat(page).locator('.avatar')).toHaveAttribute('aria-label', hostName);
  await expect(hostSeat(page).locator('.avatar-frame')).toHaveAttribute('aria-hidden', 'true');

  const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  mine.close.push(() => context.close());
  const friend = await context.newPage();
  await friend.goto('/');
  await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
  await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Frame Friend');
  await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
  await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
  await expect(friend).toHaveURL(new RegExp(`/rooms/${unoRoom}$`));
  mine.rooms.push({ actor: friend, id: unoRoom });
  await expect(hostSeat(friend).locator('.avatar')).toHaveAttribute('data-frame', 'frame-gold');
  await expect(hostSeat(friend).locator('.avatar-frame svg')).toBeVisible();
  // The friend wears nothing, and the server says the same to both.
  const friendSeat = friend.locator('.lobby-seats .seat').filter({ hasText: 'Frame Friend' });
  await expect(friendSeat.locator('.avatar')).not.toHaveAttribute('data-frame', /.+/);
  const seen = await roomAs(friend, unoRoom);
  expect(seen.members.find((item) => item.id === self)).toMatchObject({ frame: 'frame-gold' });
  expect(seen.members.find((item) => item.id !== self)?.frame ?? null).toBeNull();
  // The friend's own progress is their own: nothing of the host's shows there.
  expect((await progressOf(friend)).xp).toBe(0);

  // 7. Taking it off reaches the friend's screen too.
  expect(
    (await requestAs(page, 'profile/cosmetics', 'PUT', { frame: null, card_back: null })).status(),
  ).toBe(200);
  // The change bumps the room, so the friend's open lobby follows without a reload.
  await expect(hostSeat(friend).locator('.avatar')).toBeVisible();
  await expect(hostSeat(friend).locator('.avatar')).not.toHaveAttribute('data-frame', /.+/, {
    timeout: 30000,
  });
});
