import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { boardDetails, gemsDetails } from '@games/api-client';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { BoardTable } from '@/games/board/BoardTable';
import { GemsTable } from '@/games/gems/GemsTable';
import { BoopTable } from '@/games/boop/BoopTable';
import { playerName } from '@/games/types';

function fixture(game: string) {
  const item = fixtures.find((entry) => entry.room.game_id === game)!;
  const room = mapRoom(item.room);
  return {
    room,
    match: room.game!,
    selfId: item.selfId,
    pending: false,
    onAction: () => undefined,
  };
}

describe('Authoritative market and board explanations', () => {
  it('uses the forced return instruction and actual visible tier count', () => {
    const props = fixture('gem-market');
    props.match.phase = 'return_tokens';
    props.match.detail = { ...props.match.detail, return_count: 3 };
    const tierOne = props.match.community.filter(
      (card) => gemsDetails(props.match.detail).cardInfo[card.id]?.tier === 1,
    );
    props.match.community = props.match.community.filter(
      (card) => !tierOne.slice(1).some((removed) => removed.id === card.id),
    );
    const html = renderToStaticMarkup(<GemsTable {...props} />);
    expect(html).toContain('Return 3 gems to hold ten.');
    expect(html).not.toContain('Select a development to buy or reserve.');
    expect(html).toContain('1 card');
  });

  it('renders only server-supplied winning cells and accepts legacy details', () => {
    const props = fixture('four-in-a-row');
    const opponent = props.match.players.find((player) => player.id !== props.selfId)!;
    props.match.phase = 'finished';
    props.match.message = 'Gold connected four in a row.';
    props.match.winners = [opponent.id];
    props.match.detail = {
      ...props.match.detail,
      outcome_reason: 'four-in-a-row',
      winning_cells: [14, 21, 28, 35],
    };
    const html = renderToStaticMarkup(<BoardTable {...props} />);
    expect(html.match(/data-winning="true"/g)).toHaveLength(4);
    // The loser's table names the winner instead of repeating a generic message.
    expect(html).toContain(`${playerName(props.room, opponent.id)} connected four in a row.`);
    expect(html).not.toContain('You connected');
    expect(html).toContain('View whole board');
    const legacy = { rows: 6, columns: 7, draw: false, last_move: null };
    expect(boardDetails(legacy).winningCells).toEqual([]);
    expect(() => boardDetails({ ...legacy, winning_cells: [64] })).toThrow();
  });

  it('distinguishes boop eight-cat wins and keeps graduation uncommitted initially', () => {
    const props = fixture('boop');
    props.match.phase = 'finished';
    props.match.detail = {
      ...props.match.detail,
      outcome_reason: 'eight-cats',
      winning_cells: [0, 2, 4, 7, 15, 18, 22, 35],
    };
    const html = renderToStaticMarkup(<BoopTable {...props} />);
    expect(html).toContain('Eight adult cats on the bed');
    expect(html).toContain('A1, C1, E1, B2, D3, A4, E4, F6');
    props.match.phase = 'graduating';
    props.match.currentPlayer = props.selfId;
    const choosing = renderToStaticMarkup(<BoopTable {...props} />);
    expect(choosing).toContain('Select a line to preview it, then confirm.');
    expect(choosing).toContain('No graduation selected.');
    expect(choosing).toContain('Confirm graduation');
  });
});
