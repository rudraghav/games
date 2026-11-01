import { expect, test } from '@playwright/test';
import { attachPreviewAccess, requestAs, roomAs } from './helpers';

test.skip(!process.env.GAMES_TEST_URL, 'Requires the exact hosted Games preview.');
test.use({ trace: 'off', screenshot: 'off' });

test('cloud Broadcast reaches members and rejects a nonmember', async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(120000);
  const friendContext = await browser.newContext({
    baseURL,
    viewport: { width: 390, height: 844 },
  });
  const outsiderContext = await browser.newContext({ baseURL });
  const friend = await friendContext.newPage();
  const outsider = await outsiderContext.newPage();
  let received = 0;
  let denied = 0;
  for (const player of [page, friend, outsider]) await attachPreviewAccess(player);
  friend.on('websocket', (socket) =>
    socket.on('framereceived', ({ payload }) => {
      try {
        // Current Supabase clients receive broadcasts in serializer v2 binary
        // envelopes. Inspect only the event label; never log/decode private data.
        if (Buffer.isBuffer(payload) && payload[0] === 4) {
          const start = 5 + payload[1];
          if (payload.subarray(start, start + payload[2]).toString('utf8') === 'state_changed')
            received++;
          return;
        }
        const frame = JSON.parse(String(payload));
        const event = Array.isArray(frame) ? frame[3] : frame.event;
        const data = Array.isArray(frame) ? frame[4] : frame.payload;
        if (event === 'broadcast' && data?.event === 'state_changed') received++;
      } catch {
        /* Ignore non-JSON transport frames. */
      }
    }),
  );
  outsider.on('websocket', (socket) =>
    socket.on('framereceived', ({ payload }) => {
      try {
        const frame = JSON.parse(String(payload));
        const event = Array.isArray(frame) ? frame[3] : frame.event;
        const data = Array.isArray(frame) ? frame[4] : frame.payload;
        if (event === 'phx_reply' && data?.status === 'error') denied++;
      } catch {
        /* Ignore non-JSON transport frames. */
      }
    }),
  );
  let id: string | undefined;
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Uno room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Broadcast Test Host');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/, { timeout: 45000 });
    id = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    await friend.goto('/');
    await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
    await friend
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill('Broadcast Test Friend');
    await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
    await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect(friend).toHaveURL(page.url(), { timeout: 45000 });
    await expect(friend.getByTitle('Live updates connected')).toBeAttached();
    await friend.getByRole('button', { name: 'Open chat', exact: true }).click();
    const before = received;
    const response = await requestAs(page, `rooms/${id}/chat`, 'POST', {
      body: 'A live hello from the other browser.',
      kind: 'message',
    });
    expect(response.status()).toBe(200);
    await expect.poll(() => received).toBeGreaterThan(before);
    await expect(
      friend
        .getByRole('region', { name: 'Room chat', exact: true })
        .filter({ visible: true })
        .getByText('A live hello from the other browser.', { exact: true }),
    ).toBeVisible();
    await outsider.goto(page.url());
    await expect.poll(() => denied).toBeGreaterThan(0);
    expect((await requestAs(outsider, `rooms/${id}`)).status()).toBe(404);
    console.log(
      'Private Broadcast delivered to a member; nonmember subscription and room read rejected.',
    );
  } finally {
    if (id) {
      await roomAs(page, id);
      await requestAs(friend, `rooms/${id}/leave`, 'POST');
      await requestAs(page, `rooms/${id}/leave`, 'POST');
    }
    await friendContext.close();
    await outsiderContext.close();
  }
});
