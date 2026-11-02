'use client';
import { MancalaPit } from '@games/ui';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';
import { BoardViewport } from './BoardViewport';

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
    <div className="table-layout stable-game-table">
      <PlayerStrip {...props} playerCaption={(player) => `${player.score} seeds stored`} />
      <section className="classic-board mancala-table" aria-label="Mancala board">
        <p className="mancala-owner">
          {playerName(room, match.players[1].id)}
          {match.players[1].id === selfId ? ' · your side' : ''}
        </p>
        <BoardViewport
          label="Mancala board"
          overview={
            <div className="mancala-overview" role="group" aria-label="All pits and stores">
              <span aria-label={`${match.community[13].label}: ${match.community[13].value} seeds`}>
                {match.community[13].value}
              </span>
              <div>
                {[
                  [12, 11, 10, 9, 8, 7],
                  [0, 1, 2, 3, 4, 5],
                ].map((row, index) => (
                  <div key={index}>
                    {row.map((slot) => (
                      <span
                        key={slot}
                        aria-label={`${match.community[slot].label}: ${match.community[slot].value} seeds`}
                      >
                        {match.community[slot].value}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <span aria-label={`${match.community[6].label}: ${match.community[6].value} seeds`}>
                {match.community[6].value}
              </span>
            </div>
          }
        >
          <div className="mancala-board">
            {pit(13)}
            <div className="mancala-rows">
              <div>{[12, 11, 10, 9, 8, 7].map(pit)}</div>
              <div>{[0, 1, 2, 3, 4, 5].map(pit)}</div>
            </div>
            {pit(6)}
          </div>
        </BoardViewport>
        <p className="mancala-owner">
          {playerName(room, match.players[0].id)}
          {match.players[0].id === selfId ? ' · your side' : ''}
        </p>
        <p className="small muted board-help">
          {match.phase === 'finished'
            ? 'Match complete.'
            : match.currentPlayer === selfId
              ? 'Choose one of your highlighted pits.'
              : 'Sow counterclockwise. Finish in your store to go again.'}
        </p>
      </section>
    </div>
  );
}
