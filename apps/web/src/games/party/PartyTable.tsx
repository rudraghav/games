'use client';

import { useState } from 'react';
import { Check, Coffee, MessageCircle, Sparkles } from 'lucide-react';
import { partyDetails } from '@games/api-client';
import { Avatar, Button, DecisionDock } from '@games/ui';
import type { ActionOption } from '@games/api-client';
import type { TableProps } from '../types';
import { playerName } from '../types';
import { PlayerStrip } from '../shared/PlayerStrip';

export function PartyTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = partyDetails(match.detail);
  const roundKey = `${room.matchId}:${data.mode}:${data.round}:${selfId}`;
  const [selection, setSelection] = useState<{ key: string; value: string } | null>(null);
  const selected = selection?.key === roundKey ? selection.value : null;
  const spotlight = room.members.find((member) => member.id === data.spotlight);
  const next = match.actions.find((option) => option.value.type === 'next_prompt');
  const decisions = match.actions.filter((option) => option.value.type !== 'next_prompt');
  const blocked = pending || room.paused;
  const isSpotlight = selfId === data.spotlight;
  const title =
    data.mode === 'spill-or-chill'
      ? 'Spill or Chill'
      : data.mode === 'most-likely'
        ? 'Most Likely'
        : 'Hot Seat';
  const instruction =
    data.mode === 'spill-or-chill'
      ? isSpotlight
        ? 'Answer aloud, keep your answer private, or pass.'
        : 'Current player: ' + playerName(room, data.spotlight) + '.'
      : data.mode === 'most-likely'
        ? 'Choose one friend. Your vote stays secret until everyone is in.'
        : isSpotlight
          ? 'Choose your answer.'
          : 'Predict the highlighted player’s answer.';

  function key(option: ActionOption) {
    return option.value.target || option.value.choice;
  }

  function label(option: ActionOption) {
    if (option.value.target) return playerName(room, option.value.target);
    if (option.value.choice === 'a') return `A · ${data.options[0]}`;
    if (option.value.choice === 'b') return `B · ${data.options[1]}`;
    return option.value.choice === 'share'
      ? 'Share · I answered aloud'
      : option.value.choice === 'chill'
        ? 'Keep private'
        : 'Pass';
  }

  function choiceLabel(choice: string) {
    if (data.mode === 'most-likely') return choice === 'pass' ? 'Passed' : playerName(room, choice);
    return choice === 'a'
      ? `A · ${data.options[0]}`
      : choice === 'b'
        ? `B · ${data.options[1]}`
        : choice === 'share'
          ? 'Answered aloud'
          : choice === 'chill'
            ? 'Kept private'
            : 'Passed';
  }

  const selectedOption = decisions.find((option) => key(option) === selected);

  return (
    <div className="table-layout stable-game-table">
      <PlayerStrip
        {...props}
        playerCaption={(player) =>
          `${player.score} ${data.mode === 'most-likely' ? 'spotlight' : data.mode === 'hot-seat' ? 'prediction' : 'participation'} ${player.score === 1 ? 'point' : 'points'}${data.submitted.includes(player.id) && !data.result ? ' · locked in' : ''}`
        }
      />
      <section className="party-table" data-mode={data.mode} aria-label={`${title} table`}>
        {room.members.some((member) => member.isBot) ? (
          <p className="small muted">Bot answers and votes are simulated.</p>
        ) : null}
        <div className="party-table__topline">
          <p className="eyebrow">{title}</p>
          <span className="small">
            Round {data.round} of {data.rounds}
          </span>
        </div>
        <div className="party-spotlight">
          <Avatar name={spotlight?.name || 'Player'} seed={spotlight?.avatar} />
          <span>
            <small>In the spotlight</small>
            <strong>
              {spotlight?.name || 'Player'}
              {isSpotlight ? ' · you' : ''}
            </strong>
          </span>
        </div>
        <div className="party-prompt">
          <Sparkles size={28} aria-hidden="true" />
          <h2>{data.prompt}</h2>
          {data.mode === 'hot-seat' && data.result ? (
            <div className="party-options" aria-label="Preference options">
              {data.options.map((option, i) => (
                <p key={option}>
                  <b>{i === 0 ? 'A' : 'B'}</b>
                  {option}
                </p>
              ))}
            </div>
          ) : null}
        </div>
        <DecisionDock
          className="party-decision-workspace"
          size="extended"
          label="Party choices and reveal"
          pending={pending}
        >
          {data.result ? (
            <div className="party-reveal" aria-live="polite">
              <h3>
                {data.mode === 'hot-seat'
                  ? data.result.answer === 'pass'
                    ? 'The hot seat passed. No points this round.'
                    : `The answer was ${data.result.answer?.toUpperCase()}.`
                  : data.mode === 'most-likely'
                    ? 'Votes revealed.'
                    : 'Round complete.'}
              </h3>
              <div className="party-reveal__list">
                {match.players
                  .filter((player) => data.result!.choices[player.id])
                  .map((player) => {
                    const member = room.members.find((member) => member.id === player.id);
                    const points = data.result!.points[player.id];
                    return (
                      <div key={player.id} className="party-reveal__row">
                        <Avatar name={member?.name || 'Player'} seed={member?.avatar} size="sm" />
                        <span className="party-reveal__identity">
                          <strong>{member?.name || 'Player'}</strong>
                          <small>{choiceLabel(data.result!.choices[player.id])}</small>
                        </span>
                        {data.mode === 'most-likely' ? (
                          <span className="party-tally">
                            {data.result!.tallies[player.id]}{' '}
                            {data.result!.tallies[player.id] === 1 ? 'vote' : 'votes'}
                          </span>
                        ) : null}
                        <b className="party-earned">{points ? `+${points}` : '—'}</b>
                      </div>
                    );
                  })}
              </div>
              {data.sipPrompts && match.phase !== 'finished' ? (
                <p className="party-sip">
                  <Coffee size={17} aria-hidden="true" />
                  Fancy a toast? Take an optional sip of any drink, or skip it.
                </p>
              ) : null}
              {next ? (
                <Button
                  onClick={() => {
                    setSelection(null);
                    onAction(next.value);
                  }}
                  disabled={blocked}
                >
                  {next.label}
                </Button>
              ) : match.phase !== 'finished' ? (
                <p className="small muted">
                  {playerName(room, data.spotlight)} can reveal the next prompt.
                </p>
              ) : null}
            </div>
          ) : (
            <div className="party-decisions">
              <p>{data.ownChoice ? 'You’re locked in. Waiting for your friends.' : instruction}</p>
              {data.mode !== 'spill-or-chill' ? (
                <p className="small muted" aria-live="polite">
                  {data.submitted.length} of {match.players.length} locked in
                </p>
              ) : null}
              {data.ownChoice ? (
                <div className="party-locked">
                  <Check size={19} aria-hidden="true" />
                  <span>Your choice: {choiceLabel(data.ownChoice)}</span>
                </div>
              ) : null}
              {decisions.length ? (
                <>
                  <div className="party-choice-grid" aria-label="Your choice">
                    {decisions.map((option) => (
                      <Button
                        key={key(option)}
                        variant="secondary"
                        className="party-choice"
                        aria-pressed={selected === key(option)}
                        disabled={blocked}
                        onClick={() => setSelection({ key: roundKey, value: key(option) })}
                      >
                        {option.value.target ? (
                          <Avatar
                            name={playerName(room, option.value.target)}
                            seed={
                              room.members.find((member) => member.id === option.value.target)
                                ?.avatar
                            }
                            size="sm"
                          />
                        ) : null}
                        <span className="party-choice__label">{label(option)}</span>
                      </Button>
                    ))}
                  </div>
                  <Button
                    className="party-commit"
                    disabled={blocked || !selectedOption}
                    pending={pending}
                    onClick={() => {
                      if (selectedOption) {
                        onAction(selectedOption.value);
                        setSelection(null);
                      }
                    }}
                  >
                    <MessageCircle size={17} aria-hidden="true" />
                    {selected === 'pass' ? 'Confirm pass' : 'Lock in my choice'}
                  </Button>
                </>
              ) : null}
            </div>
          )}
        </DecisionDock>
      </section>
    </div>
  );
}
