'use client';
import { useLayoutEffect, useRef, useState } from 'react';
import { Landmark, X } from 'lucide-react';
import { Button, PlayingCard } from '@games/ui';
import type { ActionOption, Card, DealDetails } from '@games/api-client';
import type { TableProps } from '../types';
import { playerName } from '../types';
import { ChoiceList, type ChoiceRow } from './DealResolution';
import {
  cardPhrase,
  cardTitle,
  describeDirectOption,
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
  /** Partial swaps remain separate from a complete, committable action. */
  takeId?: string | null;
  onTakeChange?: (id: string | null) => void;
  onClear: () => void;
}

/** Why this card is selected and what choosing it will do, in one line. */
function intro(card: Card, play: ActionOption[], ctx: DealContext) {
  const type = play[0]?.value.type;
  if (type === 'settle_debt')
    return `You owe ${debtNames(ctx.room, ctx.details.debts[ctx.selfId] || [], ctx.selfId)}. Give them this card from your hand; it uses one of your plays and they play or bank it at once.`;
  if (type === 'property') return 'Choose a destination below to place this property.';
  if (type === 'rearrange') return 'Moving a property between your piles is free: it uses no play.';
  if (type === 'discard') return 'Discard it to get down to 7 cards.';
  if (ctx.details.rentMultiplier > 1 && ['rent', 'rent_double'].includes(card.effect))
    return `Double the Rent is armed: this rent is charged ×${ctx.details.rentMultiplier}.`;
  if (!play.length) return 'This card can only be banked now.';
  if (card.effect === 'forced' && play.length > 1)
    return 'Choose the property to take, then choose a swap.';
  return 'Choose an action below to play this card.';
}

