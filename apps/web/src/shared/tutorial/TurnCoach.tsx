'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, BookOpen, GraduationCap, RotateCcw, X } from 'lucide-react';
import type { Action, Room } from '@games/api-client';
import { Button, dealCardInstructions } from '@games/ui';
import {
  advancePractice,
  beginPractice,
  loadPractice,
  offeredMove,
  practiceDirection,
  practiceMoves,
} from './coach-state';
import { tutorialLessons } from './lessons';
import { focusMove } from './focus-move';
import { fourDrop } from './four-drop';
import { boardDirection } from './board-direction';
import { organiserDirection } from './organiser-direction';
import { cardPracticeHint, cardPracticeMove } from './card-hint';
import { casinoDirection } from './casino-direction';

type CommittedMove = Room['activity'][number];

interface CoachProps {
  room: Room;
  selfId: string;
  pending: boolean;
  offline?: boolean;
  botFailed?: boolean;
  onAction: (action: Action) => void;
  onExit: () => void;
  onRules: () => void;
  describeMove: (room: Room, event: CommittedMove, selfId: string) => string;
}

const positions = ['Where you are', 'What is shifting', 'Your next move'];

const spread = [
  [
    'Pick your first card',
    'Tap any face-down card to reveal where you are now. One tap turns it over.',
  ],
  [
    'Pick your second card',
    'Browse the deck, then tap any card to reveal what is shifting.',
  ],
  [
    'Pick your third card',
    'Tap your final card to reveal a possible next move.',
  ],
] as const;

