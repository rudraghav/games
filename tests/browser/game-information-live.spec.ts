import { expect, test, type Page } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { attachPreviewAccess, requestAs, roomAs } from './helpers';

// Explicit live evaluation: two guests, two bounded provider calls, three owned rooms.
test.skip(
  process.env.GAMES_GAME_INFO_LIVE !== '1',
  'Opt in to the synthetic live reading evaluation.',
);
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

test('live charts, private saved readings, opt-out and Deal inspection', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.skip(
    info.project.name !== 'desktop',
    'This case checks 320/390/1440 with the same two identities.',
  );
  test.setTimeout(240000);
  page.setDefaultTimeout(15000);
  const friendContext = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
    reducedMotion: 'reduce',
  });
  const friend = await friendContext.newPage();
  friend.setDefaultTimeout(15000);
  const owned: { actor: Page; id: string }[] = [];
  const counts = {
    providerCalls: 0,
    chartSystems: 0,
    privateDenials: 0,
    savedRefreshes: 0,
    inspectedCards: 0,
    widths: [] as number[],
    roomsClosed: 0,
  };
  let complete = false;
  const startedAt = new Date().toISOString();
  const evidence = `.vercel/game-info-live-${Date.now()}-${randomUUID().slice(0, 8)}.json`;
  async function createTarot(actor: Page, name: string) {
    await attachPreviewAccess(actor);
    await actor.goto('/');
    await expect(actor.getByRole('navigation', { name: 'Main navigation' })).toHaveCount(0);
    await actor.getByRole('button', { name: 'Create Pop Tarot room', exact: true }).click();
    await actor.getByRole('textbox', { name: 'Your name', exact: true }).fill(name);
    await actor.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(actor).toHaveURL(/\/rooms\/[\da-f-]+$/);
    const id = new URL(actor.url()).pathname.split('/').at(-1)!;
    owned.push({ actor, id });
    for (let number = 1; number <= 3; number++) {
      await expect(
        actor.getByRole('heading', { name: `Choose card ${number} of 3` }),
      ).toBeVisible();
      await actor
        .getByRole('group', { name: 'Choose from your shuffled 78-card deck' })
        .getByRole('button')
        .first()
        .click();
    }
    return id;
  }
  async function close(actor: Page, id: string) {
    const state = await roomAs(actor, id);
    if (state.status === 'playing')
      expect((await requestAs(actor, `rooms/${id}/abandon`, 'POST')).status()).toBe(200);
    expect((await requestAs(actor, `rooms/${id}/leave`, 'POST')).status()).toBe(200);
    expect((await requestAs(actor, `rooms/${id}`)).status()).toBe(404);
    counts.roomsClosed++;
  }
  try {
    const id = await createTarot(page, 'Synthetic chart QA');
    await page.getByRole('checkbox', { name: 'Include astrology', exact: true }).check();
    await expect(page.getByRole('button', { name: 'Both', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByLabel('Birth date', { exact: true }).fill('2000-01-01');
    await page.getByLabel('Birth time', { exact: true }).fill('12:00');
    await page.getByRole('searchbox', { name: 'Birthplace', exact: true }).fill('Mumbai');
    await page.getByRole('button', { name: 'Search places', exact: true }).click();
    await page
      .getByRole('combobox', { name: 'Choose birthplace', exact: true })
      .selectOption('geo:1275339');
    const previewResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/rooms/${id}/astrology/chart`) &&
        response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
    const preview = await (await previewResponse).json();
    expect(preview.status).toBe('ready');
    expect(preview.chart.charts.map((chart: { system: string }) => chart.system)).toEqual([
      'western',
      'vedic',
    ]);
    counts.chartSystems = 2;
    await expect(
      page.getByRole('region', { name: 'Calculated birth charts', exact: true }),
    ).toBeVisible();
    const readingResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith(`/rooms/${id}/reading`) && response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
    const response = await readingResponse;
    expect(response.status()).toBe(200);
    const saved = await response.json();
    counts.providerCalls++;
    expect(saved.status).toBe('complete');
    expect(saved.reading.astrology.chart).toEqual(preview.chart);
    expect(
      saved.reading.astrology.interpretation.western.focus_points.length,
    ).toBeGreaterThanOrEqual(2);
    expect(saved.reading.astrology.interpretation.vedic.focus_points.length).toBeGreaterThanOrEqual(
      2,
    );
    expect(JSON.stringify(saved)).not.toContain('birth_date');
    expect(JSON.stringify(saved)).not.toContain('birth_time');
    expect(JSON.stringify(saved)).not.toContain('place_id');
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
      await expect(
        page.getByRole('region', { name: 'Saved astrology reading', exact: true }),
      ).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      counts.widths.push(width);
    }
    await page.reload();
    await expect(
      page.getByRole('region', { name: 'Saved astrology reading', exact: true }),
    ).toBeVisible();
    expect((await (await requestAs(page, `rooms/${id}/reading`)).json()).reading).toEqual(
      saved.reading,
    );
    counts.savedRefreshes++;
    const friendId = await createTarot(friend, 'Ordinary Tarot QA');
    for (const [actor, other] of [
      [friend, id],
      [page, friendId],
    ] as const) {
      expect((await requestAs(actor, `rooms/${other}/reading`)).status()).toBe(404);
      counts.privateDenials++;
    }
    const ordinaryResponse = friend.waitForResponse(
      (result) =>
        result.url().endsWith(`/rooms/${friendId}/reading`) && result.request().method() === 'POST',
    );
    await friend.getByRole('button', { name: 'Read my cards', exact: true }).click();
    const ordinary = await ordinaryResponse;
    expect(ordinary.status()).toBe(200);
    expect(ordinary.request().postDataJSON()).not.toHaveProperty('astrology');
    expect(ordinary.request().postDataJSON()).not.toHaveProperty('reuse_saved_astrology');
    const ordinaryView = await ordinary.json();
    expect(ordinaryView.reading.cards).toHaveLength(3);
    expect(ordinaryView.reading).not.toHaveProperty('astrology');
    counts.providerCalls++;
    await expect(friend.locator('.tarot-quirky-read')).toHaveCount(3);
    await close(page, id);
    owned.splice(
      owned.findIndex((item) => item.id === id),
      1,
    );
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Monopoly Deal room', exact: true }).click();
    await page.getByRole('button', { name: 'Bots', exact: true }).click();
    await page.getByRole('button', { name: 'Play game', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    const dealId = new URL(page.url()).pathname.split('/').at(-1)!;
    owned.push({ actor: page, id: dealId });
    await expect(page.locator('.deal-workspace')).toBeVisible();
    const before = await roomAs(page, dealId);
    await page.getByRole('button', { name: 'Card info', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Card info', exact: true });
    const options = await dialog
      .getByRole('combobox', { name: 'Card to inspect', exact: true })
      .locator('option')
      .evaluateAll((nodes) => nodes.map((node) => (node as HTMLOptionElement).value));
    for (const value of options) {
      await dialog
        .getByRole('combobox', { name: 'Card to inspect', exact: true })
        .selectOption(value);
      await expect(dialog.getByText('Payment value', { exact: true })).toBeVisible();
      counts.inspectedCards++;
    }
    await page.keyboard.press('Escape');
    expect((await roomAs(page, dealId)).match_version).toBe(before.match_version);
    await expect(page.getByRole('button', { name: 'Card info', exact: true })).toBeFocused();
    complete = true;
  } finally {
    const cleanupFailures: string[] = [];
    for (const item of owned.reverse()) {
      try {
        await close(item.actor, item.id);
      } catch {
        cleanupFailures.push(item.id);
      }
    }
    await friendContext.close();
    await mkdir('.vercel', { recursive: true });
    await writeFile(
      evidence,
      JSON.stringify(
        {
          startedAt,
          completedAt: new Date().toISOString(),
          origin: new URL(baseURL!).origin,
          applicationSourceSha: process.env.GAMES_RELEASE_SHA || null,
          complete,
          counts,
          cleanupFailures,
          syntheticInputsOnly: true,
          providerResponsesLogged: false,
        },
        null,
        2,
      ) + '\n',
    );
    expect(cleanupFailures, 'Every task-owned room must close').toEqual([]);
  }
});
