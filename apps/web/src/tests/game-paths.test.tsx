import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { games } from '@games/api-client/catalog';
import { gamePath, readingPath, roomPath } from '@/shared/game-paths';
import { RoomShortcut } from '@/features/lounge/RoomShortcut';

describe('Named game navigation', () => {
  it('gives every registered game a distinct public entry and session route', () => {
    expect(new Set(games.map((game) => gamePath(game.id))).size).toBe(games.length);
    for (const game of games) {
      expect(gamePath(game.id)).toBe(`/games/${game.id}`);
      expect(roomPath({ id: 'saved-session', gameId: game.id })).toBe(
        `/games/${game.id}/${game.playMode === 'solo' ? 'play' : 'rooms'}/saved-session`,
      );
    }
  });

  it('keeps the same group ID when its authoritative game changes', () => {
    const before = { id: 'same-group', gameId: 'uno' };
    const after = { ...before, gameId: 'checkers' };
    expect(roomPath(before)).toBe('/games/uno/rooms/same-group');
    expect(roomPath(after)).toBe('/games/checkers/rooms/same-group');
    expect(readingPath('original-match')).toBe('/games/tarot/readings/original-match');
  });

  it('does not let a name or opaque ID become executable or change route segments', () => {
    expect(roomPath({ id: 'a/b?next=/profile#x', gameId: 'uno' })).toBe(
      '/games/uno/rooms/a%2Fb%3Fnext%3D%2Fprofile%23x',
    );
    expect(() => gamePath('javascript:alert(1)')).toThrow('Unknown game');
    expect(() => readingPath('..')).toThrow('Invalid game link');
    expect(() => roomPath({ id: '', gameId: 'tarot' })).toThrow('Invalid game link');
  });

  it('presents a private Tarot shortcut without room names, occupancy or an invite', () => {
    const html = renderToStaticMarkup(
      <RoomShortcut
        room={{
          id: 'private-reading',
          gameId: 'tarot',
          name: 'Internal session label',
          status: 'playing',
          players: 1,
        }}
      />,
    );
    expect(html).toContain('/games/tarot/play/private-reading');
    expect(html).toContain('Your reading');
    expect(html).toContain('In progress');
    expect(html).not.toContain('Internal session label');
    expect(html).not.toContain('in room');
    expect(html).not.toContain('/join/');
  });
});
