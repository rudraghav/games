'use client';
import { useId } from 'react';
import { ChevronDown, Coins } from 'lucide-react';
import { Button, DecisionDock } from '@games/ui';
import { rouletteDetails, slotsDetails, type ActionOption } from '@games/api-client';
import { useTableDraft } from '../shared/table-draft';
import type { TableProps } from '../types';
import { ChanceHistory, spinFace } from './ChanceHistory';
import { chips, OUTSIDE_BETS, rouletteBetName, signedChips } from './chance-format';
import { RouletteWheel } from './RouletteWheel';
import { SlotReels } from './SlotReels';

const percent = (count: number, total: number) =>
  new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 2 }).format(count / total);

function RoulettePicks({
  actions,
  choice,
  onChoose,
  disabled,
}: {
  actions: ActionOption[];
  choice: string;
  onChoose: (choice: string) => void;
  disabled: boolean;
}) {
  const available = new Set(actions.map((a) => a.value.choice));
  const numbers = Array.from({ length: 37 }, (_, i) => String(i)).filter((n) => available.has(n));
  return (
    <fieldset className="chance-picks" disabled={disabled}>
      <legend>Your bet</legend>
      <div className="chance-outsides">
        {Object.entries(OUTSIDE_BETS)
          .filter(([key]) => available.has(key))
          .map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              type="button"
              variant="secondary"
              data-pocket={key}
              aria-pressed={choice === key}
              onClick={() => onChoose(key)}
            >
              {label}
            </Button>
          ))}
      </div>
      <label className="chance-number-select">
        <span>Single number</span>
        <span className="chance-native-picker">
          <select
            aria-label="Single number"
            value={numbers.includes(choice) ? choice : ''}
            onChange={(e) => onChoose(e.target.value)}
          >
            <option value="" disabled>
              Pick a number
            </option>
            {numbers.map((number) => (
              <option key={number} value={number}>
                {number}
              </option>
            ))}
          </select>
          <ChevronDown size={14} aria-hidden="true" />
        </span>
      </label>
    </fieldset>
  );
}

