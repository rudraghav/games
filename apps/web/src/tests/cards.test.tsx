import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { Hand, PlayingCard, TarotCard } from '@games/ui';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';

const secret = {
  id: 'private-card',
  label: 'Ace of hearts',
  value: 'A',
  suit: '♥',
  color: 'red',
  subtitle: '',
};
describe('Card accessibility and public contracts', () => {
  it('does not reveal a face-down card through its accessible name or colour', () => {
    const html = renderToStaticMarkup(
      <PlayingCard card={secret} faceDown onClick={() => undefined} />,
    );
    expect(html).toContain('aria-label="Face-down card"');
    expect(html).not.toContain('Ace of hearts');
    expect(html).not.toContain('data-color="red"');
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
