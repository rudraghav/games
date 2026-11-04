import type { Match, Room } from '@games/api-client';
import { gameById } from '@games/api-client/catalog';
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

/** Joins names for a sentence, collapsing long lists so a phone banner stays short. */
export function nameList(names: string[], limit = 3) {
  if (names.length <= 1) return names[0] || '';
  if (names.length > limit)
    return `${names.slice(0, limit - 1).join(', ')} and ${names.length - limit + 1} more`;
  return `${names.slice(0, -1).join(', ')} and ${names.at(-1)}`;
}

/** The finished match in one line, said from the viewer's seat. */
function finishedLabel(match: Match, room: Room, selfId: string) {
  const game = gameById(room.gameId);
  if (game.family === 'tarot') return 'Reading complete';
  if (game.playMode === 'cooperative')
    return match.winners.length ? 'You won together' : 'The team didn’t make it';
  if (match.detail.draw === true) return 'It’s a draw';
  if (!match.winners.length) return 'Match over';
  const others = match.winners.filter((id) => id !== selfId).map((id) => playerName(room, id));
  if (match.winners.includes(selfId))
    return others.length ? `You and ${nameList(others, 2)} win` : 'You win!';
  return `${nameList(others, 2)} ${others.length === 1 ? 'wins' : 'win'}`;
}

type Tone = 'active' | 'waiting' | 'paused' | 'complete';

/**
 * Whose move it is and what the viewer should know, from the viewer's seat.
 * Engine messages are written for the player who can act, so waiting seats see
 * who they are waiting for instead of someone else's instruction.
 */
export function turnState(
  match: Match,
  room: Room,
  selfId: string,
): { label: string; tone: Tone; message: string } {
  const name = (id: string) => playerName(room, id);
  if (room.paused)
    return {
      label: 'Game paused',
      tone: 'paused',
      message: 'Play resumes when everyone reconnects.',
    };
  if (match.phase === 'finished')
    return { label: finishedLabel(match, room, selfId), tone: 'complete', message: match.message };
  const current = match.currentPlayer;
  // An eliminated seat keeps watching; nothing at the table waits on it any more.
  if (match.players.some((player) => player.id === selfId && player.eliminated))
    return {
      label: 'You’re out',
      tone: 'waiting',
      message: current ? `Watching ${name(current)}’s turn.` : 'Watching the rest of the match.',
    };
  // A response window (for example a Just Say No chance) hands the decision to
  // another seat while the turn still belongs to the player who started it.
  const response = match.detail.pending_action as
    { actor?: unknown; stage?: unknown } | null | undefined;
  const owner = typeof response?.actor === 'string' ? response.actor : null;
  if (owner && current && current !== owner) {
    const paying = response?.stage === 'payment';
    if (current === selfId)
      return {
        label: paying ? 'You owe a payment' : 'Your response',
        tone: 'active',
        message: match.message,
      };
    return {
      label: owner === selfId ? 'Your turn' : `${name(owner)}’s turn`,
      tone: 'waiting',
      message: `Waiting for ${name(current)} to ${paying ? 'pay' : 'respond'}.`,
    };
  }
  const pending = pendingPlayerIds(match);
  if (pending !== null) {
    const waitingFor = pending.filter((id) => id !== selfId).map(name);
    const waiting = waitingFor.length
      ? `Waiting for ${nameList(waitingFor)}.`
      : 'Waiting for the table.';
    if (match.actions.length)
      return { label: 'Your decision', tone: 'active', message: match.message || waiting };
    if (match.players.some((player) => player.id === selfId) && !pending.includes(selfId))
      return { label: 'Your choice is locked', tone: 'waiting', message: waiting };
    return { label: 'Players are choosing', tone: 'waiting', message: waiting };
  }
  // Word Agents guesses belong to a whole team; the first operative is only the
  // engine's nominal current player, so name the team instead of that one seat.
  const teams = match.detail.teams as Record<string, unknown> | undefined;
  const activeTeam = match.detail.active_team;
  if (
    room.gameId === 'word-agents' &&
    match.phase === 'guess' &&
    teams &&
    typeof activeTeam === 'number'
  ) {
    const team = ['Red', 'Blue'][activeTeam] ?? 'The active';
    const spymasters = Array.isArray(match.detail.spymasters) ? match.detail.spymasters : [];
    if (teams[selfId] === activeTeam)
      return spymasters.includes(selfId)
        ? {
            label: 'Your team’s turn',
            tone: 'waiting',
            message: 'Waiting for your operatives to guess.',
          }
        : { label: 'Your team’s turn', tone: 'active', message: match.message };
    return {
      label: `${team} team’s turn`,
      tone: 'waiting',
      message: `Waiting for ${team} operatives to guess.`,
    };
  }
  if (current === selfId) return { label: 'Your turn', tone: 'active', message: match.message };
  // Legal actions are personalized: an out-of-turn reaction still needs the viewer.
  if (match.actions.length) {
    if (!current) return { label: 'Your decision', tone: 'active', message: match.message };
    const options = [...new Set(match.actions.map((option) => option.label))].slice(0, 2);
    return {
      label: 'Your decision',
      tone: 'active',
      message: `${name(current)}’s turn. You can still: ${options.join(' or ')}.`,
    };
  }
  if (current)
    return {
      label: `${name(current)}’s turn`,
      tone: 'waiting',
      message: `Waiting for ${name(current)}.`,
    };
  return { label: 'At the table', tone: 'waiting', message: match.message };
}
