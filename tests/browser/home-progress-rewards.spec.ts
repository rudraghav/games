import { expect, test, type Page, type Route } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import type { components } from '../../packages/api-client/src/generated/schema';
import catalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };
import { openCreateRoom, openGameSetup, requestAs, roomAs, type RoomView } from './helpers';
import { matchPlayer } from './fullmatch-player';

// The home page (Start, then Browse), progress and rewards. The first group runs
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

const TEAMS_NOTE =
  'Picked for colleagues: no betting games, and drink prompts stay off unless you turn them on.';
const OCCASIONS = ['All', 'Quick with bots', 'With friends', 'Two players', 'Solo', 'For teams'];
const tileNames = (page: Page) =>
  page
    .locator('.game-tile')
    .evaluateAll((tiles) => tiles.map((tile) => tile.getAttribute('aria-label')));

test('a new visitor lands on the games: one heading, one library, every game once', async ({
  page,
}, info) => {
  const phone = info.project.name === 'phone';
  const asked: string[] = [];
  page.on('request', (request) => {
    const path = new URL(request.url()).pathname;
    if (path === '/api/dev-session' || path.includes('/api/backend/')) asked.push(path);
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  // The page opens on the games. Its one h1 is the library's own heading; there is no
  // headline-with-actions block and no Play solo button (the chips do that job).
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(['Choose a game']);
  await expect(page.locator('.home-start, .home-actions, .home-action')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Play solo', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Create room', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Room code or invite link' })).toHaveCount(0);
  // Nothing on the page is a filled primary button competing with the games.
  await expect(page.locator('.button--primary:visible')).toHaveCount(0);
  // Nothing for someone who has never played: no welcome line, no level, no rooms, no invitation.
  await expect(page.locator('.welcome-strip, .progress-chip')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Continue', exact: true })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Invitations', exact: true })).toHaveCount(0);
  // The body is the library and nothing else.
  await expect(page.locator('.lounge-dashboard > *')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 2 })).toHaveCount(0);

  // A search box, one row of six occasions, and each game exactly once.
  const library = page.getByRole('region', { name: 'Games', exact: true });
  await expect(library.getByRole('searchbox', { name: 'Search games' })).toBeVisible();
  const occasions = library.getByRole('group', { name: 'Occasion', exact: true });
  await expect(occasions.getByRole('button')).toHaveText(OCCASIONS);
  await expect(occasions.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(page.locator('.game-tile')).toHaveCount(catalogue.length);
  await expect(page.getByRole('link', { name: /^Open / })).toHaveCount(catalogue.length);
  const names = await tileNames(page);
  expect(new Set(names).size).toBe(catalogue.length);
  // Pop Tarot, the featured game, leads; then the first four discovery slots.
  expect(names.slice(0, 5)).toEqual([
    'Open Pop Tarot',
    'Open The Gang',
    'Open Shithead',
    'Open Sea Salt & Paper',
    'Open boop.',
  ]);
  // One featured card: a full-width tile with an eyebrow, the name, one line, the same
  // quiet meta line and one call to action. It is Pop Tarot's only appearance here.
  const featured = page.locator('.game-tile[data-variant="featured"]');
  await expect(featured).toHaveCount(1);
  await expect(featured).toHaveAccessibleName('Open Pop Tarot');
  await expect(featured).toHaveAttribute('href', '/games/tarot');
  await expect(page.getByRole('link', { name: 'Open Pop Tarot', exact: true })).toHaveCount(1);
  await expect(featured.locator('.game-featured-body > *')).toHaveText([
    'Featured',
    'Pop Tarot',
    'Choose three cards for a personal reading',
    'Solo · 5–10 min',
    'Start reading',
  ]);
  const grid = (await page.locator('.catalogue-grid').boundingBox())!;
  const card = (await featured.boundingBox())!;
  expect(Math.abs(card.width - grid.width)).toBeLessThanOrEqual(1);
  expect(card.y).toBe(grid.y);
  // Calm and compact, not a banner.
  expect(card.height).toBeLessThanOrEqual(phone ? 264 : 200);
  const action = (await featured.locator('.game-featured-action').boundingBox())!;
  expect(action.height).toBeGreaterThanOrEqual(44);
  // Removed on purpose: rails, See all, the Players dropdown and the nine kinds of game
  // as filters.
  await expect(page.locator('.game-rail-tile, .game-collection')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^See all/ })).toHaveCount(0);
  await expect(page.getByRole('combobox')).toHaveCount(0);
  for (const gone of [
    'Modern favourites',
    'Cards',
    'Casino',
    'Board games',
    'Party',
    'Co-op',
    'Solo + bots',
  ])
    await expect(page.getByRole('button', { name: gone, exact: true })).toHaveCount(0);
  await expect(page.getByText('Featured', { exact: true })).toHaveCount(1);

  // A tile is a cover, a name and one quiet line: who can play and for how long.
  const lines = await page.locator('.game-tile .game-tile-meta').allInnerTexts();
  expect(lines).toHaveLength(catalogue.length);
  for (const line of lines)
    expect(line).toMatch(/^(\d+(–\d+)? players|Solo|Any group) · \d+(–\d+)? min$/);
  const uno = library.getByRole('link', { name: 'Open Uno', exact: true });
  await expect(uno.locator('.game-tile-name')).toHaveText('Uno');
  await expect(uno.locator('.game-tile-meta')).toHaveText('2–10 players · 10–20 min');
  // Nothing else under the cover: no blurb, arrow or badge.
  expect(await uno.locator(':scope > :not(.game-poster)').count()).toBe(2);
  await expect(uno).toHaveAttribute('href', '/games/uno');
  expect(
    await page
      .locator('.game-tile-meta')
      .evaluateAll((items) =>
        Math.min(...items.map((item) => parseFloat(getComputedStyle(item).fontSize))),
      ),
  ).toBeGreaterThanOrEqual(12);
  // The cover art is scaled whole into the smaller poster, never cut off.
  expect(
    await page.locator('.game-tile').evaluateAll((tiles) =>
      tiles.flatMap((tile) => {
        const poster = tile.querySelector('.game-poster')!.getBoundingClientRect();
        return [
          ...tile.querySelectorAll(
            '.game-poster .playing-card, .game-poster .tarot-card, .game-poster .word-tile',
          ),
        ].flatMap((item) => {
          const box = item.getBoundingClientRect();
          return box.left < poster.left - 1 ||
            box.right > poster.right + 1 ||
            box.top < poster.top - 1 ||
            box.bottom > poster.bottom + 1
            ? [tile.getAttribute('aria-label')]
            : [];
        });
      }),
    ),
  ).toEqual([]);

  // Order down the page, and a first screen that is almost entirely games.
  const order = [
    await top(page, '.site-header'),
    await top(page, 'h1'),
    await top(page, '.library-search'),
    await top(page, '.catalogue-grid'),
  ];
  expect(order).toEqual([...order].sort((a, b) => a - b));
  const viewport = page.viewportSize()!;
  // The featured card starts in the top third or so, and at least the top of the first
  // row of ordinary tiles is on the first screen (the whole row on a wide screen).
  expect(card.y).toBeLessThan(phone ? 300 : 280);
  const firstTile = (await page.locator('.game-tile:not([data-variant])').first().boundingBox())!;
  expect(firstTile.y).toBeLessThan(viewport.height - 40);
  if (!phone) expect(firstTile.y + firstTile.height).toBeLessThan(viewport.height - 200);
  // The whole page is a fraction of what it was (5,876px on desktop, about 7,300px on a phone).
  const pageHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  expect(pageHeight).toBeLessThan(phone ? 3250 : 1850);
  // Columns: two on a phone, five on a wide screen.
  const firstRow = await page
    .locator('.game-tile:not([data-variant])')
    .evaluateAll(
      (tiles) =>
        tiles.filter(
          (tile) => tile.getBoundingClientRect().top === tiles[0].getBoundingClientRect().top,
        ).length,
    );
  expect(firstRow).toBe(phone ? 2 : 5);
  if (!phone) {
    await page.setViewportSize({ width: 800, height: 900 });
    expect(
      await page
        .locator('.game-tile:not([data-variant])')
        .evaluateAll(
          (tiles) =>
            tiles.filter(
              (tile) => tile.getBoundingClientRect().top === tiles[0].getBoundingClientRect().top,
            ).length,
        ),
    ).toBe(3);
    await fits(page);
    await page.setViewportSize(viewport);
  }
  await expectTouchTargets(page, '.lounge-dashboard');
  await expectTouchTargets(page, '.site-header');
  await fits(page);
  // Browsing asked the server for nothing: no guest, no profile, no progress.
  expect(asked).toEqual([]);

  // The chips do what Play solo did: Quick with bots opens games ready to play alone.
  const quick = occasions.getByRole('button', { name: 'Quick with bots', exact: true });
  await quick.click();
  await expect(quick).toHaveAttribute('aria-pressed', 'true');
  expect((await tileNames(page)).sort()).toEqual([
    'Open Blackjack',
    'Open Four in a Row',
    'Open Mancala',
    'Open Trio',
    'Open Uno',
  ]);
  await expect(uno).toHaveAttribute('href', '/games/uno?mode=bots');
  await expect(uno).toContainText('You + bots · 10–20 min');

  // Tabs: two quiet text tabs on the heading's row; the rooms view is unchanged.
  const games = page.getByRole('tab', { name: 'Games', exact: true });
  const rooms = page.getByRole('tab', { name: 'Your games', exact: true });
  const bar = await page.locator('.segmented-tabs-bar').evaluate((row) => {
    const box = (element: Element) => element.getBoundingClientRect().toJSON();
    return {
      heading: box(row.querySelector('h1')!),
      tabs: [...row.querySelectorAll('[role="tab"]')].map(box),
    };
  });
  expect(bar.tabs).toHaveLength(2);
  for (const box of bar.tabs) {
    expect(box.height).toBeGreaterThanOrEqual(44);
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.left).toBeGreaterThan(bar.heading.right);
    expect(
      Math.abs(box.top + box.height / 2 - (bar.heading.top + bar.heading.height / 2)),
    ).toBeLessThan(12);
  }
  await rooms.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(['Your games']);
  await expect(page.getByRole('heading', { name: 'No games yet', exact: true })).toBeVisible();
  await expect(page.locator('.game-tile:visible')).toHaveCount(0);
  await games.click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(['Choose a game']);
  await expect(quick).toHaveAttribute('aria-pressed', 'true');
  await fits(page);
});

