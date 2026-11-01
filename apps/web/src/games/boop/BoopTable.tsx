'use client';
import { useState } from 'react';
import { BoopPiece, Button } from '@games/ui';
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
  const focusSlots = new Set(highlight.split(','));
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
      <div className="boop-bed" role="group" aria-label="Six by six boop bed">
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
              aria-label={label}
              disabled={blocked || !move}
              onClick={() => move && onAction(move.value)}
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
      </div>
      {match.phase === 'graduating' && match.currentPlayer === selfId ? (
        <section className="boop-graduation" aria-label="Graduation choices">
          <h3>Time to grow up.</h3>
          <p className="small muted">
            Choose one line to graduate.
            {returns.size ? ' Or tap one piece on the bed to bring it back.' : ''}
          </p>
          <div className="paper-actions">
            {graduations.map((option) => (
              <Button
                key={option.value.choice}
                variant="secondary"
                disabled={blocked}
                onMouseEnter={() => setHighlight(option.value.choice)}
                onMouseLeave={() => setHighlight('')}
                onFocus={() => setHighlight(option.value.choice)}
                onBlur={() => setHighlight('')}
                onClick={() => onAction(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

export function BoopTable(props: TableProps) {
  const { match, room } = props;
  const data = boopDetails(match.detail);
  return (
    <div className="table-layout sea-cats-game">
      <PlayerStrip
        {...props}
        playerCaption={(p) => `${data.retired[p.id]} cats · ${8 - data.retired[p.id]} kittens`}
      />
      <section className="sea-cat-table boop-table" aria-label="boop bed table">
        <div className="paper-heading">
          <div>
            <p className="eyebrow">A cozy contest</p>
            <h2>Make a little room.</h2>
          </div>
          <span className="small muted">Three cats in a row wins.</span>
        </div>
        <Bed key={`${room.matchId}:${room.matchVersion}`} {...props} />
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
