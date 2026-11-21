import { expect, test, type Page } from '@playwright/test';
import { writeFile } from 'node:fs/promises';
import type {
  AstrologyChart,
  AstrologyInput,
  AstrologyPreview,
} from '../../packages/api-client/src/index';
import type { components } from '../../packages/api-client/src/generated/schema';
import {
  syntheticChart,
  syntheticPlace,
  syntheticAstrologyReading,
} from '../../apps/web/src/stories/fixtures/astrology';
import dstChart from '../../apps/web/src/stories/fixtures/astrology-dst-synthetic.json' with { type: 'json' };
import { tarotReadingExample } from '../../apps/web/src/stories/fixtures/tarot-reading';
import { drawTarotCard, requestAs, roomAs } from './helpers';

test.use({ trace: 'off', screenshot: 'off' });
test.skip(!!process.env.GAMES_TEST_URL, 'Synthetic provider tests use local development only.');

type ReadingView = components['schemas']['ReadingView'];
const michaelScene = 'Michael leaves his job in Scranton to build a life with Holly in Colorado.';

const cleanup = new WeakMap<Page, { roomId?: string }>();
test.afterEach(async ({ page }, info) => {
  test.setTimeout(45000);
  const owned = cleanup.get(page);
  if (!owned) return;
  // Bound cleanup API requests inside the independent teardown budget.
  page.context().setDefaultTimeout(5000);
  let closed = false;
  try {
    if (owned.roomId) {
      await page.unrouteAll({ behavior: 'ignoreErrors' });
      const response = await requestAs(page, `rooms/${owned.roomId}`);
      if (response.ok()) {
        if ((await response.json()).status === 'playing')
          expect((await requestAs(page, `rooms/${owned.roomId}/abandon`, 'POST')).status()).toBe(
            200,
          );
        expect((await requestAs(page, `rooms/${owned.roomId}/leave`, 'POST')).status()).toBe(200);
      }
      expect((await requestAs(page, `rooms/${owned.roomId}`)).status()).toBe(404);
      closed = true;
    }
  } finally {
    await writeFile(
      info.outputPath('cleanup.json'),
      JSON.stringify({ roomId: owned.roomId, closed, providerCalls: 0 }),
      { mode: 0o600 },
    );
    cleanup.delete(page);
  }
});

type ReadingRequest = components['schemas']['ReadingInput'];

function chartFor(system: AstrologyInput['system'] = 'both'): AstrologyChart {
  return {
    ...syntheticChart,
    charts: syntheticChart.charts.filter((chart) => system === 'both' || chart.system === system),
  };
}

function readingForChart(chart: AstrologyChart) {
  const includes = (system: 'western' | 'vedic') =>
    chart.charts.some((entry) => entry.system === system);
  return {
    chart,
    interpretation: {
      ...syntheticAstrologyReading.interpretation,
      western: includes('western') ? syntheticAstrologyReading.interpretation.western : null,
      vedic: includes('vedic') ? syntheticAstrologyReading.interpretation.vedic : null,
    },
  };
}

function progress(
  stage: components['schemas']['ReadingProgress']['stage'],
  patch: Partial<components['schemas']['ReadingProgress']> = {},
): components['schemas']['ReadingProgress'] {
  const now = Date.now() / 1000;
  return {
    stage,
    provider: 'Gemini',
    attempt: 1,
    max_attempts: 3,
    started_at: now - 10,
    updated_at: now,
    estimated_percent: 35,
    estimated_seconds_remaining: 45,
    ...patch,
  };
}
async function withReading(
  page: Page,
  run: (state: {
    roomId: string;
    requests: ReadingRequest[];
    getView: () => ReadingView;
    setView: (value: ReadingView) => void;
    setChart: (handler: (input: AstrologyInput) => Promise<AstrologyPreview>) => void;
    setPlaces: (handler: (query: string) => Promise<unknown>) => void;
    chartInputs: AstrologyInput[];
  }) => Promise<void>,
) {
  page.setDefaultTimeout(15000);
  const owned: { roomId?: string } = {};
  cleanup.set(page, owned);
  let roomId: string | undefined;
  let view: ReadingView = {
    status: 'ready',
    reading_style: 'fun',
    reading: null,
    api_tier: 'paid',
    question: '',
    message: '',
  };
  const requests: ReadingRequest[] = [],
    chartInputs: AstrologyInput[] = [];
  const requestedUrls: string[] = [];
  const recordUrl = (request: import('@playwright/test').Request) =>
    requestedUrls.push(request.url());
  page.on('request', recordUrl);
  let calculate = async (input: AstrologyInput): Promise<AstrologyPreview> => ({
    status: 'ready',
    chart: chartFor(input.system),
  });
  let places = async (_query: string): Promise<unknown> => ({
    places: [syntheticPlace],
    attribution: 'Synthetic place fixture. No personal data.',
  });
  await page.route('**/api/backend/v1/rooms/*/reading', async (route) => {
    if (route.request().method() === 'POST') {
      const body = route.request().postDataJSON() as ReadingRequest;
      requests.push(body);
      const room = await roomAs(page, roomId!);
      const cards = tarotReadingExample.cards.map((card, index) => ({
        ...card,
        card_id: room.game!.community[index].id,
        title: room.game!.community[index].label,
        characters: card.characters.map((character) =>
          body.reading_style === 'fun' && character.name === 'Michael Scott'
            ? {
                ...character,
                evidence: michaelScene,
                connection: `${michaelScene} ${character.connection}`,
              }
            : character,
        ),
      }));
      const astrologyChart = body.astrology
        ? chartFor(body.astrology.system)
        : body.reuse_saved_astrology
          ? view.astrology_chart || syntheticChart
          : undefined;
      view = {
        status: 'complete',
        api_tier: 'paid',
        question: body.question,
        reading_style: body.reading_style,
        message: '',
        reading: {
          ...tarotReadingExample,
          cards,
          ...(astrologyChart ? { astrology: readingForChart(astrologyChart) } : {}),
        },
      };
    }
    await route.fulfill({ json: view });
  });
  await page.route('**/api/backend/v1/rooms/*/astrology/places', async (route) => {
    const body = route.request().postDataJSON();
    try {
      await route.fulfill({ json: await places(body.query) });
    } catch {
      await route.fulfill({
        status: 503,
        json: { detail: 'Synthetic location service unavailable.' },
      });
    }
  });
  await page.route('**/api/backend/v1/rooms/*/astrology/chart', async (route) => {
    const body = route.request().postDataJSON();
    chartInputs.push(body.astrology);
    await route.fulfill({ json: await calculate(body.astrology) });
  });
  try {
    await page.goto('/games/tarot');
    const created = page
      .waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          new URL(response.url()).pathname === '/api/backend/v1/games/tarot/play',
      )
      .then(async (response) => {
        if (response.ok()) owned.roomId = (await response.json()).id;
      });
    await page.getByRole('button', { name: 'Start reading', exact: true }).click();
    await created;
    roomId = owned.roomId!;
    await expect(page).toHaveURL(/\/games\/tarot\/play\/[\da-f-]+$/);
    for (let card = 1; card <= 3; card++) {
      await expect(page.getByRole('heading', { name: `Choose card ${card} of 3` })).toBeVisible();
      await drawTarotCard(page);
    }
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeEnabled();
    await run({
      roomId,
      requests,
      getView: () => view,
      chartInputs,
      setView: (value) => {
        view = value;
      },
      setChart: (handler) => {
        calculate = handler;
      },
      setPlaces: (handler) => {
        places = handler;
      },
    });
    const storage = await page.evaluate(() =>
      [...Object.values(localStorage), ...Object.values(sessionStorage)].join(' '),
    );
    expect(storage).not.toContain('2000-01-01');
    expect(storage).not.toContain('Greenwich');
    expect(page.url()).not.toContain('2000-01-01');
    expect(
      requestedUrls.some((url) => /2000-01-01|birth_date|birth_time|Greenwich/.test(url)),
    ).toBe(false);
  } finally {
    page.off('request', recordUrl);
  }
}
async function details(page: Page) {
  await page.getByRole('checkbox', { name: 'Include astrology', exact: true }).check();
  await page.getByLabel('Birth date', { exact: true }).fill('2000-01-01');
  await page.getByLabel('Birth time', { exact: true }).fill('12:00');
  await page.getByRole('searchbox', { name: 'Birthplace', exact: true }).fill('Greenwich');
  await page.getByRole('button', { name: 'Search places', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Choose birthplace', exact: true })
    .selectOption(syntheticPlace.id);
}
async function noOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
async function capture(page: Page, name: string) {
  await page.evaluate(() => document.fonts.ready);
  const scroll = await page.evaluate(() => ({ x: scrollX, y: scrollY }));
  try {
    // WebKit does not start an offscreen lazy image merely because decode() was called.
    for (const image of await page.locator('.tarot-table img:visible').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(
          () =>
            image.evaluate(
              (element: HTMLImageElement) =>
                element.complete && element.naturalWidth > 0 && element.naturalHeight > 0,
            ),
          { timeout: 10000 },
        )
        .toBe(true);
      expect(
        await image.evaluate((element: HTMLImageElement) =>
          Promise.race([
            element.decode().then(
              () => true,
              () => false,
            ),
            new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 3000)),
          ]),
        ),
      ).toBe(true);
    }
  } finally {
    await page.evaluate(({ x, y }) => window.scrollTo(x, y), scroll);
  }
  await page.locator('.tarot-table').screenshot({ path: test.info().outputPath(`${name}.png`) });
}

