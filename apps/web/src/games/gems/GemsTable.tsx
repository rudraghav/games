'use client';
import { useState } from 'react';
import { Button, DevelopmentCard, ResourceToken, gemColors } from '@games/ui';
import { gemsDetails, type Card } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { ActionPanel } from '../shared/ActionPanel';
import { playerName, type TableProps } from '../types';

export function GemsTable(props: TableProps) {
  const { match, selfId, pending, room, onAction } = props;
  const data = gemsDetails(match.detail);
  const [selected, setSelected] = useState<string | null>(null);
  const [chosen, setChosen] = useState<Record<string, number>>({});
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
    <div className="table-layout gem-layout">
      <PlayerStrip
        {...props}
        playerCaption={(player) => `${player.score} prestige · ${player.count} reserved`}
      />
      <section className="private-hand">
        <h3>Your collection</h3>
        <div className="gem-resources">
          {gemColors.map((color) => (
            <ResourceToken key={color} color={color} count={data.tokens[selfId]?.[color] || 0} />
          ))}
        </div>
        <div className="gem-own-discounts" aria-label="Your permanent discounts">
          <span className="small muted">Discounts</span>
          {gemColors
            .filter((color) => color !== 'gold')
            .map((color) => (
              <ResourceToken
                key={color}
                color={color}
                count={data.bonuses[selfId]?.[color] || 0}
                compact
              />
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
          selected
            ? `${[...match.community, ...match.hand].find((card) => card.id === selected)?.label || 'Card'} selected.`
            : 'Select a development to buy or reserve.'
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
                {chosen[color] ? <small>{chosen[color]} selected</small> : null}
              </button>
            ),
          )}
        </div>
        {canTake ? (
          <div className="gem-take-controls">
            <p className="small muted">Choose three different gems, or tap one colour twice.</p>
            <Button
              disabled={!take || pending || room.paused}
              onClick={() => take && submit(take.value)}
            >
              Take selected gems
            </Button>
            {chosenColors.length ? (
              <button className="text-button" onClick={() => setChosen({})}>
                Clear
              </button>
            ) : null}
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
        {[3, 2, 1].map((tier) => (
          <section className="gem-tier" key={tier} aria-label={`Tier ${tier} developments`}>
            <span className="eyebrow">Tier {tier}</span>
            <div className="gem-card-row">
              {match.community
                .filter((card) => data.cardInfo[card.id]?.tier === tier)
                .map((card) => development(card))}
            </div>
          </section>
        ))}
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
            </summary>
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
