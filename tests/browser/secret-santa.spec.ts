import { expect, test, type BrowserContext, type Page, type Route } from '@playwright/test';
import {
  santaOrganiserId,
  santaRoom,
  santaRoomId,
  type SantaFixtureState,
} from '../../apps/web/src/stories/fixtures/secret-santa';
import { attachPreviewAccess, requestAs, roomAs, type RoomView } from './helpers';

// Secret Santa: one organiser, typed names, a private link per person.
// The first group renders states a real run cannot reach on demand (an impossible
// draw, an outdated or rate-limited link, a share sheet) from mocked responses.
// The last test is the whole real flow with an independent guest opening links.
// Every real room is closed afterwards.
test.use({ trace: 'off', screenshot: 'only-on-failure', reducedMotion: 'reduce' });

type Owned = { id?: string; contexts: BrowserContext[] };
const cleanup = new WeakMap<Page, Owned>();

// A timed-out body must not consume the budget needed to close its room.
test.afterEach(async ({ page }) => {
  test.setTimeout(45000);
  const owned = cleanup.get(page);
  if (!owned) return;
  try {
    if (!owned.id) return;
    const response = await requestAs(page, `rooms/${owned.id}`);
    if (response.status() === 404) return;
    expect(response.status()).toBe(200);
    if (((await response.json()) as RoomView).status === 'playing')
      expect((await requestAs(page, `rooms/${owned.id}/abandon`, 'POST')).status()).toBe(200);
    expect([200, 404]).toContain(
      (await requestAs(page, `rooms/${owned.id}/leave`, 'POST')).status(),
    );
    expect((await requestAs(page, `rooms/${owned.id}`)).status()).toBe(404);
  } finally {
    await Promise.all(owned.contexts.map((context) => context.close()));
    cleanup.delete(page);
  }
});

