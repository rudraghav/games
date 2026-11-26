'use client';

import type { MouseEvent } from 'react';
import { Check, Megaphone, Trophy } from 'lucide-react';
import { housieDetails, type ActionOption } from '@games/api-client';
import { Button } from '@games/ui';
import type { TableProps } from '../types';
import { PlayerStrip } from '../shared/PlayerStrip';
import { seatName } from '../shared/seat-names';
import { nameList } from '../shared/turn-state';
import {
  claimOptions,
  leadMove,
  markOptions,
  plural,
  prizeState,
  recentCalls,
  ticketCells,
} from './housie-view';

const BOARD = Array.from({ length: 90 }, (_, index) => index + 1);

export function HousieTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = housieDetails(match.detail);
  const blocked = pending || room.paused;
  const finished = match.phase === 'finished';
  const marks = markOptions(match.actions);
  const claims = claimOptions(match.actions);
  const call = match.actions.find((option) => option.value.type === 'call_number');
  const lead = leadMove(data, match.actions);
  const cells = ticketCells(data, marks);
  const called = new Set(data.called);
  const member = (id: string) => room.members.find((item) => item.id === id);
  const display = (id: string) => (id === selfId ? 'You' : seatName(member(id)));
  const seated = data.ticket.length > 0;
  const caller = match.currentPlayer;
  const recent = recentCalls(data.called);
  // Marks wait for the player in call order, the number just called first.
  const toMark = [...data.called].reverse().filter((number) => marks.has(number));

  const send = (option: ActionOption | undefined) => {
    if (option && !blocked) onAction(option.value);
  };
  // A called number on the ticket can be tapped to mark it. The same move is a
  // full-size labelled button below the ticket for keyboards and small screens.
  const tapTicket = (event: MouseEvent<HTMLTableElement>) => {
    const cell = (event.target as HTMLElement).closest<HTMLElement>('[data-mark]');
    if (cell) send(marks.get(Number(cell.dataset.mark)));
  };

  return (
    <div className="table-layout stable-game-table housie-game" data-phase={match.phase}>
      <PlayerStrip
        {...props}
        playerCaption={(player) => `${player.count} marked · ${plural(player.score, 'point')}`}
      />
      <section className="housie-table" aria-label="Housie table">
        <div className="housie-caller">
          <div className="housie-ball" data-empty={data.lastCalled === null} aria-live="polite">
            <span className="housie-ball__number" key={data.lastCalled ?? 'none'}>
              {data.lastCalled ?? '–'}
            </span>
            <span className="sr-only">
              {data.lastCalled === null
                ? 'No number called yet'
                : `Last number called: ${data.lastCalled}`}
            </span>
          </div>
          <div className="housie-caller__facts">
            <p className="housie-caller__label">
              {data.lastCalled === null ? 'No number called yet' : 'Last number called'}
            </p>
            <p className="small muted tabular-nums">
              {data.called.length} of 90 called · {match.drawCount} to come
            </p>
            {recent.length ? (
              <ol className="housie-recent" aria-label="Called before, newest first">
                {recent.map((number) => (
                  <li key={number} className="tabular-nums">
                    {number}
                  </li>
                ))}
              </ol>
            ) : null}
          </div>
          <div className="housie-call-slot" hidden={finished}>
            {call ? (
              <Button
                variant={lead?.type === 'call' ? 'primary' : 'secondary'}
                disabled={blocked}
                onClick={() => send(call)}
              >
                <Megaphone size={17} aria-hidden="true" />
                {call.label}
              </Button>
            ) : !finished && caller && match.phase === 'calling' ? (
              <p className="small muted">
                Caller <strong>{display(caller)}</strong>
              </p>
            ) : null}
          </div>
        </div>

        <section className="housie-ticket-zone" aria-labelledby="housie-ticket-heading">
          <div className="housie-heading">
            <h2 id="housie-ticket-heading">Your ticket</h2>
            {seated ? (
              <span className="small muted tabular-nums">{data.marked.length} of 15 marked</span>
            ) : null}
          </div>
          {seated ? (
            <table
              className="housie-ticket"
              data-auto-mark={data.autoMark}
              aria-describedby={finished ? undefined : 'housie-ticket-key'}
              onClick={tapTicket}
            >
              <tbody>
                {cells.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) =>
                      cell.number === null ? (
                        <td key={c} className="housie-cell" data-blank="" />
                      ) : (
                        <td
                          key={c}
                          className="housie-cell"
                          data-housie-number={cell.number}
                          data-marked={cell.marked || undefined}
                          data-called={cell.called || undefined}
                          data-mark={cell.markable && !blocked ? cell.number : undefined}
                        >
                          <span className="housie-cell__number tabular-nums">{cell.number}</span>
                          {cell.marked ? (
                            <span className="housie-stamp" aria-hidden="true">
                              <Check size={14} strokeWidth={3} />
                            </span>
                          ) : null}
                          <span className="sr-only">
                            {cell.marked ? ', marked' : cell.called ? ', called, not marked' : ''}
                          </span>
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="small muted">
              You’re watching this match. Tickets belong to the players.
            </p>
          )}
          {seated && !finished ? (
            <p className="small muted housie-key" id="housie-ticket-key">
              {data.autoMark
                ? 'Called numbers are stamped for you.'
                : 'A dashed ring is called but not marked yet. Tap it to stamp it.'}
            </p>
          ) : null}
          {toMark.length ? (
            <div className="housie-marks" aria-label="Called numbers to mark">
              {toMark.map((number) => (
                <Button
                  key={number}
                  variant={
                    lead?.type === 'mark' && lead.number === number ? 'primary' : 'secondary'
                  }
                  disabled={blocked}
                  onClick={() => send(marks.get(number))}
                >
                  {marks.get(number)!.label}
                </Button>
              ))}
            </div>
          ) : null}
        </section>

        <section className="housie-prizes" aria-labelledby="housie-prizes-heading">
          <div className="housie-heading">
            <h2 id="housie-prizes-heading">Prizes</h2>
            {finished ? null : (
              <span className="small muted">Claim one whenever your ticket has it.</span>
            )}
          </div>
          <ul className="housie-prize-list">
            {data.prizes.map((prize) => {
              const option = claims.get(prize.key);
              // Once the match is over nothing can be shared any more.
              const state =
                finished && prize.winners.length ? 'won' : prizeState(prize, data.called.length);
              const winners = nameList(prize.winners.map(display), 3);
              return (
                <li
                  key={prize.key}
                  className="housie-prize"
                  data-prize={prize.key}
                  data-state={option ? 'claimable' : state}
                >
                  <span className="housie-prize__name">
                    {prize.label}
                    <span className="housie-prize__points tabular-nums">
                      {plural(prize.points, 'pt')}
                    </span>
                  </span>
                  {option ? (
                    <Button
                      variant={
                        lead?.type === 'claim' && lead.key === prize.key ? 'primary' : 'secondary'
                      }
                      disabled={blocked}
                      onClick={() => send(option)}
                    >
                      <Trophy size={15} aria-hidden="true" />
                      {option.label}
                    </Button>
                  ) : (
                    <span className="housie-prize__status small">
                      {state === 'open'
                        ? finished
                          ? 'Not won'
                          : 'Open'
                        : state === 'shareable'
                          ? `${winners} · can be shared until the next call`
                          : `Won by ${winners}`}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        <details className="housie-board">
          <summary>
            All called numbers
            <span className="tabular-nums">&nbsp;· {data.called.length}</span>
          </summary>
          <ol className="housie-board__grid" aria-label="Numbers 1 to 90, called ones stamped">
            {BOARD.map((number) => (
              <li
                key={number}
                className="tabular-nums"
                data-called={called.has(number) || undefined}
                data-last={number === data.lastCalled || undefined}
              >
                {number}
                <span className="sr-only">{called.has(number) ? ', called' : ''}</span>
              </li>
            ))}
          </ol>
        </details>
      </section>
    </div>
  );
}
