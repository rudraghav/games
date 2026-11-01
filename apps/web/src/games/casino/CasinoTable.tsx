'use client';
import { type CSSProperties } from 'react';
import { Hand, PlayingCard, Seat, TokenArt } from '@games/ui';
import { blackjackDetails } from '@games/api-client';
import { ActionPanel } from '../shared/ActionPanel';
import type { TableProps } from '../types';

// Crowded tables need distinct top, side and bottom bands, not equal ellipse angles.
const crowdedSeats: Record<number, [number, number][]> = {
  5: [
    [50, 85],
    [8, 52],
    [30, 18],
    [70, 18],
    [92, 52],
  ],
  6: [
    [35, 85],
    [8, 52],
    [35, 18],
    [65, 18],
    [92, 52],
    [65, 85],
  ],
  7: [
    [35, 85],
    [8, 52],
    [20, 18],
    [50, 18],
    [80, 18],
    [92, 52],
    [65, 85],
  ],
  8: [
    [50, 85],
    [20, 85],
    [8, 52],
    [20, 18],
    [50, 18],
    [80, 18],
    [92, 52],
    [80, 85],
  ],
  9: [
    [50, 85],
    [25, 85],
    [8, 52],
    [17, 18],
    [39, 18],
    [61, 18],
    [83, 18],
    [92, 52],
    [75, 85],
  ],
};

export function CasinoTable(props: TableProps) {
  const { match, room, selfId } = props;
  const blackjack = match.id === 'blackjack' ? blackjackDetails(match.detail) : null;
  const showOwnHand = blackjack ? blackjack.hands.length > 0 : match.hand.length > 0;
  return (
    <div className="table-layout casino-layout" data-phase={match.phase}>
      <div className="casino-controls">
        {showOwnHand ? (
          <div className="private-hand">
            <div className="hand-heading">
              <h3>{blackjack ? 'Your hands' : 'Your cards'}</h3>
            </div>
            {blackjack ? (
              <div className="blackjack-hands">
                {blackjack.hands.map((hand, index) => (
                  <section
                    className="blackjack-hand"
                    data-active={blackjack.activeHand === index}
                    key={index}
                    aria-label={`Hand ${index + 1}${blackjack.activeHand === index ? ', active' : ''}`}
                  >
                    <p>
                      <strong>
                        Hand {index + 1}
                        {blackjack.activeHand === index ? ' · active' : ''}
                      </strong>
                      <span>{hand.bet} chips bet</span>
                    </p>
                    <Hand cards={hand.cards} label={`Cards in hand ${index + 1}`} compact />
                  </section>
                ))}
              </div>
            ) : (
              <Hand cards={match.hand} />
            )}
          </div>
        ) : null}
        <ActionPanel {...props} />
      </div>
      <div className="casino-table" data-players={match.players.length}>
        <div className="casino-felt">
          <span className="table-watermark">g.</span>
          <p className="eyebrow">{match.id === 'blackjack' ? 'Dealer' : 'The table'}</p>
          <div className="community-cards">
            {match.community.map((card) => (
              <PlayingCard key={card.id} card={card} compact />
            ))}
            {match.detail.dealer_hidden ? <PlayingCard faceDown compact /> : null}
          </div>
          <div className="pot">
            <span className="chip-symbol">
              <TokenArt kind="poker" />
            </span>
            {match.id === 'blackjack' ? (
              'Blackjack pays 3:2'
            ) : (
              <>
                <strong>{match.pot}</strong>
                <span>in the pot</span>
              </>
            )}
          </div>
        </div>
        <div className="casino-seats">
          {match.players.map((player, i) => {
            const member = room.members.find((m) => m.id === player.id);
            const angle = (i / match.players.length) * Math.PI * 2 + Math.PI / 2;
            const [x, y] = crowdedSeats[match.players.length]?.[i] ?? [
              50 + 40 * Math.cos(angle),
              48 + 37 * Math.sin(angle),
            ];
            const style = {
              '--seat-x': `${x}%`,
              '--seat-y': `${y}%`,
            } as CSSProperties;
            const cards = player.id === selfId && !player.cards.length ? match.hand : player.cards;
            return (
              <div
                className="casino-seat"
                style={style}
                key={player.id}
                data-folded={player.folded}
              >
                <Seat
                  name={member?.name || 'Player'}
                  you={player.id === selfId}
                  avatar={member?.avatar}
                  bot={member?.isBot}
                  compact
                  connected={member?.connected ?? false}
                  active={match.currentPlayer === player.id}
                  caption={player.folded ? 'Folded' : `${player.chips ?? 0} chips`}
                />
                {(player.id !== selfId || !showOwnHand) &&
                (cards.length > 0 || player.count > 0) ? (
                  <div className="seat-cards" aria-label="Player cards">
                    {cards.length
                      ? cards.map((card, index) => (
                          <PlayingCard
                            key={card?.id || index}
                            card={card || undefined}
                            faceDown={!card}
                            compact
                          />
                        ))
                      : Array.from({ length: player.count }, (_, i) => (
                          <PlayingCard key={i} faceDown compact />
                        ))}
                  </div>
                ) : null}
                {player.bet > 0 ? (
                  <span className="seat-bet">
                    <TokenArt kind="poker" /> {player.bet}
                  </span>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
