'use client';
import { useId, useState } from 'react';
import { ChevronDown, Coins } from 'lucide-react';
import { Button, DecisionDock } from '@games/ui';
import {
  rouletteDetails,
  slotsDetails,
  type ActionOption,
  type SlotSymbol,
} from '@games/api-client';
import { useTableDraft } from '../shared/table-draft';
import type { TableProps } from '../types';
import { ChanceHistory, PocketToken, spinFace, spinOutcome } from './ChanceHistory';
import {
  betTip,
  chips,
  chipTier,
  OUTSIDE_BETS,
  pocketColor,
  rouletteBetName,
  signedChips,
  slotNames,
} from './chance-format';
import { RouletteWheel } from './RouletteWheel';
import { SlotReels, SymbolMark } from './SlotReels';

const percent = (count: number, total: number) =>
  new Intl.NumberFormat('en', { style: 'percent', maximumFractionDigits: 2 }).format(count / total);

const COLOR_NAMES = { red: 'Red', black: 'Black', green: 'Green' } as const;

/** A casino chip. The number is its stake; the colour only echoes the denomination. */
function Chip({ amount }: { amount: number }) {
  return (
    <span className="chance-chip" data-chip={chipTier(amount)} aria-hidden="true">
      {amount}
    </span>
  );
}

/** Where a chip rests on the layout. It is empty until this bet is the chosen one. */
function BetSpot({ stake }: { stake?: number }) {
  return (
    <span className="chance-spot" aria-hidden="true">
      {stake ? <Chip amount={stake} /> : null}
    </span>
  );
}

function RoulettePicks({
  actions,
  choice,
  stake,
  onChoose,
  disabled,
}: {
  actions: ActionOption[];
  choice: string;
  /** The valid stake to show on the chosen bet, if there is one. */
  stake?: number;
  onChoose: (choice: string) => void;
  disabled: boolean;
}) {
  const available = new Set(actions.map((a) => a.value.choice));
  const numbers = Array.from({ length: 37 }, (_, i) => String(i)).filter((n) => available.has(n));
  const number = numbers.includes(choice) ? choice : '';
  return (
    <fieldset className="chance-picks" disabled={disabled}>
      <legend>Your bet</legend>
      <div className="chance-mat">
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
                data-tip={betTip(key)}
                aria-pressed={choice === key}
                onClick={() => onChoose(key)}
              >
                <span className="chance-bet-name">{label}</span>
                <BetSpot stake={choice === key ? stake : undefined} />
              </Button>
            ))}
        </div>
        <label
          className="chance-number-select"
          data-chosen={number !== '' || undefined}
          data-tip={betTip('number')}
        >
          <span>Single number</span>
          <span className="chance-native-picker">
            <select
              aria-label="Single number"
              value={number}
              onChange={(e) => onChoose(e.target.value)}
            >
              <option value="" disabled>
                Choose
              </option>
              {numbers.map((n) => (
                <option key={n} value={n}>
                  {n} · {COLOR_NAMES[pocketColor(Number(n))]}
                </option>
              ))}
            </select>
            <ChevronDown size={14} aria-hidden="true" />
          </span>
          <BetSpot stake={number ? stake : undefined} />
        </label>
      </div>
    </fieldset>
  );
}

