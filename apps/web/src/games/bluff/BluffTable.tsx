'use client';

import { useState } from 'react';
import { Check, Eye, Layers, X } from 'lucide-react';
import { bluffDetails, bluffRanks, type Card } from '@games/api-client';
import { Button, CardPile, DecisionDock, Hand, PlayingCard } from '@games/ui';
import { playerName, type TableProps } from '../types';
import { PlayerStrip } from '../shared/PlayerStrip';
import { useTableDraft } from '../shared/table-draft';
import { repeatsNotice, turnState } from '../shared/turn-state';
import {
  cards,
  decisions,
  playLimit,
  playLine,
  rankName,
  rankPlural,
  suggestedRank,
  toggleCard,
} from './bluff-view';

type Draft = { cards: string[]; rank: string | null };
const EMPTY: Draft = { cards: [], rank: null };

export function BluffTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = bluffDetails(match.detail);
  const blocked = pending || room.paused;
  const name = (id: string) => (id === selfId ? 'You' : playerName(room, id));
  const takes = (id: string) => (id === selfId ? 'take' : 'takes');
  const reveal = match.phase === 'reveal' || match.phase === 'finished' ? data.reveal : null;

  const options = match.actions;
  const plays = options.filter((option) => option.value.type === 'play');
  const call = options.find((option) => option.value.type === 'call_bluff');
  const starting = plays.length > 1;
  const limit = playLimit(options);

  // The unsent choice belongs to this decision only: a new saved version clears it.
  const [draft, setDraft] = useTableDraft<Draft>(
    `bluff:${room.id}:${room.matchId ?? 'match'}:${room.matchVersion ?? 0}:${selfId}`,
    EMPTY,
  );
  const [full, setFull] = useState<{ version: number | null } | null>(null);
  const selected = draft.cards.filter((id) => match.hand.some((card) => card.id === id));
  const suggestion = starting ? suggestedRank(match.hand, selected) : null;
  const rank = starting ? (draft.rank ?? suggestion) : data.rank;
  const choices = decisions(options, rank, selected);
  const honest = data.rank ? match.hand.filter((card) => card.value === data.rank) : [];
  const limitShown = full?.version === room.matchVersion && selected.length >= limit;

  function select(card: Card) {
    const next = toggleCard(selected, card.id, limit);
    setFull(next.full ? { version: room.matchVersion } : null);
    setDraft((old) => ({ ...old, cards: next.cards }));
  }

  const turn = turnState(match, room, selfId);
  const last = data.lastPlay;
  const selectionLine = limitShown
    ? `You can play up to ${limit} cards at once. Tap a chosen card to swap it out.`
    : selected.length
      ? starting
        ? rank
          ? `${cards(selected.length)} chosen, to declare as ${rankPlural(rank)}.`
          : `${cards(selected.length)} chosen. Now choose the rank to declare.`
        : `${cards(selected.length)} chosen, to play as ${rankPlural(data.rank ?? '')}.`
      : call && last
        ? `Call bluff turns over ${last.player === selfId ? 'your' : `${name(last.player)}’s`} last ${cards(last.count)}.`
        : '';
  const dockLine =
    selectionLine && !repeatsNotice(selectionLine, turn.message) ? selectionLine : '';

  const roundLines = [
    ...data.plays.map((play) => playLine(name(play.player), play.count, data.rank)),
    ...data.passed.map((id) => `${name(id)} passed`),
  ];

  return (
    <div className="table-layout stable-game-table bluff-game" data-phase={match.phase}>
      <PlayerStrip
        {...props}
        playerCaption={(player) => cards(player.count)}
        playerBadge={(player) =>
          data.goingOut === player.id
            ? 'Last cards'
            : data.passed.includes(player.id)
              ? 'Passed'
              : null
        }
      />
      <section className="bluff-felt" aria-label="Bluff pile">
        {reveal ? (
          <div className="bluff-reveal" aria-live="polite">
            <div className="bluff-reveal__cards" role="group" aria-label="The called play, face up">
              {match.community.map((card) => (
                <PlayingCard key={card.id} card={card} compact />
              ))}
            </div>
            <div className="bluff-reveal__text">
              <p className="bluff-verdict" data-truthful={reveal.truthful}>
                {reveal.truthful ? (
                  <Check size={18} aria-hidden="true" />
                ) : (
                  <X size={18} aria-hidden="true" />
                )}
                {reveal.truthful ? 'Honest: every card matches' : 'Bluff: not every card matches'}
              </p>
              <p>
                {`${name(reveal.caller)} called ${reveal.player === selfId ? 'your' : `${name(reveal.player)}’s`} ${cards(reveal.count)} as ${rankPlural(reveal.rank)}.`}
              </p>
              <p>
                <strong>
                  {`${name(reveal.taker)} ${takes(reveal.taker)} the pile · ${cards(reveal.pile_count)}`}
                </strong>
              </p>
              {match.phase === 'reveal' ? (
                <p className="small">
                  {`${name(reveal.starter)} start${reveal.starter === selfId ? '' : 's'} the next round.`}
                </p>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="bluff-round">
            <div className="bluff-pile">
              <CardPile label="Pile" count={data.pileCount} />
              <div className="bluff-claim">
                <span className="small">Declared rank</span>
                <strong>{data.rank ? rankPlural(data.rank) : 'New round'}</strong>
                <span className="small">
                  {data.rank ? 'Every play this round claims it' : 'The starter names any rank'}
                </span>
              </div>
              <div className="bluff-aside">
                <Layers size={18} aria-hidden="true" />
                <strong>{data.discardedCount}</strong>
                <span className="small">Set aside</span>
              </div>
            </div>
            {roundLines.length ? (
              <ol className="bluff-plays" aria-label="This round">
                {roundLines.map((line, index) => (
                  <li key={`${index}:${line}`}>{line}</li>
                ))}
              </ol>
            ) : null}
            {data.goingOut && match.phase === 'playing' ? (
              <p className="bluff-going-out" role="status">
                <Eye size={16} aria-hidden="true" />
                {data.goingOut === selfId
                  ? 'You played your last cards. If this play stands, you win.'
                  : `${name(data.goingOut)} played their last cards. If this play stands, they win.`}
              </p>
            ) : null}
          </div>
        )}
      </section>
      <section className="bluff-workspace" aria-label="Your hand and decisions">
        <div className="bluff-heading">
          <h2>
            Your hand <span className="bluff-count">· {cards(match.hand.length)}</span>
          </h2>
          {honest.length && plays.length ? (
            <Button
              size="sm"
              variant="ghost"
              disabled={blocked}
              onClick={() => {
                setFull(null);
                setDraft((old) => ({
                  ...old,
                  cards: honest.slice(0, limit).map((card) => card.id),
                }));
              }}
            >
              {`Choose my ${rankPlural(data.rank ?? '')} · ${honest.length}`}
            </Button>
          ) : null}
        </div>
        <div className="bluff-hand" data-density={match.hand.length > 8 ? 'fan' : undefined}>
          {match.hand.length ? (
            <Hand
              cards={match.hand}
              label="Your hand"
              selectedIds={selected}
              disabled={blocked || !plays.length}
              onSelect={
                plays.length && !blocked
                  ? (id) => select(match.hand.find((card) => card.id === id)!)
                  : undefined
              }
            />
          ) : (
            <p className="small muted">No cards left in your hand.</p>
          )}
        </div>
        {choices.length ? (
          <DecisionDock
            className="bluff-dock"
            size="fit"
            label="Your Bluff decisions"
            pending={pending}
          >
            {starting ? (
              <div className="bluff-ranks" role="group" aria-label="Rank to declare">
                {bluffRanks.map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="bluff-rank"
                    aria-pressed={rank === value}
                    disabled={blocked || !plays.some((option) => option.value.choice === value)}
                    onClick={() => setDraft((old) => ({ ...old, rank: value }))}
                  >
                    <span aria-hidden="true">{value}</span>
                    <span className="sr-only">{rankName(value)}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {dockLine ? (
              <p className="small bluff-note" role="status">
                {dockLine}
              </p>
            ) : null}
            <div className="bluff-actions" data-decision-actions="">
              {choices.map((choice) => (
                <Button
                  key={choice.key}
                  variant={choice.variant}
                  disabled={blocked || !choice.action}
                  pending={pending && choice.key === 'play'}
                  onClick={() => choice.action && onAction(choice.action)}
                >
                  {choice.label}
                </Button>
              ))}
              {plays.length && (selected.length || draft.rank) ? (
                <Button
                  variant="ghost"
                  disabled={pending}
                  onClick={() => {
                    setFull(null);
                    setDraft(EMPTY);
                  }}
                >
                  Clear
                </Button>
              ) : null}
            </div>
          </DecisionDock>
        ) : null}
      </section>
    </div>
  );
}
