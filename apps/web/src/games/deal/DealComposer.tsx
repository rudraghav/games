'use client';
import { useState } from 'react';
import { ArrowRight, Landmark, X } from 'lucide-react';
import { Button, PlayingCard } from '@games/ui';
import type { ActionOption, Card, DealDetails } from '@games/api-client';
import type { TableProps } from '../types';
import { playerName } from '../types';
import { ChoiceList, optionRows, type ChoiceRow } from './DealResolution';
import {
  cardPhrase,
  cardProse,
  cardTitle,
  commitLabel,
  describeOption,
  locate,
  optionKey,
  rentQuote,
  type DealContext,
} from './decisions';
import { debtNames } from './table-status';

export { optionKey };

interface Props extends TableProps {
  card: Card;
  options: ActionOption[];
  details: DealDetails;
  candidate: ActionOption | null;
  onCandidate: (option: ActionOption) => void;
  onResetMove: () => void;
  target?: string;
  onTargetChange?: (target: string) => void;
  onClear: () => void;
}

/** Why this card is selected and what choosing it will do, in one line. */
function intro(card: Card, play: ActionOption[], ctx: DealContext, banking: boolean) {
  const type = play[0]?.value.type;
  if (banking)
    return `Bank it for ${card.value}. Banked actions become money and cannot be played later.`;
  if (type === 'settle_debt')
    return `You owe ${debtNames(ctx.room, ctx.details.debts[ctx.selfId] || [], ctx.selfId)}. Give them this card from your hand; it uses one of your plays and they play or bank it at once.`;
  if (type === 'property') return 'Choose the pile it goes in.';
  if (type === 'rearrange') return 'Moving a property between your piles is free: it uses no play.';
  if (type === 'discard') return 'Discard it to get down to 7 cards.';
  if (ctx.details.rentMultiplier > 1 && ['rent', 'rent_double'].includes(card.effect))
    return `Double the Rent is armed: this rent is charged ×${ctx.details.rentMultiplier}.`;
  if (!play.length) return 'This card can only be banked now.';
  return 'Choose how to use this card.';
}

