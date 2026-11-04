'use client';
import { useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ArrowDown, Crown } from 'lucide-react';
import { Button, TokenArt, type TokenKind } from '@games/ui';
import { boardDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';
import { BoardViewport } from './BoardViewport';
import { boardExtras, plural } from './details';

/** Seat colours as the engines assign them: seat 0 first, seat 1 second. */
const SIDES = {
  'four-in-a-row': { names: ['Coral', 'Gold'], discs: ['coral', 'gold'], unit: null },
  reversi: { names: ['Black', 'White'], discs: ['ink', 'ivory'], unit: 'disc' },
  checkers: { names: ['Coral', 'Ivory'], discs: ['coral', 'ivory'], unit: 'capture' },
} as const;

/** Checkers names squares from the bottom rank; Reversi and Four from the top row. */
const squareName = (index: number, columns: number, checkers: boolean) =>
  `${String.fromCharCode(65 + (index % columns))}${checkers ? 8 - Math.floor(index / columns) : Math.floor(index / columns) + 1}`;

export function Swatch({ color }: { color: string }) {
  return (
    <span className="board-disc board-swatch" data-color={color} aria-hidden="true">
      {['coral', 'gold', 'ivory', 'ink'].includes(color) ? (
        <TokenArt kind={color as TokenKind} />
      ) : null}
    </span>
  );
}

export function BoardTable(props: TableProps) {
  const { match, room, selfId, onAction, pending } = props;
  const board = boardDetails(match.detail);
  const size = board.rows * board.columns;
  const extras = boardExtras(match.detail, size);
  const four = match.id === 'four-in-a-row';
  const checkers = match.id === 'checkers';
  const reversi = !four && !checkers;
  const sides = SIDES[four ? 'four-in-a-row' : checkers ? 'checkers' : 'reversi'];
  const seatOf = (id: string | null | undefined) =>
    match.players.findIndex((player) => player.id === id);
  const selfSeat = seatOf(selfId);
  const name = (id: string) => (id === selfId ? 'You' : playerName(room, id));
  const sideName = (seat: number) => sides.names[seat] ?? '';
  const [picked, setPicked] = useState<string | null>(null);
  const [hovered, setPreview] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const [column, setColumn] = useState<number | null>(null);
  // How the latest press began: touch previews first, and a press-driven focus
  // must not move the board between pointerdown and click.
  const pointer = useRef({ type: 'mouse', at: 0 });
  const options = new Map(match.actions.map((option) => [option.value.choice, option]));
  const preview = hovered && options.has(hovered) ? hovered : null;
  const sources = new Set(match.actions.map((option) => option.value.choice.split(':')[0]));
  const myTurn = match.actions.length > 0;
  // Mid-chain (or with only one movable piece) the piece is chosen for the player.
  const onlySource = checkers && sources.size === 1 ? [...sources][0] : null;
  const forcedSource =
    extras.forced !== null && sources.has(String(extras.forced)) ? String(extras.forced) : null;
  // An explicit deselect ('') is respected unless the piece must keep jumping.
  const selected = checkers
    ? picked && sources.has(picked)
      ? picked
      : picked === ''
        ? forcedSource
        : forcedSource || onlySource
    : null;
  const mustJump = checkers && match.actions.some((option) => option.label.startsWith('Jump'));
  const blocked = pending || room.paused;
  const boardLabel = `${four ? 'Four in a Row' : checkers ? 'Checkers' : 'Reversi'} board`;
  const cellLabel = (cell: (typeof match.community)[number]) =>
    `${cell.label}: ${cell.value ? `${cell.subtitle === 'King' ? 'king, ' : ''}${playerName(room, match.players[Number(cell.value) - 1].id)}` : 'empty'}`;
  const square = (index: number) => squareName(index, board.columns, checkers);
  // Show the viewer's own pieces at the bottom: the second Checkers seat sees the board turned.
  const rotate = checkers && selfSeat === 1;
  const order = Array.from({ length: size }, (_, index) => (rotate ? size - 1 - index : index));
  const flipPreview = new Set(reversi && preview ? extras.flips[preview] || [] : []);
  const lastFlips = new Set(extras.lastFlips);
  const ghost =
    four && column !== null && options.has(String(column))
      ? extras.landing[String(column)]
      : undefined;
  const current = match.currentPlayer;

  function commit(choice: string) {
    const option = options.get(choice);
    if (!option || blocked) return;
    setArmed(null);
    setPreview(null);
    setPicked(null);
    onAction(option.value);
  }

  function dropFromPointer(event: PointerEvent<HTMLDivElement>) {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-column]');
    return target ? Number(target.dataset.column) : null;
  }

  // One sentence on what the viewer can do now, or whom they are waiting for.
  let instruction: string;
  if (match.phase === 'finished') {
    const winner = match.winners[0];
    const winnerSeat = seatOf(winner);
    const loserSeat = winnerSeat === 0 ? 1 : 0;
    const loser = match.players[loserSeat]?.id;
    if (board.draw) instruction = match.message || 'It’s a draw.';
    else if (four && winner) instruction = `${name(winner)} connected four in a row.`;
    else if (reversi)
      instruction = `Final count: Black ${match.players[0]?.score ?? 0} · White ${match.players[1]?.score ?? 0}.`;
    else if (checkers && winner && loser)
      instruction =
        board.outcomeReason === 'no-pieces'
          ? `${loser === selfId ? 'All your pieces were' : `All of ${name(loser)}’s pieces were`} captured.`
          : `${name(loser)} ${loser === selfId ? 'have' : 'has'} no legal move left.`;
    else instruction = 'Match complete.';
  } else if (!myTurn) {
    instruction = current
      ? `Waiting for ${playerName(room, current)} (${sideName(seatOf(current))}).`
      : 'Waiting for the table.';
  } else if (four) {
    instruction = 'Tap a column to drop your disc.';
  } else if (reversi) {
    const flips = preview ? (extras.flips[preview] || []).length : 0;
    instruction = preview
      ? `${options.get(preview)?.label || 'Place'} flips ${plural(flips, 'disc')}${armed === preview ? '. Tap again to place it.' : '.'}`
      : 'Choose a marked square. Tap once (or point) to preview its flips.';
  } else if (extras.forced !== null && selected) {
    instruction = `Keep jumping with the piece on ${square(Number(selected))}.`;
  } else if (selected) {
    instruction = `Choose a marked square for ${square(Number(selected))}.${mustJump ? ' Jumps are compulsory.' : ''}`;
  } else {
    instruction = mustJump
      ? 'You must capture: choose a ringed piece, then jump.'
      : 'Choose a ringed piece, then its destination.';
  }

  // What the latest move did that the activity line cannot show.
  let event: string | null = null;
  if (match.phase !== 'finished') {
    if (reversi && extras.passed)
      event =
        extras.passed === selfId
          ? 'You had no legal placement, so your turn was skipped.'
          : `${playerName(room, extras.passed)} had no legal placement and passed.`;
    else if (reversi && lastFlips.size)
      event = `The last placement flipped ${plural(lastFlips.size, 'disc')} (ringed).`;
    else if (checkers && extras.lastCaptured !== null && board.lastMove !== null) {
      const moverSeat = Number(match.community[board.lastMove]?.value) - 1;
      const victim = match.players[moverSeat === 0 ? 1 : 0]?.id;
      event = `${square(extras.lastFrom ?? board.lastMove)} jumped to ${square(board.lastMove)}, capturing ${victim === selfId ? 'your' : `${victim ? playerName(room, victim) : 'the'}’s`} piece on ${square(extras.lastCaptured)}.`;
    }
  }

  return (
    <div className="table-layout stable-game-table">
      <PlayerStrip
        {...props}
        playerCaption={(player) => {
          const side = sideName(seatOf(player.id));
          return sides.unit ? `${side} · ${plural(player.score, sides.unit)}` : `${side} discs`;
        }}
      />
      <section
        className={`classic-board classic-board--${four ? 'four' : checkers ? 'checkers' : 'reversi'}`}
        aria-label={boardLabel}
        data-mover={current ? sides.discs[seatOf(current)] : undefined}
        style={{ '--board-columns': board.columns, '--board-rows': board.rows } as CSSProperties}
      >
        <div className="board-status" aria-live="polite">
          {selfSeat >= 0 ? (
            <span className="board-identity">
              <Swatch color={sides.discs[selfSeat]} />
              You play <strong>{sideName(selfSeat)}</strong>
            </span>
          ) : null}
          <span className="board-instruction">{instruction}</span>
          {event ? <span className="board-event">{event}</span> : null}
        </div>
        <BoardViewport
          label={boardLabel}
          overview={
            <div
              className="board-overview-grid"
              style={{ '--board-columns': board.columns } as CSSProperties}
              role="group"
              aria-label="All board squares"
            >
              {order.map((index) => {
                const cell = match.community[index];
                return (
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
                );
              })}
            </div>
          }
        >
          <div className="board-surface">
            {four ? (
              <div className="board-drops">
                {Array.from({ length: board.columns }, (_, index) => {
                  const option = options.get(String(index));
                  return (
                    <Button
                      key={index}
                      variant="ghost"
                      size="icon"
                      className="board-drop"
                      data-active={Boolean(option) && !blocked}
                      data-color={sides.discs[Math.max(selfSeat, 0)]}
                      aria-label={`Drop in column ${index + 1}`}
                      disabled={blocked || !option}
                      onFocus={() => setColumn(index)}
                      onBlur={() => setColumn(null)}
                      onMouseEnter={() => setColumn(index)}
                      onMouseLeave={() => setColumn(null)}
                      onClick={() => commit(String(index))}
                    >
                      <ArrowDown size={20} />
                    </Button>
                  );
                })}
              </div>
            ) : null}
            {checkers || reversi ? (
              <div className="board-files" aria-hidden="true">
                {order.slice(0, board.columns).map((index) => (
                  <span key={index}>{String.fromCharCode(65 + (index % board.columns))}</span>
                ))}
              </div>
            ) : null}
            <div className="board-frame">
              {checkers || reversi ? (
                <div className="board-ranks" aria-hidden="true">
                  {order
                    .filter((_, position) => position % board.columns === 0)
                    .map((index) => (
                      <span key={index}>{square(index).slice(1)}</span>
                    ))}
                </div>
              ) : null}
              {/* Four: the whole column is a target for pointers; keyboards use the drop buttons. */}
              <div
                className="board-grid"
                role="group"
                aria-label="Playing surface"
                data-column-hover={four && column !== null ? column : undefined}
                onPointerMove={
                  four
                    ? (pointerEvent) => {
                        if (pointerEvent.pointerType === 'mouse')
                          setColumn(dropFromPointer(pointerEvent));
                      }
                    : undefined
                }
                onPointerLeave={four ? () => setColumn(null) : undefined}
                onPointerUp={
                  four
                    ? (pointerEvent) => {
                        const target = dropFromPointer(pointerEvent);
                        if (target !== null) commit(String(target));
                      }
                    : undefined
                }
              >
                {order.map((index) => {
                  const cell = match.community[index];
                  const choice = checkers ? `${selected}:${cell.id}` : cell.id;
                  const option = options.get(choice);
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
                      data-column={index % board.columns}
                      data-column-active={column === index % board.columns && myTurn}
                      data-ghost={ghost === index ? sides.discs[Math.max(selfSeat, 0)] : undefined}
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
                      data-cell={index}
                      aria-label={
                        // The server's action label stays the name; the live status line
                        // announces the flips when the square is focused.
                        option
                          ? option.label
                          : selectable
                            ? `Select ${cell.subtitle === 'King' ? 'king' : 'piece'} ${cell.label}`
                            : label
                      }
                      disabled={blocked || (!option && !selectable)}
                      data-legal={Boolean(option)}
                      data-source={selectable && selected !== cell.id}
                      data-flip={flipPreview.has(index)}
                      data-preview={reversi && preview === cell.id}
                      data-flipped={lastFlips.has(index)}
                      data-last-from={extras.lastFrom === index}
                      data-captured={checkers && extras.lastCaptured === index}
                      data-dark={
                        (Math.floor(index / board.columns) + (index % board.columns)) % 2 === 1
                      }
                      aria-pressed={checkers ? selected === cell.id : undefined}
                      data-last={board.lastMove === index}
                      onPointerDown={(pointerEvent) => {
                        pointer.current = { type: pointerEvent.pointerType, at: Date.now() };
                      }}
                      onPointerEnter={(pointerEvent) => {
                        if (reversi && option && pointerEvent.pointerType === 'mouse')
                          setPreview(cell.id);
                      }}
                      onPointerLeave={(pointerEvent) => {
                        if (reversi && pointerEvent.pointerType === 'mouse' && !armed)
                          setPreview(null);
                      }}
                      onFocus={() => {
                        // Keyboard focus previews; focus from a press waits for the click.
                        if (reversi && option && Date.now() - pointer.current.at > 600)
                          setPreview(cell.id);
                      }}
                      onClick={(clickEvent) => {
                        if (option) {
                          // Touch has no hover: the first tap shows the flips, the second
                          // places. Keyboard activation (detail 0) always places at once.
                          if (
                            reversi &&
                            pointer.current.type === 'touch' &&
                            clickEvent.detail !== 0 &&
                            armed !== cell.id
                          ) {
                            setArmed(cell.id);
                            setPreview(cell.id);
                            return;
                          }
                          commit(choice);
                        } else if (selectable) setPicked(selected === cell.id ? '' : cell.id);
                      }}
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </BoardViewport>
      </section>
    </div>
  );
}
