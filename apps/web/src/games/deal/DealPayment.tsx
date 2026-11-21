'use client';

import { Info } from 'lucide-react';
import { Button } from '@games/ui';
import type { Action, ActionOption } from '@games/api-client';
import {
  cardPhrase,
  cardTitle,
  debtChipOutcome,
  name,
  setImpact,
  type DealContext,
} from './decisions';
import { bankTopUp, paymentSelection } from './presentation';

interface Props {
  ctx: DealContext;
  pay: ActionOption;
  paid: string[];
  blocked: boolean;
  onPaid: (ids: string[]) => void;
  onInspect: (id: string) => void;
  onCommit: (action: Action) => void;
}

export function DealPayment({ ctx, pay, paid, blocked, onPaid, onInspect, onCommit }: Props) {
  const { details, selfId } = ctx;
  const actor = details.pendingAction!.actor;
  const own = ctx.match.players.find((player) => player.id === selfId)!;
  const due = details.paymentAmount;
  const quote = paymentSelection(details.paymentBundles, paid);
  const available = paymentSelection(details.paymentBundles, pay.eligibleCards);
  const insolvent = available.amount < due;
  const complete =
    quote.valid &&
    quote.ids.length > 0 &&
    (quote.amount >= due || pay.eligibleCards.every((id) => quote.ids.includes(id)));
  const bankSuggestion = bankTopUp(own.bank, pay.eligibleCards, paid, due - quote.amount);
  const suggested = insolvent ? pay.eligibleCards : [...paid, ...bankSuggestion];
  const isSuggested =
    paid.length === suggested.length && suggested.every((id) => paid.includes(id));
  const over = quote.amount - due;
  const debt = debtChipOutcome(ctx, selfId, actor);
  const impacts = Object.entries(own.properties)
    .filter(([, cards]) => cards.some((card) => quote.ids.includes(card.id)))
    .map(([key]) => setImpact(ctx, selfId, key, quote.ids));
  const brokenSets = impacts.filter((impact) => impact.lost).length;
  return (
    <section className="deal-resolution deal-payment-editor" aria-label="Pending action">
      <div className="deal-payment-scroll">
        <p>Pay {name(ctx, actor)} from your bank or properties. No change is given.</p>
        {insolvent ? (
          <p className="deal-resolution-warning" role="status">
            You can’t cover {due}M. Give everything you have ({available.amount}M) to settle the
            bill. {debt}
          </p>
        ) : null}
        <div className="deal-payment-shortcuts">
          {insolvent || bankSuggestion.length ? (
            <Button
              size="sm"
              variant="secondary"
              disabled={blocked || isSuggested}
              onClick={() => onPaid(suggested)}
            >
              {insolvent
                ? 'Select everything'
                : paid.length
                  ? 'Add bank money'
                  : 'Select bank money'}
            </Button>
          ) : null}
          {paid.length ? (
            <Button size="sm" variant="ghost" disabled={blocked} onClick={() => onPaid([])}>
              Clear payment
            </Button>
          ) : null}
        </div>
        <div className="deal-payment-assets" role="group" aria-label="Assets to pay with">
          {pay.eligibleCards.map((id) => {
            const bundle = details.paymentBundles.find((item) => item.card === id);
            const carried = quote.carried.includes(id);
            const description = cardPhrase(ctx, id);
            const extras = bundle?.transfers.filter((item) => item.id !== id) ?? [];
            const attachments = extras.map((extra) => {
              const building = Object.values(own.properties)
                .flat()
                .find((c) => c.id === extra.id);
              return building ? cardTitle(building, details) : 'building';
            });
            return (
              <div key={id} className="deal-payment-row">
                <label>
                  <input
                    type="checkbox"
                    checked={paid.includes(id) || carried}
                    disabled={blocked || carried}
                    onChange={() =>
                      onPaid(paid.includes(id) ? paid.filter((item) => item !== id) : [...paid, id])
                    }
                  />
                  <span>
                    {description}
                    {carried ? (
                      <small>Goes with its property</small>
                    ) : attachments.length ? (
                      <small>
                        Includes {attachments.join(' + ')} ·{' '}
                        {bundle!.transfers.reduce((sum, item) => sum + item.value, 0)}M total
                      </small>
                    ) : null}
                  </span>
                </label>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={'Card info: ' + description}
                  onClick={() => onInspect(id)}
                >
                  <Info size={15} />
                </Button>
              </div>
            );
          })}
        </div>
        {impacts.map((impact) => (
          <p key={impact.text} className={impact.lost ? 'deal-resolution-warning' : 'small'}>
            {impact.text}
          </p>
        ))}
      </div>
      <div className="deal-resolution-actions" data-decision-actions>
        {brokenSets > 0 ? (
          <strong className="deal-resolution-warning">
            Breaks {brokenSets} complete {brokenSets === 1 ? 'set' : 'sets'}
          </strong>
        ) : null}
        <div className="deal-payment-total" aria-live="polite" aria-atomic="true">
          <strong>{quote.amount}M selected</strong>
          <span>
            {over > 0
              ? `${over}M overpayment`
              : over === 0
                ? 'Exact payment'
                : complete
                  ? `${-over}M shortfall`
                  : `${-over}M remaining`}
          </span>
        </div>
        <Button
          disabled={blocked || !complete}
          onClick={() => onCommit({ ...pay.value, cards: paid })}
        >
          Pay {quote.amount}M
        </Button>
      </div>
    </section>
  );
}
