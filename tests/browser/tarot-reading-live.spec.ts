import { expect, test, type BrowserContext, type Page, type Response } from '@playwright/test';
import { createHash } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import type { components } from '../../packages/api-client/src/generated/schema';
import type { TarotCharacter } from '../../packages/api-client/src/tarot-characters';
import registry from '../../packages/api-client/src/generated/tarot-characters.json' with { type: 'json' };
import { drawTarotCard, attachPreviewAccess, requestAs, roomAs } from './helpers';

type ReadingView = components['schemas']['ReadingView'];
type SavedReading = components['schemas']['SavedReadingView'];
type OwnedRoom = { page: Page; roomId?: string; closed?: boolean };
type OwnedRun = { rooms: OwnedRoom[]; contexts: BrowserContext[] };
const liveMode = process.env.GAMES_TEST_TAROT_MODE || 'all';
const liveStyle = process.env.GAMES_TEST_TAROT_STYLE || 'classic';
if (!['classic', 'fun'].includes(liveStyle))
  throw new Error('GAMES_TEST_TAROT_STYLE must be classic or fun.');
if (!['all', 'ordinary', 'both'].includes(liveMode))
  throw new Error('GAMES_TEST_TAROT_MODE must be all, ordinary, or both.');
const includesMode = (mode: string) => liveMode === 'all' || liveMode === mode;
const cleanup = new WeakMap<Page, OwnedRun>();
const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const normalized = (value: string) =>
  value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '');
function referenceArtwork(name: string, source: string) {
  return (registry as readonly TarotCharacter[]).find(
    (entry) =>
      [entry.name, ...entry.aliases].some((value) => normalized(value) === normalized(name)) &&
      [entry.source, ...entry.sourceAliases].some(
        (value) => normalized(value) === normalized(source),
      ),
  );
}

test.skip(
  !process.env.GAMES_TEST_URL || process.env.GAMES_TEST_AI !== '1',
  'Explicit hosted AI acceptance only; one submission per selected mode, up to three provider attempts each.',
);
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

async function closeRoom(owned: OwnedRoom) {
  if (!owned.roomId || owned.closed) return;
  const response = await requestAs(owned.page, `rooms/${owned.roomId}`);
  if (response.status() !== 404) {
    expect(response.status()).toBe(200);
    if ((await response.json()).status === 'playing')
      expect((await requestAs(owned.page, `rooms/${owned.roomId}/abandon`, 'POST')).status()).toBe(
        200,
      );
    expect((await requestAs(owned.page, `rooms/${owned.roomId}/leave`, 'POST')).status()).toBe(200);
    expect((await requestAs(owned.page, `rooms/${owned.roomId}`)).status()).toBe(404);
  }
  owned.closed = true;
}

// A timed-out generation must leave a fresh cleanup budget and live guest contexts.
test.afterEach(async ({ page }) => {
  test.setTimeout(45000);
  const owned = cleanup.get(page);
  if (!owned) return;
  // API requests use the context timeout, not page.setDefaultTimeout.
  for (const room of owned.rooms) room.page.context().setDefaultTimeout(5000);
  try {
    const results = await Promise.allSettled(owned.rooms.map(closeRoom));
    const failure = results.find((result) => result.status === 'rejected');
    if (failure?.status === 'rejected') throw failure.reason;
  } finally {
    try {
      await writeFile(
        test.info().outputPath('cleanup-private.json'),
        JSON.stringify(
          {
            checkedAt: new Date().toISOString(),
            rooms: owned.rooms
              .filter(({ roomId }) => !!roomId)
              .map(({ roomId, closed }) => ({ roomId, closed: !!closed })),
          },
          null,
          2,
        ),
        { flag: 'wx', mode: 0o600 },
      );
    } finally {
      await Promise.all(owned.contexts.map((context) => context.close()));
      cleanup.delete(page);
    }
  }
});

