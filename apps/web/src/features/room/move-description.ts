import type { Room } from '@games/api-client';
import { gameById } from '@games/api-client/catalog';

type PublicMove = Room['activity'][number];

const listNames = (names: string[]) =>
  names.length <= 2
    ? names.join(' and ')
    : `${names.slice(0, 2).join(', ')} and ${names.length - 2} more`;

const TABLE_EVENT = /^(Everyone|Everybody|All|No one|Nobody|The)\b/;

function casinoMove(gameId: string, move: PublicMove, isSelf: boolean) {
  const amount = move.amount === null ? '' : `${move.amount} chip${move.amount === 1 ? '' : 's'}`;
  let action = move.label.charAt(0).toLowerCase() + move.label.slice(1);
  if (gameId === 'holdem' && move.type === 'raise') {
    action = amount ? `put in ${amount} to raise` : 'raised';
  } else if (gameId === 'holdem' && move.type === 'all_in') {
    action = amount ? `went all in with ${amount}` : 'went all in';
  } else if (move.type === 'peek' || move.type === 'split') {
    const whose = isSelf ? 'your' : 'their';
    action = move.type === 'peek' ? `looked at ${whose} cards` : `split ${whose} hand`;
    if (amount) action += ` · ${amount}`;
  } else {
    if (move.type === 'bet') action = 'bet';
    if (gameId === 'blackjack' && move.type === 'hit') action = 'hit';
    if (amount) action += ['call', 'bet'].includes(move.type) ? ` ${amount}` : ` · ${amount}`;
  }
  return action;
}

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
  // Earlier Azul games persisted the plural even for a single drafted tile.
  const savedLabel =
    room.gameId === 'azul' && move.type === 'draft_tiles' && move.label === 'Drafted 1 tiles'
      ? 'Drafted 1 tile'
      : move.label;
  const label = event ? savedLabel : savedLabel.charAt(0).toLocaleLowerCase() + savedLabel.slice(1);
  const cards = move.cards.slice(0, 2).map((card) => card.label);
  const extraCards = move.cards.length - cards.length;
  const visibleCards = cards.join(', ') + (extraCards > 0 ? ` +${extraCards}` : '');
  const casino = family === 'casino' && !event;
  const action = casino ? casinoMove(room.gameId, move, move.actorId === selfId) : label;
  const parts = [event ? label : `${name(move.actorId, true)} ${action}`];
  // A casino move can reveal the board, the dealer, or showdown hands as well as the actor's cards.
  // A discard pickup records the chosen face first, then other newly public faces.
  // Those later faces were revealed on the table; the actor did not pick them up.
  const discardPickup = move.type === 'draw_discard' && ['rummy', 'skyjo'].includes(room.gameId);
  const effectTarget = room.gameId === 'flip-7' && move.type === 'target_effect';
  if (room.gameId === 'sea-salt-paper' && move.type === 'keep' && move.cards.length === 1) {
    parts[0] = `${name(move.actorId, true)} kept a card and discarded ${visibleCards}`;
  } else if (discardPickup && cards.length > 1) {
    parts[0] += `: ${cards[0]}`;
    parts.push(`Also revealed: ${cards[1]}${extraCards > 0 ? ` +${extraCards}` : ''}`);
  } else if (visibleCards && !effectTarget) {
    parts[0] += casino ? ` · Cards revealed: ${visibleCards}` : `: ${visibleCards}`;
  }
  if (move.targets.length) parts.push(`→ ${listNames(move.targets.map((id) => name(id)))}`);
  if (effectTarget && visibleCards) parts.push(`Cards revealed: ${visibleCards}`);
  if (!casino && move.amount !== null)
    parts.push(
      family === 'property'
        ? `${move.amount}M`
        : `${move.amount} chip${Math.abs(move.amount) === 1 ? '' : 's'}`,
    );
  if (move.destination) {
    const namedRank =
      room.gameId === 'the-gang' &&
      move.type === 'claim_chip' &&
      move.label.toLowerCase().endsWith(` ${move.destination.toLowerCase()}`);
    if (!namedRank) parts.push(move.destination);
  }
  if (move.count !== null && move.count > move.cards.length)
    parts.push(`${move.count} card${move.count === 1 ? '' : 's'}`);
  return parts.join(' · ').replace(' · →', ' →');
}

/** The latest committed public move, or null before anyone has moved. */
export function latestMove(room: Room, selfId: string) {
  const move = room.activity.at(-1);
  return move ? describeMove(room, move, selfId) : null;
}
