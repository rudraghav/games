import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { fixtures } from '@/stories/generated/rooms';
import { mapRoom } from '@games/api-client/mappers';
import { shitheadDetails, type Card } from '@games/api-client';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { ShitheadTable } from '@/games/shithead/ShitheadTable';
import type { TableProps } from '@/games/types';

function props(): TableProps {
  const fixture = fixtures.find((f) => f.room.game_id === 'shithead' && f.room.capacity === 2)!;
  const room = mapRoom(fixture.room);
  return {
    room,
    match: room.game!,
    selfId: fixture.selfId,
    pending: false,
    onAction: () => undefined,
  };
}
describe('Shithead public and private zones', () => {
  it('renders six own setup cards and only anonymous backs for every hidden slot', () => {
    const p = props();
    const html = renderToStaticMarkup(<ShitheadTable {...p} />);
    expect(p.match.hand).toHaveLength(6);
    // Own anonymous slots stay on the board; opponents use a public summary
    // until their explicit inspector opens. No hidden identities are mounted.
    expect(html.match(/playing-card--back/g) || []).toHaveLength(3);
    const opponent = p.room.members.find((member) => member.id !== p.selfId)!;
    expect(html).toContain(`aria-label="Inspect ${opponent.name}"`);
    expect(html).toContain('3 hidden table cards');
    expect(html).toContain('Choose your table cards');
    expect(html).toContain('Not chosen yet');
    expect(html).toContain('Keep selected three face-up');
    expect(html).toContain('2 · reset');
    expect(html).toContain('10 · burn');
    expect(html).not.toContain('7 · low');
    expect(html).not.toContain('3 · transparent');
    expect(shitheadDetails(p.match.detail).hidden_slots[p.selfId]).toEqual([true, true, true]);
  });
  it('validates public hidden-slot shape and exposes no face-down identity field', () => {
    const p = props();
    expect(() =>
      shitheadDetails({ ...p.match.detail, hidden_slots: { [p.selfId]: ['AS:0', true, false] } }),
    ).toThrow();
    const data = shitheadDetails(p.match.detail);
    expect(
      Object.values(data.hidden_slots)
        .flat()
        .every((v) => typeof v === 'boolean'),
    ).toBe(true);
    expect(data.loser).toBeNull();
  });
  it('reserves decision space only for available controls, not waiting or blind-card phases', () => {
    const p = props();
    const active = renderToStaticMarkup(<ShitheadTable {...p} />);
    expect(active).toContain('aria-label="Your Shithead actions"');
    for (const stage of ['hand', 'face_down', 'out']) {
      const html = renderToStaticMarkup(
        <ShitheadTable
          {...p}
          match={{
            ...p.match,
            actions: [],
            detail: {
              ...p.match.detail,
              stages: { ...shitheadDetails(p.match.detail).stages, [p.selfId]: stage },
            },
          }}
        />,
      );
      expect(html).not.toContain('aria-label="Your Shithead actions"');
      expect(html).toContain('aria-label="Your table cards"');
    }
  });
  it('labels the last player rather than inventing points or a first-place winner', () => {
    const p = props();
    const loser = p.match.players[1].id;
    const html = renderToStaticMarkup(
      <ShitheadTable
        {...p}
        match={{
          ...p.match,
          phase: 'finished',
          currentPlayer: null,
          actions: [],
          winners: [p.selfId],
          detail: { ...p.match.detail, finish_order: [p.selfId], loser },
        }}
      />,
    );
    const loserName = p.room.members.find((member) => member.id === loser)!.name;
    expect(html).toContain(`${loserName} is the Shithead: the last player holding cards.`);
    // Escape order first, the loser last; never waiting copy once it is over.
    expect(html).toMatch(/aria-label="Escape order"><li>You<\/li><li data-last="true">/);
    expect(html).not.toContain('Waiting for');
    expect(html).not.toContain('0 points');
    const lost = renderToStaticMarkup(
      <ShitheadTable
        {...p}
        selfId={loser}
        match={{
          ...p.match,
          phase: 'finished',
          currentPlayer: null,
          actions: [],
          winners: [p.selfId],
          detail: { ...p.match.detail, finish_order: [p.selfId], loser },
        }}
      />,
    );
    expect(lost).toContain('You’re the Shithead');
  });
});

function playing(): TableProps {
  const fixture = midgameScenarios.find((item) => item.id === 'shithead-2-17-3')!;
  const room = mapRoom(fixture.room);
  return { room, match: room.game!, selfId: fixture.selfId, pending: false, onAction: () => {} };
}
const face = (id: string, value: string, suit = '♠'): Card => ({
  id,
  label: `${value} ${suit}`,
  value,
  suit,
  color: suit === '♠' || suit === '♣' ? 'ink' : 'red',
  subtitle: '',
  colors: [],
  effect: '',
  setName: null,
  setSize: null,
  rentLadder: [],
});

