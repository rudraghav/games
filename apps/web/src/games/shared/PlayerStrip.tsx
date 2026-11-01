import { Seat } from '@games/ui';
import type { Player } from '@games/api-client';
import type { TableProps } from '../types';
export function PlayerStrip({
  match,
  room,
  selfId,
  playerCaption,
}: Pick<TableProps, 'match' | 'room' | 'selfId'> & { playerCaption?: (player: Player) => string }) {
  return (
    <div className="player-strip">
      {match.players.map((player) => {
        const member = room.members.find((member) => member.id === player.id);
        return (
          <Seat
            key={player.id}
            name={member?.name || 'Player'}
            you={player.id === selfId}
            avatar={member?.avatar}
            compact
            active={match.currentPlayer === player.id}
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
        );
      })}
    </div>
  );
}
