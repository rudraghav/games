'use client';
import { useId, useState } from 'react';
import { Button, PaperPlayingCard, DecisionDock, Modal } from '@games/ui';
import { paperDetails, type Card, type Match, type Room } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { useTableDraft } from '../shared/table-draft';
import { playerName, type TableProps } from '../types';
import {
  duoEffects,
  duoKind,
  paperExtras,
  paperRules,
  type PaperEvent,
  type RoundSummary,
} from './paper-view';

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;
/** "Green Octopus": colour first, because colour is what scores. */
export const cardName = (card: Card) =>
  `${card.color.charAt(0).toLocaleUpperCase()}${card.color.slice(1)} ${card.value}`;

type Names = {
  name: (id: string) => string;
  inline: (id: string) => string;
  own: (id: string) => string;
};

function names(room: Room, selfId: string): Names {
  return {
    name: (id) => (id === selfId ? 'You' : playerName(room, id)),
    inline: (id) => (id === selfId ? 'you' : playerName(room, id)),
    own: (id) => (id === selfId ? 'Your' : `${playerName(room, id)}’s`),
  };
}

function outcome(summary: RoundSummary, who: Names) {
  const { caller, stopper } = summary;
  if (summary.outcome === 'exhausted')
    return 'The stock ran out at the end of a turn, so nobody scored this round.';
  if (summary.outcome === 'mermaids')
    return `${who.name(stopper || '')} revealed all four mermaids and won at once.`;
  if (summary.outcome === 'stopped')
    return `${stopper ? who.name(stopper) : 'A player'} stopped the round: everyone scored their card points, with no color bonus.`;
  const callerPoints = summary.result[caller || '']?.card_points ?? 0;
  if (summary.outcome === 'caller_won')
    return `${who.own(caller || '')} Last Chance worked: nobody beat ${callerPoints} card points, so ${who.inline(caller || '')} scored card points plus color bonus and everyone else scored only their color bonus.`;
  const beaten = Object.entries(summary.result)
    .filter(([, row]) => row.card_points > callerPoints)
    .map(([id, row]) => `${who.name(id)} (${row.card_points})`);
  return `${who.own(caller || '')} Last Chance failed: ${beaten.join(', ')} beat ${callerPoints} card points, so ${who.inline(caller || '')} scored only the color bonus and everyone else scored their card points.`;
}

function awardDetail(summary: RoundSummary, id: string) {
  const row = summary.result[id];
  if (!row) return '';
  if (summary.outcome === 'exhausted') return 'no scoring this round';
  const bonusOnly = `color bonus only · ${plural(row.card_points, 'card point')} not scored`;
  if (summary.outcome === 'caller_won')
    return summary.caller === id
      ? `${plural(row.card_points, 'card point')} + color bonus ${row.color_bonus}`
      : bonusOnly;
  if (summary.outcome === 'caller_lost' && summary.caller === id) return bonusOnly;
  return plural(row.card_points, 'card point');
}

function RoundResults({
  summary,
  match,
  room,
  selfId,
  current,
  blocked,
  onAction,
}: Pick<TableProps, 'match' | 'room' | 'selfId' | 'onAction'> & {
  summary: RoundSummary;
  current: boolean;
  blocked: boolean;
}) {
  const who = names(room, selfId);
  const next = match.actions.find((option) => option.value.type === 'next_round');
  const rows = match.players
    .map((player) => ({ id: player.id, total: player.score, row: summary.result[player.id] }))
    .sort((a, b) => b.total - a.total);
  const list = (
    <ol className="paper-round-list">
      {rows.map(({ id, total, row }) => (
        <li key={id} data-self={id === selfId || undefined}>
          <strong>{who.name(id)}</strong>
          <span>
            +{row?.award ?? 0} · {awardDetail(summary, id)}
          </span>
          <span className="paper-round-total">{plural(total, 'point')} total</span>
        </li>
      ))}
    </ol>
  );
  if (!current)
    return (
      <details className="paper-round-summary paper-round-summary--previous">
        <summary>
          Round {summary.round} result:{' '}
          {rows.map(({ id, row }) => `${who.name(id)} +${row?.award ?? 0}`).join(' · ')}
        </summary>
        <p>{outcome(summary, who)}</p>
        {list}
      </details>
    );
  return (
    <section className="paper-round-summary" aria-label={`Round ${summary.round} results`}>
      <h3>Round {summary.round} results</h3>
      <p>{outcome(summary, who)}</p>
      {list}
      {next ? (
        <Button disabled={blocked} onClick={() => onAction(next.value)}>
          Next round
        </Button>
      ) : match.phase === 'round_over' && match.currentPlayer ? (
        <p className="small muted">
          Waiting for {who.inline(match.currentPlayer)} to start the next round.
        </p>
      ) : null}
    </section>
  );
}