describe('Shithead decisions read at a glance', () => {
  it('dims cards that cannot beat the pile and explains a disabled play', () => {
    const p = playing();
    const [low, high, other] = p.match.hand;
    const nine = face('9S:1', '9');
    const html = renderToStaticMarkup(
      <ShitheadTable
        {...p}
        match={{
          ...p.match,
          discard: nine,
          community: [nine],
          actions: p.match.actions
            .filter((option) => option.value.cards?.[0] === high.id)
            .concat([
              {
                ...p.match.actions[0],
                label: 'Take the pile',
                value: { ...p.match.actions[0].value, type: 'pickup', cards: [] },
              },
            ]),
          detail: { ...p.match.detail, comparison_rank: '9', pile_count: 1 },
        }}
      />,
    );
    expect(html).toContain('Match or beat 9');
    expect(html).toMatch(new RegExp(`data-playable="true"[^>]*aria-label="${high.label}"`));
    for (const card of [low, other])
      expect(html).toMatch(new RegExp(`data-playable="false"[^>]*aria-label="${card.label}"`));
    expect(html).toContain('Play 9 or higher, or a 2 or 10 from your hand');
  });

  it('shows a run of equal ranks on the pile and why the last burn happened', () => {
    const p = playing();
    const fives = [face('5H:0', '5', '♥'), face('5D:0', '5', '♦'), face('5S:0', '5')];
    const opponent = p.match.players.find((player) => player.id !== p.selfId)!;
    const html = renderToStaticMarkup(
      <ShitheadTable
        {...p}
        match={{
          ...p.match,
          discard: fives[2],
          community: [face('KD:0', 'K', '♦'), ...fives],
          detail: { ...p.match.detail, comparison_rank: '5', pile_count: 4 },
        }}
      />,
    );
    expect(html).toContain('5 ×3 on top: one more 5 burns');
    expect(
      html.match(/shithead-pile-top[\s\S]*?<\/div><div>/)![0].match(/playing-card /g),
    ).toHaveLength(3);
    const ten = face('TS:0', '10');
    const burned = renderToStaticMarkup(
      <ShitheadTable
        {...p}
        match={{
          ...p.match,
          currentPlayer: opponent.id,
          actions: [],
          detail: {
            ...p.match.detail,
            last_play: { player: opponent.id, type: 'burn', count: 1, burned: 6, cards: [ten] },
          },
        }}
      />,
    );
    const name = p.room.members.find((member) => member.id === opponent.id)!.name;
    expect(burned).toContain(`${name} burned 6 cards with a 10.`);
    expect(burned).toContain('plays again');
  });

  it('puts face-up cards above the dock and explains the face-up pickup', () => {
    const p = playing();
    const faceUp = [face('5D:9', '5', '♦'), face('6H:9', '6', '♥')];
    const html = renderToStaticMarkup(
      <ShitheadTable
        {...p}
        match={{
          ...p.match,
          hand: [],
          players: p.match.players.map((player) =>
            player.id === p.selfId ? { ...player, cards: faceUp } : player,
          ),
          actions: faceUp.map((card) => ({
            ...p.match.actions[0],
            label: `Take pile with ${card.label}`,
            value: { ...p.match.actions[0].value, type: 'pickup', cards: [], card: card.id },
          })),
          detail: {
            ...p.match.detail,
            stages: { ...shitheadDetails(p.match.detail).stages, [p.selfId]: 'face_up' },
            comparison_rank: 'A',
            pile_count: 4,
          },
        }}
      />,
    );
    expect(html).toContain(
      'No face-up card beats A. Choose one to add to the pile; you then take all 5 cards.',
    );
    const table = html.indexOf('aria-label="Your table cards"');
    expect(table).toBeGreaterThan(html.indexOf('aria-label="Your cards and decisions"'));
    expect(table).toBeLessThan(html.indexOf('aria-label="Your Shithead actions"'));
    expect(html.match(/aria-label="Your table cards"/g)).toHaveLength(1);
  });

  it('wraps a long hand so every card stays on screen, and counts it in the heading', () => {
    const fixture = midgameScenarios.find((item) => item.id === 'shithead-2-1-32-crowded')!;
    const room = mapRoom(fixture.room);
    const html = renderToStaticMarkup(
      <ShitheadTable
        room={room}
        match={room.game!}
        selfId={fixture.selfId}
        pending={false}
        onAction={() => {}}
      />,
    );
    expect(html).toContain('data-density="fan"');
    expect(html).toContain(`· ${room.game!.hand.length} cards`);
  });
});
