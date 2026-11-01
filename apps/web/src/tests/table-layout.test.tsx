import { describe, it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GemDistrictArt, AzulTileArt, TokenArt } from '@games/ui';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { CasinoTable } from '@/games/casino/CasinoTable';
import { playerName } from '@/games/types';

const props = (id: string) => {
  const fixture = fixtures.find((item) => item.room.game_id === id)!;
  const room = mapRoom(fixture.room);
  return {
    room,
    match: room.game!,
    selfId: fixture.selfId,
    onAction: () => undefined,
    pending: false,
  };
};

describe('Compact complete table presentation', () => {
  it('renders the casino decision workspace before its table and does not invent undealt cards', () => {
    const p = props('blackjack');
    const html = renderToStaticMarkup(<CasinoTable {...p} />);
    expect(html.indexOf('casino-controls')).toBeLessThan(html.indexOf('class="casino-table"'));
    expect(html).not.toContain('class="seat-cards"');
  });
  it('shows the viewer’s poker cards once rather than repeating them at a seat', () => {
    const p = props('holdem');
    const html = renderToStaticMarkup(<CasinoTable {...p} />);
    for (const card of p.match.hand)
      expect(html.match(new RegExp(`aria-label="${card.label}"`, 'g'))).toHaveLength(1);
  });
  it('keeps split blackjack hands, bets and the current decision distinct', () => {
    const p = props('blackjack');
    const cards = props('holdem').match.hand;
    const html = renderToStaticMarkup(
      <CasinoTable
        {...p}
        match={{
          ...p.match,
          detail: {
            ...p.match.detail,
            dealer_hidden: true,
            hand_index: 1,
            hands: [
              { cards: [cards[0]], bet: 2 },
              { cards: [cards[1]], bet: 4 },
            ],
          },
        }}
      />,
    );
    expect(html).toContain('aria-label="Hand 1"');
    expect(html).toContain('aria-label="Hand 2, active"');
    expect(html).toContain('2 chips bet');
    expect(html).toContain('4 chips bet');
    expect(html).toContain('aria-label="Face-down card"');
  });
  it('maps all district, ceramic and token pieces to distinct complete artwork cells', () => {
    const districts = ['pearl', 'sapphire', 'ruby', 'emerald', 'onyx'].flatMap((color) =>
      [1, 2, 3].map((tier) => renderToStaticMarkup(<GemDistrictArt color={color} tier={tier} />)),
    );
    districts.push(renderToStaticMarkup(<GemDistrictArt color="gold" patron />));
    const tiles = ['blue', 'yellow', 'red', 'black', 'white', 'first'].map((color) =>
      renderToStaticMarkup(<AzulTileArt color={color} />),
    );
    const tokens = (['coral', 'gold', 'ivory', 'ink', 'marble', 'poker'] as const).map((kind) =>
      renderToStaticMarkup(<TokenArt kind={kind} />),
    );
    for (const set of [districts, tiles, tokens]) {
      const boxes = set.map((html) => html.match(/viewBox="([^"]+)"/)?.[1]);
      expect(new Set(boxes).size).toBe(set.length);
      expect(set.every((html) => html.includes('xMidYMid meet'))).toBe(true);
      expect(
        set.every((html) => html.includes('<clipPath') && html.includes('clip-path="url(#')),
      ).toBe(true);
    }
    expect(tiles[4]).toContain('viewBox="512 512 512 512"');
  });
  it('labels custom player-name displays as bots without altering ordinary names', () => {
    const p = props('uno');
    const member = p.room.members[0];
    expect(playerName(p.room, member.id)).toBe(member.name);
    expect(
      playerName(
        { ...p.room, members: p.room.members.map((m) => ({ ...m, isBot: m.id === member.id })) },
        member.id,
      ),
    ).toBe(`${member.name} (Bot)`);
  });
});