export function DealComposer(props: Props) {
  const { card, options, candidate, details, match, room, selfId } = props;
  const ctx: DealContext = { match, room, details, selfId };
  const [localTarget, setLocalTarget] = useState('');
  const target = props.target ?? localTarget;
  const play = options.filter((option) => option.value.type !== 'bank');
  const bank = options.find((option) => option.value.type === 'bank');
  const targets = [...new Set(play.map((option) => option.value.target).filter(Boolean))];
  const needsTarget = targets.length > 1;
  const choices = needsTarget ? play.filter((option) => option.value.target === target) : play;
  const banking = candidate?.value.type === 'bank';
  const blocked = props.pending || room.paused;
  const forced = card.effect === 'forced';
  const [take, setTake] = useState<string | null>(
    forced && candidate ? candidate.value.choice || null : null,
  );
  const pick = (key: string) => {
    const option = choices.find((item) => optionKey(item) === key);
    if (option) props.onCandidate(option);
  };
  const chooseTarget = (id: string) => {
    setLocalTarget(id);
    props.onTargetChange?.(id);
    setTake(null);
    // A player with exactly one possible move needs no second pick.
    const only = play.filter((option) => option.value.target === id);
    if (only.length === 1) props.onCandidate(only[0]);
    else props.onResetMove();
  };

  const targetRows: ChoiceRow[] = targets.map((id) => {
    const own = play.filter((option) => option.value.target === id);
    return {
      key: id,
      title: playerName(room, id),
      detail:
        own.length === 1
          ? describeOption(own[0], ctx).detail
          : `${own.length} possible ${forced ? 'swaps' : card.effect === 'sly' ? 'properties' : 'choices'}`,
      colors: [],
    };
  });

  // Forced Deal: first the card you take, then the card you give.
  const takeIds = [...new Set(choices.map((option) => option.value.choice).filter(Boolean))];
  const takeRows: ChoiceRow[] = takeIds.map((id) => {
    const place = locate(match, selfId, id);
    return {
      key: id,
      title: place ? cardTitle(place.card, details) : 'Property',
      detail: cardPhrase(ctx, id, { title: false, owner: false }),
      colors: place?.card.suit === 'property' ? [place.card.color] : [],
    };
  });
  const gives = choices.filter((option) => option.value.choice === take);
  const giveRows: ChoiceRow[] = gives.map((option) => {
    const id = option.value.cards?.[0];
    const place = locate(match, selfId, id);
    return {
      key: optionKey(option),
      title: place ? cardTitle(place.card, details) : 'Property',
      detail: id ? cardPhrase(ctx, id, { title: false, owner: false }) : '',
      colors: place?.card.suit === 'property' ? [place.card.color] : [],
    };
  });

  const rentLike = ['rent', 'rent_double'].includes(card.effect);
  const ordered = rentLike
    ? [...choices].sort(
        (a, b) =>
          rentQuote(ctx, card, b.value.color).amount - rentQuote(ctx, card, a.value.color).amount,
      )
    : choices;
  const rows = optionRows(ordered, ctx);
  const showRows =
    !banking && !forced && (rows.length > 1 || (rows.length === 1 && candidate !== choices[0]));
  const selectedKey = candidate ? optionKey(candidate) : null;
  const steal =
    candidate?.value.type === 'play' &&
    candidate.value.choice &&
    ['sly', 'forced'].includes(card.effect);
  const summary =
    candidate && !banking
      ? steal
        ? {
            title: 'You take',
            detail: `${cardProse(ctx, candidate.value.choice)}${
              candidate.value.cards?.[0]
                ? ` and give ${cardProse(ctx, candidate.value.cards[0])}`
                : ''
            }`,
          }
        : describeOption(candidate, ctx)
      : null;

  return (
    <section className="deal-composer" aria-label="Selected card" aria-busy={props.pending}>
      <div className="deal-selected-preview">
        <PlayingCard card={card} family="property" compact />
        <div>
          <h3>{card.label}</h3>
          <p>{intro(card, play, ctx, banking)}</p>
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
        {!banking && needsTarget ? (
          <fieldset className="deal-choice-step">
            <legend>1. Choose a player</legend>
            <ChoiceList
              label="Choose a player"
              rows={targetRows}
              selected={target || null}
              disabled={blocked}
              onChoose={chooseTarget}
            />
          </fieldset>
        ) : null}
        {!banking && forced && choices.length ? (
          <>
            <fieldset className="deal-choice-step">
              <legend>{needsTarget ? '2. ' : '1. '}Property you take</legend>
              <ChoiceList
                label="Property you take"
                rows={takeRows}
                selected={take}
                disabled={blocked}
                onChoose={(id) => {
                  setTake(id);
                  const only = choices.filter((option) => option.value.choice === id);
                  if (only.length === 1) props.onCandidate(only[0]);
                  else props.onResetMove();
                }}
              />
            </fieldset>
            {take ? (
              <fieldset className="deal-choice-step">
                <legend>{needsTarget ? '3. ' : '2. '}Property you give</legend>
                <ChoiceList
                  label="Property you give"
                  rows={giveRows}
                  selected={selectedKey}
                  disabled={blocked}
                  onChoose={pick}
                />
              </fieldset>
            ) : null}
          </>
        ) : null}
        {showRows && (!needsTarget || target) ? (
          <fieldset className="deal-choice-step">
            <legend>
              {needsTarget ? '2. ' : ''}
              {['property', 'rearrange'].includes(play[0]?.value.type)
                ? 'Destination'
                : rentLike
                  ? 'Set to charge rent on'
                  : 'Choose a move'}
            </legend>
            <ChoiceList
              label="Card move"
              rows={rows}
              selected={selectedKey}
              disabled={blocked || !choices.length}
              onChoose={pick}
            />
          </fieldset>
        ) : null}
        {banking ? (
          <p className="deal-move-summary">Add {card.value} to your bank</p>
        ) : summary ? (
          <p className="deal-move-summary" aria-label="Move preview">
            <strong>{summary.title}</strong>
            {summary.detail ? `${steal ? ' ' : ' · '}${summary.detail}` : ''}
          </p>
        ) : !options.length ? (
          <p className="small muted">This card has no available move.</p>
        ) : null}
        <div className="deal-commit-actions" data-decision-actions>
          {play.length && !banking ? (
            <Button
              disabled={blocked || !candidate}
              onClick={() => candidate && props.onAction(candidate.value)}
            >
              {candidate
                ? commitLabel(candidate, ctx)
                : needsTarget && !target
                  ? 'Choose a player first'
                  : forced && !take
                    ? 'Choose a property to take'
                    : ['property', 'rearrange'].includes(play[0].value.type)
                      ? 'Choose a destination'
                      : `Play ${card.label}`}
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
