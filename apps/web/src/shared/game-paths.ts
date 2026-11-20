import { gameById } from '@games/api-client/catalog';

function segment(value: string) {
  if (!value || value === '.' || value === '..') throw new Error('Invalid game link.');
  return encodeURIComponent(value);
}

/** A public game entry. Construct paths from the registered game, never a room name. */
export function gamePath(gameId: string) {
  return `/games/${segment(gameById(gameId).id)}`;
}

/** The server's authorized room projection decides which game this session belongs to. */
export function roomPath(room: { id: string; gameId: string }) {
  const route = gameById(room.gameId).playMode === 'solo' ? 'play' : 'rooms';
  return `${gamePath(room.gameId)}/${route}/${segment(room.id)}`;
}

export function readingPath(matchId: string) {
  return `${gamePath('tarot')}/readings/${segment(matchId)}`;
}
