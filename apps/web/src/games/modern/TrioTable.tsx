'use client';
import { Button, PlayingCard } from '@games/ui';
import { trioDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';

export function TrioTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = trioDetails(match.detail);
  const blocked = pending || room.paused;
  const review = match.actions.find((o) => o.value.type === 'continue');
  const tableChoices = new Map(
    match.actions.filter((o) => o.value.type === 'reveal_table').map((o) => [o.value.choice, o]),
  );
  return (
    <div className="table-layout modern-game">
      <PlayerStrip
        {...props}
        playerCaption={(p) => `${p.score} ${p.score === 1 ? 'trio' : 'trios'} · ${p.count} cards`}
      />
      <section className="trio-table" aria-label="Trio table">
        <div className="modern-game-heading">
          <div>
            <p className="eyebrow">Simple mode</p>
            <h2>Remember. Reveal. Repeat.</h2>
          </div>
          <span className="small muted">Three trios, or the sevens.</span>
        </div>
        <section className="trio-own-hand" aria-label="Your private sorted hand">
          <p className="eyebrow">Your sorted hand</p>
          <div className="flip-card-row">
            {match.hand.map((card) => (
              <PlayingCard key={card.id} card={card} family="grid" compact />
            ))}
            {!match.hand.length ? <span className="small muted">Your hand is empty.</span> : null}
          </div>
        </section>
        <div className="trio-table-cards" aria-label="Face-down table positions">
          {match.community.map((card, index) => {
            const choice = tableChoices.get(String(index));
            return card.suit === 'empty' ? (
              <div className="trio-empty" key={card.id} aria-label={card.label} />
            ) : (
              <PlayingCard
                key={`slot-${index}`}
                card={card}
                faceDown={card.suit === 'hidden'}
                family="grid"
                compact
                label={choice?.label || card.label}
                onClick={choice ? () => onAction(choice.value) : undefined}
                disabled={blocked || !choice}
              />
            );
          })}
        </div>
        <div className="trio-reveals" aria-label="This turn’s revealed cards" aria-live="polite">
          {data.revealed.length ? (
            data.revealed.map((reveal) => (
              <div key={reveal.card.id}>
                <PlayingCard card={reveal.card} family="grid" compact />
                <span className="small muted">
                  {reveal.owner === 'table'
                    ? `Table ${reveal.slot + 1}`
                    : playerName(room, reveal.owner)}
                </span>
              </div>
            ))
          ) : (
            <p className="muted">A matching three is waiting to be found.</p>
          )}
        </div>
        <div className="trio-hands" aria-label="Player hands and collections">
          {match.players.map((player) => (
            <section className="trio-player" key={player.id}>
              <div>
                <strong>
                  {playerName(room, player.id)}
                  {player.id === selfId ? ' · you' : ''}
                </strong>
                <span className="small muted">{player.count} in hand</span>
              </div>
              <div className="trio-end-actions">
                {['low', 'high'].map((edge) => {
                  const option = match.actions.find(
                    (o) =>
                      o.value.type === 'reveal_hand' &&
                      o.value.target === player.id &&
                      o.value.choice === edge,
                  );
                  return (
                    <Button
                      key={edge}
                      size="sm"
                      variant="secondary"
                      disabled={blocked || !option}
                      onClick={() => option && onAction(option.value)}
                    >
                      {edge === 'low' ? 'Lowest' : 'Highest'}
                    </Button>
                  );
                })}
              </div>
              {player.bank.length ? (
                <div className="trio-collections" aria-label="Collected trios">
                  {player.bank
                    .filter((_, i) => i % 3 === 0)
                    .map((card) => (
                      <span key={card.id}>
                        {card.value}
                        <small>×3</small>
                      </span>
                    ))}
                </div>
              ) : null}
            </section>
          ))}
        </div>
        {review ? (
          <div className="modern-review">
            <p>
              {data.failed
                ? 'Take a moment to remember those numbers.'
                : 'A perfect three. Your collection is growing.'}
            </p>
            <Button disabled={blocked} onClick={() => onAction(review.value)}>
              Continue
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
