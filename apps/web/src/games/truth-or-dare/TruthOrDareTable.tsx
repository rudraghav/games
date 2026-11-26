'use client';

import { Flame, MessageCircle, Repeat2, Zap } from 'lucide-react';
import { Button, DecisionDock } from '@games/ui';
import {
  truthOrDareDetails,
  type TruthOrDareCandidate,
  type TruthOrDareDetails,
  type TruthOrDareKind,
} from '@games/api-client';
import type { TableProps } from '../types';
import { PlayerStrip } from '../shared/PlayerStrip';
import { useTableDraft } from '../shared/table-draft';
import { seatName } from '../shared/seat-names';
import { assignOption, chooseFate, emptyFates, type FateDraft } from './fate-assignment';

const plural = (count: number, one: string, many = `${one}s`) =>
  `${count} ${count === 1 ? one : many}`;

/** Each kind is named in words and drawn with its own icon, never by colour alone. */
const kinds: Record<TruthOrDareKind, { label: string; Icon: typeof Flame }> = {
  truth: { label: 'Truth', Icon: MessageCircle },
  dare: { label: 'Dare', Icon: Zap },
  burning: { label: 'Burning building', Icon: Flame },
};

/** The badge a room with the 18+ edition carries on its table and in its lobby. */
export function AdultsBadge() {
  return (
    <span className="adults-badge" title="Naughty edition (18+)">
      18+
    </span>
  );
}

export function TruthOrDareTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = truthOrDareDetails(match.detail);
  const blocked = pending || room.paused;
  const member = (id: string) => room.members.find((item) => item.id === id);
  // One name per seat: bots drop "Bot" (the seat badge marks them); the viewer is "You".
  const display = (id: string) => (id === selfId ? 'You' : seatName(member(id)));
  const candidateName = (candidate: TruthOrDareCandidate) =>
    candidate.player ? seatName(member(candidate.player)) : (candidate.label ?? '');
  const of = (type: string) => match.actions.filter((option) => option.value.type === type);
  const picks = of('pick');
  const done = of('done')[0];
  const skip = of('skip')[0];
  const swap = of('swap')[0];
  const next = of('next')[0];
  const assigning = of('assign').length > 0;
  const current = match.currentPlayer;
  const prompt = data.prompt;
  const result = data.lastResult;
  const round = current ? Math.min(data.turnsTaken[current] + 1, data.turnsPerPlayer) : null;
  const swapsLeft = data.swapsLeft[selfId] ?? 0;
  const bots = room.members.some((seat) => seat.isBot && seat.seated);

  return (
    <div className="table-layout stable-game-table truth-or-dare-game">
      <PlayerStrip
        {...props}
        playerCaption={(player) => {
          const left = Math.max(0, data.turnsPerPlayer - (data.turnsTaken[player.id] ?? 0));
          return `${plural(data.scores[player.id] ?? player.score, 'point')} · ${
            left ? `${plural(left, 'turn')} left` : 'no turns left'
          }`;
        }}
      />
      <section className="tod-table" aria-label="Truth or Dare table">
        <div className="tod-topline">
          <span className="small muted">
            {match.phase === 'finished'
              ? `All ${plural(data.turnsPerPlayer, 'turn')} played`
              : round
                ? `Round ${round} of ${data.turnsPerPlayer}`
                : null}
          </span>
          {data.edition === 'naughty' ? <AdultsBadge /> : null}
        </div>
        {prompt ? (
          <PromptCard
            data={data}
            playerName={display(prompt.player)}
            candidateName={candidateName}
            selfTurn={prompt.player === selfId}
          />
        ) : match.phase === 'result' && result ? (
          // The three fates are the table's centrepiece until the player moves on.
          <ResultPanel
            data={data}
            name={display(result.player)}
            candidateName={candidateName}
            latest
          />
        ) : (
          <WaitingCard
            name={current ? display(current) : null}
            finished={match.phase === 'finished'}
          />
        )}
        {result && !prompt && match.phase !== 'result' ? (
          <ResultPanel
            data={data}
            name={display(result.player)}
            candidateName={candidateName}
            latest={false}
          />
        ) : null}
        {bots ? <p className="small muted tod-bot-note">Bot turns are simulated.</p> : null}
        {match.actions.length ? (
          <DecisionDock
            // A new prompt or phase starts at the top of the dock.
            key={`${match.phase}:${room.matchVersion}`}
            className="tod-dock"
            size="fit"
            label="Your Truth or Dare choices"
            pending={pending}
          >
            {picks.length ? (
              <div className="tod-picks" data-decision-actions="">
                {picks.map((option, index) => {
                  const kind = kinds[option.value.choice as TruthOrDareKind];
                  const Icon = kind?.Icon ?? MessageCircle;
                  return (
                    <Button
                      key={option.value.choice}
                      // One filled choice: the first one offered.
                      variant={index === 0 ? 'primary' : 'secondary'}
                      className="tod-pick"
                      disabled={blocked}
                      onClick={() => onAction(option.value)}
                    >
                      <Icon size={18} aria-hidden="true" />
                      {option.label}
                    </Button>
                  );
                })}
              </div>
            ) : null}
            {done || skip ? (
              <div className="tod-answer" data-decision-actions="">
                {done ? (
                  <Button disabled={blocked} onClick={() => onAction(done.value)}>
                    {done.label}
                  </Button>
                ) : null}
                {skip ? (
                  <Button
                    variant="secondary"
                    disabled={blocked}
                    onClick={() => onAction(skip.value)}
                  >
                    {skip.label}
                  </Button>
                ) : null}
              </div>
            ) : null}
            {assigning && prompt?.candidates ? (
              <FateAssignment
                key={`${room.matchId}:${room.matchVersion}`}
                {...props}
                data={data}
                candidateName={candidateName}
              />
            ) : null}
            {swap || done || assigning ? (
              <div className="tod-swap">
                {swap ? (
                  <Button variant="ghost" disabled={blocked} onClick={() => onAction(swap.value)}>
                    <Repeat2 size={17} aria-hidden="true" />
                    {swap.label}
                  </Button>
                ) : null}
                <span className="small muted">
                  {swapsLeft ? '1 swap left in the match' : 'No swaps left'}
                </span>
              </div>
            ) : null}
            {next ? (
              <div className="tod-next" data-decision-actions="">
                <Button disabled={blocked} onClick={() => onAction(next.value)}>
                  {next.label}
                </Button>
              </div>
            ) : null}
          </DecisionDock>
        ) : null}
      </section>
    </div>
  );
}

