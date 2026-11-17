import { expect, test } from '@playwright/test';
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
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(page.locator('.tarot-deck-gallery > li')).toHaveCount(78);
      for (const [id, name] of [
        ['cups-02', 'Two of Cups'],
        ['cups-06', 'Six of Cups'],
        ['cups-08', 'Eight of Cups'],
        ['wands-06', 'Six of Wands'],
        ['pentacles-04', 'Four of Pentacles'],
        ['pentacles-08', 'Eight of Pentacles'],
        ['pentacles-09', 'Nine of Pentacles'],
      ]) {
        const card = page.getByLabel(name, { exact: true });
        const path = `/tarot/minor-${id}-v2.webp`;
        await card.scrollIntoViewIfNeeded();
        await expect(card.locator('svg')).toHaveAttribute('preserveAspectRatio', 'xMidYMid slice');
        await expect(card.locator('image')).toHaveAttribute('href', path);
        await page.evaluate(async (src) => {
          const image = new Image();
          image.src = src;
          await image.decode();
        }, path);
        const symbolBounds =
          id === 'wands-06'
            ? [82, 430, 947, 1220]
            : id === 'pentacles-04'
              ? [322, 430, 694, 1232]
              : undefined;
        if (symbolBounds) {
          const inside = await card.locator('svg').evaluate((element, bounds) => {
            const svg = element as SVGSVGElement;
            const matrix = svg.getScreenCTM();
            if (!matrix) return false;
            const frame = svg.getBoundingClientRect();
            // Inspected source bounds enclose all six staff tips/four coin discs.
            return [
              [bounds[0], bounds[1]],
              [bounds[2], bounds[3]],
            ].every(([x, y]) => {
              const point = svg.createSVGPoint();
              point.x = x;
              point.y = y;
              const visible = point.matrixTransform(matrix);
              return (
                visible.x > frame.left &&
                visible.x < frame.right &&
                visible.y > frame.top &&
                visible.y < frame.bottom
              );
            });
          }, symbolBounds);
          expect(inside, `${name} keeps its counted symbols at ${width}px`).toBe(true);
        }
        if (width === 390 || symbolBounds)
          await card.screenshot({ path: test.info().outputPath(`${id}-${width}.png`) });
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  } finally {
    if (roomId) {
      const room = await requestAs(page, `rooms/${roomId}`);
      if (room.ok() && (await room.json()).status === 'playing')
        expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
      expect((await requestAs(page, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
      expect((await requestAs(page, `rooms/${roomId}`)).status()).toBe(404);
    }
  }
});
