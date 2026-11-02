'use client';
import { useState, type CSSProperties } from 'react';
import { ArrowDown, Crown } from 'lucide-react';
import { Button, TokenArt, type TokenKind } from '@games/ui';
import { boardDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';
import { BoardViewport } from './BoardViewport';

export function BoardTable(props: TableProps) {
  const { match, room, onAction, pending } = props;
  const board = boardDetails(match.detail);
  const four = match.id === 'four-in-a-row';
  const checkers = match.id === 'checkers';
  const [selected, setSelected] = useState<string | null>(null);
  const options = new Map(match.actions.map((option) => [option.value.choice, option]));
  const sources = new Set(match.actions.map((option) => option.value.choice.split(':')[0]));
  const blocked = pending || room.paused;
  const boardLabel = `${four ? 'Four in a Row' : checkers ? 'Checkers' : 'Reversi'} board`;
  const cellLabel = (cell: (typeof match.community)[number]) =>
    `${cell.label}: ${cell.value ? `${cell.subtitle === 'King' ? 'king, ' : ''}${playerName(room, match.players[Number(cell.value) - 1].id)}` : 'empty'}`;
  return (
    <div className="table-layout stable-game-table">
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
        aria-label={boardLabel}
      >
        <BoardViewport
          label={boardLabel}
          overview={
            <div
              className="board-overview-grid"
              style={{ '--board-columns': board.columns } as CSSProperties}
              role="group"
              aria-label="All board squares"
            >
              {match.community.map((cell, index) => (
                <span
                  key={cell.id}
                  role="img"
                  aria-label={cellLabel(cell)}
                  className="board-overview-square"
                  data-dark={
                    (Math.floor(index / board.columns) + (index % board.columns)) % 2 === 1
                  }
                  data-winning={board.winningCells.includes(index)}
                >
                  {cell.value ? (
                    <span className="board-disc" data-color={cell.color}>
                      {cell.subtitle === 'King' ? <Crown size={15} aria-hidden="true" /> : null}
                    </span>
                  ) : null}
                </span>
              ))}
            </div>
          }
        >
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
                const label = cellLabel(cell);
                const content = (
                  <span className="board-disc" data-color={cell.color}>
                    {cell.value && ['coral', 'gold', 'ivory', 'ink'].includes(cell.color) ? (
                      <TokenArt kind={cell.color as TokenKind} />
                    ) : null}
                    {cell.subtitle === 'King' ? <Crown size={20} aria-hidden="true" /> : null}
                  </span>
                );
                return four ? (
                  <div
                    key={cell.id}
                    className="board-square"
                    role="img"
                    aria-label={label}
                    data-last={board.lastMove === index}
                    data-winning={board.winningCells.includes(index)}
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
        </BoardViewport>
        <p className="small muted board-help">
          {match.phase === 'finished' && board.outcomeReason
            ? match.message
            : board.draw
              ? 'Draw.'
              : match.phase === 'finished'
                ? 'Match complete.'
                : four
                  ? 'Choose a column to drop a disc.'
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
