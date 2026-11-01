import type { Match, Room } from '@games/api-client';
import { playerName } from '../types';

export function pendingPlayerIds(match: Match): string[] | null {
  const pending = match.detail.pending_players;
  if (match.detail.decision_mode === 'simultaneous' && Array.isArray(pending))
    return pending.filter((id): id is string => typeof id === 'string');
  // Existing party editions already expose only submission status, never votes.
  if (['vote', 'predict'].includes(match.phase) && Array.isArray(match.detail.submitted)) {
    const submitted = match.detail.submitted;
    return match.players
      .filter((player) => !submitted.includes(player.id))
      .map((player) => player.id);
  }
  return null;
}

export function turnState(match: Match, room: Room, selfId: string) {
  if (room.paused) return { label: 'Game paused', tone: 'paused' as const };
  if (match.phase === 'finished') return { label: 'Round complete', tone: 'complete' as const };
  // Legal actions are personalized. A nominal actor does not prevent another
  // player making a concurrent choice in voting, drafting or ranking games.
  if (match.actions.length || (match.currentPlayer === selfId && pendingPlayerIds(match) === null))
    return {
      label:
        match.currentPlayer === selfId && pendingPlayerIds(match) === null
          ? 'Your turn'
          : 'Your decision',
      tone: 'active' as const,
    };
  const pending = pendingPlayerIds(match);
  if (pending && match.players.some((player) => player.id === selfId) && !pending.includes(selfId))
    return { label: 'Your choice is locked', tone: 'waiting' as const };
  return {
    label:
      match.currentPlayer && match.currentPlayer !== selfId
        ? `${playerName(room, match.currentPlayer)}’s turn`
        : 'At the table',
    tone: 'waiting' as const,
  };
}
