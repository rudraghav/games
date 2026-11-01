import type { Action, Match, Room } from '@games/api-client';
export interface TableProps {
  match: Match;
  room: Room;
  selfId: string;
  onAction: (action: Action) => void;
  pending: boolean;
  imageLoader?: (path: string) => string;
}
export function playerName(room: Room, id: string) {
  return room.members.find((member) => member.id === id)?.name || 'Player';
}
