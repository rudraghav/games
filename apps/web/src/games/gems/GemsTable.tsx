'use client';
import { useId, useState } from 'react';
import { Button, DevelopmentCard, ResourceToken, gemColors } from '@games/ui';
import { gemsDetails, type Card } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { ActionPanel } from '../shared/ActionPanel';
import { playerName, type TableProps } from '../types';

export function GemsTable(props: TableProps) {
  const { match, selfId, pending, room, onAction } = props;
  const data = gemsDetails(match.detail);
  const supplyDescriptionId = useId();
  const [selected, setSelected] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Record<string, number>>({});
  const [marketTier, setMarketTier] = useState(1);
  const selectedCard = [...match.community, ...match.hand].find((card) => card.id === selected);
  const quote = selected ? data.purchaseQuotes[selected] : undefined;
  const describe = (counts: Record<string, number>) =>
    Object.entries(counts)
      .filter(([, count]) => count > 0)
      .map(([color, count]) => `${count} ${color}`)
      .join(', ') || 'none';
  const canTake = match.actions.some((option) => ['take', 'take_pair'].includes(option.value.type));
  const chosenColors = Object.keys(chosen).filter((color) => chosen[color]);
  const take = match.actions.find((option) =>
    option.value.type === 'take_pair'
      ? chosenColors.length === 1 && chosen[option.value.choice] === 2
      : option.value.type === 'take' &&
        option.value.choice.split(',').length === chosenColors.length &&
        option.value.choice.split(',').every((color) => chosen[color] === 1),
  );
  function submit(action: Parameters<typeof onAction>[0]) {
    onAction(action);
    setSelected(null);
    setChosen({});
  }
  function development(card: Card, readOnly = false) {
    const info = data.cardInfo[card.id];
    const patron = card.suit === 'patron';
    return (
      <DevelopmentCard
        key={card.id}
        name={card.label}
        bonus={patron ? 'gold' : info.bonus}
        points={patron ? 3 : info.points}
        cost={patron ? data.patronCosts[card.id] || {} : info.cost}
        tier={patron ? undefined : info.tier}
        selected={!readOnly && selected === card.id}
        onClick={readOnly ? undefined : () => setSelected(selected === card.id ? null : card.id)}
        disabled={pending || room.paused}
      />
    );
  }
  return (
    <div className="table-layout stable-game-table gem-layout">
      <PlayerStrip
        {...props}
        playerCaption={(player) => `${player.score} prestige · ${player.count} reserved`}
      />
      <section className="private-hand gem-wallet">
        <h3>Your collection</h3>
        <div className="gem-resources">
          {gemColors.map((color) => (
            <div className="gem-wallet-color" key={color}>
              <ResourceToken color={color} count={data.tokens[selfId]?.[color] || 0} />
              {color !== 'gold' ? (
                <small>{data.bonuses[selfId]?.[color] || 0} discount</small>
              ) : (
                <small>Wild</small>
              )}
            </div>
          ))}
        </div>
        {match.hand.length ? (
          <>
            <p className="eyebrow">Your reserved cards</p>
            <div className="gem-card-row">{match.hand.map((card) => development(card))}</div>
          </>
        ) : null}
      </section>
      <ActionPanel
        {...props}
        match={{
          ...match,
          actions: match.actions.filter(
            (option) => !['take', 'take_pair', 'reserve_blind'].includes(option.value.type),
          ),
        }}
        pinSelection
        instruction={
          match.phase === 'return_tokens'
            ? `Return ${data.returnCount} ${data.returnCount === 1 ? 'gem' : 'gems'} to hold ten.`
            : match.phase === 'patron'
              ? 'Choose one patron whose required discounts you have.'
              : selectedCard
                ? `${selectedCard.label} selected.`
                : 'Select a development to buy or reserve.'
        }
        selectionDetails={
          match.phase === 'playing' && quote ? (
            <div className="gem-purchase-quote" aria-label="Purchase payment" aria-live="polite">
              <dl>
                <div>
                  <dt>Printed cost</dt>
                  <dd>{describe(quote.cost)}</dd>
                </div>
                <div>
                  <dt>Discount</dt>
                  <dd>{describe(quote.discount)}</dd>
                </div>
                {quote.affordable ? (
                  <>
                    <div>
                      <dt>You pay</dt>
                      <dd>{describe(quote.spend)}</dd>
                    </div>
                    <div>
                      <dt>Wallet after</dt>
                      <dd>{describe(quote.after || {})}</dd>
                    </div>
                  </>
                ) : (
                  <div>
                    <dt>Still needed</dt>
                    <dd>
                      {quote.shortfall} matching gems or gold. Missing colours before gold:{' '}
                      {describe(quote.missing_colors)}.
                    </dd>
                  </div>
                )}
              </dl>
              {data.reservationLimit && !match.hand.some((card) => card.id === selected) ? (
                <p className="small">Reserve unavailable: you already have three reserved cards.</p>
              ) : null}
            </div>
          ) : selectedCard?.suit === 'patron' ? (
            <p className="small">
              Required discounts: {describe(data.patronCosts[selectedCard.id] || {})}.
            </p>
          ) : undefined
        }
        cardSelectionRequired
        selected={selected}
        clear={() => setSelected(null)}
        onAction={submit}
      />
      <section className="gem-table" aria-label="Gem Market">
        <div className="gem-supply" aria-label="Shared gem supply">
          {gemColors.map((color) =>
            color === 'gold' ? (
              <ResourceToken key={color} color={color} count={data.bank[color]} />
            ) : (
              <button
                key={color}
                type="button"
                className="gem-supply-choice"
                aria-label={`Select ${color}`}
                aria-pressed={Boolean(chosen[color])}
                aria-describedby={chosen[color] ? `${supplyDescriptionId}-${color}` : undefined}
                disabled={pending || room.paused || !canTake || !data.bank[color]}
                onClick={() =>
                  setChosen((previous) => ({
                    ...previous,
                    [color]:
                      previous[color] === 2
                        ? 0
                        : previous[color] === 1
                          ? Object.values(previous).filter(Boolean).length === 1
                            ? 2
                            : 0
                          : 1,
                  }))
                }
              >
                <ResourceToken color={color} count={data.bank[color]} />
                <small aria-hidden="true">{chosen[color] ? `×${chosen[color]}` : '\u00a0'}</small>
                <span className="sr-only" id={`${supplyDescriptionId}-${color}`}>
                  {chosen[color] ? `${chosen[color]} selected` : 'None selected'}
                </span>
              </button>
            ),
          )}
        </div>
        {canTake ? (
          <div className="gem-take-controls">
            <p className="small muted">
              Choose three different gems, or tap one colour twice when at least four remain.
            </p>
            <Button
              disabled={!take || pending || room.paused}
              onClick={() => take && submit(take.value)}
            >
              Take selected gems
            </Button>
            <button
              className="text-button gem-clear"
              data-empty={!chosenColors.length}
              disabled={!chosenColors.length}
              tabIndex={chosenColors.length ? 0 : -1}
              onClick={() => setChosen({})}
            >
              Clear
            </button>
          </div>
        ) : null}
        {match.actions.some((option) => option.value.type === 'reserve_blind') ? (
          <details className="gem-secondary-actions">
            <summary>Reserve from a deck</summary>
            <div>
              {match.actions
                .filter((option) => option.value.type === 'reserve_blind')
                .map((option) => (
                  <Button
                    key={option.value.choice}
                    variant="secondary"
                    disabled={pending || room.paused}
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
          {[1, 2, 3].map((tier) => (
            <Button
              key={tier}
              variant="secondary"
              aria-pressed={marketTier === tier}
              onClick={() => {
                setMarketTier(tier);
                setSelected(null);
              }}
            >
              Tier {tier}
            </Button>
          ))}
        </div>
        {[1, 2, 3].map((tier) => {
          const cards = match.community.filter((card) => data.cardInfo[card.id]?.tier === tier);
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
                  {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                </small>
              </div>
              <div className="gem-card-row">{cards.map((card) => development(card))}</div>
            </section>
          );
        })}
        <details className="gem-patrons" open={match.phase === 'patron' || undefined}>
          <summary>Patrons · 3 prestige each</summary>
          <div className="patron-row" aria-label="Patrons">
            {match.community
              .filter((card) => card.suit === 'patron')
              .map((card) => development(card))}
          </div>
        </details>
      </section>
      <div className="gem-engines">
        {match.players.map((player) => (
          <details key={player.id}>
            <summary>
              <strong>
                {playerName(room, player.id)}
                {player.id === selfId ? ' · you' : ''}
              </strong>
              <span>
                {player.score} prestige · {player.properties.Patrons?.length || 0} patrons
              </span>
              {player.id !== selfId ? (
                <span className="gem-engine-summary" aria-label="Public permanent discounts">
                  {gemColors
                    .filter((color) => color !== 'gold')
                    .map((color) => (
                      <ResourceToken
                        key={color}
                        color={color}
                        count={data.bonuses[player.id]?.[color] || 0}
                        compact
                      />
                    ))}
                </span>
              ) : null}
            </summary>
            {player.id !== selfId ? (
              <div
                className="gem-discounts"
                aria-label={`${playerName(room, player.id)} public tokens`}
              >
                {gemColors.map((color) => (
                  <ResourceToken
                    key={color}
                    color={color}
                    count={data.tokens[player.id]?.[color] || 0}
                    compact
                  />
                ))}
              </div>
            ) : null}
            <div className="gem-discounts">
              {gemColors
                .filter((color) => color !== 'gold')
                .map((color) => (
                  <span key={color}>
                    <ResourceToken
                      color={color}
                      count={data.bonuses[player.id]?.[color] || 0}
                      compact
                    />{' '}
                    discount
                  </span>
                ))}
            </div>
            <div className="gem-card-row gem-bought-cards">
              {Object.values(player.properties)
                .flat()
                .map((card) => development(card, true))}
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
