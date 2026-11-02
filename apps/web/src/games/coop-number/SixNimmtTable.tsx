'use client';
import { useState } from 'react';
import { CircleMinus, LockKeyhole } from 'lucide-react';
import { Button, PlayingCard } from '@games/ui';
import { sixNimmtDetails, type Card } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';

function NumberCard({
  card,
  selected,
  onClick,
  disabled,
  small = false,
}: {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
}) {
  return (
    <div className="six-number-card" data-small={small} data-digits={card.value.length}>
      <PlayingCard
        card={card}
        family="grid"
        selected={selected}
        onClick={onClick}
        label={card.label}
        disabled={disabled}
      />
      <span className="six-card-penalty" aria-hidden="true">
        <CircleMinus size={11} />
        {card.subtitle}
      </span>
    </div>
  );
}

export function SixNimmtTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = sixNimmtDetails(match.detail);
  const blocked = pending || room.paused;
  const selectionKey = `${data.round}:${data.trick}`;
  const [selection, setSelection] = useState<{ key: string; card: string } | null>(null);
  const chosen = selection?.key === selectionKey ? selection.card : null;
  const selectedOption = match.actions.find(
    (o) => o.value.type === 'select_number' && o.value.card === chosen,
  );
  const next = match.actions.find((o) => ['next_selection', 'next_round'].includes(o.value.type));
  const simultaneous = match.phase === 'selecting';
  return (
    <div className="table-layout coop-number-game six-game">
      <PlayerStrip
        {...props}
        match={simultaneous ? { ...match, currentPlayer: null } : match}
        playerCaption={(p) =>
          `${data.total_penalties[p.id]} penalties · ${p.count} cards${data.selected_players.includes(p.id) ? ' · locked' : ''}`
        }
      />
      <section className="six-table" aria-label="6 nimmt! table">
        <header className="coop-number-heading">
          <div>
            <p className="eyebrow">
              Round {data.round} · selection {data.trick}/10
            </p>
          </div>
          <span className="small muted">A sixth card takes the row</span>
        </header>
        <div className="six-rows" aria-label="Four ascending number rows">
          {data.rows.map((row, index) => {
            const take = match.actions.find(
              (o) => o.value.type === 'take_row' && o.value.choice === String(index),
            );
            return (
              <section key={index} className="six-row" data-full={row.length === 5}>
                <header>
                  <h3>Row {index + 1}</h3>
                  <span className="small muted">
                    {data.row_penalties[index]}{' '}
                    {data.row_penalties[index] === 1 ? 'penalty' : 'penalties'}
                  </span>
                  <span className="six-row-capacity">{row.length}/5</span>
                </header>
                <div
                  className="six-row-cards"
                  aria-label={`Row ${index + 1}, ${row.length} of 5 spaces filled`}
                >
                  {Array.from({ length: 5 }, (_, slot) =>
                    row[slot] ? (
                      <NumberCard key={row[slot].id} card={row[slot]} small />
                    ) : (
                      <span className="six-row-slot" key={`empty-${slot}`} aria-hidden="true">
                        {slot + 1}
                      </span>
                    ),
                  )}
                </div>
                {take ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={blocked}
                    onClick={() => onAction(take.value)}
                  >
                    Take row {index + 1}
                  </Button>
                ) : null}
              </section>
            );
          })}
        </div>
        {simultaneous ? (
          <section className="six-hand-panel" aria-label="Your private number cards">
            <div className="coop-number-heading">
              <h3>{data.own_selection ? 'Your number is locked' : 'Choose one number'}</h3>
              <span className="small muted">
                {data.selected_players.length}/{match.players.length} locked
              </span>
            </div>
            {data.own_selection ? (
              <div className="six-locked" aria-live="polite">
                <NumberCard card={data.own_selection} small />
                <p>
                  <LockKeyhole size={18} aria-hidden="true" /> Waiting for friends. Their numbers
                  stay secret.
                </p>
              </div>
            ) : (
              <>
                <div className="six-hand">
                  {match.hand.map((card) => (
                    <NumberCard
                      key={card.id}
                      card={card}
                      selected={chosen === card.id}
                      disabled={blocked}
                      onClick={() => setSelection({ key: selectionKey, card: card.id })}
                    />
                  ))}
                </div>
                <p className="small muted">
                  Cards reveal together, then resolve from lowest to highest.
                </p>
                <Button
                  disabled={blocked || !selectedOption}
                  onClick={() => {
                    if (selectedOption) {
                      setSelection(null);
                      onAction(selectedOption.value);
                    }
                  }}
                >
                  Lock my number
                </Button>
              </>
            )}
          </section>
        ) : null}
        {match.phase === 'take_row' ? (
          <div className="six-row-decision" aria-live="polite">
            <h3>
              {data.pending_player === selfId
                ? 'Your number is below every row.'
                : `${playerName(room, data.pending_player || '')} chooses a row.`}
            </h3>
            <p>
              {data.pending_player === selfId
                ? 'Take one row as penalties. Your card becomes its new starter.'
                : 'The remaining revealed numbers resolve after this choice.'}
            </p>
          </div>
        ) : null}
        {data.revealed.length ? (
          <section className="six-revealed" aria-label="This selection’s revealed numbers">
            <h3>Revealed, in order</h3>
            <div>
              {data.revealed.map((item) => (
                <figure key={item.player}>
                  <NumberCard card={item.card} small />
                  <figcaption>{playerName(room, item.player)}</figcaption>
                </figure>
              ))}
            </div>
          </section>
        ) : null}
        {next ? (
          <div className="coop-number-review">
            <p>
              {match.phase === 'round_over'
                ? 'All ten cards are played. Round penalties are in the totals.'
                : 'The rows are settled. Ready for another number?'}
            </p>
            <Button disabled={blocked} onClick={() => onAction(next.value)}>
              {next.label}
            </Button>
          </div>
        ) : null}
        {!simultaneous && !next && match.phase !== 'take_row' ? (
          <p className="small muted">{match.message}</p>
        ) : null}
      </section>
    </div>
  );
}
