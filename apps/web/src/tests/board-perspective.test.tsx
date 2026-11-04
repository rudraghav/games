import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { BoardTable } from '@/games/board/BoardTable';
import { MancalaTable } from '@/games/board/MancalaTable';
import { BoopTable } from '@/games/boop/BoopTable';
import { playerName } from '@/games/types';

/** A two-seat fixture seen from either seat, with nothing pending. */
function seat(game: string, index: 0 | 1) {
  const item = fixtures.find((entry) => entry.room.game_id === game)!;
  const room = mapRoom(item.room);
  const match = room.game!;
  return {
    room,
    match,
    selfId: match.players[index].id,
    other: match.players[1 - index].id,
    pending: false,
    onAction: () => undefined,
  };
}

const text = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');

describe('Board tables speak to each seat about its own position', () => {
  it('never tells a Checkers loser that the opponent is stuck', () => {
    for (const index of [0, 1] as const) {
      const props = seat('checkers', index);
      const loserIsSelf = index === 1;
      props.match.phase = 'finished';
      props.match.currentPlayer = null;
      props.match.actions = [];
      props.match.winners = [props.match.players[0].id];
      props.match.message = 'Ivory has no legal move left, so Coral wins.';
      props.match.detail = { ...props.match.detail, outcome_reason: 'no-legal-move' };
      const html = text(renderToStaticMarkup(<BoardTable {...props} />));
      expect(html).not.toContain('The opponent has no legal move');
      expect(html).toContain(
        loserIsSelf
          ? 'You have no legal move left.'
          : `${playerName(props.room, props.match.players[1].id)} has no legal move left.`,
      );
    }
  });

  it('shows the waiting seat who it is waiting for, not the mover’s instruction', () => {
    const props = seat('reversi', 0);
    props.match.currentPlayer = props.other;
    props.match.actions = [];
    const html = text(renderToStaticMarkup(<BoardTable {...props} />));
    expect(html).toContain(`Waiting for ${playerName(props.room, props.other)} (White).`);
    expect(html).toContain('You play Black');
    expect(html).not.toContain('Choose a marked square');
  });

  it('tells the Reversi passer their turn was skipped', () => {
    const props = seat('reversi', 1);
    props.match.currentPlayer = props.other;
    props.match.actions = [];
    props.match.detail = { ...props.match.detail, passed: props.selfId, last_flips: [27] };
    const html = text(renderToStaticMarkup(<BoardTable {...props} />));
    expect(html).toContain('You had no legal placement, so your turn was skipped.');
  });

  it('auto-selects the only Checkers piece that can move and rotates the second seat', () => {
    const props = seat('checkers', 1);
    const source = props.match.community.findIndex((cell) => cell.value === '2');
    props.match.currentPlayer = props.selfId;
    props.match.actions = [
      {
        label: 'Jump A1 to C3',
        value: { type: 'move', choice: `${source}:0` },
      } as (typeof props.match.actions)[number],
    ];
    props.match.detail = { ...props.match.detail, forced: source };
    const html = renderToStaticMarkup(<BoardTable {...props} />);
    expect(html).toContain('Keep jumping with the piece on');
    expect(html).toMatch(new RegExp(`data-cell="${source}"[^>]*aria-pressed="true"`));
    // The second seat's own pieces start at the bottom: square 63 is drawn first.
    expect(html.indexOf('data-cell="63"')).toBeLessThan(html.indexOf('data-cell="0"'));
  });

  it('puts the viewer’s Mancala row and store nearest to them', () => {
    const props = seat('mancala', 1);
    props.match.currentPlayer = props.other;
    props.match.actions = [];
    props.match.detail = {
      ...props.match.detail,
      last_capture: { pit: 4, opposite: 8, seeds: 5 },
    };
    const html = renderToStaticMarkup(<MancalaTable {...props} />);
    const rows = [...html.matchAll(/aria-label="[^"]*· Pit (\d)/g)].map((match) => match[1]);
    // Far row first (the opponent's pits 6..1), then the viewer's pits 1..6.
    expect(rows.slice(0, 6)).toEqual(['6', '5', '4', '3', '2', '1']);
    expect(text(html)).toContain(
      `${playerName(props.room, props.other)} captured 5 seeds, emptying your pit 2.`,
    );
  });

  it('names the boop winner to the loser and keeps the waiting seat instruction-free', () => {
    const props = seat('boop', 1);
    props.match.phase = 'finished';
    props.match.currentPlayer = null;
    props.match.actions = [];
    props.match.winners = [props.other];
    props.match.message = 'Coral has all eight adult cats on the bed.';
    props.match.detail = {
      ...props.match.detail,
      outcome_reason: 'eight-cats',
      winning_cells: [0],
    };
    const finished = text(renderToStaticMarkup(<BoopTable {...props} />));
    expect(finished).toContain(`${playerName(props.room, props.other)} wins with eight adult cats`);
    expect(finished).not.toContain('You win');
    const waiting = seat('boop', 1);
    waiting.match.currentPlayer = waiting.other;
    waiting.match.actions = [];
    const html = text(renderToStaticMarkup(<BoopTable {...waiting} />));
    expect(html).toContain(`Waiting for ${playerName(waiting.room, waiting.other)}.`);
    expect(html).not.toContain('then a marked square');
  });
});
