'use client';
import { Info, ShieldCheck } from 'lucide-react';
import { Button } from '@games/ui';
import type { Action, ActionOption } from '@games/api-client';
import {
  cardPhrase,
  optionKey,
  commitLabel,
  describeOption,
  describePending,
  locate,
  setImpact,
  type DealContext,
} from './decisions';
import { paymentSelection, suggestBankPayment } from './presentation';

export interface ChoiceRow {
  key: string;
  title: string;
  detail: string;
  colors: string[];
}

/** One choice per row, named in full, so look-alike cards are never ambiguous. */
export function ChoiceList(props: {
  label: string;
  rows: ChoiceRow[];
  selected: string | null;
  disabled?: boolean;
  onChoose: (key: string) => void;
}) {
  return (
    <div className="deal-choice-list" role="radiogroup" aria-label={props.label}>
      {props.rows.map((row) => (
        <button
          type="button"
          role="radio"
          key={row.key}
          className="deal-choice"
          aria-checked={row.key === props.selected}
          disabled={props.disabled}
          onClick={() => props.onChoose(row.key)}
        >
          <span className="deal-choice-swatch" aria-hidden="true">
            {row.colors.map((color) => (
              <i key={color} data-property-color={color} />
            ))}
          </span>
          <span className="deal-choice-copy">
            <strong>{row.title}</strong>
            {row.detail ? <span>{row.detail}</span> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

export const optionRows = (options: ActionOption[], ctx: DealContext): ChoiceRow[] =>
  options.map((option) => ({ key: optionKey(option), ...describeOption(option, ctx) }));

interface Props {
  ctx: DealContext;
  /** The table is saving a move or paused: no commit. */
  blocked: boolean;
  onCommit: (action: Action) => void;
  onInspect: (id: string) => void;
  paid: string[];
  onPaid: (cards: string[]) => void;
  /** The current stage choice (choose, keep or give), shared with the table. */
  stageChoice: string | null;
  onStageChoice: (key: string | null) => void;
}

/** The pending effect for every seat: responder controls, or what others wait for. */
export function DealResolution({
  ctx,
  blocked,
  onCommit,
  onInspect,
  paid,
  onPaid,
  ...props
}: Props) {
  const { match, details, selfId } = ctx;
  const effect = details.pendingAction;
  const text = describePending(ctx);
  if (!effect || !text) return null;
  const pay = match.actions.find((option) => option.value.type === 'pay');
  const counter = match.actions.filter((option) => ['accept', 'no'].includes(option.value.type));
  const stage = match.actions.filter((option) =>
    ['choose', 'keep', 'give'].includes(option.value.type),
  );
  const responding = match.actions.length > 0;
  const accept = counter.find((option) => option.value.type === 'accept');
  const no = counter.find((option) => option.value.type === 'no');
  const noCount = match.hand.filter((card) => card.effect === 'no').length;
  const cards = [...new Set(effect.transfers.flatMap((transfer) => transfer.cards))];
  const heading = pay
    ? `You owe ${details.paymentAmount}M`
    : effect.stage === 'select'
      ? responding
        ? 'Choose the card to take'
        : 'Choosing a card'
      : effect.stage === 'distribution'
        ? responding
          ? 'Keep one, hand out the rest'
          : 'Handing out cards'
        : effect.blocked
          ? 'Action blocked'
          : responding
            ? 'Your response'
            : 'Pending action';

  // Payment: the bill, what leaves the table, and what each property costs in sets.
  const quote = paymentSelection(details.paymentBundles, paid);
  const allPayable = pay ? paymentSelection(details.paymentBundles, pay.eligibleCards) : null;
  const insolvent = Boolean(allPayable && allPayable.amount < details.paymentAmount);
  const paymentValid =
    pay &&
    quote.valid &&
    details.paymentBundles.length > 0 &&
    (quote.amount >= details.paymentAmount ||
      pay.eligibleCards.every((id) => quote.ids.includes(id)));
  const impacts = [
    ...new Set(
      quote.ids
        .map((id) => locate(match, selfId, id))
        .filter((place) => place?.zone === 'set' && place.setKey)
        .map((place) => place!.setKey!),
    ),
  ].map((key) => setImpact(ctx, selfId, key, quote.ids));

  const stageRows = optionRows(stage, ctx);
  const chosenStage = stage.find((option) => optionKey(option) === props.stageChoice) || null;

  return (
    <section className="deal-resolution" aria-label="Pending action" aria-live="polite">
      <div>
        <ShieldCheck size={20} aria-hidden="true" />
        <h3>{heading}</h3>
      </div>
      <p className="deal-resolution-headline">{text.headline}</p>
      {text.facts.length ? (
        <ul className="deal-resolution-facts">
          {text.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
      ) : null}
      {cards.length ? (
        <ul className="deal-transfer-list" aria-label="Cards that would move">
          {cards.map((id) => {
            const place = locate(match, selfId, id);
            if (!place) return null;
            return (
              <li key={id}>
                <span className="deal-choice-swatch" aria-hidden="true">
                  {(place.card.suit === 'property' ? [place.card.color] : []).map((color) => (
                    <i key={color} data-property-color={color} />
                  ))}
                </span>
                <span>{cardPhrase(ctx, id)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Card info: ${place.card.label}`}
                  onClick={() => onInspect(id)}
                >
                  <Info size={15} />
                </Button>
              </li>
            );
          })}
        </ul>
      ) : null}

      {pay ? (
        <>
          <p>
            Pay {ctx.room.members.find((member) => member.id === effect.actor)?.name || 'them'} from
            your bank or properties on the table. No change is given.
          </p>
          {insolvent ? (
            <p className="deal-resolution-warning" role="status">
              You can’t cover {details.paymentAmount}M. Give everything you have (
              {allPayable!.amount}M) to settle the bill
              {ctx.match.id === 'deal-no-mercy' ? '; the shortfall becomes a debt chip' : ''}.
            </p>
          ) : null}
          <div className="deal-payment-total">
            <strong>{quote.amount}M selected</strong>
            <span>
              {quote.amount > details.paymentAmount
                ? `${quote.amount - details.paymentAmount}M overpayment`
                : `${Math.max(0, details.paymentAmount - quote.amount)}M remaining`}
            </span>
          </div>
          {quote.ids.length ? (
            <div aria-label="Payment transfer preview">
              <p className="small">{quote.amount}M will leave your table:</p>
              <ul className="deal-transfer-list">
                {quote.ids.map((id) => (
                  <li key={id}>
                    <span>
                      {cardPhrase(ctx, id)}
                      {quote.carried.includes(id) ? ' · goes with its property' : ''}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Card info"
                      onClick={() => onInspect(id)}
                    >
                      <Info size={15} />
                    </Button>
                  </li>
                ))}
              </ul>
              {impacts.map((impact) => (
                <p key={impact.text} className={impact.lost ? 'deal-resolution-warning' : 'small'}>
                  {impact.text}
                </p>
              ))}
            </div>
          ) : (
            <p className="small">Tap bank notes or properties on your table to pay with them.</p>
          )}
          <div className="deal-resolution-actions" data-decision-actions>
            {paid.length ? (
              <Button variant="ghost" disabled={blocked} onClick={() => onPaid([])}>
                Clear payment
              </Button>
            ) : null}
            {insolvent ? (
              <Button
                variant="secondary"
                disabled={blocked}
                onClick={() => onPaid([...pay.eligibleCards])}
              >
                Select everything
              </Button>
            ) : (
              <Button
                variant="secondary"
                disabled={blocked}
                onClick={() =>
                  onPaid(
                    suggestBankPayment(
                      match.players.find((player) => player.id === selfId)?.bank || [],
                      pay.eligibleCards,
                      details.paymentAmount,
                    ),
                  )
                }
              >
                Select bank money
              </Button>
            )}
            <Button
              disabled={blocked || !paymentValid}
              onClick={() => onCommit({ ...pay.value, cards: paid })}
            >
              Pay {quote.amount}M
            </Button>
          </div>
        </>
      ) : counter.length ? (
        <div className="deal-resolution-answers" data-decision-actions>
          {accept ? (
            <div>
              <Button disabled={blocked} onClick={() => onCommit(accept.value)}>
                {text.acceptLabel}
              </Button>
              <p className="small">{text.accept}</p>
            </div>
          ) : null}
          {no ? (
            <div>
              <Button variant="secondary" disabled={blocked} onClick={() => onCommit(no.value)}>
                Just Say No
              </Button>
              <p className="small">
                {text.no} Uses 1 of your {noCount} Just Say No card{noCount === 1 ? '' : 's'}.
              </p>
            </div>
          ) : null}
        </div>
      ) : stage.length ? (
        <>
          <ChoiceList
            label={heading}
            rows={stageRows}
            selected={props.stageChoice}
            disabled={blocked}
            onChoose={props.onStageChoice}
          />
          <div className="deal-resolution-actions" data-decision-actions>
            <Button
              disabled={blocked || !chosenStage}
              onClick={() => chosenStage && onCommit(chosenStage.value)}
            >
              {chosenStage ? commitLabel(chosenStage, ctx) : 'Choose a card above'}
            </Button>
          </div>
        </>
      ) : (
        <p className="small muted">{text.waiting}</p>
      )}
    </section>
  );
}