/** The symbols that make a paytable line, drawn as they appear on the reels. */
function PaylineMarks({ result }: { result: string }) {
  const [count, symbol] = result.split('_');
  const face = (symbol === 'cherries' ? 'cherry' : symbol) as SlotSymbol;
  if (!(face in slotNames)) return null;
  return (
    <span className="chance-payline-marks" aria-hidden="true">
      {Array.from({ length: count === 'two' ? 2 : 3 }, (_, i) => (
        <span className="slot-face" data-symbol={face} key={i}>
          <SymbolMark symbol={face} />
        </span>
      ))}
    </span>
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
                  <th scope="row">
                    <PaylineMarks result={row.result} />
                    {row.label}
                  </th>
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
  // Only a spin that settles while this table is open plays its landing motion.
  const [openedAt] = useState(last?.spin ?? 0);
  const landed = !!last && last.spin > openedAt;
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
  const outside = !!draft && draft.choice in OUTSIDE_BETS;
  const gross = roulette ? amount * (outside ? 2 : 36) : 0;
  const reels = slots?.history.at(-1);
  const paid = reels && slots!.paytable.find((row) => row.result === reels.result);
  return (
    <div className="chance-table" data-game={match.id}>
      <div className="chance-play">
        <section
          className="chance-stage"
          aria-label={roulette ? 'Roulette table' : 'Slot machine'}
          data-landed={landed || undefined}
        >
          <div className="chance-stats">
            <span className="chance-balance" data-tip="Free chips for this session.">
              <Coins size={17} aria-hidden="true" />
              <b key={stack}>{chips(stack)}</b>
            </span>
            <span className="chance-spins">
              <span className="chance-pips" aria-hidden="true">
                {Array.from({ length: data.spin_limit }, (_, i) => (
                  <i key={i} data-left={i < data.spins_remaining || undefined} />
                ))}
              </span>
              {data.spins_remaining} of {data.spin_limit} spins left
            </span>
          </div>
          {roulette ? (
            <RouletteWheel
              last={roulette.history.at(-1)}
              previous={roulette.history.at(-2)}
              choice={actions.length ? (draft?.choice ?? '') : ''}
              pending={pending}
              landed={landed}
            />
          ) : (
            <SlotReels
              last={reels}
              pending={pending}
              landed={landed}
              line={
                pending
                  ? 'Spinning…'
                  : reels
                    ? paid?.multiplier
                      ? `${paid.label} · pays ${paid.multiplier}×`
                      : 'No winning line'
                    : 'One payline, three reels'
              }
              bet={
                valid ? (
                  <span className="slot-bet" data-tip="Your stake for the next spin.">
                    <BetSpot stake={amount} />
                    Bet {amount}
                  </span>
                ) : null
              }
            />
          )}
          {last ? (
            <div
              className="chance-last"
              aria-label="Latest spin"
              role="region"
              aria-live="polite"
              aria-atomic="true"
              data-outcome={spinOutcome(last.net).toLowerCase()}
            >
              <PocketToken spin={last} />
              <strong>
                Spin {last.spin} · {spinFace(last)}
              </strong>
              <span className="chance-net" data-gain={last.net > 0} key={last.spin}>
                {last.net > 0 ? (
                  <span className="chance-winnings" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                ) : null}
                <em>{spinOutcome(last.net)}</em> {signedChips(last.net)} net
              </span>
              <small>
                {'choice' in last ? `${rouletteBetName(last.choice)} · ` : ''}Staked{' '}
                <b>{last.stake}</b> · Returned <b>{last.payout}</b>
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
                  stake={valid ? amount : undefined}
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
                      className="chance-chip"
                      data-chip={chipTier(preset)}
                      data-tip={`Stake ${chips(preset)}`}
                      disabled={locked || !action}
                      aria-pressed={amount === preset}
                      onClick={() => setDraft({ ...draft, stake: String(preset) })}
                    >
                      {preset}
                    </Button>
                  ))}
                </div>
              ) : null}
              {valid ? (
                <dl className="chance-slip" aria-hidden="true">
                  {roulette ? (
                    <>
                      <div>
                        <dt>Returns</dt>
                        <dd>{gross}</dd>
                      </div>
                      <div data-gain="true">
                        <dt>Net win</dt>
                        <dd>+{gross - amount}</dd>
                      </div>
                    </>
                  ) : (
                    <div>
                      <dt>At stake</dt>
                      <dd>{amount}</dd>
                    </div>
                  )}
                  <div>
                    <dt>Unbet</dt>
                    <dd>{stack - amount}</dd>
                  </div>
                </dl>
              ) : null}
              <p
                className="chance-wager-note"
                id={hintId}
                aria-live="polite"
                data-valid={valid || undefined}
              >
                {valid
                  ? roulette
                    ? `${rouletteBetName(draft.choice)} · ${chips(gross)} returned on a win · ${stack - amount} left unbet.`
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
