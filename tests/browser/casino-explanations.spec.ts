import { expect, test, type Page } from '@playwright/test';
import { midgameScenarios } from '../../apps/web/src/stories/generated/midgame-scenarios';
import {
  rummyDetails,
  skyjoDetails,
  teenPattiDetails,
  gangDetails,
} from '../../packages/api-client/src/index';
import { openRoomOptions, requestAs, roomAs } from './helpers';

test.skip(
  Boolean(process.env.GAMES_TEST_URL),
  'Local explanation acceptance uses deterministic public fixtures.',
);
test.use({ reducedMotion: 'reduce', trace: 'off' });

async function scenario(page: Page, id: string) {
  const fixture = midgameScenarios.find((item) => item.id === id)!;
  await page.goto('/design/midgame');
  await page.getByRole('combobox', { name: 'Game', exact: true }).selectOption(fixture.game);
  await page.getByRole('combobox', { name: 'Mid-game scenario', exact: true }).selectOption(id);
  return fixture;
}
async function fits(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}

test('Rummy explains a legal declaration before committing and the resulting points after it', async ({
  page,
}) => {
  const fixture = midgameScenarios.find(
    (item) =>
      item.game === 'rummy' &&
      item.next.action.type === 'declare' &&
      rummyDetails(item.next.game.detail ?? {}).finish_reason === 'valid_declaration',
  )!;
  expect(fixture).toBeTruthy();
  await scenario(page, fixture.id);
  const card = fixture.room.game!.hand!.find((item) => item.id === fixture.next.action.card)!;
  await page
    .getByRole('group', { name: 'Ungrouped', exact: true })
    .getByRole('button', { name: card.label, exact: true })
    .click();
  await expect(
    page.getByText('This discard leaves a valid declaration.', { exact: true }),
  ).toBeVisible();
  const witness = page
    .locator('details')
    .filter({ has: page.locator('summary', { hasText: 'After discarding' }) });
  await witness.locator('summary').click();
  await expect(witness).toContainText('The sequence requirement is met');
  await expect(witness).toContainText('pure sequence');
  await fits(page);
  await page.getByRole('button', { name: `Declare · discard ${card.label}`, exact: true }).click();
  const ledger = page.getByRole('region', { name: 'Rummy score explanation', exact: true });
  await expect(ledger).toBeVisible();
  await expect(
    ledger.getByRole('heading', { name: 'Valid declaration', exact: true }),
  ).toBeVisible();
  await expect(ledger.getByRole('listitem')).toHaveCount(fixture.seats);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await fits(page);
});

