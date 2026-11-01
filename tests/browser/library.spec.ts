import { expect, test } from '@playwright/test';
import catalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };
import { requestAs, roomAs } from './helpers';

test('catalogue ranks fit their poster and browser icons load', async ({ page }) => {
  await page.goto('/');
  const icon = page.locator('head link[rel="icon"][type="image/svg+xml"]');
  await expect(icon).toHaveAttribute('href', /\/icon\.svg(?:\?|$)/);
  const vector = await page.request.get(
    new URL((await icon.getAttribute('href'))!, page.url()).href,
  );
  expect(vector.status()).toBe(200);
  expect(vector.headers()['content-type']).toContain('image/svg+xml');
  const favicon = await page.request.get('/favicon.ico');
  expect(favicon.status()).toBe(200);
  expect(favicon.headers()['content-type']).toMatch(/image\/(?:x-icon|vnd\.microsoft\.icon)/);
  expect((await favicon.body()).length).toBeGreaterThan(22);

  await page.getByRole('searchbox', { name: 'Search games' }).fill('skyjo');
  const poster = page
    .getByRole('button', { name: 'Create Skyjo room', exact: true })
    .locator('.game-poster');
  await expect(poster.locator('.grid-card-value')).toHaveCount(12);
  // Verify what the browser actually draws, independent of CSS pixel constants:
  // every displayed rank must fit inside the poster's clipping rectangle.
  expect(
    await poster.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return [...element.querySelectorAll('.grid-card-value')].every((rank) => {
        const box = rank.getBoundingClientRect();
        return (
          box.left >= bounds.left &&
          box.right <= bounds.right &&
          box.top >= bounds.top &&
          box.bottom <= bounds.bottom
        );
      });
    }),
  ).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test('catalogue search, category and group size work with keyboard and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const tiles = page.getByRole('button', { name: /^Create .+ room$/ });
  await expect(tiles).toHaveCount(catalogue.length);
  await expect(page.getByText(`${catalogue.length} games`, { exact: true })).toBeVisible();
  await expect(
    page
      .getByRole('button', { name: 'Create Monopoly Deal No Mercy room', exact: true })
      .getByText(/Games house deck/),
  ).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search games' }).fill('poker');
  await expect(
    page.getByRole('button', { name: 'Create Texas Hold’em room', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Clear search' }).click();
  await page.getByRole('button', { name: 'Board games', exact: true }).click();
  await expect(
    page.getByRole('button', { name: 'Create Checkers room', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: 'Create Mancala room', exact: true }),
  ).toBeVisible();
  await page.getByLabel('Players', { exact: true }).selectOption('10');
  await expect(page.getByRole('heading', { name: 'No games found' })).toBeVisible();
  await page.getByRole('button', { name: 'Show all games' }).focus();
  await page.keyboard.press('Enter');
  await expect(tiles).toHaveCount(catalogue.length);
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
    .toBe(true);
});

for (const name of ['Checkers', 'Mancala']) {
  test(`${name} uses accessible board decisions in a real two-player room`, async ({
    page,
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: test.info().project.use.baseURL,
      viewport: page.viewportSize()!,
    });
    const friend = await context.newPage();
    let id: string | undefined;
    try {
      await page.goto('/');
      await page.getByRole('button', { name: `Create ${name} room`, exact: true }).click();
      await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Board Host');
      await page.getByRole('button', { name: 'Create room', exact: true }).click();
      await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
      id = new URL(page.url()).pathname.split('/').at(-1)!;
      const code = await page.locator('.room-code').innerText();
      await friend.goto('/');
      await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
      await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Board Friend');
      await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
      await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
      await expect(friend).toHaveURL(page.url());
      for (const player of [page, friend])
        await player.getByRole('button', { name: 'I’m ready', exact: true }).click();
      await expect(page.getByRole('button', { name: 'Start game', exact: true })).toBeEnabled();
      await page.getByRole('button', { name: 'Start game', exact: true }).click();
      await expect(page.getByRole('region', { name: `${name} board`, exact: true })).toBeVisible();
      const initial = await roomAs(page, id);
      const move =
        name === 'Mancala'
          ? initial.game!.actions.find((option) => option.action.choice === '2')!
          : initial.game!.actions[0];
      if (name === 'Checkers') {
        const source = initial.game!.community.find(
          (cell) => cell.id === move.action.choice.split(':')[0],
        )!;
        await page
          .getByRole('button', { name: `Select piece ${source.label}`, exact: true })
          .focus();
        await page.keyboard.press('Enter');
      }
      await page.getByRole('button', { name: move.label, exact: true }).click();
      await expect
        .poll(async () => (await roomAs(page, id!)).match_version)
        .toBe(initial.match_version! + 1);
      const after = await roomAs(page, id);
      if (name === 'Mancala') {
        expect(
          await page
            .locator('.mancala-pit')
            .evaluateAll((pits) =>
              pits
                .filter((pit) => pit.tagName === 'BUTTON')
                .every(
                  (pit) =>
                    pit.getBoundingClientRect().width >= 44 &&
                    pit.getBoundingClientRect().height >= 44,
                ),
            ),
        ).toBe(true);
        expect(after.game!.current_player).toBe(initial.owner_id);
        expect(after.game!.community[6].value).toBe('1');
      } else expect(after.game!.current_player).not.toBe(initial.owner_id);
      await friend.reload();
      await expect(
        friend.getByRole('region', { name: `${name} board`, exact: true }),
      ).toBeVisible();
      await expect
        .poll(() => friend.evaluate(() => document.documentElement.scrollWidth <= innerWidth))
        .toBe(true);
    } finally {
      if (id) {
        await requestAs(page, `rooms/${id}/abandon`, 'POST');
        for (const player of [friend, page]) await requestAs(player, `rooms/${id}/leave`, 'POST');
      }
      await context.close();
    }
  });
}