function eventText(event: PaperEvent, who: Names) {
  const card = event.name;
  if (event.kind === 'stole') return `You took ${card} from ${who.inline(event.other || '')}.`;
  if (event.kind === 'stolen') return `${who.name(event.other || '')} took your ${card}.`;
  if (event.kind === 'fish') return `Your fish duo drew ${card} from the stock.`;
  return `Your crab duo took ${card} from the discard pile.`;
}

/** Which kinds of duo still change the table; a duo with no effect still scores. */
function duoAvailable(kind: ReturnType<typeof duoKind>, match: Match, selfId: string) {
  const data = paperDetails(match.detail);
  const piles = data.pile_counts.some((count) => count > 0);
  if (kind === 'crab') return piles;
  if (kind === 'fish') return match.drawCount > 0;
  if (kind === 'boat') return match.drawCount > 0 || piles;
  if (kind === 'steal')
    return match.players.some(
      (player) => player.id !== selfId && !data.protected.includes(player.id) && player.count > 0,
    );
  return false;
}

export function PaperTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = paperDetails(match.detail);
  const extra = paperExtras(match.detail);
  const who = names(room, selfId);
  const blocked = pending || room.paused;
  const options = match.actions;
  const find = (type: string) => options.find((option) => option.value.type === type);
  const myTurn = match.currentPlayer === selfId;
  const phase = match.phase;
  const roundComplete = ['round_over', 'finished'].includes(phase);
  // The viewer's unsent choice survives refresh but never outlives its decision.
  const [draft, setDraft] = useTableDraft<string[]>(
    `paper:${room.id}:${room.matchId}:${room.matchVersion}`,
    [],
  );
  const [inspected, setInspected] = useState<number | null>(null);
  const uid = useId();
  const inspectedCard = inspected === null ? null : data.discard_tops[inspected];
  const inspectTake =
    inspected === null
      ? undefined
      : options.find(
          (option) =>
            option.value.type === 'take_discard' && option.value.choice === String(inspected),
        );

  const fresh = new Set(
    extra.private_events.flatMap((event) => (event.card ? [event.card.id] : [])),
  );
  const pairs = options.filter((option) => option.value.type === 'pair');
  const eligible = new Set(pairs.flatMap((option) => option.value.cards || []));
  const selectedHand = match.hand.filter(
    (card) => draft.includes(card.id) && eligible.has(card.id),
  );
  const pair = pairs.find(
    (option) =>
      selectedHand.length === 2 &&
      option.value.cards?.every((id) => selectedHand.some((card) => card.id === id)),
  );
  const kind = duoKind(selectedHand);
  const privateCards = data.private_options;
  const chosen = privateCards.find((card) => card.id === draft[0]) ?? null;
  const toggleHand = (id: string) =>
    setDraft((old) =>
      old.includes(id) ? old.filter((card) => card !== id) : [...old.slice(-1), id],
    );

  const drawTurn = myTurn && phase === 'draw';
  const takeStock = drawTurn ? find('take_stock') : undefined;
  const callerPoints = data.caller ? extra.protected_points[data.caller] : undefined;
  // Saved states from before the summary existed still explain a finished round.
  const lastRound: RoundSummary | null =
    extra.last_round ??
    (roundComplete && Object.keys(data.round_result).length
      ? {
          round: data.round,
          outcome: !Object.values(data.round_result).some((row) => row.award)
            ? 'exhausted'
            : data.caller
              ? (data.round_result[data.caller]?.award ?? 0) >
                (data.round_result[data.caller]?.color_bonus ?? 0)
                ? 'caller_won'
                : 'caller_lost'
              : 'stopped',
          caller: data.caller,
          stopper: null,
          result: data.round_result,
        }
      : null);
  const choiceDock =
    myTurn && ['choosing', 'crab_card', 'crab_pile', 'steal'].includes(phase) && options.length > 0;

  return (
    <div className="table-layout stable-game-table sea-cats-game">
      <PlayerStrip {...props} playerCaption={(p) => `${p.score} points · ${p.count} in hand`} />
      <section
        className="sea-cat-table paper-table"
        aria-label="Sea Salt and Paper table"
        data-phase={phase}
      >
        <div className="paper-heading">
          <p className="eyebrow">Round {data.round}</p>
          <span className="small muted">First to {data.target} points</span>
        </div>
        {lastRound && (roundComplete || lastRound.round < data.round) ? (
          <RoundResults
            summary={lastRound}
            current={roundComplete && lastRound.round === data.round}
            match={match}
            room={room}
            selfId={selfId}
            blocked={blocked}
            onAction={onAction}
          />
        ) : null}
        {data.caller && !roundComplete ? (
          <p className="paper-last-chance" role="status">
            {data.caller === selfId
              ? `You called Last Chance with ${callerPoints ?? data.own_points} card points. Everyone else takes one final turn; your hand is revealed and protected.`
              : data.protected.includes(selfId)
                ? `${playerName(room, data.caller)} called Last Chance with ${callerPoints ?? '?'} card points. Your final turn is done and your hand is protected.`
                : `${playerName(room, data.caller)} called Last Chance with ${callerPoints ?? '?'} card points. Beat ${callerPoints ?? 'that'} on your final turn, or the caller wins the bet. Revealed hands are protected.`}
          </p>
        ) : null}
        {extra.private_events.length ? (
          <ul className="paper-notices" aria-label="Only you can see these updates" role="status">
            {extra.private_events.map((event, index) => (
              <li key={`${event.kind}:${event.name}:${index}`} data-kind={event.kind}>
                {eventText(event, who)}
              </li>
            ))}
          </ul>
        ) : null}
        {/* Your own private decision comes first; the public sea stays below for context. */}
        {choiceDock ? (
          <DecisionDock
            className="paper-source-dock"
            size="fit"
            label="Draw and card choices"
            pending={pending}
          >
            {phase === 'choosing' || phase === 'crab_card' ? (
              <section className="paper-private-choice" aria-label="Your private card choice">
                <h3>
                  {phase === 'choosing'
                    ? 'Choose a card to keep'
                    : `Choose a card from discard ${(extra.crab_pile ?? 0) + 1}`}
                </h3>
                <p className="small muted">
                  {phase === 'choosing'
                    ? 'Only you can see these choices. The other card goes face up on a discard pile.'
                    : 'Only you can see this pile. Take any one card.'}
                </p>
                {phase === 'choosing' ? (
                  <div className="paper-choice-cards" role="group" aria-label="Cards to keep">
                    {privateCards.map((card) => (
                      <PaperPlayingCard
                        key={card.id}
                        card={card}
                        compact
                        selected={chosen?.id === card.id}
                        disabled={blocked}
                        onClick={() => setDraft(chosen?.id === card.id ? [] : [card.id])}
                      />
                    ))}
                  </div>
                ) : (
                  // The whole searched pile at once: no card hides behind rail arrows.
                  <div className="paper-choice-rail">
                    <div
                      className="paper-card-grid paper-choice-grid"
                      role="group"
                      aria-label="Discard cards to choose"
                    >
                      {privateCards.map((card) => (
                        <PaperPlayingCard
                          key={card.id}
                          card={card}
                          compact
                          selected={chosen?.id === card.id}
                          disabled={blocked}
                          onClick={() => setDraft(chosen?.id === card.id ? [] : [card.id])}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="paper-choice-information" aria-live="polite">
                  {chosen ? (
                    <>
                      <strong>{chosen.label}</strong>
                      <p>{chosen.subtitle}</p>
                    </>
                  ) : (
                    <p className="small muted">
                      Select a card to read its rule before you take it.
                    </p>
                  )}
                </div>
                <div className="paper-actions paper-choice-actions">
                  {phase === 'choosing'
                    ? [
                        ...new Set(
                          options.filter((o) => o.value.type === 'keep').map((o) => o.value.choice),
                        ),
                      ].map((pile) => {
                        const option = options.find(
                          (o) =>
                            o.value.type === 'keep' &&
                            o.value.choice === pile &&
                            o.value.card === chosen?.id,
                        );
                        const top = data.discard_tops[Number(pile)];
                        const note = top ? `Covers ${cardName(top)}` : 'Pile is empty';
                        return (
                          <Button
                            key={pile}
                            disabled={blocked || !option}
                            aria-label={`Keep selected · discard to pile ${Number(pile) + 1}`}
                            aria-describedby={`${uid}-keep-${pile}`}
                            onClick={() => option && onAction(option.value)}
                          >
                            <span>
                              Keep selected · discard the other to pile {Number(pile) + 1}
                            </span>
                            <small id={`${uid}-keep-${pile}`}>{note}</small>
                          </Button>
                        );
                      })
                    : (() => {
                        const take = options.find(
                          (o) => o.value.type === 'take_inspected' && o.value.card === chosen?.id,
                        );
                        return (
                          <Button
                            disabled={blocked || !take}
                            onClick={() => take && onAction(take.value)}
                          >
                            {chosen && take
                              ? `Take selected ${chosen.value}`
                              : 'Take selected card'}
                          </Button>
                        );
                      })()}
                  <Button
                    variant="ghost"
                    disabled={blocked || !chosen}
                    onClick={() => setDraft([])}
                  >
                    Clear selection
                  </Button>
                </div>
              </section>
            ) : null}
            {phase === 'crab_pile' ? (
              <section
                className="paper-private-choice"
                aria-label="Choose a discard pile to search"
              >
                <h3>Choose a discard pile to search</h3>
                <p className="small muted">You see the whole pile privately, then take one card.</p>
                <div className="paper-actions paper-choice-actions">
                  {options.map((option) => {
                    const index = Number(option.value.choice);
                    const top = data.discard_tops[index];
                    return (
                      <Button
                        key={option.value.choice}
                        variant="secondary"
                        disabled={blocked}
                        onClick={() => onAction(option.value)}
                      >
                        <span>
                          Search discard {index + 1} · {plural(data.pile_counts[index], 'card')}
                        </span>
                        {top ? <small>Top card: {cardName(top)}</small> : null}
                      </Button>
                    );
                  })}
                </div>
              </section>
            ) : null}
            {phase === 'steal' ? (
              <section className="paper-private-choice" aria-label="Choose a player to steal from">
                <h3>Steal a random card</h3>
                <p className="small muted">
                  Only you and the player you choose will learn which card moves.
                </p>
                <div className="paper-actions paper-steal-targets">
                  {options.map((option) => {
                    const target = match.players.find(
                      (player) => player.id === option.value.target,
                    );
                    const label = playerName(room, option.value.target || '');
                    const facts = target
                      ? `${plural(target.count, 'card')} in hand · ${plural(target.score, 'point')}`
                      : '';
                    return (
                      <Button
                        key={option.value.target}
                        variant="secondary"
                        disabled={blocked}
                        aria-label={`${label} · random card`}
                        aria-describedby={`${uid}-steal-${option.value.target}`}
                        onClick={() => onAction(option.value)}
                      >
                        <span>{label}</span>
                        <small id={`${uid}-steal-${option.value.target}`}>{facts}</small>
                      </Button>
                    );
                  })}
                </div>
                {match.players.some(
                  (player) =>
                    player.id !== selfId && !options.some((o) => o.value.target === player.id),
                ) ? (
                  <p className="small muted">
                    Not available:{' '}
                    {match.players
                      .filter(
                        (player) =>
                          player.id !== selfId &&
                          !options.some((o) => o.value.target === player.id),
                      )
                      .map(
                        (player) =>
                          `${playerName(room, player.id)} (${data.protected.includes(player.id) ? 'hand protected' : 'no cards'})`,
                      )
                      .join(', ')}
                  </p>
                ) : null}
              </section>
            ) : null}
          </DecisionDock>
        ) : null}
        {roundComplete ? null : (
          <section
            className="paper-sea"
            aria-label="Draw pile and discard piles"
            data-active={drawTurn || undefined}
          >
            <div className="paper-stock">
              <span className="eyebrow">Draw pile</span>
              <strong>{match.drawCount}</strong>
              <span className="small muted">
                {match.drawCount === 1 ? 'card left' : 'cards left'}
              </span>
              {drawTurn ? (
                <Button
                  disabled={blocked || !takeStock}
                  onClick={() => takeStock && onAction(takeStock.value)}
                >
                  {match.drawCount === 1 ? 'Take last stock card' : 'Draw two · keep one'}
                </Button>
              ) : null}
            </div>
            {data.discard_tops.map((top, index) => {
              const take = drawTurn
                ? options.find(
                    (option) =>
                      option.value.type === 'take_discard' && option.value.choice === String(index),
                  )
                : undefined;
              return (
                <div
                  className="paper-discard"
                  key={index}
                  data-searched={extra.crab_pile === index || undefined}
                >
                  <span className="paper-pile-label">
                    Discard {index + 1} · {plural(data.pile_counts[index], 'card')}
                  </span>
                  {top ? (
                    <PaperPlayingCard
                      card={top}
                      compact
                      label={`Inspect discard ${index + 1}: ${top.label}. ${top.subtitle}`}
                      onClick={() => setInspected(index)}
                    />
                  ) : (
                    <div className="paper-empty-pile">Empty</div>
                  )}
                  {extra.crab_pile === index ? (
                    <span className="small muted">Being searched</span>
                  ) : null}
                  {take && top ? (
                    <Button
                      variant="secondary"
                      disabled={blocked}
                      aria-label={`Take discard ${index + 1}: ${top.label}`}
                      onClick={() => onAction(take.value)}
                    >
                      Take {cardName(top)}
                    </Button>
                  ) : null}
                </div>
              );
            })}
            {drawTurn ? (
              <p className="paper-sea-hint small muted">
                Tap a discard to read it. Only a Take button takes it.
              </p>
            ) : null}
          </section>
        )}
        <section className="paper-hand" aria-label="Your private hand">
          <div className="paper-heading">
            <h3>Your hand</h3>
            <span className="small muted">
              {data.own_points} card points · {data.own_bonus} color bonus
            </span>
          </div>
          <p className="small muted paper-hand-instruction" aria-hidden={!pairs.length}>
            {pairs.length ? 'Select two matching duo cards to play their effect.' : ' '}
          </p>
          <div
            className="paper-card-grid paper-hand-cards"
            role="group"
            aria-label="Your Sea Salt and Paper hand"
          >
            {match.hand.map((card) => (
              <PaperPlayingCard
                key={card.id}
                card={card}
                fresh={fresh.has(card.id)}
                selected={selectedHand.some((item) => item.id === card.id)}
                onClick={eligible.has(card.id) ? () => toggleHand(card.id) : undefined}
                disabled={blocked || !eligible.has(card.id)}
              />
            ))}
          </div>
          <p className="muted small paper-empty-status" aria-hidden={Boolean(match.hand.length)}>
            {match.hand.length ? ' ' : 'No cards yet.'}
          </p>
        </section>
        {myTurn && phase === 'playing' ? (
          <DecisionDock
            className="paper-turn-dock"
            size="fit"
            label="Your turn choices"
            pending={pending}
          >
            {pairs.length ? (
              <section className="paper-duo" aria-label="Play a duo">
                <p className="paper-duo-summary" aria-live="polite">
                  {pair && kind ? (
                    <>
                      <strong>{selectedHand.map(cardName).join(' + ')}</strong> {duoEffects[kind]}
                      {duoAvailable(kind, match, selfId)
                        ? ''
                        : ' Nothing to take right now, but the pair still scores.'}
                    </>
                  ) : selectedHand.length === 1 ? (
                    `${cardName(selectedHand[0])} selected. Choose a matching card.`
                  ) : (
                    'Select two matching cards in your hand: two crabs, boats or fish, or a shark with a swimmer.'
                  )}
                </p>
                <div className="paper-actions">
                  <Button
                    variant={pair ? 'primary' : 'secondary'}
                    disabled={blocked || !pair}
                    onClick={() => pair && onAction(pair.value)}
                  >
                    {pair?.label || 'Play selected duo'}
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={blocked || !selectedHand.length}
                    onClick={() => setDraft([])}
                  >
                    Clear selection
                  </Button>
                </div>
              </section>
            ) : null}
            <div className="paper-actions paper-endings" aria-label="Finish your turn">
              {options
                .filter((option) =>
                  ['reveal_mermaids', 'stop', 'last_chance', 'end_turn'].includes(
                    option.value.type,
                  ),
                )
                .map((option) => (
                  <div
                    className="paper-ending-choice"
                    key={option.value.type}
                    data-choice={option.value.type}
                  >
                    <Button
                      variant={
                        option.value.type === 'reveal_mermaids' ||
                        (option.value.type === 'end_turn' && !pair)
                          ? 'primary'
                          : 'secondary'
                      }
                      disabled={blocked}
                      onClick={() => onAction(option.value)}
                    >
                      {option.label}
                    </Button>
                    {data.ending_consequences[option.value.type] ? (
                      <p className="small muted">{data.ending_consequences[option.value.type]}</p>
                    ) : null}
                  </div>
                ))}
            </div>
          </DecisionDock>
        ) : null}
        <div className="paper-collections" aria-label="Played and revealed cards">
          {match.players.map((player) => {
            const revealed = data.protected.includes(player.id);
            return (
              <details key={player.id} open={player.id === selfId || revealed}>
                <summary>
                  {playerName(room, player.id)}
                  {player.id === selfId ? ' · you' : ''}
                  <span>
                    {player.bank.length} played
                    {revealed && extra.protected_points[player.id] !== undefined
                      ? ` · hand revealed · ${plural(extra.protected_points[player.id], 'card point')}`
                      : revealed
                        ? ' · hand revealed'
                        : ''}
                  </span>
                </summary>
                {player.bank.length ? (
                  <div className="paper-card-row">
                    {player.bank.map((card) => (
                      <PaperPlayingCard key={card.id} card={card} compact />
                    ))}
                  </div>
                ) : (
                  <p className="small muted">No duos played yet.</p>
                )}
                {player.cards.length ? (
                  <>
                    <p className="eyebrow">Revealed hand</p>
                    <div className="paper-card-row">
                      {player.cards.map((card) =>
                        card ? <PaperPlayingCard key={card.id} card={card} compact /> : null,
                      )}
                    </div>
                  </>
                ) : null}
              </details>
            );
          })}
        </div>
      </section>
      <Modal
        open={Boolean(inspectedCard)}
        onOpenChange={(open) => !open && setInspected(null)}
        title={inspectedCard ? cardName(inspectedCard) : 'Card information'}
        description="Inspecting does not take the card."
      >
        {inspectedCard ? (
          <div className="paper-inspector">
            <PaperPlayingCard card={inspectedCard} />
            <p>{paperRules[inspectedCard.suit] ?? inspectedCard.subtitle}</p>
            <p className="small muted">
              Color counts for the color bonus and for mermaids. Played and unplayed cards both
              score.
            </p>
            {inspectTake && drawTurn ? (
              <Button
                disabled={blocked}
                onClick={() => {
                  setInspected(null);
                  onAction(inspectTake.value);
                }}
              >
                Take {cardName(inspectedCard)}
              </Button>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
