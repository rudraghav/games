'use client';
import { Check, ChevronDown, Landmark, Plus, House } from 'lucide-react';
import { Seat, PlayingCard } from '@games/ui';
import type { ActionOption, Card, DealDetails, Player } from '@games/api-client';
import type { TableProps } from '../types';
import { bankValue, pileName } from './presentation';

interface Props extends TableProps {
  player: Player;
  details: DealDetails;
  selected: string | null;
  paid: string[];
  paymentEligible: string[] | null;
  placements: ActionOption[];
  candidate: ActionOption | null;
  onSelect: (id: string) => void;
  onDestination: (option: ActionOption) => void;
}
export function DealPlayer(props: Props) {
  const { player, room, selfId, match, details, placements, selected, candidate } = props;
  const own = player.id === selfId;
  const member = room.members.find((item) => item.id === player.id);
  const groups = Object.entries(player.properties);
  const assets = [...player.bank, ...groups.flatMap(([, cards]) => cards)];
  const isSelected = (id: string) =>
    props.paymentEligible ? props.paid.includes(id) : selected === id;
  const selectable = (card: Card) =>
    props.paymentEligible
      ? own && props.paymentEligible.includes(card.id)
      : match.actions.some((option) => option.value.card === card.id);
  const renderCard = (card: Card) => (
    <PlayingCard
      key={card.id}
      card={card}
      family="property"
      compact
      selected={isSelected(card.id)}
      disabled={props.pending || room.paused}
      onClick={selectable(card) ? () => props.onSelect(card.id) : undefined}
    />
  );
  const destination = (key: string) =>
    own ? placements.find((option) => option.value.choice === key) : undefined;
  const newPiles = own
    ? placements.filter(
        (option) => option.value.choice && !groups.some(([key]) => key === option.value.choice),
      )
    : [];
  const board = (
    <div className="deal-assets">
      <section className="deal-bank" aria-label={`${own ? 'Your' : member?.name || 'Player'} bank`}>
        <header>
          <span>
            <Landmark size={14} /> Bank
          </span>
          <strong>{player.bank.reduce((sum, card) => sum + bankValue(card), 0)}M</strong>
        </header>
        <div className="deal-bank-notes">
          {player.bank.map((card) =>
            selectable(card) ? (
              <button
                type="button"
                key={card.id}
                aria-label={`${card.label}, bank value ${card.value}`}
                aria-pressed={isSelected(card.id)}
                disabled={props.pending || room.paused}
                onClick={() => props.onSelect(card.id)}
                className="deal-bank-note"
              >
                <b>{card.value}</b>
                <span>{card.subtitle === 'MONEY' ? 'Money' : card.label}</span>
              </button>
            ) : (
              <span className="deal-bank-note" key={card.id}>
                <b>{card.value}</b>
                <span>{card.subtitle === 'MONEY' ? 'Money' : card.label}</span>
              </span>
            ),
          )}
          {!player.bank.length ? <span className="deal-empty">No money banked</span> : null}
        </div>
      </section>
      <div className="deal-collections">
        {groups.map(([key, cards]) => {
          const info = details.collections.find(
            (item) => item.player === player.id && item.key === key,
          );
          const reference = details.propertyGroups.find(
            (group) => group.color === key.split(':')[0],
          );
          const placement = destination(key);
          const owned = new Set(cards.map((card) => card.label));
          return (
            <section
              className="deal-collection"
              key={key}
              data-property-color={key.split(':')[0]}
              data-complete={info?.complete}
              data-destination={Boolean(placement)}
            >
              <header>
                <span className="deal-set-dot" />
                <strong>{pileName(key, details.propertyGroups)}</strong>
                <span>
                  {info?.count ?? cards.filter((card) => card.suit === 'property').length}/
                  {info?.setSize ?? reference?.setSize ?? '?'}
                </span>
                {info?.complete ? <Check size={14} aria-label="Complete set" /> : null}
              </header>
              <div className="deal-collection-cards">
                {cards.filter((card) => card.suit === 'property').map(renderCard)}
              </div>
              {cards.some((card) => card.suit !== 'property') ? (
                <div className="deal-buildings">
                  {cards
                    .filter((card) => card.suit !== 'property')
                    .map((card) =>
                      selectable(card) ? (
                        <button
                          type="button"
                          key={card.id}
                          aria-label={`${card.label}, bank value ${card.value}`}
                          aria-pressed={isSelected(card.id)}
                          disabled={props.pending || room.paused}
                          onClick={() => props.onSelect(card.id)}
                        >
                          <House size={13} />
                          {card.label}
                          <span>{card.value}</span>
                        </button>
                      ) : (
                        <span key={card.id}>
                          <House size={13} />
                          {card.label}
                          <span>{card.value}</span>
                        </span>
                      ),
                    )}
                </div>
              ) : null}
              <footer>
                <span>
                  Rent <b>{info ? `${info.rent}M` : '—'}</b>
                </span>
                <details className="deal-set-reference">
                  <summary aria-label={`Inspect ${pileName(key, details.propertyGroups)}`}>
                    Details <ChevronDown size={12} />
                  </summary>
                  <div>
                    <strong>{reference?.name} properties</strong>
                    <ul>
                      {reference?.properties.map((name) => (
                        <li key={name} data-owned={owned.has(name)}>
                          {owned.has(name) ? '✓' : '○'} {name}
                        </li>
                      ))}
                    </ul>
                    {cards.some((card) => (card.colors?.length || 0) > 1) ? (
                      <p>Wilds count toward completion.</p>
                    ) : null}
                    <p>Rent: {reference?.rentLadder.map((value) => `${value}M`).join(' / ')}</p>
                  </div>
                </details>
              </footer>
              {placement ? (
                <button
                  type="button"
                  className="deal-destination"
                  aria-pressed={candidate === placement}
                  onClick={() => props.onDestination(placement)}
                  disabled={props.pending || room.paused}
                >
                  Place here
                </button>
              ) : null}
            </section>
          );
        })}
        {newPiles.map((option) => (
          <button
            key={option.value.choice}
            type="button"
            className="deal-new-set"
            data-property-color={option.value.color}
            aria-pressed={candidate === option}
            disabled={props.pending || room.paused}
            onClick={() => props.onDestination(option)}
          >
            <Plus size={18} />
            <span>New {pileName(option.value.choice, details.propertyGroups)}</span>
          </button>
        ))}
        {!groups.length && !newPiles.length ? (
          <div className="deal-empty-collection">
            <span className="deal-set-slots">
              <i />
              <i />
              <i />
            </span>
            <span>
              {own ? 'Build three different property sets to win' : 'No properties played'}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
  return (
    <article
      className="deal-player"
      data-own={own}
      data-empty={!assets.length}
      data-active={match.currentPlayer === player.id}
    >
      <div className="deal-player-heading">
        <Seat
          compact
          name={member?.name || 'Player'}
          avatar={member?.avatar}
          bot={member?.isBot}
          you={own}
          active={match.currentPlayer === player.id}
          connected={member?.connected ?? false}
          caption={`${player.count} card${player.count === 1 ? '' : 's'} · ${player.score}/3 sets${details.debts[player.id]?.length ? ` · ${details.debts[player.id].length} debt` : ''}`}
        />
        {!own ? (
          <strong className="deal-opponent-bank">
            {player.bank.reduce((sum, card) => sum + bankValue(card), 0)}M
          </strong>
        ) : null}
      </div>
      {own ? (
        board
      ) : assets.length ? (
        <details className="deal-opponent-details">
          <summary>
            View bank & properties <ChevronDown size={14} />
          </summary>
          {board}
        </details>
      ) : null}
    </article>
  );
}
