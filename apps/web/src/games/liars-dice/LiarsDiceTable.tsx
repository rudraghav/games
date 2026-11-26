'use client';

import { Minus, Plus } from 'lucide-react';
import { liarsDiceDetails, type LiarsDiceDetails } from '@games/api-client';
import { Button, DecisionDock } from '@games/ui';
import type { TableProps } from '../types';
import { PlayerStrip } from '../shared/PlayerStrip';
import { useTableDraft } from '../shared/table-draft';
import { seatName } from '../shared/seat-names';
import { repeatsNotice, turnState } from '../shared/turn-state';
import { Die } from './Die';
import {
  bidAction,
  bidRanges,
  bidText,
  clampQuantity,
  countsFor,
  faceName,
  revealSummary,
} from './bid-builder';

const diceWord = (count: number) => `${count} ${count === 1 ? 'die' : 'dice'}`;
const SAFE_ID = /^[\w:-]+$/;

type Draft = { face: number | null; quantity: number };

/** The bid builder: a face, a quantity inside that face's offered range, then Bid or Call liar. */
function LiarsDiceDock({ match, room, selfId, onAction, pending }: TableProps) {
  const ranges = bidRanges(match.actions);
  const offered = ranges.filter((range) => range.option);
  const callLiar = match.actions.find((option) => option.value.type === 'call_liar');
  const nextRound = match.actions.find((option) => option.value.type === 'next_round');
  const [draft, setDraft] = useTableDraft<Draft>(
    `liars-dice:${room.id}:${room.matchId}:${room.matchVersion}:${selfId}`,
    { face: null, quantity: 0 },
  );
  const blocked = pending || room.paused;
  const selected = offered.find((range) => range.face === draft.face);
  const quantity = selected ? clampQuantity(draft.quantity, selected) : 0;
  const bid = bidAction(selected, quantity);
  const notice = turnState(match, room, selfId).message;
  if (!offered.length && !callLiar && !nextRound) return null;
  const line = pending
    ? 'Saving your move…'
    : room.paused
      ? 'Waiting for players to reconnect.'
      : nextRound
        ? ''
        : !offered.length && callLiar
          ? 'No higher bid is possible: the only move is to call liar.'
          : selected
            ? `${faceName(selected.face, 2).replace(/^./, (c) => c.toUpperCase())}: ${selected.minimum === selected.maximum ? `only ${selected.minimum}` : `from ${selected.minimum} up to ${selected.maximum}`}.`
            : '';
  function choose(face: number) {
    const range = offered.find((item) => item.face === face);
    if (!range) return;
    setDraft({ face, quantity: range.minimum });
  }
  function step(by: number) {
    if (!selected) return;
    setDraft({ face: selected.face, quantity: clampQuantity(quantity + by, selected) });
  }
  return (
    <DecisionDock
      className="liars-dice-dock"
      size="fit"
      label="Your Liar’s Dice decision"
      pending={pending}
    >
      {line && !repeatsNotice(line, notice) ? (
        <p className="small muted liars-dice-dock__line" aria-live="polite">
          {line}
        </p>
      ) : null}
      {offered.length ? (
        <>
          <div className="liars-dice-faces" role="group" aria-label="Choose a face to bid on">
            {ranges.map((range) => (
              <button
                key={range.face}
                type="button"
                className="liars-dice-face"
                aria-pressed={draft.face === range.face}
                aria-label={
                  range.option
                    ? `${faceName(range.face)}, ${range.minimum === range.maximum ? `only ${range.minimum}` : `${range.minimum} to ${range.maximum}`}`
                    : `${faceName(range.face)}, no legal bid`
                }
                disabled={blocked || !range.option}
                onClick={() => choose(range.face)}
              >
                <Die face={range.face} size="sm" label="" />
                <span>{faceName(range.face)}</span>
              </button>
            ))}
          </div>
          <div className="liars-dice-stepper" data-empty={!selected || undefined}>
            <Button
              variant="secondary"
              size="icon"
              aria-label="One fewer"
              disabled={blocked || !selected || quantity <= selected.minimum}
              onClick={() => step(-1)}
            >
              <Minus size={18} aria-hidden="true" />
            </Button>
            <output className="liars-dice-stepper__value" aria-live="polite">
              {selected ? bidText(quantity, selected.face) : 'Choose a face'}
            </output>
            <Button
              variant="secondary"
              size="icon"
              aria-label="One more"
              disabled={blocked || !selected || quantity >= selected.maximum}
              onClick={() => step(1)}
            >
              <Plus size={18} aria-hidden="true" />
            </Button>
          </div>
        </>
      ) : null}
      <div className="liars-dice-dock__actions" data-decision-actions="">
        {offered.length ? (
          <Button disabled={blocked || !bid} pending={pending} onClick={() => bid && onAction(bid)}>
            {selected ? `Bid ${bidText(quantity, selected.face)}` : 'Choose a face to bid'}
          </Button>
        ) : null}
        {callLiar ? (
          <Button
            variant={offered.length ? 'secondary' : 'primary'}
            disabled={blocked}
            onClick={() => onAction(callLiar.value)}
          >
            {callLiar.label}
          </Button>
        ) : null}
        {nextRound ? (
          <Button disabled={blocked} pending={pending} onClick={() => onAction(nextRound.value)}>
            {nextRound.label}
          </Button>
        ) : null}
      </div>
    </DecisionDock>
  );
}

