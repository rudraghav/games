'use client';
import { Button, PlayingCard, DecisionDock } from '@games/ui';
import { trioDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';

/** Which end of a hand each reveal came from. Public, like the request; read defensively. */
function revealEdges(detail: Record<string, unknown>) {
  const raw = Array.isArray(detail.revealed) ? detail.revealed : [];
  return raw.map((item) => {
    const edge =
      typeof item === 'object' && item !== null ? (item as Record<string, unknown>).edge : null;
    return edge === 'low' ? 'lowest' : edge === 'high' ? 'highest' : null;
  });
}

export function TrioTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = trioDetails(match.detail);
  const edges = revealEdges(match.detail);
  const blocked = pending || room.paused;
  const review = match.actions.find((o) => o.value.type === 'continue');
  const current = match.currentPlayer;
  const finished = match.phase === 'finished';
  const tableChoices = new Map(
    match.actions.filter((o) => o.value.type === 'reveal_table').map((o) => [o.value.choice, o]),
  );
  // Whose reveals these are: the player whose turn it is, or the winner at the end.
  const owner = current ?? match.winners[0] ?? null;
  const you = owner === selfId;
  const who = owner ? (you ? 'You' : playerName(room, owner)) : '';
  const value = data.revealed[0]?.card.value;

  /** One line on the strip that says what the cards on it mean right now. */
  function revealStatus() {
    if (!data.revealed.length || !owner) return null;
    if (finished) return `${who} collected the winning trio.`;
    if (match.phase === 'review')
      return data.failed
        ? `No match. The cards go back when ${you ? 'you continue' : `${who} continues`}.`
        : `${who} collected three ${value}s.`;
    const third = data.revealed.length === 2;
    return `${who} ${you ? 'are' : 'is'} looking for ${third ? 'the third' : 'another'} ${value}.`;
  }

  /** The dock tells a waiting seat whom they wait for, never the actor's instruction. */
  function dockText() {
    if (match.actions.length)
      return 'Tap a table card, or Lowest or Highest on any player, yourself included.';
    if (!owner) return null;
    if (match.phase === 'review')
      return data.failed
        ? `${who} is looking at the reveals. The cards go back when they continue.`
        : `${who} collected a trio. Play passes when they continue.`;
    return `Waiting for ${who}. They keep revealing while the numbers match.`;
  }

  return (
    <div className="table-layout stable-game-table modern-game" data-phase={match.phase}>
      <PlayerStrip
        {...props}
        playerCaption={(p) => `${p.score} ${p.score === 1 ? 'trio' : 'trios'} · ${p.count} cards`}
      />
      <section className="trio-table" aria-label="Trio table">
        <div className="modern-game-heading">
          <div>
            <p className="eyebrow">Simple mode</p>
            <h2>Find three matching cards</h2>
          </div>
          <span className="small muted">Three trios or the sevens wins.</span>
        </div>
        <div className="trio-layout">
          <div className="trio-board">
            <section className="trio-own-hand" aria-label="Your private sorted hand">
              <p className="eyebrow">Your hand · private · low to high</p>
              <div className="flip-card-row">
                {match.hand.map((card) => (
                  <PlayingCard key={card.id} card={card} family="grid" compact />
                ))}
                {!match.hand.length ? (
                  <span className="small muted">Your hand is empty.</span>
                ) : null}
              </div>
            </section>
            <h3 className="trio-zone-heading">Table cards</h3>
            <div className="trio-table-cards" aria-label="Face-down table positions">
              {match.community.map((card, index) => {
                const choice = tableChoices.get(String(index));
                return (
                  <div className="trio-table-slot" key={`slot-${index}`}>
                    {card.suit === 'empty' ? (
                      <div
                        className="trio-empty"
                        key={card.id}
                        role="img"
                        aria-label={card.label}
                      />
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
                    )}
                    <small>{index + 1}</small>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="trio-side">
            <section
              className="trio-reveals"
              data-empty={!data.revealed.length}
              data-active={data.revealed.length > 0 && !finished}
              aria-label="This turn’s revealed cards"
              aria-live="polite"
            >
              {data.revealed.length ? (
                <>
                  <p className="trio-reveal-status">{revealStatus()}</p>
                  <div className="trio-reveal-cards">
                    {data.revealed.map((reveal, index) => {
                      const name =
                        reveal.owner === 'table'
                          ? `Table ${reveal.slot + 1}`
                          : reveal.owner === selfId
                            ? 'You'
                            : playerName(room, reveal.owner);
                      return (
                        <figure className="trio-reveal" key={reveal.card.id}>
                          <PlayingCard card={reveal.card} family="grid" compact />
                          <figcaption>
                            <span className="trio-reveal-owner" title={name}>
                              {name}
                            </span>
                            {edges[index] ? (
                              <span className="trio-reveal-edge">{edges[index]}</span>
                            ) : null}
                          </figcaption>
                        </figure>
                      );
                    })}
                  </div>
                  {review ? (
                    <Button
                      className="trio-continue"
                      disabled={blocked}
                      onClick={() => onAction(review.value)}
                    >
                      Continue
                    </Button>
                  ) : null}
                </>
              ) : (
                <p className="muted">
                  {match.actions.length
                    ? 'Choose a table card or ask for a player’s lowest or highest.'
                    : owner
                      ? `${who} hasn’t revealed a card yet this turn.`
                      : 'No cards revealed.'}
                </p>
              )}
            </section>
            <div className="trio-hands" aria-label="Player hands and collections">
              {match.players.map((player) => (
                <section
                  className="trio-player"
                  key={player.id}
                  data-own={player.id === selfId}
                  data-current={player.id === current}
                >
                  <div>
                    <strong>
                      {player.id === selfId ? (
                        <span className="trio-you" title={playerName(room, player.id)}>
                          You
                        </span>
                      ) : (
                        <span className="trio-player-name">{playerName(room, player.id)}</span>
                      )}
                    </strong>
                    <span className="small muted">
                      {player.count} in hand{player.id === current ? ' · their turn' : ''}
                    </span>
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
                          aria-label={`${edge === 'low' ? 'Lowest' : 'Highest'} card · ${playerName(room, player.id)}`}
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
            {finished || review ? null : (
              <DecisionDock
                className="modern-review trio-review"
                size="fit"
                label="Trio turn review"
              >
                <p className="small muted">{dockText()}</p>
              </DecisionDock>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