async function fitsViewport(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

/** Every visible control inside `scope` offers at least a 44px target. */
async function expectTouchTargets(page: Page, scope: string) {
  const small = await page.locator(scope).evaluate((root) =>
    [...root.querySelectorAll<HTMLElement>('button, select, input:not([type="checkbox"]), a[href]')]
      .filter((control) => control.checkVisibility())
      .map((control) => {
        const box = control.getBoundingClientRect();
        return {
          name: control.getAttribute('aria-label') || control.textContent,
          width: Math.round(box.width),
          height: Math.round(box.height),
        };
      })
      .filter((control) => control.height < 43.5 || control.width < 43.5),
  );
  expect(small).toEqual([]);
}

/** The row of the person with exactly this name (chips on other rows also mention names). */
function personRow(page: Page, name: string) {
  return page
    .locator('.santa-person')
    .filter({ has: page.locator('.santa-person__name').getByText(name, { exact: true }) });
}

/** Paste text into a field the way a clipboard does, new lines included. */
async function paste(page: Page, label: string, text: string) {
  await page.getByRole('textbox', { name: label, exact: true }).evaluate((field, value) => {
    const data = new DataTransfer();
    data.setData('text', value);
    field.dispatchEvent(
      new ClipboardEvent('paste', { clipboardData: data, bubbles: true, cancelable: true }),
    );
  }, text);
}

const TOKEN = 'c2VjcmV0LXNhbnRhLXByZXZpZXctdG9rZW4tMDAwMDAwMDAwMQ';
const reveal = {
  title: 'Office party',
  day: 2544,
  location: 'The canteen, third floor',
  budget: 'Around 10 each',
  giver_name: 'Sam',
  recipient_name: 'Priya',
};

test.describe('the private link page (mocked responses)', () => {
  /** Answers every reveal request from `answers` in order and records what was asked. */
  async function mockReveal(page: Page, answers: ((route: Route) => Promise<void>)[]) {
    const asked: string[] = [];
    await page.route('**/api/dev-session', (route) => route.fulfill({ status: 200, body: '{}' }));
    await page.route('**/api/backend/v1/**', async (route) => {
      const url = new URL(route.request().url());
      asked.push(`${route.request().method()} ${url.pathname}${url.search}`);
      const answer = answers[Math.min(asked.length, answers.length) - 1];
      await answer(route);
    });
    return asked;
  }

  test('greets the person, shows the name only after a tap and never puts the token anywhere else', async ({
    page,
  }) => {
    const urls: string[] = [];
    page.on('request', (request) => urls.push(request.url()));
    const asked = await mockReveal(page, [(route) => route.fulfill({ json: reveal })]);
    await page.goto(`/santa/${TOKEN}`);
    await expect(page.getByRole('heading', { name: 'Hi Sam', level: 1 })).toBeVisible();
    const show = page.getByRole('button', { name: 'Show who I’m buying for', exact: true });
    await expect(show).toBeVisible();
    // Nothing on the page names the recipient until the person asks.
    await expect(page.getByText('Priya')).toHaveCount(0);
    expect(await page.content()).not.toContain('Priya');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    await expect(page.locator('meta[name="referrer"]')).toHaveAttribute('content', 'no-referrer');
    for (const link of await page.getByRole('link').all()) {
      await expect(link).toHaveAttribute('referrerpolicy', 'no-referrer');
      await expect(link).toHaveAttribute('href', '/');
    }
    await expectTouchTargets(page, '.santa-page');
    await fitsViewport(page);

    await show.click();
    const name = page.getByRole('heading', { name: 'Priya', level: 1 });
    await expect(name).toBeVisible();
    await expect(name).toBeFocused();
    await expect(page.getByText('Sam, you’re buying a gift for')).toBeVisible();
    const details = page.locator('.santa-page__details');
    await expect(details).toContainText('Office party');
    await expect(details).toContainText('Saturday 19 December 2026');
    await expect(details).toContainText('The canteen, third floor');
    await expect(details).toContainText('Around 10 each');
    await fitsViewport(page);
    await page.getByRole('button', { name: 'Hide the name', exact: true }).click();
    await expect(page.getByText('Priya')).toHaveCount(0);
    await expect(show).toBeFocused();

    // One request, with the token in its path and nowhere else.
    expect(asked).toEqual([`GET /api/backend/v1/secret-santa/${TOKEN}`]);
    for (const url of urls.filter((value) => value.includes(TOKEN))) {
      const parsed = new URL(url);
      expect(parsed.search, url).not.toContain(TOKEN);
      expect([`/santa/${TOKEN}`, `/api/backend/v1/secret-santa/${TOKEN}`]).toContain(
        parsed.pathname,
      );
    }
    expect(
      await page.evaluate(() => JSON.stringify({ ...localStorage, ...sessionStorage })),
    ).not.toContain(TOKEN);
  });

  test('holds at 320px and leaves unset details out', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await mockReveal(page, [
      (route) =>
        route.fulfill({
          json: {
            ...reveal,
            title: 'A very long title for the neighbourhood winter get-together 2026',
            day: null,
            location: '',
            budget: '',
            giver_name: 'Bartholomew-Alexander Fitzgerald',
            recipient_name: 'Wilhelmina-Seraphina Montgomery',
          },
        }),
    ]);
    await page.goto(`/santa/${TOKEN}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Hi Bartholomew');
    await fitsViewport(page);
    await page.getByRole('button', { name: 'Show who I’m buying for', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Wilhelmina');
    await expect(page.locator('.santa-page__details dt')).toHaveText(['Event']);
    await expectTouchTargets(page, '.santa-page');
    await fitsViewport(page);
  });

  test('an outdated link gets one plain message and is asked for once', async ({ page }) => {
    const asked = await mockReveal(page, [
      (route) =>
        route.fulfill({
          status: 404,
          json: { detail: "This link doesn't open a name. Ask the organiser for a new one." },
        }),
    ]);
    await page.goto(`/santa/${TOKEN}`);
    await expect(
      page.getByRole('heading', { name: 'This link doesn’t work any more', level: 1 }),
    ).toBeVisible();
    await expect(page.locator('.santa-page [role="alert"]')).toContainText(
      'Ask the person who organised',
    );
    await expect(page.locator('.santa-page').getByRole('button')).toHaveCount(0);
    // No retry on its own, not on focus and not after a wait.
    await page.evaluate(() => window.dispatchEvent(new Event('focus')));
    await page.waitForTimeout(2500);
    expect(asked).toHaveLength(1);
    await fitsViewport(page);
  });

  test('too many wrong links gets its own message, and a malformed link asks nothing', async ({
    page,
  }) => {
    const asked = await mockReveal(page, [
      (route) =>
        route.fulfill({
          status: 429,
          json: { detail: "Too many links that didn't work. Wait ten minutes, then try again." },
        }),
    ]);
    await page.goto(`/santa/${TOKEN}`);
    await expect(page.getByRole('heading', { name: 'Too many tries', level: 1 })).toBeVisible();
    await expect(page.locator('.santa-page [role="alert"]')).toContainText('Wait ten minutes');
    await expect(page.locator('.santa-page').getByRole('button')).toHaveCount(0);
    expect(asked).toHaveLength(1);
    await page.goto('/santa/not-a-link');
    await expect(
      page.getByRole('heading', { name: 'This link doesn’t work any more', level: 1 }),
    ).toBeVisible();
    await page.waitForTimeout(500);
    expect(asked).toHaveLength(1);
  });

  test('a connection problem offers Try again and then opens the link', async ({ page }) => {
    const asked = await mockReveal(page, [
      (route) => route.fulfill({ status: 503, json: { detail: 'Unreachable.' } }),
      (route) => route.fulfill({ json: reveal }),
    ]);
    await page.goto(`/santa/${TOKEN}`);
    await expect(
      page.getByRole('heading', { name: 'Your link didn’t open', level: 1 }),
    ).toBeVisible();
    expect(asked).toHaveLength(1);
    await page.getByRole('button', { name: 'Try again', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Hi Sam', level: 1 })).toBeVisible();
    expect(asked).toHaveLength(2);
  });
});

test.describe('the organiser page (mocked responses)', () => {
  const office = [
    { id: 'p1', name: 'Sam' },
    { id: 'p2', name: 'Priya' },
    { id: 'p3', name: 'Jo' },
  ];
  /**
   * A stand-in table: it answers room reads from `state` and applies the few
   * moves these tests make, so the page's own queueing and wording are real.
   */
  async function mockTable(page: Page, initial: SantaFixtureState) {
    let state = { ...initial, version: initial.version ?? 1 };
    const moves: { type: string; target: string; choice: string; cards: string[] }[] = [];
    const calls: string[] = [];
    const view = () => santaRoom(state);
    await page.addInitScript(() =>
      localStorage.setItem('games:player:v1', JSON.stringify({ name: 'Alex', avatar: 0 })),
    );
    await page.route('**/api/dev-session', (route) => route.fulfill({ status: 200, body: '{}' }));
    await page.route('**/api/backend/v1/**', async (route) => {
      const url = new URL(route.request().url());
      const path = url.pathname.replace('/api/backend/v1/', '');
      calls.push(`${route.request().method()} ${path}`);
      if (path === 'me')
        return route.fulfill({
          json: {
            profile: { id: santaOrganiserId, name: 'Alex', avatar: 0, username: null },
            anonymous: true,
            rooms: [],
            history: [],
            invitations: [],
          },
        });
      if (path === `rooms/${santaRoomId}/secret-santa/links`)
        return route.fulfill({
          json: {
            links: (state.people ?? []).map((person) => ({
              id: person.id,
              name: person.name,
              token: `mocked-private-link-token-for-${person.id}`,
            })),
          },
        });
      if (path === `rooms/${santaRoomId}/actions`) {
        const action = route.request().postDataJSON().action;
        moves.push(action);
        const people = [...(state.people ?? [])];
        if (action.type === 'add_name')
          people.push({ id: `p${people.length + 1}`, name: action.choice });
        const showing =
          action.type === 'reveal'
            ? {
                giver: action.target as string,
                giver_name: people.find((person) => person.id === action.target)!.name,
                recipient_name: 'Zebedee-Recipient',
              }
            : null;
        state = {
          ...state,
          people,
          showing,
          blocked: state.phase === 'setup' && people.length >= 3 ? null : state.blocked,
          version: state.version + 1,
        };
      }
      return route.fulfill({ json: view() });
    });
    return { moves, calls };
  }

  test('a blocked draw stays disabled and says why in plain words', async ({ page }) => {
    const { moves } = await mockTable(page, {
      phase: 'setup',
      title: 'Office party',
      people: office,
      pairs: [
        ['p1', 'p2'],
        ['p1', 'p3'],
      ],
      blocked: 'Sam has nobody left to draw. Remove an exclusion or a group.',
    });
    await page.goto(`/games/secret-santa/play/${santaRoomId}`);
    const draw = page.getByRole('button', { name: 'Draw names', exact: true });
    await expect(draw).toBeDisabled();
    await expect(draw).toHaveAccessibleDescription(
      'Sam has nobody left to draw. Remove an exclusion or a group.',
    );
    await expect(page.locator('#santa-draw-note')).toBeVisible();
    // The exclusions show on both people of each pair.
    const row = (name: string) => personRow(page, name);
    await expect(row('Sam').locator('.santa-chip')).toHaveText([
      'Can’t draw: Priya',
      'Can’t draw: Jo',
    ]);
    await expect(row('Priya').locator('.santa-chip')).toHaveText(['Can’t draw: Sam']);
    await expect(page.getByRole('region', { name: 'Tutorial coach' })).toHaveCount(0);
    await expect(page.locator('.table-announcement')).toHaveCount(0);
    await expectTouchTargets(page, '.santa-table');
    await fitsViewport(page);
    expect(moves).toEqual([]);
  });

  test('a pasted list is added one name at a time, and Enter keeps the field ready', async ({
    page,
  }) => {
    const { moves } = await mockTable(page, { phase: 'setup' });
    await page.goto(`/games/secret-santa/play/${santaRoomId}`);
    const field = page.getByRole('textbox', { name: 'Add a name', exact: true });
    await expect(page.getByRole('button', { name: 'Draw names', exact: true })).toBeDisabled();
    await expect(page.locator('#santa-draw-note')).toHaveText('Add at least 3 people.');
    await field.fill('Sam');
    await field.press('Enter');
    await expect(field).toBeFocused();
    await expect(field).toHaveValue('');
    await expect(page.locator('.santa-person')).toHaveCount(1);
    await expect(page.locator('.santa-status--page')).toHaveText('Added Sam.');
    await paste(page, 'Add a name', 'Priya, Jo\nMateo\r\n  Aisha  ,, ');
    await expect(page.locator('.santa-person__name')).toHaveText([
      'Sam',
      'Priya',
      'Jo',
      'Mateo',
      'Aisha',
    ]);
    await expect(page.locator('.santa-count').first()).toHaveText('5 of 30');
    expect(moves.map((move) => [move.type, move.choice])).toEqual([
      ['add_name', 'Sam'],
      ['add_name', 'Priya'],
      ['add_name', 'Jo'],
      ['add_name', 'Mateo'],
      ['add_name', 'Aisha'],
    ]);
    await expect(page.getByRole('button', { name: 'Draw names', exact: true })).toBeEnabled();
    await fitsViewport(page);
  });

  test('Share hands the person’s own link to the share sheet; Copy confirms in words', async ({
    page,
    baseURL,
  }) => {
    const origin = new URL(baseURL!).origin;
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'share', {
        configurable: true,
        value: async (data: ShareData) => {
          (window as unknown as { shared: ShareData[] }).shared = [data];
        },
      });
      Object.defineProperty(Navigator.prototype, 'clipboard', {
        configurable: true,
        value: {
          writeText: async (text: string) => {
            (window as unknown as { copied: string }).copied = text;
          },
        },
      });
    });
    await mockTable(page, {
      phase: 'drawn',
      title: 'Office party',
      people: [{ ...office[0], opened: true }, office[1], office[2]],
    });
    await page.goto(`/games/secret-santa/play/${santaRoomId}`);
    const links = page.getByRole('region', { name: 'Share each person’s link', exact: true });
    await expect(page.getByText('Only each person can see who they drew.')).toBeVisible();
    await expect(links.locator('.santa-link')).toHaveCount(3);
    await expect(links.locator('.santa-opened')).toHaveText([
      'Opened',
      'Not opened yet',
      'Not opened yet',
    ]);
    await links.getByRole('button', { name: 'Share link for Priya', exact: true }).click();
    await expect(links.getByRole('status')).toHaveText('Link for Priya shared.');
    expect(
      await page.evaluate(() => (window as unknown as { shared: ShareData[] }).shared),
    ).toEqual([
      {
        title: 'Office party',
        text: 'Priya, here is your Secret Santa link for Office party',
        url: `${origin}/santa/mocked-private-link-token-for-p2`,
      },
    ]);
    await links.getByRole('button', { name: 'Copy link for Jo', exact: true }).click();
    await expect(links.getByRole('status')).toHaveText('Link for Jo copied.');
    await expect(links.getByRole('button', { name: 'Link copied for Jo', exact: true })).toHaveText(
      'Link copied',
    );
    expect(await page.evaluate(() => (window as unknown as { copied: string }).copied)).toBe(
      `${origin}/santa/mocked-private-link-token-for-p3`,
    );
    // The page itself never spells a link out, and never lists who drew whom.
    const text = await page.locator('.santa-table').innerText();
    expect(text).not.toContain('/santa/');
    expect(text).not.toContain('→');
    await expectTouchTargets(page, '.santa-table');
    await fitsViewport(page);
    // Three actions per person still fit the narrowest phone.
    await page.setViewportSize({ width: 320, height: 640 });
    await expectTouchTargets(page, '.santa-table');
    await fitsViewport(page);
  });

  test('without a share sheet or clipboard the link can still be selected by hand', async ({
    page,
    baseURL,
  }) => {
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'share', { configurable: true, value: undefined });
      Object.defineProperty(Navigator.prototype, 'clipboard', {
        configurable: true,
        value: { writeText: () => Promise.reject(new DOMException('Denied', 'NotAllowedError')) },
      });
    });
    await mockTable(page, { phase: 'drawn', people: office });
    await page.goto(`/games/secret-santa/play/${santaRoomId}`);
    const links = page.getByRole('region', { name: 'Share each person’s link', exact: true });
    await expect(links.getByRole('button', { name: /^Share link for/ })).toHaveCount(0);
    await links.getByRole('button', { name: 'Copy link for Sam', exact: true }).click();
    await expect(links.getByRole('status')).toContainText('Copying isn’t available here');
    await expect(links.getByRole('textbox', { name: 'Link for Sam', exact: true })).toHaveValue(
      `${new URL(baseURL!).origin}/santa/mocked-private-link-token-for-p1`,
    );
    await fitsViewport(page);
    await page.setViewportSize({ width: 320, height: 640 });
    await expectTouchTargets(page, '.santa-table');
    await fitsViewport(page);
  });

  test('pass the phone: the name appears only after the person confirms, and Hide removes it at once', async ({
    page,
  }) => {
    const { moves } = await mockTable(page, { phase: 'drawn', people: office });
    await page.goto(`/games/secret-santa/play/${santaRoomId}`);
    await page.getByRole('button', { name: 'Show on this phone for Jo', exact: true }).click();
    const card = page.locator('.santa-pass');
    await expect(card.getByRole('heading', { name: 'Hand the phone to Jo' })).toBeVisible();
    await expect(card).toBeFocused();
    // Nothing has been asked of the server yet, and the list is out of the way.
    expect(moves).toEqual([]);
    await expect(page.locator('.santa-layout')).toBeHidden();
    await card.getByRole('button', { name: 'I’m Jo, show who I drew', exact: true }).click();
    await expect(card.locator('.santa-pass__name')).toHaveText('Zebedee-Recipient');
    await expect(card.getByText('Jo, you’re buying a gift for')).toBeVisible();
    await fitsViewport(page);
    await card.getByRole('button', { name: 'Hide', exact: true }).click();
    await expect(page.getByText('Zebedee-Recipient')).toHaveCount(0);
    await expect(card).toHaveCount(0);
    await expect(page.locator('.santa-layout')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Show on this phone for Jo', exact: true }),
    ).toBeFocused();
    expect(moves.map((move) => [move.type, move.target])).toEqual([
      ['reveal', 'p3'],
      ['hide', ''],
    ]);
    expect(await page.content()).not.toContain('Zebedee-Recipient');
    // Cancelling at the handover asks the server nothing.
    await page.getByRole('button', { name: 'Show on this phone for Sam', exact: true }).click();
    await card.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(card).toHaveCount(0);
    expect(moves).toHaveLength(2);
  });

  test('a reload in the middle of a reveal starts again at the handover', async ({ page }) => {
    await mockTable(page, {
      phase: 'drawn',
      people: office,
      showing: { giver: 'p1', giver_name: 'Sam', recipient_name: 'Zebedee-Recipient' },
    });
    await page.goto(`/games/secret-santa/play/${santaRoomId}`);
    await expect(page.getByRole('heading', { name: 'Hand the phone to Sam' })).toBeVisible();
    await expect(page.getByText('Zebedee-Recipient')).toHaveCount(0);
    expect(await page.locator('.room-page').innerHTML()).not.toContain('Zebedee-Recipient');
  });

  test('setup and the links list hold at 320px with 44px targets', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    const long = [
      ...office,
      { id: 'p4', name: 'Bartholomew-Alexander Fitzgerald' },
      { id: 'p5', name: 'Wilhelmina-Seraphina Montgomery' },
    ];
    await mockTable(page, {
      phase: 'setup',
      title: 'The neighbourhood winter get-together and gift exchange 2026',
      day: 2544,
      location: 'Community hall, upstairs room, 14 Long Meadow Lane',
      budget: 'Around 10 to 15 each',
      people: long,
      pairs: [
        ['p1', 'p2'],
        ['p4', 'p5'],
      ],
      groups: [{ id: 'g1', label: 'The Fitzgerald-Montgomery household', members: ['p4', 'p5'] }],
    });
    await page.goto(`/games/secret-santa/play/${santaRoomId}`);
    await expect(page.locator('.santa-person')).toHaveCount(5);
    await expectTouchTargets(page, '.santa-table');
    await fitsViewport(page);
    await page.getByRole('button', { name: 'Choose who Sam can’t draw', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Who can’t Sam draw?', exact: true });
    await expect(dialog.getByRole('checkbox')).toHaveCount(4);
    await expect(dialog.getByRole('checkbox', { name: /^Priya/ })).toBeChecked();
    for (const box of await dialog.locator('.santa-check').all())
      expect((await box.boundingBox())!.height).toBeGreaterThanOrEqual(44);
    await fitsViewport(page);
    await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
    await expect(
      page.getByRole('button', { name: 'Choose who Sam can’t draw', exact: true }),
    ).toBeFocused();
  });
});

test('an organiser sets up, draws, shares private links, passes the phone, redraws and finishes', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.setTimeout(240000);
  page.setDefaultTimeout(20000);
  const origin = new URL(baseURL!).origin;
  const owned: Owned = { contexts: [] };
  cleanup.set(page, owned);
  await attachPreviewAccess(page);
  await page.context().grantPermissions(['clipboard-read', 'clipboard-write'], { origin });

  // Start from the game's own page.
  await page.goto('/games/secret-santa');
  await expect(page.getByRole('heading', { name: 'Secret Santa', level: 1 })).toBeVisible();
  const created = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' && response.url().endsWith('/games/secret-santa/play'),
  );
  await page.getByRole('button', { name: 'Organise a draw', exact: true }).click();
  const room = (await (await created).json()) as RoomView;
  owned.id = room.id;
  await expect(page).toHaveURL(new RegExp(`/games/secret-santa/play/${room.id}$`));
  const detail = async () => (await roomAs(page, room.id)).game!.detail as Record<string, unknown>;
  const people = async () =>
    (await detail()).people as { id: string; name: string; opened: boolean }[];
  const status = page.locator('.santa-status--page');

  // Six names: typed with Enter, typed with the button, then a pasted list.
  const field = page.getByRole('textbox', { name: 'Add a name', exact: true });
  const draw = page.getByRole('button', { name: 'Draw names', exact: true });
  await expect(draw).toBeDisabled();
  await expect(page.locator('#santa-draw-note')).toHaveText('Add at least 3 people.');
  await field.fill('Sam');
  await field.press('Enter');
  await expect(field).toBeFocused();
  await expect(status).toHaveText('Added Sam.');
  await field.fill('Priya');
  await page.getByRole('button', { name: 'Add', exact: true }).click();
  await expect(page.locator('.santa-person')).toHaveCount(2);
  await paste(page, 'Add a name', 'Jo, Mateo\nAisha\nSam');
  // The repeated name comes back numbered, exactly as the server stored it.
  await expect(page.locator('.santa-person__name')).toHaveText([
    'Sam',
    'Priya',
    'Jo',
    'Mateo',
    'Aisha',
    'Sam (2)',
  ]);
  await expect(page.locator('.santa-people .santa-count')).toHaveText('6 of 30');

  // Rename and remove work on the saved list.
  await page.getByRole('button', { name: 'Rename Sam (2)', exact: true }).click();
  const rename = page.getByRole('textbox', { name: 'New name for Sam (2)', exact: true });
  await rename.fill('Lee');
  await rename.press('Enter');
  await expect(page.locator('.santa-person__name').last()).toHaveText('Lee');

  // The event: each field saves on Enter or on leaving it.
  const title = page.getByRole('textbox', { name: 'Title', exact: true });
  await title.fill('Office party');
  await title.press('Enter');
  await expect(status).toHaveText('Title saved.');
  await page.getByLabel('Date', { exact: true }).fill('2026-12-19');
  const location = page.getByRole('textbox', { name: 'Location', exact: true });
  await location.fill('The canteen, third floor');
  await page.getByRole('textbox', { name: 'Budget', exact: true }).fill('Around 10 each');
  await page.getByRole('textbox', { name: 'Budget', exact: true }).blur();
  await expect
    .poll(async () => {
      const saved = await detail();
      return [saved.title, saved.day, saved.location, saved.budget];
    })
    .toEqual(['Office party', 2544, 'The canteen, third floor', 'Around 10 each']);
  const summary = page.locator('.santa-summary');
  await expect(summary).toContainText('Saturday 19 December 2026');
  await expect(summary).toContainText('The canteen, third floor');
  await expect(summary).toContainText('Around 10 each');
  await expect(page.locator('.santa-intro h2')).toHaveText('Office party');
  // A detail can be cleared and set again.
  await page.getByRole('button', { name: 'Clear budget', exact: true }).click();
  await expect(summary).toContainText('No budget yet');
  await page.getByRole('textbox', { name: 'Budget', exact: true }).fill('Around 10 each');
  await page.getByRole('textbox', { name: 'Budget', exact: true }).press('Enter');
  await expect(summary).toContainText('Around 10 each');

  // One individual exclusion, shown on both people.
  const row = (name: string) => personRow(page, name);
  await page.getByRole('button', { name: 'Choose who Sam can’t draw', exact: true }).click();
  const pairs = page.getByRole('dialog', { name: 'Who can’t Sam draw?', exact: true });
  await pairs.getByRole('checkbox', { name: 'Priya', exact: true }).check();
  await pairs.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(row('Sam').locator('.santa-chip')).toHaveText(['Can’t draw: Priya']);
  await expect(row('Priya').locator('.santa-chip')).toHaveText(['Can’t draw: Sam']);

  // One group, shown on each member.
  const group = page.getByRole('textbox', { name: 'Add a group', exact: true });
  await group.fill('Household');
  await group.press('Enter');
  await page.getByRole('button', { name: 'Choose who is in Household', exact: true }).click();
  const members = page.getByRole('dialog', { name: 'Who is in Household?', exact: true });
  await members.getByRole('checkbox', { name: 'Jo', exact: true }).check();
  await members.getByRole('checkbox', { name: 'Mateo', exact: true }).check();
  await members.getByRole('button', { name: 'Save', exact: true }).click();
  await expect(row('Jo').locator('.santa-chip')).toHaveText(['Group: Household']);
  await expect(row('Mateo').locator('.santa-chip')).toHaveText(['Group: Household']);
  await expectTouchTargets(page, '.santa-table');
  await fitsViewport(page);
  await page.screenshot({ path: info.outputPath('setup.png'), fullPage: true });

  // Draw, after one confirmation.
  await expect(draw).toBeEnabled();
  await draw.click();
  const confirm = page.getByRole('dialog', { name: 'Draw names for 6 people?', exact: true });
  await expect(confirm).toContainText('You can redraw later, which makes new links.');
  await confirm.getByRole('button', { name: 'Draw names', exact: true }).click();
  const links = page.getByRole('region', { name: 'Share each person’s link', exact: true });
  await expect(links.locator('.santa-link')).toHaveCount(6);
  await expect(page.getByText('Only each person can see who they drew.')).toBeVisible();
  await expect(links.locator('.santa-opened')).toHaveText(Array(6).fill('Not opened yet'));
  // The event can still be edited without drawing again.
  await expect(page.getByRole('textbox', { name: 'Title', exact: true })).toBeEnabled();
  await expect(field).toHaveCount(0);

  // The organiser's own data never carries who drew whom.
  const view = await roomAs(page, room.id);
  expect(view.game!.phase).toBe('drawn');
  expect(JSON.stringify(view)).not.toMatch(/assignment|recipient/);
  expect((view.game!.detail as { showing: unknown }).showing).toBeNull();
  const listed = await people();
  const names = listed.map((person) => person.name);
  const idOf = (name: string) => listed.find((person) => person.name === name)!.id;
  const issued = (
    (await (await requestAs(page, `rooms/${room.id}/secret-santa/links`)).json()) as {
      links: { id: string; name: string; token: string }[];
    }
  ).links;
  expect(issued.map((link) => link.name)).toEqual(names);
  const linkFor = (name: string, from = issued) =>
    `/santa/${from.find((link) => link.id === idOf(name))!.token}`;
  // Copy link hands over exactly that person's address.
  await links.getByRole('button', { name: 'Copy link for Sam', exact: true }).click();
  await expect(links.getByRole('status')).toHaveText('Link for Sam copied.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `${origin}${linkFor('Sam')}`,
  );

  // Another guest, in their own browser, opens two of the links.
  const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  owned.contexts.push(context);
  const guest = await context.newPage();
  guest.setDefaultTimeout(20000);
  await attachPreviewAccess(guest);
  async function open(name: string, path: string) {
    await guest.goto(path);
    await expect(guest.getByRole('heading', { name: `Hi ${name}`, level: 1 })).toBeVisible();
    const before = await guest.locator('.santa-page').innerText();
    await guest.getByRole('button', { name: 'Show who I’m buying for', exact: true }).click();
    const recipient = (await guest.locator('.santa-page__name').innerText()).trim();
    // The name was not on the page before the tap (unless it is also the giver's own).
    if (recipient !== name) expect(before).not.toContain(recipient);
    const shown = guest.locator('.santa-page__details');
    await expect(shown).toContainText('Office party');
    await expect(shown).toContainText('Saturday 19 December 2026');
    await expect(shown).toContainText('The canteen, third floor');
    await expect(shown).toContainText('Around 10 each');
    await expect(guest.getByRole('link', { name: /room|organiser/i })).toHaveCount(0);
    return recipient;
  }
  const samDrew = await open('Sam', linkFor('Sam'));
  expect(names).toContain(samDrew);
  expect(['Sam', 'Priya']).not.toContain(samDrew);
  await guest.screenshot({ path: info.outputPath('link-shown.png'), fullPage: true });
  const joDrew = await open('Jo', linkFor('Jo'));
  expect(names).toContain(joDrew);
  expect(['Jo', 'Mateo']).not.toContain(joDrew);
  // The guest is not a member of the organiser's room.
  expect((await requestAs(guest, `rooms/${room.id}`)).status()).toBe(404);
  expect((await requestAs(guest, `rooms/${room.id}/secret-santa/links`)).status()).toBe(404);

  // The organiser sees who has opened their link, and still not who drew whom.
  const linkRow = (name: string) =>
    links
      .locator('.santa-link')
      .filter({ has: page.locator('.santa-link__who > strong').getByText(name, { exact: true }) });
  await expect(linkRow('Sam').locator('.santa-opened')).toHaveText('Opened');
  await expect(linkRow('Jo').locator('.santa-opened')).toHaveText('Opened');
  await expect(linkRow('Priya').locator('.santa-opened')).toHaveText('Not opened yet');
  await expect(links.locator('.santa-count')).toHaveText('2 of 6 opened');
  const organiserText = await page.locator('.room-page').innerText();
  expect(organiserText).not.toContain('→');
  for (const giver of names)
    for (const recipient of names)
      expect(organiserText).not.toMatch(
        new RegExp(`${giver}\\s*(→|->|drew|draws|gives to|buys for)\\s*${recipient}`, 'i'),
      );
  await page.screenshot({ path: info.outputPath('drawn.png'), fullPage: true });
  await expectTouchTargets(page, '.santa-table');
  await fitsViewport(page);

  // Pass the phone: confirm, see one name, hide it.
  await page.getByRole('button', { name: 'Show on this phone for Aisha', exact: true }).click();
  const card = page.locator('.santa-pass');
  await expect(card.getByRole('heading', { name: 'Hand the phone to Aisha' })).toBeVisible();
  expect((await detail()).showing).toBeNull();
  await card.getByRole('button', { name: 'I’m Aisha, show who I drew', exact: true }).click();
  const shownName = card.locator('.santa-pass__name');
  await expect(shownName).toBeVisible();
  const aishaDrew = (await shownName.innerText()).trim();
  expect(names).toContain(aishaDrew);
  expect(aishaDrew).not.toBe('Aisha');
  expect((await detail()).showing).toMatchObject({ giver: idOf('Aisha'), giver_name: 'Aisha' });
  await page.screenshot({ path: info.outputPath('pass-the-phone.png'), fullPage: true });
  await card.getByRole('button', { name: 'Hide', exact: true }).click();
  await expect(card).toHaveCount(0);
  await expect(page.locator('.santa-pass__name')).toHaveCount(0);
  await expect.poll(async () => (await detail()).showing).toBeNull();
  await expect(linkRow('Aisha').locator('.santa-opened')).toHaveText('Opened');

  // Redraw: back to the list, and the links already shared stop working.
  const oldSam = linkFor('Sam');
  await page.getByRole('button', { name: 'Redraw', exact: true }).click();
  const again = page.getByRole('dialog', { name: 'Redraw the names?', exact: true });
  await expect(again).toContainText('stop working');
  await again.getByRole('button', { name: 'Go back and redraw', exact: true }).click();
  await expect(field).toBeVisible();
  await expect(page.locator('.santa-intro')).toContainText('its links no longer work');
  await expect(page.locator('.santa-person')).toHaveCount(6);
  await guest.goto(oldSam);
  await expect(
    guest.getByRole('heading', { name: 'This link doesn’t work any more', level: 1 }),
  ).toBeVisible();
  await draw.click();
  await page
    .getByRole('dialog', { name: 'Draw names for 6 people?', exact: true })
    .getByRole('button', { name: 'Draw names', exact: true })
    .click();
  await expect(links.locator('.santa-link')).toHaveCount(6);
  await expect(links.locator('.santa-opened')).toHaveText(Array(6).fill('Not opened yet'));
  const reissued = (
    (await (await requestAs(page, `rooms/${room.id}/secret-santa/links`)).json()) as {
      links: { id: string; name: string; token: string }[];
    }
  ).links;
  expect(linkFor('Sam', reissued)).not.toBe(oldSam);
  // The old link stays dead after the new draw; the new one opens.
  await guest.goto(oldSam);
  await expect(
    guest.getByRole('heading', { name: 'This link doesn’t work any more', level: 1 }),
  ).toBeVisible();
  const samDrewAgain = await open('Sam', linkFor('Sam', reissued));
  expect(['Sam', 'Priya']).not.toContain(samDrewAgain);

  // Finish: the event closes and the links keep working.
  await page.getByRole('button', { name: 'Finish', exact: true }).click();
  await page
    .getByRole('dialog', { name: 'Finish this Secret Santa?', exact: true })
    .getByRole('button', { name: 'Finish', exact: true })
    .click();
  await expect(page.locator('.santa-intro')).toContainText('This Secret Santa is finished');
  await expect.poll(async () => (await roomAs(page, room.id)).status).toBe('finished');
  await expect(page.getByRole('button', { name: 'Redraw', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Show on this phone/ })).toHaveCount(0);
  await expect(links.locator('.santa-link')).toHaveCount(6);
  await expect(page.locator('.results')).toHaveCount(0);
  await fitsViewport(page);
  await guest.reload();
  await expect(guest.getByRole('heading', { name: 'Hi Sam', level: 1 })).toBeVisible();
});