test('opting out of Fun preserves Classic across refresh and shows all three reading layers', async ({
  page,
}) => {
  await withReading(page, async ({ requests, setView }) => {
    setView({
      status: 'ready',
      reading_style: 'fun',
      reading: null,
      api_tier: 'paid',
      question: '',
      message: '',
      provider_names: ['Google Gemini', 'Groq', 'Cloudflare'],
    });
    await page.reload();
    await expect(page.locator('#tarot-data-use')).toContainText(
      'Google Gemini, Groq, or Cloudflare',
    );
    await capture(page, 'configured-reading-providers');
    await expect(page.getByRole('checkbox', { name: 'Include astrology' })).not.toBeChecked();
    await expect(page.getByLabel('Birth date', { exact: true })).toHaveCount(0);
    const fun = page.getByRole('switch', { name: 'Fun mode', exact: true });
    await expect(fun).toBeChecked();
    if (test.info().project.use.hasTouch) await fun.tap();
    else {
      await fun.focus();
      await page.keyboard.press('Space');
    }
    await expect(fun).not.toBeChecked();
    await page.reload();
    await expect(fun).not.toBeChecked();
    await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
    await expect(page.locator('.tarot-reading > article')).toHaveCount(3);
    await expect(page.locator('.tarot-character-connections')).toHaveCount(3);
    await expect(page.locator('.tarot-quirky-read')).toHaveCount(3);
    expect(requests).toHaveLength(1);
    expect(requests[0].reading_style).toBe('classic');
    expect(requests[0]).not.toHaveProperty('astrology');
    expect(requests[0]).not.toHaveProperty('reuse_saved_astrology');
    await expect(page.getByRole('region', { name: 'Saved astrology reading' })).toHaveCount(0);
    await noOverflow(page);
  });
});

test('Fun style survives refresh and retry, then opens the same character scenes in the archive', async ({
  page,
}) => {
  if (test.info().project.use.hasTouch) await page.setViewportSize({ width: 320, height: 700 });
  await withReading(page, async ({ roomId, requests, setView, getView }) => {
    const fun = page.getByRole('switch', { name: 'Fun mode', exact: true });
    const hint = page
      .getByRole('tooltip')
      .filter({ hasText: 'Fun for pop culture, Classic for reflection.' });
    await expect(fun).toBeChecked();
    await expect(fun).toHaveAccessibleDescription('Fun for pop culture, Classic for reflection.');
    const info = page.getByRole('button', { name: 'About Fun mode', exact: true });
    await expect(hint).toBeVisible();
    await expect(info).toHaveAttribute('aria-expanded', 'true');
    const metrics = await hint.evaluate((element) => {
      const range = document.createRange();
      range.selectNodeContents(element);
      const lines = Array.from(range.getClientRects()).filter((line) => line.width > 0);
      return {
        rows: new Set(lines.map((line) => Math.round(line.top))).size,
        inBounds: lines.every((line) => line.left >= 0 && line.right <= innerWidth),
      };
    });
    expect(metrics).toEqual({ rows: 1, inBounds: true });
    await hint.evaluate((element) =>
      element.scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    await expect(fun).toBeInViewport();
    await expect(hint).toBeInViewport();
    await page.screenshot({ path: test.info().outputPath('fun-switch-and-help.png') });
    if (test.info().project.use.hasTouch) await info.tap();
    else await info.click();
    await expect(hint).toBeHidden();
    await expect(info).toHaveAttribute('aria-expanded', 'false');
    await expect(fun).toHaveAccessibleDescription('Fun for pop culture, Classic for reflection.');
    if (test.info().project.use.hasTouch) await info.tap();
    else await info.press('Enter');
    await expect(hint).toBeVisible();
    await expect(fun).toBeChecked();
    await info.focus();
    await info.press('Escape');
    await expect(hint).toBeHidden();
    await expect(info).toBeFocused();
    await info.press('Space');
    await expect(hint).toBeVisible();
    await expect(fun).toBeChecked();
    await page.reload();
    await expect(fun).toBeChecked();
    await noOverflow(page);

    const room = await roomAs(page, roomId);
    const failures: string[] = [];
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, async (route) => {
      if (route.request().method() !== 'POST' || failures.length) return route.fallback();
      const body: ReadingRequest = route.request().postDataJSON();
      failures.push(body.reading_style ?? 'classic');
      setView({
        ...getView(),
        reading_style: body.reading_style,
        status: 'failed',
        failure: { code: 'temporary', message: 'The reading couldn’t finish.', retryable: true },
      });
      await route.fulfill({ status: 503, json: { detail: 'Synthetic interruption.' } });
    });
    await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
    const retry = page.getByRole('button', { name: 'Retry reading', exact: true });
    await expect(retry).toBeEnabled();
    expect(failures).toEqual(['fun']);
    // A fresh tab has no draft. The prior attempt must restore its saved style.
    await page.evaluate(
      (key) => sessionStorage.removeItem(key),
      `games:draft:tarot-style:${roomId}:${room.match_id}`,
    );
    await page.reload();
    await expect(fun).toBeChecked();
    await retry.click();
    const scenes = page.getByRole('heading', { name: 'How it could play out' });
    await expect(scenes).toHaveCount(3);
    await expect(fun).toBeChecked();
    expect(requests.map((request) => request.reading_style)).toEqual(['fun']);
    await page.reload();
    await expect(scenes).toHaveCount(3);

    const firstCard = page.locator('.tarot-reading article').first();
    const cast = firstCard.locator('.tarot-character-connections');
    const character = cast.getByRole('listitem').filter({ hasText: 'Michael Scott' });
    const inspectScene = async () => {
      const scene = character.locator('.tarot-character-scene');
      await expect(scene).toHaveText(michaelScene);
      await expect(scene).toBeVisible();
      await expect(character.locator('details')).toHaveCount(0);
      expect((await character.innerText()).split(michaelScene)).toHaveLength(2);
      const move = character.locator('.tarot-character-copy > p');
      await expect(move).toHaveText(tarotReadingExample.cards[0].characters[0].connection);
      const [imageBounds, sceneBounds, moveBounds] = await Promise.all(
        [character.locator('img'), scene, move].map((element) => element.boundingBox()),
      );
      expect(sceneBounds!.x).toBeGreaterThanOrEqual(imageBounds!.x + imageBounds!.width);
      expect(moveBounds!.y).toBeGreaterThanOrEqual(sceneBounds!.y + sceneBounds!.height - 1);
    };
    await inspectScene();
    await expect(cast.locator('img').first()).toBeVisible();
    await expect(firstCard.locator('h4').first()).toHaveText('How it could play out');
    let archiveStyle: 'fun' | undefined = 'fun';
    await page.route(`**/api/backend/v1/readings/${room.match_id}`, (route) =>
      route.fulfill({
        json: {
          ...getView(),
          reading_style: archiveStyle,
          match_id: room.match_id,
          room_id: roomId,
          created_at: Date.now() / 1000,
          cards: room.game!.community,
          can_resume: false,
        },
      }),
    );
    await page.goto(`/games/tarot/readings/${room.match_id}`);
    await expect(page.getByText('Saved Fun Tarot reading', { exact: true })).toBeVisible();
    await inspectScene();
    await expect(fun).toBeChecked();
    await page.locator('.tarot-image-credits summary').click();
    await expect(page.locator('.tarot-image-credits li').first()).toBeVisible();
    await noOverflow(page);
    archiveStyle = undefined;
    await page.reload();
    await expect(page.getByText('Saved Tarot reading', { exact: true })).toBeVisible();
    await expect(scenes).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Your connections' })).toHaveCount(3);
    await expect(character.locator('details')).not.toHaveAttribute('open');
    await expect(character.locator('.tarot-character-scene')).toHaveCount(0);
    expect(requests).toHaveLength(1);
  });
});

