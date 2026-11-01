'use client';
import { CardPile, PlayingCard, Seat } from '@games/ui';
import { ActionPanel } from '../shared/ActionPanel';
import type { TableProps } from '../types';

export function SkyjoTable(props: TableProps) {
  const { match, room, selfId, onAction, pending } = props;
  return (
    <div className="table-layout">
      <div className="skyjo-table">
        <div className="skyjo-piles">
          <CardPile label="Draw" family="grid" count={match.drawCount} />
          <CardPile label="Discard" family="grid" card={match.discard} />
          {match.drawn ? (
            <CardPile label="Your drawn card" family="grid" card={match.drawn} />
          ) : null}
          <span className="eyebrow">Round {String(match.detail.round ?? 1)}</span>
        </div>
        <div className="skyjo-players">
          {match.players.map((player) => {
            const member = room.members.find((m) => m.id === player.id);
            return (
              <article className="skyjo-player" key={player.id} data-own={player.id === selfId}>
                <Seat
                  compact
                  name={member?.name || 'Player'}
                  you={player.id === selfId}
                  avatar={member?.avatar}
                  active={match.currentPlayer === player.id}
                  caption={`${player.score} points`}
                  connected={member?.connected ?? false}
                />
                <div className="skyjo-grid">
                  {player.cards.map((card, slot) => {
                    if (player.removedSlots.includes(slot))
                      return (
                        <div
                          className="grid-card-empty"
                          key={slot}
                          aria-label={`Removed card, row ${Math.floor(slot / 4) + 1}, column ${(slot % 4) + 1}`}
                        />
                      );
                    const action =
                      player.id === selfId
                        ? match.actions.find(
                            (option) =>
                              ['reveal', 'swap'].includes(option.value.type) &&
                              option.value.slot === slot,
                          )
                        : undefined;
                    return (
                      <PlayingCard
                        key={slot}
                        card={card || undefined}
                        faceDown={!card}
                        family="grid"
                        compact
                        label={`${card?.label || 'Face-down card'}, row ${Math.floor(slot / 4) + 1}, column ${(slot % 4) + 1}`}
                        onClick={action ? () => onAction(action.value) : undefined}
                        disabled={pending || room.paused}
                      />
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </div>
      <ActionPanel
        {...props}
        match={{
          ...match,
          actions: match.actions.filter(
            (option) => !['reveal', 'swap'].includes(option.value.type),
          ),
        }}
      />
      <p className="small muted table-help">
        Choose a card in your grid to reveal or replace it. Three matching cards in a column
        disappear.
      </p>
    </div>
  );
}
