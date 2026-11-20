'use client';
import { useId } from 'react';
import { Button, DecisionDock } from '@games/ui';
import type { ActionOption } from '@games/api-client';
import type { TableProps } from '../types';
import { turnState } from '../shared/turn-state';
import { useTableDraft } from '../shared/table-draft';
import {
  casinoInstruction,
  choiceView,
  wagerImpact,
  wagerProblem,
  wagerView,
} from './casino-guidance';

/**
 * The casino decision dock. It grows with its choices, so Raise, All in, Split
 * and Sideshow never sit below an inner scroll; every wager shows its legal
 * range, says why an amount can't be sent, and names the amount on its button.
 */
export function CasinoDock({ match, room, selfId, onAction, pending }: TableProps) {
  if (match.phase === 'finished' && !match.actions.length) return null;
  const turn = turnState(match, room, selfId);
  const instruction = casinoInstruction(match, room, selfId);
  const locked = pending || room.paused;
  // Saving or a pause is a separate line: the decision's explanation stays readable.
  const status = pending
    ? 'Saving your move…'
    : room.paused
      ? 'Waiting for players to reconnect.'
      : null;
  const choices = match.actions.map((choice) => ({
    choice,
    view: choiceView(match, selfId, choice),
  }));
  const simple = choices.filter(({ choice, view }) => choice.input !== 'amount' && !view.hidden);
  const wagers = choices.filter(({ choice }) => choice.input === 'amount');
  const teenBet =
    match.id === 'teen-patti'
      ? wagers.find(({ choice }) => choice.value.type === 'bet')?.choice
      : undefined;
  const directAmounts = teenBet ? shortWagerAmounts(teenBet) : [];
  const editable = wagers.filter(({ choice }) => choice !== teenBet || !directAmounts.length);
  return (
    <DecisionDock
      className="action-panel casino-dock"
      label="Your actions"
      size="fit"
      pending={pending}
      data-choices={simple.length + directAmounts.length + editable.length}
    >
      <div className="action-context">
        <strong>{turn.label}</strong>
        <span className="small casino-dock-instruction">{instruction ?? turn.message}</span>
        {status ? <span className="casino-dock-status">{status}</span> : null}
      </div>
      {match.actions.length ? (
        <div className="action-choices casino-choices">
          {teenBet &&
            directAmounts.map((amount) => {
              const impact = wagerImpact(match, selfId, amount);
              return (
                <Choice
                  key={`bet:${amount}`}
                  option={teenBet}
                  name={`${teenBet.label} ${amount} ${amount === 1 ? 'chip' : 'chips'}`}
                  note={impact ? `${impact.remaining} left unbet` : undefined}
                  tone="primary"
                  disabled={locked}
                  onPick={() => onAction({ ...teenBet.value, amount })}
                />
              );
            })}
          {simple.map(({ choice, view }, index) => (
            <Choice
              key={`${choice.value.type}:${index}`}
              option={choice}
              name={view.name}
              suffix={view.suffix}
              description={view.description}
              tone={view.tone}
              disabled={locked}
              onPick={() => onAction(choice.value)}
            />
          ))}
          {editable.map(({ choice }, index) => (
            <Wager
              key={`${choice.value.type}:${choice.minimum}:${choice.maximum}:${index}`}
              option={choice}
              match={match}
              room={room}
              selfId={selfId}
              locked={locked}
              onAction={onAction}
              pending={pending}
            />
          ))}
        </div>
      ) : null}
    </DecisionDock>
  );
}

/** Small Teen Patti stakes often have just two legal prices, including the seen-hand step. */
function shortWagerAmounts(option: ActionOption) {
  const { minimum, maximum, step } = option;
  if (minimum == null || maximum == null || maximum < minimum || step <= 0) return [];
  const count = Math.floor((maximum - minimum) / step) + 1;
  return count <= 3 ? Array.from({ length: count }, (_, index) => minimum + index * step) : [];
}

function Choice({
  option,
  name,
  suffix,
  note,
  description,
  tone,
  disabled,
  onPick,
}: {
  option: ActionOption;
  name: string;
  suffix?: string;
  note?: string;
  description?: string;
  tone: 'primary' | 'secondary';
  disabled: boolean;
  onPick: () => void;
}) {
  const id = useId();
  return (
    <div className="casino-choice" data-action={option.value.type}>
      <Button
        variant={tone}
        disabled={disabled}
        aria-describedby={description || note ? id : undefined}
        onClick={onPick}
      >
        <span>
          {name}
          {suffix ? <span aria-hidden="true"> {suffix.trim()}</span> : null}
          {note ? (
            <small aria-hidden="true" className="casino-choice-note">
              {note}
            </small>
          ) : null}
        </span>
      </Button>
      {description || note ? (
        <span id={id} className="sr-only">
          {description ?? note}
        </span>
      ) : null}
    </div>
  );
}

function Wager({
  option,
  match,
  room,
  selfId,
  locked,
  onAction,
}: TableProps & { option: ActionOption; locked: boolean }) {
  const id = useId();
  const view = wagerView(match, selfId, option);
  // The typed amount survives a refresh of this same decision, never a later one.
  const [draft, setDraft] = useTableDraft(
    `casino-wager:${room.id}:${room.matchId}:${room.matchVersion}:${option.value.type}`,
    String(view.min),
  );
  const amount = draft.trim() === '' ? Number.NaN : Number(draft);
  const problem = wagerProblem(amount, view);
  const impact = problem ? null : wagerImpact(match, selfId, amount);
  const send = () => {
    if (!problem && !locked) onAction({ ...option.value, amount });
  };
  return (
    <form
      className="casino-wager"
      data-action={option.value.type}
      aria-labelledby={`${id}-range`}
      onSubmit={(event) => {
        event.preventDefault();
        send();
      }}
    >
      <p className="casino-wager-range" id={`${id}-range`}>
        {view.range}
      </p>
      <div className="casino-wager-row">
        <label className="amount-control casino-amount">
          <span className="sr-only">{option.label} amount</span>
          <input
            type="number"
            inputMode="numeric"
            min={view.min}
            max={view.max}
            step={view.step}
            value={draft}
            disabled={locked}
            aria-invalid={problem ? true : undefined}
            aria-describedby={`${id}-range ${id}-feedback`}
            onChange={(event) => setDraft(event.target.value)}
          />
          <span aria-hidden="true">chips</span>
        </label>
        <Button
          type="submit"
          aria-describedby={`${id}-feedback`}
          disabled={locked || Boolean(problem)}
        >
          <span>
            {option.label}
            {Number.isFinite(amount) && !problem ? <span aria-hidden="true"> {amount}</span> : null}
          </span>
        </Button>
      </div>
      {view.presets.length > 1 ? (
        <div className="casino-wager-presets" role="group" aria-label={`${option.label} amounts`}>
          {view.presets.map((preset) => (
            <Button
              key={preset.label}
              type="button"
              size="sm"
              variant="secondary"
              aria-pressed={amount === preset.value}
              disabled={locked}
              onClick={() => setDraft(String(preset.value))}
            >
              {preset.label}
              {/\d/.test(preset.label) ? null : ` ${preset.value}`}
            </Button>
          ))}
        </div>
      ) : null}
      <p
        className={problem ? 'casino-wager-problem' : 'casino-wager-impact'}
        id={`${id}-feedback`}
        aria-live="polite"
        aria-atomic="true"
      >
        {problem ??
          (impact
            ? `Add ${impact.added} ${impact.added === 1 ? 'chip' : 'chips'} · ${impact.remaining} left unbet`
            : null)}
      </p>
    </form>
  );
}