for (const system of ['western', 'vedic'] as const)
  test(`${system} alone previews, submits and restores only its selected chart and analysis`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await withReading(page, async ({ requests, chartInputs }) => {
      const title = system === 'western' ? 'Western' : 'Vedic';
      const other = system === 'western' ? 'Vedic' : 'Western';
      await details(page);
      await page
        .getByRole('group', { name: 'Astrology tradition' })
        .getByRole('button', { name: title, exact: true })
        .click();
      await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
      const charts = page.getByRole('region', { name: 'Calculated birth charts', exact: true });
      await expect(charts).toBeVisible();
      await expect(charts.getByRole('tab')).toHaveCount(0);
      await expect(
        charts.locator(system === 'western' ? '.astrology-wheel' : '.astrology-diamond'),
      ).toBeVisible();
      expect(chartInputs[0].system).toBe(system);
      await noOverflow(page);
      await capture(page, `${system}-only-preview-320`);
      await page
        .getByRole('textbox', { name: 'What’s on your mind?' })
        .fill('How can I make room for a new hobby?');
      await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
      await expect(
        page.getByRole('region', { name: `${title} interpretation`, exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('region', { name: `${other} interpretation`, exact: true }),
      ).toHaveCount(0);
      expect(requests).toHaveLength(1);
      expect(requests[0].astrology?.system).toBe(system);
      const original = await page.locator('.astrology-saved').innerText();
      await page.reload();
      await expect(
        page.getByRole('region', { name: `${title} interpretation`, exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole('region', { name: `${other} interpretation`, exact: true }),
      ).toHaveCount(0);
      expect(await page.locator('.astrology-saved').innerText()).toBe(original);
      await page.getByRole('button', { name: 'Hide charts', exact: true }).click();
      await expect(charts).not.toBeVisible();
      await expect(
        page.getByRole('region', { name: `${title} interpretation`, exact: true }),
      ).toBeVisible();
      await page.getByRole('button', { name: 'Show charts', exact: true }).click();
      await expect(charts).toBeVisible();
      expect(requests).toHaveLength(1);
      await capture(page, `${system}-only-saved-320`);
    });
  });

test('the reading CTA morphs in place into progress and returns keyboard focus on retry', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await withReading(page, async ({ roomId, requests, setView }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let posts = 0;
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      posts++;
      if (posts > 1) return route.fallback();
      await gate;
      setView({
        status: 'failed',
        reading: null,
        api_tier: 'paid',
        question: '',
        message: '',
        failure: { code: 'temporary', message: 'The reading couldn’t finish.', retryable: true },
      });
      return route.fulfill({ status: 503, json: { detail: 'Synthetic reading failure.' } });
    });
    try {
      await page.evaluate(() => document.fonts.ready);
      const button = page.getByRole('button', { name: 'Read my cards', exact: true });
      const surface = page.locator('.tarot-action-surface');
      await button.scrollIntoViewIfNeeded();
      await button.focus();
      await expect(button).toBeFocused();
      const original = await surface.elementHandle();
      expect(original).not.toBeNull();
      const before = await surface.boundingBox();
      expect(before).not.toBeNull();
      await page.screenshot({ path: test.info().outputPath('cta-before-320.png') });
      // Sample the actual rendered frame sizes, without changing animation speed.
      const framesPromise = surface.evaluate(
        (element) =>
          new Promise<{ time: number; height: number; width: number; overflow: boolean }[]>(
            (resolve) => {
              const frames: { time: number; height: number; width: number; overflow: boolean }[] =
                [];
              const waitingAt = performance.now();
              let startedAt: number | undefined;
              const sample = (now: number) => {
                if (element.getAttribute('data-processing') === 'true') startedAt ??= now;
                if (startedAt !== undefined) {
                  const rect = element.getBoundingClientRect();
                  frames.push({
                    time: now - startedAt,
                    height: rect.height,
                    width: rect.width,
                    overflow: document.documentElement.scrollWidth > innerWidth,
                  });
                }
                if (
                  (startedAt !== undefined && now - startedAt >= 650) ||
                  now - waitingAt >= 4000
                ) {
                  resolve(frames);
                } else requestAnimationFrame(sample);
              };
              requestAnimationFrame(sample);
            },
          ),
      );
      await button.press('Enter');
      await expect(surface).toHaveAttribute('data-processing', 'true');
      await expect(surface).toBeFocused();
      await expect(page.getByRole('region', { name: 'Reading progress', exact: true })).toHaveCount(
        1,
      );
      await expect(
        page.getByRole('button', { name: /Read my cards|Writing your reading/ }),
      ).toHaveCount(0);
      await expect(page.locator('.tarot-action-control')).toHaveAttribute('inert', '');
      await expect
        .poll(async () => (await surface.boundingBox())!.height)
        .toBeGreaterThan(before!.height + 4);
      await page.screenshot({
        path: test.info().outputPath('cta-transition-320.png'),
        animations: 'allow',
      });
      const frames = await framesPromise;
      const after = await surface.boundingBox();
      expect(after).not.toBeNull();
      expect(after!.height).toBeGreaterThan(before!.height + 30);
      expect(
        frames.some(({ height }) => height > before!.height + 2 && height < after!.height - 2),
      ).toBe(true);
      expect(frames.every(({ width, overflow }) => width <= 320 && !overflow)).toBe(true);
      expect(await surface.evaluate((element, previous) => element === previous, original)).toBe(
        true,
      );
      expect(after!.y).toBeGreaterThanOrEqual(0);
      expect(after!.y + after!.height).toBeLessThanOrEqual(740);
      await page.screenshot({ path: test.info().outputPath('cta-processing-320.png') });
      await writeFile(
        test.info().outputPath('cta-transition-frames.json'),
        JSON.stringify({ before, frames, after }),
      );
      await page
        .locator('form.tarot-question')
        .evaluate((form: HTMLFormElement) => form.requestSubmit());
      expect(posts).toBe(1);
      release();
      const retry = page.getByRole('button', { name: 'Retry reading', exact: true });
      await expect(retry).toBeEnabled();
      await expect(retry).toBeFocused();
      await expect(surface).not.toHaveAttribute('data-processing', 'true');
      await expect(page.getByRole('region', { name: 'Reading progress', exact: true })).toHaveCount(
        0,
      );
      expect(await surface.evaluate((element, previous) => element === previous, original)).toBe(
        true,
      );
      await retry.press('Enter');
      await expect(page.locator('.tarot-reading')).toBeVisible();
      expect(posts).toBe(2);
      expect(requests).toHaveLength(1);
      await noOverflow(page);
    } finally {
      release();
    }
  });
});

