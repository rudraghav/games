import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { dealDetails } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { DealComposer } from '@/games/deal/DealComposer';
import { dealScenarios } from '@/stories/generated/deal-scenarios';

describe('Engine-derived Deal rent preview', () => {
  it('matches the actual pending bill after a house, hotel and committed Double the Rent', () => {
    const fixture = dealScenarios.find((item) => item.id === 'doubled-rent')!;
    const room = mapRoom(fixture.room);
    const match = room.game!;
    const details = dealDetails(match.detail);
    const card = match.hand.find((item) => item.id === fixture.focusCard)!;
    const options = match.actions.filter((option) => option.value.card === card.id);
    const candidate = options.find((option) => option.value.type === 'play')!;
    expect(details.rentMultiplier).toBe(2);
    expect(details.collections.find((collection) => collection.key === 'brown:0')!.rent).toBe(9);
    const html = renderToStaticMarkup(
      <DealComposer
        room={room}
        match={match}
        selfId={fixture.selfId}
        pending={false}
        onAction={() => undefined}
        card={card}
        options={options}
        details={details}
        candidate={candidate}
        onCandidate={() => undefined}
        onResetMove={() => undefined}
        onClear={() => undefined}
      />,
    );
    const outcome = dealDetails(mapRoom(fixture.transitions[0].room).game!.detail);
    expect(outcome.pendingAction!.amount).toBe(18);
    expect(html).toContain(`${outcome.pendingAction!.amount}M rent`);
    expect(html).toContain('from each other player');
    expect(candidate.value).toEqual(fixture.transitions[0].action);
  });
});
