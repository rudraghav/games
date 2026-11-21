import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { BoardTable } from '@/games/board/BoardTable';
import { MancalaTable } from '@/games/board/MancalaTable';
import { PartyTable } from '@/games/party/PartyTable';
import { mancalaExtras } from '@/games/board/details';

/** The legal position reached by a scenario's recorded move, seen by its viewer. */
function after(id: string) {
  const fixture = midgameScenarios.find((item) => item.id === id)!;
  const room = mapRoom({
    ...fixture.room,
    game: fixture.next.game,
    match_version: fixture.step + 1,
  });
  return { room, match: room.game!, selfId: fixture.selfId, pending: false, onAction: () => {} };
}
const squares = (html: string) =>
  html.match(/<(?:div|button)[^>]*class="board-square"[^>]*>/g) || [];

describe('Piece motion replays only the public result of the last move', () => {
  it('drops the new Four in a Row disc from above its own row', () => {
    const props = after('four-in-a-row-2-17-8');
    const last = Number(props.match.detail.last_move);
    const moved = squares(renderToStaticMarkup(<BoardTable {...props} />)).filter((tag) =>
      tag.includes('--drop-rows'),
    );
    expect(moved).toHaveLength(1);
    expect(moved[0]).toContain(`--drop-rows:${Math.floor(last / 7) + 1}`);
    expect(moved[0]).toContain('data-last="true"');
    expect(moved[0]).toContain('data-tip="Last disc dropped"');
  });

  it('slides the moved checker from its old square and tints only the captured square', () => {
    const props = after('checkers-2-17-3');
    const detail = props.match.detail;
    const html = renderToStaticMarkup(<BoardTable {...props} />);
    const moved = squares(html).filter((tag) => tag.includes('--from-dx'));
    expect(moved).toHaveLength(1);
    // A jump crosses two squares on both axes.
    expect(moved[0]).toMatch(/--from-dx:-?2;--from-dy:-?2/);
    const captured = squares(html).filter((tag) => tag.includes('data-captured-color'));
    expect(captured).toHaveLength(1);
    expect(captured[0]).toContain(`data-cell="${detail.last_captured}"`);
    // The lift-away shows the colour that lost the piece, never the mover's.
    const mover = props.match.community[Number(detail.last_move)].color;
    expect(captured[0]).toContain(`data-captured-color="${mover === 'coral' ? 'ivory' : 'coral'}"`);
    expect(captured[0]).toContain('data-tip="A piece was captured here"');
  });

  it('marks kings so the stacked piece and its tooltip never rest on the crown alone', () => {
    const html = renderToStaticMarkup(<BoardTable {...after('checkers-2-17-25')} />);
    expect(html).toContain('data-king="true"');
    expect(html).toContain('King: moves and jumps diagonally in every direction');
  });

  it('names flipped Reversi discs and keeps every disc keyed to its public colour', () => {
    const props = after('reversi-2-17-8');
    const flips = (props.match.detail.last_flips as number[]).length;
    const html = renderToStaticMarkup(<BoardTable {...props} />);
    expect(html.match(/data-tip="Flipped by the last placement"/g)).toHaveLength(flips);
    expect(html.match(/data-tip="Last placement"/g)).toHaveLength(1);
  });

  it('numbers the Mancala sowing path in order from the source to the landing pit', () => {
    const props = after('mancala-2-17-8');
    const { lastSource } = mancalaExtras(props.match.detail);
    const landed = Number(props.match.detail.last_move);
    const html = renderToStaticMarkup(<MancalaTable {...props} />);
    const hops = [...html.matchAll(/--hop:(\d+)/g)].map((match) => Number(match[1]));
    // Pits emptied by a capture hold no seeds to animate; every other step is present once.
    expect(new Set(hops).size).toBe(hops.length);
    expect(Math.min(...hops)).toBe(0);
    const skipped = lastSource! < 7 ? 13 : 6;
    let steps = 0;
    for (let index = lastSource!; index !== landed || steps === 0;) {
      index = (index + 1) % 14;
      if (index !== skipped) steps += 1;
    }
    expect(Math.max(...hops)).toBeLessThan(steps);
    expect(html).toContain('data-tip="The last sowing started here"');
  });

  it('draws Most Likely reveal bars from the public tally only', () => {
    const fixture = midgameScenarios.find((item) => item.id === 'most-likely-3-17-4')!;
    const room = mapRoom(fixture.room);
    const html = renderToStaticMarkup(
      <PartyTable
        room={room}
        match={room.game!}
        selfId={fixture.selfId}
        pending={false}
        onAction={() => {}}
      />,
    );
    const shares = [...html.matchAll(/--share:([\d.]+)/g)].map((match) => Number(match[1]));
    expect(shares).toHaveLength(3);
    expect(shares.reduce((sum, share) => sum + share, 0)).toBeCloseTo(1, 5);
    expect(html.match(/data-share=""/g)).toHaveLength(3);
  });
});
