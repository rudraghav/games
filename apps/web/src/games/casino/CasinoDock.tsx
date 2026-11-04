'use client';
import { useId } from 'react';
import { Button, DecisionDock } from '@games/ui';
import type { ActionOption } from '@games/api-client';
import type { TableProps } from '../types';
import { turnState } from '../shared/turn-state';
import { useTableDraft } from '../shared/table-draft';
import { casinoInstruction, choiceView, wagerProblem, wagerView } from './casino-guidance';

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
  return (
    <DecisionDock
      className="action-panel casino-dock"
      label="Your actions"
      size="fit"
      pending={pending}
      data-choices={simple.length + wagers.length}
    >
      <div className="action-context">
        <strong>{turn.label}</strong>
        <span className="small casino-dock-instruction">{instruction ?? turn.message}</span>
        {status ? <span className="casino-dock-status">{status}</span> : null}
      </div>
      {match.actions.length ? (
        <div className="action-choices casino-choices">
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
          {wagers.map(({ choice }, index) => (
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

function Choice({
  option,
  name,
  suffix,
  description,
  tone,
  disabled,
  onPick,
}: {
  option: ActionOption;
  name: string;
  suffix?: string;
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
        aria-describedby={description ? id : undefined}
        onClick={onPick}
      >
        <span>
          {name}
          {suffix ? <span aria-hidden="true"> {suffix.trim()}</span> : null}
        </span>
      </Button>
      {description ? (
        <span id={id} className="sr-only">
          {description}
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
            aria-describedby={`${id}-range${problem ? ` ${id}-problem` : ''}`}
            onChange={(event) => setDraft(event.target.value)}
          />
          <span aria-hidden="true">chips</span>
        </label>
        <Button type="submit" disabled={locked || Boolean(problem)}>
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
      {problem ? (
        <p className="casino-wager-problem" id={`${id}-problem`} aria-live="polite">
          {problem}
        </p>
      ) : null}
    </form>
  );
}
