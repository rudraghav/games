'use client';
import type { CSSProperties } from 'react';
import { ArrowDown } from 'lucide-react';
import { Button } from '@games/ui';
import { boardDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';

export function BoardTable(props: TableProps) {
  const { match, room, onAction, pending } = props;
  const board = boardDetails(match.detail);
  const four = match.id === 'four-in-a-row';
  const options = new Map(match.actions.map((option) => [option.value.choice, option]));
  const blocked = pending || room.paused;
  return (
    <div className="table-layout">
      <PlayerStrip
        {...props}
        playerCaption={(player) =>
          four
            ? match.players[0].id === player.id
              ? 'Coral discs'
              : 'Gold discs'
            : `${player.score} discs`
        }
      />
      <section
        className={`classic-board classic-board--${four ? 'four' : 'reversi'}`}
        aria-label={`${four ? 'Four in a Row' : 'Reversi'} board`}
      >
        <div className="board-scroll">
          <div
            className="board-surface"
            style={{ '--board-columns': board.columns } as CSSProperties}
          >
            {four ? (
              <div className="board-drops">
                {Array.from({ length: board.columns }, (_, column) => {
                  const option = options.get(String(column));
                  return (
                    <Button
                      key={column}
                      variant="ghost"
                      size="icon"
                      aria-label={`Drop in column ${column + 1}`}
                      disabled={blocked || !option}
                      onClick={() => option && onAction(option.value)}
                    >
                      <ArrowDown size={20} />
                    </Button>
                  );
                })}
              </div>
            ) : null}
            <div className="board-grid" role="group" aria-label="Playing surface">
              {match.community.map((cell, index) => {
                const option = options.get(cell.id);
                const label = `${cell.label}: ${cell.value ? playerName(room, match.players[Number(cell.value) - 1].id) : 'empty'}`;
                const content = <span className="board-disc" data-color={cell.color} />;
                return four ? (
                  <div
                    key={cell.id}
                    className="board-square"
                    aria-label={label}
                    data-last={board.lastMove === index}
                  >
                    {content}
                  </div>
                ) : (
                  <button
                    key={cell.id}
                    type="button"
                    className="board-square"
                    aria-label={option?.label || label}
                    disabled={blocked || !option}
                    data-legal={Boolean(option)}
                    data-last={board.lastMove === index}
                    onClick={() => option && onAction(option.value)}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <p className="small muted board-help">
          {board.draw
            ? 'An even match.'
            : match.phase === 'finished'
              ? 'A good round, well played.'
              : four
                ? 'Choose a column. Every disc changes the picture.'
                : 'Choose a marked square to flip the line.'}
        </p>
      </section>
    </div>
  );
}
