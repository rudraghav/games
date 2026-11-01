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
  const member = room.members.find((item) => item.id === id);
  return member
    ? `${member.name}${member.isBot && !/^bot\b/i.test(member.name) ? ' (Bot)' : ''}`
    : 'Player';
}
