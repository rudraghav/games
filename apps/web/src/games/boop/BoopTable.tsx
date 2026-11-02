'use client';
import { useState } from 'react';
import { BoopPiece, Button, DecisionDock, HorizontalRail } from '@games/ui';
import { boopDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';

const square = (slot: number) =>
  `${String.fromCharCode(65 + (slot % 6))}${Math.floor(slot / 6) + 1}`;

function Bed({ match, room, selfId, pending, onAction }: TableProps) {
  const data = boopDetails(match.detail);
  const ownPool = data.pools[selfId];
  const [kind, setKind] = useState<'kitten' | 'cat'>(ownPool?.kitten ? 'kitten' : 'cat');
  const [highlight, setHighlight] = useState<string>('');
  const [selected, setSelected] = useState<string>('');
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
  const myColor = match.players[0]?.id === selfId ? 'coral' : 'blue';
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
              aria-pressed={kind === type}
              disabled={
                blocked ||
                !ownPool[type] ||
                match.phase !== 'placing' ||
                match.currentPlayer !== selfId
              }
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
          return (
            <button
              className="boop-square"
              type="button"
              key={slot}
              data-last={data.last_move === slot}
              data-highlight={focusSlots.has(String(slot))}
              data-winning={data.winning_cells.includes(slot)}
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
            </button>
          );
        })}
      </HorizontalRail>
      <DecisionDock className="boop-graduation" size="extended" label="Graduation choices">
        {match.phase === 'graduating' && match.currentPlayer === selfId ? (
          <>
            <h3>Choose a graduation</h3>
            <p className="small muted">
              Select a line to preview it, then confirm.
              {returns.size ? ' Or select one piece on the bed to bring it back.' : ''}
            </p>
            <div className="paper-actions">
              {graduations.map((option) => (
                <Button
                  key={option.value.choice}
                  variant="secondary"
                  disabled={blocked}
                  aria-pressed={selected === `graduate:${option.value.choice}`}
                  onMouseEnter={() => setHighlight(option.value.choice)}
                  onMouseLeave={() => setHighlight('')}
                  onFocus={() => setHighlight(option.value.choice)}
                  onBlur={() => setHighlight('')}
                  onClick={() => setSelected(`graduate:${option.value.choice}`)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            <p className="small boop-selection" aria-live="polite">
              {selectedChoice
                ? `${selectedChoice.label}. Return ${selectedChoice.value.choice.split(',').length} adult ${selectedChoice.value.choice.split(',').length === 1 ? 'cat' : 'cats'} to your pool.`
                : 'No graduation selected.'}
            </p>
            <div className="paper-actions">
              <Button
                disabled={blocked || !selectedChoice}
                onClick={() => selectedChoice && onAction(selectedChoice.value)}
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
          </>
        ) : (
          <p className="small muted">
            {match.phase === 'finished'
              ? match.message
              : match.phase === 'graduating'
                ? `${playerName(room, match.currentPlayer || '')} is choosing a graduation.`
                : 'Choose an available kitten or cat, then a marked square.'}
          </p>
        )}
      </DecisionDock>
    </>
  );
}

export function BoopTable(props: TableProps) {
  const { match, room } = props;
  const data = boopDetails(match.detail);
  return (
    <div className="table-layout stable-game-table sea-cats-game">
      <PlayerStrip
        {...props}
        playerCaption={(p) => `${data.retired[p.id]} cats · ${8 - data.retired[p.id]} kittens`}
      />
      <section className="sea-cat-table boop-table" aria-label="boop bed table">
        <div className="paper-heading">
          <div>
            <p className="eyebrow">Your pieces</p>
          </div>
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
