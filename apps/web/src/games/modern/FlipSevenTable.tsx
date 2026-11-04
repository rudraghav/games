'use client';
import { useState, type ReactNode } from 'react';
import { Button, PlayingCard, HorizontalRail } from '@games/ui';
import { flipSevenDetails, type ActionOption, type Card, type Player } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { ActionPanel } from '../shared/ActionPanel';
import { playerName, type TableProps } from '../types';

type Effect = { card: string; by: string; to: string };
type Details = ReturnType<typeof flipSevenDetails>;

/** Who gave which action card to whom this round; public, read defensively. */
function roundEffects(detail: Record<string, unknown>): Effect[] {
  const raw = detail.effects;
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (item): item is Effect =>
      typeof item === 'object' &&
      item !== null &&
      ['card', 'by', 'to'].every(
        (key) => typeof (item as Record<string, unknown>)[key] === 'string',
      ),
  );
}

const isNumber = (card: Card) => card.id.startsWith('n-');
const kind = (card: Card) =>
  isNumber(card) ? 'number' : card.color === 'red' ? 'action' : 'modifier';
/** What each action card does to whoever receives it. */
const effectText: Record<string, string> = {
  Freeze: 'Freeze ends that player’s round and banks their points.',
  'Flip Three': 'Flip Three makes that player flip three cards; a repeated number busts them.',
  'Second Chance': 'Second Chance saves that player from one repeated number.',
};
const chipText: Record<string, string> = {
  Freeze: 'Freeze',
  'Flip Three': 'Flip 3',
  'Second Chance': '2nd Chance',
};

/** Numbers held twice: the pair that busted a player. */
function duplicates(cards: (Card | null)[]) {
  const counts = new Map<string, number>();
  for (const card of cards)
    if (card && isNumber(card)) counts.set(card.value, (counts.get(card.value) ?? 0) + 1);
  return [...counts].filter(([, count]) => count > 1).map(([value]) => value);
}

const numbersHeld = (player: Player) =>
  new Set(player.cards.filter((card): card is Card => !!card && isNumber(card)).map((c) => c.value))
    .size;

/** The target control's short text; the row already shows the stake and the numbers. */
function targetText(card: string, own: boolean) {
  if (card === 'Freeze') return own ? 'Freeze yourself' : 'Freeze';
  if (card === 'Flip Three') return own ? 'Take Flip Three' : 'Flip Three';
  return `Give ${card}`;
}

/** What giving the pending card to this player does, for the control's accessible name. */
function consequence(card: string, player: Player, data: Details, own: boolean) {
  const stake = data.at_risk[player.id] ?? 0;
  if (card === 'Freeze') return own ? `bank your ${stake}` : `banks ${stake}`;
  if (card === 'Flip Three')
    return `flips three cards while holding ${numbersHeld(player)} different numbers`;
  return 'protects one repeated number';
}

