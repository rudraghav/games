import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { dealDetails } from '@games/api-client';
import { DealComposer } from '@/games/deal/DealComposer';
import { DealResolution } from '@/games/deal/DealResolution';
import {
  commitLabel,
  describeOption,
  describeDirectOption,
  describePending,
  type DealContext,
} from '@/games/deal/decisions';
import { dealScenarios } from '@/stories/generated/deal-scenarios';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';

function context(room: ReturnType<typeof mapRoom>, selfId: string): DealContext {
  const match = room.game!;
  return { match, room, details: dealDetails(match.detail), selfId };
}
const deal = (id: string) => {
  const fixture = dealScenarios.find((item) => item.id === id)!;
  return { fixture, ctx: context(mapRoom(fixture.room), fixture.selfId) };
};
const midgame = (id: string) => {
  const fixture = midgameScenarios.find((item) => item.id === id)!;
  return { fixture, ctx: context(mapRoom(fixture.room), fixture.selfId) };
};
const resolution = (ctx: DealContext) =>
  renderToStaticMarkup(
    <DealResolution
      ctx={ctx}
      blocked={false}
      onCommit={() => undefined}
      onInspect={() => undefined}
      paid={[]}
      onPaid={() => undefined}
      stageChoice={null}
      onStageChoice={() => undefined}
    />,
  );

