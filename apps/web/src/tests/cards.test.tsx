import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CardPile, Hand, PlayingCard, TarotCard } from '@games/ui';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { BoardTable } from '@/games/board/BoardTable';

const secret = {
  id: 'private-card',
  label: 'Ace of hearts',
  value: 'A',
  suit: '♥',
  color: 'red',
  subtitle: '',
};
describe('Card accessibility and public contracts', () => {
  it('announces Checkers kings through the actual selectable square', () => {
    const fixture = fixtures.find((item) => item.label === 'Checkers · minimum seats')!;
    const room = mapRoom(fixture.room);
    const match = room.game!;
    const source = match.actions[0].value.choice.split(':')[0];
    const king = match.community.find((cell) => cell.id === source)!;
    const crowned = {
      ...match,
      community: match.community.map((cell) =>
        cell.id === source ? { ...cell, subtitle: 'King' } : cell,
      ),
    };
    const html = renderToStaticMarkup(
      <BoardTable
        room={room}
        match={crowned}
        selfId={fixture.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(html).toContain(`aria-label="Select king ${king.label}"`);
  });
  it('does not reveal a face-down card through its accessible name or colour', () => {
    const html = renderToStaticMarkup(
      <PlayingCard card={secret} faceDown onClick={() => undefined} />,
    );
    expect(html).toContain('aria-label="Face-down card"');
    expect(html).not.toContain('Ace of hearts');
    expect(html).not.toContain('data-color="red"');
  });
  it('keeps a face-down card free of tooltips and turn-over marks, whatever it is handed', () => {
    const html = renderToStaticMarkup(
      <PlayingCard card={secret} faceDown tip="Ace of hearts beats everything" />,
    );
    expect(html).not.toContain('data-tip');
    expect(html).not.toContain('data-turn');
    expect(html).not.toContain('card-turn-back');
    expect(html).toContain('card-back-pattern');
    // A face that has always been face-up is not mid turn-over either.
    const open = renderToStaticMarkup(<PlayingCard card={secret} />);
    expect(open).not.toContain('data-turn');
    expect(open).not.toContain('card-turn-back');
  });
  it('explains cards whose meaning is a symbol, and takes rule-aware wording from the table', () => {
    const flip = (id: string, value: string, color: string) =>
      renderToStaticMarkup(
        <PlayingCard
          card={{ id, label: value, value, suit: '✦', color, subtitle: '' }}
          family="flip"
          compact
        />,
      );
    expect(flip('freeze-0', 'Freeze', 'red')).toContain('data-tip="Freeze: ends that player');
    expect(flip('three-0', 'Flip Three', 'red')).toContain('data-tip="Flip Three:');
    expect(flip('chance-0', 'Second Chance', 'red')).toContain('data-tip="Second Chance:');
    expect(flip('plus-4', '+4', 'blue')).toContain('data-tip="+4 points');
    expect(flip('times-2', '×2', 'blue')).toContain('data-tip="Doubles');
    expect(flip('n-7-0', '7', 'yellow')).not.toContain('data-tip');
    const skip = { id: 'red:skip:0', label: 'Red Skip', value: 'Skip', suit: '', color: 'red' };
    expect(
      renderToStaticMarkup(
        <PlayingCard
          card={{ ...skip, subtitle: 'UNO' }}
          family="shedding"
          tip="The next player loses their turn."
        />,
      ),
    ).toContain('data-tip="The next player loses their turn."');
  });
  it('draws a pile as a stack that thickens with its count and never under an empty slot', () => {
    const depth = (count?: number, card?: typeof secret) =>
      renderToStaticMarkup(<CardPile label="Draw pile" count={count} card={card} />).match(
        /data-depth="(\d)"/,
      )?.[1];
    expect([depth(0), depth(1), depth(2), depth(5), depth(6), depth(20), depth(21)]).toEqual([
      '0',
      '0',
      '1',
      '1',
      '2',
      '2',
      '3',
    ]);
    // A face-up pile of unknown size reads as a few cards; an emptied one as none.
    expect(depth(undefined, secret)).toBe('1');
    expect(depth(undefined)).toBe('0');
  });
  it('keeps every card in a maximum hand keyboard-selectable while saving', () => {
    const html = renderToStaticMarkup(
      <Hand
        cards={Array.from({ length: 42 }, (_, i) => ({ ...secret, id: `c${i}` }))}
        onSelect={() => undefined}
        selectedIds={['c3']}
      />,
    );
    expect(html.match(/type="button"/g)?.length).toBe(42);
    expect(html.match(/aria-pressed="true"/g)?.length).toBe(1);
  });
  it('distinguishes face-down Tarot controls from already revealed cards', () => {
    const back = renderToStaticMarkup(
      <TarotCard label="Choose card 8" onClick={() => undefined} />,
    );
    const revealed = renderToStaticMarkup(<TarotCard id="major-02" name="The High Priestess" />);
    expect(back).toContain('type="button"');
    expect(back).toContain('aria-label="Choose card 8"');
    expect(revealed).not.toContain('<button');
  });
  it('maps every generated minimum/maximum table projection without losing legal input constraints', () => {
    for (const fixture of fixtures) {
      const mapped = mapRoom(fixture.room);
      expect(mapped.game?.id).toBe(fixture.room.game_id);
      expect(mapped.members).toHaveLength(fixture.room.capacity);
      for (const option of mapped.game?.actions || []) {
        expect(option.step).toBeGreaterThan(0);
        expect(Array.isArray(option.eligibleCards)).toBe(true);
      }
    }
  });
});
