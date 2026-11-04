'use client';

import { Check, Coffee, MessageCircle, Sparkles } from 'lucide-react';
import { partyDetails } from '@games/api-client';
import { Avatar, Button, DecisionDock } from '@games/ui';
import type { ActionOption } from '@games/api-client';
import type { TableProps } from '../types';
import { playerName } from '../types';
import { PlayerStrip } from '../shared/PlayerStrip';
import { useTableDraft } from '../shared/table-draft';
import { nameList } from '../shared/turn-state';
import { seatName } from '../shared/seat-names';

const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

export function PartyTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = partyDetails(match.detail);
  // The unsent choice belongs to this round only. It stays selected while the
  // move is saving and after a failed save, and survives a refresh.
  const [selected, setSelected] = useTableDraft<string | null>(
    `party:${room.id}:${room.matchId}:${data.mode}:${data.round}:${selfId}`,
    null,
  );
  const member = (id: string) => room.members.find((item) => item.id === id);
  // One name per seat everywhere on this table: bots drop "Bot" and get a badge.
  const display = (id: string) => (id === selfId ? 'You' : seatName(member(id)));
  const spotlight = member(data.spotlight);
  const spotlightName = seatName(spotlight);
  const next = match.actions.find((option) => option.value.type === 'next_prompt');
  const decisions = match.actions.filter((option) => option.value.type !== 'next_prompt');
  const blocked = pending || room.paused;
  const isSpotlight = selfId === data.spotlight;
  const mode = data.mode;
  const title =
    mode === 'spill-or-chill'
      ? 'Spill or Chill'
      : mode === 'most-likely'
        ? 'Most Likely'
        : 'Hot Seat';
  const instruction =
    mode === 'spill-or-chill'
      ? isSpotlight
        ? 'Answer aloud and Spill, or keep it to yourself and Chill. Both earn +1. Pass scores nothing.'
        : `${spotlightName} is answering this one.`
      : mode === 'most-likely'
        ? 'Choose one friend. Your vote stays secret until everyone is in.'
        : isSpotlight
          ? 'Pick your honest answer. Everyone else is predicting it.'
          : `Predict what ${spotlightName} will choose. A correct prediction earns +1.`;
  const pendingIds = (
    mode === 'spill-or-chill' ? [data.spotlight] : match.players.map((p) => p.id)
  ).filter((id) => !data.submitted.includes(id));
  const waitingFor = pendingIds.filter((id) => id !== selfId).map(display);

  function key(option: ActionOption) {
    return option.value.target || option.value.choice;
  }

  function label(option: ActionOption) {
    if (option.value.target) return display(option.value.target);
    if (option.value.choice === 'a') return `A · ${data.options[0]}`;
    if (option.value.choice === 'b') return `B · ${data.options[1]}`;
    if (option.value.choice === 'share') return 'Spill · I answered aloud (+1)';
    if (option.value.choice === 'chill') return 'Chill · keep it to myself (+1)';
    return mode === 'spill-or-chill' ? 'Pass (no point)' : 'Pass';
  }

  function choiceLabel(choice: string) {
    if (mode === 'most-likely') return choice === 'pass' ? 'Passed' : display(choice);
    return choice === 'a'
      ? `A · ${data.options[0]}`
      : choice === 'b'
        ? `B · ${data.options[1]}`
        : choice === 'share'
          ? 'Spilled · answered aloud'
          : choice === 'chill'
            ? 'Chilled · kept it private'
            : 'Passed';
  }

  const selectedOption = decisions.find((option) => key(option) === selected);
  const result = data.result;
  const revealed = result
    ? match.players.filter((player) => result.choices[player.id] !== undefined)
    : [];
  if (result && mode === 'most-likely')
    revealed.sort((a, b) => (result.tallies[b.id] || 0) - (result.tallies[a.id] || 0));
  if (result && mode === 'hot-seat')
    revealed.sort((a, b) => Number(b.id === data.spotlight) - Number(a.id === data.spotlight));
  const headline = (() => {
    if (!result) return '';
    if (mode === 'most-likely') {
      const top = Math.max(0, ...Object.values(result.tallies));
      if (!top) return 'Everyone passed. No points this round.';
      const leaders = match.players.filter((p) => result.tallies[p.id] === top).map((p) => p.id);
      return `Most likely: ${nameList(leaders.map(display), 4)} · ${plural(top, 'vote')}${leaders.length > 1 ? ' each' : ''} (+1)`;
    }
    if (mode === 'hot-seat') {
      if (result.answer === 'pass')
        return `${display(data.spotlight)} passed. No points this round.`;
      const option = result.answer === 'a' ? data.options[0] : data.options[1];
      const right = Object.entries(result.points).filter(([, points]) => points > 0).length;
      return `${display(data.spotlight)} chose ${result.answer?.toUpperCase()} · ${option}. ${plural(right, 'correct prediction')}.`;
    }
    const answer = result.choices[data.spotlight];
    return `${display(data.spotlight)} ${answer === 'share' ? 'spilled (+1)' : answer === 'chill' ? 'chilled (+1)' : 'passed (no point)'}.`;
  })();

  return (
    <div className="table-layout stable-game-table">
      <PlayerStrip
        {...props}
        playerCaption={(player) =>
          `${plural(player.score, 'point')}${data.submitted.includes(player.id) && !result ? ' · locked in' : ''}`
        }
      />
      <section className="party-table" data-mode={mode} aria-label={`${title} table`}>
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
          <Avatar name={spotlightName} seed={spotlight?.avatar} />
          <span>
            {/* In Most Likely the spotlight seat only paces the round; the question is about everyone. */}
            <small>
              {mode === 'most-likely'
                ? 'Round host · reveals the next prompt'
                : mode === 'hot-seat'
                  ? 'In the hot seat'
                  : 'In the spotlight'}
            </small>
            <strong>
              {spotlightName}
              {isSpotlight ? ' · you' : ''}
            </strong>
          </span>
        </div>
        <div className="party-prompt">
          <Sparkles size={28} aria-hidden="true" />
          <h2>{data.prompt}</h2>
          {/* The options list once: as choice buttons while you choose, here otherwise. */}
          {mode === 'hot-seat' && (result || !match.actions.length) ? (
            <div className="party-options" aria-label="Preference options">
              {data.options.map((option, i) => (
                <p key={option} data-answer={result?.answer === (i === 0 ? 'a' : 'b')}>
                  <b>{i === 0 ? 'A' : 'B'}</b>
                  {option}
                </p>
              ))}
            </div>
          ) : null}
        </div>
        <DecisionDock
          // A new phase or round starts at the top: a reveal never opens part-way down.
          key={`${data.round}:${match.phase}`}
          className="party-decision-workspace"
          size="fit"
          label="Party choices and reveal"
          pending={pending}
        >
          {result ? (
            <div className="party-reveal" aria-live="polite">
              <h3>{headline}</h3>
              <div className="party-reveal__list">
                {revealed.map((player) => {
                  const seat = member(player.id);
                  const choice = result.choices[player.id];
                  const points = result.points[player.id];
                  const hotSeat = mode === 'hot-seat' && player.id === data.spotlight;
                  return (
                    <div
                      key={player.id}
                      className="party-reveal__row"
                      data-leader={mode === 'most-likely' && points > 0}
                    >
                      <Avatar name={seatName(seat)} seed={seat?.avatar} size="sm" />
                      <span className="party-reveal__identity">
                        <strong>{display(player.id)}</strong>
                        <small>
                          {mode === 'most-likely'
                            ? choice === 'pass'
                              ? 'passed'
                              : `voted for ${choice === selfId ? 'you' : choiceLabel(choice)}`
                            : mode === 'hot-seat'
                              ? hotSeat
                                ? `Hot seat answer: ${choiceLabel(choice)}`
                                : `Predicted ${choiceLabel(choice)}`
                              : choiceLabel(choice)}
                        </small>
                      </span>
                      {mode === 'most-likely' ? (
                        <span className="party-tally">
                          {plural(result.tallies[player.id] || 0, 'vote')}
                        </span>
                      ) : null}
                      <b className="party-earned">
                        {hotSeat ? 'answer' : points ? `+${points}` : '0'}
                      </b>
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
                <div data-decision-actions>
                  <Button onClick={() => onAction(next.value)} disabled={blocked}>
                    {next.label}
                  </Button>
                </div>
              ) : match.phase !== 'finished' ? (
                <p className="small muted">{spotlightName} can reveal the next prompt.</p>
              ) : null}
            </div>
          ) : (
            <div className="party-decisions">
              <p>{data.ownChoice ? 'You’re locked in.' : instruction}</p>
              {mode !== 'spill-or-chill' ? (
                <p className="small muted party-waiting" aria-live="polite">
                  {data.submitted.length} of {match.players.length} locked in
                  {waitingFor.length && data.ownChoice
                    ? ` · waiting for ${nameList(waitingFor, 4)}`
                    : waitingFor.length && pendingIds.length !== match.players.length
                      ? ` · still choosing: ${nameList(waitingFor, 4)}`
                      : ''}
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
                        title={
                          option.value.target ? playerName(room, option.value.target) : undefined
                        }
                        disabled={blocked}
                        onClick={() => setSelected(key(option))}
                      >
                        {option.value.target ? (
                          <Avatar
                            name={seatName(member(option.value.target))}
                            seed={member(option.value.target)?.avatar}
                            size="sm"
                          />
                        ) : null}
                        <span className="party-choice__label">{label(option)}</span>
                        {option.value.target && member(option.value.target)?.isBot ? (
                          <span className="party-choice__badge">Bot</span>
                        ) : null}
                      </Button>
                    ))}
                  </div>
                  <div className="party-commit-bar" data-decision-actions>
                    <p className="small party-commit-note" aria-live="polite">
                      {selectedOption
                        ? `${pending ? 'Saving' : 'Selected'}: ${label(selectedOption)}${pending ? '…' : '. Not locked in yet.'}`
                        : 'Choose an option, then lock it in.'}
                    </p>
                    <Button
                      className="party-commit"
                      disabled={blocked || !selectedOption}
                      pending={pending}
                      onClick={() => {
                        // Keep the choice selected until the saved round shows it as locked in.
                        if (selectedOption) onAction(selectedOption.value);
                      }}
                    >
                      <MessageCircle size={17} aria-hidden="true" />
                      {selected === 'pass' ? 'Confirm pass' : 'Lock in my choice'}
                    </Button>
                  </div>
                </>
              ) : null}
            </div>
          )}
        </DecisionDock>
      </section>
    </div>
  );
}
