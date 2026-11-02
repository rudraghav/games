'use client';
import { useState } from 'react';
import { Button, PaperPlayingCard, DecisionDock, HorizontalRail } from '@games/ui';
import { paperDetails, type Action } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';

function PaperDecision({ match, room, selfId, pending, onAction }: TableProps) {
  const [selected, setSelected] = useState<string[]>([]);
  const data = paperDetails(match.detail);
  const blocked = pending || room.paused;
  const roundComplete = ['round_over', 'finished'].includes(match.phase);
  const options = match.actions;
  const action = (type: string) => options.find((option) => option.value.type === type);
  const send = (move: Action) => {
    setSelected([]);
    onAction(move);
  };
  const pairs = options.filter((o) => o.value.type === 'pair');
  const pair = pairs.find(
    (o) => selected.length === 2 && o.value.cards?.every((id) => selected.includes(id)),
  );
  const eligible = new Set(pairs.flatMap((o) => o.value.cards || []));
  function select(id: string) {
    setSelected((old) =>
      old.includes(id) ? old.filter((card) => card !== id) : [...old.slice(-1), id],
    );
  }
  return (
    <>
      <DecisionDock
        className="paper-source-dock"
        size={roundComplete ? 'compact' : 'extended'}
        label="Draw and card choices"
        pending={pending}
      >
        {roundComplete ? <p className="small">{match.message}</p> : null}
        {match.phase === 'draw' ? (
          <section className="paper-draw" aria-label="Draw a card">
            <div className="paper-stock">
              <span className="eyebrow">Draw pile</span>
              <strong>{match.drawCount}</strong>
              <Button
                disabled={blocked || !action('take_stock')}
                onClick={() => action('take_stock') && send(action('take_stock')!.value)}
              >
                Draw two · keep one
              </Button>
            </div>
            {data.discard_tops.map((card, index) => {
              const move = options.find(
                (o) => o.value.type === 'take_discard' && o.value.choice === String(index),
              );
              return (
                <div className="paper-discard" key={index}>
                  <span className="small muted">
                    Discard {index + 1} · {data.pile_counts[index]}
                  </span>
                  {card ? (
                    <PaperPlayingCard
                      card={card}
                      compact
                      label={`Take discard ${index + 1}: ${card.label}`}
                      onClick={move ? () => send(move.value) : undefined}
                      disabled={blocked || !move}
                    />
                  ) : (
                    <div className="paper-empty-pile">Empty</div>
                  )}
                </div>
              );
            })}
          </section>
        ) : null}
        {['choosing', 'crab_card'].includes(match.phase) && data.private_options.length ? (
          <section className="paper-private-choice" aria-label="Your private card choice">
            <h3>
              {match.phase === 'choosing' ? 'Choose a card to keep' : 'Choose a discard card'}
            </h3>
            <p className="small muted">Only you can see these choices.</p>
            <div className="paper-card-row">
              {data.private_options.map((card) => {
                const move = options.find(
                  (o) => o.value.type === 'take_inspected' && o.value.card === card.id,
                );
                return (
                  <PaperPlayingCard
                    key={card.id}
                    card={card}
                    compact
                    selected={selected.includes(card.id)}
                    disabled={blocked}
                    onClick={() => (move ? send(move.value) : setSelected([card.id]))}
                  />
                );
              })}
            </div>
            {match.phase === 'choosing' ? (
              <div className="paper-actions">
                {options
                  .filter((o) => o.value.type === 'keep' && o.value.card === selected[0])
                  .map((o) => (
                    <Button key={o.value.choice} disabled={blocked} onClick={() => send(o.value)}>
                      Keep selected · discard to pile {Number(o.value.choice) + 1}
                    </Button>
                  ))}
              </div>
            ) : null}
          </section>
        ) : null}
        {match.phase === 'crab_pile' && options.length ? (
          <section className="paper-private-choice">
            <h3>Choose a discard pile</h3>
            <div className="paper-actions">
              {options.map((o) => (
                <Button
                  key={o.value.choice}
                  variant="secondary"
                  disabled={blocked}
                  onClick={() => send(o.value)}
                >
                  {o.label} · {data.pile_counts[Number(o.value.choice)]} cards
                </Button>
              ))}
            </div>
          </section>
        ) : null}
        {match.phase === 'steal' && options.length ? (
          <section className="paper-private-choice">
            <h3>Choose a player to steal from</h3>
            <div className="paper-actions">
              {options.map((o) => (
                <Button
                  key={o.value.target}
                  variant="secondary"
                  disabled={blocked}
                  onClick={() => send(o.value)}
                >
                  {playerName(room, o.value.target)} · random card
                </Button>
              ))}
            </div>
          </section>
        ) : null}
        {match.currentPlayer === selfId ? (
          <div className="paper-actions" aria-label="Your turn choices">
            {pairs.length ? (
              <Button
                variant="secondary"
                disabled={blocked || !pair}
                onClick={() => pair && send(pair.value)}
              >
                {pair?.label || 'Play selected duo'}
              </Button>
            ) : null}
            {options
              .filter((o) =>
                ['stop', 'last_chance', 'end_turn', 'reveal_mermaids', 'next_round'].includes(
                  o.value.type,
                ),
              )
              .map((o) => (
                <Button
                  key={o.value.type}
                  variant={o.value.type === 'last_chance' ? 'secondary' : 'primary'}
                  disabled={blocked}
                  onClick={() => send(o.value)}
                >
                  {o.label}
                </Button>
              ))}
          </div>
        ) : null}
      </DecisionDock>
      <section className="paper-hand" aria-label="Your private hand">
        <div className="paper-heading">
          <h3>Your hand</h3>
          <span className="small muted">
            {data.own_points} card points · {data.own_bonus} color bonus
          </span>
        </div>
        <p className="small muted paper-hand-instruction" aria-hidden={!pairs.length}>
          {pairs.length ? 'Select two matching duo cards to play their effect.' : '\u00a0'}
        </p>
        <HorizontalRail label="Your Sea Salt and Paper hand" contentClassName="paper-card-row">
          {match.hand.map((card) => (
            <PaperPlayingCard
              key={card.id}
              card={card}
              selected={selected.includes(card.id)}
              onClick={eligible.has(card.id) ? () => select(card.id) : undefined}
              disabled={blocked || !eligible.has(card.id)}
            />
          ))}
        </HorizontalRail>
        <p className="muted small paper-empty-status" aria-hidden={Boolean(match.hand.length)}>
          {match.hand.length ? '\u00a0' : 'No cards yet.'}
        </p>
      </section>
    </>
  );
}

