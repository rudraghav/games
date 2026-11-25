'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Flag, Shuffle } from 'lucide-react';
import { Button } from '@games/ui';
import { santaDetails, type SantaDetails } from '@games/api-client';
import { gamePath } from '@/shared/game-paths';
import type { TableProps } from '../types';
import { canDo, describeChange } from './santa-actions';
import { useSantaOutbox } from './santa-outbox';
import { SantaConfirm } from './SantaConfirm';
import { SantaEventCard } from './SantaEventCard';
import { SantaGroups } from './SantaGroups';
import { SantaLinks } from './SantaLinks';
import { SantaPassPhone } from './SantaPassPhone';
import { SantaPeople, PersonRules } from './SantaPeople';

function readDetails(detail: TableProps['match']['detail']): SantaDetails | null {
  try {
    return santaDetails(detail);
  } catch {
    // A view that is not exactly the organiser's contract is not shown at all.
    return null;
  }
}

const INTRO: Record<string, { step: string; text: string }> = {
  setup: {
    step: 'Step 1 of 2: set up',
    text: 'Add everyone taking part, say who can’t draw whom, then draw names. Nobody draws their own name.',
  },
  drawn: {
    step: 'Step 2 of 2: share the links',
    text: 'Names are drawn. Only each person can see who they drew.',
  },
  finished: {
    step: 'Finished',
    text: 'This Secret Santa is finished and the links keep working. Only each person can see who they drew.',
  },
};

/**
 * The organiser's page. One person sets up the event, the people and who must
 * not draw whom, then draws names and hands out a private link per person.
 * The organiser never sees the assignment: the only name this page can show is
 * the one draw the server marks as `showing` during a pass-the-phone reveal.
 */
