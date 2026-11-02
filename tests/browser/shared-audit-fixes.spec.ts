import { expect, test } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';
import { requestAs, transportTelemetry } from './helpers';

test.skip(Boolean(process.env.GAMES_TEST_URL), 'Bounded local verification only.');
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

test('all four Uno colours fit the decision dock at narrow, phone, tablet and desktop widths', async ({
  page,
}) => {
  const item = midgameScenarios.find(
    (entry) =>
      entry.game === 'uno-no-mercy' &&
      entry.room.game!.actions!.length === 4 &&
      entry.room.game!.actions!.every((option) => option.action.type === 'choose'),
  )!;
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/design/midgame');
    await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(item.game);
    await page.getByLabel('Mid-game scenario').selectOption(item.id);
    await page.evaluate(() => document.fonts.ready);
    const choices = page.locator('.action-panel .action-choices button');
    await expect(choices).toHaveCount(4);
    expect(
      await choices.evaluateAll((buttons) =>
        buttons.every((node) => {
          const dock = node.closest('.decision-dock')!.getBoundingClientRect();
          const box = node.getBoundingClientRect();
          return (
            box.top >= dock.top &&
            box.bottom <= dock.bottom + 1 &&
            box.left >= dock.left &&
            box.right <= dock.right
          );
        }),
      ),
      `All colours visible without scrolling at ${width}px`,
    ).toBe(true);
  }
});

test('corrected Tarot art keeps its complete frame and all 78 cards', async ({ page }) => {
  await mkdir('output/playwright/audit-fixes-art', { recursive: true });
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/design');
    await page.getByLabel('Table scenario').selectOption({ label: 'Pop Tarot · minimum seats' });
    await page.getByRole('button', { name: 'Explore the deck', exact: true }).click();
    await expect(page.locator('.tarot-deck-gallery > li')).toHaveCount(78);
    for (const [id, name] of [
      ['cups-02', 'Two of Cups'],
      ['cups-06', 'Six of Cups'],
      ['cups-08', 'Eight of Cups'],
      ['pentacles-08', 'Eight of Pentacles'],
      ['pentacles-09', 'Nine of Pentacles'],
    ]) {
      const card = page.getByLabel(name, { exact: true });
      await card.scrollIntoViewIfNeeded();
      await expect(card.locator('svg')).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
      await expect(card.locator('image')).toHaveAttribute('href', `/tarot/minor-${id}-v2.png`);
      await page.evaluate(async (path) => {
        const img = new Image();
        img.src = path;
        await img.decode();
      }, `/tarot/minor-${id}-v2.png`);
      await card.screenshot({ path: `output/playwright/audit-fixes-art/${id}-${width}.png` });
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('bounded concurrent snapshots and heartbeats preserve explicit HTTP diagnostics', async ({
  browser,
  baseURL,
}) => {
  test.skip(
    test.info().project.name !== 'desktop',
    'One bounded workload, not repeated per device.',
  );
  test.setTimeout(120000);
  const contexts = await Promise.all(
    Array.from({ length: 8 }, () => browser.newContext({ baseURL })),
  );
  const pages = await Promise.all(contexts.map((context) => context.newPage()));
  const owned: { page: (typeof pages)[number]; id: string }[] = [];
  const cleanup: number[] = [];
  const before = transportTelemetry();
  let responses = 0;
  try {
    const setup = await Promise.allSettled(
      pages.map(async (page, i) => {
        expect((await page.request.post('/api/dev-session')).status()).toBe(200);
        const created = await requestAs(page, 'rooms', 'POST', {
          name: `Concurrency QA ${i}`,
          game_id: 'flip-7',
          capacity: 3,
          bots: 2,
        });
        const room = await created.json();
        if (created.status() === 201) owned.push({ page, id: room.id });
        expect(created.status()).toBe(201);
        expect(
          (await requestAs(page, `rooms/${room.id}/ready`, 'PUT', { ready: true })).status(),
        ).toBe(200);
        expect((await requestAs(page, `rooms/${room.id}/start`, 'POST')).status()).toBe(200);
      }),
    );
    expect(setup.every((result) => result.status === 'fulfilled')).toBe(true);
    for (let round = 0; round < 12; round++) {
      const batch = await Promise.all(
        owned.flatMap(({ page, id }) => [
          requestAs(page, `rooms/${id}`),
          requestAs(page, `rooms/${id}/heartbeat`, 'POST'),
        ]),
      );
      responses += batch.length;
      expect(batch.map((response) => response.status())).toEqual(Array(16).fill(200));
    }
  } finally {
    for (const { page, id } of owned) {
      cleanup.push((await requestAs(page, `rooms/${id}/abandon`, 'POST')).status());
      cleanup.push((await requestAs(page, `rooms/${id}/leave`, 'POST')).status());
    }
    const after = transportTelemetry();
    await mkdir('output/playwright/audit-fixes-concurrency', { recursive: true });
    await writeFile(
      'output/playwright/audit-fixes-concurrency/aggregate.json',
      JSON.stringify(
        {
          rooms: owned.length,
          concurrentRequests: 16,
          readAndHeartbeatResponses: responses,
          httpFailures: after.httpFailures - before.httpFailures,
          transportFailures: after.failed - before.failed,
          retries: after.retryAttempts - before.retryAttempts,
          httpOperations: after.httpOperations,
          cleanup,
        },
        null,
        2,
      ),
    );
    await Promise.all(contexts.map((context) => context.close()));
  }
  expect(cleanup).toEqual(Array(16).fill(200));
});