for (const motion of ['no-preference', 'reduce'] as const) {
  test(`growing progress stays visible until the user scrolls away (${motion})`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await page.emulateMedia({ reducedMotion: motion });
    await withReading(page, async ({ roomId, requests, setView }) => {
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      let posts = 0;
      const generating = {
        status: 'generating',
        reading: null,
        api_tier: 'paid' as const,
        question: '',
        message: '',
      };
      await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, async (route) => {
        if (route.request().method() === 'POST') {
          posts++;
          setView({ ...generating, progress: progress('matching') });
          await gate;
        }
        return route.fallback();
      });
      try {
        const button = page.getByRole('button', { name: 'Read my cards', exact: true });
        const surface = page.locator('.tarot-action-surface');
        const panel = page.getByRole('region', { name: 'Reading progress', exact: true });
        await button.scrollIntoViewIfNeeded();
        await button.focus();
        await button.press('Enter');
        await expect(surface).toBeFocused();
        await expect(panel.getByRole('status')).toHaveText('Finding character connections.');
        await expect
          .poll(async () => {
            const bounds = (await surface.boundingBox())!;
            return bounds.y + bounds.height;
          })
          .toBeLessThanOrEqual(740);
        const before = (await surface.boundingBox())!;
        const initialScroll = await page.evaluate(() => scrollY);
        const detail = 'Card 1 wording failed its question format. Retrying without that format.';
        setView({
          ...generating,
          progress: progress('retrying', {
            provider: 'Groq',
            attempt: 2,
            retry_detail: detail,
            estimated_percent: 61,
            estimated_seconds_remaining: 25,
          }),
        });
        await expect(panel.getByRole('status')).toContainText(detail);
        await expect
          .poll(async () => {
            const bounds = (await surface.boundingBox())!;
            return bounds.y + bounds.height;
          })
          .toBeLessThanOrEqual(740);
        const grown = (await surface.boundingBox())!;
        expect(grown.height).toBeGreaterThan(before.height + 20);
        expect(await page.evaluate(() => scrollY)).toBeGreaterThan(initialScroll);
        const estimate = (await panel.locator('.tarot-generation-estimate').boundingBox())!;
        expect(estimate.y + estimate.height).toBeLessThanOrEqual(740);
        await page.screenshot({ path: test.info().outputPath('grown-progress-visible-320.png') });

        // Wheel movement preserves focus but explicitly ends automatic following.
        const followedScroll = await page.evaluate(() => scrollY);
        await page.mouse.wheel(0, -100);
        await expect
          .poll(() => page.evaluate(() => scrollY))
          .toBeLessThanOrEqual(followedScroll - 99);
        await expect(surface).toBeFocused();
        const leftScroll = await page.evaluate(() => scrollY);
        const leftBounds = (await surface.boundingBox())!;
        expect(leftBounds.y).toBeLessThan(740);
        expect(leftBounds.y + leftBounds.height).toBeGreaterThan(740);
        const longerDetail = `${detail} The next model will use your cards and saved question for a fresh interpretation.`;
        expect(longerDetail.length).toBeLessThanOrEqual(160);
        setView({
          ...generating,
          progress: progress('retrying', {
            provider: 'Cloudflare',
            attempt: 3,
            retry_detail: longerDetail,
            estimated_percent: 79,
            estimated_seconds_remaining: 20,
          }),
        });
        await expect(panel.getByRole('status')).toContainText(longerDetail);
        expect((await surface.boundingBox())!.height).toBeGreaterThan(grown.height + 20);
        const scrollFrames = await page.evaluate(
          () =>
            new Promise<number[]>((resolve) => {
              const positions: number[] = [];
              const started = performance.now();
              const sample = (now: number) => {
                positions.push(scrollY);
                if (now - started >= 550) resolve(positions);
                else requestAnimationFrame(sample);
              };
              requestAnimationFrame(sample);
            }),
        );
        expect(scrollFrames.every((position) => Math.abs(position - leftScroll) <= 1)).toBe(true);
        await page.screenshot({ path: test.info().outputPath('grown-progress-user-away-320.png') });
        await writeFile(
          test.info().outputPath('growth-follow.json'),
          JSON.stringify({
            before,
            grown,
            initialScroll,
            followedScroll,
            leftScroll,
            scrollFrames,
          }),
        );
        expect(posts).toBe(1);
        await noOverflow(page);
        release();
        await expect(page.locator('.tarot-reading')).toBeVisible();
        expect(requests).toHaveLength(1);
      } finally {
        release();
      }
    });
  });
}

test('a held request polls actual stages and provider fallbacks without another submission', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await withReading(page, async ({ roomId, requests, setView }) => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    let posts = 0;
    let progressReads = 0;
    const question = 'How can I make room for a new hobby?';
    const generating = {
      status: 'generating',
      reading: null,
      api_tier: 'paid' as const,
      provider_names: ['Google Gemini', 'Groq', 'Cloudflare'],
      question,
      message: '',
    };
    const originalCards = await page.locator('.tarot-spread .tarot-name').allTextContents();
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, async (route) => {
      if (route.request().method() === 'POST') {
        posts++;
        setView({ ...generating, progress: progress('matching', { estimated_percent: 28 }) });
        await gate;
      } else if (posts) progressReads++;
      return route.fallback();
    });
    try {
      await page.getByRole('textbox', { name: 'What’s on your mind?' }).fill(question);
      await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
      const meter = page.getByRole('progressbar', { name: 'Estimated reading progress' });
      const panel = page.getByRole('region', { name: 'Reading progress', exact: true });
      await expect(meter).toHaveAttribute('aria-valuenow', '28');
      await expect(panel.getByRole('status')).toHaveText('Finding character connections.');
      await expect(panel).toContainText('28% estimated');
      await expect(panel).toContainText('About 45 sec remaining');
      const visibleProgress = await panel.boundingBox();
      expect(visibleProgress!.y).toBeGreaterThanOrEqual(0);
      expect(visibleProgress!.y + visibleProgress!.height).toBeLessThanOrEqual(740);
      expect(
        await panel.locator('.spin').evaluate((element) => getComputedStyle(element).animationName),
      ).toBe('none');
      await expect(page.locator('.tarot-action-surface')).toHaveAttribute(
        'data-processing',
        'true',
      );
      await expect(
        page.getByRole('button', { name: /Read my cards|Writing your reading/ }),
      ).toHaveCount(0);
      expect(
        await page
          .locator('.tarot-action-expander')
          .evaluate((element) =>
            Math.max(
              ...getComputedStyle(element).transitionDuration.split(',').map(Number.parseFloat),
            ),
          ),
      ).toBeLessThanOrEqual(0.001);
      await expect(page.getByRole('textbox', { name: 'What’s on your mind?' })).toBeDisabled();
      await expect(page.getByRole('checkbox', { name: 'Include astrology' })).toBeDisabled();
      expect(progressReads).toBeGreaterThan(0);
      const fallbackStart = Date.now() / 1000 - 30;
      const retryDetail =
        'Card 1 wording failed its question format. Retrying without that format.';
      for (const [provider, attempt, percent] of [
        ['Groq', 2, 61],
        ['Cloudflare', 3, 79],
      ] as const) {
        await page.evaluate(() => scrollTo(0, 0));
        setView({
          ...generating,
          progress: progress('retrying', {
            provider,
            attempt,
            started_at: fallbackStart,
            estimated_percent: percent,
            estimated_seconds_remaining: 25,
            retry_detail: retryDetail,
          }),
        });
        await expect(panel.getByRole('status')).toContainText(`Retrying with ${provider}.`);
        await expect(panel.getByRole('status')).toContainText(retryDetail);
        await expect(meter).toHaveAttribute('aria-valuenow', String(percent));
        expect(await page.evaluate(() => scrollY)).toBe(0);
        expect(Number(await meter.getAttribute('aria-valuenow'))).toBeLessThan(100);
        await noOverflow(page);
        await panel.screenshot({ path: test.info().outputPath(`progress-${provider}-320.png`) });
      }
      for (const [stage, percent, label] of [
        ['checking', 93, 'Checking your reading.'],
        ['saving', 98, 'Saving your reading.'],
      ] as const) {
        setView({
          ...generating,
          progress: progress(stage, {
            provider: 'Cloudflare',
            attempt: 3,
            started_at: fallbackStart,
            estimated_percent: percent,
            estimated_seconds_remaining: 5,
          }),
        });
        await expect(panel.getByRole('status')).toHaveText(label);
        await expect(panel).not.toContainText(retryDetail);
        await expect(meter).toHaveAttribute('aria-valuenow', String(percent));
      }
      await page
        .locator('form.tarot-question')
        .evaluate((form: HTMLFormElement) => form.requestSubmit());
      expect(posts).toBe(1);
      await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(originalCards);
      release();
      await expect(page.locator('.tarot-reading')).toBeVisible();
      await expect(meter).toHaveCount(0);
      expect(posts).toBe(1);
      expect(requests).toHaveLength(1);
    } finally {
      release();
    }
  });
});

