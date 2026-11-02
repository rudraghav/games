import { expect, test, type Page, type Locator } from '@playwright/test';
import { blackjackDetails } from '../../packages/api-client/src/casino-details';
import { attachPreviewAccess, openRoomOptions, requestAs, roomAs, type RoomView } from './helpers';

test.use({ trace: 'off', screenshot: 'off', reducedMotion: 'reduce' });
type Action = NonNullable<RoomView['game']>['actions'][number]['action'];

async function commit(
  actor: Page,
  before: RoomView,
  expected: Action,
  activate: () => Promise<unknown>,
) {
  const waiting = actor.waitForResponse(
    (response) =>
      response.url().endsWith(`/rooms/${before.id}/actions`) &&
      response.request().method() === 'POST',
  );
  await activate();
  const response = await waiting;
  expect(response.status()).toBe(200);
  const body = response.request().postDataJSON();
  expect(body.match_id).toBe(before.match_id);
  expect(body.expected_version).toBe(before.match_version);
  expect(body.action).toEqual(expected);
  const after = (await response.json()) as RoomView;
  expect(after.match_version).toBe(before.match_version! + 1);
  return after;
}
async function keyboard(actor: Page, control: Locator) {
  await expect(control).toBeEnabled();
  await control.focus();
  await actor.keyboard.press('Enter');
}
async function noOverflow(actor: Page) {
  expect(await actor.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
const publicDeal = (room: RoomView) =>
  room.game!.players.map((player) => ({
    id: player.id,
    bank: player.bank,
    properties: player.properties,
  }));

test('saved crowded-action families preserve exact moves, public state and narrow controls', async ({
  page,
  browser,
  baseURL,
}, info) => {
  test.setTimeout(300000);
  const contexts = await Promise.all(
    Array.from({ length: 3 }, () =>
      browser.newContext({ baseURL, viewport: page.viewportSize()!, reducedMotion: 'reduce' }),
    ),
  );
  const players = [page, ...(await Promise.all(contexts.map((context) => context.newPage())))];
  for (const player of players) player.setDefaultTimeout(15000);
  const joined: Page[] = [];
  const left = new Set<Page>();
  let roomId: string | undefined;
  try {
    for (const actor of players) await attachPreviewAccess(actor);
    await page.goto('/');
    await page.getByRole('button', { name: 'Create Monopoly Deal room', exact: true }).click();
    await page
      .getByRole('textbox', { name: 'Your name', exact: true })
      .fill(`Crowded host ${info.project.name}`);
    await page.getByRole('combobox', { name: 'Seats', exact: true }).selectOption('4');
    await openRoomOptions(page);
    await page
      .getByRole('textbox', { name: 'Room name', exact: true })
      .fill(`Crowded action verification ${info.project.name}`);
    const creation = page.waitForResponse(
      (response) =>
        response.url().endsWith('/api/backend/v1/rooms') && response.request().method() === 'POST',
    );
    await page.getByRole('button', { name: 'Create room', exact: true }).click();
    const created = await creation;
    expect(created.status()).toBe(201);
    roomId = ((await created.json()) as RoomView).id;
    await expect(page).toHaveURL(new RegExp(`/rooms/${roomId}$`));
    const code = await page.locator('.room-code').innerText();
    for (const [index, friend] of players.slice(1).entries()) {
      await friend.goto('/');
      await friend.getByRole('button', { name: 'Join a room', exact: true }).click();
      await friend
        .getByRole('textbox', { name: 'Your name', exact: true })
        .fill(`Crowded guest${index + 1} ${info.project.name}`);
      await friend.getByRole('textbox', { name: 'Room code', exact: true }).fill(code);
      const joining = friend.waitForResponse(
        (response) =>
          response.url().endsWith('/rooms/join') && response.request().method() === 'POST',
      );
      await friend.getByRole('button', { name: 'Join the room', exact: true }).click();
      expect((await joining).status()).toBe(200);
      joined.push(friend);
      await expect(friend).toHaveURL(page.url());
    }
    const identities = await Promise.all(
      players.map(
        async (actor) => (await (await requestAs(actor, 'me')).json()).profile.id as string,
      ),
    );
    const actorFor = (id: string) => {
      const actor = players[identities.indexOf(id)];
      expect(actor, 'Current actor belongs to this QA group').toBeTruthy();
      return actor;
    };
    async function start(game: string, capacity = 4) {
      const current = await roomAs(page, roomId!);
      if (current.status === 'playing')
        expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
      expect(
        (
          await requestAs(page, `rooms/${roomId}/settings`, 'PUT', {
            game_id: game,
            capacity,
            settings: {},
          })
        ).status(),
      ).toBe(200);
      for (const actor of players.filter((item) => !left.has(item))) {
        expect((await requestAs(actor, `rooms/${roomId}/heartbeat`, 'POST')).status()).toBe(200);
        expect(
          (await requestAs(actor, `rooms/${roomId}/ready`, 'PUT', { ready: true })).status(),
        ).toBe(200);
      }
      expect((await requestAs(page, `rooms/${roomId}/start`, 'POST')).status()).toBe(200);
      await Promise.all(players.filter((actor) => !left.has(actor)).map((actor) => actor.reload()));
      const snapshot = await roomAs(page, roomId!);
      expect(snapshot.game!.game_id).toBe(game);
      return snapshot;
    }
    async function savedVersion(actor: Page, expected: RoomView) {
      await actor.reload();
      const fresh = await roomAs(actor, roomId!);
      expect(fresh.match_id).toBe(expected.match_id);
      expect(fresh.match_version).toBe(expected.match_version);
      await noOverflow(actor);
      return fresh;
    }

    for (const game of ['deal', 'deal-no-mercy']) {
      const started = await start(game);
      const actor = actorFor(started.game!.current_player!);
      const before = await roomAs(actor, roomId);
      const option =
        before.game!.actions.find((item) => item.action.type === 'property') ||
        before.game!.actions.find((item) => item.action.type === 'bank');
      expect(option, 'An ordinary naturally dealt property or bank move exists').toBeTruthy();
      const index = before.game!.hand.findIndex((card) => card.id === option!.action.card);
      expect(index).toBeGreaterThanOrEqual(0);
      const card = before.game!.hand[index];
      await actor.locator('.deal-hand-dock .card-hand > button').nth(index).click();
      if (!(await actor.locator('.table-decision-panel').count()))
        await actor.getByRole('button', { name: 'Choose move options', exact: true }).click();
      const panel = actor.locator('.table-decision-panel');
      if (option!.action.type === 'property') {
        const moves = panel.getByRole('combobox', { name: 'Card move', exact: true });
        if (await moves.count()) await moves.selectOption(JSON.stringify(option!.action));
      } else {
        await panel.getByRole('button', { name: `Bank for ${card.value}`, exact: true }).click();
      }
      const after = await commit(actor, before, option!.action, () =>
        keyboard(
          actor,
          panel.getByRole('button', {
            name:
              option!.action.type === 'property'
                ? 'Place property'
                : `Confirm · bank ${card.value}`,
            exact: true,
          }),
        ),
      );
      const ownAssets = after.game!.players.find(
        (player) => player.id === identities[players.indexOf(actor)],
      )!;
      expect(
        [...(ownAssets.bank || []), ...Object.values(ownAssets.properties || {}).flat()].some(
          (asset) => asset.id === card.id,
        ),
      ).toBe(true);
      const expected = publicDeal(after);
      for (const seat of [actor, players.find((item) => item !== actor)!]) {
        const fresh = await savedVersion(seat, after);
        expect(publicDeal(fresh)).toEqual(expected);
        await expect(seat.locator('.deal-player[data-own="true"]')).toBeVisible();
      }
    }

    await start('blackjack');
    let blackjack = await roomAs(page, roomId);
    for (let wager = 0; wager < players.length; wager++) {
      expect(blackjack.game!.phase).toBe('betting');
      const actor = actorFor(blackjack.game!.current_player!);
      await actor.reload();
      const before = await roomAs(actor, roomId);
      const option = before.game!.actions.find((item) => item.action.type === 'bet')!;
      expect(option).toBeTruthy();
      const amount = option.minimum!;
      await actor
        .getByRole('spinbutton', { name: new RegExp(`^${option.label} amount`) })
        .fill(String(amount));
      blackjack = await commit(actor, before, { ...option.action, amount }, () =>
        keyboard(actor, actor.getByRole('button', { name: option.label, exact: true })),
      );
    }
    expect(blackjack.game!.phase).not.toBe('betting');
    for (const actor of players) {
      const own = await roomAs(actor, roomId);
      const details = blackjackDetails(own.game!.detail);
      expect(details.hands).toHaveLength(1);
      expect(details.hands[0].cards).toHaveLength(2);
      const fresh = await savedVersion(actor, blackjack);
      expect(blackjackDetails(fresh.game!.detail).hands).toEqual(details.hands);
      const rail = actor.getByRole('group', { name: 'Your blackjack hands', exact: true });
      await expect(rail.locator('.blackjack-hand')).toHaveCount(1);
      await expect(rail.locator('.casino-card-row .playing-card')).toHaveCount(2);
    }

    const paperStart = await start('sea-salt-paper');
    const paperActor = actorFor(paperStart.game!.current_player!);
    const paperBefore = await roomAs(paperActor, roomId);
    const draw = paperBefore.game!.actions.find((item) => item.action.type === 'take_stock')!;
    const drawn = await commit(paperActor, paperBefore, draw.action, () =>
      keyboard(
        paperActor,
        paperActor.getByRole('button', { name: 'Draw two · keep one', exact: true }),
      ),
    );
    await expect(
      paperActor.getByRole('heading', { name: 'Choose a card to keep', exact: true }),
    ).toBeVisible();
    const choices = drawn.game!.detail.private_options as {
      id: string;
      label: string;
      subtitle: string;
    }[];
    expect(choices).toHaveLength(2);
    const observer = players.find((actor) => actor !== paperActor)!;
    expect((await roomAs(observer, roomId)).game!.detail.private_options).toEqual([]);
    const restored = await savedVersion(paperActor, drawn);
    expect(restored.game!.detail.private_options).toEqual(choices);
    const keep = restored.game!.actions.find(
      (option) =>
        option.action.type === 'keep' &&
        option.action.card === choices[1].id &&
        option.action.choice === '0',
    )!;
    const choice = paperActor.getByRole('button', {
      name: `${choices[1].label}. ${choices[1].subtitle}`,
      exact: true,
    });
    await choice.focus();
    await paperActor.keyboard.press('Space');
    await expect(choice).toHaveAttribute('aria-pressed', 'true');
    const kept = await commit(paperActor, restored, keep.action, () =>
      keyboard(
        paperActor,
        paperActor.getByRole('button', { name: 'Keep selected · discard to pile 1', exact: true }),
      ),
    );
    const savedPaper = await savedVersion(paperActor, kept);
    expect(savedPaper.game!.hand.some((card) => card.id === choices[1].id)).toBe(true);
    expect(
      JSON.stringify((await roomAs(observer, roomId)).game).includes(`"${choices[1].id}"`),
    ).toBe(false);

    const wordsStart = await start('word-agents');
    const spymaster = actorFor(wordsStart.game!.current_player!);
    const clueBefore = await roomAs(spymaster, roomId);
    const clueOption = clueBefore.game!.actions.find(
      (option) => option.action.type === 'clue' && option.action.amount === 1,
    )!;
    const clue = ['Maplewood', 'Horizon', 'Constellation'].find(
      (word) =>
        !clueBefore.game!.community.some((card) => card.label.toLowerCase() === word.toLowerCase()),
    )!;
    await spymaster.getByRole('textbox', { name: 'Your one-word clue', exact: true }).fill(clue);
    const clued = await commit(spymaster, clueBefore, { ...clueOption.action, choice: clue }, () =>
      keyboard(spymaster, spymaster.getByRole('button', { name: 'Give clue', exact: true })),
    );
    const operative = actorFor(clued.game!.current_player!);
    await operative.reload();
    const guessing = await roomAs(operative, roomId);
    const guess = guessing.game!.actions.filter((option) => option.action.type === 'guess').at(-1)!;
    const word = guessing.game!.community.find((card) => card.id === guess.action.choice)!;
    for (const width of info.project.name === 'phone' ? [320, 390] : [1440]) {
      await operative.setViewportSize({ width, height: 900 });
      await noOverflow(operative);
      expect(
        await operative.locator('.word-tile strong').evaluateAll((labels) =>
          labels.every((label) => {
            const range = document.createRange();
            range.selectNodeContents(label);
            const text = range.getBoundingClientRect();
            const tile = label.parentElement!.getBoundingClientRect();
            return text.left >= tile.left - 1 && text.right <= tile.right + 1;
          }),
        ),
      ).toBe(true);
    }
    const target = operative.getByRole('button', { name: word.label, exact: true });
    await target.focus();
    await operative.keyboard.press('Space');
    await expect(target).toHaveAttribute('aria-pressed', 'true');
    const guessed = await commit(operative, guessing, guess.action, () =>
      keyboard(
        operative,
        operative.getByRole('button', { name: `Confirm ${word.label}`, exact: true }),
      ),
    );
    const refreshedWords = await savedVersion(operative, guessed);
    expect(refreshedWords.game!.community.find((card) => card.id === word.id)?.subtitle).toBe(
      'revealed',
    );

    const current = await roomAs(page, roomId);
    if (current.status === 'playing')
      expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
    for (const actor of players.slice(2)) {
      expect((await requestAs(actor, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
      left.add(actor);
    }
    const boopStart = await start('boop', 2);
    const boopActor = actorFor(boopStart.game!.current_player!);
    if (info.project.name === 'phone') await boopActor.setViewportSize({ width: 320, height: 900 });
    const beforeBoop = await roomAs(boopActor, roomId);
    const placement = beforeBoop.game!.actions.find(
      (option) =>
        option.action.type === 'place' &&
        option.action.color === 'kitten' &&
        option.action.choice === '5',
    )!;
    const square = boopActor.getByRole('button', { name: placement.label, exact: true });
    const box = await square.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(43.5);
    expect(box!.height).toBeGreaterThanOrEqual(43.5);
    await square.focus();
    await expect(square).toBeInViewport({ ratio: 0.99 });
    const placed = await commit(boopActor, beforeBoop, placement.action, () =>
      keyboard(boopActor, square),
    );
    for (const actor of players.slice(0, 2)) {
      const fresh = await savedVersion(actor, placed);
      expect(fresh.game!.community).toEqual(placed.game!.community);
    }
  } finally {
    try {
      if (roomId) {
        const current = await roomAs(page, roomId);
        if (current.status === 'playing')
          expect((await requestAs(page, `rooms/${roomId}/abandon`, 'POST')).status()).toBe(200);
        for (const friend of joined.filter((actor) => !left.has(actor)))
          expect((await requestAs(friend, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
        expect((await requestAs(page, `rooms/${roomId}/leave`, 'POST')).status()).toBe(200);
        for (const actor of [page, ...joined])
          expect((await requestAs(actor, `rooms/${roomId}`)).status()).toBe(404);
      }
    } finally {
      await Promise.all(contexts.map((context) => context.close()));
    }
  }
});
