'use client';
import { MancalaPit } from '@games/ui';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';

export function MancalaTable(props: TableProps) {
  const { match, room, selfId, onAction, pending } = props;
  const options = new Map(match.actions.map((option) => [option.value.choice, option]));
  function pit(index: number) {
    const card = match.community[index];
    const option = options.get(card.id);
    return (
      <MancalaPit
        key={index}
        count={Number(card.value)}
        label={option?.label || `${card.label}: ${card.value} seeds`}
        store={index === 6 || index === 13}
        highlighted={match.detail.last_move === index}
        disabled={pending || room.paused || !option}
        onClick={index === 6 || index === 13 ? undefined : () => option && onAction(option.value)}
      />
    );
  }
  return (
    <div className="table-layout">
      <PlayerStrip {...props} playerCaption={(player) => `${player.score} seeds stored`} />
      <section className="classic-board mancala-table" aria-label="Mancala board">
        <p className="mancala-owner">
          {playerName(room, match.players[1].id)}
          {match.players[1].id === selfId ? ' · your side' : ''}
        </p>
        <div className="mancala-board">
          {pit(13)}
          <div className="mancala-rows">
            <div>{[12, 11, 10, 9, 8, 7].map(pit)}</div>
            <div>{[0, 1, 2, 3, 4, 5].map(pit)}</div>
          </div>
          {pit(6)}
        </div>
        <p className="mancala-owner">
          {playerName(room, match.players[0].id)}
          {match.players[0].id === selfId ? ' · your side' : ''}
        </p>
        <p className="small muted board-help">
          {match.phase === 'finished'
            ? 'Every seed counted.'
            : match.currentPlayer === selfId
              ? 'Your move. Choose one of your lit pits.'
              : 'Sow counterclockwise. Finish in your store to go again.'}
        </p>
      </section>
    </div>
  );
}