test('saved progress survives refresh and slow estimates never claim completion', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await withReading(page, async ({ requests, setView }) => {
    const question = 'What would make a new hobby easier to begin?';
    const saved = {
      status: 'generating',
      reading_style: 'fun' as const,
      reading: null,
      api_tier: 'paid' as const,
      question,
      message: '',
      astrology_chart: syntheticChart,
    };
    const startedAt = Date.now() / 1000 - 50;
    const retryDetail = 'Card 1 wording failed its question format. Retrying without that format.';
    setView({
      ...saved,
      progress: progress('retrying', {
        provider: 'Groq',
        attempt: 2,
        retry_detail: retryDetail,
        started_at: startedAt,
        estimated_percent: 74,
        estimated_seconds_remaining: 14,
      }),
    });
    const meter = page.getByRole('progressbar', { name: 'Estimated reading progress' });
    const panel = page.getByRole('region', { name: 'Reading progress', exact: true });
    for (let reload = 0; reload < 2; reload++) {
      await page.reload();
      await expect(meter).toHaveAttribute('aria-valuenow', '74');
      await expect(panel).toContainText('About 15 sec remaining');
      await expect(panel).toContainText(retryDetail);
      await expect(page.locator('.tarot-action-surface')).toHaveAttribute(
        'data-processing',
        'true',
      );
      await expect(
        page.getByRole('button', { name: /Read my cards|Writing your reading/ }),
      ).toHaveCount(0);
      expect(
        await page
          .locator('.tarot-action-expander')
          .evaluate((element) => getComputedStyle(element).transitionDuration),
      ).toBe('0s');
      await expect(page.getByRole('textbox', { name: 'What’s on your mind?' })).toHaveValue(
        question,
      );
      const fun = page.getByRole('switch', { name: 'Fun mode', exact: true });
      await expect(fun).toBeChecked();
      await expect(fun).toBeDisabled();
      await expect(page.getByRole('checkbox', { name: 'Include astrology' })).toBeChecked();
      await expect(page.getByLabel('Birth date', { exact: true })).toHaveCount(0);
      expect(requests).toHaveLength(0);
    }
    setView({
      ...saved,
      progress: progress('retrying', {
        provider: 'Groq',
        attempt: 2,
        retry_detail: retryDetail,
        started_at: startedAt,
        estimated_percent: 94,
        estimated_seconds_remaining: null,
      }),
    });
    await expect(meter).toHaveAttribute('aria-valuenow', '94');
    await expect(panel).toContainText('Taking longer than expected…');
    await expect(panel).toContainText(retryDetail);
    await expect(panel).not.toContainText('0 sec remaining');
    await expect(panel).not.toContainText('100%');
    await noOverflow(page);
    await panel.screenshot({ path: test.info().outputPath('progress-slow-320.png') });
    setView({
      ...saved,
      status: 'failed',
      failure: { code: 'temporary', message: 'The reading couldn’t finish.', retryable: true },
    });
    await expect(page.getByRole('button', { name: 'Retry reading', exact: true })).toBeEnabled();
    await expect(meter).toHaveCount(0);
    await page.getByRole('button', { name: 'Retry reading', exact: true }).click();
    await expect(page.locator('.tarot-reading')).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(requests[0].reuse_saved_astrology).toBe(true);
    expect(requests[0].reading_style).toBe('fun');
    await expect(page.getByRole('heading', { name: 'How it could play out' })).toHaveCount(3);
    await expect(page.getByRole('region', { name: 'Saved astrology reading' })).toBeVisible();
    expect(requests[0]).not.toHaveProperty('astrology');
  });
});

test('a late generating poll cannot replace the successfully saved reading', async ({ page }) => {
  await withReading(page, async ({ roomId, requests, setView }) => {
    let releasePost!: () => void;
    let releaseRead!: () => void;
    const postGate = new Promise<void>((resolve) => {
      releasePost = resolve;
    });
    const readGate = new Promise<void>((resolve) => {
      releaseRead = resolve;
    });
    let posts = 0;
    let heldReads = 0;
    const old: ReadingView = {
      status: 'generating',
      reading: null,
      api_tier: 'paid',
      question: '',
      message: '',
      progress: progress('writing', { estimated_percent: 55 }),
    };
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, async (route) => {
      if (route.request().method() === 'POST') {
        posts++;
        setView(old);
        await postGate;
        return route.fallback();
      }
      if (posts && heldReads === 0) {
        heldReads++;
        await readGate;
        return route.fulfill({ json: old });
      }
      return route.fallback();
    });
    try {
      await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
      await expect.poll(() => heldReads).toBe(1);
      releasePost();
      await expect(page.locator('.tarot-reading')).toBeVisible();
      const rendered = await page.locator('.tarot-reading').innerText();
      const lateReply = page.waitForResponse(
        (response) =>
          response.request().method() === 'GET' &&
          response.url().endsWith(`/rooms/${roomId}/reading`),
      );
      releaseRead();
      await (await lateReply).finished();
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      await expect.poll(() => page.locator('.tarot-reading').innerText()).toBe(rendered);
      await expect(
        page.getByRole('progressbar', { name: 'Estimated reading progress' }),
      ).toHaveCount(0);
      expect(posts).toBe(1);
      expect(requests).toHaveLength(1);
    } finally {
      releasePost();
      releaseRead();
    }
  });
});

