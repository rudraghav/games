import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { dealDetails } from '@games/api-client';
import { DealTable } from '@/games/deal/DealTable';
import { DealComposer } from '@/games/deal/DealComposer';
import { actionLabel, bankValue, suggestBankPayment } from '@/games/deal/presentation';
import { dealScenarios } from '@/stories/generated/deal-scenarios';

function scenario(id: string) {
  const fixture = dealScenarios.find((item) => item.id === id)!;
  const room = mapRoom(fixture.room);
  return {
    fixture,
    room,
    match: room.game!,
    selfId: fixture.selfId,
    pending: false,
    onAction: () => undefined,
  };
}

describe('Engine-projected Deal workspace', () => {
  it('maps every synthetic decision without exposing internal engine state or opposing hands', () => {
    for (const fixture of dealScenarios) {
      for (const wire of [fixture.room, ...fixture.transitions.map((item) => item.room)]) {
        const room = mapRoom(wire);
        const match = room.game!;
        const details = dealDetails(match.detail);
        expect(details.propertyGroups).toHaveLength(10);
        expect(details.propertyGroups.flatMap((group) => group.properties)).toHaveLength(28);
        expect(match.players.every((player) => player.cards.length === 0)).toBe(true);
        expect(JSON.stringify(wire)).not.toMatch(/"(?:deck|hands|seed|queue|links)":/);
        for (const collection of details.collections) {
          const cards = match.players.find((player) => player.id === collection.player)!.properties[
            collection.key
          ];
          expect(collection.count).toBe(cards.filter((card) => card.suit === 'property').length);
        }
      }
    }
  });

  it('shows named properties, complete sets and authoritative building rent', () => {
    const props = scenario('collections');
    const html = renderToStaticMarkup(<DealTable {...props} />);
    expect(html).toContain('Boardwalk');
    expect(html).toContain('Mediterranean Avenue');
    expect(html).toContain('Baltic Avenue');
    expect(html).toContain('aria-label="Complete set"');
    expect(html).toContain('<b>9M</b>');
    expect(html).toContain('aria-label="Inspect Brown · set 1"');
    expect(html).not.toContain('castle');
    expect(
      dealDetails(props.match.detail).collections.find((group) => group.key === 'brown:0')?.rent,
    ).toBe(9);
  });

  it('keeps existing/new same-color destinations distinct and projects their different outcomes', () => {
    const props = scenario('placement');
    const options = props.match.actions.filter(
      (option) => option.value.card === props.fixture.focusCard,
    );
    expect(options.map((option) => option.value.choice)).toEqual(['brown:0', 'brown:1']);
    expect(
      options.map((option) =>
        actionLabel(
          option,
          props.match,
          props.room,
          dealDetails(props.match.detail).propertyGroups,
        ),
      ),
    ).toEqual(['Brown · set 1', 'Brown · set 2']);
    const outcomes = props.fixture.transitions.map((transition) =>
      dealDetails(mapRoom(transition.room).game!.detail),
    );
    expect(outcomes[0].collections.find((group) => group.key === 'brown:0')?.complete).toBe(true);
    expect(
      outcomes[1].collections
        .filter((group) => group.color === 'brown')
        .map((group) => group.complete),
    ).toEqual([false, false]);
  });

  it('preserves a standard-property move between same-color piles as a free engine action', () => {
    const props = scenario('rearrange');
    const before = dealDetails(props.match.detail);
    const transition = props.fixture.transitions[0];
    const after = dealDetails(mapRoom(transition.room).game!.detail);
    expect(transition.action.type).toBe('rearrange');
    expect(transition.action.choice).toBe('brown:0');
    expect(before.moves).toBe(after.moves);
    expect(after.collections.filter((group) => group.complete)).toHaveLength(1);
  });

  it('names both taken and given properties for every targeted Forced Deal option', () => {
    const props = scenario('forced');
    const groups = dealDetails(props.match.detail).propertyGroups;
    const options = props.match.actions.filter((option) => option.value.type === 'play');
    expect(options).toHaveLength(4);
    for (const option of options) {
      const label = actionLabel(option, props.match, props.room, groups);
      const target = props.room.members.find((member) => member.id === option.value.target)!;
      const publicProperties = props.match.players.flatMap((player) =>
        Object.values(player.properties).flat(),
      );
      expect(label).toContain(target.name);
      expect(label).toContain(
        `Take ${publicProperties.find((card) => card.id === option.value.choice)!.label}`,
      );
      expect(label).toContain(
        `Give ${publicProperties.find((card) => card.id === option.value.cards![0])!.label}`,
      );
      expect(label).not.toContain(option.value.choice);
    }
  });

  it.each(['payment-bank', 'payment-exact', 'payment-insolvent'])(
    'suggests bank-only payment with the least overpayment for %s',
    (id) => {
      const props = scenario(id);
      const bank = props.match.players.find((player) => player.id === props.selfId)!.bank;
      const pay = props.match.actions.find((option) => option.value.type === 'pay')!;
      const due = dealDetails(props.match.detail).paymentAmount;
      const suggested = suggestBankPayment(bank, pay.eligibleCards, due);
      const amount = bank
        .filter((card) => suggested.includes(card.id))
        .reduce((sum, card) => sum + bankValue(card), 0);
      const possible = Array.from({ length: 2 ** bank.length }, (_, mask) =>
        bank.reduce((sum, card, index) => sum + (mask & (1 << index) ? bankValue(card) : 0), 0),
      ).filter((value) => value >= due);
      expect(amount).toBe(
        possible.length
          ? Math.min(...possible)
          : bank.reduce((sum, card) => sum + bankValue(card), 0),
      );
      expect(suggested.every((id) => bank.some((card) => card.id === id))).toBe(true);
    },
  );

  it('keeps counter chains and payment decisions consistent with the published bill', () => {
    const counter = scenario('counter');
    const chain = scenario('counter-chain');
    expect(dealDetails(counter.match.detail).pendingAction).toMatchObject({
      amount: 5,
      blocked: false,
      stage: 'counter',
    });
    expect(dealDetails(chain.match.detail).pendingAction).toMatchObject({
      amount: 5,
      blocked: true,
      stage: 'counter',
    });
    const restored = chain.fixture.transitions.find(
      (transition) => transition.action.type === 'no',
    )!;
    expect(dealDetails(mapRoom(restored.room).game!.detail).pendingAction?.blocked).toBe(false);
    const payment = scenario('payment-bank');
    expect(dealDetails(payment.match.detail).pendingAction?.amount).toBe(
      dealDetails(payment.match.detail).paymentAmount,
    );
    const paymentHtml = renderToStaticMarkup(<DealTable {...payment} />);
    expect(paymentHtml).toContain('Pay 5M · 0M selected');
    expect(paymentHtml).toContain('Choose move options');
  });

  it('blocks an already selected card move while saving or disconnected', () => {
    const props = scenario('forced');
    const card = props.match.hand.find((card) => card.id === props.fixture.focusCard)!;
    const options = props.match.actions.filter((option) => option.value.card === card.id);
    for (const blocked of [
      { pending: true, room: props.room },
      { pending: false, room: { ...props.room, paused: true } },
    ]) {
      const html = renderToStaticMarkup(
        <DealComposer
          {...props}
          {...blocked}
          card={card}
          options={options}
          details={dealDetails(props.match.detail)}
          candidate={options.find((option) => option.value.type === 'play')!}
          onCandidate={() => undefined}
          onResetMove={() => undefined}
          onClear={() => undefined}
        />,
      );
      expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Play Forced deal/);
    }
  });

  it('keeps No Mercy explicitly labeled as the Games house deck', () => {
    const html = renderToStaticMarkup(<DealTable {...scenario('no-mercy')} />);
    expect(html).toContain('No Mercy uses the Games house deck.');
    expect(html).toContain('Boardwalk');
  });

  it('quotes no collectible rent for a collection containing only a zero-value wild', () => {
    const props = scenario('payment-bank');
    const collection = dealDetails(props.match.detail).collections.find(
      (item) => item.player === props.selfId,
    )!;
    expect(collection.count).toBe(1);
    expect(collection.complete).toBe(false);
    expect(collection.rent).toBe(0);
  });
});