test('Rummy warns before an invalid declaration and keeps the selection when cancelled', async ({
  page,
}) => {
  const fixture = midgameScenarios.find(
    (item) =>
      item.game === 'rummy' &&
      item.room.game!.phase === 'discard' &&
      Object.values(rummyDetails(item.room.game!.detail ?? {}).discard_analyses).some(
        (row) => !row.valid,
      ),
  )!;
  const data = rummyDetails(fixture.room.game!.detail ?? {});
  const id = Object.entries(data.discard_analyses).find(([, row]) => !row.valid)![0];
  const card = fixture.room.game!.hand!.find((item) => item.id === id)!;
  await scenario(page, fixture.id);
  await page
    .getByRole('group', { name: 'Ungrouped', exact: true })
    .getByRole('button', { name: card.label, exact: true })
    .click();
  await expect(page.getByText(/This discard leaves an invalid declaration/)).toBeVisible();
  await page.getByRole('button', { name: `Declare · discard ${card.label}`, exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Declare an invalid hand?', exact: true });
  await expect(dialog).toContainText('80-point penalty');
  await dialog.getByRole('button', { name: 'Keep playing', exact: true }).click();
  await expect(dialog).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: `Discard ${card.label}`, exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel('Submitted action')).toHaveText('No action submitted');
  await fits(page);
});

test('Teen Patti names both sideshow parties and public seen status', async ({ page }) => {
  const fixture = midgameScenarios.find(
    (item) => item.game === 'teen-patti' && teenPattiDetails(item.room.game!.detail ?? {}).sideshow,
  )!;
  expect(fixture).toBeTruthy();
  await scenario(page, fixture.id);
  const data = teenPattiDetails(fixture.room.game!.detail ?? {});
  const name = (id: string) => fixture.room.members.find((member) => member.id === id)!.name;
  await expect(page.locator('.action-context')).toContainText(
    `${name(data.sideshow!.actor)} paid ${data.sideshow!.cost} chips`,
  );
  await expect(page.locator('.action-context')).toContainText(
    `with ${name(data.sideshow!.target)}`,
  );
  for (const [id, seen] of Object.entries(data.seen)) {
    const player = fixture.room.game!.players!.find((person) => person.id === id)!;
    if (!player.folded)
      await expect(page.locator(`.casino-seat[data-player-id="${id}"] .seat`)).toContainText(
        seen ? 'Seen' : 'Blind',
      );
  }
  await fits(page);
});

test('Skyjo exposes remaining final turns and the settled round calculation', async ({ page }) => {
  const closing = midgameScenarios.find(
    (item) => item.game === 'skyjo' && skyjoDetails(item.room.game!.detail ?? {}).remaining.length,
  )!;
  await scenario(page, closing.id);
  await expect(page.locator('.action-context')).toContainText('Final turns:');
  const review = midgameScenarios.find(
    (item) =>
      item.game === 'skyjo' &&
      Object.keys(skyjoDetails(item.room.game!.detail ?? {}).round_ledger).length,
  )!;
  await scenario(page, review.id);
  const ledger = page.getByRole('region', { name: 'Skyjo round score explanation', exact: true });
  await expect(ledger.getByRole('listitem')).toHaveCount(review.seats);
  await expect(ledger).toContainText('removed columns');
  await fits(page);
});

test('Gang switches privacy copy after reveal and explains the public hand order', async ({
  page,
}) => {
  const fixture = midgameScenarios.find(
    (item) =>
      item.game === 'the-gang' && gangDetails(item.room.game!.detail ?? {}).declared_order.length,
  )!;
  await scenario(page, fixture.id);
  await expect(
    page.getByText('These cards are now visible to the crew.', { exact: true }),
  ).toBeVisible();
  await expect(page.getByText('Only you can see these cards.', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Heist ranking explanation' })).toContainText(
    'Chip order:',
  );
  await page.getByText('Best five cards', { exact: true }).first().click();
  await expect(page.locator('.gang-revealed details[open] .playing-card')).toHaveCount(5);
  await fits(page);
});

test('a natural Blackjack round shows a saved per-hand ledger after refresh', async ({ page }) => {
  let id: string | undefined;
  try {
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Blackjack room', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill('Casino explanation QA');
    await openRoomOptions(page);
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('1');
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    await expect(page).toHaveURL(/\/rooms\/[\da-f-]+$/);
    id = new URL(page.url()).pathname.split('/').at(-1)!;
    const initial = await roomAs(page, id);
    if (initial.status === 'lobby') {
      await page.getByRole('button', { name: 'I’m ready', exact: true }).click();
      await page.getByRole('button', { name: 'Start game', exact: true }).click();
    }
    await page.getByRole('button', { name: 'Place bet', exact: true }).click();
    for (let step = 0; step < 5; step++) {
      const room = await roomAs(page, id);
      if (room.status === 'finished') break;
      if (room.game!.phase === 'insurance')
        await page.getByRole('button', { name: 'No insurance', exact: true }).click();
      else if (room.game!.phase === 'playing')
        await page.getByRole('button', { name: 'Stand', exact: true }).click();
      await expect
        .poll(async () => (await roomAs(page, id!)).match_version)
        .toBeGreaterThan(room.match_version!);
    }
    await expect.poll(async () => (await roomAs(page, id!)).status).toBe('finished');
    const ledger = page.getByRole('region', { name: 'Blackjack settlement', exact: true });
    await expect(ledger).toContainText('Hand 1:');
    await expect(ledger).toContainText('Insurance: 0 wagered');
    const text = await ledger.innerText();
    await page.reload();
    await expect(ledger).toHaveText(text, { useInnerText: true });
    await fits(page);
  } finally {
    if (id) {
      const room = await roomAs(page, id);
      if (room.status === 'playing')
        expect((await requestAs(page, `rooms/${id}/abandon`, 'POST')).ok()).toBe(true);
      expect((await requestAs(page, `rooms/${id}/leave`, 'POST')).ok()).toBe(true);
      expect((await requestAs(page, `rooms/${id}`)).status()).toBe(404);
    }
  }
});
