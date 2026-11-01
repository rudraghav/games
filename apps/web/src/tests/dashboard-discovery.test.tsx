import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GameTile } from '@games/ui';
import { gameById } from '@games/api-client/catalog';
import { roomInvite } from '@/shared/room-invite';
import { GameArt } from '@/shared/GameArt';
import { findGames } from '@/features/lounge/catalogue-search';
import { RoomShortcut } from '@/features/lounge/RoomShortcut';

describe('Dashboard discovery and private room entry', () => {
  it('accepts raw codes and shared invite links without following the URL', () => {
    const token = 'A_private_invite_token_1234567890';
    expect(roomInvite('  ABCD1234  ')).toBe('ABCD1234');
    expect(roomInvite(token)).toBe(token);
    expect(roomInvite(`https://games-seven-black.vercel.app/join/${token}?from=friend#room`)).toBe(
      token,
    );
    expect(roomInvite(`/join/${token}/`)).toBe(token);
    for (const input of ['javascript:alert(1)', 'https://example.com/not-a-room', '/join/bad%ZZ'])
      expect(() => roomInvite(input)).toThrow('Enter a room code or invite link.');
  });
  it('labels solo matches truthfully without replacing the original player limits', () => {
    const solo = renderToStaticMarkup(
      <GameTile
        name="Uno"
        subtitle="Match colours and numbers"
        minPlayers={2}
        maxPlayers={10}
        minutes="15–30"
        tone="sage"
        artwork={null}
        soloMode
        onChoose={() => undefined}
      />,
    );
    const friends = renderToStaticMarkup(
      <GameTile
        name="Uno"
        subtitle="Match colours and numbers"
        minPlayers={2}
        maxPlayers={10}
        minutes="15–30"
        tone="sage"
        artwork={null}
        onChoose={() => undefined}
      />,
    );
    expect(solo).toContain('You + bots');
    expect(friends).toContain('2–10 players');
  });
  it('uses real action art and original pieces in the catalogue covers', () => {
    const classic = renderToStaticMarkup(<GameArt game={gameById('uno')} />);
    expect(classic).toContain('Reverse');
    expect(classic).not.toContain('↻');
    const rent = renderToStaticMarkup(<GameArt game={gameById('deal')} />);
    expect(rent).toContain('data-effect="rent"');
    expect(rent).toContain('data-property-color="green"');
    expect(rent).toContain('data-property-color="blue"');
    expect(rent).not.toContain('legacy-action');
    const mercy = renderToStaticMarkup(<GameArt game={gameById('deal-no-mercy')} />);
    expect(mercy).toContain('data-effect="yoink"');
    expect(renderToStaticMarkup(<GameArt game={gameById('azul')} />)).toContain(
      'ceramic-tiles-v1.webp',
    );
    expect(renderToStaticMarkup(<GameArt game={gameById('checkers')} />)).toContain(
      'board-tokens-v1.webp',
    );
    expect(renderToStaticMarkup(<GameArt game={gameById('blackjack')} />)).toContain(
      'casino-cover-chips',
    );
  });
  it('discovers Shithead through its familiar names and still intersects category filters', () => {
    const game = gameById('shithead');
    expect(findGames([game], 'palace', 2, 'cards')).toEqual([game]);
    expect(findGames([game], 'shit head', 2, 'cards')).toEqual([game]);
    expect(findGames([game], 'palace', 2, 'boards')).toEqual([]);
    const art = renderToStaticMarkup(<GameArt game={game} />);
    expect(art).toContain('palace-cover-row--backs');
    expect(art).toContain('/playing-cards/10_of_diamonds.svg');
  });
  it('gives returning members a readable room shortcut without exposing an invite', () => {
    const html = renderToStaticMarkup(
      <RoomShortcut
        room={{
          id: 'private-room-id',
          name: 'Friday table',
          gameId: 'uno',
          status: 'playing',
          players: 3,
        }}
      />,
    );
    expect(html).toContain('/rooms/private-room-id');
    expect(html).toContain('Open Friday table, Uno');
    expect(html).toContain('In progress');
    expect(html).toContain('3 in room');
    expect(html).not.toContain('/join/');
  });
});