test('the header keeps Join a room one tap away and puts the rest in a More menu', async ({
  page,
}, info) => {
  const phone = info.project.name === 'phone';
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const header = page.locator('.site-header');
  const join = header.getByRole('button', { name: 'Join a room', exact: true });
  const more = header.getByRole('button', { name: 'More', exact: true });
  const account = header.getByRole('link', { name: 'Sign in', exact: true });
  const menu = page.getByRole('menu', { name: 'More', exact: true });

  // One calm row at every width: wordmark, Join a room, More, the account. Nothing wraps.
  for (const width of phone ? [390, 360, 320] : [1440, 800]) {
    await page.setViewportSize({ width, height: phone ? 844 : 900 });
    const boxes = await Promise.all(
      [header.getByRole('link', { name: 'Games home' }), join, more, account].map(
        async (control) => (await control.boundingBox())!,
      ),
    );
    for (let index = 1; index < boxes.length; index++) {
      expect(boxes[index].x).toBeGreaterThanOrEqual(boxes[index - 1].x + boxes[index - 1].width);
      expect(boxes[index].height).toBeGreaterThanOrEqual(44);
      expect(boxes[index].width).toBeGreaterThanOrEqual(44);
      // Vertically centred on one line.
      expect(
        Math.abs(boxes[index].y + boxes[index].height / 2 - (boxes[1].y + boxes[1].height / 2)),
      ).toBeLessThanOrEqual(2);
    }
    const edge = (await header.boundingBox())!;
    expect(boxes[3].x + boxes[3].width).toBeLessThanOrEqual(edge.x + edge.width + 0.5);
    await fits(page);
  }
  // The visible words shorten on a phone; the name does not.
  expect(await join.innerText()).toBe(phone ? 'Join' : 'Join a room');
  // Quiet: neither header control is a filled button.
  await expect(header.locator('.button--primary')).toHaveCount(0);

  // Join a room opens the join dialog directly, with no menu in between.
  await join.click();
  const joinDialog = page.getByRole('dialog', { name: 'Join room', exact: true });
  await expect(joinDialog.getByRole('textbox', { name: 'Room code', exact: true })).toBeVisible();
  await joinDialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(joinDialog).toHaveCount(0);
  await expect(join).toBeFocused();

  // More is a real menu button.
  await expect(more).toHaveAttribute('aria-haspopup', 'menu');
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  await expect(menu).toHaveCount(0);
  await more.click();
  await expect(more).toHaveAttribute('aria-expanded', 'true');
  await expect(menu).toBeVisible();
  await expect(more).toHaveAttribute('aria-controls', (await menu.getAttribute('id'))!);
  const items = menu.getByRole('menuitem');
  await expect(items).toHaveText(['Create room', 'Your games', 'Progress and rewards']);
  await expect(items.nth(2)).toHaveAttribute('href', '/rewards');
  for (const item of await items.all())
    expect((await item.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  // It stays inside the page.
  const list = (await menu.boundingBox())!;
  expect(list.x).toBeGreaterThanOrEqual(0);
  expect(list.x + list.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  await fits(page);

  // Keyboard: focus starts on the first item; arrows wrap; Home and End jump; a letter finds.
  await expect(items.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(items.nth(1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(items.nth(2)).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(items.nth(0)).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(items.nth(2)).toBeFocused();
  await page.keyboard.press('Home');
  await expect(items.nth(0)).toBeFocused();
  await page.keyboard.press('y');
  await expect(items.nth(1)).toBeFocused();
  await expect(items.nth(1)).toHaveCSS('outline-style', 'solid');
  // Escape closes it and returns focus to the button.
  await page.keyboard.press('Escape');
  await expect(menu).toHaveCount(0);
  await expect(more).toBeFocused();
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  // Arrow Up on the button opens it at the last item.
  await page.keyboard.press('ArrowUp');
  await expect(items.nth(2)).toBeFocused();
  // A press outside closes it.
  await page.mouse.click(8, page.viewportSize()!.height - 8);
  await expect(menu).toHaveCount(0);
  // Tabbing away closes it too.
  await more.focus();
  await page.keyboard.press('Enter');
  await expect(items.nth(0)).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(menu).toHaveCount(0);

  // Your games switches to that tab.
  await more.click();
  await menu.getByRole('menuitem', { name: 'Your games', exact: true }).click();
  await expect(menu).toHaveCount(0);
  await expect(more).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Your games', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(['Your games']);
  await page.getByRole('link', { name: 'Games home', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Games', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  // Create room opens the full setup dialog with the game picker; closing it returns to More.
  const dialog = await openCreateRoom(page);
  await expect(dialog.getByRole('combobox', { name: 'The game', exact: true })).toHaveValue('uno');
  await expect(menu).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(more).toBeFocused();

  // Progress and rewards is a link to the page.
  await more.press('Enter');
  await page.keyboard.press('End');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/rewards$/);
});

test('one row of occasions filters the grid, and it holds at 320px', async ({ page }, info) => {
  const phone = info.project.name === 'phone';
  if (phone) await page.setViewportSize({ width: 320, height: 640 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await fits(page);
  const library = page.getByRole('region', { name: 'Games', exact: true });
  const occasions = library.getByRole('group', { name: 'Occasion', exact: true });
  const tiles = library.getByRole('link', { name: /^Open / });
  const chip = (name: string) => occasions.getByRole('button', { name, exact: true });
  const row = page.locator('.library-occasion-row');

  // One row, whatever the width: on a phone it scrolls inside itself, never the page.
  const tops = await occasions
    .getByRole('button')
    .evaluateAll((chips) => chips.map((item) => Math.round(item.getBoundingClientRect().top)));
  expect(new Set(tops).size).toBe(1);
  if (phone) {
    // Joining with a code is still one tap away on the smallest phone.
    await expect(page.getByRole('button', { name: 'Join a room', exact: true })).toBeInViewport({
      ratio: 1,
    });
    expect(await row.evaluate((element) => element.scrollWidth > element.clientWidth)).toBe(true);
    await chip('For teams').focus();
    await expect(chip('For teams')).toBeInViewport({ ratio: 0.95 });
    expect(await row.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0);
    expect(await page.evaluate(() => scrollX)).toBe(0);
    await expect(chip('For teams')).toHaveCSS('outline-style', 'solid');
  } else {
    expect(await row.evaluate((element) => element.scrollWidth <= element.clientWidth + 1)).toBe(
      true,
    );
  }
  await expectTouchTargets(page, '.game-library');

  // Each occasion shows its own games, once each.
  await chip('With friends').click();
  await expect(chip('With friends')).toHaveAttribute('aria-pressed', 'true');
  await expect(chip('All')).toHaveAttribute('aria-pressed', 'false');
  for (const name of ['Most Likely', 'Uno', 'Word Agents'])
    await expect(library.getByRole('link', { name: `Open ${name}`, exact: true })).toBeVisible();
  for (const name of ['Checkers', 'Pop Tarot', 'Secret Santa'])
    await expect(library.getByRole('link', { name: `Open ${name}`, exact: true })).toHaveCount(0);
  await chip('Two players').click();
  expect((await tileNames(page)).slice(0, 5).sort()).toEqual([
    'Open Checkers',
    'Open Four in a Row',
    'Open Mancala',
    'Open Reversi',
    'Open boop.',
  ]);
  await expect(library.getByRole('link', { name: 'Open Pop Tarot', exact: true })).toHaveCount(0);
  await chip('Solo').focus();
  await page.keyboard.press('Enter');
  expect((await tileNames(page)).sort()).toEqual([
    'Open Blackjack',
    'Open Pop Tarot',
    'Open Roulette',
    'Open Slots',
  ]);
  await expect(library.getByRole('status')).toHaveText('4 games');
  // Under a chip there is no featured card: Pop Tarot is an ordinary tile where it belongs.
  const featured = page.locator('.game-tile[data-variant="featured"]');
  await expect(featured).toHaveCount(0);
  await expect(library.getByText('Featured', { exact: true })).toHaveCount(0);
  const tarot = library.getByRole('link', { name: 'Open Pop Tarot', exact: true });
  await expect(tarot.locator('.game-tile-meta')).toHaveText('Solo · 5–10 min');
  await expect(tarot.getByText('Start reading')).toHaveCount(0);
  const plain = (await tarot.boundingBox())!;
  const other = (await library
    .getByRole('link', { name: 'Open Blackjack', exact: true })
    .boundingBox())!;
  expect(Math.round(plain.width)).toBe(Math.round(other.width));
  // The team note and its filters exist only inside For teams.
  await expect(library.getByText(TEAMS_NOTE, { exact: true })).toHaveCount(0);
  await expect(library.getByRole('group', { name: 'Group size', exact: true })).toHaveCount(0);

  await chip('For teams').click();
  await expect(tiles).toHaveCount(TEAM_PICKS);
  await expect(library.getByRole('status')).toHaveText(`${TEAM_PICKS} games`);
  await expect(library.getByText(TEAMS_NOTE, { exact: true })).toBeVisible();
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
  await times.getByRole('button', { name: '15–30 min', exact: true }).click();
  expect(await tileNames(page)).toEqual(['Open Word Agents', 'Open Flip 7']);
  // Pressing a chosen filter again clears it.
  await sizes.getByRole('button', { name: '9+', exact: true }).click();
  await expect(sizes.getByRole('button', { name: '9+', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(tiles).toHaveCount(4);
  await fits(page);
  // All puts the team filters away and brings every game back.
  await chip('All').click();
  await expect(sizes).toHaveCount(0);
  await expect(tiles).toHaveCount(catalogue.length);
  await expect(featured).toHaveCount(1);
  expect((await tileNames(page))[0]).toBe('Open Pop Tarot');
  await chip('For teams').click();
  await expect(featured).toHaveCount(0);
  await expect(sizes.getByRole('button', { name: '9+', exact: true })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  await expect(tiles).toHaveCount(TEAM_PICKS);
  await fits(page);
});

test('search finds games by name and by kind, inside the chosen occasion, with a way back', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const library = page.getByRole('region', { name: 'Games', exact: true });
  const search = library.getByRole('searchbox', { name: 'Search games' });
  const tiles = library.getByRole('link', { name: /^Open / });
  const chip = (name: string) =>
    library
      .getByRole('group', { name: 'Occasion', exact: true })
      .getByRole('button', { name, exact: true });

  const featured = page.locator('.game-tile[data-variant="featured"]');
  await expect(featured).toHaveCount(1);
  await search.fill('poker');
  await expect(
    library.getByRole('link', { name: 'Open Texas Hold’em', exact: true }),
  ).toBeVisible();
  await expect(library.getByRole('link', { name: 'Open Uno', exact: true })).toHaveCount(0);
  await expect(featured).toHaveCount(0);
  // A search for the featured game finds it as an ordinary tile, once.
  await search.fill('tarot');
  expect(await tileNames(page)).toEqual(['Open Pop Tarot']);
  await expect(featured).toHaveCount(0);
  await expect(library.getByText('Featured', { exact: true })).toHaveCount(0);
  await expect(
    library.getByRole('link', { name: 'Open Pop Tarot', exact: true }).locator('.game-tile-meta'),
  ).toHaveText('Solo · 5–10 min');
  // Kinds of game are found by typing them, now that they are not filters.
  await search.fill('board games');
  for (const name of ['Checkers', 'Mancala', 'Reversi', 'Azul'])
    await expect(library.getByRole('link', { name: `Open ${name}`, exact: true })).toBeVisible();
  await expect(library.getByRole('link', { name: 'Open Uno', exact: true })).toHaveCount(0);
  await search.fill('casino');
  await expect(tiles).toHaveCount(5);
  await search.fill('cards');
  await expect(library.getByRole('link', { name: 'Open Uno', exact: true })).toBeVisible();
  await expect(library.getByRole('link', { name: 'Open Checkers', exact: true })).toHaveCount(0);
  // A typo still finds the game.
  await search.fill('chekers');
  expect(await tileNames(page)).toEqual(['Open Checkers']);
  await expect(library.getByRole('status')).toHaveText('1 game');

  // Search stays inside the chosen occasion.
  await search.fill('uno');
  await chip('Solo').click();
  await expect(library.getByRole('heading', { name: 'No games found', exact: true })).toBeVisible();
  await expect(library.getByRole('status')).toHaveText('0 games');
  await chip('Quick with bots').click();
  expect(await tileNames(page)).toEqual(['Open Uno']);
  await search.press('Escape');
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(tiles).toHaveCount(5);
  await expect(chip('Quick with bots')).toHaveAttribute('aria-pressed', 'true');

  // Nothing found: one plain message and one button back to everything.
  await search.fill('zzzz');
  await expect(library.getByRole('heading', { name: 'No games found', exact: true })).toBeVisible();
  await expect(tiles).toHaveCount(0);
  await library.getByRole('button', { name: 'Show all games', exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();
  await expect(chip('All')).toHaveAttribute('aria-pressed', 'true');
  await expect(tiles).toHaveCount(catalogue.length);
  // Back in the default view the featured card leads again, and Start reading opens Tarot.
  await expect(featured).toHaveCount(1);
  await featured.getByText('Start reading').click();
  await expect(page).toHaveURL(/\/games\/tarot$/);
  await expect(page.getByRole('button', { name: 'Start reading', exact: true })).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await page.goBack();
  await expect(tiles).toHaveCount(catalogue.length);
  await search.fill('gang');
  await library.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(search).toBeFocused();
  await expect(tiles).toHaveCount(catalogue.length);
  await fits(page);
});

test('a returning player gets a small level chip, one invitation line and one Continue line', async ({
  page,
}, info) => {
  const phone = info.project.name === 'phone';
  // The reference phone screen for "everything to start with, and the first games, in view".
  if (phone) await page.setViewportSize({ width: 390, height: 844 });
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
          id: '55555555-5555-4555-8555-555555555555',
          name: 'Slow game',
          game_id: 'checkers',
          status: 'playing',
          players: 2,
          capacity: 2,
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
  page.on('request', (request) => {
    if (new URL(request.url()).pathname.endsWith('/v1/progress')) progressAsked = request.url();
  });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);

  // Progress is a small chip in the header: the ring, the level, a flame with the day count.
  const chip = page.locator('.site-header .progress-chip');
  await expect(chip).toBeVisible();
  await expect(chip).toHaveAttribute('href', '/rewards');
  await expect(chip).toHaveAccessibleName('Level 3, 4-day streak. Open your progress and rewards');
  await expect(chip.locator('.level-ring')).toBeVisible();
  await expect(chip.locator('.progress-chip-streak')).toContainText('4');
  expect(await chip.innerText()).not.toMatch(/lost|broke|ended|hurry|claim|XP|badge/i);
  const chipBox = (await chip.boundingBox())!;
  expect(chipBox.height).toBeGreaterThanOrEqual(44);
  expect(chipBox.height).toBeLessThanOrEqual(48);
  // The player's own day decides the streak, so the request carries their UTC offset.
  expect(new URL(progressAsked).searchParams.get('tz_offset')).toMatch(/^-?\d{1,3}$/);
  await expect(page.locator('.welcome-strip')).toHaveCount(0);

  // The invitation is the one thing above the headline: a single slim ticket.
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
  expect(
    await ticket
      .locator('.ticket-body')
      .evaluate(
        (body) => getComputedStyle(body).maskImage || getComputedStyle(body).webkitMaskImage,
      ),
  ).toContain('radial-gradient');
  const ticketBox = (await ticket.boundingBox())!;
  expect(ticketBox.height).toBeLessThanOrEqual(phone ? 96 : 72);
  expect(ticketBox.y + ticketBox.height).toBeLessThanOrEqual(await top(page, '.home-headline'));
  await expectTouchTargets(page, '.invitations');

  // Continue: one slim line under the actions, for the game in progress only.
  const cont = page.getByRole('region', { name: 'Continue', exact: true });
  await expect(cont.getByRole('link')).toHaveCount(1);
  await expect(cont.getByRole('link')).toHaveText('Continue Friday table · Uno');
  await expect(cont.getByRole('link')).toHaveAttribute(
    'href',
    '/games/uno/rooms/22222222-2222-4222-8222-222222222222',
  );
  await expect(cont).not.toContainText('Tile club');
  await expect(cont).not.toContainText('Last game');
  const contBox = (await cont.boundingBox())!;
  expect(contBox.height).toBeLessThanOrEqual(48);
  // It sits under the heading row and above the search, and costs one line.
  expect(contBox.y).toBeGreaterThan(await top(page, 'h1'));
  expect(contBox.y + contBox.height).toBeLessThanOrEqual(await top(page, '.library-search'));
  await expect(page.locator('.room-shortcut:visible, .continue-card')).toHaveCount(0);

  // The order: header, invitation, heading, Continue, search, games.
  const order = [
    await top(page, '.site-header'),
    await top(page, '.invitations'),
    await top(page, 'h1'),
    await top(page, '.continue-line'),
    await top(page, '.library-search'),
    await top(page, '.catalogue-grid'),
  ];
  expect(order).toEqual([...order].sort((a, b) => a - b));
  // Even with all of that, the games start in the top half of the first screen.
  expect(order[5]).toBeLessThan(page.viewportSize()!.height / 2);
  // The header is one row: chip, Join a room, More, the account.
  const headerRow = await Promise.all(
    [
      chip,
      page.getByRole('button', { name: 'Join a room', exact: true }),
      page.getByRole('button', { name: 'More', exact: true }),
      page.getByRole('link', { name: 'Sign in', exact: true }),
    ].map(async (control) => (await control.boundingBox())!),
  );
  for (let index = 1; index < headerRow.length; index++)
    expect(headerRow[index].x).toBeGreaterThanOrEqual(
      headerRow[index - 1].x + headerRow[index - 1].width,
    );
  await fits(page);

  // "and 1 more" opens Your games, where every room still is.
  await cont.getByRole('button', { name: 'and 1 more', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'Your games', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  for (const name of [
    'Open Friday table, Uno',
    'Open Slow game, Checkers',
    'Open Tile club, Azul',
    'Open Last game, Texas Hold’em',
  ])
    await expect(page.getByRole('link', { name, exact: true })).toBeVisible();
  await fits(page);
  if (phone) {
    // At 360 the ring still fits beside Join, More and the account.
    await page.setViewportSize({ width: 360, height: 740 });
    await fits(page);
    await expect(chip).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeInViewport({ ratio: 1 });
    // At 320 it gives way; Progress and rewards is still in More.
    await page.setViewportSize({ width: 320, height: 640 });
    await fits(page);
    await expect(chip).toBeHidden();
    await expect(page.getByRole('link', { name: 'Sign in' })).toBeInViewport({ ratio: 1 });
    await page.getByRole('button', { name: 'More', exact: true }).click();
    await expect(
      page.getByRole('menuitem', { name: 'Progress and rewards', exact: true }),
    ).toHaveAttribute('href', '/rewards');
    await page.keyboard.press('Escape');
    await page.setViewportSize({ width: 390, height: 844 });
  }

  await page.getByRole('tab', { name: 'Games', exact: true }).click();
  await chip.click();
  await expect(page).toHaveURL(/\/rewards$/);
  await expect(
    page.getByRole('heading', { level: 1, name: 'Progress and rewards', exact: true }),
  ).toBeVisible();
});

test('the header chip shows a streak only while there is one, and nothing without progress', async ({
  page,
}) => {
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
  const chip = page.locator('.progress-chip');
  await expect(chip).toContainText('Level 3');
  await expect(chip).toHaveAccessibleName('Level 3, 4-day streak. Open your progress and rewards');
  const headline = await top(page, '.home-headline');

  state = { ...midLevel(), streak: { current: 0, best: 6, played_today: false } };
  await load(() => page.reload());
  await expect(chip).toHaveAccessibleName('Level 3. Open your progress and rewards');
  await expect(chip.locator('.progress-chip-streak')).toHaveCount(0);
  expect(await chip.innerText()).not.toMatch(/streak|lost|broke|ended|missed/i);
  // The chip lives in the header, so the page below it never moves.
  expect(await top(page, '.home-headline')).toBe(headline);

  // No finished game, or no reply: no chip and no welcome line, and the page still works.
  state = {
    ...midLevel(),
    xp: 0,
    level: 1,
    level_xp: 0,
    next_level_xp: 50,
    totals: { games: 0, wins: 0, different_games: 0, with_friends: 0 },
  };
  await load(() => page.reload());
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(chip).toHaveCount(0);
  expect(await top(page, '.home-headline')).toBe(headline);
  state = null;
  await load(() => page.reload());
  await expect(chip).toHaveCount(0);
  await expect(page.locator('.welcome-strip')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Join a room', exact: true })).toBeVisible();
  await expect(page.locator('.game-tile')).toHaveCount(catalogue.length);
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