describe('Deal decisions name the exact card, its colour and its set', () => {
  it('gives every Sly Deal target on a 13-pile board a distinct, complete label', () => {
    const { fixture, ctx } = deal('crowded-sly-attacker');
    const options = ctx.match.actions.filter(
      (option) => option.value.card === fixture.focusCard && option.value.type === 'play',
    );
    expect(options.length).toBeGreaterThanOrEqual(13);
    const rows = options.map((option) => describeOption(option, ctx));
    const labels = rows.map((row) => `${row.title} · ${row.detail}`);
    expect(new Set(labels).size).toBe(labels.length);
    const wild = rows.find((row) => row.title === 'Wild Green/Dark blue')!;
    expect(wild.detail).toBe('Green active · 4M · from Green set 2 (1/3)');
    // The committed action is the one the transition recorded.
    const chosen = options.find(
      (option) => option.value.choice === fixture.transitions[0].action.choice,
    )!;
    expect(commitLabel(chosen, ctx)).toBe('Play Sly deal · take Wild Green/Dark blue');
    const html = renderToStaticMarkup(
      <DealComposer
        room={ctx.room}
        match={ctx.match}
        selfId={ctx.selfId}
        pending={false}
        onAction={() => undefined}
        card={ctx.match.hand.find((card) => card.id === fixture.focusCard)!}
        options={options}
        details={ctx.details}
        candidate={chosen}
        onCandidate={() => undefined}
        onResetMove={() => undefined}
        onClear={() => undefined}
      />,
    );
    expect(html).toContain('role="group" data-mode="action" aria-label="Card moves"');
    expect(html).not.toContain('role="radio"');
    expect(html.match(/class="deal-choice"/g)).toHaveLength(3);
    expect(html).toContain(`All ${options.length} moves`);
    expect(html).toContain('Take Mediterranean Avenue from Alexandra with a rather long name');
    const directLabels = options.map((option) => {
      const row = describeDirectOption(option, ctx);
      return `${row.title} · ${row.detail}`;
    });
    expect(new Set(directLabels).size).toBe(directLabels.length);
  });

  it('exposes both exact property destinations with consequences on their direct controls', () => {
    const { fixture, ctx } = deal('placement');
    const options = ctx.match.actions.filter((option) => option.value.card === fixture.focusCard);
    const rows = options.map((option) => describeDirectOption(option, ctx));
    expect(rows.map((row) => row.title)).toEqual([
      'Place in Brown set 1',
      'Place in new Brown set 2',
    ]);
    expect(rows[0].detail).toContain('1/2 → 2/2 · completes the set');
    expect(rows[1].detail).toContain('0/2 → 1/2');
  });

  it('treats a Forced Deal card used for debt settlement as direct gifts, not a swap', () => {
    const { ctx } = midgame('deal-no-mercy-5-31-18');
    const source = deal('forced');
    const card = {
      ...source.ctx.match.hand.find((item) => item.id === source.fixture.focusCard)!,
      id: 'forced-debt-test-card',
    };
    const original = ctx.match.actions.find((option) => option.value.type === 'settle_debt')!;
    const recipients = ctx.room.members.filter((member) => member.id !== ctx.selfId).slice(0, 2);
    const options = recipients.map((member) => ({
      ...original,
      value: { ...original.value, card: card.id, target: member.id },
    }));
    const match = { ...ctx.match, hand: [card], actions: options };
    const details = {
      ...ctx.details,
      debts: { ...ctx.details.debts, [ctx.selfId]: recipients.map((member) => member.id) },
    };
    const html = renderToStaticMarkup(
      <DealComposer
        room={ctx.room}
        match={match}
        selfId={ctx.selfId}
        pending={false}
        onAction={() => undefined}
        card={card}
        options={options}
        details={details}
        candidate={null}
        onCandidate={() => undefined}
        onResetMove={() => undefined}
        onClear={() => undefined}
      />,
    );
    expect(html).toContain('aria-label="Card moves"');
    expect(html).not.toContain('Property you take');
    expect(html).not.toContain('Complete swap');
    for (const recipient of recipients)
      expect(html).toContain(`Give Forced deal to ${recipient.name}`);
  });

  it('tells the defender what accepting and Just Say No each do', () => {
    const { ctx } = deal('crowded-sly-response');
    const text = describePending(ctx)!;
    expect(text.headline).toBe(
      'Dev wants to Sly Deal your Wild Green/Dark blue (Green active, 4M) from your Green set 2 (1/3).',
    );
    expect(text.facts).toContain('Your Green set 2: 1/3 → 0/3 · set emptied');
    expect(text.accept).toBe('Dev takes it.');
    expect(text.no).toBe('You keep it unless Dev answers with their own Just Say No.');
    const html = resolution(ctx);
    // Both answers sit in the sticky action area; Accept is primary, Just Say No secondary.
    expect(html).toMatch(/data-decision-actions[^>]*>.*Accept Sly Deal.*Just Say No/);
    expect(html).toMatch(/button--secondary[^>]*>Just Say No/);
    expect(html).toContain('Uses 1 of your 1 Just Say No card.');
  });

  it('shows the attacker who they wait for, and the blocked attacker their choice', () => {
    const waiting = deal('crowded-sly-waiting').ctx;
    expect(waiting.match.actions).toHaveLength(0);
    const html = resolution(waiting);
    expect(html).toContain('Waiting for Alexandra with a rather long name: accept (you take it)');
    expect(html).not.toContain('data-decision-actions');
    const blocked = describePending(deal('crowded-sly-blocked').ctx)!;
    expect(blocked.headline).toBe(
      'Alexandra with a rather long name blocked your Sly Deal with Just Say No.',
    );
    expect(blocked.acceptLabel).toBe('Accept the block');
    expect(blocked.accept).toBe('Your Sly Deal is cancelled.');
  });

  it('labels a No Mercy debt settlement as a gift to the creditor, never a play', () => {
    const { ctx } = midgame('deal-no-mercy-5-31-18');
    const settle = ctx.match.actions.filter((option) => option.value.type === 'settle_debt');
    expect(settle.length).toBeGreaterThan(0);
    for (const option of settle) {
      const label = commitLabel(option, ctx);
      expect(label).toMatch(/^Give .+ to .+/);
      expect(label).not.toMatch(/^Play/);
      expect(describeOption(option, ctx).detail).toMatch(/Settles 1 of your/);
    }
  });

  it.each([
    ['deal-no-mercy-2-17-24', 'choose', 'Choose the card to take', 'Take'],
    ['deal-no-mercy-2-17-17', 'keep', 'Keep one, hand out the rest', 'Keep'],
    ['deal-no-mercy-2-17-18', 'give', 'Keep one, hand out the rest', 'Give'],
  ])('exposes %s pending decisions as complete, named actions', (id, type, heading, verb) => {
    const { ctx } = midgame(id);
    const html = resolution(ctx);
    const choices = ctx.match.actions.filter((option) => option.value.type === type);
    expect(choices.length).toBeGreaterThan(0);
    expect(html).toContain(`role="group" data-mode="action" aria-label="${heading}"`);
    expect(html.match(/class="deal-choice"/g)).toHaveLength(choices.length);
    expect(html).not.toContain('role="radio"');
    expect(html).not.toContain('Choose a card above');
    expect(html).not.toContain('data-decision-actions');
    for (const option of choices) {
      const label = describeDirectOption(option, ctx).title;
      expect(label).toMatch(new RegExp(`^${verb} `));
      expect(html).toContain(label);
      if (type === 'give') expect(label).toContain(' to Dev');
    }
  });

  it('previews every card a Super Sly Deal colour takes, with owner and active colour', () => {
    const { ctx } = midgame('deal-no-mercy-5-31-26');
    const options = ctx.match.actions.filter(
      (option) =>
        option.value.type === 'play' &&
        ctx.match.hand.find((card) => card.id === option.value.card)?.effect === 'super_sly',
    );
    expect(options.length).toBeGreaterThan(0);
    for (const option of options)
      expect(describeOption(option, ctx).detail).toMatch(/^Takes \d+ cards?: /);
  });

  it('warns when assets cannot cover a bill', () => {
    const html = resolution(deal('payment-insolvent').ctx);
    expect(html).toContain('You can’t cover 5M. Give everything you have (2M)');
    expect(html).toContain('Select everything');
  });
  it('quotes bills from the public table before a player spends their counter', () => {
    const ctx = deal('counter').ctx;
    expect(describePending(ctx)?.accept).toMatch(/all payable assets \(1M\)/);
    expect(describePending(ctx)?.acceptLabel).toBe('Accept and choose payment');
    const empty = {
      ...ctx,
      match: {
        ...ctx.match,
        players: ctx.match.players.map((p) =>
          p.id === ctx.selfId ? { ...p, bank: [], properties: {} } : p,
        ),
      },
    };
    expect(describePending(empty)?.accept).toBe('You have no payable assets and the bill clears.');
    expect(describePending(empty)?.acceptLabel).toBe('Accept bill');
    const mercy = { ...empty, match: { ...empty.match, id: 'deal-no-mercy' } };
    expect(describePending(mercy)?.accept).toContain('You take one debt chip');
    const actor = ctx.details.pendingAction!.actor;
    const atLimit = {
      ...mercy,
      details: { ...ctx.details, debts: { [ctx.selfId]: [actor, actor, actor] } },
    };
    expect(describePending(atLimit)?.accept).toContain('No new chip is added.');
    expect(describePending(atLimit)?.accept).not.toContain('take one debt chip');
    const forced = {
      ...atLimit,
      details: {
        ...atLimit.details,
        pendingAction: { ...ctx.details.pendingAction!, kind: 'forced_debt' },
      },
    };
    expect(describePending(forced)?.accept).toBe(
      'You already have 3 debt chips. No new chip is added.',
    );
  });
});
