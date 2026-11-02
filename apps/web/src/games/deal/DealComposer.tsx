'use client';
import { useState } from 'react';
import { ArrowRight, Landmark, X } from 'lucide-react';
import { Button, PlayingCard } from '@games/ui';
import type { ActionOption, Card, DealDetails } from '@games/api-client';
import type { TableProps } from '../types';
import { playerName } from '../types';
import { actionLabel } from './presentation';

export const optionKey = (option: ActionOption) => JSON.stringify(option.value);
const moveLabels: Record<string, string> = {
  property: 'Place property',
  rearrange: 'Move property',
  bank: 'Bank card',
  discard: 'Discard card',
  settle_debt: 'Give card',
  choose: 'Take card',
  keep: 'Keep card',
  give: 'Give card',
  no: 'Just say no',
};
interface Props extends TableProps {
  card: Card;
  options: ActionOption[];
  details: DealDetails;
  candidate: ActionOption | null;
  onCandidate: (option: ActionOption) => void;
  onResetMove: () => void;
  onClear: () => void;
}
export function DealComposer(props: Props) {
  const { card, options, candidate, details, match, room } = props;
  const [target, setTarget] = useState('');
  const play = options.filter((option) => option.value.type !== 'bank');
  const bank = options.find((option) => option.value.type === 'bank');
  const targets = [...new Set(play.map((option) => option.value.target).filter(Boolean))];
  const choices =
    targets.length > 1 ? play.filter((option) => option.value.target === target) : play;
  const banking = candidate?.value.type === 'bank';
  const blocked = props.pending || room.paused;
  return (
    <section className="deal-composer" aria-label="Selected card" aria-busy={props.pending}>
      <div className="deal-selected-preview">
        <PlayingCard card={card} family="property" />
        <div>
          <h3>{card.label}</h3>
          <p>
            {banking
              ? `Bank it for ${card.value}. Banked actions become money and cannot be played later.`
              : card.suit === 'property'
                ? 'Choose a highlighted set or a destination below.'
                : 'Choose how to use this card.'}
          </p>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Clear card selection"
          onClick={props.onClear}
        >
          <X size={18} />
        </button>
      </div>
      <div className="deal-move-form">
        {!banking && targets.length > 1 ? (
          <label>
            Player
            <select
              className="input"
              value={target}
              disabled={blocked}
              onChange={(event) => {
                setTarget(event.target.value);
                props.onResetMove();
              }}
            >
              <option value="">Choose a player</option>
              {targets.map((id) => (
                <option key={id} value={id}>
                  {playerName(room, id)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {!banking && (play.length > 1 || (play.length === 1 && candidate !== play[0])) ? (
          <label>
            {['property', 'rearrange'].includes(play[0]?.value.type) ? 'Destination' : 'Move'}
            <select
              className="input"
              aria-label="Card move"
              value={candidate && choices.includes(candidate) ? optionKey(candidate) : ''}
              disabled={blocked || !choices.length}
              onChange={(event) => {
                const option = choices.find((item) => optionKey(item) === event.target.value);
                if (option) props.onCandidate(option);
              }}
            >
              <option value="">{choices.length ? 'Choose a move' : 'Choose a player first'}</option>
              {choices.map((option) => (
                <option key={optionKey(option)} value={optionKey(option)}>
                  {actionLabel(option, match, room, details.propertyGroups)}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        {candidate ? (
          <p className="deal-move-summary">
            {banking
              ? `Add ${card.value} to your bank`
              : actionLabel(candidate, match, room, details.propertyGroups)}
          </p>
        ) : !options.length ? (
          <p className="small muted">This card has no available move.</p>
        ) : null}
        <div className="deal-commit-actions">
          {play.length && !banking ? (
            <Button
              disabled={blocked || !candidate || banking}
              onClick={() => candidate && props.onAction(candidate.value)}
            >
              {moveLabels[candidate?.value.type || play[0].value.type] || `Play ${card.label}`}
              <ArrowRight size={15} />
            </Button>
          ) : null}
          {bank ? (
            banking ? (
              <>
                <Button disabled={blocked} onClick={() => props.onAction(bank.value)}>
                  Confirm · bank {card.value}
                </Button>
                <Button variant="secondary" disabled={blocked} onClick={props.onResetMove}>
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                disabled={blocked}
                onClick={() => props.onCandidate(bank)}
              >
                <Landmark size={15} />
                Bank for {card.value}
              </Button>
            )
          ) : null}
        </div>
      </div>
    </section>
  );
}