async function pickSpread(page: Page) {
  for (let number = 1; number <= 3; number++) {
    await expect(page.getByRole('heading', { name: `Choose card ${number} of 3` })).toBeVisible();
    await drawTarotCard(page);
  }
  await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeEnabled();
}

async function savedReading(page: Page, matchId: string): Promise<SavedReading> {
  const response = await requestAs(page, `readings/${matchId}`);
  expect(response.status()).toBe(200);
  return response.json();
}

/** Observe the UI's own polling; never spend another generation request on QA. */
async function observeGeneration(page: Page, mode: string, generate: () => Promise<void>) {
  const received: Array<{ receivedAt: string; progress: ReadingView['progress'] }> = [];
  const pending = new Set<Promise<void>>();
  const onResponse = (response: Response) => {
    if (
      response.request().method() !== 'GET' ||
      !/\/rooms\/[^/]+\/reading$/.test(new URL(response.url()).pathname)
    )
      return;
    const capture = (async () => {
      const view: ReadingView = await response.json();
      if (view.status === 'generating' && view.progress)
        received.push({ receivedAt: new Date().toISOString(), progress: view.progress });
    })().catch(() => {
      // A cancelled poll is expected when the completed POST wins the race.
    });
    pending.add(capture);
    void capture.finally(() => pending.delete(capture));
  };
  page.on('response', onResponse);
  let running = true;
  const rendered: Array<{
    observedAt: string;
    text: string;
    percent: number | null;
    min: string | null;
    max: string | null;
    viewportWidth: number;
    scrollWidth: number;
  }> = [];
  const observing = (async () => {
    let previous = '';
    while (running) {
      const frame = await page
        .evaluate(() => {
          const panel = document.querySelector<HTMLElement>('.tarot-generation-progress');
          const meter = panel?.querySelector('[role="progressbar"]');
          if (!panel || !meter || !panel.getBoundingClientRect().height) return null;
          const value = meter.getAttribute('aria-valuenow');
          return {
            observedAt: new Date().toISOString(),
            text: panel.innerText,
            percent: value === null ? null : Number(value),
            min: meter.getAttribute('aria-valuemin'),
            max: meter.getAttribute('aria-valuemax'),
            viewportWidth: innerWidth,
            scrollWidth: document.documentElement.scrollWidth,
          };
        })
        .catch(() => null);
      if (frame && frame.text !== previous) {
        rendered.push(frame);
        previous = frame.text;
      }
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  })();
  try {
    await generate();
  } finally {
    running = false;
    page.off('response', onResponse);
    await observing;
    await Promise.all(pending);
    await writeFile(
      test.info().outputPath(`${mode}-progress-private.json`),
      JSON.stringify({ mode, received, rendered, additionalApiCalls: 0 }, null, 2),
      { flag: 'wx', mode: 0o600 },
    );
  }
  expect(rendered.length, 'The loading state is visible during generation').toBeGreaterThan(0);
  for (const frame of rendered) {
    expect(frame.min).toBe('0');
    expect(frame.max).toBe('100');
    expect(frame.scrollWidth).toBeLessThanOrEqual(frame.viewportWidth);
    if (frame.percent !== null) {
      expect(frame.percent).toBeGreaterThan(0);
      expect(frame.percent).toBeLessThan(100);
      expect(frame.text).toContain('% estimated');
      expect(frame.text).toMatch(/About \d+ (?:sec|min) remaining|Taking longer than expected/);
    }
  }
  if (received.length)
    expect(
      rendered.some((frame) => frame.percent !== null),
      'Saved backend progress reaches the visible loader',
    ).toBe(true);
}

async function bothChart(page: Page) {
  await page.getByRole('checkbox', { name: 'Include astrology', exact: true }).check();
  await page.getByRole('button', { name: 'Both', exact: true }).click();
  // Public J2000 date/time with London city coordinates, not a person's birth
  // details or an observatory-coordinate claim. Greenwich's first six results
  // currently contain only US cities, so it is not a stable UK search fixture.
  await page.getByLabel('Birth date', { exact: true }).fill('2000-01-01');
  await page.getByLabel('Birth time', { exact: true }).fill('12:00');
  await page.getByRole('searchbox', { name: 'Birthplace', exact: true }).fill('London');
  const searched = page.waitForResponse(
    (response) =>
      response.url().endsWith('/astrology/places') && response.request().method() === 'POST',
  );
  await page.getByRole('button', { name: 'Search places', exact: true }).click();
  const response = await searched;
  const payload = await response.json().catch(() => null);
  await expect(page.getByRole('button', { name: 'Search places', exact: true })).toBeEnabled();
  const places = page.getByRole('combobox', { name: 'Choose birthplace', exact: true });
  const options = await places.locator('option').evaluateAll((nodes) =>
    nodes.map((node) => ({
      value: (node as HTMLOptionElement).value,
      label: node.textContent || '',
    })),
  );
  const option = options.find(
    (item) => item.value === 'geo:2643743' && /London.*United Kingdom/.test(item.label),
  );
  if (!option)
    await writeFile(
      test.info().outputPath('both-location-options-private.json'),
      JSON.stringify(
        {
          checkedAt: new Date().toISOString(),
          query: 'London',
          expectedPlaceId: 'geo:2643743',
          status: response.status(),
          renderedOptions: options,
          places: Array.isArray(payload?.places) ? payload.places : [],
        },
        null,
        2,
      ),
      { flag: 'wx', mode: 0o600 },
    );
  expect(response.status()).toBe(200);
  expect(
    option,
    'Live location search must return London, UK (geo:2643743); see saved option diagnostics',
  ).toBeTruthy();
  await places.selectOption(option!.value);
  await page.getByRole('button', { name: 'Preview chart', exact: true }).click();
  const charts = page.getByRole('region', { name: 'Calculated birth charts', exact: true });
  await expect(charts).toBeVisible();
  await charts.getByRole('tab', { name: 'Vedic', exact: true }).click();
  await expect(charts.locator('.astrology-diamond')).toBeVisible();
  await charts.getByRole('tab', { name: 'Western', exact: true }).click();
}

async function inspectReading(
  page: Page,
  reading: NonNullable<ReadingView['reading']>,
  mode: string,
) {
  const references = reading.cards.flatMap((card) => card.characters || []);
  expect(references.length).toBeGreaterThanOrEqual(3);
  expect(references.length).toBeLessThanOrEqual(6);
  const rows = page.locator('.tarot-character-connections li');
  await expect(rows).toHaveCount(references.length);
  for (const [index, reference] of references.entries()) {
    const artwork = referenceArtwork(reference.name, reference.source);
    expect(artwork, 'Every selected reference resolves by both name and source').toBeTruthy();
    const row = rows.nth(index);
    await expect(row.locator('.tarot-character-name')).toContainText(reference.name);
    await expect(row.locator('.tarot-character-name span')).toHaveText(reference.source);
    if (liveStyle === 'fun') {
      const scene = reference.evidence?.trim() || '';
      expect(scene.length).toBeGreaterThan(0);
      const move = reference.connection.startsWith(scene)
        ? reference.connection.slice(scene.length).trim()
        : reference.connection;
      expect(move.length).toBeGreaterThan(0);
      await expect(row.getByText(scene, { exact: true })).toBeVisible();
      await expect(row.getByText(move, { exact: true })).toBeVisible();
    }
    const image = row.locator('.tarot-character-portrait img');
    await expect(image).toHaveAttribute('src', artwork!.image);
    await expect(image).toHaveAttribute('alt', artwork!.alt!);
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((node) => {
          const photo = node as HTMLImageElement;
          return photo.complete && photo.naturalWidth > 0 && photo.naturalHeight > 0;
        }),
      )
      .toBe(true);
  }
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.locator('.tarot-reading > article')).toHaveCount(3);
    const measure = () =>
      page.evaluate(() => ({
        viewportWidth: innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        overflowingElements: [...document.querySelectorAll('body *')].flatMap((element) => {
          const bounds = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return bounds.width &&
            style.visibility !== 'hidden' &&
            (bounds.right > innerWidth + 0.5 || bounds.left < -0.5)
            ? [
                {
                  tag: element.tagName,
                  className: element.getAttribute('class'),
                  left: bounds.left,
                  right: bounds.right,
                  width: bounds.width,
                  scrollWidth: element.scrollWidth,
                  clientWidth: element.clientWidth,
                  whiteSpace: style.whiteSpace,
                },
              ]
            : [];
        }),
      }));
    const geometry = await measure();
    await writeFile(
      test.info().outputPath(`${mode}-geometry-${width}-private.json`),
      JSON.stringify(geometry, null, 2),
      { flag: 'wx', mode: 0o600 },
    );
    // Save the rendered result before asserting geometry, so a layout failure
    // retains both the successful reading and the actual overflowing surface.
    await page.locator('.tarot-reading').screenshot({
      path: test.info().outputPath(`${mode}-reading-${width}.png`),
    });
    if (geometry.scrollWidth > width) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.screenshot({ path: test.info().outputPath(`${mode}-overflow-${width}.png`) });
    }
    let fits = false;
    try {
      // Viewport-relative chart sizing can settle after the resize command.
      // Allow that render to settle without accepting persistent overflow.
      await expect
        .poll(() => page.evaluate(() => document.documentElement.scrollWidth), {
          timeout: 5000,
        })
        .toBeLessThanOrEqual(width);
      fits = true;
    } finally {
      await writeFile(
        test.info().outputPath(`${mode}-settled-geometry-${width}-private.json`),
        JSON.stringify({ fits, ...(await measure()) }, null, 2),
        { flag: 'wx', mode: 0o600 },
      );
      if (!fits) {
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.screenshot({
          path: test.info().outputPath(`${mode}-persistent-overflow-${width}.png`),
        });
      }
    }
  }
  return references.map((reference) => {
    const artwork = referenceArtwork(reference.name, reference.source)!;
    return {
      id: artwork.id,
      name: artwork.name,
      source: artwork.source,
      kind: artwork.kind || 'character',
    };
  });
}

