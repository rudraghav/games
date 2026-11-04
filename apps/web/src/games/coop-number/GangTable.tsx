'use client';
import type { CSSProperties } from 'react';
import { Check, LockKeyhole, Siren, Star, X } from 'lucide-react';
import { z } from 'zod';
import { Button, PlayingCard, DecisionDock } from '@games/ui';
import { gangDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { nameList } from '../shared/turn-state';
import { useTableDraft } from '../shared/table-draft';
import { playerName, type TableProps } from '../types';
import { useRetriedMove } from './use-retried-move';

const streets = ['Preflop', 'Flop', 'Turn', 'River'];
const colors = ['white', 'yellow', 'orange', 'red'];

/** Public: who took whose chip this street (everyone sees the rack). */
const takenChips = z
  .record(z.string(), z.object({ by: z.string(), rank: z.number().int().min(1).max(6) }))
  .catch({});

export function GangTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = gangDetails(match.detail);
  const taken = takenChips.parse(match.detail.taken_chips ?? {});
  const blocked = pending || room.paused;
  const name = (id: string) => (id === selfId ? 'you' : playerName(room, id));
  // The viewer's unsent chip survives refresh and other seats' moves, within this street only.
  const [chosen, setChosen] = useTableDraft<number | null>(
    `gang:${room.id}:${room.matchId}:${data.heist}:${data.street}`,
    null,
  );
  // A committed claim ends the choice; a rejected stale claim keeps it and is resent once.
  const { submit } = useRetriedMove({
    match,
    room,
    selfId,
    pending,
    onAction,
    onCommitted: () => setChosen(null),
  });
  const ownChip = data.chips[selfId];
  const option = match.actions.find(
    (o) => o.value.type === 'claim_chip' && o.value.amount === chosen,
  );
  const owner = chosen === null ? null : match.players.find((p) => data.chips[p.id] === chosen)?.id;
  const closesStreet = data.pending_players.length === 1 && ownChip === null && !owner;
  const reveal = match.actions.find((o) => o.value.type === 'reveal_hand');
  const next = match.actions.find((o) => o.value.type === 'next_heist');
  const giveBack = match.actions.find((o) => o.value.type === 'return_chip');
  const simultaneous = match.phase === 'chips';
  const roundComplete = ['heist_review', 'finished'].includes(match.phase);
  const lost = taken[selfId] && ownChip === null ? taken[selfId] : null;
  const instruction = !chosen
    ? lost
      ? `Choose another chip: ${playerName(room, lost.by)} took your ${lost.rank}-star chip.`
      : 'Choose the chip that matches your hand.'
    : owner
      ? `This takes ${playerName(room, owner)}’s chip; they will need another.`
      : closesStreet
        ? data.street === 3
          ? 'Taking this last free chip starts the showdown.'
          : 'Taking this last free chip closes the round and reveals more community cards.'
        : ownChip
          ? 'Your previous chip goes back to the center.'
          : 'Take this chip to show your estimate.';
  const chipOf = (id: string) => data.history[3]?.[id] ?? data.chips[id] ?? null;
  const order = roundComplete
    ? data.declared_order
    : [...data.revealed].sort((a, b) => (chipOf(a) ?? 0) - (chipOf(b) ?? 0));
  const inverted = new Set(data.inversions.map((pair) => pair.later));

  return (
    <div className="table-layout stable-game-table coop-number-game gang-game">
      <PlayerStrip
        {...props}
        match={simultaneous ? { ...match, currentPlayer: null } : match}
        playerCaption={(p) =>
          data.chips[p.id] ? `${data.chips[p.id]}-star estimate` : 'Choosing a chip'
        }
      />
      <section className="gang-table" aria-label="The Gang table" data-phase={match.phase}>
        <header className="coop-number-heading">
          <div>
            <p className="eyebrow">Heist {data.heist} · Basic game</p>
            <h2>{streets[data.street]}</h2>
          </div>
          <div className="gang-counters" aria-label="Crew progress">
            <span>
              <LockKeyhole size={17} aria-hidden="true" /> {data.vaults}/3 vaults
            </span>
            <span>
              <Siren size={17} aria-hidden="true" /> {data.alarms}/3 alarms
            </span>
          </div>
        </header>
        <div className="gang-community" aria-label="Community cards">
          {Array.from({ length: 5 }, (_, i) =>
            match.community[i] ? (
              <PlayingCard key={i} card={match.community[i]} compact />
            ) : (
              <div
                className="gang-empty-card"
                key={i}
                aria-label={`Community card ${i + 1} unrevealed`}
              />
            ),
          )}
        </div>
        <section
          className="gang-private"
          aria-label={
            data.revealed.includes(selfId)
              ? 'Your revealed pocket cards'
              : 'Your private pocket cards'
          }
        >
          <div>
            <p className="eyebrow">Your pocket cards</p>
            {data.own_hand_name ? <h3>{data.own_hand_name}</h3> : null}
            <p className="small muted">
              {data.revealed.includes(selfId)
                ? 'These cards are now visible to the crew.'
                : 'Only you can see these cards.'}
            </p>
          </div>
          <div className="gang-pocket-cards">
            {match.hand.map((card) => (
              <PlayingCard key={card.id} card={card} />
            ))}
          </div>
        </section>
        {simultaneous ? (
          <DecisionDock
            className="gang-turn-dock"
            size="fit"
            label="Ranking and reveal decisions"
            pending={pending}
          >
            <section className="gang-decision" aria-label="Choose your ranking chip">
              <div className="coop-number-heading">
                <h3>Everyone can choose</h3>
                <span className="small muted">
                  {match.players.length - data.pending_players.length}/{match.players.length} chips
                  taken
                </span>
              </div>
              {lost ? (
                <p className="gang-chip-taken" role="status">
                  {playerName(room, lost.by)} took your {lost.rank}-star chip. Choose another chip
                  before the round can end.
                </p>
              ) : null}
              <div className="gang-rank-scale" aria-hidden="true">
                <span>1 · weakest hand</span>
                <span>{match.players.length} · strongest hand</span>
              </div>
              <div
                className="gang-chip-rack"
                data-chip-color={colors[data.street]}
                data-attention={Boolean(lost) || undefined}
                style={{ '--gang-players': match.players.length } as CSSProperties}
              >
                {match.players.map((_, i) => {
                  const rank = i + 1;
                  const holder = match.players.find((p) => data.chips[p.id] === rank)?.id;
                  const available = match.actions.some(
                    (o) => o.value.type === 'claim_chip' && o.value.amount === rank,
                  );
                  return (
                    <button
                      key={rank}
                      type="button"
                      className="gang-chip-choice"
                      data-own={holder === selfId || undefined}
                      data-held={Boolean(holder) || undefined}
                      aria-label={`${rank}-star chip${holder ? ` held by ${holder === selfId ? 'you' : playerName(room, holder)}` : ' in the center'}`}
                      aria-pressed={chosen === rank}
                      disabled={blocked || !available}
                      onClick={() => setChosen(chosen === rank ? null : rank)}
                    >
                      <span className="gang-rank-chip">
                        <Star size={15} aria-hidden="true" />
                        {rank}
                      </span>
                      <small>
                        {holder ? (holder === selfId ? 'You' : playerName(room, holder)) : 'Center'}
                      </small>
                    </button>
                  );
                })}
              </div>
              <p className="gang-decision-note" aria-live="polite">
                {instruction}
              </p>
              <div className="coop-number-actions">
                <Button
                  disabled={blocked || !option}
                  onClick={() => option && submit(option.value)}
                >
                  {chosen ? `Take ${chosen}-star chip` : 'Choose a chip'}
                </Button>
                {giveBack ? (
                  <Button variant="ghost" disabled={blocked} onClick={() => submit(giveBack.value)}>
                    Return my chip
                  </Button>
                ) : null}
              </div>
            </section>
          </DecisionDock>
        ) : null}
        {match.phase === 'showdown' ? (
          <DecisionDock
            className="gang-turn-dock"
            size="fit"
            label="Ranking and reveal decisions"
            pending={pending}
          >
            <section className="gang-showdown" aria-live="polite">
              <h3>Showdown · weakest red chip first</h3>
              <p>
                {reveal
                  ? 'Your chip is next. Reveal your pocket cards to the crew.'
                  : `Waiting for ${playerName(room, match.currentPlayer || '')} to reveal.`}
              </p>
              {reveal ? (
                <Button disabled={blocked} onClick={() => onAction(reveal.value)}>
                  Reveal my hand
                </Button>
              ) : null}
            </section>
          </DecisionDock>
        ) : null}
        {roundComplete && data.declared_order.length ? (
          <section
            className="gang-verdict"
            aria-label="Heist ranking explanation"
            data-success={data.last_success ?? undefined}
          >
            <h3>
              {data.last_success ? (
                <>
                  <LockKeyhole size={18} aria-hidden="true" /> Vault cracked
                </>
              ) : (
                <>
                  <Siren size={18} aria-hidden="true" /> Alarm: hands out of order
                </>
              )}
            </h3>
            {data.inversions.length ? (
              <ul>
                {data.inversions.map(({ earlier, later }) => (
                  <li key={`${earlier}:${later}`}>
                    <strong>
                      {earlier === selfId ? 'You' : playerName(room, earlier)} (red{' '}
                      {chipOf(earlier)}) had a stronger hand than {name(later)} (red {chipOf(later)}
                      ).
                    </strong>{' '}
                    {data.hand_evaluations[earlier]?.description} beats{' '}
                    {data.hand_evaluations[later]?.description}.
                  </li>
                ))}
              </ul>
            ) : (
              <p>
                Every hand was at least as strong as the hand on the chip below it. Equal hands can
                sit in either order.
              </p>
            )}
          </section>
        ) : null}
        {data.revealed.length ? (
          <ol
            className="gang-revealed"
            aria-label={roundComplete ? 'Hands by red chip, weakest first' : 'Revealed crew hands'}
          >
            {order
              .filter((id) => data.revealed.includes(id))
              .map((id, index) => (
                <li key={id} data-inverted={(roundComplete && inverted.has(id)) || undefined}>
                  <div className="gang-revealed-heading">
                    {chipOf(id) ? (
                      <span className="gang-ladder-chip" aria-label={`Red chip ${chipOf(id)}`}>
                        <Star size={12} aria-hidden="true" />
                        {chipOf(id)}
                      </span>
                    ) : null}
                    <strong>
                      {playerName(room, id)}
                      {id === selfId ? ' · you' : ''}
                    </strong>
                  </div>
                  <span className="small">
                    {data.hand_evaluations[id]?.description ?? data.hand_names[id]}
                  </span>
                  {roundComplete && index > 0 ? (
                    <span className="gang-ladder-check">
                      {inverted.has(id) ? (
                        <>
                          <X size={14} aria-hidden="true" /> Weaker than red{' '}
                          {chipOf(order[index - 1])}
                        </>
                      ) : (
                        <>
                          <Check size={14} aria-hidden="true" /> At least as strong as red{' '}
                          {chipOf(order[index - 1])}
                        </>
                      )}
                    </span>
                  ) : null}
                  <div className="gang-revealed-cards">
                    {match.players
                      .find((p) => p.id === id)
                      ?.cards.map((card, i) =>
                        card ? (
                          <PlayingCard key={card.id} card={card} compact />
                        ) : (
                          <PlayingCard key={i} faceDown compact />
                        ),
                      )}
                  </div>
                  {data.hand_evaluations[id] ? (
                    <details>
                      <summary className="small">Best five cards</summary>
                      <div className="gang-revealed-cards">
                        {data.hand_evaluations[id].cards.map((card) => (
                          <PlayingCard key={card.id} card={card} compact />
                        ))}
                      </div>
                    </details>
                  ) : null}
                </li>
              ))}
          </ol>
        ) : null}
        {match.phase === 'heist_review' ? (
          <DecisionDock
            className="gang-turn-dock gang-review-dock"
            size="fit"
            label="Ranking and reveal decisions"
            pending={pending}
          >
            <div className="coop-number-review">
              <p>
                {next
                  ? data.last_success
                    ? 'The crew got the order right. Start the next heist when everyone has read the hands.'
                    : 'An alarm, not the end. Start the next heist when everyone has read the hands.'
                  : `Waiting for ${playerName(room, match.currentPlayer || '')} to start the next heist.`}
              </p>
              {next ? (
                <Button disabled={blocked} onClick={() => onAction(next.value)}>
                  Next heist
                </Button>
              ) : null}
            </div>
          </DecisionDock>
        ) : null}
        {data.history.length ? (
          <section className="gang-history" aria-label="Previous chip estimates">
            <h3>Crew chip history</h3>
            <div className="gang-history-grid" role="table" aria-label="Chip history by round">
              <div role="row">
                <span role="columnheader">Crew</span>
                {streets.map((street, i) => (
                  <span
                    role="columnheader"
                    key={street}
                    data-chip-color={colors[i]}
                    aria-label={`${street} (${colors[i]} chips)`}
                  >
                    <span className="gang-history-long" aria-hidden="true">
                      {street}
                    </span>
                    <span className="gang-history-short" aria-hidden="true">
                      {['Pre', 'Flop', 'Turn', 'Riv'][i]}
                    </span>
                  </span>
                ))}
              </div>
              {match.players.map((p) => (
                <div role="row" key={p.id}>
                  <strong role="rowheader">{playerName(room, p.id)}</strong>
                  {streets.map((street, i) => (
                    <span role="cell" key={street}>
                      {data.history[i]?.[p.id] ?? '—'}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </section>
        ) : null}
        {simultaneous && data.pending_players.length ? (
          <p className="small muted gang-waiting">
            Still choosing: {nameList(data.pending_players.map(name), 4)}.
          </p>
        ) : null}
      </section>
    </div>
  );
}
