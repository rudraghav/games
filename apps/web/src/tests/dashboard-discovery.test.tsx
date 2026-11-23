import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GameTile } from '@games/ui';
import { gameById, games } from '@games/api-client/catalog';
import { roomInvite } from '@/shared/room-invite';
import { GameArt } from '@/shared/GameArt';
import { findGames } from '@/features/lounge/catalogue-search';
import { RoomShortcut } from '@/features/lounge/RoomShortcut';
import { GameLibrary } from '@/features/lounge/GameLibrary';

describe('Dashboard discovery and private room entry', () => {
  it('lists the complete catalogue once, in discovery order, with no featured banner', () => {
    const html = renderToStaticMarkup(<GameLibrary />);
    const choices = [...html.matchAll(/aria-label="Open ([^"]+)"/g)].map((match) =>
      match[1].replaceAll('&amp;', '&'),
    );
    expect(choices).toHaveLength(games.length);
    expect(new Set(choices).size).toBe(games.length);
    // The first four discovery slots.
    expect(choices.slice(0, 4)).toEqual(['The Gang', 'Shithead', 'Sea Salt & Paper', 'boop.']);
    expect(choices).toEqual(findGames(games, '', 0, 'all').map((game) => game.name));
    for (const game of games) expect(html).toContain(`href="/games/${game.id}"`);
    // Pop Tarot is one tile among the others, with its own cover.
    expect(html).toContain('aria-label="Open Pop Tarot"');
    expect(html).toContain('href="/games/tarot"');
    expect(html).toContain('The Magician');
    expect(html).toContain('The High Priestess');
    expect(html).toContain('The Fool');
    expect(html).not.toContain('data-variant="featured"');
    expect(html).not.toContain('Featured');
    expect(html).not.toContain('Start reading');
  });
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
    expect(art).toContain('/playing-cards/web/10_of_diamonds.webp');
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
    expect(html).toContain('/games/uno/rooms/private-room-id');
    expect(html).toContain('Open Friday table, Uno');
    expect(html).toContain('In progress');
    expect(html).toContain('3 in room');
    expect(html).not.toContain('/join/');
  });
});
