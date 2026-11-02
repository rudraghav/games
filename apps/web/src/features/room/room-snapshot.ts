import { replaceEqualDeep } from '@tanstack/react-query';
import type { Room } from '@games/api-client';

/** Room revisions also span rematches. Equal revisions may refresh presence. */
export function acceptRoomSnapshot(current: Room | undefined, incoming: Room): Room {
  if (current?.id === incoming.id && current.revision > incoming.revision) return current;
  return replaceEqualDeep(current, incoming);
}
