'use client';
import { Button, WordTile, DecisionDock } from '@games/ui';
import { wordsDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { useTableDraft } from '../shared/table-draft';
import type { TableProps } from '../types';
import { playerName } from '../types';

const TEAMS = ['Red', 'Blue'] as const;
const TONES = ['coral', 'blue'] as const;
const IDENTITY: Record<string, string> = {
  coral: 'Red agent',
  blue: 'Blue agent',
  neutral: 'Bystander',
  assassin: 'Assassin',
};
const CLUE_PATTERN = /^[A-Za-z][A-Za-z'-]{0,31}$/;

type LastClue = { team: number; clue: string; count: number };
type LastReveal = { cell: string; word: string; player: string; identity: string };

/** Public turn history the engine adds beside the parsed details; read defensively. */
function history(detail: Record<string, unknown>) {
  const clue = detail.last_clue as Partial<LastClue> | null | undefined;
  const reveal = detail.last_reveal as Partial<LastReveal> | null | undefined;
  return {
    lastClue:
      clue && typeof clue.clue === 'string' && (clue.team === 0 || clue.team === 1)
        ? (clue as LastClue)
        : null,
    lastReveal:
      reveal && typeof reveal.word === 'string' && typeof reveal.cell === 'string'
        ? (reveal as LastReveal)
        : null,
    turnEnd: typeof detail.turn_end === 'string' ? detail.turn_end : null,
    winningTeam:
      detail.winning_team === 0 || detail.winning_team === 1 ? detail.winning_team : null,
  };
}

/** Why a clue can't be sent yet, in words, before the server has to say no. */
function clueProblem(clue: string, boardWords: string[]) {
  const word = clue.trim();
  if (!word) return 'One word, letters only.';
  if (/\s/.test(word)) return 'Use a single word, with no spaces.';
  if (!CLUE_PATTERN.test(word))
    return 'Use English letters only (an apostrophe or hyphen is fine).';
  if (boardWords.includes(word.toUpperCase()))
    return `${word.toUpperCase()} is still on the board. Choose another word.`;
  return null;
}

export function WordsTable(props: TableProps) {
  const { match, selfId, room, onAction, pending } = props;
  const data = wordsDetails(match.detail);
  const { lastClue, lastReveal, turnEnd, winningTeam } = history(match.detail);
  // Unsent clue and word choices survive a refresh, but only for this exact table version.
  const draft = `words:${room.id}:${room.matchId}:${room.matchVersion}`;
  const [clue, setClue] = useTableDraft(`${draft}:clue`, '');
  const [count, setCount] = useTableDraft(`${draft}:count`, 1);
  const [selected, setSelected] = useTableDraft<string | null>(`${draft}:word`, null);
  const clues = match.actions.filter((option) => option.value.type === 'clue');
  const guesses = new Map(
    match.actions
      .filter((option) => option.value.type === 'guess')
      .map((option) => [option.value.choice, option]),
  );
  const end = match.actions.find((option) => option.value.type === 'end_guesses');
  const selectedOption = selected ? guesses.get(selected) : null;
  const selectedWord = selected
    ? match.community.find((card) => card.id === selected)?.label
    : undefined;
  const blocked = pending || room.paused;
  const finished = match.phase === 'finished';
  const active = data.activeTeam;
  const activeName = TEAMS[active];
  const ownTeam = selfId in data.teams ? data.teams[selfId] : null;
  const role = ownTeam === null ? null : data.role;
  const myTurn = ownTeam === active;
  const spymaster = data.spymasters[active];
  const name = (id: string) => (id === selfId ? 'You' : playerName(room, id));
  const boardWords = match.community
    .filter((card) => card.subtitle !== 'revealed')
    .map((card) => card.label.toUpperCase());
  const problem = clues.length ? clueProblem(clue, boardWords) : null;
  const canGuess = role === 'operative' && match.phase === 'guess' && myTurn && guesses.size > 0;
  const outcome =
    turnEnd === 'stopped'
      ? 'they ended their guesses'
      : turnEnd === 'guesses'
        ? 'they used every guess'
        : 'the last word wasn’t theirs';
  const winnerName = winningTeam === null ? null : TEAMS[winningTeam];
  const finishReason =
    winningTeam === null || !lastReveal
      ? null
      : turnEnd === 'assassin'
        ? `${TEAMS[1 - winningTeam]} revealed the assassin, ${lastReveal.word.toUpperCase()}.`
        : turnEnd === 'gave_away'
          ? `${TEAMS[1 - winningTeam]} revealed ${winnerName}’s last agent, ${lastReveal.word.toUpperCase()}.`
          : `${winnerName} found every agent.`;
  const waiting = (() => {
    if (finished) return 'Game complete. The full key is shown.';
    if (role === 'spymaster') {
      if (!myTurn)
        return `${activeName} is ${match.phase === 'guess' ? 'guessing' : 'choosing a clue'}. Your team is next.`;
      return match.phase === 'guess'
        ? `Your operatives are guessing “${data.clue}”. Spymasters can’t guess or hint.`
        : null;
    }
    if (role === 'operative') {
      if (!myTurn)
        return `${activeName} is ${match.phase === 'guess' ? 'guessing' : 'waiting for a clue'}. The board unlocks on your team’s turn.`;
      return match.phase === 'clue' ? 'Waiting for your spymaster’s clue.' : null;
    }
    return `${activeName} is ${match.phase === 'guess' ? 'guessing' : 'choosing a clue'}.`;
  })();
  return (
    <div className="table-layout stable-game-table">
      <PlayerStrip
        {...props}
        playerCaption={(player) =>
          `${data.teams[player.id] === 0 ? 'Red' : 'Blue'} · ${data.spymasters.includes(player.id) ? 'Spymaster' : 'Operative'}`
        }
      />
      <section
        className="word-table"
        aria-label="Word Agents table"
        data-active-team={TONES[active]}
        data-phase={match.phase}
      >
        <div className="word-score">
          <span
            className="word-score__team"
            data-tone="coral"
            data-active={!finished && active === 0}
          >
            Red <b>{data.remaining[0]}</b> left
          </span>
          {role ? (
            <span className="word-role" data-tone={TONES[ownTeam!]}>
              You · {TEAMS[ownTeam!]} {role}
            </span>
          ) : null}
          <span
            className="word-score__team"
            data-tone="blue"
            data-active={!finished && active === 1}
          >
            Blue <b>{data.remaining[1]}</b> left
          </span>
        </div>
        <div className="word-clue" data-tone={TONES[winningTeam ?? active]}>
          {finished ? (
            <>
              <p className="eyebrow">Match over</p>
              <h2>{winnerName ? `${winnerName} team wins` : 'Game complete'}</h2>
              <p className="small word-guess-status">{finishReason || ' '}</p>
            </>
          ) : match.phase === 'guess' ? (
            <>
              <p className="eyebrow">
                {myTurn && role ? 'Your team’s clue' : `${activeName} team’s clue`}
              </p>
              <h2>
                {data.clue}
                <span>{data.clueCount}</span>
              </h2>
              <p className="small word-guess-status">
                {activeName} operatives are guessing · up to {data.guessesLeft} more{' '}
                {data.guessesLeft === 1 ? 'guess' : 'guesses'}
              </p>
            </>
          ) : (
            <>
              <p className="eyebrow">{activeName} team’s turn</p>
              <h2>
                {spymaster === selfId ? 'Give your clue' : `Waiting for ${name(spymaster)}’s clue`}
              </h2>
              <p className="small word-guess-status">
                {spymaster === selfId
                  ? 'Your operatives are waiting for you'
                  : `${activeName} spymaster is thinking`}
              </p>
            </>
          )}
        </div>
        {lastReveal || (lastClue && match.phase === 'clue') ? (
          <div className="word-last" aria-label="What just happened">
            {lastReveal ? (
              <p>
                <strong>{name(lastReveal.player)}</strong> chose{' '}
                <strong>{lastReveal.word.toUpperCase()}</strong>
                <span className="word-last__identity" data-tone={lastReveal.identity}>
                  {IDENTITY[lastReveal.identity] || 'Revealed'}
                </span>
              </p>
            ) : null}
            {lastClue && match.phase === 'clue' ? (
              <p className="small">
                {TEAMS[lastClue.team]}’s turn is over (clue “{lastClue.clue}” {lastClue.count}):{' '}
                {outcome}.
              </p>
            ) : null}
          </div>
        ) : null}
        {data.role === 'spymaster' && !finished ? (
          <p className="small word-key-note">
            Your spymaster key · ✓ marks words already found · Operatives can’t see these colours.
          </p>
        ) : null}
        <div
          className="word-board"
          role="group"
          aria-label="Word Agents grid"
          data-interactive={canGuess}
        >
          {match.community.map((card) => (
            <WordTile
              key={card.id}
              word={card.label}
              tone={card.color}
              revealed={card.subtitle === 'revealed'}
              last={lastReveal?.cell === card.id}
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
          size="fit"
          label="Word Agents decisions"
          pending={pending}
          data-acting={Boolean(clues.length || canGuess) || undefined}
        >
          {clues.length ? (
            <form
              className="clue-form"
              data-decision-actions
              onSubmit={(event) => {
                event.preventDefault();
                const option = clues.find((option) => option.value.amount === count);
                // The typed clue stays until the server accepts it (the version moves on).
                if (option && !problem) onAction({ ...option.value, choice: clue.trim() });
              }}
            >
              <label className="field">
                <span className="clue-form__label">Your one-word clue</span>
                <input
                  className="input"
                  maxLength={32}
                  value={clue}
                  onChange={(event) => setClue(event.target.value)}
                  placeholder="One word"
                  disabled={blocked}
                  aria-describedby="word-clue-help"
                  aria-invalid={Boolean(clue.trim() && problem)}
                  required
                />
              </label>
              <label className="field">
                <span className="clue-form__label">Words</span>
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
              <Button type="submit" disabled={blocked || Boolean(problem)}>
                Give clue
              </Button>
              <p
                id="word-clue-help"
                className="small word-clue-help"
                data-problem={Boolean(clue.trim() && problem)}
                aria-live="polite"
              >
                {pending && !problem
                  ? `Saving “${clue.trim()}” for ${count}…`
                  : problem ||
                    `Ready: “${clue.trim()}” for ${count}. Your team gets ${count + 1} guesses at most.`}
              </p>
            </form>
          ) : null}
          {canGuess ? (
            <div className="word-decisions" data-decision-actions>
              <p className="small word-decision-note" aria-live="polite">
                {pending && selectedWord
                  ? `Saving ${selectedWord.toUpperCase()}…`
                  : selectedWord
                    ? `${selectedWord.toUpperCase()} selected. Confirm when your team agrees.`
                    : `Any ${activeName} operative can choose. Agree on a word, then confirm.`}
              </p>
              <Button
                disabled={blocked || !selectedOption}
                onClick={() => {
                  // Keep the selection on screen until the saved move replaces it.
                  if (selectedOption) onAction(selectedOption.value);
                }}
              >
                Confirm {selectedWord || 'a word'}
              </Button>
              {end ? (
                <Button variant="secondary" disabled={blocked} onClick={() => onAction(end.value)}>
                  End guesses
                </Button>
              ) : null}
            </div>
          ) : null}
          {waiting ? <p className="small muted word-waiting">{waiting}</p> : null}
          {room.members.some((member) => member.isBot) && !finished ? (
            <p className="small muted">
              Bots understand category clues such as animals, music and travel.
            </p>
          ) : null}
        </DecisionDock>
      </section>
    </div>
  );
}
