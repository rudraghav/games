import { expect, test } from '@playwright/test';

// Opt-in mounted motion regression: the recorded sequence uses authorized real
// engine projections, with no room, private credential or arbitrary fake moves.
test.skip(!process.env.GAMES_STORYBOOK_URL, 'Set GAMES_STORYBOOK_URL for casino motion checks.');

test('restoring motion never replays the canceled current payment or card reveal', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto(
    new URL(
      '/iframe.html?id=games-casino-motion--poker&viewMode=story',
      process.env.GAMES_STORYBOOK_URL,
    ).href,
  );
  const next = page.getByRole('button', { name: 'Next move', exact: true });
  // Storybook hydrates after iframe navigation. Its initial load is outside
  // the committed event's lifetime, so establish the mounted baseline first.
  await expect(next).toBeVisible();
  await expect(page.locator('[data-casino-version]')).toHaveAttribute('data-casino-version', '1');
  const paymentStarted = Date.now();
  await next.click();
  await expect(page.locator('[data-flight]')).toHaveCount(3);
  await cancelAndRestore(paymentStarted);
  expect(await page.locator('[data-flight]').count()).toBe(0);

  // A genuinely new version may animate after the preference is restored.
  await next.click(); // fold
  await next.click(); // call
  await expect(page.locator('[data-flight]')).toHaveCount(3);

  await page.getByRole('button', { name: 'Skip five versions', exact: true }).click();
  await expect(page.locator('[data-casino-version]')).toHaveAttribute('data-casino-version', '9');
  const revealStarted = Date.now();
  await next.click(); // flop: three newly permitted community faces
  await expect(page.locator('.community-cards [data-card-enter]')).toHaveCount(3);
  await cancelAndRestore(revealStarted);
  expect(await page.locator('[data-card-enter]').count()).toBe(0);
  expect(await page.locator('[data-flight]').count()).toBe(0);
  await expect(page.locator('[data-casino-version]')).toHaveAttribute('data-casino-version', '10');

  async function cancelAndRestore(started: number) {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await settleFrame();
    expect(await page.locator('[data-flight]').count()).toBe(0);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    // Stay inside the 900ms event window; an eventual zero would miss the replay.
    await settleFrame();
    expect(Date.now() - started, 'Check before the original event can expire').toBeLessThan(850);
  }
  async function settleFrame() {
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
  }
});
