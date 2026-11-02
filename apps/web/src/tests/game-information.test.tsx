import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom, mapCard } from '@games/api-client/mappers';
import { gameById } from '@games/api-client/catalog';
import { blackjackValueLabel, visibleBlackjackValue } from '@/games/casino/hand-value';
import { sheddingCardInformation } from '@/games/shared/card-information';
import { RoomResults } from '@/features/room/RoomResults';
import { fixtures } from '@/stories/generated/rooms';
import faces from '@/stories/generated/card-faces.json';

const cards = (values: string[]) =>
  values.map((value, index) =>
    mapCard({ id: String(index), value, label: value, color: 'ink', suit: '♠', subtitle: '' }),
  );
describe('Decision information across game families', () => {
  it('counts visible aces correctly without predicting any hidden card or winner', () => {
    expect(visibleBlackjackValue(cards(['A', 'A', '5']))).toEqual({
      total: 17,
      soft: true,
      bust: false,
    });
    expect(blackjackValueLabel(cards(['A', '6', 'K']))).toBe('17');
    expect(blackjackValueLabel(cards(['K', 'Q', '2']))).toBe('22 · bust');
    expect(blackjackValueLabel(cards(['A', '7']))).toBe('18 · soft');
    expect(blackjackValueLabel(cards(['?']))).toBe('Total unavailable');
  });
  it('explains every Uno action face and makes 7/0 conditional for classic', () => {
    for (const face of faces.filter(
      (item) => item.game.startsWith('uno') && !/^\d+$/.test(item.card.value),
    )) {
      expect(
        sheddingCardInformation(mapCard(face.card), face.game === 'uno-no-mercy', {}, 4),
        face.key,
      ).toBeTruthy();
    }
    const seven = cards(['7'])[0];
    expect(sheddingCardInformation(seven, false, {}, 4)).toBeNull();
    expect(sheddingCardInformation(seven, false, { seven_zero: true }, 4)).toContain('Swap hands');
    expect(sheddingCardInformation({ ...seven, value: 'Reverse +4' }, true, {}, 2)).toContain(
      'yourself',
    );
  });
  it('renders authoritative main/split/side pots and refunds in the actual results component', () => {
    const room = mapRoom(fixtures.find((fixture) => fixture.room.game_id === 'holdem')!.room);
    const [a, b] = room.members;
    room.game = {
      ...room.game!,
      phase: 'finished',
      hand: [{ ...cards(['A'])[0], label: 'PRIVATE_HAND_CANARY' }],
      winners: [a.id, b.id],
      detail: {
        current_bet: 0,
        pots: [
          { amount: 120, winners: [a.id, b.id] },
          { amount: 40, winners: [b.id] },
        ],
        refunds: { [a.id]: 12 },
      },
    };
    const html = renderToStaticMarkup(<RoomResults room={room} game={gameById('holdem')} />);
    expect(html).toContain('Main pot: 120 chips');
    expect(html).toContain('Side pot 1: 40 chips');
    expect(html).toContain('Split between');
    expect(html).toContain('12 chips returned');
    expect(html).not.toContain('PRIVATE_HAND_CANARY');
  });
});