function PromptCard({
  data,
  playerName,
  candidateName,
  selfTurn,
}: {
  data: TruthOrDareDetails;
  playerName: string;
  candidateName: (candidate: TruthOrDareCandidate) => string;
  selfTurn: boolean;
}) {
  const prompt = data.prompt!;
  const { label, Icon } = kinds[prompt.kind];
  return (
    <article className="tod-card" data-kind={prompt.kind} aria-label={`${label} prompt`}>
      <header className="tod-card__head">
        <span className="tod-kind">
          <Icon size={18} aria-hidden="true" />
          {label}
        </span>
        <span className="small tod-card__by">
          {selfTurn ? 'Drawn by you' : `Drawn by ${playerName}`}
          {prompt.swapped ? <span className="tod-chip">Swapped</span> : null}
        </span>
      </header>
      {prompt.text ? <p className="tod-card__text">{prompt.text}</p> : null}
      {prompt.candidates ? (
        <>
          <p className="tod-card__text tod-card__text--burning">Three are in a burning building.</p>
          {/* The controls list the candidates while choosing; the card lists them for everyone else. */}
          {!selfTurn ? (
            <ol className="tod-candidates" aria-label="In the burning building">
              {prompt.candidates.map((candidate, index) => (
                <li key={index}>{candidateName(candidate)}</li>
              ))}
            </ol>
          ) : null}
        </>
      ) : null}
    </article>
  );
}

