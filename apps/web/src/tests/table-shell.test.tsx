import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import type { Room } from '@games/api-client';
import { Seat } from '@games/ui';
import { fixtures } from '@/stories/generated/rooms';
import { PlayerStrip } from '@/games/shared/PlayerStrip';
import { distinctNames, seatName, shortName } from '@/games/shared/seat-names';
import { describeMove } from '@/features/room/move-description';

const fixture = fixtures.find((item) => item.label === 'Uno · maximum seats')!;
const room = mapRoom(fixture.room);
const match = room.game!;
const selfId = fixture.selfId;

describe('Seat names stay distinguishable', () => {
  it('keeps the start and end of long names around a middle ellipsis', () => {
    expect(shortName('Dev')).toBe('Dev');
    expect(shortName('Alexandra-Catherine Montgomery')).toBe('Alexandra…​Montgomery');
    expect(shortName('Bartholomew Fitzgerald-Smythe')).toBe('Bartholomew…​Smythe');
  });
  it('keeps full names when shortened labels would collide', () => {
    const names = ['Alexandra with a rather long name', 'Alexandra with another long name'];
    expect(new Set(distinctNames(names)).size).toBe(2);
    expect(distinctNames(names)).toEqual(names);
    expect(distinctNames(['Guinevere Rosalind Whitchurch', 'Dev'])).toEqual([
      'Guinevere…​Whitchurch',
      'Dev',
    ]);
  });
  it('drops the bot prefix because the seat marks bots itself', () => {
    expect(seatName({ name: 'Bot Ada', isBot: true })).toBe('Ada');
    expect(seatName({ name: 'Bot Ada', isBot: false })).toBe('Bot Ada');
    expect(seatName(undefined)).toBe('Player');
  });
});

describe('Seat', () => {
  it('keeps a disconnected player’s public count beside the reconnecting status', () => {
    const html = renderToStaticMarkup(
      <Seat name="Mira" caption="7 cards" connected={false} compact />,
    );
    expect(html).toContain('Reconnecting · 7 cards');
    expect(renderToStaticMarkup(<Seat name="Mira" connected={false} />)).toContain('Reconnecting…');
  });
  it('shows a short label and badge while the title keeps the full name', () => {
    const html = renderToStaticMarkup(
      <Seat name="Bot Ada" bot displayName="Ada" caption="2 cards" badge="Next" />,
    );
    expect(html).toContain('title="Bot Ada"');
    expect(html).toContain('<span class="seat-name">Ada</span>');
    expect(html).toContain('<b class="seat-badge">Next</b>2 cards');
    expect(html).toContain('<span class="seat-kind-label">Bot</span>');
  });
});

describe('Player strip', () => {
  const players = match.players.map((player) => player.id);
  const ownIndex = players.indexOf(selfId);

  it('seats the viewer first, then the others in turn order, with one tab stop', () => {
    const current = players[(ownIndex + 3) % players.length];
    const html = renderToStaticMarkup(
      <PlayerStrip match={{ ...match, currentPlayer: current }} room={room} selfId={selfId} />,
    );
    const order = [...html.matchAll(/data-player="([^"]+)"/g)].map((found) => found[1]);
    expect(order).toEqual([...players.slice(ownIndex), ...players.slice(0, ownIndex)]);
    expect(html).toContain('<span class="seat-name">You</span>');
    expect(html).toContain('data-pinned="true"');
    expect(html.match(/tabindex="0"/g)).toHaveLength(1);
    expect(html).toMatch(new RegExp(`data-player="${current}"[^>]*data-rail-reveal="true"`));
    expect(html).toMatch(/aria-label="[^"]*\(you\)[^"]*"/);
    expect(html).toContain('current turn');
  });

  it('marks play direction and the next player when the game publishes them', () => {
    const next = players[(ownIndex + 1) % players.length];
    const html = renderToStaticMarkup(
      <PlayerStrip
        match={{ ...match, detail: { ...match.detail, direction: -1, next_player: next } }}
        room={room}
        selfId={selfId}
      />,
    );
    expect(html).toContain('data-direction="-1"');
    expect(html.match(/class="seat-badge">Next</g)).toHaveLength(1);
    const finished = renderToStaticMarkup(
      <PlayerStrip
        match={{
          ...match,
          phase: 'finished',
          detail: { ...match.detail, direction: 1, next_player: next },
        }}
        room={room}
        selfId={selfId}
      />,
    );
    expect(finished).not.toContain('data-direction');
    expect(finished).not.toContain('seat-badge');
  });

  it('counts in singular and plural and keeps counts for reconnecting players', () => {
    const other = players.find((id) => id !== selfId)!;
    const html = renderToStaticMarkup(
      <PlayerStrip
        match={{
          ...match,
          players: match.players.map((player) =>
            player.id === other ? { ...player, count: 1 } : player,
          ),
        }}
        room={{
          ...room,
          members: room.members.map((member) =>
            member.id === other ? { ...member, connected: false } : member,
          ),
        }}
        selfId={selfId}
      />,
    );
    expect(html).toContain('Reconnecting · 1 card<');
    expect(html).not.toContain('1 cards');
  });
});

describe('Last move line', () => {
  const other = room.members.find((member) => member.id !== selfId)!;
  const move = {
    version: 4,
    actorId: other.id,
    type: 'play',
    label: 'Played',
    targets: [selfId],
    cards: [{ id: 'red:7:0', label: 'Red 7' }],
    amount: null,
    destination: null,
    count: null,
  } as unknown as Room['activity'][number];
  it('attributes an ordinary move to its player and names the viewer as you', () => {
    expect(describeMove(room, move, selfId)).toBe(`${other.name} played: Red 7 → you`);
    expect(describeMove(room, { ...move, actorId: selfId, targets: [] }, selfId)).toBe(
      'You played: Red 7',
    );
  });
  it('reads a table-wide event as its own sentence', () => {
    const reveal = { ...move, label: 'Everyone’s numbers were revealed', targets: [] };
    expect(describeMove(room, reveal, selfId)).toBe('Everyone’s numbers were revealed: Red 7');
  });
});
