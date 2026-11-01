'use client';
import { useState, type CSSProperties } from 'react';
import { Hand, PlayingCard, Seat } from '@games/ui';
import { ActionPanel } from '../shared/ActionPanel';
import type { TableProps } from '../types';

export function CasinoTable(props: TableProps) {
  const { match, room, selfId } = props;
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="table-layout">
      <div className="casino-table">
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
            <span className="chip-symbol">◉</span>
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
            const style = {
              '--seat-x': `${50 + 40 * Math.cos(angle)}%`,
              '--seat-y': `${48 + 37 * Math.sin(angle)}%`,
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
                  compact
                  connected={member?.connected ?? false}
                  active={match.currentPlayer === player.id}
                  caption={player.folded ? 'Folded' : `${player.chips ?? 0} chips`}
                />
                <div className="seat-cards">
                  {cards.length
                    ? cards.map((card, index) => (
                        <PlayingCard
                          key={card?.id || index}
                          card={card || undefined}
                          faceDown={!card}
                          compact
                        />
                      ))
                    : Array.from(
                        { length: player.count || (match.id === 'teen-patti' ? 3 : 2) },
                        (_, i) => <PlayingCard key={i} faceDown compact />,
                      )}
                </div>
                {player.bet > 0 ? <span className="seat-bet">◉ {player.bet}</span> : null}
              </div>
            );
          })}
        </div>
      </div>
      {match.hand.length ? (
        <div className="private-hand">
          <div className="hand-heading">
            <h3>
              {match.id === 'blackjack'
                ? `Your active hand · ${Number(match.detail.hand_index || 0) + 1}`
                : 'Your cards'}
            </h3>
          </div>
          <Hand
            cards={match.hand}
            selectedIds={selected ? [selected] : []}
            onSelect={(id) => setSelected(id === selected ? null : id)}
          />
        </div>
      ) : null}
      <ActionPanel {...props} />
    </div>
  );
}