export function TurnCoach({
  room,
  selfId,
  pending,
  offline = false,
  botFailed = false,
  onAction,
  onExit,
  onRules,
  describeMove,
}: CoachProps) {
  const panel = useRef<HTMLElement>(null);
  const [above, setAbove] = useState(false);
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    const element = panel.current;
    if (!element) return;
    // A fast return to the guide can leave older intersection records queued in
    // mobile Safari. Use current geometry for scrolling and for layout changes.
    const measure = () => setAbove(element.getBoundingClientRect().bottom <= 0);
    const observer =
      typeof IntersectionObserver === 'function' ? new IntersectionObserver(measure) : undefined;
    observer?.observe(element);
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure);
    measure();
    return () => {
      observer?.disconnect();
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, []);
  const key = `games:tutorial:progress:${room.matchId}:${selfId}`;
  const version = room.matchVersion ?? 0;
  const [previous, setPrevious] = useState(() => loadPractice(key, version));
  const progress = advancePractice(previous, room, selfId);
  if (progress !== previous) setPrevious(progress);
  useEffect(() => {
    try {
      window.sessionStorage.setItem(key, JSON.stringify(progress));
    } catch {
      // Environments without storage retain progress for the current page.
    }
  }, [key, progress]);
  const submitting = useRef(false);
  useEffect(() => {
    if (!pending) submitting.current = false;
  }, [pending, version, offline, room.paused]);

  const match = room.game;
  const lesson = tutorialLessons[room.gameId];
  if (!match || !lesson) return null;
  const tarot = room.gameId === 'tarot';
  const count = tarot ? Math.min(match.community.length, practiceMoves) : progress.moves;
  const complete = (tarot && count === practiceMoves) || room.status === 'finished';
  const floating = above && !muted && !complete;
  const playOn = !tarot && !complete && count >= practiceMoves;
  const blocked = offline || room.paused || pending;
  const tactical = fourDrop(match) ?? boardDirection(match) ?? organiserDirection(match);
  const suggested = tactical?.option ?? cardPracticeMove(match) ?? offeredMove(match, lesson);
  const casino = casinoDirection(match, suggested, selfId);
  const option = casino?.option ?? suggested;
  const direction = option && practiceDirection(option, match);
  const current = room.members.find((member) => member.id === match.currentPlayer);
  const events = room.activity.filter((event) => event.version > progress.start);
  const mine = events.findLast((event) => event.actorId === selfId);
  const bot = events.findLast(
    (event) =>
      event.version > (mine?.version ?? progress.start) &&
      room.members.some((member) => member.id === event.actorId && member.isBot),
  );
  const confirmed = mine ?? bot;
  const draft =
    room.gameId === 'azul' && mine?.type === 'place_tiles'
      ? events.find(
          (event) =>
            event.version === mine.version - 1 &&
            event.actorId === selfId &&
            event.type === 'draft_tiles',
        )
      : undefined;
  const lastCard = tarot ? match.community.at(-1) : null;
  const explain = (type: string, effect?: string) => {
    const printed =
      room.gameId.startsWith('deal') && type === 'play' && effect
        ? dealCardInstructions[effect]
        : undefined;
    return printed || lesson.actions[type];
  };
  let title: string;
  let explanation: string;
  if (offline || room.paused || pending) {
    title = offline
      ? 'Reconnect to play'
      : room.paused
        ? 'The table is paused'
        : 'Saving your move…';
    explanation = offline || room.paused ? 'Your practice will resume from this position.' : '';
  } else if (complete) {
    const readingReady = tarot && match.phase === 'finished';
    title = tarot
      ? readingReady
        ? 'Your reading is ready'
        : 'Your spread is ready'
      : 'Practice game complete';
    explanation = readingReady
      ? 'Read each card in its spread position, then explore the connections in your saved reading.'
      : tarot
        ? 'Read the spread from left to right. Add a question or astrology if you like, then choose Read my cards when you want your interpretation.'
        : match.message;
  } else if (tarot) {
    [title, explanation] = spread[count];
  } else if (direction && option) {
    title = direction.title;
    explanation =
      tactical?.tip ||
      casino?.tip ||
      cardPracticeHint(match, option, room, selfId) ||
      explain(
        option.value.type,
        match.hand.find((card) => card.id === option.value.card)?.effect,
      ) ||
      match.message;
    if (!tactical && match.id === 'four-in-a-row' && count > 0) {
      const themes = [
        'Look for three discs of either colour across, vertically or on a diagonal. An open fourth space is a threat only if a disc can land there.',
        'Before dropping, look one square above its landing spot. Your disc will make that square available to the other player.',
        'Look on both sides of a gap. A disc can join two short stretches of your colour into one line.',
      ];
      explanation = themes[(count - 1) % themes.length];
    }
  } else {
    title = current?.isBot
      ? `${current.name}’s turn`
      : room.botPending
        ? 'The bot is playing'
        : 'Waiting for the table';
    explanation = botFailed
      ? 'Choose Retry bot moves to continue.'
      : room.botPending || current?.isBot
        ? 'Watch the reply. Your next choice appears when it is ready.'
        : match.message;
    if (botFailed) title = 'The bot needs another try';
  }
  const canPlay = !complete && !blocked && !tarot && !!direction?.direct;
  const confirmedRule = confirmed && explain(confirmed.type, confirmed.cards[0]?.effect);
  // At the table, lead with the decision that is currently available. Keep a
  // revealed Tarot card paired with its actual spread position as the player picks again.
  const floatingCard = !blocked && lastCard ? `${lastCard.label} · ${positions[count - 1]}` : '';
  return (
    <>
      <section
        ref={panel}
        tabIndex={-1}
        className="turn-coach"
        aria-label="Tutorial coach"
        data-state={blocked ? 'paused' : complete ? 'complete' : option ? 'playing' : 'waiting'}
      >
        <div className="turn-coach__top">
          <span className="turn-coach__progress">
            <GraduationCap size={18} aria-hidden="true" />
            {complete
              ? 'Tutorial'
              : playOn
                ? `Guided move ${count + 1}`
                : `${tarot ? 'Card' : 'Guided move'} ${count + 1} of ${practiceMoves}`}
          </span>
          <div className="turn-coach__tools">
            <Button
              size="icon"
              variant="ghost"
              onClick={onRules}
              aria-label="Illustrated rules"
              title="Illustrated rules"
            >
              <BookOpen size={17} />
            </Button>
            {playOn ? (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  aria-label="Restart guided steps"
                  title="Restart guided steps in this match"
                  onClick={() => setPrevious(beginPractice(version))}
                >
                  <RotateCcw size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={onExit}>
                  Finish tutorial
                </Button>
              </>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                onClick={onExit}
                aria-label="Close tutorial"
                title="Close tutorial"
              >
                <X size={17} />
              </Button>
            )}
          </div>
        </div>
        <div
          className="turn-coach__body"
          aria-live={floating ? 'off' : 'polite'}
          aria-atomic="true"
        >
          {count === 0 && !complete && lesson.goal ? (
            <p className="turn-coach__goal">{lesson.goal}</p>
          ) : null}
          {!canPlay ? <h2>{title}</h2> : null}
          {explanation && explanation !== title ? <p>{explanation}</p> : null}
        </div>
        {!blocked && complete ? (
          <div className="turn-coach__action">
            <Button size="sm" onClick={onExit}>
              {tarot ? 'Continue to spread' : 'Finish tutorial'}
            </Button>
          </div>
        ) : !blocked && option ? (
          <div className="turn-coach__action">
            {canPlay ? (
              <Button
                size="sm"
                onClick={() => {
                  if (submitting.current || navigator.onLine === false) return;
                  submitting.current = true;
                  onAction(option.value);
                }}
              >
                {direction.title}
              </Button>
            ) : (
              <a
                className="button button--secondary button--sm"
                href="#tutorial-game-table"
                onClick={(event) => {
                  const table = document.getElementById('tutorial-game-table');
                  if (!table) return;
                  event.preventDefault();
                  focusMove(table, match, option);
                }}
              >
                {tarot ? 'Go to cards' : 'Go to table'} <ArrowDown size={15} aria-hidden="true" />
              </a>
            )}
          </div>
        ) : null}
        {lastCard || confirmed ? (
          <div
            className="turn-coach__feedback"
            aria-label="Move explained"
            aria-live={floating ? 'off' : 'polite'}
          >
            {lastCard ? (
              <p>
                <strong>{lastCard.label}</strong> · {positions[count - 1]}
              </p>
            ) : confirmed ? (
              <>
                <p>
                  {draft && <span>{describeMove(room, draft, selfId)} → </span>}
                  <strong>{describeMove(room, confirmed, selfId)}</strong>
                </p>
                {confirmedRule && confirmedRule !== explanation ? <p>{confirmedRule}</p> : null}
                {mine && bot ? <p>{describeMove(room, bot, selfId)}</p> : null}
              </>
            ) : null}
          </div>
        ) : null}
      </section>
      {floating ? (
        <aside className="turn-coach-float" aria-label="Tutorial tip">
          <div className="turn-coach-float__content" aria-live="polite" aria-atomic="true">
            <strong>{title}</strong>
            {floatingCard ? <span>{floatingCard}</span> : null}
          </div>
          <div className="turn-coach-float__tools">
            <Button
              size="icon"
              variant="ghost"
              aria-label="Back to full guide"
              title="Back to full guide"
              onClick={() => {
                panel.current?.scrollIntoView({ block: 'start' });
                panel.current?.focus({ preventScroll: true });
              }}
            >
              <ArrowUp size={16} />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              aria-label="Hide floating tip"
              title="Hide floating tip"
              onClick={() => setMuted(true)}
            >
              <X size={16} />
            </Button>
          </div>
        </aside>
      ) : null}
    </>
  );
}
