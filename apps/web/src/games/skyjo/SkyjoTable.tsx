'use client';
import { CardPile, PlayingCard, Seat } from '@games/ui';
import { ActionPanel } from '../shared/ActionPanel';
import { TablePile } from '../shared/TablePile';
import type { TableProps } from '../types';

export function SkyjoTable(props: TableProps) {
  const { match, room, selfId, onAction, pending } = props;
  const viewer = match.players.findIndex((player) => player.id === selfId);
  const players =
    viewer < 0
      ? match.players
      : [...match.players.slice(viewer), ...match.players.slice(0, viewer)];
  const stockAction = match.actions.find((option) => option.value.type === 'draw_stock');
  const discardAction = match.actions.find((option) => option.value.type === 'draw_discard');
  return (
    <div className="table-layout skyjo-workspace">
      <div className="skyjo-table">
        <div className="skyjo-piles">
          <TablePile
            label="Draw"
            family="grid"
            count={match.drawCount}
            action={stockAction}
            onAction={onAction}
            pending={pending}
            paused={room.paused}
          />
          <TablePile
            label="Discard"
            family="grid"
            card={match.discard}
            action={discardAction}
            onAction={onAction}
            pending={pending}
            paused={room.paused}
          />
          {match.drawn ? (
            <CardPile label="Your drawn card" family="grid" card={match.drawn} />
          ) : null}
          <span className="eyebrow">Round {String(match.detail.round ?? 1)}</span>
        </div>
        <ActionPanel
          {...props}
          instruction={
            match.currentPlayer === selfId &&
            match.actions.some((option) => ['reveal', 'swap'].includes(option.value.type))
              ? match.actions.some((option) => option.value.type === 'swap')
                ? 'Choose a card in your grid to replace.'
                : 'Choose a face-down card in your grid to reveal.'
              : stockAction || discardAction
                ? 'Choose either pile, then replace a card in your grid.'
                : undefined
          }
          match={{
            ...match,
            actions: match.actions.filter(
              (option) =>
                !['reveal', 'swap', 'draw_stock', 'draw_discard'].includes(option.value.type),
            ),
          }}
        />
        <div className="skyjo-players">
          {players.map((player) => {
            const member = room.members.find((m) => m.id === player.id);
            return (
              <article className="skyjo-player" key={player.id} data-own={player.id === selfId}>
                <Seat
                  compact
                  name={member?.name || 'Player'}
                  you={player.id === selfId}
                  avatar={member?.avatar}
                  bot={member?.isBot}
                  active={match.currentPlayer === player.id}
                  caption={`${player.score} total points`}
                  connected={member?.connected ?? false}
                />
                <div
                  className="skyjo-grid"
                  role="group"
                  aria-label={
                    player.id === selfId
                      ? 'Your Skyjo grid'
                      : `${member?.name || 'Player'}’s Skyjo grid`
                  }
                >
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
                        playable={!!action}
                        label={`${action ? (action.value.type === 'swap' ? 'Replace' : 'Reveal') : card?.label || 'Face-down card'}, row ${Math.floor(slot / 4) + 1}, column ${(slot % 4) + 1}${action && card ? `, ${card.label}` : ''}`}
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
      <p className="small muted table-help">
        Three matching cards in a column disappear, including during the final reveal.
      </p>
    </div>
  );
}