export function PaperTable(props: TableProps) {
  const { match, room, selfId } = props;
  const data = paperDetails(match.detail);
  return (
    <div className="table-layout stable-game-table sea-cats-game">
      <PlayerStrip {...props} playerCaption={(p) => `${p.score} points · ${p.count} in hand`} />
      <section
        className="sea-cat-table paper-table"
        aria-label="Sea Salt and Paper table"
        data-phase={match.phase}
      >
        <div className="paper-heading">
          <div>
            <p className="eyebrow">Round {data.round}</p>
          </div>
          <span className="small muted">First to {data.target} points</span>
        </div>
        {data.caller ? (
          <p className="paper-last-chance" role="status">
            {playerName(room, data.caller)} called Last Chance. Revealed hands are protected.
          </p>
        ) : null}
        <PaperDecision key={`${room.matchId}:${room.matchVersion}`} {...props} />
        <div className="paper-collections" aria-label="Played and revealed cards">
          {match.players.map((player) => (
            <details key={player.id} open={player.id === selfId}>
              <summary>
                {playerName(room, player.id)}
                {player.id === selfId ? ' · you' : ''}
                <span>
                  {player.bank.length} played
                  {data.protected.includes(player.id) ? ' · hand revealed' : ''}
                </span>
              </summary>
              {player.bank.length ? (
                <div className="paper-card-row">
                  {player.bank.map((card) => (
                    <PaperPlayingCard key={card.id} card={card} compact />
                  ))}
                </div>
              ) : (
                <p className="small muted">No duos played yet.</p>
              )}
              {player.cards.length ? (
                <>
                  <p className="eyebrow">Revealed hand</p>
                  <div className="paper-card-row">
                    {player.cards.map((card) =>
                      card ? <PaperPlayingCard key={card.id} card={card} compact /> : null,
                    )}
                  </div>
                </>
              ) : null}
              {data.round_result[player.id] ? (
                <p className="small">
                  {data.round_result[player.id].award} points this round ·{' '}
                  {data.round_result[player.id].card_points} from cards · color bonus{' '}
                  {data.round_result[player.id].color_bonus}
                </p>
              ) : null}
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
