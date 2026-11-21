'use client';
import { ArrowRight, Info, ShieldCheck } from 'lucide-react';
import { Button } from '@games/ui';
import type { Action, ActionOption } from '@games/api-client';
import {
  cardPhrase,
  optionKey,
  describeDirectOption,
  describeOption,
  describePending,
  locate,
  type DealContext,
} from './decisions';
import { DealPayment } from './DealPayment';

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
  /** Action rows commit an already complete move; selection rows only choose. */
  mode?: 'select' | 'action';
  disabled?: boolean;
  onChoose: (key: string) => void;
}) {
  return (
    <div
      className="deal-choice-list"
      role={props.mode === 'action' ? 'group' : 'radiogroup'}
      data-mode={props.mode || 'select'}
      aria-label={props.label}
    >
      {props.rows.map((row) => (
        <button
          type="button"
          role={props.mode === 'action' ? undefined : 'radio'}
          key={row.key}
          className="deal-choice"
          aria-checked={props.mode === 'action' ? undefined : row.key === props.selected}
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
          {props.mode === 'action' ? (
            <ArrowRight className="deal-choice-arrow" size={16} aria-hidden="true" />
          ) : null}
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
  /** Accepted for existing callers; complete staged moves now commit directly. */
  stageChoice: string | null;
  onStageChoice: (key: string | null) => void;
}

/** The pending effect for every seat: responder controls, or what others wait for. */
export function DealResolution({ ctx, blocked, onCommit, onInspect, paid, onPaid }: Props) {
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
  if (pay) {
    return (
      <DealPayment
        ctx={ctx}
        pay={pay}
        blocked={blocked}
        paid={paid}
        onPaid={onPaid}
        onCommit={onCommit}
        onInspect={onInspect}
      />
    );
  }
  const heading =
    effect.stage === 'select'
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

  const stageRows = stage.map((option) => ({
    key: optionKey(option),
    ...describeDirectOption(option, ctx),
  }));

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

      {counter.length ? (
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
        <ChoiceList
          label={heading}
          mode="action"
          rows={stageRows}
          selected={null}
          disabled={blocked}
          onChoose={(key) => {
            const option = stage.find((item) => optionKey(item) === key);
            if (!blocked && option) onCommit(option.value);
          }}
        />
      ) : (
        <p className="small muted">{text.waiting}</p>
      )}
    </section>
  );
}
