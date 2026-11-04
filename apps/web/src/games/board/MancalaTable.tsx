'use client';
import { useRef, useState } from 'react';
import { MancalaPit } from '@games/ui';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';
import { BoardViewport } from './BoardViewport';
import { mancalaExtras, plural } from './details';

/** Seat 0 owns pits 0-5 and store 6; seat 1 owns pits 7-12 and store 13. */
const owner = (index: number) => (index < 7 ? 0 : 1);

export function MancalaTable(props: TableProps) {
  const { match, room, selfId, onAction, pending } = props;
  const extras = mancalaExtras(match.detail);
  const options = new Map(match.actions.map((option) => [option.value.choice, option]));
  const [hovered, setHovered] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const pointer = useRef({ type: 'mouse', at: 0 });
  const preview = hovered && options.has(hovered) ? hovered : null;
  const selfSeat = match.players.findIndex((player) => player.id === selfId);
  // The viewer's row is always the near row, with their store on the right.
  const near = selfSeat === 1 ? 1 : 0;
  const far = 1 - near;
  const seatId = (seat: number) => match.players[seat]?.id || '';
  const ownerName = (index: number) => playerName(room, seatId(owner(index)));
  const whose = (seat: number) =>
    seatId(seat) === selfId ? 'your' : `${playerName(room, seatId(seat))}’s`;
  const pitName = (index: number) =>
    index === 6 || index === 13
      ? `${whose(owner(index))} store`
      : `${whose(owner(index))} pit ${(index % 7) + 1}`;
  const nearRow = near === 0 ? [0, 1, 2, 3, 4, 5] : [7, 8, 9, 10, 11, 12];
  const farRow = near === 0 ? [12, 11, 10, 9, 8, 7] : [5, 4, 3, 2, 1, 0];
  const nearStore = near === 0 ? 6 : 13;
  const farStore = near === 0 ? 13 : 6;
  const sow = preview ? extras.previews[preview] : undefined;
  const blocked = pending || room.paused;

  function positionLabel(index: number) {
    const card = match.community[index];
    return `${ownerName(index)} · ${card.label}: ${plural(Number(card.value), 'seed')}`;
  }
  function commit(choice: string) {
    const option = options.get(choice);
    if (!option || blocked) return;
    setArmed(null);
    setHovered(null);
    onAction(option.value);
  }
  function pit(index: number) {
    const card = match.community[index];
    const option = options.get(card.id);
    const store = index === 6 || index === 13;
    const capture = extras.lastCapture;
    return (
      <MancalaPit
        key={index}
        count={Number(card.value)}
        label={option ? `${option.label} · ${ownerName(index)}` : positionLabel(index)}
        store={store}
        caption={store ? (seatId(owner(index)) === selfId ? 'your store' : 'store') : undefined}
        highlighted={match.detail.last_move === index}
        marker={
          sow?.landing === index
            ? 'landing'
            : preview === card.id
              ? 'source'
              : capture && (capture.pit === index || capture.opposite === index)
                ? 'captured'
                : extras.lastSource === index
                  ? 'last-source'
                  : undefined
        }
        disabled={blocked || !option}
        onPointerDown={(event) => {
          pointer.current = { type: event.pointerType, at: Date.now() };
        }}
        onPointerEnter={(event) => {
          if (option && event.pointerType === 'mouse') setHovered(card.id);
        }}
        onPointerLeave={(event) => {
          if (event.pointerType === 'mouse' && !armed) setHovered(null);
        }}
        onFocus={() => {
          // Keyboard focus previews; focus from a press waits for the click.
          if (option && Date.now() - pointer.current.at > 600) setHovered(card.id);
        }}
        onClick={
          store
            ? undefined
            : (event) => {
                if (!option) return;
                // Touch has no hover: the first tap shows where the seeds go, the second
                // sows. Keyboard activation (detail 0) always sows at once.
                if (pointer.current.type === 'touch' && event.detail !== 0 && armed !== card.id) {
                  setArmed(card.id);
                  setHovered(card.id);
                  return;
                }
                commit(card.id);
              }
        }
      />
    );
  }

  const current = match.currentPlayer;
  let instruction: string;
  if (match.phase === 'finished') {
    const [a, b] = [match.players[0]?.score ?? 0, match.players[1]?.score ?? 0];
    const winner = match.winners[0];
    instruction = match.detail.draw
      ? `Draw: both stores hold ${plural(a, 'seed')}.`
      : winner
        ? `${winner === selfId ? 'You win' : `${playerName(room, winner)} wins`}, ${Math.max(a, b)} to ${Math.min(a, b)}.`
        : 'Match complete.';
  } else if (match.actions.length && preview && sow) {
    const landing =
      sow.landing === (near === 0 ? 6 : 13)
        ? 'your store: you sow again'
        : `${owner(sow.landing) === near ? 'your' : 'their'} ${sow.landing === 6 || sow.landing === 13 ? 'store' : `pit ${(sow.landing % 7) + 1}`}${sow.captures ? `, capturing ${plural(sow.captures, 'seed')}` : ''}`;
    instruction = `${options.get(preview)?.label.split(' · ')[0]}: the last seed lands in ${landing}.${armed === preview ? ' Tap again to sow.' : ''}`;
  } else if (match.actions.length) {
    instruction = 'Choose one of your pits. Tap once (or point) to preview where its seeds land.';
  } else {
    instruction = current ? `Waiting for ${playerName(room, current)}.` : 'Waiting for the table.';
  }

  let event: string | null = null;
  if (extras.lastCapture) {
    const mover = owner(extras.lastCapture.pit);
    event = `${seatId(mover) === selfId ? 'You' : playerName(room, seatId(mover))} captured ${plural(extras.lastCapture.seeds, 'seed')}, emptying ${pitName(extras.lastCapture.opposite)}.`;
  }
  if (extras.sweep)
    event = `${event ? `${event} ` : ''}One side ran out of seeds, so the rest were swept: ${plural(extras.sweep[near], 'seed')} into ${whose(near)} store, ${plural(extras.sweep[far], 'seed')} into ${whose(far)}.`;

  return (
    <div className="table-layout stable-game-table">
      <PlayerStrip
        {...props}
        playerCaption={(player) => `${plural(player.score, 'seed')} stored`}
      />
      <section className="classic-board mancala-table" aria-label="Mancala board">
        <div className="board-status" aria-live="polite">
          <span className="board-instruction">{instruction}</span>
          {event ? <span className="board-event">{event}</span> : null}
        </div>
        <p className="mancala-owner">
          {seatId(far) === selfId ? 'Your pits' : `${playerName(room, seatId(far))}’s pits`} · store
          on the left
        </p>
        <BoardViewport
          label="Mancala board"
          overview={
            <div className="mancala-overview" role="group" aria-label="All pits and stores">
              <span role="img" aria-label={positionLabel(farStore)}>
                {match.community[farStore].value}
              </span>
              <div>
                {[farRow, nearRow].map((row, index) => (
                  <div key={index}>
                    {row.map((slot) => (
                      <span key={slot} role="img" aria-label={positionLabel(slot)}>
                        {match.community[slot].value}
                      </span>
                    ))}
                  </div>
                ))}
              </div>
              <span role="img" aria-label={positionLabel(nearStore)}>
                {match.community[nearStore].value}
              </span>
            </div>
          }
        >
          <div className="mancala-board">
            {pit(farStore)}
            <div className="mancala-rows">
              <div>{farRow.map(pit)}</div>
              <div>{nearRow.map(pit)}</div>
            </div>
            {pit(nearStore)}
          </div>
        </BoardViewport>
        <p className="mancala-owner">
          {seatId(near) === selfId ? 'Your pits' : `${playerName(room, seatId(near))}’s pits`} ·{' '}
          {seatId(near) === selfId ? 'your store' : 'store'} on the right · sow counterclockwise
        </p>
      </section>
    </div>
  );
}