function WaitingCard({ name, finished }: { name: string | null; finished: boolean }) {
  return (
    <article className="tod-card tod-card--empty" aria-label="Next prompt">
      <span className="tod-kind tod-kind--muted">
        <Flame size={18} aria-hidden="true" />
        {finished ? 'Match over' : 'Next prompt'}
      </span>
      <p className="tod-card__text">
        {finished
          ? 'Everyone has had their turns.'
          : name === 'You'
            ? 'Truth, dare or burning building?'
            : `${name ?? 'The next player'} is choosing.`}
      </p>
    </article>
  );
}

function ResultPanel({
  data,
  name,
  candidateName,
  latest,
}: {
  data: TruthOrDareDetails;
  name: string;
  candidateName: (candidate: TruthOrDareCandidate) => string;
  latest: boolean;
}) {
  const result = data.lastResult!;
  const kind = kinds[result.kind].label.toLowerCase();
  const Icon = kinds[result.kind].Icon;
  const points = `(${result.points ? `+${result.points}` : '0'})`;
  const headline =
    result.outcome === 'passed'
      ? `${name} passed on the ${kind} ${points}`
      : result.outcome === 'assigned'
        ? `${name} chose three fates ${points}`
        : result.kind === 'truth'
          ? `${name} answered the truth ${points}`
          : `${name} did the dare ${points}`;
  return (
    <section
      className={latest ? 'tod-card tod-result tod-result--latest' : 'tod-result'}
      data-kind={result.kind}
      aria-label={latest ? 'Result' : 'Last turn'}
      aria-live="polite"
    >
      {latest ? (
        <span className="tod-kind">
          <Icon size={18} aria-hidden="true" />
          {kinds[result.kind].label}
        </span>
      ) : (
        <p className="small muted">Last turn</p>
      )}
      <h3>{headline}</h3>
      {result.text ? <p className="small tod-result__text">{result.text}</p> : null}
      {result.candidates && result.fates ? (
        <ul className="tod-fates" aria-label="Fates chosen">
          {result.candidates.map((candidate, index) => (
            <li key={index}>
              <span>{candidateName(candidate)}</span>
              <b>{data.fates[result.fates![index]]}</b>
            </li>
          ))}
        </ul>
      ) : result.candidates ? (
        <p className="small muted">No fates were given.</p>
      ) : null}
    </section>
  );
}

function FateAssignment({
  match,
  room,
  selfId,
  pending,
  onAction,
  data,
  candidateName,
}: TableProps & {
  data: TruthOrDareDetails;
  candidateName: (candidate: TruthOrDareCandidate) => string;
}) {
  const candidates = data.prompt!.candidates!;
  // The unsent fates belong to this prompt only and survive a refresh.
  const [draft, setDraft] = useTableDraft<FateDraft>(
    `truth-or-dare:${room.id}:${room.matchId}:${room.matchVersion}:${selfId}:fates`,
    emptyFates,
  );
  const option = assignOption(match.actions, draft);
  const chosen = draft.filter((fate) => fate !== null).length;
  const blocked = pending || room.paused;
  return (
    <div className="tod-assign">
      {candidates.map((candidate, row) => {
        const name = candidateName(candidate);
        return (
          <fieldset className="tod-fate-row" key={row} disabled={blocked}>
            <legend>{name}</legend>
            <div className="tod-fate-options">
              {data.fates.map((fate, index) => (
                <label key={fate} className="tod-fate">
                  <input
                    type="radio"
                    name={`tod-fate-${row}`}
                    value={index}
                    checked={draft[row] === index}
                    onChange={() => setDraft((old) => chooseFate(old, row, index))}
                  />
                  <span>{fate}</span>
                </label>
              ))}
            </div>
          </fieldset>
        );
      })}
      <div className="tod-assign__commit" data-decision-actions="">
        <p className="small muted" aria-live="polite">
          {option ? 'Each has a different fate.' : `${chosen} of 3 fates given`}
        </p>
        <Button disabled={blocked || !option} onClick={() => option && onAction(option.value)}>
          Confirm fates
        </Button>
      </div>
    </div>
  );
}