test('an unavailable provider and a paused room keep the spread readable without submitting', async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await withReading(page, async ({ roomId, requests, setView }) => {
    const names = await page.locator('.tarot-spread .tarot-name').allTextContents();
    setView({
      status: 'unavailable',
      reading: null,
      api_tier: 'paid',
      question: '',
      message: 'Readings are temporarily unavailable.',
      failure: { code: 'unavailable', message: 'Readings are unavailable.', retryable: false },
    });
    await page.reload();
    const read = page.getByRole('button', { name: 'Read my cards', exact: true });
    await expect(read).toBeDisabled();
    // The table itself states the pause, once, and that nothing was lost.
    await expect(
      page.getByRole('heading', { name: 'Readings are unavailable right now', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.tarot-reading-status[role="status"]')).toHaveText(
      'Your cards are saved. You can ask for your reading once the service is back.',
    );
    await expect(page.locator('.tarot-question .error-note')).toHaveCount(0);
    await page.getByRole('textbox', { name: 'What’s on your mind?' }).fill('A new question');
    await expect(read).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Retry reading', exact: true })).toHaveCount(0);
    await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(names);
    await noOverflow(page);
    await capture(page, 'provider-unavailable-320');

    setView({ status: 'ready', reading: null, api_tier: 'paid', question: '', message: '' });
    await page.route(new RegExp(`/api/backend/v1/rooms/${roomId}(/heartbeat)?$`), async (route) => {
      const response = await route.fetch();
      await route.fulfill({ response, json: { ...(await response.json()), paused: true } });
    });
    await page.reload();
    await expect(read).toBeDisabled();
    await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(names);
    expect(requests).toHaveLength(0);
    await noOverflow(page);
  });
});

for (const chart of [false, true])
  test(`a generating reading survives reload, then retries its saved ${chart ? 'chart' : 'question'}`, async ({
    page,
  }) => {
    await withReading(page, async ({ requests, setView }) => {
      const names = await page.locator('.tarot-spread .tarot-name').allTextContents();
      const question = 'How could a book club welcome beginners?';
      const saved = {
        reading: null,
        api_tier: 'paid' as const,
        question,
        message: '',
        ...(chart ? { astrology_chart: syntheticChart } : {}),
      };
      setView({ ...saved, status: 'generating' });
      for (let reload = 0; reload < 2; reload++) {
        await page.reload();
        await expect(
          page.getByRole('region', { name: 'Reading progress', exact: true }),
        ).toBeVisible();
        await expect(page.locator('.tarot-action-surface')).toHaveAttribute(
          'data-processing',
          'true',
        );
        await expect(
          page.getByRole('button', { name: /Read my cards|Writing your reading/ }),
        ).toHaveCount(0);
        await expect(page.getByRole('textbox', { name: 'What’s on your mind?' })).toHaveValue(
          question,
        );
        await expect(page.getByRole('textbox', { name: 'What’s on your mind?' })).toBeDisabled();
        await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(names);
        await expect(page.getByRole('checkbox', { name: 'Include astrology' })).toBeDisabled();
        expect(requests).toHaveLength(0);
      }
      await capture(page, `generating-${chart ? 'chart' : 'ordinary'}`);
      setView({
        ...saved,
        status: 'failed',
        message: 'Synthetic interruption; your spread is saved.',
      });
      await page.reload();
      await expect(page.getByRole('button', { name: 'Retry reading', exact: true })).toBeEnabled();
      await expect(page.getByLabel('Birth date', { exact: true })).toHaveCount(0);
      await page.getByRole('button', { name: 'Retry reading', exact: true }).click();
      await expect(page.locator('.tarot-reading')).toBeVisible();
      expect(requests).toHaveLength(1);
      expect(requests[0].question).toBe(question);
      expect(requests[0]).not.toHaveProperty('astrology');
      if (chart) expect(requests[0].reuse_saved_astrology).toBe(true);
      else expect(requests[0]).not.toHaveProperty('reuse_saved_astrology');
    });
  });

test('an unavailable reading rechecks availability without generating automatically', async ({
  page,
}) => {
  await withReading(page, async ({ roomId, requests, setView }) => {
    let checks = 0;
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, (route) => {
      if (route.request().method() === 'GET') checks++;
      return route.fallback();
    });
    setView({
      status: 'failed',
      reading: null,
      api_tier: 'paid',
      question: 'What needs attention?',
      message: '',
      failure: {
        code: 'unavailable',
        message: 'Readings are unavailable.',
        retryable: false,
        retry_at: Date.now() / 1000 + 4,
      },
    });
    await page.reload();
    const read = page.getByRole('button', { name: 'Read my cards', exact: true });
    await expect(read).toBeDisabled();
    await expect(
      page.getByRole('heading', { name: 'Readings are unavailable right now', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.tarot-reading-status[role="status"]')).toContainText(
      'Your cards are saved.',
    );
    await expect(page.locator('.tarot-question [role="alert"]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Retry reading', exact: true })).toHaveCount(0);
    setView({
      status: 'ready',
      reading: null,
      api_tier: 'paid',
      question: 'What needs attention?',
      message: '',
    });
    await expect(read).toBeEnabled({ timeout: 8000 });
    expect(checks).toBe(2);
    expect(requests).toHaveLength(0);
  });
});

test('a failed request checks saved status before offering a manual retry', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await withReading(page, async ({ roomId, requests }) => {
    let posts = 0;
    let checks = 0;
    let holdCheck = true;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, async (route) => {
      if (route.request().method() === 'POST') {
        posts++;
        if (posts === 1) return route.abort('failed');
      } else if (holdCheck) {
        checks++;
        await gate;
      }
      return route.fallback();
    });
    try {
      const question = 'Which small task deserves attention?';
      await page.getByRole('textbox', { name: 'What’s on your mind?' }).fill(question);
      await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
      await expect.poll(() => checks).toBe(1);
      await expect(
        page.getByRole('region', { name: 'Reading progress', exact: true }),
      ).toContainText('Checking your saved reading.');
      await expect(page.locator('.tarot-action-surface')).toHaveAttribute(
        'data-processing',
        'true',
      );
      await expect(page.getByRole('button', { name: 'Checking status…', exact: true })).toHaveCount(
        0,
      );
      await expect(page.getByRole('button', { name: 'Retry reading', exact: true })).toHaveCount(0);
      await page
        .locator('form.tarot-question')
        .evaluate((form: HTMLFormElement) => form.requestSubmit());
      expect(posts).toBe(1);
      holdCheck = false;
      release();
      const retry = page.getByRole('button', { name: 'Retry reading', exact: true });
      await expect(retry).toBeEnabled();
      await expect(page.locator('.tarot-question [role="alert"]')).toHaveText(
        'The reading couldn’t finish.',
      );
      await expect(page.getByRole('textbox', { name: 'What’s on your mind?' })).toHaveValue(
        question,
      );
      await noOverflow(page);
      await capture(page, 'retry-after-status-check-320');
      await retry.click();
      await expect(page.locator('.tarot-reading')).toBeVisible();
      expect(posts).toBe(2);
      expect(requests).toHaveLength(1);
      expect(requests[0].question).toBe(question);
    } finally {
      holdCheck = false;
      release();
    }
  });
});

for (const code of ['rate_limited', 'daily_limit'] as const)
  test(`${code} persists its cooldown and never submits when the wait ends`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 740 });
    await withReading(page, async ({ requests, setView }) => {
      const names = await page.locator('.tarot-spread .tarot-name').allTextContents();
      const retryAt = Date.now() / 1000 + 10;
      setView({
        status: 'failed',
        reading: null,
        api_tier: 'paid',
        question: 'Which commitment needs attention?',
        message: '',
        astrology_chart: syntheticChart,
        failure: { code, message: 'Reading limit reached.', retryable: true, retry_at: retryAt },
      });
      await page.reload();
      const retry = page.getByRole('button', { name: 'Retry reading', exact: true });
      await expect(retry).toBeDisabled();
      await expect(page.locator('.tarot-question [role="alert"]')).toHaveCount(1);
      const revised = 'Which commitment needs a smaller first step?';
      await page.getByRole('textbox', { name: 'What’s on your mind?' }).fill(revised);
      await page
        .locator('form.tarot-question')
        .evaluate((form: HTMLFormElement) => form.requestSubmit());
      expect(requests).toHaveLength(0);
      await page.reload();
      await expect(retry).toBeDisabled();
      await expect(page.getByRole('textbox', { name: 'What’s on your mind?' })).toHaveValue(
        revised,
      );
      await expect(page.locator('.tarot-spread .tarot-name')).toHaveText(names);
      await expect(page.getByLabel('Birth date', { exact: true })).toHaveCount(0);
      await expect(
        page.getByRole('checkbox', { name: 'Include astrology', exact: true }),
      ).toBeChecked();
      await noOverflow(page);
      await capture(page, `${code}-cooldown-320`);
      await expect(retry).toBeEnabled({ timeout: 15000 });
      expect(requests).toHaveLength(0);
      await retry.click();
      await expect(page.locator('.tarot-reading')).toBeVisible();
      expect(requests).toHaveLength(1);
      expect(requests[0].question).toBe(revised);
      expect(requests[0].reuse_saved_astrology).toBe(true);
    });
  });

test('a blocked reading allows a new request only after a meaningful question edit', async ({
  page,
}) => {
  await withReading(page, async ({ requests, setView }) => {
    const original = 'Should I make an immediate decision?';
    setView({
      status: 'failed',
      reading: null,
      api_tier: 'paid',
      question: original,
      message: '',
      failure: { code: 'blocked', message: 'Try a different question.', retryable: false },
    });
    await page.reload();
    const read = page.getByRole('button', { name: 'Read my cards', exact: true });
    const question = page.getByRole('textbox', { name: 'What’s on your mind?' });
    await expect(read).toBeDisabled();
    await expect(page.getByRole('button', { name: 'Retry reading', exact: true })).toHaveCount(0);
    await question.fill(` ${original} `);
    await expect(read).toBeDisabled();
    const revised = 'What should I consider before making a decision?';
    await question.fill(revised);
    await expect(read).toBeEnabled();
    await expect(page.locator('.tarot-question [role="alert"]')).toHaveCount(0);
    expect(requests).toHaveLength(0);
    await read.click();
    await expect(page.locator('.tarot-reading')).toBeVisible();
    expect(requests).toHaveLength(1);
    expect(requests[0].question).toBe(revised);
  });
});

