'use client';
import { Button, CardPile, PlayingCard, Seat } from '@games/ui';
import { skyjoDetails, type Player } from '@games/api-client';
import { OpponentPanel } from '../shared/OpponentPanel';
import { ActionPanel } from '../shared/ActionPanel';
import { TablePile } from '../shared/TablePile';
import { playerName, type TableProps } from '../types';
import { useRecentSlots } from './recent-slots';

/** Moves made on the table itself: piles, grid cards and the round review. */
const TABLE_MOVES = ['reveal', 'swap', 'draw_stock', 'draw_discard', 'discard', 'next_round'];
/** The printed colour band of a value, matching the card faces (negative, 0, 1-4, 5-8, 9-12). */
const band = (value: string) => {
  const number = Number(value);
  return number < 0
    ? 'negative'
    : number === 0
      ? 'zero'
      : number < 5
        ? 'low'
        : number < 9
          ? 'middle'
          : 'high';
};
const position = (slot: number) => `row ${Math.floor(slot / 4) + 1}, column ${(slot % 4) + 1}`;
const inPlay = (player: Player) =>
  player.cards
    .map((card, slot) => ({ card, slot }))
    .filter(({ slot }) => !player.removedSlots.includes(slot));

export function SkyjoTable(props: TableProps) {
  const { match, room, selfId, onAction, pending } = props;
  const data = skyjoDetails(match.detail);
  const recent = useRecentSlots(match, data.round);
  const blocked = pending || room.paused;
  const viewer = match.players.findIndex((player) => player.id === selfId);
  const players =
    viewer < 0
      ? match.players
      : [...match.players.slice(viewer), ...match.players.slice(0, viewer)];
  const others = players.filter((player) => player.id !== selfId);
  const find = (type: string) => match.actions.find((option) => option.value.type === type);
  const stockAction = find('draw_stock');
  // After a private draw the discard pile is where an unwanted card goes.
  const discardAction = find('draw_discard') || find('discard');
  const nextRound = find('next_round');
  const current = match.currentPlayer;
  const review = ['between_rounds', 'finished'].includes(match.phase);
  const name = (id: string) => (id === selfId ? 'You' : playerName(room, id));

  /** What a waiting seat can know about the current move, from public information only. */
  function waiting() {
    if (!current || current === selfId) return undefined;
    const who = playerName(room, current);
    const last = room.activity.at(-1);
    if (match.phase === 'opening') return `Waiting for ${who} to turn over two cards.`;
    if (match.phase === 'reveal')
      return `${who} discarded the drawn card and is turning over a card.`;
    if (match.phase === 'between_rounds')
      return `Waiting for ${who} to start round ${data.round + 1}.`;
    if (last?.actorId === current && last.type === 'draw_stock')
      return `${who} drew from the deck and is deciding where it goes.`;
    if (last?.actorId === current && last.type === 'draw_discard')
      return `${who} took the discard and is choosing a card to replace.`;
    return `${who} is choosing the deck or the discard pile.`;
  }

  function grid(player: Player, own: boolean) {
    const changed = recent[player.id] ?? [];
    return (
      <div
        className="skyjo-grid"
        role="group"
        aria-label={own ? 'Your Skyjo grid' : `${playerName(room, player.id)}’s Skyjo grid`}
      >
        {player.cards.map((card, slot) => {
          if (player.removedSlots.includes(slot))
            return (
              <div
                className="grid-card-empty"
                key={slot}
                role="img"
                data-recent={changed.includes(slot) || undefined}
                aria-label={`Removed card, ${position(slot)}`}
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
              className={changed.includes(slot) ? 'skyjo-recent' : undefined}
              label={`${action ? (action.value.type === 'swap' ? 'Replace' : 'Reveal') : card?.label || 'Face-down card'}, ${position(slot)}${action && card ? `, ${card.label}` : ''}`}
              onClick={action ? () => onAction(action.value) : undefined}
              disabled={blocked}
            />
          );
        })}
      </div>
    );
  }

  /** Public facts that decide the round: who can close it, and what just changed. */
  function badges(player: Player) {
    const hidden = inPlay(player).filter(({ card }) => !card).length;
    const cleared = (recent[player.id] ?? []).some((slot) => player.removedSlots.includes(slot));
    const items: string[] = [];
    if (data.finisher === player.id) items.push('Closed the round');
    else if (!review && !data.finisher && hidden > 0 && hidden <= 2) items.push('Can close soon');
    if (cleared) items.push('Cleared a column');
    return items.length ? (
      <span className="skyjo-badges">
        {items.map((item) => (
          <span
            key={item}
            className="skyjo-badge"
            data-tone={item === 'Cleared a column' ? 'news' : undefined}
          >
            {item}
          </span>
        ))}
      </span>
    ) : null;
  }

  const ledger = Object.entries(data.round_ledger).sort(
    ([, a], [, b]) => a.round_points - b.round_points || a.total_points - b.total_points,
  );
  const lowest = ledger.length ? ledger[0][1].round_points : null;
  const own = players.find((player) => player.id === selfId);

  return (
    <div className="table-layout stable-game-table skyjo-workspace" data-phase={match.phase}>
      <div className="skyjo-table">
        <div className="skyjo-main">
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
          {data.finisher && !review ? (
            <section className="skyjo-final-turns" aria-label="Final turns">
              <p>
                <strong>{name(data.finisher)} closed the round.</strong> Final turns:
              </p>
              {data.remaining.length ? (
                <ol>
                  {data.remaining.map((id) => (
                    <li key={id} data-current={id === current}>
                      {name(id)}
                    </li>
                  ))}
                </ol>
              ) : (
                <span className="small muted">completing the round</span>
              )}
            </section>
          ) : null}
          {review && ledger.length ? (
            <section
              className="skyjo-round-review game-information-settlement"
              aria-label="Skyjo round score explanation"
            >
              <div className="skyjo-review-heading">
                <h3>Round {data.round} scores</h3>
                <p className="small muted">
                  Grid total after removed columns. A closer who isn’t strictly lowest scores
                  double.
                </p>
              </div>
              <ol>
                {ledger.map(([id, score]) => (
                  <li key={id} data-best={score.round_points === lowest} data-own={id === selfId}>
                    <span className="skyjo-review-player">
                      <strong>{name(id)}</strong>
                      {id === data.finisher ? <em>closed</em> : null}
                    </span>
                    <span className="skyjo-review-score">
                      <b>{score.round_points}</b> this round
                    </span>
                    <span className="skyjo-review-detail">
                      {score.grid_total} on the grid
                      {score.removed_columns
                        ? ` · ${score.removed_columns} column${score.removed_columns === 1 ? '' : 's'} removed`
                        : ''}
                      {score.multiplier === 2 ? ' · doubled' : ''}
                    </span>
                    <span className="skyjo-review-total">{score.total_points} total</span>
                  </li>
                ))}
              </ol>
              {/* Only the closer starts the next round; the dock tells everyone else. */}
              {match.phase === 'between_rounds' && nextRound ? (
                <Button disabled={blocked} onClick={() => onAction(nextRound.value)}>
                  {nextRound.label}
                </Button>
              ) : null}
            </section>
          ) : null}
          <ActionPanel
            {...props}
            dockSize="compact"
            instruction={match.actions.length ? match.message || undefined : waiting()}
            match={{
              ...match,
              actions: match.actions.filter((option) => !TABLE_MOVES.includes(option.value.type)),
            }}
          />
          {own ? (
            <div className="skyjo-players">
              <article className="skyjo-player" data-own="true">
                <Seat
                  compact
                  name={room.members.find((m) => m.id === own.id)?.name || 'Player'}
                  you
                  avatar={room.members.find((m) => m.id === own.id)?.avatar}
                  active={current === own.id}
                  caption={`${own.score} total points`}
                  connected={room.members.find((m) => m.id === own.id)?.connected ?? false}
                />
                {badges(own)}
                {grid(own, true)}
              </article>
            </div>
          ) : null}
        </div>
        <section className="skyjo-opponents" aria-label="Other Skyjo players">
          {others.map((player) => {
            const cells = inPlay(player);
            const hidden = cells.filter(({ card }) => !card).length;
            const showing = cells.reduce(
              (sum, { card }) => sum + (card ? Number(card.value) : 0),
              0,
            );
            const changed = recent[player.id] ?? [];
            return (
              <OpponentPanel
                key={player.id}
                player={player}
                room={room}
                active={current === player.id}
                caption={`${player.score} total points`}
                summary={
                  <>
                    {badges(player)}
                    <span className="opponent-facts">
                      Showing {showing} · {hidden} hidden
                    </span>
                    <div className="skyjo-mini-grid" aria-label="Revealed grid summary">
                      {player.cards.map((card, slot) => {
                        const removed = player.removedSlots.includes(slot);
                        return (
                          <span
                            key={slot}
                            data-hidden={!card}
                            data-removed={removed}
                            data-band={!removed && card ? band(card.value) : undefined}
                            data-recent={changed.includes(slot) || undefined}
                            aria-label={
                              removed
                                ? `Removed, ${position(slot)}`
                                : `${card?.label || 'Face-down card'}, ${position(slot)}`
                            }
                          >
                            {removed ? '–' : card?.value || '•'}
                          </span>
                        );
                      })}
                    </div>
                  </>
                }
              >
                {grid(player, false)}
              </OpponentPanel>
            );
          })}
        </section>
      </div>
      <p className="small muted table-help">
        Three matching cards in a column disappear, including during the final reveal. Lowest total
        wins; the game ends when anyone reaches 100. A closer with a positive round score doubles it
        unless it is strictly lowest.
      </p>
    </div>
  );
}
