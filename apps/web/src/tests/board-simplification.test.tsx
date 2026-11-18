import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { BoopTable } from '@/games/boop/BoopTable';
import { PaperTable } from '@/games/sea/PaperTable';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';

function propsFor(id: string) {
  const item = midgameScenarios.find((scenario) => scenario.id === id)!;
  const room = mapRoom(item.room);
  return { room, match: room.game!, selfId: item.selfId, onAction: () => {}, pending: false };
}

it('keeps the graduation preview editable when a player may return a piece instead', () => {
  const props = propsFor('boop-2-17-8');
  const line = props.match.actions[0];
  const choice = line.value.choice.split(',')[0];
  const alternative = {
    ...line,
    label: 'Bring one piece back',
    value: { ...line.value, type: 'return_piece', choice },
  };
  const match = { ...props.match, actions: [line, alternative] };
  const html = renderToStaticMarkup(<BoopTable {...props} match={match} />);
  expect(html).toContain('No graduation selected.');
  expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Confirm graduation<\/button>/);
  expect(html).not.toContain('data-highlight="true"');
});

it('requires an explicit partner when several duos fit the same card', () => {
  const props = propsFor('sea-salt-paper-2-17-238-crowded');
  const first = props.match.actions.find((option) => option.value.type === 'pair')!;
  const [anchor, partner] = first.value.cards!;
  const crab = props.match.hand.find((card) => card.id === partner)!;
  const other = { ...crab, id: 'other-crab' };
  const match = {
    ...props.match,
    hand: [...props.match.hand, other],
    actions: [
      ...props.match.actions,
      { ...first, value: { ...first.value, cards: [anchor, other.id] } },
    ],
  };
  const html = renderToStaticMarkup(<PaperTable {...props} match={match} />);
  expect(html).toMatch(/<button[^>]*disabled=""[^>]*>Play selected duo<\/button>/);
});
