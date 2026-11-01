'use client';
import { PlayingCard } from '@games/ui';
import { flipSevenDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { ActionPanel } from '../shared/ActionPanel';
import { playerName, type TableProps } from '../types';

export function FlipSevenTable(props: TableProps) {
  const { match, room, selfId } = props;
  const data = flipSevenDetails(match.detail);
  const review = ['round_over', 'finished'].includes(match.phase);
  return (
    <div className="table-layout modern-game">
      <PlayerStrip {...props} playerCaption={(p) => `${p.score} / 200 points`} />
      <ActionPanel
        {...props}
        instruction={
          data.pending_card
            ? `Choose an active player for ${data.pending_card}.`
            : review
              ? 'Round complete.'
              : 'Draw or stay. Seven different numbers ends the round.'
        }
      />
      <section className="flip-seven-table" aria-label="Flip 7 table">
        <div className="modern-game-heading">
          <div>
            <p className="eyebrow">Round {data.round}</p>
            <h2>Cards in play</h2>
          </div>
          <span className="small muted">{match.drawCount} cards in the shoe</span>
        </div>
        <div className="flip-player-grid">
          {[...match.players]
            .sort((a, b) => Number(b.id === selfId) - Number(a.id === selfId))
            .map((player) => (
              <section
                className="flip-player"
                key={player.id}
                data-current={match.currentPlayer === player.id}
                data-status={data.status[player.id]}
              >
                <div className="flip-player-name">
                  <strong>
                    {playerName(room, player.id)}
                    {player.id === selfId ? ' · you' : ''}
                  </strong>
                  <span>{data.status[player.id]}</span>
                </div>
                <div className="flip-card-row">
                  {player.cards.map((card, index) =>
                    card ? (
                      <PlayingCard
                        key={card.id}
                        card={card}
                        family="shedding"
                        compact
                        className="flip-number-card"
                      />
                    ) : (
                      <PlayingCard key={index} faceDown compact />
                    ),
                  )}
                  {!player.cards.length ? <span className="small muted">No cards yet</span> : null}
                </div>
                <p className="flip-round-score">
                  <b>{review ? (data.round_scores[player.id] ?? 0) : data.at_risk[player.id]}</b>{' '}
                  {review
                    ? 'this round'
                    : data.status[player.id] === 'active'
                      ? 'at stake'
                      : data.status[player.id] === 'busted'
                        ? 'this round'
                        : 'banked'}
                </p>
              </section>
            ))}
        </div>
      </section>
    </div>
  );
}