test('selected independent live readings retain exact private archives after new spreads and closure', async ({
  page,
  browser,
  baseURL,
}) => {
  test.skip(test.info().project.name !== 'desktop', 'Two identities cover all three widths once.');
  test.setTimeout(300000);
  page.setDefaultTimeout(15000);
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 900 },
    reducedMotion: 'reduce',
  });
  const second = await context.newPage();
  second.setDefaultTimeout(15000);
  const owned: OwnedRun = { rooms: [{ page }, { page: second }], contexts: [context] };
  cleanup.set(page, owned);
  const submissions = new Map<Page, number>([
    [page, 0],
    [second, 0],
  ]);
  for (const [index, room] of owned.rooms.entries()) {
    const mode = index === 0 ? 'ordinary' : 'both';
    await attachPreviewAccess(room.page);
    room.page.on('request', (request) => {
      if (
        request.method() === 'POST' &&
        /\/rooms\/[^/]+\/reading$/.test(new URL(request.url()).pathname)
      )
        submissions.set(room.page, submissions.get(room.page)! + 1);
    });
    if (!includesMode(mode)) {
      await room.page.goto('/profile');
      await expect(
        room.page.getByRole('heading', { name: 'Your profile', exact: true }),
      ).toBeVisible();
      await expect.poll(async () => (await requestAs(room.page, 'me')).status()).toBe(200);
      await room.page
        .getByRole('textbox', { name: 'Your name', exact: true })
        .fill('Tarot live outsider QA');
      await room.page.getByRole('button', { name: 'Save profile', exact: true }).click();
      await expect(
        room.page.getByText('Looking good. Your profile is saved.', { exact: true }),
      ).toBeVisible();
      continue;
    }
    await room.page.setViewportSize({ width: 390, height: 844 });
    await room.page.goto('/games/tarot');
    const creation = room.page
      .waitForResponse(
        (response) =>
          new URL(response.url()).pathname === '/api/backend/v1/games/tarot/play' &&
          response.request().method() === 'POST',
      )
      .then(async (response) => {
        if (response.ok()) {
          const created = await response.json();
          room.roomId = created.id;
          await writeFile(
            test.info().outputPath(`${mode}-created-room-private.json`),
            JSON.stringify(
              {
                mode,
                createdAt: new Date().toISOString(),
                roomId: created.id,
                matchId: created.match_id,
                ownerId: created.owner_id,
              },
              null,
              2,
            ),
            { flag: 'wx', mode: 0o600 },
          );
        }
        return response;
      });
    await room.page.getByRole('button', { name: 'Start reading', exact: true }).click();
    const created = await creation;
    expect(created.status()).toBe(200);
    expect(room.roomId).toBeTruthy();
    await expect(room.page).toHaveURL(new RegExp(`/games/tarot/play/${room.roomId}$`));
    await pickSpread(room.page);
  }
  expect((await (await requestAs(page, 'me')).json()).profile.id).not.toBe(
    (await (await requestAs(second, 'me')).json()).profile.id,
  );
  for (const [index, room] of owned.rooms.entries()) {
    const actor = room.page,
      outsider = owned.rooms[1 - index].page;
    const mode = index === 0 ? 'ordinary' : 'both';
    if (!includesMode(mode)) continue;
    const question =
      index === 0 ? '' : 'How could a community group make room for shared creative practice?';
    await test.step(`${mode}: generate once, refresh, inspect, archive and close`, async () => {
      const before = await roomAs(actor, room.roomId!);
      const matchId = before.match_id!;
      await writeFile(
        test.info().outputPath(`${mode}-spread-private.json`),
        JSON.stringify(
          {
            mode,
            preparedAt: new Date().toISOString(),
            roomId: room.roomId,
            matchId,
            ownerId: before.owner_id,
          },
          null,
          2,
        ),
        { flag: 'wx', mode: 0o600 },
      );
      if (index === 1) {
        await actor.getByRole('textbox', { name: 'What’s on your mind?' }).fill(question);
        await bothChart(actor);
      }
      const choices = actor.getByRole('group', { name: 'Choose a reading style' });
      await expect(choices.getByRole('button', { name: 'Classic', exact: true })).toHaveAttribute(
        'aria-pressed',
        'true',
      );
      if (liveStyle === 'fun') {
        const fun = choices.getByRole('button', { name: 'Fun', exact: true });
        await fun.click();
        await expect(fun).toHaveAttribute('aria-pressed', 'true');
      }
      expect((await requestAs(outsider, `rooms/${room.roomId}/reading`)).status()).toBe(404);
      expect((await requestAs(outsider, `readings/${matchId}`)).status()).toBe(404);
      await actor.setViewportSize({ width: 390, height: 844 });
      await observeGeneration(actor, mode, async () => {
        await actor.getByRole('button', { name: 'Read my cards', exact: true }).click();
        await expect(actor.locator('.tarot-reading')).toBeVisible({ timeout: 125000 });
      });
      const response = await requestAs(actor, `rooms/${room.roomId}/reading`);
      expect(response.status()).toBe(200);
      const current: ReadingView = await response.json();
      expect(current.status).toBe('complete');
      expect(current.reading_style).toBe(liveStyle);
      if (liveStyle === 'fun')
        await expect(actor.getByRole('heading', { name: 'How it could play out' })).toHaveCount(3);
      if (process.env.GAMES_TEST_TAROT_PROVIDERS)
        expect(current.provider_names).toEqual(process.env.GAMES_TEST_TAROT_PROVIDERS.split(','));
      expect(current.question).toBe(question);
      expect(current.reading!.cards.map((card) => card.card_id)).toEqual(
        before.game!.community.map((card) => card.id),
      );
      expect(Boolean(current.reading!.astrology)).toBe(index === 1);
      if (current.reading!.astrology)
        expect(current.reading!.astrology.chart.charts.map((chart) => chart.system)).toEqual([
          'western',
          'vedic',
        ]);
      await writeFile(
        test.info().outputPath(`${mode}-generated-reading-private.json`),
        JSON.stringify(
          {
            mode,
            receivedAt: new Date().toISOString(),
            roomId: room.roomId,
            matchId,
            readingView: current,
            readingSha256: digest(current.reading),
            generationSubmissions: submissions.get(actor),
          },
          null,
          2,
        ),
        { flag: 'wx', mode: 0o600 },
      );
      const selectedReferences = await inspectReading(actor, current.reading!, mode);
      const visible = digest(await actor.locator('.tarot-reading').innerText());
      const readingHash = digest(current.reading);
      const sameText = () =>
        expect
          .poll(async () => digest(await actor.locator('.tarot-reading').innerText()))
          .toBe(visible);
      await actor.reload();
      await sameText();
      expect(
        digest((await (await requestAs(actor, `rooms/${room.roomId}/reading`)).json()).reading),
      ).toBe(readingHash);
      expect(submissions.get(actor)).toBe(1);
      await actor.getByRole('button', { name: 'Draw a new spread', exact: true }).first().click();
      await expect(actor.getByRole('heading', { name: 'Choose card 1 of 3' })).toBeVisible();
      const next = await roomAs(actor, room.roomId!);
      expect(next.match_id).not.toBe(matchId);
      await pickSpread(actor);
      await expect(actor.getByRole('textbox', { name: 'What’s on your mind?' })).toHaveValue('');
      await expect(
        actor.getByRole('checkbox', { name: 'Include astrology', exact: true }),
      ).not.toBeChecked();
      const nextSaved: ReadingView = await (
        await requestAs(actor, `rooms/${room.roomId}/reading`)
      ).json();
      expect(nextSaved.reading).toBeNull();
      const archived = await savedReading(actor, matchId);
      expect(digest(archived.reading)).toBe(readingHash);
      expect(archived.reading_style).toBe(liveStyle);
      expect(archived.question).toBe(question);
      expect(archived.can_resume).toBe(false);
      await actor.goto(`/readings/${matchId}`);
      await sameText();
      await expect(actor.getByRole('link', { name: 'Return to spread', exact: true })).toHaveCount(
        0,
      );
      await closeRoom(room);
      await actor.reload();
      await sameText();
      expect(digest((await savedReading(actor, matchId)).reading)).toBe(readingHash);
      expect((await requestAs(outsider, `readings/${matchId}`)).status()).toBe(404);
      await outsider.goto(`/readings/${matchId}`);
      await expect(
        outsider.getByRole('heading', { name: 'This reading isn’t available.', exact: true }),
      ).toBeVisible();
      await expect(outsider.locator('.tarot-reading')).toHaveCount(0);
      if (index === 0 && owned.rooms[1].roomId)
        await outsider.goto(`/rooms/${owned.rooms[1].roomId}`);
      await actor.goto('/profile');
      await actor.locator(`a.history-row[href="/games/tarot/readings/${matchId}"]`).click();
      await sameText();
      expect(submissions.get(actor)).toBe(1);
      await writeFile(
        test.info().outputPath(`${mode}-reading-private.json`),
        JSON.stringify(
          {
            mode,
            question,
            reading: current.reading,
            selectedReferences,
            readingSha256: readingHash,
            generationSubmissions: submissions.get(actor),
            disclosedProviders: current.provider_names,
            archivedAfterRematchAndClosure: true,
          },
          null,
          2,
        ),
        { flag: 'wx', mode: 0o600 },
      );
    });
  }
  for (const [index, room] of owned.rooms.entries())
    expect(submissions.get(room.page)).toBe(
      includesMode(index === 0 ? 'ordinary' : 'both') ? 1 : 0,
    );
});