export function FlipSevenTable(props: TableProps) {
  const { match, room, selfId, onAction, pending } = props;
  const data = flipSevenDetails(match.detail);
  const effects = roundEffects(match.detail);
  const review = ['round_over', 'finished'].includes(match.phase);
  const blocked = pending || room.paused;
  const current = match.currentPlayer;
  const card = data.pending_card;
  const targets = new Map(
    match.actions
      .filter((option) => option.value.type === 'target_effect')
      .map((option) => [option.value.target, option] as const),
  );
  const own = match.players.find((player) => player.id === selfId);
  const others = match.players.filter((player) => player.id !== selfId);
  const name = (id: string, start = false) =>
    id === selfId ? (start ? 'You' : 'you') : playerName(room, id);

  /** Effects that landed on this player, newest first. */
  function effectNotes(player: Player) {
    return effects
      .filter((effect) => effect.to === player.id)
      .reverse()
      .map((effect) => {
        const self = effect.by === effect.to;
        if (effect.card === 'Freeze')
          return self
            ? `${name(player.id, true)} froze ${player.id === selfId ? 'yourself' : 'themselves'}`
            : `Frozen by ${name(effect.by)}`;
        if (effect.card === 'Flip Three')
          return self
            ? `${name(player.id, true)} took Flip Three`
            : `Flip Three from ${name(effect.by)}`;
        return `${effect.card} from ${name(effect.by)}`;
      });
  }

  function status(player: Player) {
    const value = data.status[player.id];
    if (value === 'busted') {
      const pair = duplicates(player.cards);
      return pair.length ? `Busted on ${pair.join(' and ')}` : 'Busted';
    }
    if (value === 'frozen') return 'Frozen';
    if (value === 'stayed') return 'Stayed';
    return player.id === current && match.phase === 'playing' ? 'Deciding' : 'Active';
  }

  function score(player: Player) {
    const busted = data.status[player.id] === 'busted';
    const value = review ? (data.round_scores[player.id] ?? 0) : (data.at_risk[player.id] ?? 0);
    const label =
      review || busted ? 'this round' : data.status[player.id] === 'active' ? 'at stake' : 'banked';
    return (
      <span className="flip-round-score">
        <b>{value}</b> {label}
      </span>
    );
  }

  function cards(player: Player) {
    const pair = data.status[player.id] === 'busted' ? duplicates(player.cards) : [];
    return player.cards.map((item, index) =>
      item ? (
        <PlayingCard
          key={item.id}
          card={item}
          family="flip"
          compact
          className={`flip-number-card${isNumber(item) && pair.includes(item.value) ? ' flip-duplicate' : ''}`}
          label={
            isNumber(item) && pair.includes(item.value)
              ? `${item.label}, repeated number that busted ${name(player.id)}`
              : undefined
          }
        />
      ) : (
        <PlayingCard key={index} faceDown compact />
      ),
    );
  }

  /** Every card as a small chip in the row, so nobody has to open a row to see it. */
  function chips(player: Player) {
    const pair = data.status[player.id] === 'busted' ? duplicates(player.cards) : [];
    const held = player.cards.filter((item): item is Card => !!item);
    const order = { number: 0, modifier: 1, action: 2 } as const;
    const sorted = [...held].sort(
      (a, b) =>
        order[kind(a)] - order[kind(b)] ||
        (isNumber(a) && isNumber(b) ? Number(a.value) - Number(b.value) : 0),
    );
    if (!sorted.length) return <span className="flip-chips flip-chips--empty">No cards yet</span>;
    return (
      <span className="flip-chips" aria-label={`Cards: ${sorted.map((c) => c.label).join(', ')}`}>
        {sorted.map((item) => (
          <span
            key={item.id}
            className="flip-chip"
            data-kind={kind(item)}
            data-duplicate={isNumber(item) && pair.includes(item.value) ? 'true' : undefined}
            aria-hidden="true"
          >
            {chipText[item.label] ?? item.label}
          </span>
        ))}
      </span>
    );
  }

  function identity(player: Player) {
    const notes = effectNotes(player);
    return (
      <span className="flip-player-identity">
        <strong>
          <span className="flip-player-label">{playerName(room, player.id)}</span>
          {player.id === selfId ? <span className="flip-you">You</span> : null}
        </strong>
        <small>
          {status(player)} · {player.cards.length} {player.cards.length === 1 ? 'card' : 'cards'}
        </small>
        {notes.length ? <span className="flip-effect-note">{notes.join(' · ')}</span> : null}
      </span>
    );
  }

  function targetControl(player: Player, isOwn: boolean): ReactNode {
    const option = targets.get(player.id);
    if (!option) return null;
    return (
      <Button
        className="flip-target-button"
        size="sm"
        variant={isOwn ? 'secondary' : 'primary'}
        disabled={blocked}
        aria-label={`${option.label} to ${isOwn ? 'yourself' : playerName(room, player.id)}: ${consequence(card, player, data, isOwn)}`}
        onClick={() => onAction(option.value)}
      >
        {targetText(card, isOwn)}
      </Button>
    );
  }

  /** The dock speaks to the viewer: their instruction, or who they are waiting for. */
  function instruction() {
    if (targets.size) return `${effectText[card] ?? card} Choose a player in the rows below.`;
    if (match.actions.length) return match.message || undefined;
    if (!current) return undefined;
    const who = playerName(room, current);
    if (match.phase === 'round_over') return `Waiting for ${who} to deal round ${data.round + 1}.`;
    if (match.phase === 'target' && card) {
      const eligible =
        own &&
        data.status[selfId] === 'active' &&
        !(
          card === 'Second Chance' &&
          (current === selfId || own.cards.some((item) => item?.label === 'Second Chance'))
        );
      const risk =
        card === 'Freeze'
          ? `You could be frozen: your round would end with ${data.at_risk[selfId] ?? 0} banked.`
          : card === 'Flip Three'
            ? 'You could be chosen to flip three cards.'
            : 'You could receive it.';
      return `${who} is choosing who receives ${card}.${eligible ? ` ${risk}` : ''}`;
    }
    return `${who} is deciding whether to hit or stay.`;
  }

  const results = [...match.players].sort((a, b) => b.score - a.score);
  const leader = results[0]?.score ?? 0;

  return (
    <div className="table-layout stable-game-table modern-game" data-phase={match.phase}>
      <PlayerStrip {...props} playerCaption={(p) => `${p.score} / 200 points`} />
      <section className="flip-seven-table" aria-label="Flip 7 table">
        <div className="modern-game-heading">
          <div>
            <p className="eyebrow">Round {data.round}</p>
            <h2>{targets.size ? `Choose who receives ${card}` : 'Your round'}</h2>
          </div>
          <span className="small muted">{match.drawCount} cards in the shoe</span>
        </div>
        {review ? (
          <section className="flip-round-results" aria-label={`Round ${data.round} results`}>
            <h3>Round {data.round} results · first to 200 wins</h3>
            <ol>
              {results.map((player) => (
                <li
                  key={player.id}
                  data-leader={player.score === leader}
                  data-own={player.id === selfId}
                >
                  <span className="flip-result-name">{name(player.id, true)}</span>
                  <span className="flip-result-round">+{data.round_scores[player.id] ?? 0}</span>
                  <b>{player.score}</b>
                  <span className="flip-result-gap">
                    {player.score >= 200 ? 'reached 200' : `${200 - player.score} to go`}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        {own ? (
          <article
            className="flip-player"
            data-own="true"
            data-current={current === own.id}
            data-status={data.status[own.id]}
            data-target={targets.has(own.id) || undefined}
          >
            <div className="flip-player-name">
              {identity(own)}
              {score(own)}
            </div>
            {targetControl(own, true)}
            <div className="flip-card-row" role="group" aria-label="Your cards">
              {cards(own)}
              {!own.cards.length ? <span className="small muted">No cards yet</span> : null}
            </div>
          </article>
        ) : null}
        <ActionPanel
          {...props}
          dockSize="fit"
          instruction={instruction()}
          match={{
            ...match,
            actions: match.actions.filter((option) => option.value.type !== 'target_effect'),
          }}
        />
        <div className="flip-player-grid" aria-label="Other players’ cards and round scores">
          {others.map((player) => (
            <FlipRow
              key={player.id}
              player={player}
              current={current === player.id}
              status={data.status[player.id]}
              target={targets.get(player.id)}
              summary={
                <span className="flip-player-head">
                  {identity(player)}
                  {score(player)}
                </span>
              }
              chips={chips(player)}
              control={targetControl(player, false)}
              railLabel={`${playerName(room, player.id)} public cards`}
            >
              {cards(player)}
            </FlipRow>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Another player's row. Opening it is the viewer's choice and survives every turn. */
function FlipRow({
  player,
  current,
  status,
  target,
  summary,
  chips,
  control,
  railLabel,
  children,
}: {
  player: Player;
  current: boolean;
  status: string | undefined;
  target?: ActionOption;
  summary: ReactNode;
  chips: ReactNode;
  control: ReactNode;
  railLabel: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <article
      className="flip-player"
      data-current={current}
      data-status={status}
      data-target={target ? true : undefined}
      data-player={player.id}
    >
      <details
        className="flip-player-details"
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
      >
        <summary className="flip-player-name">{summary}</summary>
        <HorizontalRail label={railLabel} contentClassName="flip-card-row">
          {children}
          {!player.cards.length ? <span className="small muted">No cards yet</span> : null}
        </HorizontalRail>
      </details>
      {open ? null : chips}
      {control}
    </article>
  );
}
