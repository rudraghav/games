import { expect, test, type Page } from '@playwright/test';
import type {
  AstrologyInput,
  AstrologyPreview,
  ReadingView,
} from '../../packages/api-client/src/index';
import {
  syntheticChart,
  syntheticPlace,
  syntheticAstrologyReading,
} from '../../apps/web/src/stories/fixtures/astrology';
import dstChart from '../../apps/web/src/stories/fixtures/astrology-dst-synthetic.json' with { type: 'json' };
import { tarotReadingExample } from '../../apps/web/src/stories/fixtures/tarot-reading';
import { openGameSetup, requestAs, roomAs } from './helpers';

test.use({ trace: 'off', screenshot: 'off' });
test.skip(!!process.env.GAMES_TEST_URL, 'Synthetic provider tests use local development only.');

const cleanup = new WeakMap<Page, { roomId?: string }>();
test.afterEach(async ({ page }) => {
  test.setTimeout(45000);
  const owned = cleanup.get(page);
  if (!owned) return;
  // Bound cleanup API requests inside the independent teardown budget.
  page.context().setDefaultTimeout(5000);
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
    }
  } finally {
    cleanup.delete(page);
  }
});

type ReadingRequest = {
  match_id: string;
  question: string;
  astrology?: AstrologyInput;
  reuse_saved_astrology?: boolean;
};
async function withReading(
  page: Page,
  run: (state: {
    roomId: string;
    requests: ReadingRequest[];
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
  let calculate = async (_input: AstrologyInput): Promise<AstrologyPreview> => ({
    status: 'ready',
    chart: syntheticChart,
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
      }));
      view = {
        status: 'complete',
        api_tier: 'paid',
        question: body.question,
        message: '',
        reading: {
          ...tarotReadingExample,
          cards,
          ...(body.astrology || body.reuse_saved_astrology
            ? { astrology: syntheticAstrologyReading }
            : {}),
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
    await page.goto('/');
    await openGameSetup(page, 'tarot');
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Synthetic chart QA');
    const created = page
      .waitForResponse(
        (response) =>
          response.request().method() === 'POST' &&
          new URL(response.url()).pathname === '/api/backend/v1/rooms',
      )
      .then(async (response) => {
        if (response.ok()) owned.roomId = (await response.json()).id;
      });
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await created;
    roomId = owned.roomId!;
    await expect(page).toHaveURL(/\/games\/tarot\/play\/[\da-f-]+$/);
    for (let card = 1; card <= 3; card++) {
      await expect(page.getByRole('heading', { name: `Choose card ${card} of 3` })).toBeVisible();
      await page
        .getByRole('group', { name: 'Choose from your shuffled 78-card deck' })
        .getByRole('button')
        .first()
        .click();
    }
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeEnabled();
    await run({
      roomId,
      requests,
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
    const storage = await page.evaluate(() => Object.values(localStorage).join(' '));
    expect(storage).not.toContain('2000-01-01');
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

test('ordinary Tarot stays optional and preserves all three reading layers', async ({ page }) => {
  await withReading(page, async ({ requests, setView }) => {
    setView({
      status: 'ready',
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
    await page.getByRole('button', { name: 'Read my cards', exact: true }).click();
    await expect(page.locator('.tarot-reading > article')).toHaveCount(3);
    await expect(page.locator('.tarot-character-connections')).toHaveCount(3);
    await expect(page.locator('.tarot-quirky-read')).toHaveCount(3);
    expect(requests).toHaveLength(1);
    expect(requests[0]).not.toHaveProperty('astrology');
    expect(requests[0]).not.toHaveProperty('reuse_saved_astrology');
    await expect(page.getByRole('region', { name: 'Saved astrology reading' })).toHaveCount(0);
    await noOverflow(page);
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
    await expect(
      page.getByRole('status').filter({ hasText: 'Readings are unavailable.' }),
    ).toHaveText('Readings are unavailable.');
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
        await expect(page.getByRole('button', { name: /Writing your reading/ })).toBeDisabled();
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
    await expect(page.locator('.tarot-question [role="alert"]')).toHaveText(
      'Readings are unavailable.',
    );
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
        page.getByRole('button', { name: 'Checking status…', exact: true }),
      ).toBeDisabled();
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
    await charts.getByRole('combobox', { name: 'Inspect chart' }).last().selectOption('house:1');
    await charts.locator('.astrology-data:visible > summary').first().click();
    await expect(charts.getByRole('table', { name: 'Calculated planet positions' })).toHaveCount(1);
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
      if (draft !== undefined) {
        await question.fill(draft);
        // A background refresh must not clobber an explicit edit, including empty.
        await page.evaluate(() => window.dispatchEvent(new Event('focus')));
        await expect(question).toHaveValue(draft);
      }
      await page.getByRole('button', { name: 'Retry reading', exact: true }).click();
      await expect(page.locator('.tarot-reading')).toBeVisible();
      expect(requests[0].question).toBe(draft ?? 'How can I make time for drawing?');
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
