'use client';
import type { ReactNode } from 'react';
import { Button, DecisionDock } from '@games/ui';
import type { Action, ActionOption, Card } from '@games/api-client';
import type { TableProps } from '../types';
import { turnState } from '../shared/turn-state';
import type { RummyOut } from './rummy-view';

type Analysis = { valid: boolean; deadwood: number };

/** What a saving move does, said while the server confirms it. */
function savingText(action: Action | null, cardOf: (id: string) => Card | undefined) {
  const name = action?.card ? (cardOf(action.card)?.label ?? 'your card') : '';
  switch (action?.type) {
    case 'draw_stock':
      return 'Drawing from the stock…';
    case 'draw_discard':
      return 'Taking the discard…';
    case 'discard':
      return `Discarding ${name}…`;
    case 'declare':
      return `Declaring with ${name}…`;
    case 'fold':
      return 'Dropping out of this deal…';
    default:
      return 'Saving your move…';
  }
}

/**
 * Rummy's own decision dock: the winning Declare comes first when it is
 * available, Discard is never an equal alternative to a win, a card taken
 * from the discard explains why it cannot go back, and dropping asks first.
 * Draw moves stay on their piles.
 */
export function RummyDock({
  match,
  room,
  selfId,
  pending,
  submitted,
  selectedCard,
  preview,
  taken,
  drawn,
  winning,
  selfOut,
  discardTop,
  discardTopIsJoker,
  onSelect,
  onDecide,
  onDrop,
  clear,
}: Pick<TableProps, 'match' | 'room' | 'selfId' | 'pending'> & {
  submitted: Action | null;
  selectedCard?: Card;
  preview?: Analysis;
  taken?: Card;
  drawn?: Card;
  winning: Card[];
  selfOut?: RummyOut;
  discardTop: Card | null;
  discardTopIsJoker: boolean;
  onSelect: (id: string) => void;
  onDecide: (option: ActionOption) => void;
  onDrop: (option: ActionOption) => void;
  clear: () => void;
}) {
  if (match.phase === 'finished' && !match.actions.length) return null;
  const turn = turnState(match, room, selfId);
  const cardOf = (id: string) => match.hand.find((card) => card.id === id);
  const blocked = pending || room.paused;
  const drawing =
    match.phase === 'draw' && match.actions.some((o) => o.value.type === 'draw_stock');
  const discarding = match.actions.some((o) => o.value.type === 'discard');
  const fold = match.actions.find((option) => option.value.type === 'fold');
  const forCard = (type: string) =>
    match.actions.find((o) => o.value.type === type && o.value.card === selectedCard?.id);
  const discard = forCard('discard');
  const declare = forCard('declare');
  const cannotDiscard = Boolean(discarding && selectedCard && selectedCard.id === taken?.id);
  const name = selectedCard?.label ?? '';

  let context: string;
  if (pending) context = savingText(submitted, cardOf);
  else if (room.paused) context = 'Waiting for players to reconnect.';
  else if (selfOut)
    context = `You’re out of this deal (−${selfOut.penalty}, ${
      selfOut.reason === 'false_declaration' ? 'false declaration' : 'dropped'
    }). The others play on.`;
  else if (drawing)
    context =
      discardTop && !discardTopIsJoker
        ? `Draw: tap the stock or the ${discardTop.label} on the discard, above. You can arrange your hand at any time.`
        : `Draw: tap the stock above.${
            discardTop
              ? ` The ${discardTop.label} on the discard is a joker and can’t be taken.`
              : ''
          }`;
  else if (discarding)
    context = !selectedCard
      ? winning.length
        ? `You can declare now. Pick ${winning.length === 1 ? 'the winning discard' : 'a winning discard'} (marked Win), then Declare.`
        : taken
          ? `You took ${taken.label} from the discard. Select a different card to discard.`
          : drawn
            ? `You drew ${drawn.label}. Select a card to discard.`
            : 'Select a card to discard.'
      : cannotDiscard
        ? `You took ${name} from the discard this turn, so it can’t be discarded now. Select a different card.`
        : preview?.valid
          ? `Discarding ${name} leaves a valid hand. Declare to win this deal.`
          : `Discard ${name} to end your turn.`;
  else context = turn.message;

  const note =
    !pending && discarding && selectedCard && !cannotDiscard && declare
      ? preview?.valid
        ? `Discard ${name} instead only if you want to keep playing.`
        : 'Declaring now would be a false declaration: 80 points and you’re out.'
      : null;

  const choices: ReactNode[] = [];
  if (fold)
    choices.push(
      <Button
        key="fold"
        variant="secondary"
        className="rummy-drop"
        disabled={blocked}
        onClick={() => onDrop(fold)}
      >
        {fold.label}…
      </Button>,
    );
  if (discarding && !selectedCard && winning.length)
    choices.push(
      <div className="rummy-win-chips" role="group" aria-label="Winning discards" key="win">
        {winning.map((card) => (
          <Button
            key={card.id}
            size="sm"
            variant="secondary"
            disabled={blocked}
            aria-label={`Select ${card.label} to declare`}
            onClick={() => onSelect(card.id)}
          >
            {card.label}
          </Button>
        ))}
      </div>,
    );
  if (discarding && selectedCard && !cannotDiscard) {
    const ordered = preview?.valid ? [declare, discard] : [discard, declare];
    ordered.forEach((option, index) => {
      if (!option) return;
      choices.push(
        <Button
          key={option.value.type}
          variant={index === 0 ? 'primary' : 'secondary'}
          disabled={blocked}
          onClick={() => onDecide(option)}
        >
          {option.label}
        </Button>,
      );
    });
  }

  return (
    <DecisionDock
      className="action-panel rummy-dock"
      label="Your actions"
      size={discarding ? 'extended' : 'standard'}
      pending={pending}
    >
      <div className="action-context">
        <strong>{turn.label}</strong>
        <span className="small muted">{context}</span>
        {note ? <span className="small rummy-dock-note">{note}</span> : null}
        <button
          className="text-button action-clear"
          data-empty={!selectedCard}
          disabled={!selectedCard}
          tabIndex={selectedCard ? 0 : -1}
          onClick={clear}
        >
          Clear selection
        </button>
      </div>
      <div className="action-choices" data-decision-actions={choices.length ? '' : undefined}>
        {choices}
      </div>
    </DecisionDock>
  );
}
