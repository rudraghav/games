import { expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { requestAs } from './helpers';

test.skip(!process.env.GAMES_TEST_URL, 'Explicit hosted artwork verification only.');
test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });

test('the hosted Tarot deck preserves corrected symbols in delivered WebP frames', async ({
  page,
}) => {
  test.skip(test.info().project.name !== 'desktop', 'One identity covers all three widths.');
  let roomId: string | undefined;
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Pop Tarot room', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill('Artwork verification');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    roomId = new URL(page.url()).pathname.split('/').at(-1)!;
    await page.getByRole('button', { name: 'Explore the deck', exact: true }).click();
    await mkdir('output/playwright/audit-fixes-live-art', { recursive: true });
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator('.tarot-deck-gallery > li')).toHaveCount(78);
      for (const [id, name] of [
        ['cups-02', 'Two of Cups'],
        ['cups-06', 'Six of Cups'],
        ['cups-08', 'Eight of Cups'],
        ['pentacles-08', 'Eight of Pentacles'],
        ['pentacles-09', 'Nine of Pentacles'],
      ]) {
        const card = page.getByLabel(name, { exact: true });
        const path = `/tarot/minor-${id}-v2.webp`;
        await card.scrollIntoViewIfNeeded();
        await expect(card.locator('svg')).toHaveAttribute('preserveAspectRatio', 'xMidYMid meet');
        await expect(card.locator('image')).toHaveAttribute('href', path);
        await page.evaluate(async (src) => {
          const image = new Image();
          image.src = src;
          await image.decode();
        }, path);
        if (width === 390)
          await card.screenshot({ path: `output/playwright/audit-fixes-live-art/${id}-390.png` });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  } finally {
    if (roomId) {
      expect((await requestAs(page, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
      expect((await requestAs(page, `rooms/${roomId}`)).status()).toBe(404);
    }
  }
});
