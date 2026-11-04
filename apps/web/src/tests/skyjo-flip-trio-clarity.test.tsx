import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import type { Match, Room } from '@games/api-client';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { SkyjoTable } from '@/games/skyjo/SkyjoTable';
import { FlipSevenTable } from '@/games/modern/FlipSevenTable';
import { TrioTable } from '@/games/modern/TrioTable';
import type { TableProps } from '@/games/types';

type Activity = Room['activity'][number];

function scenario(id: string) {
  const fixture = midgameScenarios.find((item) => item.id === id)!;
  const room = mapRoom(fixture.room);
  return { room, match: room.game!, selfId: fixture.selfId };
}

/** The same public table seen by another seat: no legal actions and no private draw. */
function waitingSeat(props: ReturnType<typeof scenario>, viewer: string) {
  return { ...props, selfId: viewer, match: { ...props.match, actions: [], drawn: null } };
}

function render(
  Table: (props: TableProps) => React.ReactNode,
  props: { room: Room; match: Match; selfId: string },
) {
  return renderToStaticMarkup(<Table {...props} onAction={() => undefined} pending={false} />);
}

const name = (room: Room, id: string) => room.members.find((member) => member.id === id)!.name;
const move = (actorId: string, type: string): Activity => ({
  version: 1,
  actorId,
  type,
  label: 'Drew from the deck',
  targets: [],
  amount: null,
  cards: [],
  destination: null,
  count: 1,
});

