'use client';
import { useState } from 'react';
import { Hand, PlayingCard, Seat, CardPile } from '@games/ui';
import { ActionPanel } from '../shared/ActionPanel';
import type { TableProps } from '../types';

export function DealTable(props: TableProps) {
  const { match, room, selfId } = props;
  const [selected, setSelected] = useState<string | null>(null);
  const select = (id: string) => setSelected(id === selected ? null : id);
  return (
    <div className="table-layout deal-layout">
      <div className="deal-piles">
        <CardPile label="Draw" count={match.drawCount} family="property" />
        <CardPile label="Discard" card={match.discard} family="property" />
        <span className="small muted">{Number(match.detail.moves ?? 0)} actions this turn</span>
      </div>
      <div className="private-hand">
        <div className="hand-heading">
          <h3>
            Your hand <span className="muted">{match.hand.length}</span>
          </h3>
        </div>
        <Hand
          cards={match.hand}
          family="property"
          selectedIds={selected ? [selected] : []}
          onSelect={select}
        />
      </div>
      <ActionPanel
        {...props}
        selected={selected}
        cardSelectionRequired
        clear={() => setSelected(null)}
        onAction={(action) => {
          props.onAction(action);
          setSelected(null);
        }}
      />
      <div className="deal-table">
        <div className="property-players">
          {match.players.map((player) => {
            const member = room.members.find((m) => m.id === player.id);
            const hasAssets =
              player.bank.length > 0 ||
              Object.values(player.properties).some((cards) => cards.length > 0);
            const own = player.id === selfId;
            return (
              <article
                className="property-player"
                key={player.id}
                data-own={own}
                data-empty={!hasAssets}
              >
                <Seat
                  compact
                  name={member?.name || 'Player'}
                  you={player.id === selfId}
                  avatar={member?.avatar}
                  bot={member?.isBot}
                  active={match.currentPlayer === player.id}
                  caption={`${player.count} cards in hand${!hasAssets ? ' · no assets' : ''}`}
                  connected={member?.connected ?? false}
                />
                {hasAssets || own ? (
                  <>
                    <div className="bank-row">
                      <span className="eyebrow">Bank</span>
                      <div className="bank-cards">
                        {player.bank.map((card) => (
                          <PlayingCard
                            key={card.id}
                            card={card}
                            family="property"
                            compact
                            selected={selected === card.id}
                            onClick={
                              match.actions.some((option) => option.value.card === card.id)
                                ? () => select(card.id)
                                : undefined
                            }
                          />
                        ))}
                        {!player.bank.length ? (
                          <span className="small muted">Nothing banked yet</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="property-sets">
                      {Object.entries(player.properties).map(([group, cards]) => (
                        <div className="property-set" key={group}>
                          <span className="eyebrow">{group.split(':')[0]}</span>
                          <div className="property-set-cards">
                            {cards.map((card) => (
                              <PlayingCard
                                key={card.id}
                                card={card}
                                family="property"
                                compact
                                selected={selected === card.id}
                                onClick={
                                  match.actions.some((option) => option.value.card === card.id)
                                    ? () => select(card.id)
                                    : undefined
                                }
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                      {!Object.keys(player.properties).length ? (
                        <p className="small muted empty-properties">No properties yet.</p>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
