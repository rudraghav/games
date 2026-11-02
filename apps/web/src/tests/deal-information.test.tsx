import { describe, expect, it } from 'vitest';
import { mapRoom } from '@games/api-client/mappers';
import { dealDetails } from '@games/api-client';
import { dealCardInstructions } from '@games/ui';
import { dealInfoEntries, rentOptions } from '@/games/deal/information';
import { dealScenarios } from '@/stories/generated/deal-scenarios';
import faces from '@/stories/generated/card-faces.json';

describe('Deal decision information', () => {
  it('inspects only the viewer hand, public assets and discard, never arbitrary private detail', () => {
    const fixture = dealScenarios.find((item) => item.id === 'doubled-rent')!;
    const room = mapRoom(fixture.room);
    const match = room.game!;
    match.detail.private_hand = [{ id: 'PRIVATE_CANARY', label: 'Hidden opponent card' }];
    const expected = [
      ...match.hand,
      ...match.players.flatMap((player) => [
        ...player.bank,
        ...Object.values(player.properties).flat(),
      ]),
      ...(match.discard ? [match.discard] : []),
    ];
    const entries = dealInfoEntries(match, room, fixture.selfId, dealDetails(match.detail));
    expect(entries.map((entry) => entry.card.id).sort()).toEqual(
      expected.map((card) => card.id).sort(),
    );
    expect(JSON.stringify(entries).includes('PRIVATE_CANARY')).toBe(false);
    expect(entries.find((entry) => entry.card.id === fixture.focusCard)!.location).toBe(
      'Your hand',
    );
  });

  it('explains every canonical Deal action with the same text as the card face', () => {
    const effects = new Set(
      faces
        .filter((face) => face.game.includes('monopoly'))
        .map((face) => face.card.effect)
        .filter(Boolean),
    );
    expect(effects.size).toBeGreaterThan(20);
    for (const effect of effects) expect(dealCardInstructions[effect], effect).toBeTruthy();
  });

  it('matches available rent charges to the legal engine action and committed bill', () => {
    const fixture = dealScenarios.find((item) => item.id === 'doubled-rent')!;
    const room = mapRoom(fixture.room);
    const match = room.game!;
    const card = match.hand.find((item) => item.id === fixture.focusCard)!;
    const choices = rentOptions(card, match, dealDetails(match.detail), fixture.selfId);
    expect(choices).toEqual([{ key: 'brown:0', label: 'Brown · set 1', amount: 18 }]);
    expect(choices[0].amount).toBe(
      dealDetails(mapRoom(fixture.transitions[0].room).game!.detail).pendingAction!.amount,
    );
    expect(rentOptions(card, match, dealDetails(match.detail), room.members[1].id)).toEqual([]);
  });

  it('includes every card in the naturally reached large hand without revealing other hands', () => {
    const fixture = dealScenarios.find((item) => item.id === 'information-hand')!;
    const room = mapRoom(fixture.room);
    expect(room.game!.hand.length).toBeGreaterThanOrEqual(9);
    expect(
      dealInfoEntries(room.game!, room, fixture.selfId, dealDetails(room.game!.detail)).filter(
        (entry) => entry.location === 'Your hand',
      ),
    ).toHaveLength(room.game!.hand.length);
  });
});