export function SecretSantaTable({ match, room, selfId, onAction, pending }: TableProps) {
  const detail = useMemo(() => readDetails(match.detail), [match.detail]);
  const paused = room.paused;
  const { send, waiting, problem, settling } = useSantaOutbox({
    match,
    version: room.matchVersion,
    pending,
    paused,
    onAction,
  });
  const [notice, setNotice] = useState('');
  const [confirm, setConfirm] = useState<'draw' | 'redraw' | 'finish' | null>(null);
  // Pass the phone: who was picked here, who confirmed they hold it, and a hide in progress.
  const [handover, setHandover] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [hiding, setHiding] = useState(false);
  const opener = useRef<string | null>(null);

  // Say what the server stored whenever the saved view changes.
  const [seen, setSeen] = useState({ version: room.matchVersion, detail, phase: match.phase });
  if (seen.version !== room.matchVersion || seen.phase !== match.phase) {
    setSeen({ version: room.matchVersion, detail, phase: match.phase });
    const message =
      seen.detail && detail
        ? describeChange({ ...seen.detail, phase: seen.phase }, { ...detail, phase: match.phase })
        : null;
    if (message) setNotice(message);
  }
  // A refused move undoes the optimistic steps of a reveal and is said once.
  const [problems, setProblems] = useState(problem.count);
  if (problems !== problem.count) {
    setProblems(problem.count);
    setNotice(problem.message);
    setConfirmed(null);
    setHandover(null);
    setHiding(false);
  }
  const showing = detail?.showing ?? null;
  if (hiding && !showing) setHiding(false);
  const picked = detail?.people.find((person) => person.id === handover) ?? null;
  if (handover && !showing && !picked) setHandover(null);
  const passing = Boolean(showing || picked);
  const wasPassing = useRef(passing);
  useEffect(() => {
    // When the card closes, focus returns to the button that opened it.
    if (wasPassing.current && !passing && opener.current)
      document.getElementById(`santa-show-${opener.current}`)?.focus({ preventScroll: true });
    wasPassing.current = passing;
  }, [passing]);

  if (!detail)
    return (
      <div className="santa-table" data-phase="unavailable">
        <p className="error-note" role="alert">
          This page couldn’t be shown safely. Refresh to try again.
        </p>
      </div>
    );

  const phase = match.phase in INTRO ? match.phase : 'setup';
  // Back at the list after a draw: say what happened to the links already sent.
  const intro =
    phase === 'setup' && detail.drawNumber > 0
      ? {
          step: INTRO.setup.step,
          text: 'The earlier draw is cancelled and its links no longer work. Change what you need, then draw again.',
        }
      : INTRO[phase];
  const scope = `santa:${room.id}:${room.matchId}`;
  const busy = pending || settling || waiting.length > 0;
  const count = detail.people.length;
  const canDraw = canDo(match, 'draw');
  const canRedraw = canDo(match, 'redraw');
  const canFinish = canDo(match, 'finish');
  const drawNote = canDraw
    ? `Ready to draw for ${count} people. Nobody will draw their own name.`
    : detail.blocked || (phase === 'setup' ? 'Add more people before you draw names.' : '');
  function hide() {
    // The name leaves the screen at once, whatever the network does next.
    // A reveal that is still on its way is hidden as soon as it lands.
    const sent = Boolean(showing) || (handover !== null && confirmed === handover);
    setConfirmed(null);
    setHandover(null);
    if (sent) {
      setHiding(Boolean(showing));
      send({ type: 'hide' });
      setNotice('Hidden. No name is on screen.');
    }
  }
  return (
    <div className="santa-table" data-phase={phase} data-busy={busy || undefined}>
      <header className="santa-intro">
        <p className="eyebrow">{intro.step}</p>
        <h2 className="heading-md">{detail.title || 'Your Secret Santa'}</h2>
        <p className="muted">{intro.text}</p>
      </header>
      <p className="santa-status santa-status--page small" role="status" aria-atomic="true">
        {paused ? 'Changes are paused until you reconnect.' : passing ? '' : notice}
      </p>
      {passing ? (
        <SantaPassPhone
          giverName={showing?.giverName ?? picked?.name ?? ''}
          recipientName={
            showing && confirmed === showing.giver && !hiding ? showing.recipientName : null
          }
          step={
            showing
              ? hiding
                ? 'hiding'
                : confirmed === showing.giver
                  ? 'shown'
                  : 'handover'
              : confirmed === handover
                ? 'waiting'
                : 'handover'
          }
          paused={paused}
          onConfirm={() => {
            if (showing) return setConfirmed(showing.giver);
            if (!picked) return;
            setConfirmed(picked.id);
            send({ type: 'reveal', target: picked.id });
          }}
          onHide={hide}
        />
      ) : null}
      <div className="santa-layout" hidden={passing}>
        <SantaEventCard
          detail={detail}
          match={match}
          scope={scope}
          busy={busy}
          paused={paused}
          send={send}
        />
        {phase === 'setup' ? (
          <>
            <SantaPeople
              detail={detail}
              match={match}
              scope={scope}
              waitingNames={waiting.filter((intent) => intent.type === 'add_name').length}
              paused={paused}
              send={send}
              onNotice={setNotice}
            />
            <SantaGroups detail={detail} match={match} scope={scope} paused={paused} send={send} />
            <section className="santa-draw" aria-labelledby="santa-draw-title">
              <h3 id="santa-draw-title" className="sr-only">
                Draw names
              </h3>
              <Button
                id="santa-draw-button"
                size="lg"
                disabled={!canDraw || paused}
                aria-describedby="santa-draw-note"
                onClick={() => setConfirm('draw')}
              >
                <Shuffle size={18} aria-hidden="true" />
                Draw names
              </Button>
              <p
                id="santa-draw-note"
                className="santa-draw__note"
                data-blocked={!canDraw || undefined}
              >
                {drawNote}
              </p>
            </section>
          </>
        ) : (
          <>
            <SantaLinks
              detail={detail}
              match={match}
              room={room}
              selfId={selfId}
              paused={paused}
              onShow={(personId) => {
                opener.current = personId;
                setConfirmed(null);
                setHandover(personId);
              }}
            />
            <section className="santa-card santa-rules" aria-labelledby="santa-rules-title">
              <div className="santa-card__heading">
                <h3 id="santa-rules-title">Who can’t draw whom</h3>
              </div>
              {detail.pairs.length || detail.groups.length ? (
                <ul className="santa-rule-list">
                  {detail.people.map((person) => (
                    <li key={person.id}>
                      <strong>{person.name}</strong>
                      <PersonRules detail={detail} person={person} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="small muted">No rules: anyone could draw anyone else.</p>
              )}
            </section>
            <section className="santa-after" aria-label="Change or finish">
              {canRedraw ? (
                <div>
                  <Button
                    variant="secondary"
                    disabled={paused}
                    onClick={() => setConfirm('redraw')}
                  >
                    <Shuffle size={17} aria-hidden="true" />
                    Redraw
                  </Button>
                  <p className="small muted">
                    Go back to change the list, then draw again. The links stop working.
                  </p>
                </div>
              ) : null}
              {canFinish ? (
                <div>
                  <Button
                    variant="secondary"
                    disabled={paused}
                    onClick={() => setConfirm('finish')}
                  >
                    <Flag size={17} aria-hidden="true" />
                    Finish
                  </Button>
                  <p className="small muted">Closes the event. The links keep working.</p>
                </div>
              ) : null}
              {phase === 'finished' ? (
                <div>
                  <Link
                    href={gamePath(room.gameId)}
                    className="button button--secondary button--md"
                  >
                    Organise another draw
                  </Link>
                  <p className="small muted">This one stays under Your games on the home page.</p>
                </div>
              ) : null}
            </section>
          </>
        )}
      </div>
      {confirm === 'draw' ? (
        <SantaConfirm
          title={`Draw names for ${count} people?`}
          description="You can redraw later, which makes new links."
          confirm="Draw names"
          onConfirm={() => {
            send({ type: 'draw' });
            setConfirm(null);
          }}
          onClose={() => setConfirm(null)}
        />
      ) : confirm === 'redraw' ? (
        <SantaConfirm
          title="Redraw the names?"
          description="You go back to the list, where you can change people and rules before you draw again. The links you already shared stop working straight away, and everyone gets a new one after the new draw."
          confirm="Go back and redraw"
          cancel="Keep this draw"
          danger
          onConfirm={() => {
            send({ type: 'redraw' });
            setConfirm(null);
          }}
          onClose={() => setConfirm(null)}
        />
      ) : confirm === 'finish' ? (
        <SantaConfirm
          title="Finish this Secret Santa?"
          description="The links keep working. You won’t be able to change the details or redraw."
          confirm="Finish"
          onConfirm={() => {
            send({ type: 'finish' });
            setConfirm(null);
          }}
          onClose={() => setConfirm(null)}
        />
      ) : null}
    </div>
  );
}
