import { expect, test, type Page } from '@playwright/test';
import { requestAs, roomAs } from './helpers';

test('paper and cat tables render both limits with decoded artwork and phone-sized controls', async ({
  page,
}) => {
  await page.goto('/design');
  for (const name of ['Sea Salt & Paper', 'boop.']) {
    for (const limit of ['minimum', 'maximum']) {
      await page.getByLabel('Table scenario').selectOption({ label: `${name} · ${limit} seats` });
      await expect(page.locator('.sea-cats-game')).toBeVisible();
      const art = page.locator('.sea-cats-game image');
      expect(await art.count()).toBeGreaterThan(0);
      const sources = await art.evaluateAll((images) => [
        ...new Set(images.map((image) => image.getAttribute('href')!)),
      ]);
      for (const src of sources) {
        expect(
          await page.evaluate(async (url) => {
            const image = new Image();
            image.src = url;
            await image.decode();
            return image.naturalWidth > 0 && image.naturalHeight > 0;
          }, src),
        ).toBe(true);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      expect(
        await page.locator('.sea-cats-game button:enabled').evaluateAll((buttons) =>
          buttons.every((button) => {
            const box = button.getBoundingClientRect();
            return box.width >= 43.5 && box.height >= 43.5;
          }),
        ),
      ).toBe(true);
      if (name === 'Sea Salt & Paper' && (page.viewportSize()?.width || 0) <= 650) {
        expect(
          await page
            .locator('.paper-stock .button')
            .evaluate(
              (button) =>
                Math.abs(
                  button.getBoundingClientRect().width - button.parentElement!.clientWidth,
                ) <= 1,
            ),
        ).toBe(true);
      }
      if (limit === 'maximum')
        await page.locator('.sea-cats-game').screenshot({
          path: test.info().outputPath(name === 'boop.' ? 'boop-maximum.png' : 'paper-maximum.png'),
        });
    }
  }
});

test('paper choices stay private through refresh and boop pieces move with mouse and keyboard', async ({
  page,
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  const friend = await context.newPage();
  let roomId: string | undefined;
  async function checked(actor: Page, path: string, method = 'POST', body?: unknown) {
    const response = await requestAs(actor, path, method, body);
    expect(response.status()).toBeLessThan(300);
    return response.json();
  }
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Sea Salt & Paper room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Paper Host');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    roomId = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    await friend.goto('/');
    await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
    await friend.getByRole('textbox', { name: 'Your name', exact: true }).fill('Paper Friend');
    await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
    await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect(friend).toHaveURL(page.url());
    for (const actor of [page, friend])
      await checked(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true });
    await checked(page, `rooms/${roomId}/start`);
    await Promise.all([page.reload(), friend.reload()]);
    await page.getByRole('button', { name: 'Draw two · keep one', exact: true }).click();
    await expect(
      page.getByRole('heading', { name: 'Which one are you keeping?', exact: true }),
    ).toBeVisible();
    const own = (await roomAs(page, roomId)).game!;
    expect(own.phase).toBe('choosing');
    const choices = own.detail.private_options as { id: string; label: string; subtitle: string }[];
    expect(choices).toHaveLength(2);
    const other = (await roomAs(friend, roomId)).game!;
    expect(other.detail.private_options).toEqual([]);
    for (const choice of choices) expect(JSON.stringify(other)).not.toContain(`"${choice.id}"`);
    await page.reload();
    expect((await roomAs(page, roomId)).game!.detail.private_options).toEqual(choices);
    await page
      .getByRole('button', {
        name: `${choices[0].label}. ${choices[0].subtitle}`,
        exact: true,
      })
      .first()
      .click();
    await page
      .getByRole('button', { name: /Keep selected · discard other to pile/ })
      .first()
      .click();
    await expect.poll(async () => (await roomAs(page, roomId!)).game!.hand.length).toBe(1);
    await page.getByRole('button', { name: 'Finish turn', exact: true }).click();
    await expect(
      friend.getByRole('button', { name: 'Draw two · keep one', exact: true }),
    ).toBeEnabled();
    await page
      .locator('.paper-table')
      .screenshot({ path: test.info().outputPath('paper-private-draw.png') });
    await checked(page, `rooms/${roomId}/abandon`);
    await checked(page, `rooms/${roomId}/settings`, 'PUT', {
      game_id: 'boop',
      capacity: 2,
      settings: {},
    });
    for (const actor of [page, friend])
      await checked(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true });
    await checked(page, `rooms/${roomId}/start`);
    await Promise.all([page.reload(), friend.reload()]);
    const ownId = (await checked(page, 'me', 'GET')).profile.id;
    const first = (await roomAs(page, roomId)).game!.current_player === ownId ? page : friend;
    const second = first === page ? friend : page;
    await first.getByRole('button', { name: 'Place kitten at A1', exact: true }).click();
    await expect
      .poll(async () => (await roomAs(page, roomId!)).game!.community[0].value)
      .toBe('kitten');
    const placement = second.getByRole('button', { name: 'Place kitten at B1', exact: true });
    await expect(placement).toBeEnabled();
    await placement.focus();
    await second.keyboard.press('Enter');
    await expect.poll(async () => (await roomAs(page, roomId!)).game!.detail.moves).toBe(2);
    const bed = (await roomAs(page, roomId)).game!;
    expect(bed.community[0].value).toBe('');
    expect(bed.community[1].value).toBe('kitten');
    expect((bed.detail.last_pushes as { from: number; to: number }[])[0]).toMatchObject({
      from: 0,
      to: -1,
    });
    await page
      .locator('.boop-table')
      .screenshot({ path: test.info().outputPath('boop-live-push.png') });
    for (const actor of [page, friend])
      expect(await actor.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
  } finally {
    if (roomId) {
      const latest = await roomAs(page, roomId);
      if (latest.status === 'playing') await checked(page, `rooms/${roomId}/abandon`);
      await checked(friend, `rooms/${roomId}/leave`);
      await checked(page, `rooms/${roomId}/leave`);
    }
    await context.close();
  }
});
