import { expect, test, type Page } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import { attachPreviewAccess, requestAs, roomAs } from './helpers';

async function openActivity(page: Page) {
  const direct = page.getByRole('button', { name: 'Open game activity', exact: true });
  if (await direct.count()) await direct.click();
  else {
    await page.getByRole('button', { name: 'Room options', exact: true }).click();
    await page.getByRole('button', { name: 'Game activity', exact: true }).click();
  }
  return page.getByRole('region', { name: 'Game activity', exact: true }).filter({ visible: true });
}
test('public moves persist once across retries and refresh, with cards visible to both members', async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(120000);
  const otherContext = await browser.newContext({ baseURL, viewport: page.viewportSize()! });
  const other = await otherContext.newPage();
  await attachPreviewAccess(page);
  await attachPreviewAccess(other);
  let id: string | undefined;
  let joined = false;
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Monopoly Deal room', exact: true }).click();
    await page.getByRole('textbox', { name: 'Your name', exact: true }).fill('Activity Host');
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('2');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    id = new URL(page.url()).pathname.split('/').at(-1)!;
    const code = await page.locator('.room-code').innerText();
    await other.goto('/');
    await other.getByRole('button', { name: 'Join a room', exact: true }).click();
    await other.getByRole('textbox', { name: 'Your name', exact: true }).fill('Activity Friend');
    await other.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
    await other.getByRole('button', { name: 'Join the room', exact: true }).click();
    await expect(other).toHaveURL(page.url());
    joined = true;
    await page.getByRole('button', { name: 'I’m ready', exact: true }).click();
    await other.getByRole('button', { name: 'I’m ready', exact: true }).click();
    await page.getByRole('button', { name: 'Start game', exact: true }).click();
    await expect(page.getByRole('group', { name: 'Your hand', exact: true })).toBeVisible();
    const before = await roomAs(page, id);
    const option = before.game!.actions.find((item) =>
      ['property', 'bank'].includes(item.action.type),
    )!;
    const face = before.game!.hand.find((card) => card.id === option.action.card)!;
    const payload = {
      match_id: before.match_id,
      action_id: randomUUID(),
      expected_version: before.match_version,
      action: option.action,
    };
    const response = await requestAs(page, `rooms/${id}/actions`, 'POST', payload);
    expect(response.status()).toBe(200);
    expect((await response.json()).activity).toHaveLength(1);
    const retry = await requestAs(page, `rooms/${id}/actions`, 'POST', payload);
    expect(retry.status()).toBe(200);
    expect((await retry.json()).activity).toHaveLength(1);
    const stale = await requestAs(page, `rooms/${id}/actions`, 'POST', {
      ...payload,
      action_id: randomUUID(),
    });
    expect(stale.status()).toBe(409);
    for (const member of [page, other]) {
      await member.reload();
      const activity = await openActivity(member);
      await expect(
        activity.getByRole('list', { name: 'Committed moves' }).getByRole('listitem'),
      ).toHaveCount(1);
      await expect(activity.locator('.activity-card-names')).toHaveText(face.label);
      await activity.getByText('View card', { exact: true }).click();
      await expect(
        activity.getByRole('img', {
          name: new RegExp(face.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
        }),
      ).toBeVisible();
    }
  } finally {
    if (id) {
      const snapshot = await roomAs(page, id);
      if (snapshot.status === 'playing') await requestAs(page, `rooms/${id}/abandon`, 'POST');
      if (joined) await requestAs(other, `rooms/${id}/leave`, 'POST');
      await requestAs(page, `rooms/${id}/leave`, 'POST');
    }
    await otherContext.close();
  }
});
