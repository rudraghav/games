import { createHash } from 'node:crypto';
import { expect, test, type Page, type Route } from '@playwright/test';
import type { components } from '../../packages/api-client/src/generated/schema';
import { requestAs } from './helpers';

type Saved = components['schemas']['SavedReadingView'];
type Style = NonNullable<Saved['reading_style']>;
const digest = (input: unknown) => createHash('sha256').update(JSON.stringify(input)).digest('hex');

function commonReading(saved: Saved) {
  const reading = saved.reading!;
  return digest([
    saved.match_id,
    saved.room_id,
    saved.created_at,
    saved.question,
    saved.cards,
    saved.can_resume,
    reading.title,
    reading.introduction,
    reading.next_step,
    reading.astrology,
    reading.cards.map(({ card_id, title, position, interpretation }) => [
      card_id,
      title,
      position,
      interpretation,
    ]),
  ]);
}

/** Exercise the actual completed-room or archive component with its owner's saved reading. */
export async function checkBothReadingViews(
  page: Page,
  matchId: string,
  originalStyle: Style,
  simulateFailure = false,
) {
  const archive = `readings/${matchId}`;
  const initial = await requestAs(page, archive);
  expect(initial.status()).toBe(200);
  const original: Saved = await initial.json();
  expect(original.status).toBe('complete');
  expect(original.reading_style).toBe(originalStyle);
  const alternate = originalStyle === 'fun' ? 'classic' : 'fun';
  const viewUrl = (url: URL) =>
    url.pathname === `/api/backend/v1/${archive}` && url.searchParams.get('style') === alternate;
  const toggle = page.getByRole('switch', { name: 'Fun mode', exact: true });
  const content = page.locator('.tarot-reading');
  await expect(content.locator(':scope > article')).toHaveCount(3);
  await expect(toggle).toBeChecked({ checked: originalStyle === 'fun' });
  const originalText = digest(await content.innerText());
  const originalHeaders = digest(
    await content.locator('.tarot-reading-card-heading').allInnerTexts(),
  );
  const chart = page.getByRole('region', { name: 'Saved astrology reading' });
  const originalChart = digest(await chart.allInnerTexts());

  const gameplay = /\/api\/backend\/v1\/rooms\/[^/]+\/(?:actions?|reading|start|ready)(?:[?#]|$)/;
  let attemptedWrites = 0;
  const guard = async (route: Route) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(route.request().method())) {
      attemptedWrites++;
      await route.abort();
    } else await route.fallback();
  };
  await page.route(gameplay, guard);
  try {
    if (simulateFailure) {
      // Leave an alternate request in flight, reverse the switch, and then
      // deliver its error. A late result must not hide or change the original.
      let held: Route | undefined;
      const intercept = (route: Route) => {
        held = route;
      };
      await page.route(viewUrl, intercept);
      try {
        await toggle.click();
        await expect.poll(() => Boolean(held)).toBe(true);
        await toggle.click();
        await expect.poll(async () => digest(await content.innerText())).toBe(originalText);
      } finally {
        await page.unroute(viewUrl, intercept);
        await held?.fulfill({ status: 503, json: { detail: 'Synthetic late response.' } });
      }
      await page.route(viewUrl, (route) =>
        route.fulfill({ status: 503, json: { detail: 'Synthetic view interruption.' } }),
      );
      await toggle.click();
      await expect(page.getByRole('button', { name: 'Retry view' })).toBeVisible();
      await expect(page.getByRole('alert').filter({ hasText: 'Couldn’t open the' })).toBeVisible();
      await expect(toggle).toBeEnabled();
      await page.unroute(viewUrl);
    }
    const response = page.waitForResponse(
      (res) => res.request().method() === 'GET' && viewUrl(new URL(res.url())) && res.ok(),
    );
    if (simulateFailure) await page.getByRole('button', { name: 'Retry view' }).click();
    else await toggle.click();
    const received = await response;
    expect(received.headers()['cache-control']).toContain('no-store');
    const variant: Saved = await received.json();
    expect(variant.reading_style).toBe(alternate);
    expect(variant.original_reading_style).toBe(originalStyle);
    expect(commonReading(variant)).toBe(commonReading(original));
    await expect(toggle).toBeChecked({ checked: alternate === 'fun' });
    if (alternate === 'fun') {
      await expect(content.getByRole('heading', { name: 'How it could play out' })).toHaveCount(3);
      expect(variant.reading!.cards.every((card) => card.characters?.length === 1)).toBe(true);
      await expect(content.locator('.tarot-character-portrait img')).toHaveCount(3);
    } else {
      await expect(content.getByRole('heading', { name: 'Card meaning' })).toHaveCount(3);
      await expect(content.locator('.tarot-character-portrait img')).toHaveCount(0);
      expect(
        variant.reading!.cards.every((card) => !card.characters?.length && !card.pop_culture),
      ).toBe(true);
    }
    expect(digest(await content.locator('.tarot-reading-card-heading').allInnerTexts())).toBe(
      originalHeaders,
    );
    expect(digest(await chart.allInnerTexts())).toBe(originalChart);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    if (page.viewportSize()?.width === 320) {
      const info = page.getByRole('button', { name: 'About Fun mode', exact: true });
      const help = page
        .getByRole('tooltip')
        .filter({ hasText: 'Fun for pop culture, Classic for reflection.' });
      await expect(help).toBeVisible();
      const target = await info.boundingBox();
      expect(target!.width).toBeGreaterThanOrEqual(44);
      expect(target!.height).toBeGreaterThanOrEqual(44);
      const lines = await help.evaluate((element) => {
        const range = document.createRange();
        range.selectNodeContents(element);
        return Array.from(range.getClientRects())
          .filter((line) => line.width > 0)
          .map((line) => ({
            y: Math.round(line.top),
            inside: line.left >= 0 && line.right <= innerWidth,
          }));
      });
      expect(new Set(lines.map((line) => line.y)).size).toBe(1);
      expect(lines.every((line) => line.inside)).toBe(true);
    }
    const surface = new URL(page.url()).pathname.includes('/play/') ? 'room' : 'archive';
    await toggle.evaluate((element) =>
      element.scrollIntoView({ block: 'start', behavior: 'instant' }),
    );
    await page.screenshot({
      animations: 'disabled',
      path: test
        .info()
        .outputPath(`${surface}-alternate-${alternate}-${page.viewportSize()?.width}.png`),
    });
    await toggle.click();
    await expect(toggle).toBeChecked({ checked: originalStyle === 'fun' });
    await expect.poll(async () => digest(await content.innerText())).toBe(originalText);
    // Repeated quick selections must settle on the last selection.
    await toggle.click();
    await toggle.click();
    await expect.poll(async () => digest(await content.innerText())).toBe(originalText);
    if (simulateFailure) {
      await toggle.click();
      await expect(toggle).toBeChecked({ checked: alternate === 'fun' });
      await page.reload();
      await expect(toggle).toBeChecked({ checked: originalStyle === 'fun' });
      await expect.poll(async () => digest(await content.innerText())).toBe(originalText);
    }
    const fresh = await requestAs(page, archive);
    expect(fresh.status()).toBe(200);
    expect(digest(await fresh.json())).toBe(digest(original));
    expect(attemptedWrites).toBe(0);
  } finally {
    await page.unroute(gameplay, guard);
    if (simulateFailure) await page.unroute(viewUrl);
  }
}
