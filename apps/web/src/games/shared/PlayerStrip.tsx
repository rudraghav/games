'use client';
import { useEffect, useRef } from 'react';
import { Seat } from '@games/ui';
import type { Player } from '@games/api-client';
import type { TableProps } from '../types';
import { pendingPlayerIds } from './turn-state';
export function PlayerStrip({
  match,
  room,
  selfId,
  playerCaption,
}: Pick<TableProps, 'match' | 'room' | 'selfId'> & { playerCaption?: (player: Player) => string }) {
  const stripRef = useRef<HTMLDivElement>(null);
  const pendingPlayers = pendingPlayerIds(match);
  const focusId = pendingPlayers?.includes(selfId) ? selfId : match.currentPlayer;
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip || strip.scrollWidth <= strip.clientWidth) return;
    const seat = Array.from(strip.children).find(
      (child) => child.getAttribute('data-player') === focusId,
    );
    if (!seat) return;
    const target = seat.getBoundingClientRect();
    const frame = strip.getBoundingClientRect();
    if (target.left < frame.left || target.right > frame.right)
      strip.scrollTo({ left: strip.scrollLeft + target.left - frame.left - 3, behavior: 'auto' });
  }, [focusId]);
  return (
    <div className="player-strip" ref={stripRef} role="group" aria-label="Players at the table">
      {match.players.map((player) => {
        const member = room.members.find((member) => member.id === player.id);
        return (
          <div className="player-strip-seat" data-player={player.id} key={player.id}>
            <Seat
              name={member?.name || 'Player'}
              you={player.id === selfId}
              avatar={member?.avatar}
              compact
              active={
                pendingPlayers
                  ? pendingPlayers.includes(player.id)
                  : match.currentPlayer === player.id
              }
              activeLabel={pendingPlayers ? 'Decision pending' : 'Current turn'}
              connected={member?.connected ?? false}
              caption={
                playerCaption
                  ? playerCaption(player)
                  : player.eliminated
                    ? 'Eliminated'
                    : player.folded
                      ? 'Folded'
                      : player.chips != null
                        ? `${player.chips} chips${player.bet ? ` · ${player.bet} bet` : ''}`
                        : `${player.count} cards${player.score ? ` · ${player.score} points` : ''}`
              }
            />
          </div>
        );
      })}
    </div>
  );
}
