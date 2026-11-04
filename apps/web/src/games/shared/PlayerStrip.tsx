'use client';
import { useState, type KeyboardEvent } from 'react';
import { Seat, HorizontalRail } from '@games/ui';
import type { Player } from '@games/api-client';
import type { TableProps } from '../types';
import { pendingPlayerIds } from './turn-state';
import { distinctNames, seatName } from './seat-names';

const plural = (count: number, unit: string) => `${count} ${unit}${count === 1 ? '' : 's'}`;

function defaultCaption(player: Player) {
  if (player.eliminated) return 'Eliminated';
  if (player.folded) return 'Folded';
  if (player.chips != null)
    return `${plural(player.chips, 'chip')}${player.bet ? ` · ${player.bet} bet` : ''}`;
  return `${plural(player.count, 'card')}${player.score ? ` · ${plural(player.score, 'point')}` : ''}`;
}

/**
 * Every seat at a glance: the viewer sits first and the others follow in seat
 * order, so turn order reads left to right. Seats stay compact enough that at
 * least three fit on a 320px phone; the current player (or the viewer, while
 * their own decision is pending) is kept in view, and the viewer's own seat
 * stays pinned at the start while the strip scrolls.
 */
export function PlayerStrip({
  match,
  room,
  selfId,
  playerCaption,
  playerBadge,
}: Pick<TableProps, 'match' | 'room' | 'selfId'> & {
  playerCaption?: (player: Player) => string;
  /** An optional short public status for a seat, such as "Out" or "Last turn". */
  playerBadge?: (player: Player) => string | null | undefined;
}) {
  const pendingPlayers = pendingPlayerIds(match);
  const finished = match.phase === 'finished';
  const own = match.players.findIndex((player) => player.id === selfId);
  const players =
    own > 0 ? [...match.players.slice(own), ...match.players.slice(0, own)] : match.players;
  // Reveal who the table is waiting for: the viewer's own pending decision
  // first, then the current player, then anyone still choosing.
  const focusId =
    (pendingPlayers?.includes(selfId) ? selfId : match.currentPlayer) ||
    pendingPlayers?.find((id) => id !== selfId) ||
    (own >= 0 ? selfId : players[0]?.id);
  const member = (id: string) => room.members.find((item) => item.id === id);
  const names = distinctNames(players.map((player) => seatName(member(player.id))));
  const next =
    !finished && typeof match.detail.next_player === 'string' ? match.detail.next_player : null;
  const direction =
    !finished && (match.detail.direction === 1 || match.detail.direction === -1)
      ? match.detail.direction
      : undefined;
  // One tab stop for the whole strip; arrow keys move between seats.
  const [stop, setStop] = useState<string | null>(null);
  const tabStop = players.some((player) => player.id === stop) ? stop : focusId;
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const seats = Array.from(
      event.currentTarget.parentElement?.querySelectorAll<HTMLElement>(':scope > [data-player]') ||
        [],
    );
    const index = seats.indexOf(event.currentTarget);
    const target =
      event.key === 'ArrowRight'
        ? seats[index + 1]
        : event.key === 'ArrowLeft'
          ? seats[index - 1]
          : event.key === 'Home'
            ? seats[0]
            : event.key === 'End'
              ? seats.at(-1)
              : undefined;
    if (!target) return;
    event.preventDefault();
    target.focus();
  }
  return (
    <div
      className="player-strip-rail"
      data-count={players.length}
      data-direction={direction}
      data-pinned={own >= 0 && players.length > 1}
    >
      <HorizontalRail
        label="Players at the table"
        navigationLabel="players"
        viewportClassName="player-strip"
        contentClassName="player-strip-content"
        contentRole="list"
        revealKey={focusId}
      >
        {players.map((player, index) => {
          const seat = member(player.id);
          const name = seat?.name || 'Player';
          const self = player.id === selfId;
          const active = pendingPlayers
            ? pendingPlayers.includes(player.id)
            : match.currentPlayer === player.id;
          const activeLabel = pendingPlayers ? 'Decision pending' : 'Current turn';
          const caption = playerCaption ? playerCaption(player) : defaultCaption(player);
          const badge =
            playerBadge?.(player) ||
            (next === player.id && next !== match.currentPlayer ? 'Next' : undefined);
          const connected = seat?.connected ?? false;
          const summary = [
            `${name}${self ? ' (you)' : ''}${seat?.isBot ? ', bot' : ''}`,
            badge,
            connected ? caption : `reconnecting, ${caption}`,
            active ? activeLabel.toLowerCase() : null,
          ]
            .filter(Boolean)
            .join(', ');
          return (
            <div
              className="player-strip-seat"
              role="listitem"
              data-player={player.id}
              data-self={self}
              data-active={active}
              data-out={Boolean(player.eliminated || player.folded)}
              data-rail-reveal={player.id === focusId}
              key={player.id}
              tabIndex={player.id === tabStop ? 0 : -1}
              aria-label={summary}
              onFocus={() => setStop(player.id)}
              onKeyDown={onKeyDown}
            >
              <Seat
                name={name}
                displayName={self ? 'You' : names[index]}
                avatar={seat?.avatar}
                bot={seat?.isBot}
                compact
                nameLayout="wrap"
                active={active}
                activeLabel={activeLabel}
                connected={connected}
                caption={caption}
                badge={badge}
              />
            </div>
          );
        })}
      </HorizontalRail>
    </div>
  );
}
