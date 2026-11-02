'use client';
import { useState } from 'react';
import { Button, WordTile, DecisionDock } from '@games/ui';
import { wordsDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import type { TableProps } from '../types';

export function WordsTable(props: TableProps) {
  const { match, selfId, room, onAction, pending } = props;
  const data = wordsDetails(match.detail);
  const [clue, setClue] = useState('');
  const [count, setCount] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const clues = match.actions.filter((option) => option.value.type === 'clue');
  const guesses = new Map(
    match.actions
      .filter((option) => option.value.type === 'guess')
      .map((option) => [option.value.choice, option]),
  );
  const end = match.actions.find((option) => option.value.type === 'end_guesses');
  const selectedOption = selected ? guesses.get(selected) : null;
  const blocked = pending || room.paused;
  return (
    <div className="table-layout stable-game-table">
      <PlayerStrip
        {...props}
        playerCaption={(player) =>
          `${data.teams[player.id] === 0 ? 'Red' : 'Blue'} · ${data.spymasters.includes(player.id) ? 'Spymaster' : 'Operative'}`
        }
      />
      <section className="word-table" aria-label="Word Agents table">
        <div className="word-score">
          <span data-tone="coral">
            Red <b>{data.remaining[0]}</b> remaining
          </span>
          <span data-tone="blue">
            Blue <b>{data.remaining[1]}</b> remaining
          </span>
        </div>
        <div className="word-clue">
          <p className="eyebrow">{data.activeTeam === 0 ? 'Red' : 'Blue'} team</p>
          <h2>
            {data.clue || 'Waiting for a clue'}
            {data.clue ? <span>{data.clueCount}</span> : null}
          </h2>
          <p className="small muted word-guess-status" aria-hidden={match.phase !== 'guess'}>
            {match.phase === 'guess' ? (
              <>
                Up to {data.guessesLeft} more {data.guessesLeft === 1 ? 'guess' : 'guesses'}
              </>
            ) : (
              '\u00a0'
            )}
          </p>
        </div>
        {data.role === 'spymaster' && match.phase !== 'finished' ? (
          <p className="small word-key-note">
            Your spymaster key · Operatives cannot see these colours.
          </p>
        ) : null}
        <div className="word-board">
          {match.community.map((card) => (
            <WordTile
              key={card.id}
              word={card.label}
              tone={card.color}
              revealed={card.subtitle === 'revealed'}
              selected={selected === card.id}
              onClick={
                data.role === 'operative'
                  ? () => setSelected(selected === card.id ? null : card.id)
                  : undefined
              }
              disabled={blocked || !guesses.has(card.id)}
            />
          ))}
        </div>
        <DecisionDock
          className="word-action-dock"
          size="standard"
          label="Word Agents decisions"
          pending={pending}
        >
          {clues.length ? (
            <form
              className="clue-form"
              onSubmit={(event) => {
                event.preventDefault();
                const option = clues.find((option) => option.value.amount === count);
                if (option) {
                  onAction({ ...option.value, choice: clue.trim() });
                  setClue('');
                }
              }}
            >
              <label className="field">
                Your one-word clue
                <input
                  className="input"
                  maxLength={32}
                  value={clue}
                  onChange={(event) => setClue(event.target.value)}
                  placeholder="Enter one word"
                  disabled={blocked}
                  required
                />
              </label>
              <label className="field">
                Words
                <select
                  className="input"
                  value={count}
                  onChange={(event) => setCount(Number(event.target.value))}
                  disabled={blocked}
                >
                  {clues.map((option) => (
                    <option key={option.value.amount} value={option.value.amount}>
                      {option.value.amount}
                    </option>
                  ))}
                </select>
              </label>
              <Button
                type="submit"
                disabled={blocked || !/^[A-Za-z][A-Za-z'-]{0,31}$/.test(clue.trim())}
              >
                Give clue
              </Button>
            </form>
          ) : null}
          {room.members.some((member) => member.isBot) && match.phase !== 'finished' ? (
            <p className="small muted">
              Bots understand category clues such as animals, music and travel.
            </p>
          ) : null}
          {data.role === 'operative' &&
          match.phase === 'guess' &&
          data.teams[selfId] === data.activeTeam ? (
            <div className="word-decisions">
              <Button
                disabled={blocked || !selectedOption}
                onClick={() => {
                  if (selectedOption) onAction(selectedOption.value);
                  setSelected(null);
                }}
              >
                Confirm{' '}
                {selected ? match.community.find((card) => card.id === selected)?.label : 'a word'}
              </Button>
              {end ? (
                <Button
                  variant="secondary"
                  disabled={blocked}
                  onClick={() => {
                    onAction(end.value);
                    setSelected(null);
                  }}
                >
                  End guesses
                </Button>
              ) : null}
            </div>
          ) : null}
          {!clues.length && !selectedOption && !end ? (
            <p className="small muted">
              {match.phase === 'finished'
                ? 'Game complete.'
                : data.role === 'operative'
                  ? 'Choose an available word when your team is guessing.'
                  : 'Your team is using the clue.'}
            </p>
          ) : null}
        </DecisionDock>
      </section>
    </div>
  );
}
