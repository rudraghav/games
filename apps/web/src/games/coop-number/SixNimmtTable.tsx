'use client';
import { CircleMinus, LockKeyhole } from 'lucide-react';
import { z } from 'zod';
import { Button, PlayingCard } from '@games/ui';
import { sixNimmtDetails, type Card } from '@games/api-client';
import { mapCard } from '@games/api-client/mappers';
import { PlayerStrip } from '../shared/PlayerStrip';
import { nameList } from '../shared/turn-state';
import { useTableDraft } from '../shared/table-draft';
import { playerName, type TableProps } from '../types';
import { useRetriedMove } from './use-retried-move';

const card = z
  .looseObject({ id: z.string(), label: z.string() })
  .transform((value) => mapCard(value as Parameters<typeof mapCard>[0]));
/** Public: every revealed number and every row it took were already on the table. */
const resolution = z
  .object({
    resolution: z
      .array(
        z.object({
          player: z.string(),
          card,
          row: z.number().int().min(0).max(3),
          kind: z.enum(['placed', 'sixth', 'low']),
          captured: z.array(card),
          penalties: z.number().int().nonnegative(),
        }),
      )
      .catch([]),
    unresolved: z.array(z.object({ player: z.string(), card })).catch([]),
  })
  .catch({ resolution: [], unresolved: [] });

const plural = (count: number, word: string, many = `${word}s`) =>
  `${count} ${count === 1 ? word : many}`;
const penalties = (count: number) => plural(count, 'penalty', 'penalties');
const ordinal = (n: number) =>
  `${n}${n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th'}`;

function NumberCard({
  card,
  selected,
  onClick,
  disabled,
  small = false,
  fresh = false,
}: {
  card: Card;
  selected?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  small?: boolean;
  fresh?: boolean;
}) {
  return (
    <div
      className="six-number-card"
      data-small={small}
      data-digits={card.value.length}
      data-fresh={fresh || undefined}
    >
      <PlayingCard
        card={card}
        family="grid"
        selected={selected}
        onClick={onClick}
        label={card.label}
        disabled={disabled}
      />
      <span className="six-card-penalty" aria-hidden="true">
        <CircleMinus size={11} />
        {card.subtitle}
      </span>
    </div>
  );
}

