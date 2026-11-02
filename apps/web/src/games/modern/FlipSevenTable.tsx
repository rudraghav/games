'use client';
import { PlayingCard, HorizontalRail } from '@games/ui';
import { flipSevenDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { ActionPanel } from '../shared/ActionPanel';
import { playerName, type TableProps } from '../types';

export function FlipSevenTable(props: TableProps) {
  const { match, room, selfId } = props;
  const data = flipSevenDetails(match.detail);
  const review = ['round_over', 'finished'].includes(match.phase);
  const pendingEffects: Record<string, string> = {
    Freeze: 'Freeze banks the chosen player’s round points.',
    'Flip Three':
      'Flip Three makes the chosen player draw up to three cards; a duplicate can bust them.',
    'Second Chance': 'Second Chance protects the chosen player from one duplicate number.',
  };
  const pendingEffect = pendingEffects[data.pending_card];
  const players = [...match.players].sort(
    (a, b) => Number(b.id === selfId) - Number(a.id === selfId),
  );
  function playerTable(player: (typeof match.players)[number]) {
    const score = review ? (data.round_scores[player.id] ?? 0) : data.at_risk[player.id];
    const scoreLabel =
      review || data.status[player.id] === 'busted'
        ? 'this round'
        : data.status[player.id] === 'active'
          ? 'at stake'
          : 'banked';
    return (
      <details
        className="flip-player"
        key={player.id}
        data-current={match.currentPlayer === player.id}
        data-status={data.status[player.id]}
        data-own={player.id === selfId}
        open={player.id === selfId || match.currentPlayer === player.id}
      >
        <summary className="flip-player-name">
          <span className="flip-player-identity">
            <strong>
              {playerName(room, player.id)}
              {player.id === selfId ? ' · you' : ''}
            </strong>
            <small>
              {data.status[player.id]} · {player.cards.length}{' '}
              {player.cards.length === 1 ? 'card' : 'cards'}
            </small>
          </span>
          <span className="flip-round-score">
            <b>{score}</b> {scoreLabel}
          </span>
        </summary>
        <HorizontalRail
          label={`${playerName(room, player.id)} public cards`}
          contentClassName="flip-card-row"
        >
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
        </HorizontalRail>
      </details>
    );
  }
  return (
    <div className="table-layout stable-game-table modern-game">
      <PlayerStrip {...props} playerCaption={(p) => `${p.score} / 200 points`} />
      <section className="flip-seven-table" aria-label="Flip 7 table">
        <div className="modern-game-heading">
          <div>
            <p className="eyebrow">Round {data.round}</p>
            <h2>Your round</h2>
          </div>
          <span className="small muted">{match.drawCount} cards in the shoe</span>
        </div>
        {players.filter((player) => player.id === selfId).map(playerTable)}
        <ActionPanel
          {...props}
          instruction={
            data.pending_card
              ? `${pendingEffect || data.pending_card} Choose an eligible player.`
              : review
                ? 'Round complete.'
                : 'A duplicate busts. Seven different numbers end the round with a 15-point bonus.'
          }
        />
        <div className="flip-player-grid" aria-label="Other players’ cards and round scores">
          {players.filter((player) => player.id !== selfId).map(playerTable)}
        </div>
      </section>
    </div>
  );
}
