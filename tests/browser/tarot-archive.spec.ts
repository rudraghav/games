import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve } from 'node:path';
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { tarotReadingExample } from '../../apps/web/src/stories/fixtures/tarot-reading';
import { syntheticAstrologyReading } from '../../apps/web/src/stories/fixtures/astrology';
import type { TarotCharacter } from '../../packages/api-client/src/tarot-characters';
import registry from '../../packages/api-client/src/generated/tarot-characters.json' with { type: 'json' };
import { drawTarotCard, openGameSetup, openRoomOptions, requestAs, roomAs } from './helpers';

test.use({ trace: 'off', screenshot: 'off' });
test.skip(!!process.env.GAMES_TEST_URL, 'Archive fixture writes are local development only.');

// Canonical identities from the reviewed expanded export. Long labels,
// person/character variants and newly framed assets share the real renderer.
const references = [
  'george-curzon-1st-marquess-curzon-of-kedleston-q271878',
  'ezio-auditore-da-firenze-q994344',
  'nataraja-q23641297',
  'meme-this-is-fine-gunshow-2013',
  'banksy-q133600',
  'alara-of-nubia-q533610',
].map((id) => {
  const reference = (registry as readonly TarotCharacter[]).find(
    (candidate) => candidate.id === id,
  );
  if (!reference) throw new Error(`Missing canonical archive QA reference: ${id}`);
  return reference;
});

const backgroundEvidence = [
  'Synthetic background fixture for layout verification.',
  'This paragraph tests the saved catalogue-context field without making a biographical claim about the displayed reference.',
  'Its six hundred characters must remain readable below the connection, including its punctuation, a longer phrase, and an exact closing sentence.',
  'Opening Background should reveal the complete stored text; closing it should leave the interpretation unchanged.',
  'Refreshing the archive or starting a new spread must not replace these words or request a new analysis.',
  'This is constructed browser evidence, not a generated reading.',
].join(' ');

