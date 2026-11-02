'use client';
import { CardPile, PlayingCard, Seat, HorizontalRail } from '@games/ui';
import { OpponentPanel } from '../shared/OpponentPanel';
import { ActionPanel } from '../shared/ActionPanel';
import { TablePile } from '../shared/TablePile';
import type { TableProps } from '../types';
import { skyjoDetails } from '@games/api-client';
import { playerName } from '../types';

export function SkyjoTable(props: TableProps) {
  const { match, room, selfId, onAction, pending } = props;
  const data = skyjoDetails(match.detail);
  const viewer = match.players.findIndex((player) => player.id === selfId);
  const players =
    viewer < 0
      ? match.players
      : [...match.players.slice(viewer), ...match.players.slice(0, viewer)];
  const stockAction = match.actions.find((option) => option.value.type === 'draw_stock');
  const discardAction = match.actions.find((option) => option.value.type === 'draw_discard');
  function grid(playerId: string, own: boolean) {
    const player = players.find((item) => item.id === playerId)!;
    const member = room.members.find((item) => item.id === playerId);
    return (
      <div
        className="skyjo-grid"
        role="group"
        aria-label={own ? 'Your Skyjo grid' : `${member?.name || 'Player'}’s Skyjo grid`}
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
          const action = own
            ? match.actions.find(
                (option) =>
                  ['reveal', 'swap'].includes(option.value.type) && option.value.slot === slot,
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
    );
  }
  return (
    <div className="table-layout stable-game-table skyjo-workspace">
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
          <span className="eyebrow">Round {data.round}</span>
        </div>
        <ActionPanel
          {...props}
          dockSize="compact"
          instruction={
            data.finisher && !['between_rounds', 'finished'].includes(match.phase)
              ? `${playerName(room, data.finisher)} closed the round. Everyone else gets one final turn.`
              : match.currentPlayer === selfId &&
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
          {players
            .filter((player) => player.id === selfId)
            .map((player) => {
              const member = room.members.find((m) => m.id === player.id);
              return (
                <article className="skyjo-player" key={player.id} data-own="true">
                  <Seat
                    compact
                    name={member?.name || 'Player'}
                    you
                    avatar={member?.avatar}
                    bot={member?.isBot}
                    active={match.currentPlayer === player.id}
                    caption={`${player.score} total points`}
                    connected={member?.connected ?? false}
                  />
                  {grid(player.id, true)}
                </article>
              );
            })}
        </div>
        <HorizontalRail
          label="Other Skyjo players"
          navigationLabel="Skyjo players"
          className="skyjo-opponents"
          contentClassName="skyjo-opponent-row"
        >
          {players
            .filter((player) => player.id !== selfId)
            .map((player) => {
              const revealed = player.cards.filter(
                (card, slot) => card && !player.removedSlots.includes(slot),
              );
              const hidden = player.cards.filter(
                (card, slot) => !card && !player.removedSlots.includes(slot),
              ).length;
              return (
                <OpponentPanel
                  key={player.id}
                  player={player}
                  room={room}
                  active={match.currentPlayer === player.id}
                  caption={`${player.score} total points`}
                  summary={
                    <>
                      <span className="opponent-facts">
                        {revealed.length} revealed · {hidden} hidden
                      </span>
                      <div className="skyjo-mini-grid" aria-label="Revealed grid summary">
                        {player.cards.map((card, slot) => (
                          <span
                            key={slot}
                            data-hidden={!card}
                            data-removed={player.removedSlots.includes(slot)}
                            aria-label={
                              player.removedSlots.includes(slot)
                                ? 'Removed slot'
                                : card?.label || 'Face-down card'
                            }
                          >
                            {player.removedSlots.includes(slot) ? '–' : card?.value || '•'}
                          </span>
                        ))}
                      </div>
                    </>
                  }
                >
                  {grid(player.id, false)}
                </OpponentPanel>
              );
            })}
        </HorizontalRail>
      </div>
      <p className="small muted table-help">
        Three matching cards in a column disappear, including during the final reveal. Lowest total
        wins; the game ends when anyone reaches 100. A closer with a positive round score doubles it
        unless it is strictly lowest.
      </p>
    </div>
  );
}