test('a lost generation response recovers the saved reading without a second submission', async ({
  page,
}) => {
  await withReading(page, async ({ roomId, setView }) => {
    const room = await roomAs(page, roomId);
    const cards = tarotReadingExample.cards.map((card, index) => ({
      ...card,
      card_id: room.game!.community[index].id,
      title: room.game!.community[index].label,
    }));
    let submissions = 0;
    // Synthetic lost response: POST never reaches the provider. A subsequent
    // GET returns the already-saved result, as production recovery is designed to do.
    await page.route(`**/api/backend/v1/rooms/${roomId}/reading`, async (route) => {
      if (route.request().method() !== 'POST') return route.fallback();
      submissions++;
      const body = route.request().postDataJSON() as ReadingRequest;
      setView({
        status: 'complete',
        api_tier: 'paid',
        question: body.question,
        message: '',
        reading: { ...tarotReadingExample, cards },
      });
      await route.fulfill({ status: 503, json: { detail: 'Synthetic response lost after save.' } });
    });
    await page
      .getByRole('textbox', { name: 'What’s on your mind?' })
      .fill('How could a club share its tasks?');
    await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
    await expect(page.locator('.tarot-reading')).toBeVisible();
    const rendered = await page.locator('.tarot-reading').innerText();
    expect(submissions).toBe(1);
    await page.reload();
    await expect.poll(() => page.locator('.tarot-reading').innerText()).toBe(rendered);
    expect(submissions).toBe(1);
    await noOverflow(page);
    await capture(page, 'recovered-lost-response');
  });
});

test('both calculated charts are inspectable, saved and hideable without regeneration', async ({
  page,
}) => {
  await withReading(page, async ({ requests, chartInputs }) => {
    await page.getByRole('checkbox', { name: 'Include astrology' }).check();
    await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
    await expect(page.locator('.astrology-option').getByRole('alert')).toContainText(
      'Complete your birth date',
    );
    expect(chartInputs).toHaveLength(0);
    await details(page);
    await page.getByLabel('Birth date', { exact: true }).fill('1900-01-01');
    await expect(page.getByRole('note')).toContainText('Historical local-time records before 1970');
    await page.getByLabel('Birth date', { exact: true }).fill('2000-01-01');
    await expect(page.getByRole('note')).toHaveCount(0);
    await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
    const charts = page.getByRole('region', { name: 'Calculated birth charts', exact: true });
    await expect(charts).toBeVisible();
    await expect(charts.locator('.astrology-wheel image')).toHaveCount(12);
    await expect(
      charts.locator('.astrology-wheel').getByRole('img', { name: 'Capricorn' }),
    ).toHaveAttribute('href', '/art/zodiac/capricorn.webp');
    await charts
      .getByRole('combobox', { name: 'Inspect chart' })
      .first()
      .selectOption('planet:moon');
    await expect(charts.locator('.astrology-inspection').filter({ visible: true })).toContainText(
      'Moon',
    );
    await charts.getByRole('checkbox', { name: 'Show selected planet’s aspects' }).check();
    await capture(page, 'both-western-preview');
    await charts.getByRole('tab', { name: 'Vedic', exact: true }).focus();
    await page.keyboard.press('Enter');
    await expect(charts.locator('.astrology-diamond')).toBeVisible();
    await expect(charts.locator('.astrology-diamond image')).toHaveCount(12);
    const makara = charts.getByRole('button', { name: /^House \d+, Makara \(Capricorn\)/ });
    await makara.click();
    await expect(charts.locator('.astrology-inspection:visible img')).toHaveAttribute(
      'src',
      '/art/zodiac/makara.webp',
    );
    await charts.getByRole('combobox', { name: 'Inspect chart' }).last().selectOption('house:1');
    await charts.locator('.astrology-data:visible > summary').first().click();
    await expect(charts.getByRole('table', { name: 'Calculated planet positions' })).toHaveCount(1);
    const sunRow = charts
      .getByRole('table', { name: 'Calculated planet positions' })
      .getByRole('row', { name: /Sun/ });
    await expect(sunRow).toContainText('Dhanu (Sagittarius)');
    await expect(sunRow.locator('img')).toHaveAttribute('src', '/art/zodiac/dhanu.webp');
    await expect(
      charts.getByRole('table', { name: 'Whole-sign houses' }).locator('img'),
    ).toHaveCount(12);
    await expect(
      charts.getByRole('table', { name: 'Whole-sign houses' }).locator('tbody tr'),
    ).toHaveCount(12);
    await noOverflow(page);
    await capture(page, 'both-vedic-preview');
    await page.setViewportSize({ width: 320, height: 740 });
    await noOverflow(page);
    await capture(page, 'both-vedic-320');
    await charts.getByRole('tab', { name: 'Western', exact: true }).click();
    const inspector = charts.getByRole('combobox', { name: 'Inspect chart' }).first();
    for (const point of syntheticChart.charts[0].placements) {
      await inspector.selectOption(point.id === 'sun' ? 'planet:moon' : 'planet:sun');
      const target = charts.locator(`.astro-planet-target[data-point-id="${point.id}"]`);
      const box = (await target.boundingBox())!;
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(inspector).toHaveValue(`planet:${point.id}`);
    }
    await charts.locator('.astro-planet-target[data-point-id="moon"]').focus();
    await page.keyboard.press('Enter');
    await expect(inspector).toHaveValue('planet:moon');
    await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Saved astrology reading' })).toBeVisible();
    expect(chartInputs[0]).toMatchObject({
      system: 'both',
      birth_date: '2000-01-01',
      birth_time: '12:00',
      place_id: syntheticPlace.id,
    });
    expect(requests[0].astrology).toEqual(chartInputs[0]);
    await expect(page.getByLabel('Western reading placements')).toContainText('Sun in Capricorn');
    await expect(page.locator('.tarot-reading > article')).toHaveCount(3);
    await page.getByRole('button', { name: 'Hide charts', exact: true }).click();
    await expect(charts).not.toBeVisible();
    await page.getByRole('button', { name: 'Show charts', exact: true }).click();
    expect(requests).toHaveLength(1);
    await page.reload();
    await expect(page.getByRole('region', { name: 'Saved astrology reading' })).toBeVisible();
    expect(requests).toHaveLength(1);
    await capture(page, 'saved-reading');
  });
});