function RevealPanel({
  data,
  order,
  name,
  winner,
}: {
  data: LiarsDiceDetails;
  order: string[];
  name: (id: string) => string;
  winner: string | null;
}) {
  const reveal = data.reveal!;
  const players = order.filter((id) => reveal.dice[id]);
  return (
    <section className="liars-dice-reveal" aria-label="Every die on the table">
      <h3 aria-live="polite">{revealSummary(reveal, data.wildOnes, name)}</h3>
      {winner ? (
        <p className="liars-dice-reveal__winner">
          {name(winner)} {name(winner) === 'You' ? 'win' : 'wins'}: the last player with dice.
        </p>
      ) : null}
      <ul className="liars-dice-reveal__rows">
        {players.map((id) => {
          const dice = reveal.dice[id];
          const counted = dice.filter((die) => countsFor(die, reveal.face, data.wildOnes)).length;
          const role =
            id === reveal.caller ? 'called liar' : id === reveal.bidder ? 'made the bid' : null;
          return (
            <li key={id} className="liars-dice-reveal__row" data-loser={id === reveal.loser}>
              <div className="liars-dice-reveal__who">
                <strong>{name(id)}</strong>
                <span className="small muted">
                  {[role, `${diceWord(counted)} ${counted === 1 ? 'counts' : 'count'}`]
                    .filter(Boolean)
                    .join(' · ')}
                  {id === reveal.loser ? ' · loses a die' : ''}
                </span>
              </div>
              <div className="liars-dice-row" aria-label={`${name(id)}’s dice`} role="list">
                {dice.map((die, index) => {
                  const counts = countsFor(die, reveal.face, data.wildOnes);
                  return (
                    <span key={index} className="liars-dice-cell" role="listitem">
                      <Die face={die} size="sm" counts={counts} />
                      <span className="liars-dice-mark" aria-hidden="true">
                        {counts === 'wild' ? 'wild' : counts ? 'counts' : ''}
                      </span>
                    </span>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function LiarsDiceTable(props: TableProps) {
  const { match, room, selfId } = props;
  const data = liarsDiceDetails(match.detail);
  const member = (id: string) => room.members.find((item) => item.id === id);
  const name = (id: string) => (id === selfId ? 'You' : seatName(member(id)));
  const own = match.players.findIndex((player) => player.id === selfId);
  const order = (
    own > 0 ? [...match.players.slice(own), ...match.players.slice(0, own)] : match.players
  ).map((player) => player.id);
  const showReveal = Boolean(data.reveal) && match.phase !== 'bidding';
  const seated = own >= 0;
  const out = data.out.includes(selfId);
  const bid = data.bid;
  const ownCounts = bid
    ? data.dice.filter((die) => countsFor(die, bid.face, data.wildOnes)).length
    : 0;
  const winner = match.phase === 'finished' ? (match.winners[0] ?? null) : null;
  // Each seat's dice drawn as small pips under its name; the caption says the number.
  const pipStyle = match.players
    .filter((player) => SAFE_ID.test(player.id))
    .map((player) => `.liars-dice-game [data-player="${player.id}"]{--dice:${player.count}}`)
    .join('');
  return (
    <div className="table-layout stable-game-table liars-dice-game" data-phase={match.phase}>
      <style>{pipStyle}</style>
      <PlayerStrip
        {...props}
        playerCaption={(player) =>
          player.eliminated
            ? `Out of dice · ${ordinal(data.out.indexOf(player.id) + 1)} out`
            : `${diceWord(player.count)} left`
        }
      />
      <section className="liars-dice-table" aria-label="Liar’s Dice table">
        <p className="liars-dice-topline small">
          <span>Round {data.round}</span>
          <span>{diceWord(data.totalDice)} in play</span>
          <span>{data.wildOnes ? 'Ones are wild' : 'Ones count only as ones'}</span>
        </p>
        <div className="liars-dice-bid" aria-live="polite">
          {bid ? (
            <>
              <Die face={bid.face} size="md" label={`Bid face: ${faceName(bid.face, 1)}`} />
              <div>
                <p className="small muted">
                  {match.phase === 'bidding' ? 'Current bid' : 'Bid that was called'}
                </p>
                <h2>{bidText(bid.quantity, bid.face)}</h2>
                <p className="small">
                  {bid.player === selfId ? 'Your bid' : `Bid by ${name(bid.player)}`} · at least
                  this many on the table
                </p>
              </div>
            </>
          ) : (
            <div>
              <p className="small muted">Current bid</p>
              <h2>No bid yet</h2>
              <p className="small">
                {data.starter === selfId
                  ? 'Nobody has bid this round.'
                  : `${name(data.starter)} opens the bidding.`}
              </p>
            </div>
          )}
        </div>
        {showReveal ? (
          <RevealPanel data={data} order={order} name={name} winner={winner} />
        ) : seated ? (
          <section className="liars-dice-own" aria-label="Your dice">
            <h3>Your dice</h3>
            {out || !data.dice.length ? (
              <p className="small muted">You’re out of dice. Watch the rest of the match.</p>
            ) : (
              <>
                <div className="liars-dice-row liars-dice-row--own" key={data.round} role="list">
                  {data.dice.map((die, index) => {
                    const counts = bid ? countsFor(die, bid.face, data.wildOnes) : null;
                    return (
                      <span key={index} className="liars-dice-cell" role="listitem">
                        <Die face={die} size="lg" counts={counts} />
                        <span className="liars-dice-mark" aria-hidden="true">
                          {counts === 'wild' ? 'wild' : counts ? 'counts' : ''}
                        </span>
                      </span>
                    );
                  })}
                </div>
                <p className="small muted">
                  {bid
                    ? `${ownCounts} of your dice ${ownCounts === 1 ? 'counts' : 'count'} toward ${faceName(bid.face)}${data.wildOnes && bid.face !== 1 ? ' (ones are wild)' : ''}. Only you can see them.`
                    : 'Only you can see your dice.'}
                </p>
              </>
            )}
          </section>
        ) : null}
        {data.bids.length ? (
          <section className="liars-dice-history" aria-label="Bids this round">
            <h3>Bids this round</h3>
            <ol>
              {data.bids.map((item, index) => (
                <li key={index} data-latest={index === data.bids.length - 1 || undefined}>
                  <Die face={item.face} size="xs" label="" />
                  <span>
                    <strong>{name(item.player)}</strong> · {bidText(item.quantity, item.face)}
                  </span>
                </li>
              ))}
            </ol>
          </section>
        ) : null}
        <LiarsDiceDock {...props} />
      </section>
    </div>
  );
}

function ordinal(place: number) {
  return ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'][place - 1] ?? `${place}th`;
}