describe('Skyjo tells each seat what it can do and what the table is waiting for', () => {
  it('puts the private draw decision on the table and keeps the drawer’s words to the drawer', () => {
    const actor = scenario('skyjo-2-17-193');
    const html = render(SkyjoTable, actor);
    expect(actor.match.message).toContain('the 4 you drew');
    expect(html).toContain(actor.match.message);
    // Discarding the drawn card is done on the discard pile, never hidden in the dock.
    expect(html).toMatch(
      /<button(?=[^>]*aria-label="Discard &amp; reveal")(?=[^>]*table-pile-button)[^>]*>/,
    );
    expect(html).toContain('aria-label="Final turns"');
    expect(html).toMatch(/closed the round\.<\/strong> Final turns:/);
    const other = actor.match.players.find((player) => player.id !== actor.selfId)!.id;
    const seen = waitingSeat(
      { ...actor, room: { ...actor.room, activity: [move(actor.selfId, 'draw_stock')] } },
      other,
    );
    const waiting = render(SkyjoTable, seen);
    expect(waiting).toContain(
      `${name(actor.room, actor.selfId)} drew from the deck and is deciding where it goes.`,
    );
    expect(waiting).not.toContain('you drew');
    expect(waiting).not.toContain('aria-label="Discard &amp; reveal"');
  });

  it('ranks the round review lowest first and lets only the closer start the next round', () => {
    const closer = scenario('skyjo-8-31-249');
    const html = render(SkyjoTable, closer);
    const scores = [...html.matchAll(/class="skyjo-review-score"><b>(-?\d+)<\/b>/g)].map((m) =>
      Number(m[1]),
    );
    expect(scores).toHaveLength(8);
    expect(scores).toEqual([...scores].sort((a, b) => a - b));
    expect(html).toContain('>Next round<');
    const other = closer.match.players.find((player) => player.id !== closer.selfId)!.id;
    const waiting = render(SkyjoTable, waitingSeat(closer, other));
    expect(waiting).not.toContain('>Next round<');
    expect(waiting).toContain(`Waiting for ${name(closer.room, closer.selfId)} to start round 2.`);
  });

  it('shows every opponent with a coloured summary instead of a one-at-a-time rail', () => {
    const table = scenario('skyjo-8-31-230');
    const html = render(SkyjoTable, table);
    expect(html.match(/class="opponent-panel /g)).toHaveLength(7);
    expect(html).not.toContain('horizontal-rail');
    expect(html).toMatch(/data-band="(negative|zero|low|middle|high)"/);
    expect(html).toContain('Closed the round');
  });
});

describe('Flip 7 targets are chosen on the player rows', () => {
  it('names every eligible target with its consequence and labels your own row', () => {
    const table = scenario('flip-7-10-31-4');
    const html = render(FlipSevenTable, table);
    const dock = html.slice(html.indexOf('aria-label="Your actions"'));
    expect(dock.slice(0, dock.indexOf('</section>'))).not.toContain('Give Freeze');
    const targets = table.match.actions.filter((option) => option.value.type === 'target_effect');
    expect(targets.length).toBe(9);
    for (const option of targets) {
      const id = option.value.target!;
      const stake = (table.match.detail.at_risk as Record<string, number>)[id];
      const label =
        id === table.selfId
          ? `Give Freeze to yourself: bank your ${stake}`
          : `Give Freeze to ${name(table.room, id)}: banks ${stake}`;
      expect(html).toContain(`aria-label="${label}"`);
    }
    expect(html).toContain('>Freeze yourself<');
  });

  it('warns a waiting candidate and never shows them the chooser’s instruction', () => {
    const table = scenario('flip-7-10-31-4');
    const candidate = table.match.players.find(
      (player) =>
        player.id !== table.selfId &&
        (table.match.detail.status as Record<string, string>)[player.id] === 'active',
    )!.id;
    const html = render(FlipSevenTable, waitingSeat(table, candidate));
    expect(html).toContain(
      `${name(table.room, table.selfId)} is choosing who receives Freeze. You could be frozen`,
    );
    expect(html).not.toContain('Choose a player in the rows below.');
    expect(html).not.toContain('aria-label="Give Freeze');
  });

  it('shows the repeated number that busted a player and who froze whom', () => {
    const table = scenario('flip-7-3-17-20-crowded');
    const busted = table.match.players.find(
      (player) => (table.match.detail.status as Record<string, string>)[player.id] === 'busted',
    )!;
    const html = render(FlipSevenTable, table);
    expect(html).toMatch(/Busted on \d+/);
    expect(html.match(/data-duplicate="true"/g)!.length).toBeGreaterThanOrEqual(2);
    const frozen = render(FlipSevenTable, {
      ...table,
      match: {
        ...table.match,
        detail: {
          ...table.match.detail,
          effects: [{ card: 'Freeze', by: table.selfId, to: busted.id }],
        },
      },
    });
    expect(frozen).toContain('Frozen by you');
  });
});

describe('Trio reveals say whose card it was and stay with the request', () => {
  it('labels reveals by owner and hand end, and tells waiting seats whom they wait for', () => {
    const table = scenario('trio-6-31-2');
    const actor = render(TrioTable, table);
    expect(actor).toContain('You are looking for another 7.');
    const other = table.match.players.find((player) => player.id !== table.selfId)!.id;
    const own = {
      ...table,
      match: {
        ...table.match,
        detail: {
          ...table.match.detail,
          revealed: [
            ...(table.match.detail.revealed as object[]),
            {
              owner: other,
              slot: -1,
              edge: 'low',
              card: (table.match.detail.revealed as { card: object }[])[0].card,
            },
          ],
        },
      },
    };
    const target = render(TrioTable, waitingSeat(own, other));
    expect(target).toMatch(
      /class="trio-reveal-owner" title="You">You<\/span><span class="trio-reveal-edge">lowest<\/span>/,
    );
    expect(target).toContain(`Waiting for ${name(table.room, table.selfId)}.`);
    expect(target).not.toContain('Reveal a table position or request');
  });

  it('keeps Continue beside the reviewed cards and closes the dock at the end of the match', () => {
    const review = scenario('trio-3-17-3');
    const html = render(TrioTable, review);
    const strip = html.slice(html.indexOf('class="trio-reveals"'));
    expect(strip.slice(0, strip.indexOf('</section>'))).toContain('>Continue<');
    const finished = render(TrioTable, {
      ...review,
      match: {
        ...review.match,
        phase: 'finished',
        actions: [],
        currentPlayer: null,
        winners: [review.selfId],
      },
    });
    expect(finished).not.toContain('Trio turn review');
    expect(finished).toContain('You collected the winning trio.');
  });
});