async function inspectBackground(page: Page) {
  expect(backgroundEvidence).toHaveLength(600);
  const details = page.locator('.tarot-character-evidence');
  await expect(details).toHaveCount(1);
  const row = page.locator('.tarot-character-connections li').filter({ has: details });
  const connection = row.locator('.tarot-character-copy > p');
  const originalConnection = await connection.textContent();
  const summary = details.locator('summary');
  await expect(summary).toHaveAccessibleName(`Background for ${references[0].name}`);
  await summary.scrollIntoViewIfNeeded();
  expect((await summary.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  await expect(details).not.toHaveAttribute('open');
  await expect(details.locator('p')).toBeHidden();
  await summary.focus();
  await summary.press('Enter');
  await expect(details).toHaveAttribute('open');
  await expect(details.locator('p')).toBeVisible();
  expect(await details.locator('p').textContent()).toBe(backgroundEvidence);
  expect(
    await details.evaluate((element) => {
      const box = element.getBoundingClientRect();
      const prose = element.querySelector('p')!;
      return (
        element.scrollWidth <= element.clientWidth &&
        prose.scrollHeight <= prose.clientHeight &&
        box.left >= 0 &&
        box.right <= innerWidth
      );
    }),
  ).toBe(true);
  await row.screenshot({
    path: test.info().outputPath(`background-${page.viewportSize()!.width}.png`),
  });
  if (test.info().project.use.hasTouch) await summary.tap();
  else await summary.click();
  await expect(details).not.toHaveAttribute('open');
  await expect(details.locator('p')).toBeHidden();
  expect(await connection.textContent()).toBe(originalConnection);
}

async function inspectReferences(page: Page) {
  await expect(page.locator('.tarot-character-portrait img')).toHaveCount(6);
  for (const reference of references) {
    const image = page.getByRole('img', { name: reference.alt!, exact: true });
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute('src', reference.image);
    expect(
      await image.evaluate(async (element: HTMLImageElement) => {
        await element.decode();
        return element.naturalWidth > 0 && element.naturalHeight > 0;
      }),
    ).toBe(true);
    const row = page.locator('.tarot-character-connections li').filter({ has: image });
    await expect(row.locator('.tarot-character-name')).toContainText(reference.name);
    await expect(row.locator('.tarot-character-name > span')).toHaveText(reference.source);
    if (reference.imageType === 'artwork')
      await expect(row.locator('figcaption')).toHaveText('Artwork reference');
    if (reference.origin === 'generated')
      await expect(row.locator('figcaption')).toHaveText('Original illustration');
    if (reference.kind === 'meme' || reference.imageType === 'artwork') {
      const picture = await image.boundingBox();
      const copy = await row.locator('.tarot-character-copy').boundingBox();
      expect(picture!.width).toBeGreaterThanOrEqual(160);
      if (page.viewportSize()!.width <= 600)
        expect(copy!.y).toBeGreaterThanOrEqual(picture!.y + picture!.height);
      else expect(copy!.x).toBeGreaterThanOrEqual(picture!.x + picture!.width);
      await row.screenshot({
        path: test.info().outputPath(`${reference.imageType}-${page.viewportSize()!.width}.png`),
      });
    }
    expect(
      await row.locator('.tarot-character-copy').evaluate((element) => {
        const box = element.getBoundingClientRect();
        return (
          element.scrollWidth <= element.clientWidth && box.left >= 0 && box.right <= innerWidth
        );
      }),
    ).toBe(true);
  }
  await inspectBackground(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

const cleanup = new WeakMap<Page, { roomId?: string; outsider: BrowserContext }>();
test.afterEach(async ({ page }) => {
  test.setTimeout(45000);
  const owned = cleanup.get(page);
  if (!owned) return;
  try {
    if (owned.roomId) {
      const current = await requestAs(page, `rooms/${owned.roomId}`);
      if (current.ok())
        expect((await requestAs(page, `rooms/${owned.roomId}/leave`, 'POST')).status()).toBe(200);
      expect((await requestAs(page, `rooms/${owned.roomId}`)).status()).toBe(404);
    }
  } finally {
    await owned.outsider.close();
    cleanup.delete(page);
  }
});

for (const astrology of [false, true]) {
  test(`private ${astrology ? 'Both astrology' : 'ordinary'} archive survives refresh, rematch and room closure`, async ({
    page,
    browser,
    baseURL,
  }) => {
    const outsider = await browser.newContext({ baseURL });
    const owned: { roomId?: string; outsider: BrowserContext } = { outsider };
    cleanup.set(page, owned);
    const other = await outsider.newPage();
    const roomName = `Archive QA ${randomUUID()}`;
    const question = `Synthetic archive question ${astrology ? 'with chart' : 'without chart'}`;
    let generationRequests = 0;
    await page.route('**/api/backend/v1/rooms/*/reading', async (route) => {
      if (route.request().method() !== 'POST') return route.continue();
      generationRequests++;
      await route.fulfill({
        status: 500,
        json: { detail: 'Archive tests never generate readings.' },
      });
    });
    await page.goto('/');
    await openGameSetup(page, 'tarot');
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Archive QA');
    await openRoomOptions(page);
    await page.getByRole('textbox', { name: 'Room name', exact: true }).fill(roomName);
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
    const roomId = owned.roomId!;
    await expect(page).toHaveURL(/\/games\/tarot\/play\/[\da-f-]+$/);
    for (let card = 1; card <= 3; card++) {
      await expect(page.getByRole('heading', { name: `Choose card ${card} of 3` })).toBeVisible();
      await drawTarotCard(page);
    }
    await expect(page.getByRole('button', { name: 'Read my cards', exact: true })).toBeEnabled();
    const room = await roomAs(page, roomId);
    expect(new Set(references.map((reference) => reference.imageType)).size).toBe(6);
    const reading = {
      ...tarotReadingExample,
      title: `Saved ${astrology ? 'Both astrology' : 'ordinary'} archive fixture`,
      cards: tarotReadingExample.cards.map((card, index) => ({
        ...card,
        card_id: room.game!.community[index].id,
        title: room.game!.community[index].label,
        characters: references.slice(index * 2, index * 2 + 2).map((reference) => ({
          name: reference.name,
          source: reference.source,
          ...(reference.id === references[0].id ? { evidence: backgroundEvidence } : {}),
          connection:
            'Synthetic layout example: this reference checks the portrait, long identity label, and explanatory paragraph in a saved reading.',
        })),
      })),
      ...(astrology ? { astrology: syntheticAstrologyReading } : {}),
    };
    execFileSync(
      resolve('backend/.venv/bin/python'),
      [resolve('tests/browser/seed-tarot-archive.py')],
      {
        cwd: resolve('.'),
        input: JSON.stringify({
          room_id: room.id,
          match_id: room.match_id,
          actor_id: room.owner_id,
          room_name: roomName,
          question,
          reading,
        }),
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );
    await page.goto('/profile');
    const history = page.locator(`a.history-row[href="/games/tarot/readings/${room.match_id}"]`);
    await expect(history).toBeVisible();
    await history.click();
    await expect(page.getByRole('heading', { name: reading.title, exact: true })).toBeVisible();
    await expect(page.getByText(`Your question: ${question}`, { exact: true })).toBeVisible();
    await expect(page.locator('.tarot-reading > article')).toHaveCount(3);
    await inspectReferences(page);
    await expect(page.getByRole('link', { name: 'Return to spread', exact: true })).toBeVisible();
    const original = await page.locator('.tarot-reading').innerText();
    await expect(page).toHaveURL(new RegExp(`/games/tarot/readings/${room.match_id}$`));
    await page.goto(`/readings/${room.match_id}`);
    await expect(page).toHaveURL(new RegExp(`/games/tarot/readings/${room.match_id}$`));
    await expect.poll(() => page.locator('.tarot-reading').innerText()).toBe(original);
    const archivePath = `readings/${room.match_id}`;
    const originalResponse = await requestAs(page, archivePath);
    expect(originalResponse.status()).toBe(200);
    expect(originalResponse.headers()['cache-control']).toContain('no-store');
    const originalSaved = await originalResponse.json();
    expect(originalSaved.reading.cards[0].characters[0].evidence).toBe(backgroundEvidence);
    if (astrology) {
      await expect(page.getByRole('region', { name: 'Saved astrology reading' })).toBeVisible();
      await page.getByRole('button', { name: 'Hide charts', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Show charts', exact: true })).toBeVisible();
      await page.getByRole('button', { name: 'Show charts', exact: true }).click();
    }
    await page.reload();
    await expect.poll(() => page.locator('.tarot-reading').innerText()).toBe(original);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (test.info().project.name === 'phone') {
      const viewport = page.viewportSize()!;
      await page.setViewportSize({ width: 320, height: 740 });
      await inspectReferences(page);
      await page
        .locator('.tarot-reading > article')
        .first()
        .screenshot({
          path: test.info().outputPath('expanded-references-320.png'),
        });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      await expect(page.getByRole('link', { name: 'Back to profile', exact: true })).toBeVisible();
      await expect(page.getByRole('link', { name: 'Return to spread', exact: true })).toBeVisible();
      if (astrology) {
        await page.getByRole('button', { name: 'Hide charts', exact: true }).click();
        await page.getByRole('button', { name: 'Show charts', exact: true }).click();
        await expect(page.getByRole('region', { name: 'Saved astrology reading' })).toBeVisible();
      }
      await page.setViewportSize(viewport);
      await inspectReferences(page);
    }

    // A separately established guest receives neither current nor saved private output.
    await other.goto('/profile');
    await expect(other.getByRole('heading', { name: 'Your profile', exact: true })).toBeVisible();
    await expect.poll(async () => (await requestAs(other, 'me')).status()).toBe(200);
    expect((await requestAs(other, `rooms/${roomId}/reading`)).status()).toBe(404);
    expect((await requestAs(other, archivePath)).status()).toBe(404);
    await other.goto(`/readings/${room.match_id}`);
    await expect(
      other.getByRole('heading', { name: 'This reading isn’t available.' }),
    ).toBeVisible();
    expect(await other.locator('body').innerText()).not.toContain(question);
    await expect(other.locator('.tarot-reading')).toHaveCount(0);

    expect((await requestAs(page, `rooms/${roomId}/ready`, 'PUT', { ready: true })).status()).toBe(
      200,
    );
    const rematch = await requestAs(page, `rooms/${roomId}/start`, 'POST');
    expect(rematch.status()).toBe(200);
    expect((await rematch.json()).match_id).not.toBe(room.match_id);
    const archiveUrl = page.url();
    await page.goto(`/games/tarot/play/${roomId}`);
    for (let card = 1; card <= 3; card++) {
      await expect(page.getByRole('heading', { name: `Choose card ${card} of 3` })).toBeVisible();
      await drawTarotCard(page);
    }
    await expect(page.getByRole('switch', { name: 'Fun mode', exact: true })).toBeChecked();
    expect((await (await requestAs(page, `rooms/${roomId}/reading`)).json()).reading_style).toBe(
      'fun',
    );
    await page.goto(archiveUrl);
    await expect.poll(() => page.locator('.tarot-reading').innerText()).toBe(original);
    await expect(page.getByRole('link', { name: 'Return to spread', exact: true })).toHaveCount(0);
    expect(await (await requestAs(page, archivePath)).json()).toEqual({
      ...originalSaved,
      can_resume: false,
    });

    expect((await requestAs(page, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
    expect((await requestAs(page, `rooms/${roomId}`)).status()).toBe(404);
    await page.goto('/profile');
    await page.locator(`a.history-row[href="/games/tarot/readings/${room.match_id}"]`).click();
    await expect.poll(() => page.locator('.tarot-reading').innerText()).toBe(original);
    await expect(page.getByText(`Your question: ${question}`, { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Return to spread', exact: true })).toHaveCount(0);
    expect(await (await requestAs(page, archivePath)).json()).toEqual({
      ...originalSaved,
      can_resume: false,
    });
    await inspectBackground(page);
    await page.evaluate(() => document.fonts.ready);
    // Walk the reopened archive like a reader, so below-fold lazy images load before capture.
    for (const image of await page.locator('.tarot-reading img:visible').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect
        .poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);
    }
    await page.screenshot({
      path: test.info().outputPath('closed-room-archive.png'),
      fullPage: true,
    });
    expect(generationRequests).toBe(0);
  });
}