export function DealComposer(props: Props) {
  const { card, options, candidate, details, match, room, selfId } = props;
  const ctx: DealContext = { match, room, details, selfId };
  const play = options.filter((option) => option.value.type !== 'bank');
  const bank = options.find((option) => option.value.type === 'bank');
  const blocked = props.pending || room.paused;
  const form = useRef<HTMLDivElement>(null);
  const focusStep = useRef<'take' | 'swap' | null>(null);
  const forced = card.effect === 'forced' && play[0]?.value.type === 'play' && play.length > 1;
  const takeIds = [...new Set(play.map((option) => option.value.choice).filter(Boolean))];
  const [localTake, setTake] = useState<string | null>(
    forced && candidate ? candidate.value.choice || null : null,
  );
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const chosenTake = props.takeId !== undefined ? props.takeId : localTake;
  const take = takeIds.includes(chosenTake || '')
    ? chosenTake
    : takeIds.length === 1
      ? takeIds[0]
      : null;
  useLayoutEffect(() => {
    if (!focusStep.current) return;
    const selector =
      focusStep.current === 'swap' ? '[data-swap-options] .deal-choice' : '[role="radio"]';
    form.current?.querySelector<HTMLButtonElement>(selector)?.focus();
    focusStep.current = null;
  }, [take]);
  const takeRows: ChoiceRow[] = takeIds.map((id) => {
    const place = locate(match, selfId, id);
    return {
      key: id,
      title: place
        ? `Take ${cardTitle(place.card, details)} from ${playerName(room, place.owner)}`
        : 'Choose a property to take',
      detail: cardPhrase(ctx, id, { title: false, owner: false }),
      colors: place?.card.suit === 'property' ? [place.card.color] : [],
    };
  });
  const giveOptions = play.filter((option) => option.value.choice === take);
  const rentLike = ['rent', 'rent_double'].includes(card.effect);
  const ordered = rentLike
    ? [...play].sort(
        (a, b) =>
          rentQuote(ctx, card, b.value.color).amount - rentQuote(ctx, card, a.value.color).amount,
      )
    : play;
  const directOptions = forced ? giveOptions : ordered;
  const rows: ChoiceRow[] = directOptions.map((option) => ({
    key: optionKey(option),
    ...describeDirectOption(option, ctx),
  }));
  const commitChoice = (key: string) => {
    const option = directOptions.find((item) => optionKey(item) === key);
    if (!blocked && option) props.onAction(option.value);
  };
  const choosingTake = forced && takeIds.length > 1 && !take;
  const step = choosingTake ? 'take' : forced ? `swap:${take}` : 'moves';
  const expanded = expandedStep === step;
  const totalChoices = choosingTake ? takeRows.length : rows.length;
  const expansionControl =
    totalChoices > 3 ? (
      <Button
        className="deal-expand-choices"
        variant="ghost"
        size="sm"
        aria-expanded={expanded}
        onClick={() => setExpandedStep(expanded ? null : step)}
      >
        {expanded ? 'Fewer' : `All ${totalChoices}`} {choosingTake ? 'properties' : 'moves'}
      </Button>
    ) : null;
  const essentialIntro =
    !options.length ||
    ['settle_debt', 'rearrange'].includes(play[0]?.value.type) ||
    (details.rentMultiplier > 1 && rentLike) ||
    (forced && !take);

  return (
    <section
      className="deal-composer"
      aria-label="Selected card"
      aria-busy={props.pending}
      data-compact={!expanded}
    >
      <div className="deal-composer-main">
        {expanded || essentialIntro ? (
          <div className="deal-selected-preview">
            <PlayingCard card={card} family="property" compact />
            <div>
              <h3>{card.label}</h3>
              <p>
                {options.length
                  ? intro(card, play, ctx)
                  : 'This card has no available move right now.'}
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
        ) : null}
        <div className="deal-move-form" ref={form}>
          {choosingTake ? (
            <fieldset className="deal-choice-step">
              <legend>Property you take</legend>
              {expansionControl}
              <ChoiceList
                label="Property you take"
                rows={expanded ? takeRows : takeRows.slice(0, 3)}
                selected={take}
                disabled={blocked}
                onChoose={(id) => {
                  if (blocked) return;
                  focusStep.current = 'swap';
                  setExpandedStep(null);
                  setTake(id);
                  props.onTakeChange?.(id);
                  const moves = play.filter((option) => option.value.choice === id);
                  props.onTargetChange?.(moves[0]?.value.target || '');
                  props.onResetMove();
                }}
              />
            </fieldset>
          ) : null}
          {forced && take ? (
            <div className="deal-take-summary" role="group" aria-label="Selected property to take">
              <p className="deal-move-summary">
                <strong>{takeRows.find((row) => row.key === take)?.title}</strong>
              </p>
              {takeIds.length > 1 ? (
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={blocked}
                  onClick={() => {
                    if (blocked) return;
                    focusStep.current = 'take';
                    setExpandedStep(null);
                    setTake(null);
                    props.onTakeChange?.(null);
                    props.onTargetChange?.('');
                    props.onResetMove();
                  }}
                >
                  Change property
                </Button>
              ) : null}
            </div>
          ) : null}
          {rows.length ? (
            <fieldset className="deal-choice-step" data-swap-options={forced || undefined}>
              <legend className={!expanded && !forced ? 'sr-only' : undefined}>
                {forced
                  ? 'Choose a swap'
                  : ['property', 'rearrange'].includes(play[0]?.value.type)
                    ? 'Place this property'
                    : 'Play this card'}
              </legend>
              {expansionControl}
              <ChoiceList
                label={forced ? 'Complete swap' : 'Card moves'}
                mode="action"
                rows={expanded ? rows : rows.slice(0, 3)}
                selected={null}
                disabled={blocked}
                onChoose={commitChoice}
              />
            </fieldset>
          ) : null}
        </div>
      </div>
      {bank ? (
        <div className="deal-commit-actions" data-decision-actions>
          {card.subtitle !== 'MONEY' ? (
            <p className="small muted deal-bank-warning">
              Banking makes this money; you lose its action.
            </p>
          ) : null}
          <Button
            variant="secondary"
            disabled={blocked}
            onClick={() => {
              if (!blocked) props.onAction(bank.value);
            }}
          >
            <Landmark size={15} />
            Bank for {card.value}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
