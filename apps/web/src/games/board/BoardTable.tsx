'use client';
import { useState, type CSSProperties } from 'react';
import { ArrowDown, Crown } from 'lucide-react';
import { Button } from '@games/ui';
import { boardDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';

export function BoardTable(props: TableProps) {
  const { match, room, onAction, pending } = props;
  const board = boardDetails(match.detail);
  const four = match.id === 'four-in-a-row';
  const checkers = match.id === 'checkers';
  const [selected, setSelected] = useState<string | null>(null);
  const options = new Map(match.actions.map((option) => [option.value.choice, option]));
  const sources = new Set(match.actions.map((option) => option.value.choice.split(':')[0]));
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
            : `${player.score} ${checkers ? 'captures' : 'discs'}`
        }
      />
      <section
        className={`classic-board classic-board--${four ? 'four' : checkers ? 'checkers' : 'reversi'}`}
        aria-label={`${four ? 'Four in a Row' : checkers ? 'Checkers' : 'Reversi'} board`}
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
                const option = options.get(checkers ? `${selected}:${cell.id}` : cell.id);
                const selectable = checkers && sources.has(cell.id);
                const label = `${cell.label}: ${cell.value ? `${cell.subtitle === 'King' ? 'king, ' : ''}${playerName(room, match.players[Number(cell.value) - 1].id)}` : 'empty'}`;
                const content = (
                  <span className="board-disc" data-color={cell.color}>
                    {cell.subtitle === 'King' ? <Crown size={20} aria-hidden="true" /> : null}
                  </span>
                );
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
                    aria-label={
                      option?.label ||
                      (selectable
                        ? `Select ${cell.subtitle === 'King' ? 'king' : 'piece'} ${cell.label}`
                        : label)
                    }
                    disabled={blocked || (!option && !selectable)}
                    data-legal={Boolean(option)}
                    data-dark={
                      (Math.floor(index / board.columns) + (index % board.columns)) % 2 === 1
                    }
                    aria-pressed={checkers ? selected === cell.id : undefined}
                    data-last={board.lastMove === index}
                    onClick={() => {
                      if (option) {
                        onAction(option.value);
                        setSelected(null);
                      } else if (selectable) setSelected(selected === cell.id ? null : cell.id);
                    }}
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
                : checkers
                  ? selected
                    ? 'Choose a marked diagonal. Jumps are compulsory.'
                    : 'Choose a piece, then its destination.'
                  : 'Choose a marked square to flip the line.'}
        </p>
      </section>
    </div>
  );
}