export function SixNimmtTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = sixNimmtDetails(match.detail);
  const steps = resolution.parse(match.detail);
  const blocked = pending || room.paused;
  const who = (id: string) => (id === selfId ? 'You' : playerName(room, id));
  const whoInline = (id: string) => (id === selfId ? 'you' : playerName(room, id));
  // The viewer's unsent number survives refresh and other seats' locks, within this selection.
  const [chosen, setChosen] = useTableDraft<string | null>(
    `six:${room.id}:${room.matchId}:${data.round}:${data.trick}`,
    null,
  );
  const { submit } = useRetriedMove({
    match,
    room,
    selfId,
    pending,
    onAction,
    onCommitted: () => setChosen(null),
  });
  const selectedOption = match.actions.find(
    (o) => o.value.type === 'select_number' && o.value.card === chosen,
  );
  const selectedCard = match.hand.find((item) => item.id === chosen) ?? null;
  const next = match.actions.find((o) => ['next_selection', 'next_round'].includes(o.value.type));
  const simultaneous = match.phase === 'selecting';
  const takeRows = match.actions.filter((o) => o.value.type === 'take_row');
  const cheapest = Math.min(...data.row_penalties);
  const lowCard = steps.unresolved[0];
  const placed = new Set(steps.resolution.map((step) => step.card.id));
  const waitingFor = data.pending_players.filter((id) => id !== selfId);
  const standings = match.players
    .map((player) => ({
      id: player.id,
      total: data.total_penalties[player.id] ?? player.score,
      round: data.round_scores[player.id] ?? data.round_penalties[player.id] ?? 0,
    }))
    .sort((a, b) => a.total - b.total);
  const mine = standings.find((row) => row.id === selfId);
  const place = mine ? standings.filter((row) => row.total < mine.total).length + 1 : 0;
  const tied = mine ? standings.filter((row) => row.total === mine.total).length > 1 : false;
  const level = standings.every((row) => row.total === standings[0]?.total);
  const roundComplete = ['round_over', 'finished'].includes(match.phase);

  return (
    <div className="table-layout stable-game-table coop-number-game six-game">
      <PlayerStrip
        {...props}
        match={simultaneous ? { ...match, currentPlayer: null } : match}
        playerCaption={(p) =>
          `${data.total_penalties[p.id]} penalties · ${p.count} cards${data.selected_players.includes(p.id) ? ' · locked' : ''}`
        }
      />
      <section className="six-table" aria-label="6 nimmt! table" data-phase={match.phase}>
        <header className="coop-number-heading">
          <div>
            <p className="eyebrow">
              Round {data.round} · selection {data.trick}/10
            </p>
          </div>
          <span className="small muted">A sixth card takes the row</span>
        </header>
        {roundComplete ? (
          <section className="six-standings-panel" aria-label="Round penalties and standings">
            <h3>
              {match.phase === 'finished' ? 'Final standings' : `Round ${data.round} penalties`}
            </h3>
            <p className="small">
              Lowest total is winning. The game ends after a round in which anyone reaches 66.
            </p>
            <ol className="six-standings-list">
              {standings.map((row, index) => (
                <li key={row.id} data-self={row.id === selfId || undefined}>
                  <span className="six-standings-place">{index + 1}</span>
                  <strong>{who(row.id)}</strong>
                  <span>+{row.round} this round</span>
                  <span className="six-standings-total">{penalties(row.total)}</span>
                </li>
              ))}
            </ol>
            {next ? (
              <Button disabled={blocked} onClick={() => onAction(next.value)}>
                {next.label}
              </Button>
            ) : match.phase === 'round_over' && match.currentPlayer ? (
              <p className="small muted">
                Waiting for {whoInline(match.currentPlayer)} to start the next round.
              </p>
            ) : null}
          </section>
        ) : (
          <details className="six-standings">
            <summary>
              {level
                ? `Standings: everyone has ${penalties(standings[0]?.total ?? 0)}`
                : place === 1
                  ? `Standings: you ${tied ? 'share the lead' : 'lead'} with ${penalties(mine?.total ?? 0)}`
                  : `Standings: ${place ? `you are ${tied ? 'tied ' : ''}${ordinal(place)} of ${standings.length} · ` : ''}${playerName(room, standings[0]?.id ?? '')} leads with ${penalties(standings[0]?.total ?? 0)}`}
            </summary>
            <ol className="six-standings-list">
              {standings.map((row, index) => (
                <li key={row.id} data-self={row.id === selfId || undefined}>
                  <span className="six-standings-place">{index + 1}</span>
                  <strong>{who(row.id)}</strong>
                  <span>
                    {data.selected_players.includes(row.id)
                      ? 'locked'
                      : simultaneous
                        ? 'choosing'
                        : ''}
                  </span>
                  <span className="six-standings-total">{penalties(row.total)}</span>
                </li>
              ))}
            </ol>
          </details>
        )}
        {match.phase === 'take_row' && data.pending_player === selfId && lowCard ? (
          <p className="six-row-decision" role="status">
            <strong>Your {lowCard.card.value} is lower than every row end.</strong> Take one row:
            its cards become your penalties and your {lowCard.card.value} starts it.
          </p>
        ) : null}
        <div className="six-rows" aria-label="Four ascending number rows">
          {data.rows.map((row, index) => {
            const take = takeRows.find((o) => o.value.choice === String(index));
            const cost = data.row_penalties[index];
            return (
              <section
                key={index}
                className="six-row"
                data-full={row.length === 5}
                data-cheapest={(take && cost === cheapest) || undefined}
              >
                <header>
                  <h3>Row {index + 1}</h3>
                  <span className="six-row-cost">{penalties(cost)}</span>
                  <span className="six-row-capacity">{row.length}/5</span>
                </header>
                <div
                  className="six-row-cards"
                  aria-label={`Row ${index + 1}, ${row.length} of 5 spaces filled`}
                >
                  {Array.from({ length: 5 }, (_, slot) =>
                    row[slot] ? (
                      <NumberCard
                        key={row[slot].id}
                        card={row[slot]}
                        small
                        fresh={placed.has(row[slot].id)}
                      />
                    ) : (
                      <span className="six-row-slot" key={`empty-${slot}`} aria-hidden="true">
                        {slot + 1}
                      </span>
                    ),
                  )}
                </div>
                {take ? (
                  <Button
                    size="sm"
                    variant={cost === cheapest ? 'primary' : 'secondary'}
                    disabled={blocked}
                    aria-label={`Take row ${index + 1} · ${plural(row.length, 'card')} · ${penalties(cost)}`}
                    onClick={() => onAction(take.value)}
                  >
                    Take row {index + 1} · {penalties(cost)}
                    {cost === cheapest ? ' · cheapest' : ''}
                  </Button>
                ) : null}
              </section>
            );
          })}
        </div>
        {simultaneous ? (
          <section
            className="six-hand-panel"
            aria-label="Your private number cards"
            data-tray={!data.own_selection || undefined}
          >
            <div className="coop-number-heading">
              <h3>{data.own_selection ? 'Your number is locked' : 'Choose one number'}</h3>
              <span className="small muted">
                {data.selected_players.length}/{match.players.length} locked
              </span>
            </div>
            {data.own_selection ? (
              <div className="six-locked" aria-live="polite">
                <NumberCard card={data.own_selection} small />
                <p>
                  <LockKeyhole size={18} aria-hidden="true" />
                  {waitingFor.length
                    ? `Waiting for ${nameList(
                        waitingFor.map((id) => playerName(room, id)),
                        4,
                      )}. Their numbers stay secret.`
                    : 'Their numbers stay secret until everyone has locked.'}
                </p>
              </div>
            ) : (
              <>
                <div className="six-hand" role="group" aria-label="Your number cards">
                  {match.hand.map((item) => (
                    <NumberCard
                      key={item.id}
                      card={item}
                      selected={chosen === item.id}
                      disabled={blocked}
                      onClick={() => setChosen(chosen === item.id ? null : item.id)}
                    />
                  ))}
                </div>
                <p className="small muted six-hand-note" aria-live="polite">
                  {selectedCard
                    ? `${selectedCard.value} selected · ${penalties(Number(selectedCard.subtitle))} if a row takes it.`
                    : 'Numbers reveal together, lowest first.'}
                </p>
                <Button
                  disabled={blocked || !selectedOption}
                  onClick={() => selectedOption && submit(selectedOption.value)}
                >
                  Lock my number
                </Button>
              </>
            )}
          </section>
        ) : null}
        {steps.resolution.length || steps.unresolved.length ? (
          <section className="six-revealed" aria-label="This selection’s revealed numbers">
            <h3>This selection, lowest number first</h3>
            <ol className="six-steps">
              {steps.resolution.map((step) => (
                <li key={step.card.id} data-kind={step.kind}>
                  <NumberCard card={step.card} small />
                  <p>
                    <strong>{who(step.player)}</strong>
                    {step.kind === 'placed'
                      ? ` → Row ${step.row + 1}`
                      : `: ${step.kind === 'sixth' ? `sixth card in Row ${step.row + 1}` : `lower than every row, chose Row ${step.row + 1}`} · took ${plural(step.captured.length, 'card')} (${step.captured.map((item) => item.value).join(', ')}) · ${penalties(step.penalties)}`}
                  </p>
                </li>
              ))}
              {lowCard ? (
                <li key={lowCard.card.id} data-kind="waiting">
                  <NumberCard card={lowCard.card} small />
                  <p>
                    <strong>{who(lowCard.player)}</strong>
                    {lowCard.player === selfId
                      ? ': lower than every row · choose a row to take above'
                      : `: lower than every row · waiting for ${whoInline(lowCard.player)} to choose a row`}
                  </p>
                </li>
              ) : null}
              {steps.unresolved.length > 1 ? (
                <li key="queue" data-kind="queue">
                  <p>
                    <strong>Then, in order:</strong>{' '}
                    {steps.unresolved
                      .slice(1)
                      .map((item) => `${item.card.value} ${who(item.player)}`)
                      .join(' · ')}
                  </p>
                </li>
              ) : null}
            </ol>
          </section>
        ) : null}
        {match.phase === 'review' ? (
          <div className="coop-number-review">
            <p>
              {next
                ? 'Check where each number went, then continue.'
                : `Waiting for ${playerName(room, match.currentPlayer || '')} to start the next selection.`}
            </p>
            {next ? (
              <Button disabled={blocked} onClick={() => onAction(next.value)}>
                {next.label}
              </Button>
            ) : null}
          </div>
        ) : null}
      </section>
    </div>
  );
}
