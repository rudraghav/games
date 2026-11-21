import { expect, type Page } from '@playwright/test';
import { gemsDetails } from '../../packages/api-client/src/game-details';
import { requestAs, roomAs, type RoomView } from './helpers';

async function playOption(actor: Page, roomId: string, type: string) {
  const before = await roomAs(actor, roomId);
  const action = before.game!.actions.find((item) => item.action.type === type)?.action;
  expect(action, 'setup uses a legal option from the acting seat').toBeDefined();
  const saved = await requestAs(actor, 'rooms/' + roomId + '/actions', 'POST', {
    match_id: before.match_id,
    expected_version: before.match_version,
    action_id: crypto.randomUUID(),
    action,
  });
  expect(saved.status()).toBe(200);
  return (await saved.json()) as RoomView;
}

export async function playGemDecisions(owner: Page, friend: Page, initial: RoomView) {
  const path = '**/rooms/' + initial.id + '/actions';
  const actionResponse = () =>
    owner.waitForResponse(
      (res) =>
        res.url().endsWith('/rooms/' + initial.id + '/actions') &&
        res.request().method() === 'POST',
    );
  const chooseGems = owner.getByRole('button', { name: 'Take selected gems', exact: true });
  for (const color of ['pearl', 'sapphire', 'ruby'])
    await owner.getByRole('button', { name: 'Select ' + color, exact: true }).click();
  expect((await roomAs(owner, initial.id)).match_version).toBe(initial.match_version);

  // A refused request never reaches the server. The same saved draft can retry after reload.
  await owner.route(
    path,
    (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({ detail: 'Try again.' }),
      }),
    { times: 1 },
  );
  const failed = actionResponse();
  await chooseGems.click();
  expect((await failed).status()).toBe(503);
  await expect(chooseGems).toBeEnabled();
  await owner.reload();
  await expect(chooseGems).toBeEnabled();
  expect((await roomAs(owner, initial.id)).match_version).toBe(initial.match_version);
  const taken = actionResponse();
  await chooseGems.click();
  const saved = (await (await taken).json()) as RoomView;
  expect(saved.match_version).toBe(initial.match_version! + 1);
  expect(gemsDetails(saved.game!.detail).tokens[initial.owner_id]).toMatchObject({
    pearl: 1,
    sapphire: 1,
    ruby: 1,
  });

  const play = (actor: Page, type: string) => playOption(actor, initial.id, type);
  // Reach ten chips and two reservations from ordinary legal actions on each seat.
  for (const type of ['take', 'take', 'reserve_blind', 'reserve_blind']) {
    const before = await roomAs(friend, initial.id);
    const friendAction = before.game!.hand.length < 2 ? 'reserve_blind' : 'take';
    let after = await play(friend, friendAction);
    while (after.game!.phase === 'return_tokens') after = await play(friend, 'return');
    after = await play(owner, type);
    while (after.game!.phase === 'return_tokens') after = await play(owner, 'return');
  }
  let peer = await play(friend, 'take');
  while (peer.game!.phase === 'return_tokens') peer = await play(friend, 'return');
  const before = await roomAs(owner, initial.id);
  const data = gemsDetails(before.game!.detail);
  expect(before.game!.hand).toHaveLength(2);
  expect(Object.values(data.tokens[initial.owner_id]).reduce((a, b) => a + b, 0)).toBe(10);
  expect(data.bank.gold).toBe(1);
  await owner.reload();

  const note =
    'Reserving fills your last slot. With the gold you’ll hold 11 gems and must return one.';
  await owner.locator('.gem-tier[data-active="true"] button.development-card').first().click();
  const selected = owner.getByRole('region', { name: 'Selected development' });
  await expect(selected).toContainText(note);
  await selected.getByRole('button', { name: 'Clear selection' }).click();
  const blind = owner
    .locator('details')
    .filter({ has: owner.getByText('Reserve a face-down card', { exact: true }) });
  await blind.locator('summary').click();
  await expect(blind).toContainText(note);
  expect((await roomAs(owner, initial.id)).match_version).toBe(before.match_version);
  const reserved = actionResponse();
  await blind.getByRole('button', { name: /tier 1/ }).click();
  const after = (await (await reserved).json()) as RoomView;
  expect(after.match_version).toBe(before.match_version! + 1);
  expect(after.game!.phase).toBe('return_tokens');
  expect(after.game!.hand).toHaveLength(3);
  expect(gemsDetails(after.game!.detail).returnCount).toBe(1);
  const privateCard = after.game!.hand.find(
    (card) => !before.game!.hand.some((item) => item.id === card.id),
  )!;
  const other = (await roomAs(friend, initial.id)).game!;
  expect(gemsDetails(other.detail).cardInfo[privateCard.id]).toBeUndefined();

  const returned = actionResponse();
  await owner.getByRole('button', { name: /^Return one gold/ }).click();
  const final = (await (await returned).json()) as RoomView;
  expect(final.match_version).toBe(after.match_version! + 1);
  expect(final.game!.phase).toBe('playing');
  const wallet = gemsDetails(final.game!.detail).tokens[initial.owner_id];
  expect(Object.values(wallet).reduce((a, b) => a + b, 0)).toBe(10);
}