function ChanceOdds({ slots }: { slots?: ReturnType<typeof slotsDetails> }) {
  return (
    <details className="chance-details">
      <summary>{slots ? 'Paytable and odds' : 'Payouts and odds'}</summary>
      {slots ? (
        <>
          <p>
            One payline across three reels. Only the highest matching prize pays. Returns include
            your stake.
          </p>
          <table>
            <caption className="sr-only">Slot paytable and exact chance per spin</caption>
            <thead>
              <tr>
                <th>Payline</th>
                <th>Return</th>
                <th>Chance</th>
              </tr>
            </thead>
            <tbody>
              {slots.paytable.map((row) => (
                <tr key={row.result}>
                  <th scope="row">{row.label}</th>
                  <td>{row.multiplier}×</td>
                  <td>
                    {row.ways}/{slots.total_outcomes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Chance of a payout {percent(slots.winning_outcomes, slots.total_outcomes)}. Average
            return {percent(slots.return_numerator, slots.total_outcomes)} across all possible
            spins.
          </p>
        </>
      ) : (
        <>
          <p>
            One ball, 37 equally likely pockets. A single number can win on zero. Every outside bet
            loses on zero.
          </p>
          <table>
            <caption className="sr-only">Single-zero roulette returns and odds</caption>
            <thead>
              <tr>
                <th>Your bet</th>
                <th>Return</th>
                <th>Chance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">Single number</th>
                <td>36×</td>
                <td>1/37</td>
              </tr>
              <tr>
                <th scope="row">Outside bet</th>
                <td>2×</td>
                <td>18/37</td>
              </tr>
            </tbody>
          </table>
          <p>
            Returns include your stake. The average return is {percent(36, 37)} across all possible
            spins.
          </p>
        </>
      )}
    </details>
  );
}

export function ChanceTable(props: TableProps) {
  if (!props.selfId) return <p role="status">Opening your table…</p>;
  if (!props.match.players.some((player) => player.id === props.selfId))
    return <p role="status">Only the player can view this table.</p>;
  return <PlayerChanceTable key={props.room.matchId} {...props} />;
}

function PlayerChanceTable({ match, room, selfId, pending, onAction }: TableProps) {
  const roulette = match.id === 'roulette' ? rouletteDetails(match.detail) : undefined;
  const slots = roulette ? undefined : slotsDetails(match.detail);
  const data = roulette ?? slots!;
  const last = data.history.at(-1);
  const stack = match.players.find((player) => player.id === selfId)?.chips ?? slots?.chips ?? 0;
  const actions = match.actions.filter((a) => a.value.type === 'spin' && a.input === 'amount');
  const lastBet = roulette?.history.at(-1)?.choice ?? 'red';
  const defaultChoice =
    roulette && actions.some((item) => item.value.choice === lastBet)
      ? lastBet
      : (actions[0]?.value.choice ?? '');
  const base = actions.find((item) => item.value.choice === defaultChoice) ?? actions[0];
  const defaultStake =
    last && last.stake >= (base?.minimum ?? 1) && last.stake <= (base?.maximum ?? 0)
      ? last.stake
      : (base?.minimum ?? 1);
  const [draft, setDraft] = useTableDraft(
    `chance:${selfId}:${room.id}:${room.matchId}:${room.matchVersion}`,
    { choice: defaultChoice, stake: String(defaultStake) },
  );
  const action = roulette ? actions.find((item) => item.value.choice === draft?.choice) : base;
  const min = action?.minimum ?? 1;
  const max = action?.maximum ?? 0;
  const step = action?.step || 1;
  const amount = Number(draft?.stake);
  const valid =
    !!action &&
    draft?.stake?.trim() !== '' &&
    Number.isSafeInteger(amount) &&
    amount >= min &&
    amount <= max &&
    (amount - min) % step === 0;
  const locked = pending || room.paused;
  const hintId = useId();
  const presets = [...new Set([min, 5, 10, 25])].filter(
    (a) => a >= min && a <= max && (a - min) % step === 0,
  );
  return (
    <div className="chance-table" data-game={match.id}>
      <div className="chance-play">
        <section className="chance-stage" aria-label={roulette ? 'Roulette table' : 'Slot machine'}>
          <div className="chance-stats">
            <span>
              <Coins size={17} aria-hidden="true" />
              {chips(stack)}
            </span>
            <span>
              {data.spins_remaining} of {data.spin_limit} spins left
            </span>
          </div>
          {roulette ? (
            <RouletteWheel
              last={roulette.history.at(-1)}
              choice={draft?.choice ?? ''}
              pending={pending}
            />
          ) : (
            <SlotReels last={slots!.history.at(-1)} pending={pending} />
          )}
          {last ? (
            <div
              className="chance-last"
              aria-label="Latest spin"
              role="region"
              aria-live="polite"
              aria-atomic="true"
            >
              <strong>
                Spin {last.spin} · {spinFace(last)}
              </strong>
              <span data-gain={last.net > 0}>{signedChips(last.net)} net</span>
              <small>
                {'choice' in last ? `${rouletteBetName(last.choice)} · ` : ''}Staked {last.stake} ·
                Returned {last.payout}
              </small>
            </div>
          ) : null}
        </section>
        {actions.length > 0 ? (
          <DecisionDock size="fit" label="Your wager" pending={pending} className="chance-dock">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (valid && !locked && action) onAction({ ...action.value, amount });
              }}
            >
              {roulette ? (
                <RoulettePicks
                  actions={actions}
                  choice={draft?.choice ?? ''}
                  disabled={locked}
                  onChoose={(choice) => setDraft({ ...draft, choice })}
                />
              ) : null}
              <label className="chance-stake">
                <span>
                  Stake{' '}
                  <small>
                    {min}–{max} chips
                  </small>
                </span>
                <input
                  aria-label="Stake"
                  type="number"
                  inputMode="numeric"
                  min={min}
                  max={max}
                  step={step}
                  value={draft?.stake ?? ''}
                  disabled={locked || !action}
                  aria-invalid={!valid || undefined}
                  aria-describedby={hintId}
                  onChange={(e) => setDraft({ ...draft, stake: e.target.value })}
                />
              </label>
              {presets.length > 1 ? (
                <div className="chance-presets" role="group" aria-label="Quick stakes">
                  {presets.map((preset) => (
                    <Button
                      key={preset}
                      type="button"
                      size="sm"
                      variant="secondary"
                      disabled={locked || !action}
                      aria-pressed={amount === preset}
                      onClick={() => setDraft({ ...draft, stake: String(preset) })}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              ) : null}
              <p className="chance-wager-note" id={hintId} aria-live="polite">
                {valid
                  ? roulette
                    ? `${rouletteBetName(draft.choice)} · ${chips(amount * (draft.choice in OUTSIDE_BETS ? 2 : 36))} returned on a win · ${stack - amount} left unbet.`
                    : `${chips(amount)} at stake · ${stack - amount} left unbet.`
                  : action
                    ? `Enter a whole number from ${min} to ${max}.`
                    : 'Choose a bet to spin.'}
              </p>
              {room.paused ? <p className="chance-wager-note">Waiting to reconnect.</p> : null}
              <Button
                type="submit"
                aria-label="Spin"
                pending={pending}
                disabled={!valid || locked}
                className="chance-spin"
              >
                {pending ? 'Spinning…' : valid ? `Spin · ${chips(amount)}` : 'Spin'}
              </Button>
            </form>
          </DecisionDock>
        ) : null}
      </div>
      <ChanceOdds slots={slots} />
      <ChanceHistory history={data.history} />
    </div>
  );
}
