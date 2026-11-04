import type { Room } from '@games/api-client';
import { gameById } from '@games/api-client/catalog';

type PublicMove = Room['activity'][number];

const listNames = (names: string[]) =>
  names.length <= 2
    ? names.join(' and ')
    : `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;

const TABLE_EVENT = /^(Everyone|Everybody|All|No one|Nobody|The)\b/;

/** One plain line from the public move history: who did what, with which public cards. */
export function describeMove(room: Room, move: PublicMove, selfId: string) {
  const family = gameById(room.gameId).family;
  const name = (id: string, start = false) =>
    id === selfId
      ? start
        ? 'You'
        : 'you'
      : room.members.find((member) => member.id === id)?.name || 'A player';
  // A table-wide event ("Everyone’s numbers were revealed") reads as its own
  // sentence; an ordinary move reads "<Player> <did something>".
  const event = TABLE_EVENT.test(move.label);
  const label = event ? move.label : move.label.charAt(0).toLocaleLowerCase() + move.label.slice(1);
  const cards = move.cards.slice(0, 2).map((card) => card.label);
  const extraCards = move.cards.length - cards.length;
  const parts = [event ? label : `${name(move.actorId, true)} ${label}`];
  if (cards.length) parts[0] += `: ${cards.join(', ')}${extraCards > 0 ? ` +${extraCards}` : ''}`;
  if (move.targets.length) parts.push(`→ ${listNames(move.targets.map((id) => name(id)))}`);
  if (move.amount !== null)
    parts.push(
      family === 'property'
        ? `${move.amount}M`
        : `${move.amount} chip${Math.abs(move.amount) === 1 ? '' : 's'}`,
    );
  if (move.destination) parts.push(move.destination);
  if (move.count !== null && move.count > move.cards.length)
    parts.push(`${move.count} card${move.count === 1 ? '' : 's'}`);
  return parts.join(' · ').replace(' · →', ' →');
}

/** The latest committed public move, or null before anyone has moved. */
export function latestMove(room: Room, selfId: string) {
  const move = room.activity.at(-1);
  return move ? describeMove(room, move, selfId) : null;
}
