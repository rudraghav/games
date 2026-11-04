'use client';
import { useEffect, useId, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { Button, DecisionDock, DevelopmentCard, ResourceToken, gemColors } from '@games/ui';
import { gemsDetails, type Action, type Card } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { useTableDraft } from '../shared/table-draft';
import { nameList } from '../shared/turn-state';
import { playerName, type TableProps } from '../types';

const gems = ['pearl', 'sapphire', 'ruby', 'emerald', 'onyx'] as const;
const HOLD_LIMIT = 10;
const FINAL_TRIGGER = 15;
type Counts = Record<string, number>;
type Draft = { card: string | null; gems: Counts };

/** "Buy Ruby Workshop · 1 prestige" reads "Buy · 1 prestige" under the card's own name. */
const actionText = (label: string, card: string) => label.replace(` ${card}`, '');
/** Patrons are named by their three required colours; the card already says "patron". */
const patronName = (label: string) => label.replace(/^Patron of /, '');
const gemIndex = (color: unknown) => (gems as readonly unknown[]).indexOf(color);
const total = (counts: Counts = {}) => Object.values(counts).reduce((sum, n) => sum + n, 0);
const plural = (n: number, word: string, many = `${word}s`) => `${n} ${n === 1 ? word : many}`;
const listCounts = (counts: Counts = {}) =>
  Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([color, n]) => `${n} ${color}`)
    .join(', ');

/** Compact gem chips, each named for assistive technology. */
function Chips({ counts, empty }: { counts: Counts; empty: string }) {
  const entries = Object.entries(counts).filter(([, n]) => n > 0);
  if (!entries.length) return <span className="gem-chip-empty">{empty}</span>;
  return (
    <span className="gem-chips">
      {entries.map(([color, n]) => (
        <ResourceToken key={color} color={color} count={n} compact />
      ))}
    </span>
  );
}

