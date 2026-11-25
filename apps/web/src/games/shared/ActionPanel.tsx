'use client';
import { useState, type ReactNode } from 'react';
import { Button, PlayingCard, DecisionDock } from '@games/ui';
import type { Action, ActionOption, Card } from '@games/api-client';
import { playerName, type TableProps } from '../types';
import { repeatsNotice, turnState } from './turn-state';

/** Choices that back out of a turn never take the filled button. */
const QUIET = ['fold', 'end_turn', 'decline'];

function Decision({
  option,
  lead,
  onAction,
  pending,
  assets,
}: {
  option: ActionOption;
  /** The one filled choice in the dock. */
  lead: boolean;
  onAction: (action: Action) => void;
  pending: boolean;
  assets: Card[];
}) {
  const [amount, setAmount] = useState(option.minimum ?? 0);
  const [cards, setCards] = useState<string[]>([]);
  return (
    <div className="decision-control">
      {option.input === 'amount' ? (
        <label className="amount-control">
          <span className="sr-only">{option.label} amount</span>
          <input
            type="number"
            min={option.minimum ?? 0}
            max={option.maximum ?? 0}
            step={option.step}
            value={amount}
            disabled={pending}
            onChange={(event) => setAmount(Number(event.target.value))}
          />
          <span>chips</span>
        </label>
      ) : null}
      {option.input === 'cards' ? (
        <div className="payment-selection">
          <p className="small muted">
            Choose cards from your bank or properties. Overpayments aren’t refunded.
          </p>
          <div className="payment-cards">
            {assets
              .filter((card) => option.eligibleCards.includes(card.id))
              .map((card) => (
                <PlayingCard
                  key={card.id}
                  card={card}
                  family="property"
                  compact
                  selected={cards.includes(card.id)}
                  onClick={() =>
                    setCards((previous) =>
                      previous.includes(card.id)
                        ? previous.filter((id) => id !== card.id)
                        : [...previous, card.id],
                    )
                  }
                  disabled={pending}
                />
              ))}
          </div>
        </div>
      ) : null}
      <Button
        variant={lead ? 'primary' : 'secondary'}
        disabled={
          pending ||
          (option.input === 'amount' &&
            (!Number.isFinite(amount) ||
              amount < (option.minimum ?? 0) ||
              amount > (option.maximum ?? 0) ||
              (amount - (option.minimum ?? 0)) % option.step !== 0))
        }
        onClick={() =>
          onAction({
            ...option.value,
            ...(option.input === 'amount' ? { amount } : {}),
            ...(option.input === 'cards' ? { cards } : {}),
          })
        }
      >
        {option.label}
      </Button>
    </div>
  );
}

export function ActionPanel({
  match,
  room,
  selfId,
  onAction,
  pending,
  selected,
  clear,
  cardSelectionRequired = false,
  instruction,
  selectionDetails,
  pinSelection = false,
  dockSize = 'standard',
}: TableProps & {
  selected?: string | null;
  clear?: () => void;
  cardSelectionRequired?: boolean;
  instruction?: string;
  selectionDetails?: ReactNode;
  pinSelection?: boolean;
  dockSize?: 'compact' | 'standard' | 'extended' | 'fit';
}) {
  const own = match.players.find((player) => player.id === selfId);
  const assets = own ? [...own.bank, ...Object.values(own.properties).flat()] : [];
  const choices = match.actions.filter(
    (option) =>
      !option.value.card ||
      option.value.card === selected ||
      (!selected &&
        !cardSelectionRequired &&
        !match.hand.some((card) => card.id === option.value.card)),
  );
  if (match.phase === 'finished' && !match.actions.length) return null;
  const turn = turnState(match, room, selfId);
  const line = pending
    ? 'Saving your move…'
    : room.paused
      ? 'Waiting for players to reconnect.'
      : instruction
        ? instruction
        : selected
          ? 'Choose what to do with this card.'
          : match.actions.some((option) => option.value.card)
            ? 'Select a card to see its moves.'
            : turn.message;
  // The first choice that commits to something is the filled one; the rest stay quiet.
  const lead = choices.find((option) => !QUIET.includes(option.value.type)) ?? choices[0];
  return (
    <DecisionDock
      className={`action-panel${pinSelection && selected ? ' action-panel--pinned' : ''}`}
      label="Your actions"
      size={dockSize}
      pending={pending}
    >
      {/* The notice above the table names the turn: the dock adds one line at most. */}
      <div className="action-context">
        {line && !(choices.length && repeatsNotice(line, turn.message)) ? (
          <span className="small muted">{line}</span>
        ) : null}
        {selectionDetails}
        {clear ? (
          <button
            className="text-button action-clear"
            data-empty={!selected}
            disabled={!selected}
            tabIndex={selected ? 0 : -1}
            onClick={clear}
          >
            Clear selection
          </button>
        ) : null}
      </div>
      {/* Commit buttons stay in view when a long instruction scrolls the dock. */}
      <div className="action-choices" data-decision-actions={choices.length ? '' : undefined}>
        {choices.map((option, i) => (
          <Decision
            key={
              JSON.stringify([option.value, option.minimum, option.maximum, option.eligibleCards]) +
              i
            }
            option={{
              ...option,
              label:
                option.label +
                (option.value.target ? ` · ${playerName(room, option.value.target)}` : ''),
            }}
            lead={option === lead}
            onAction={onAction}
            pending={pending || room.paused}
            assets={assets}
          />
        ))}
        {selected && !choices.length ? (
          <span className="small muted">This card has no available move.</span>
        ) : null}
      </div>
    </DecisionDock>
  );
}