test('changed inputs reject stale places and chart previews; opting out omits birth data', async ({
  page,
}) => {
  await withReading(page, async ({ requests, setChart, setPlaces }) => {
    await details(page);
    let finish!: (preview: AstrologyPreview) => void;
    setChart(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Calculating your chart…' })).toBeVisible();
    await page.getByLabel('Birth time', { exact: true }).fill('12:01');
    finish({ status: 'ready', chart: syntheticChart });
    await expect(page.getByRole('region', { name: 'Calculated birth charts' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeDisabled();
    let finishPlaces!: (value: unknown) => void;
    setPlaces(
      () =>
        new Promise((resolve) => {
          finishPlaces = resolve;
        }),
    );
    await page.getByRole('button', { name: 'Search places', exact: true }).click();
    await expect.poll(() => !!finishPlaces).toBe(true);
    await page.getByRole('searchbox', { name: 'Birthplace', exact: true }).fill('Another town');
    finishPlaces({ places: [syntheticPlace], attribution: 'Stale synthetic results.' });
    await expect(page.getByRole('combobox', { name: 'Choose birthplace' })).toHaveCount(0);
    setPlaces(async () => ({ places: [], attribution: 'Synthetic place fixture.' }));
    await page.getByRole('searchbox', { name: 'Birthplace', exact: true }).fill('Missing town');
    await expect(page.getByRole('combobox', { name: 'Choose birthplace' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Search places', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'No places found' })).toBeVisible();
    setPlaces(async () => {
      throw new Error('Synthetic offline response');
    });
    await page.getByRole('button', { name: 'Search places', exact: true }).click();
    await expect(page.locator('.astrology-option').getByRole('alert')).toContainText(
      'Places could not be loaded',
    );
    await page.getByRole('checkbox', { name: 'Include astrology' }).uncheck();
    await expect(page.getByLabel('Birth date', { exact: true })).toHaveCount(0);
    await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
    await expect(page.locator('.tarot-reading')).toBeVisible();
    expect(requests[0]).not.toHaveProperty('astrology');
    expect(requests[0]).not.toHaveProperty('reuse_saved_astrology');
    await noOverflow(page);
  });
});

test('historical preview shows resolved offset seconds and clears them when details change', async ({
  page,
}) => {
  await withReading(page, async ({ setChart, setPlaces }) => {
    setPlaces(async () => ({
      places: [
        {
          ...syntheticPlace,
          label: 'Kolkata · synthetic historical fixture',
          timezone: 'Asia/Kolkata',
        },
      ],
      attribution: 'Synthetic historical presentation fixture.',
    }));
    setChart(async () => ({
      status: 'ready',
      chart: syntheticChart,
      time_resolution: { timezone: 'Asia/Kolkata', utc_offset: '+05:21:10' },
    }));
    await page.getByRole('checkbox', { name: 'Include astrology' }).check();
    await details(page);
    await page.getByLabel('Birth date', { exact: true }).fill('1900-01-01');
    await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
    const resolution = page.getByRole('status', { name: 'Calculated time zone', exact: true });
    await expect(resolution).toHaveText('Calculated using Asia/Kolkata · UTC+05:21:10');
    await expect(page.getByRole('note')).toContainText('Check the calculated UTC offset');
    await noOverflow(page);
    await page.getByLabel('Birth time', { exact: true }).fill('12:01');
    await expect(resolution).toHaveCount(0);
    await expect(page.getByRole('region', { name: 'Calculated birth charts' })).toHaveCount(0);
  });
});

test('ambiguous local time requires an explicit occurrence and nonexistent times remain blocked', async ({
  page,
}) => {
  await withReading(page, async ({ chartInputs, setChart, setPlaces }) => {
    setPlaces(async () => ({
      places: [
        {
          ...syntheticPlace,
          id: 'geo:2',
          label: 'New York · synthetic DST fixture',
          timezone: 'America/New_York',
        },
      ],
      attribution: 'Synthetic DST calculation fixture.',
    }));
    await page.getByRole('checkbox', { name: 'Include astrology' }).check();
    await page.getByLabel('Birth date', { exact: true }).fill('2024-11-03');
    await page.getByLabel('Birth time', { exact: true }).fill('01:30');
    await page.getByRole('searchbox', { name: 'Birthplace' }).fill('New York');
    await page.getByRole('button', { name: 'Search places', exact: true }).click();
    await page.getByRole('combobox', { name: 'Choose birthplace' }).selectOption('geo:2');
    setChart(async (input) =>
      input.fold == null
        ? {
            status: 'needs_time_choice',
            issue: {
              code: 'ambiguous_local_time',
              message: 'This time happened twice. Choose an occurrence.',
              choices: [
                { fold: 0, label: 'First occurrence (UTC-04:00)', utc_offset: '-04:00' },
                { fold: 1, label: 'Second occurrence (UTC-05:00)', utc_offset: '-05:00' },
              ],
            },
          }
        : { status: 'ready', chart: dstChart as typeof syntheticChart },
    );
    await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeDisabled();
    await page.setViewportSize({ width: 320, height: 740 });
    await noOverflow(page);
    await capture(page, 'ambiguous-time-320');
    await page.getByRole('button', { name: 'Second occurrence (UTC-05:00)' }).click();
    await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
    await expect(page.getByRole('region', { name: 'Calculated birth charts' })).toBeVisible();
    expect(chartInputs.at(-1)?.fold).toBe(1);
    setChart(async () => ({
      status: 'invalid_time',
      issue: {
        code: 'nonexistent_local_time',
        message: 'This local time did not occur. Check the birth time.',
      },
    }));
    await page.getByLabel('Birth date', { exact: true }).fill('2024-03-10');
    await page.getByLabel('Birth time', { exact: true }).fill('02:30');
    await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
    await expect(
      page.getByRole('status').filter({ hasText: 'This local time did not occur' }),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: 'Calculated birth charts' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeDisabled();
    await noOverflow(page);
    await capture(page, 'invalid-time');
  });
});

for (const off of [false, true])
  test(`failed readings recover a computed chart without birth fields${off ? ' and can opt out' : ''}`, async ({
    page,
  }) => {
    await withReading(page, async ({ requests, setView }) => {
      setView({
        status: 'failed',
        reading: null,
        api_tier: 'paid',
        question: 'How can I make time for drawing?',
        message: 'Synthetic provider failure; your chart is saved.',
        astrology_chart: syntheticChart,
      });
      await page.reload();
      await expect(
        page.getByText('Your saved chart is ready. Birth details do not need to be entered again.'),
      ).toBeVisible();
      await expect(page.getByLabel('Birth date', { exact: true })).toHaveCount(0);
      await expect(page.getByRole('checkbox', { name: 'Include astrology' })).toBeChecked();
      await expect(page.getByRole('textbox', { name: 'What’s on your mind?' })).toHaveValue(
        'How can I make time for drawing?',
      );
      await capture(page, 'recovered-chart');
      if (off) await page.getByRole('checkbox', { name: 'Include astrology' }).uncheck();
      await page.getByRole('button', { name: 'Retry reading', exact: true }).click();
      await expect(page.locator('.tarot-reading')).toBeVisible();
      expect(requests[0].question).toBe('How can I make time for drawing?');
      expect(requests[0]).not.toHaveProperty('astrology');
      if (off) expect(requests[0]).not.toHaveProperty('reuse_saved_astrology');
      else expect(requests[0].reuse_saved_astrology).toBe(true);
      await expect(page.getByRole('region', { name: 'Saved astrology reading' })).toHaveCount(
        off ? 0 : 1,
      );
    });
  });

for (const draft of [undefined, '', 'A deliberate revised question'])
  test(`ordinary failed question recovers and respects draft ${JSON.stringify(draft)}`, async ({
    page,
  }) => {
    await withReading(page, async ({ requests, setView }) => {
      setView({
        status: 'failed',
        reading: null,
        api_tier: 'paid',
        question: 'How can I make time for drawing?',
        message: 'Synthetic failure.',
      });
      await page.reload();
      const question = page.getByRole('textbox', { name: 'What’s on your mind?' });
      await expect(question).toHaveValue('How can I make time for drawing?');
      await expect(page.getByRole('switch', { name: 'Fun mode', exact: true })).not.toBeChecked();
      if (draft !== undefined) {
        await question.fill(draft);
        // A background refresh must not clobber an explicit edit, including empty.
        await page.evaluate(() => window.dispatchEvent(new Event('focus')));
        await expect(question).toHaveValue(draft);
      }
      await page.getByRole('button', { name: 'Retry reading', exact: true }).click();
      await expect(page.locator('.tarot-reading')).toBeVisible();
      expect(requests[0].question).toBe(draft ?? 'How can I make time for drawing?');
      expect(requests[0].reading_style).toBe('classic');
      expect(requests[0]).not.toHaveProperty('astrology');
    });
  });

// Opt in explicitly: uses the public location service and the real local calculator,
// while reading generation stays intercepted and never calls an AI provider.
if (process.env.GAMES_ASTROLOGY_LIVE === '1')
  test('real authorized place search and server chart reach the Tarot preview', async ({
    page,
  }) => {
    await withReading(page, async () => {
      await page.unroute('**/api/backend/v1/rooms/*/astrology/places');
      await page.unroute('**/api/backend/v1/rooms/*/astrology/chart');
      await page.getByRole('checkbox', { name: 'Include astrology' }).check();
      await page.getByLabel('Birth date', { exact: true }).fill('2000-01-01');
      await page.getByLabel('Birth time', { exact: true }).fill('12:00');
      await page.getByRole('searchbox', { name: 'Birthplace', exact: true }).fill('Mumbai');
      const lookup = page.waitForResponse(
        (response) =>
          response.url().endsWith('/astrology/places') && response.request().method() === 'POST',
      );
      await page.getByRole('button', { name: 'Search places', exact: true }).click();
      expect((await lookup).status()).toBe(200);
      const choices = page.getByRole('combobox', { name: 'Choose birthplace' });
      await expect(choices).toBeVisible();
      const first = await choices.locator('option').nth(1).getAttribute('value');
      expect(first).toMatch(/^geo:\d+$/);
      await choices.selectOption(first!);
      await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
      const charts = page.getByRole('region', { name: 'Calculated birth charts' });
      await expect(charts).toBeVisible();
      await expect(charts.getByRole('tab', { name: 'Western', exact: true })).toBeVisible();
      await charts.getByRole('tab', { name: 'Vedic', exact: true }).click();
      await expect(charts.locator('.astrology-diamond')).toBeVisible();
      await expect(charts).toContainText('Astronomy Engine');
      await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeEnabled();
      await noOverflow(page);
      await capture(page, 'real-calculator-preview');
    });
  });