export function GemsTable(props: TableProps) {
  const { match, selfId, pending, room, onAction } = props;
  const data = gemsDetails(match.detail);
  const supplyHintId = useId();
  const blocked = pending || room.paused;
  const name = (id: string) => playerName(room, id);
  const seated = match.players.some((player) => player.id === selfId);
  // The viewer's unsent picks survive a refresh but never a later decision.
  const [draft, setDraft] = useTableDraft<Draft>(
    `gem-market:${room.id}:${room.matchId}:${room.matchVersion}`,
    { card: null, gems: {} },
  );
  const [notice, setNotice] = useState<string | null>(null);
  const [chosenTier, setChosenTier] = useState<number | null>(null);
  const trayId = `${supplyHintId}-tray`;
  const focusTray = useRef(false);

  const developments = [...match.community, ...match.hand].filter(
    (card) => card.suit !== 'patron' && data.cardInfo[card.id],
  );
  const selectedCard = developments.find((card) => card.id === draft.card);
  const selectedInfo = selectedCard ? data.cardInfo[selectedCard.id] : undefined;
  const fromHand = Boolean(selectedCard && match.hand.some((card) => card.id === selectedCard.id));
  const quote = selectedCard ? data.purchaseQuotes[selectedCard.id] : undefined;
  const tokens = data.tokens[selfId] || {};
  const discounts = data.bonuses[selfId] || {};
  const held = total(tokens);

  // Gem picks follow the server's legal takes, so an illegal pick cannot be built.
  const takeOptions = match.actions.filter((option) => option.value.type === 'take');
  const pairColors = new Set(
    match.actions
      .filter((option) => option.value.type === 'take_pair')
      .map((option) => String(option.value.choice)),
  );
  const canTake = takeOptions.length > 0 || pairColors.size > 0;
  const required = takeOptions.length ? String(takeOptions[0].value.choice).split(',').length : 0;
  const picked = gems.filter((color) => (draft.gems[color] || 0) > 0);
  const pickedCount = picked.reduce((sum, color) => sum + draft.gems[color], 0);
  const take = match.actions.find((option) =>
    option.value.type === 'take_pair'
      ? picked.length === 1 && draft.gems[String(option.value.choice)] === 2
      : option.value.type === 'take' &&
        String(option.value.choice).split(',').length === picked.length &&
        String(option.value.choice)
          .split(',')
          .every((color) => draft.gems[color] === 1),
  );
  const pairPicked = picked.length === 1 && draft.gems[picked[0]] === 2;
  const capReached = required > 0 && picked.length >= required && !pairPicked;

  function pick(color: string) {
    const current = draft.gems[color] || 0;
    const next: Counts = Object.fromEntries(picked.map((c) => [c, draft.gems[c]]));
    let message: string | null = null;
    if (current === 2) delete next[color];
    else if (current === 1) {
      if (picked.length === 1 && pairColors.has(color)) next[color] = 2;
      else {
        delete next[color];
        if (picked.length === 1)
          message = `Two ${color} need at least 4 in the supply; ${data.bank[color] || 0} left.`;
      }
    } else {
      // A pair becomes a single when another colour joins it.
      for (const other of picked) if (next[other] === 2) next[other] = 1;
      next[color] = 1;
    }
    setNotice(message);
    setDraft({ card: null, gems: next });
  }

  function select(card: Card, event: MouseEvent<HTMLButtonElement>) {
    const next = draft.card === card.id ? null : card.id;
    setNotice(null);
    setDraft({ card: next, gems: {} });
    // Keyboard activation moves straight to the decision; pointers stay put.
    focusTray.current = Boolean(next) && event.detail === 0;
  }

  function clearSelection() {
    const id = draft.card;
    setDraft({ card: null, gems: {} });
    if (id)
      requestAnimationFrame(() =>
        document.querySelector<HTMLElement>(`.gem-layout [data-card="${id}"]`)?.focus(),
      );
  }

  function submit(action: Action) {
    onAction(action);
    setNotice(null);
    setDraft({ card: null, gems: {} });
  }

  useEffect(() => {
    if (!focusTray.current) return;
    focusTray.current = false;
    const panel = document.getElementById(trayId);
    (
      panel?.querySelector<HTMLButtonElement>('[data-decision-actions] button:enabled') ||
      panel?.querySelector<HTMLButtonElement>('button:enabled')
    )?.focus();
  }, [draft.card, trayId]);

  const tiers = [1, 2, 3].map((tier) => ({
    tier,
    cards: match.community.filter(
      (card) => card.suit !== 'patron' && data.cardInfo[card.id]?.tier === tier,
    ),
  }));
  function selectedTierOf(card: Card) {
    return match.community.some((item) => item.id === card.id)
      ? (data.cardInfo[card.id]?.tier ?? null)
      : null;
  }
  const selectionTier = selectedCard ? selectedTierOf(selectedCard) : null;
  const marketTier =
    chosenTier ?? selectionTier ?? tiers.find((entry) => entry.cards.length)?.tier ?? 1;
  const statusOf = (card: Card) => {
    const entry = data.purchaseQuotes[card.id];
    if (!entry) return null;
    return entry.affordable
      ? ({ kind: 'affordable' } as const)
      : ({ kind: 'short', amount: entry.shortfall } as const);
  };

  function development(card: Card, options: { readOnly?: boolean; compact?: boolean } = {}) {
    const info = data.cardInfo[card.id];
    return (
      <DevelopmentCard
        key={card.id}
        cardId={card.id}
        name={card.label}
        bonus={info.bonus}
        points={info.points}
        cost={info.cost}
        tier={info.tier}
        compact={options.compact}
        status={options.readOnly || !seated ? null : statusOf(card)}
        selected={!options.readOnly && draft.card === card.id}
        onClick={options.readOnly ? undefined : (event) => select(card, event)}
        disabled={blocked}
      />
    );
  }

  const patrons = match.community.filter((card) => card.suit === 'patron');
  const eligible = (card: Card) =>
    Object.entries(data.patronCosts[card.id] || {}).every(
      ([color, n]) => (discounts[color] || 0) >= n,
    );

  // Who still moves in the final round: the current seat and every seat after it.
  const currentIndex = match.players.findIndex((player) => player.id === match.currentPlayer);
  const selfIndex = match.players.findIndex((player) => player.id === selfId);
  const finalRound = data.finalRound && match.phase !== 'finished' && currentIndex >= 0;
  function finalRoundNote() {
    const leaders = match.players
      .filter((player) => player.score >= FINAL_TRIGGER)
      .map((player) => `${player.id === selfId ? 'You' : name(player.id)} (${player.score})`);
    const later = match.players.slice(currentIndex + 1).map((player) => player.id);
    const laterNames = later.map((id) => (id === selfId ? 'you' : name(id)));
    const opening = `${nameList(leaders)} reached ${FINAL_TRIGGER}+ prestige.`;
    if (!seated) return `${opening} The game ends after ${name(match.players.at(-1)!.id)}’s turn.`;
    if (match.currentPlayer === selfId)
      return `${opening} This is your last turn${later.length ? `; then ${nameList(laterNames)} ${later.length === 1 ? 'moves' : 'move'} once more.` : ' of the game.'}`;
    if (selfIndex > currentIndex) return `${opening} You get one more turn.`;
    const still = [match.currentPlayer!, ...later].map(name);
    return `${opening} Your turns are done; ${nameList(still)} ${still.length === 1 ? 'has' : 'have'} one more.`;
  }

  const actorName = match.currentPlayer ? name(match.currentPlayer) : '';
  const actorReturns = match.currentPlayer
    ? Math.max(0, total(data.tokens[match.currentPlayer]) - HOLD_LIMIT)
    : 0;
  const isActor = match.currentPlayer === selfId && match.actions.length > 0;
  const waitingNote =
    match.phase === 'return_tokens' && !isActor
      ? `${actorName} is returning ${plural(actorReturns, 'gem')} to hold ten.`
      : match.phase === 'patron' && !isActor
        ? `${actorName} is choosing a patron.`
        : null;

  const buy = selectedCard
    ? match.actions.find(
        (option) => option.value.type === 'buy' && option.value.card === selectedCard.id,
      )
    : undefined;
  const reserve = selectedCard
    ? match.actions.find(
        (option) => option.value.type === 'reserve' && option.value.card === selectedCard.id,
      )
    : undefined;
  const returnOptions = match.actions.filter((option) => option.value.type === 'return');
  const patronOptions = match.actions.filter((option) => option.value.type === 'patron');

  let trayLabel = '';
  let trayBody: ReactNode = null;
  if (match.phase === 'return_tokens' && match.currentPlayer === selfId) {
    trayLabel = 'Return gems';
    trayBody = (
      <>
        <div className="gem-tray-heading">
          <div>
            <strong>Return {plural(data.returnCount, 'gem')} to hold ten.</strong>
            <small>You hold {held} now. Tap a gem to give one back.</small>
          </div>
        </div>
        <div
          className="gem-return-choices"
          role="group"
          aria-label="Return one gem"
          data-decision-actions
        >
          {returnOptions.map((option) => {
            const color = String(option.value.choice);
            return (
              <button
                key={color}
                type="button"
                className="gem-return-choice"
                aria-label={`${option.label} (you hold ${tokens[color] || 0})`}
                disabled={blocked}
                onClick={() => submit(option.value)}
              >
                <ResourceToken color={color} count={tokens[color] || 0} compact />
                <small aria-hidden="true">−1</small>
              </button>
            );
          })}
        </div>
      </>
    );
  } else if (match.phase === 'patron' && patronOptions.length) {
    trayLabel = 'Choose a patron';
    trayBody = (
      <>
        <div className="gem-tray-heading">
          <div>
            <strong>A patron will visit you</strong>
            <small>Choose one for +3 prestige. Ready patrons are marked in the Patrons row.</small>
          </div>
        </div>
        <div className="gem-tray-actions" data-decision-actions>
          {patronOptions.map((option) => (
            <Button
              key={String(option.value.card)}
              disabled={blocked}
              onClick={() => submit(option.value)}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </>
    );
  } else if (selectedCard && selectedInfo) {
    trayLabel = 'Selected development';
    const missing = quote ? total(quote.missing_colors) : 0;
    trayBody = (
      <>
        <div className="gem-tray-heading">
          <div>
            <strong>{selectedCard.label}</strong>
            <small>
              Tier {selectedInfo.tier} · {plural(selectedInfo.points, 'prestige', 'prestige')} ·{' '}
              {selectedInfo.bonus} discount{fromHand ? ' · reserved by you' : ''}
            </small>
          </div>
          <Button variant="ghost" size="sm" aria-label="Clear selection" onClick={clearSelection}>
            Clear
          </Button>
        </div>
        {quote ? (
          <dl className="gem-purchase-quote" aria-label="Purchase payment">
            <div>
              <dt>Printed cost</dt>
              <dd>
                <Chips counts={quote.cost} empty="free" />
              </dd>
            </div>
            <div>
              <dt>Discount</dt>
              <dd>
                <Chips counts={quote.discount} empty="none yet" />
              </dd>
            </div>
            {quote.affordable ? (
              <>
                <div>
                  <dt>You pay</dt>
                  <dd>
                    <Chips counts={quote.spend} empty="nothing" />
                  </dd>
                </div>
                <div>
                  <dt>Left after</dt>
                  <dd>
                    <Chips counts={quote.after || {}} empty="no gems" />
                  </dd>
                </div>
              </>
            ) : (
              <div className="gem-quote-short">
                <dt>Short by {quote.shortfall}</dt>
                <dd>
                  Missing {listCounts(quote.missing_colors)}
                  {tokens.gold
                    ? `; your ${tokens.gold} gold ${tokens.gold === 1 ? 'covers' : 'cover'} ${Math.min(tokens.gold, missing)} of ${missing}.`
                    : ', and you have no gold to cover it.'}
                </dd>
              </div>
            )}
          </dl>
        ) : null}
        <div className="gem-tray-actions" data-decision-actions>
          {buy ? (
            <Button
              disabled={blocked}
              aria-label={`${actionText(buy.label, selectedCard.label)} · ${selectedCard.label}`}
              onClick={() => submit(buy.value)}
            >
              {actionText(buy.label, selectedCard.label)}
            </Button>
          ) : null}
          {reserve ? (
            <Button
              variant="secondary"
              disabled={blocked}
              aria-label={`${actionText(reserve.label, selectedCard.label)} · ${selectedCard.label}`}
              onClick={() => submit(reserve.value)}
            >
              {actionText(reserve.label, selectedCard.label)}
            </Button>
          ) : null}
          {!buy && !reserve ? (
            <p className="small gem-tray-reason">
              {match.currentPlayer !== selfId || match.phase !== 'playing'
                ? 'You can buy or reserve on your turn.'
                : fromHand
                  ? 'Collect the missing gems to buy this reserved card.'
                  : data.reservationLimit
                    ? 'You can’t reserve: you already hold three reserved cards.'
                    : 'No move for this card right now.'}
            </p>
          ) : !reserve && !fromHand && data.reservationLimit ? (
            <p className="small gem-tray-reason">Reserve unavailable: three cards reserved.</p>
          ) : null}
        </div>
      </>
    );
  }

  const supplyHint = !canTake
    ? ''
    : notice
      ? notice
      : take
        ? `Ready to take ${listCounts(Object.fromEntries(picked.map((c) => [c, draft.gems[c]])))}.${
            held + pickedCount > HOLD_LIMIT
              ? ` You’ll hold ${held + pickedCount}, then return ${held + pickedCount - HOLD_LIMIT}.`
              : ''
          }`
        : !picked.length
          ? required >= 3
            ? `Pick 3 different colours${pairColors.size ? ', or one colour twice where 4+ remain' : ''}.`
            : `Only ${plural(required, 'colour')} left: take one of each${pairColors.size ? ', or two of a colour with 4+' : ''}.`
          : capReached
            ? 'That’s three colours. Tap one to remove it.'
            : `Pick ${plural(required - picked.length, 'more colour', 'more colours')}${
                picked.length === 1 && pairColors.has(picked[0])
                  ? `, or tap ${picked[0]} again for two`
                  : ''
              }.`;

  return (
    <div className="table-layout stable-game-table gem-layout" data-phase={match.phase}>
      <PlayerStrip
        {...props}
        playerCaption={(player) => {
          if (!finalRound) return `${player.score} prestige · ${player.count} reserved`;
          const index = match.players.findIndex((item) => item.id === player.id);
          return `${player.score} prestige · ${index < currentIndex ? 'done' : index === currentIndex ? 'last turn' : '1 turn left'}`;
        }}
      />
      {finalRound || waitingNote ? (
        <div className="gem-status" role="status" data-final={finalRound}>
          {finalRound ? (
            <p>
              <strong>Final round</strong> {finalRoundNote()}
            </p>
          ) : null}
          {waitingNote ? <p>{waitingNote}</p> : null}
        </div>
      ) : null}
      {match.phase === 'finished' ? (
        <section className="gem-final-summary" aria-label="Final collections">
          <h3>Final collections</h3>
          <p className="small muted">Most prestige wins; fewer developments break a tie.</p>
          <div role="list">
            {[...match.players]
              .sort(
                (a, b) =>
                  b.score - a.score ||
                  (a.properties.Developments?.length || 0) -
                    (b.properties.Developments?.length || 0),
              )
              .map((player) => (
                <div
                  role="listitem"
                  key={player.id}
                  data-winner={match.winners.includes(player.id)}
                >
                  <strong>
                    {name(player.id)}
                    {player.id === selfId ? ' · you' : ''}
                  </strong>
                  <span>
                    {player.score} prestige ·{' '}
                    {plural(player.properties.Developments?.length || 0, 'development')} ·{' '}
                    {plural(player.properties.Patrons?.length || 0, 'patron')}
                  </span>
                </div>
              ))}
          </div>
        </section>
      ) : null}
      <section className="private-hand gem-wallet" aria-label="Your collection">
        <div className="gem-wallet-heading">
          <h3>Your collection</h3>
          {seated ? (
            <small>
              {held}/{HOLD_LIMIT} gems held ·{' '}
              <span className="gem-discount-card" aria-hidden="true" /> discounts from your
              developments
            </small>
          ) : null}
        </div>
        <div className="gem-resources">
          {gemColors.map((color) => (
            <div className="gem-wallet-color" key={color}>
              <ResourceToken
                color={color}
                count={tokens[color] || 0}
                label={`${tokens[color] || 0} ${color} held`}
              />
              {color !== 'gold' ? (
                <small
                  className="gem-discount"
                  data-gem={color}
                  role="img"
                  aria-label={`${discounts[color] || 0} ${color} discount`}
                >
                  <span className="gem-discount-card" aria-hidden="true" />
                  {discounts[color] || 0}
                </small>
              ) : (
                <small className="gem-discount gem-discount--wild">Wild</small>
              )}
            </div>
          ))}
        </div>
        {match.hand.length ? (
          <>
            <p className="eyebrow">Your reserved cards · {match.hand.length}/3</p>
            <div className="gem-reserved-row">
              {match.hand.map((card) => development(card, { compact: true }))}
            </div>
          </>
        ) : null}
      </section>
      <section className="gem-table" aria-label="Gem Market">
        <div className="gem-supply" aria-label="Shared gem supply">
          {gemColors.map((color) =>
            color === 'gold' ? (
              <span className="gem-supply-gold" key={color}>
                <ResourceToken
                  color={color}
                  count={data.bank[color]}
                  label={`${data.bank[color]} gold in supply`}
                />
                <small>Wild</small>
              </span>
            ) : (
              <button
                key={color}
                type="button"
                className="gem-supply-choice"
                aria-label={`Select ${color}`}
                aria-pressed={Boolean(draft.gems[color])}
                aria-describedby={canTake ? `${supplyHintId}-hint` : undefined}
                disabled={
                  blocked || !canTake || !data.bank[color] || (!draft.gems[color] && capReached)
                }
                onClick={() => pick(color)}
              >
                <ResourceToken color={color} count={data.bank[color]} />
                <small aria-hidden="true">
                  {draft.gems[color] ? `×${draft.gems[color]}` : ' '}
                </small>
              </button>
            ),
          )}
        </div>
        {canTake ? (
          <div className="gem-take-controls">
            <p
              className="small gem-take-hint"
              id={`${supplyHintId}-hint`}
              aria-live="polite"
              data-ready={Boolean(take)}
            >
              {supplyHint}
            </p>
            <Button disabled={!take || blocked} onClick={() => take && submit(take.value)}>
              Take selected gems
            </Button>
            <button
              className="text-button gem-clear"
              data-empty={!picked.length}
              disabled={!picked.length}
              tabIndex={picked.length ? 0 : -1}
              onClick={() => {
                setNotice(null);
                setDraft({ card: null, gems: {} });
              }}
            >
              Clear
            </button>
          </div>
        ) : null}
        {match.actions.some((option) => option.value.type === 'reserve_blind') ? (
          <details className="gem-secondary-actions">
            <summary>Reserve a face-down card</summary>
            <div>
              {match.actions
                .filter((option) => option.value.type === 'reserve_blind')
                .map((option) => (
                  <Button
                    key={String(option.value.choice)}
                    variant="secondary"
                    disabled={blocked}
                    onClick={() => submit(option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
            </div>
          </details>
        ) : null}
        <div
          className="choice-group gem-tier-navigation"
          role="group"
          aria-label="Development tiers"
        >
          {tiers.map(({ tier, cards }) => {
            const affordable = seated
              ? cards.filter((card) => data.purchaseQuotes[card.id]?.affordable).length
              : 0;
            return (
              <Button
                key={tier}
                variant="secondary"
                aria-label={`Tier ${tier}`}
                aria-describedby={`${supplyHintId}-tier-${tier}`}
                aria-pressed={marketTier === tier}
                data-selection={selectionTier === tier}
                onClick={() => setChosenTier(tier)}
              >
                <span>Tier {tier}</span>
                <small aria-hidden="true">
                  {cards.length}
                  {affordable ? <b> · {affordable}✓</b> : null}
                </small>
                <span className="sr-only" id={`${supplyHintId}-tier-${tier}`}>
                  {plural(cards.length, 'card')}
                  {affordable ? `, ${affordable} affordable` : ''}
                  {selectionTier === tier ? ', holds your selected card' : ''}
                </span>
              </Button>
            );
          })}
        </div>
        {tiers.map(({ tier, cards }) => {
          const affordable = seated
            ? cards.filter((card) => data.purchaseQuotes[card.id]?.affordable).length
            : 0;
          return (
            <section
              className="gem-tier"
              key={tier}
              data-active={marketTier === tier}
              aria-label={`Tier ${tier} developments`}
            >
              <div className="gem-tier-heading">
                <span className="eyebrow">Tier {tier}</span>
                <small className="muted">
                  {plural(cards.length, 'card')}
                  {affordable ? ` · ${affordable} affordable` : ''}
                </small>
              </div>
              {cards.length ? (
                <div className="gem-card-row">{cards.map((card) => development(card))}</div>
              ) : (
                <p className="small muted gem-tier-empty">No Tier {tier} cards remain.</p>
              )}
            </section>
          );
        })}
        <section
          className="gem-patrons"
          aria-label="Patrons"
          data-choosing={match.phase === 'patron' && isActor}
        >
          <div className="gem-patrons-heading">
            <h3>Patrons</h3>
            <small>+3 prestige each. A patron visits once you hold the discounts shown.</small>
          </div>
          <div className="patron-row" aria-label="Patrons">
            {patrons.map((card) => (
              <DevelopmentCard
                key={card.id}
                cardId={card.id}
                name={patronName(card.label)}
                bonus="gold"
                patron
                compact
                points={3}
                cost={data.patronCosts[card.id] || {}}
                have={seated ? discounts : undefined}
                status={seated && eligible(card) ? { kind: 'eligible' } : null}
              />
            ))}
          </div>
        </section>
      </section>
      {trayBody ? (
        <DecisionDock
          id={trayId}
          className="gem-tray"
          size="fit"
          label={trayLabel}
          pending={pending}
          onKeyDown={(event) => {
            if (event.key === 'Escape' && draft.card) clearSelection();
          }}
        >
          {trayBody}
        </DecisionDock>
      ) : null}
      <div className="gem-engines">
        {match.players.map((player) => {
          const bought = player.properties.Developments || [];
          const visitors = player.properties.Patrons || [];
          const holding = data.tokens[player.id] || {};
          return (
            <details key={player.id}>
              <summary>
                <strong>
                  {name(player.id)}
                  {player.id === selfId ? ' · you' : ''}
                </strong>
                <span>
                  {player.score} prestige · {plural(bought.length, 'development')} ·{' '}
                  {plural(visitors.length, 'patron')}
                </span>
                {player.id !== selfId ? (
                  <span className="gem-engine-summary" aria-label="Public permanent discounts">
                    {gems.map((color) => (
                      <ResourceToken
                        key={color}
                        color={color}
                        count={data.bonuses[player.id]?.[color] || 0}
                        label={`${data.bonuses[player.id]?.[color] || 0} ${color} discount`}
                        compact
                      />
                    ))}
                  </span>
                ) : null}
              </summary>
              <dl className="gem-engine-rows">
                <div>
                  <dt>
                    Holding · {total(holding)}/{HOLD_LIMIT}
                  </dt>
                  <dd className="gem-discounts" aria-label={`${name(player.id)} public tokens`}>
                    {gemColors.map((color) => (
                      <ResourceToken
                        key={color}
                        color={color}
                        count={holding[color] || 0}
                        compact
                      />
                    ))}
                  </dd>
                </div>
                <div>
                  <dt>Discounts</dt>
                  <dd className="gem-discounts">
                    {gems.map((color) => (
                      <ResourceToken
                        key={color}
                        color={color}
                        count={data.bonuses[player.id]?.[color] || 0}
                        label={`${data.bonuses[player.id]?.[color] || 0} ${color} discount`}
                        compact
                      />
                    ))}
                  </dd>
                </div>
                <div>
                  <dt>Reserved</dt>
                  <dd>
                    {player.id === selfId
                      ? `${plural(player.count, 'card')}, shown in your collection`
                      : `${plural(player.count, 'card')}, hidden`}
                  </dd>
                </div>
              </dl>
              <div className="gem-card-row gem-bought-cards">
                {[...bought]
                  .sort((a, b) => gemIndex(a.color) - gemIndex(b.color))
                  .map((card) => development(card, { readOnly: true, compact: true }))}
                {visitors.map((card) => (
                  <DevelopmentCard
                    key={card.id}
                    name={patronName(card.label)}
                    bonus="gold"
                    patron
                    compact
                    points={3}
                    cost={Object.fromEntries(
                      String(card.subtitle || '')
                        .split(' · ')
                        .filter(Boolean)
                        .map((part) => {
                          const [n, color] = part.split(' ');
                          return [color, Number(n)];
                        }),
                    )}
                  />
                ))}
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
