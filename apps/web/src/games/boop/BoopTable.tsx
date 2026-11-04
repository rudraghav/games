'use client';
import { useState } from 'react';
import { BoopPiece, Button, DecisionDock, HorizontalRail } from '@games/ui';
import { boopDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { useTableDraft } from '../shared/table-draft';
import { playerName, type TableProps } from '../types';

const square = (slot: number) =>
  `${String.fromCharCode(65 + (slot % 6))}${Math.floor(slot / 6) + 1}`;
/** Seat 0 plays coral pieces, seat 1 blue (as the engine colours the bed). */
const COLOURS = ['coral', 'blue'] as const;
const colourName = (seat: number) => (seat === 1 ? 'Blue' : 'Coral');

type Graduation = { owner: string; cells: number[]; kind: string; kittens: number };

/** The latest graduation or return, if the server reported one (older matches may not). */
function lastGraduation(detail: TableProps['match']['detail']): Graduation | null {
  const raw = detail.last_graduation as Partial<Graduation> | null | undefined;
  if (!raw || typeof raw.owner !== 'string' || !Array.isArray(raw.cells)) return null;
  const cells = raw.cells.filter(
    (cell): cell is number => typeof cell === 'number' && cell >= 0 && cell < 36,
  );
  return {
    owner: raw.owner,
    cells,
    kind: raw.kind === 'return_piece' ? 'return_piece' : 'graduate',
    kittens: typeof raw.kittens === 'number' ? raw.kittens : 0,
  };
}

/** Which way a booped piece travelled, for the arrow drawn on its new square. */
function direction(from: number, to: number) {
  const dr = Math.sign(Math.floor(to / 6) - Math.floor(from / 6));
  const dc = Math.sign((to % 6) - (from % 6));
  return `${dr < 0 ? 'n' : dr > 0 ? 's' : ''}${dc < 0 ? 'w' : dc > 0 ? 'e' : ''}`;
}

function Bed({ match, room, selfId, pending, onAction }: TableProps) {
  const data = boopDetails(match.detail);
  const graduation = lastGraduation(match.detail);
  const ownPool = data.pools[selfId];
  const selfSeat = match.players.findIndex((player) => player.id === selfId);
  const myTurn = match.currentPlayer === selfId && match.actions.length > 0;
  const placing = match.phase === 'placing';
  const choosing = match.phase === 'graduating' && myTurn;
  const [kind, setKind] = useState<'kitten' | 'cat'>(ownPool?.kitten ? 'kitten' : 'cat');
  const [highlight, setHighlight] = useState<string>('');
  // The unsent graduation choice survives a refresh, but only for this decision.
  const [selected, setSelected] = useTableDraft<string>(
    `${room.id}:${room.matchId}:${room.matchVersion}:boop-graduation`,
    '',
  );
  const blocked = pending || room.paused;
  const placements = new Map(
    match.actions
      .filter((o) => o.value.type === 'place' && o.value.color === kind)
      .map((o) => [o.value.choice, o]),
  );
  const returns = new Map(
    match.actions.filter((o) => o.value.type === 'return_piece').map((o) => [o.value.choice, o]),
  );
  const graduations = match.actions.filter((o) => o.value.type === 'graduate');
  const selectedChoice = match.actions.find(
    (option) => `${option.value.type}:${option.value.choice}` === selected,
  );
  const focusSlots = new Set((highlight || selectedChoice?.value.choice || '').split(','));
  const myColor = COLOURS[selfSeat === 1 ? 1 : 0];
  const name = (id: string) => (id === selfId ? 'You' : playerName(room, id));
  const whose = (id: string) => (id === selfId ? 'your' : `${playerName(room, id)}’s`);
  // Pushes from the latest placement: where each booped piece went.
  const pushedTo = new Map(
    data.last_pushes.filter((push) => push.to >= 0).map((push) => [push.to, push]),
  );
  const pushedFrom = new Map(data.last_pushes.map((push) => [push.from, push]));
  const graduated = new Set(graduation?.cells || []);

  let instruction: string;
  if (match.phase === 'finished') {
    const winner = match.winners[0];
    instruction = winner
      ? `${name(winner)} ${winner === selfId ? 'win' : 'wins'} with ${data.outcome_reason === 'eight-cats' ? 'eight adult cats on the bed' : 'three adult cats in a line'}.`
      : 'Match complete.';
  } else if (choosing) {
    instruction =
      returns.size && !graduations.length
        ? 'All eight of your pieces are on the bed: choose one to bring back to your pool.'
        : 'Choose a graduation.';
  } else if (myTurn) {
    instruction = `Choose a ${ownPool?.cat ? 'kitten or cat' : 'kitten'}, then a marked square.`;
  } else {
    const current = match.currentPlayer;
    instruction = current
      ? match.phase === 'graduating'
        ? `Waiting for ${playerName(room, current)} to choose a graduation.`
        : `Waiting for ${playerName(room, current)}.`
      : 'Waiting for the table.';
  }

  // What the latest turn did, said from this seat.
  const events: string[] = [];
  if (data.last_pushes.length && data.last_move !== null) {
    // Grouped by owner: "Booped your F2 (off the bed), D3 → C4 · Dev’s E3 → E4."
    const owners = [...new Set(data.last_pushes.map((push) => push.owner))];
    const groups = owners.map(
      (id) =>
        `${whose(id)} ${data.last_pushes
          .filter((push) => push.owner === id)
          .map((push) =>
            push.to < 0
              ? `${square(push.from)} (off the bed)`
              : `${square(push.from)} → ${square(push.to)}`,
          )
          .join(', ')}`,
    );
    const off = data.last_pushes.some((push) => push.to < 0);
    events.push(
      `Booped ${groups.join(' · ')}.${off ? ' Pieces booped off return to their pool.' : ''}`,
    );
  }
  if (graduation)
    events.push(
      graduation.kind === 'return_piece'
        ? `${name(graduation.owner)} brought ${graduation.cells.map(square).join(', ')} back as a cat.`
        : `${name(graduation.owner)} graduated ${graduation.cells.map(square).join(', ')}${graduation.kittens ? ` (${graduation.kittens} ${graduation.kittens === 1 ? 'kitten' : 'kittens'} became cats)` : ''}.`,
    );

  return (
    <>
      {ownPool ? (
        <div className="boop-pool" aria-label="Your available pieces">
          {(['kitten', 'cat'] as const).map((type) => (
            <button
              key={type}
              type="button"
              className="boop-pool-choice"
              aria-label={`Select ${type}: ${ownPool[type]} available`}
              aria-pressed={myTurn && placing ? kind === type : undefined}
              disabled={blocked || !ownPool[type] || !placing || !myTurn}
              onClick={() => setKind(type)}
            >
              <BoopPiece kind={type} color={myColor} label={type} />
              <span>
                {type === 'cat' ? 'Cats' : 'Kittens'} <strong>×{ownPool[type]}</strong>
              </span>
            </button>
          ))}
        </div>
      ) : null}
      <HorizontalRail
        label="Six by six boop bed"
        navigationLabel="boop columns"
        navigationPosition="below"
        className="boop-bed-rail"
        contentClassName="boop-bed"
      >
        {match.community.map((cell, slot) => {
          const move = placements.get(String(slot)) || returns.get(String(slot));
          const occupied = cell.value === 'kitten' || cell.value === 'cat';
          const label =
            move?.label ||
            (occupied
              ? `${playerName(room, cell.suit)}’s ${cell.value} at ${square(slot)}`
              : `Empty ${square(slot)}`);
          const arrived = pushedTo.get(slot);
          const left = pushedFrom.get(slot);
          return (
            <button
              className="boop-square"
              type="button"
              key={slot}
              data-last={data.last_move === slot}
              data-highlight={focusSlots.has(String(slot))}
              data-winning={data.winning_cells.includes(slot)}
              data-pushed={arrived ? direction(arrived.from, arrived.to) : undefined}
              data-vacated={left && !occupied ? (left.to < 0 ? 'off' : 'moved') : undefined}
              data-graduated={graduated.has(slot) && !occupied}
              aria-pressed={
                returns.has(String(slot)) ? selected === `return_piece:${slot}` : undefined
              }
              aria-label={label}
              disabled={blocked || !move}
              onClick={() => {
                if (!move) return;
                if (move.value.type === 'return_piece') setSelected(`return_piece:${slot}`);
                else onAction(move.value);
              }}
            >
              <span className="boop-square-coordinate" aria-hidden="true">
                {square(slot)}
              </span>
              {occupied ? (
                <BoopPiece
                  kind={cell.value as 'kitten' | 'cat'}
                  color={cell.color === 'coral' ? 'coral' : 'blue'}
                  label={label}
                />
              ) : null}
              {left && !occupied && left.to < 0 ? (
                <span className="boop-square-note" aria-hidden="true">
                  off
                </span>
              ) : null}
            </button>
          );
        })}
      </HorizontalRail>
      {/* A fixed footprint below the bed: the bed never moves when a phase changes. */}
      <DecisionDock
        className="boop-graduation"
        size="extended"
        label={choosing ? 'Graduation choices' : 'Turn status'}
      >
        <div className="board-status boop-status" aria-live="polite">
          <span className="board-instruction">{instruction}</span>
          {choosing
            ? null
            : events.map((event) => (
                <span key={event} className="board-event">
                  {event}
                </span>
              ))}
        </div>
        {choosing ? (
          <>
            <p className="small muted">
              Select a line to preview it, then confirm.
              {returns.size ? ' Or select one piece on the bed to bring it back.' : ''}
            </p>
            {graduations.length ? (
              <div className="paper-actions boop-lines">
                {graduations.map((option) => {
                  const pressed = selected === `graduate:${option.value.choice}`;
                  return (
                    <Button
                      key={option.value.choice}
                      variant={pressed ? 'primary' : 'secondary'}
                      disabled={blocked}
                      aria-pressed={pressed}
                      onMouseEnter={() => setHighlight(option.value.choice)}
                      onMouseLeave={() => setHighlight('')}
                      onFocus={() => setHighlight(option.value.choice)}
                      onBlur={() => setHighlight('')}
                      onClick={() => setSelected(`graduate:${option.value.choice}`)}
                    >
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            ) : null}
            <p className="small boop-selection" aria-live="polite">
              {selectedChoice
                ? `${selectedChoice.label}. Return ${selectedChoice.value.choice.split(',').length} adult ${selectedChoice.value.choice.split(',').length === 1 ? 'cat' : 'cats'} to your pool.`
                : 'No graduation selected.'}
            </p>
            <div className="boop-commit" data-decision-actions>
              <div className="paper-actions">
                <Button
                  disabled={blocked || !selectedChoice}
                  onClick={() => {
                    if (!selectedChoice) return;
                    setSelected('');
                    onAction(selectedChoice.value);
                  }}
                >
                  {selectedChoice?.value.type === 'return_piece'
                    ? 'Confirm return'
                    : 'Confirm graduation'}
                </Button>
                <Button
                  variant="secondary"
                  disabled={blocked || !selectedChoice}
                  onClick={() => {
                    setSelected('');
                    setHighlight('');
                  }}
                >
                  Clear selection
                </Button>
              </div>
            </div>
          </>
        ) : null}
      </DecisionDock>
    </>
  );
}

export function BoopTable(props: TableProps) {
  const { match, room, selfId } = props;
  const data = boopDetails(match.detail);
  const selfSeat = match.players.findIndex((player) => player.id === selfId);
  return (
    <div className="table-layout stable-game-table sea-cats-game">
      <PlayerStrip
        {...props}
        playerCaption={(p) => {
          const seat = match.players.findIndex((player) => player.id === p.id);
          return `${colourName(seat)} · ${data.retired[p.id]} of 8 graduated`;
        }}
      />
      <section className="sea-cat-table boop-table" aria-label="boop bed table">
        <div className="paper-heading boop-heading">
          {selfSeat >= 0 ? (
            <span className="board-identity">
              <BoopPiece
                kind="kitten"
                color={COLOURS[selfSeat === 1 ? 1 : 0]}
                label={`${colourName(selfSeat)} kitten`}
                className="boop-swatch"
              />
              You play <strong>{colourName(selfSeat)}</strong>
            </span>
          ) : null}
          <span className="small muted">
            Win with three cats in a row, or eight cats on the bed.
          </span>
        </div>
        <Bed key={`${room.matchId}:${room.matchVersion}`} {...props} />
        {match.phase === 'finished' && data.winning_cells.length ? (
          <p className="boop-result" role="status">
            {data.outcome_reason === 'eight-cats'
              ? 'Eight adult cats on the bed'
              : 'Three adult cats in a line'}
            : {data.winning_cells.map(square).join(', ')}.
          </p>
        ) : null}
        <div className="boop-progress" aria-label="Cat graduation progress">
          {match.players.map((player) => (
            <p key={player.id}>
              <strong>{playerName(room, player.id)}</strong>
              <span>{data.retired[player.id]} of 8 kittens graduated</span>
            </p>
          ))}
        </div>
      </section>
    </div>
  );
}
