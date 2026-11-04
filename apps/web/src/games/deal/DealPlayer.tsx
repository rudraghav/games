'use client';
import { Check, Hotel, House, Info, Landmark, Plus, Tent } from 'lucide-react';
import { Seat, PlayingCard, Button } from '@games/ui';
import type { ActionOption, Card, DealDetails, Player } from '@games/api-client';
import { OpponentPanel } from '../shared/OpponentPanel';
import type { TableProps } from '../types';
import { pileName } from './presentation';
import { SHORT_SET_NAMES, bankTotal, debtNames, denominations } from './table-status';

interface Props extends TableProps {
  player: Player;
  details: DealDetails;
  selected: string | null;
  paid: string[];
  paymentEligible: string[] | null;
  placements: ActionOption[];
  candidate: ActionOption | null;
  onSelect: (id: string) => void;
  onInspect: (id: string) => void;
  onDestination: (option: ActionOption) => void;
  previewIds?: string[];
  targeted?: string;
  targetable?: string[];
  onTarget?: (id: string) => void;
}

const buildingIcons = { House, Hotel, Shack: Tent } as const;

/** A building badge names the building in text for assistive technology. */
function BuildingMark({ card }: { card: Card }) {
  const Icon = buildingIcons[card.label as keyof typeof buildingIcons] || House;
  return (
    <span className="deal-chip-building" title={card.label}>
      <Icon size={12} role="img" aria-label={card.label} />
    </span>
  );
}

export function DealPlayer(props: Props) {
  const { player, room, selfId, match, details, placements, selected, candidate } = props;
  const own = player.id === selfId;
  const member = room.members.find((item) => item.id === player.id);
  const groups = Object.entries(player.properties);
  const assets = [...player.bank, ...groups.flatMap(([, cards]) => cards)];
  const previewed = (cards: Card[]) => cards.some((card) => props.previewIds?.includes(card.id));
  const debts = details.debts[player.id] || [];
  const total = bankTotal(player.bank);
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
      className={props.previewIds?.includes(card.id) ? 'deal-preview-card' : undefined}
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
  // Individual notes only while one can be chosen; otherwise the bank reads as denominations.
  const individualNotes = player.bank.some(selectable);
  const board = (
    <div className="deal-assets">
      <section className="deal-bank" aria-label={`${own ? 'Your' : member?.name || 'Player'} bank`}>
        <header>
          <span>
            <Landmark size={14} aria-hidden="true" /> Bank
          </span>
          <strong>{total}M</strong>
        </header>
        <div className="deal-bank-notes" data-grouped={!individualNotes}>
          {individualNotes
            ? player.bank.map((card) =>
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
              )
            : denominations(player.bank).map((note) => (
                <span
                  className="deal-bank-note"
                  key={note.value}
                  data-count={note.count}
                  data-previewed={previewed(note.cards) || undefined}
                  title={note.cards.map((card) => card.label).join(', ')}
                >
                  <b>{note.label}</b>
                  {note.count > 1 ? <span>×{note.count}</span> : null}
                </span>
              ))}
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
                          <House size={13} aria-hidden="true" />
                          {card.label}
                          <span>{card.value}</span>
                        </button>
                      ) : (
                        <span key={card.id}>
                          <House size={13} aria-hidden="true" />
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
                <Button
                  className="deal-set-info"
                  variant="ghost"
                  size="sm"
                  aria-label={`Inspect ${pileName(key, details.propertyGroups)}`}
                  onClick={() => props.onInspect(cards[0].id)}
                >
                  <Info size={14} />
                  Info
                </Button>
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
            <Plus size={18} aria-hidden="true" />
            <span>New {pileName(option.value.choice, details.propertyGroups)}</span>
          </button>
        ))}
        {!groups.length && !newPiles.length ? (
          <div className="deal-empty-collection">
            <span className="deal-set-slots" aria-hidden="true">
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
  if (!own) {
    const sets = details.collections.filter((group) => group.player === player.id);
    const notes = denominations(player.bank);
    return (
      <OpponentPanel
        player={player}
        room={room}
        active={match.currentPlayer === player.id}
        caption={`${player.count} card${player.count === 1 ? '' : 's'} · ${player.score}/3 sets`}
        className="deal-opponent"
        highlighted={props.targeted === player.id}
        onTarget={
          props.targetable?.includes(player.id) ? () => props.onTarget?.(player.id) : undefined
        }
        targetLabel={`Choose ${member?.name || 'player'}`}
        targetDisabled={props.pending || room.paused}
        summary={
          <>
            <span
              className="deal-summary-bank"
              data-previewed={previewed(player.bank) || undefined}
            >
              <Landmark size={13} aria-hidden="true" />
              <span className="deal-summary-label">Bank</span>
              <b>{total}M</b>
              {notes.length ? (
                <span className="deal-summary-notes">
                  {notes
                    .map((note) => `${note.label}${note.count > 1 ? ` ×${note.count}` : ''}`)
                    .join(' · ')}
                </span>
              ) : null}
            </span>
            {debts.length ? (
              <span className="deal-summary-debt">Owes {debtNames(room, debts, selfId)}</span>
            ) : null}
            {sets.map((group) => {
              const cards = player.properties[group.key] || [];
              const buildings = cards.filter((card) => card.suit !== 'property');
              return (
                <span
                  key={group.key}
                  className="deal-chip"
                  data-property-color={group.color}
                  data-complete={group.complete}
                  data-previewed={previewed(cards) || undefined}
                  title={`${pileName(group.key, details.propertyGroups)} · ${group.count} of ${group.setSize} · rent ${group.rent}M`}
                >
                  <i aria-hidden="true" />
                  <span>{SHORT_SET_NAMES[group.color] || group.color}</span>
                  <b>
                    {group.count}/{group.setSize}
                  </b>
                  {group.complete ? (
                    <>
                      <Check size={12} role="img" aria-label="complete" />
                      <span className="deal-chip-rent">{group.rent}M</span>
                    </>
                  ) : null}
                  {buildings.map((card) => (
                    <BuildingMark key={card.id} card={card} />
                  ))}
                </span>
              );
            })}
            {!sets.length ? <span className="deal-summary-empty">No sets yet</span> : null}
          </>
        }
      >
        {board}
      </OpponentPanel>
    );
  }
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
          you
          active={match.currentPlayer === player.id}
          connected={member?.connected ?? false}
          caption={`${player.score} of 3 sets complete${debts.length ? ` · you owe ${debtNames(room, debts, selfId)}` : ''}`}
        />
      </div>
      {board}
    </article>
  );
}
