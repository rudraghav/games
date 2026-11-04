'use client';

import { useState } from 'react';
import { Flame, Layers, ShieldCheck } from 'lucide-react';
import {
  Button,
  Hand,
  PlayingCard,
  DecisionDock,
  HorizontalRail,
  TableDecisionPanel,
} from '@games/ui';
import { OpponentPanel } from '../shared/OpponentPanel';
import { shitheadDetails, type Card } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { useTableDraft } from '../shared/table-draft';
import { playerName, type TableProps } from '../types';
import { finishPlace, pileEvent, requirement, stageNames, topRun } from './shithead-view';

/** Hands longer than this wrap into overlapped rows so every card stays in view. */
const FAN_FROM = 9;

function ShitheadDecision(props: TableProps) {
  const { match, room, selfId, onAction, pending } = props;
  const data = shitheadDetails(match.detail);
  const ownStage = data.stages[selfId];
  const setup = ownStage === 'setup';
  const myTurn = match.currentPlayer === selfId && match.phase !== 'finished';
  const finished = match.phase === 'finished';
  const blocked = pending || room.paused || !myTurn;
  const arrange = match.actions.find((o) => o.value.type === 'arrange');
  const options = match.actions.filter((o) => o.value.type === 'play');
  const own = match.players.find((p) => p.id === selfId);
  const ownFaceUp = own?.cards.filter((c): c is Card => c !== null) || [];
  // Setup picks belong to the whole setup round, so a waiting player can pick
  // early and keep them across refresh; play selections expire with the version.
  const [draft, setDraft] = useTableDraft<string[]>(
    `shithead:${room.id}:${room.matchId ?? match.id}:${setup ? 'setup' : room.matchVersion}`,
    [],
  );
  const [sortBySuit, setSortBySuit] = useTableDraft<boolean>(
    `shithead:${room.id}:${room.matchId ?? match.id}:sort`,
    false,
  );
  const [hint, setHint] = useState<{ version: number | null; text: string } | null>(null);
  const shownHint = hint && hint.version === room.matchVersion ? hint.text : null;
  const chosenFaceUp = setup && ownFaceUp.length > 0;
  const canPreselect = setup && !chosenFaceUp && !pending && !room.paused;
  const sortedHand = [...match.hand].sort((a, b) => {
    const rankOrder = (card: Card) => '23456789TJQKA'.indexOf(card.id[0]);
    return (
      (sortBySuit ? a.suit.localeCompare(b.suit) : rankOrder(a) - rankOrder(b)) ||
      (sortBySuit ? rankOrder(a) - rankOrder(b) : a.suit.localeCompare(b.suit))
    );
  });
  const pool = ownStage === 'face_up' ? ownFaceUp : match.hand;
  const selected = draft.filter((id) => pool.some((card) => card.id === id));
  const play = options.find(
    (o) =>
      o.value.cards?.length === selected.length &&
      o.value.cards.every((id) => selected.includes(id)),
  );
  const pickup = match.actions.find(
    (o) =>
      o.value.type === 'pickup' &&
      (ownStage !== 'face_up' || (selected.length === 1 && o.value.card === selected[0])),
  );
  // Reserve a stable choice area only while this viewer has controls to use.
  // Selection does not affect this flag, so Clear selection cannot shift cards.
  const hasPickup = match.actions.some((option) => option.value.type === 'pickup');
  const hasDecision = Boolean(arrange || options.length || hasPickup || canPreselect);
  // Server-legal cards for this turn; everything else is shown dimmed.
  const playableIds = [...new Set(options.flatMap((option) => option.value.cards ?? []))];
  const markPlayable = myTurn && (ownStage === 'hand' || options.length > 0);
  const need = requirement(data);
  const unplayable = selected.filter((id) => !playableIds.includes(id));
  const nameOf = (id: string) => pool.find((card) => card.id === id)?.label ?? '';
  const current = match.currentPlayer ? playerName(room, match.currentPlayer) : '';
  const loserIsSelf = finished && data.loser === selfId;

  const instruction = finished
    ? loserIsSelf
      ? 'You were the last player holding cards.'
      : 'You escaped. The match is over.'
    : ownStage === 'out'
      ? `You escaped ${finishPlace(data.finish_order.indexOf(selfId))}. The others play on.`
      : setup
        ? chosenFaceUp
          ? `Your face-up cards are set. Waiting for ${current} to choose.`
          : myTurn
            ? 'Choose three cards to keep face-up. Tap a chosen card again to swap it out.'
            : `${current} is choosing face-up cards. You can pick your three now.`
        : !myTurn
          ? `Waiting for ${current}.`
          : ownStage === 'face_down'
            ? data.pile_count
              ? `Flip one of your hidden cards. If it can’t beat ${need.short}, you take the pile.`
              : 'Flip any hidden card to lead.'
            : ownStage === 'face_up'
              ? options.length
                ? `Play a face-up card (${need.text}), or choose one to take with the pile.`
                : `No face-up card beats ${need.short}. Choose one to add to the pile; you then take all ${data.pile_count + 1} cards.`
              : !data.pile_count
                ? 'Lead any card from your hand: one card or several of the same rank.'
                : options.length
                  ? `Play ${need.text} from your hand: one card or several of the same rank.`
                  : `Nothing in your hand beats ${need.short}. Take the pile (${data.pile_count} cards).`;
  const selectionNote = shownHint
    ? shownHint
    : myTurn && !setup && unplayable.length && ownStage !== 'face_up'
      ? `${nameOf(unplayable[0])} can’t be played on ${need.short}. Play ${need.text}, or take the pile.`
      : myTurn && ownStage === 'face_up' && selected.length && !play && options.length
        ? `${nameOf(selected[0])} can’t be played on ${need.short}. Tap Take pile to add it to the pile and take everything.`
        : null;

  function select(card: Card) {
    setHint(null);
    setDraft((old) => {
      const kept = old.filter((id) => pool.some((c) => c.id === id));
      if (kept.includes(card.id)) return kept.filter((id) => id !== card.id);
      if (setup) {
        if (kept.length >= 3) {
          setHint({
            version: room.matchVersion,
            text: 'You’ve chosen three. Tap a chosen card to swap it out first.',
          });
          return kept;
        }
        return [...kept, card.id];
      }
      const same = kept.every((id) => pool.find((c) => c.id === id)?.value === card.value);
      return same ? [...kept, card.id] : [card.id];
    });
  }
  function commit(action: Parameters<typeof onAction>[0]) {
    onAction(action);
  }

  function faceRow(playerId: string) {
    const player = match.players.find((p) => p.id === playerId)!;
    const self = playerId === selfId;
    const stage = data.stages[playerId];
    const faceUpPlayable = self && myTurn && ownStage === 'face_up' && options.length > 0;
    return (
      <section
        className="shithead-player-table"
        data-self={self}
        aria-label={`${self ? 'Your' : playerName(room, playerId)} table cards`}
      >
        <div className="shithead-table-heading">
          <strong>{self ? 'Your table' : playerName(room, playerId)}</strong>
          <span className="small muted">
            {stage === 'out' ? 'Escaped' : `${data.hand_counts[playerId]} in hand`}
          </span>
        </div>
        <div className="shithead-zone-row">
          <span className="small muted">Face-up</span>
          <div className="shithead-table-cards">
            {player.cards.length ? (
              player.cards.map((card) =>
                card ? (
                  <PlayingCard
                    key={card.id}
                    card={card}
                    selected={self && selected.includes(card.id)}
                    onClick={self && ownStage === 'face_up' ? () => select(card) : undefined}
                    disabled={blocked}
                    playable={faceUpPlayable ? playableIds.includes(card.id) : undefined}
                    compact
                  />
                ) : null,
              )
            ) : (
              <span className="shithead-cleared">
                {match.phase === 'setup' ? 'Not chosen yet' : 'Cleared'}
              </span>
            )}
          </div>
        </div>
        <div className="shithead-zone-row">
          <span className="small muted">Hidden</span>
          <div className="shithead-table-cards">
            {data.hidden_slots[playerId].map((occupied, slot) => {
              const flip = self
                ? match.actions.find((o) => o.value.type === 'flip' && o.value.slot === slot)
                : null;
              return occupied ? (
                <PlayingCard
                  key={slot}
                  faceDown
                  compact
                  label={
                    self && ownStage === 'face_down'
                      ? `Flip hidden card ${slot + 1}`
                      : `Hidden card ${slot + 1}`
                  }
                  onClick={flip ? () => commit(flip.value) : undefined}
                  disabled={blocked}
                />
              ) : (
                <span
                  className="shithead-empty-slot"
                  key={slot}
                  aria-label={`Hidden card ${slot + 1} played`}
                />
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  // Once the hand is empty, the table cards you must play move up into the
  // workspace, above the decision dock, instead of waiting below the fold.
  const tableInWorkspace = ownStage === 'face_up' || ownStage === 'face_down';
  const dense = match.hand.length >= FAN_FROM;
  return (
    <>
      <div className="shithead-own-zone" data-stage={ownStage} data-table-first={tableInWorkspace}>
        <section className="shithead-workspace" aria-label="Your cards and decisions">
          <div className="shithead-table-heading">
            <h2>
              {setup
                ? 'Choose your table cards'
                : ownStage === 'face_up'
                  ? 'Play your face-up cards'
                  : ownStage === 'face_down'
                    ? 'Reveal a hidden card'
                    : ownStage === 'out'
                      ? 'You escaped'
                      : 'Your hand'}
              {match.hand.length && !tableInWorkspace ? (
                <span className="shithead-hand-count"> · {match.hand.length} cards</span>
              ) : null}
            </h2>
            {match.hand.length && !setup ? (
              <Button size="sm" variant="ghost" onClick={() => setSortBySuit((old) => !old)}>
                {sortBySuit ? 'Sort by rank' : 'Sort by suit'}
              </Button>
            ) : null}
          </div>
          <p className="small muted shithead-instruction">{instruction}</p>
          {tableInWorkspace ? (
            faceRow(selfId)
          ) : (
            <div
              className="shithead-private-cards"
              data-density={setup ? 'setup' : dense ? 'fan' : undefined}
            >
              {match.hand.length ? (
                <Hand
                  cards={setup ? match.hand : sortedHand}
                  disabled={setup ? !canPreselect : blocked}
                  selectedIds={selected}
                  playableIds={markPlayable && ownStage === 'hand' ? playableIds : undefined}
                  onSelect={
                    (setup ? canPreselect : !blocked)
                      ? (id) => select(match.hand.find((c) => c.id === id)!)
                      : undefined
                  }
                />
              ) : (
                <p className="small muted">
                  {ownStage === 'out' ? 'All your cards are cleared.' : 'Hand cleared.'}
                </p>
              )}
            </div>
          )}
          {hasDecision ? (
            <DecisionDock
              className="shithead-actions"
              label="Your Shithead actions"
              size="standard"
              pending={pending}
            >
              {selectionNote ? (
                <p className="small shithead-selection-note" role="status">
                  {selectionNote}
                </p>
              ) : null}
              <div className="shithead-action-buttons" data-decision-actions="">
                {setup ? (
                  <Button
                    disabled={!arrange || blocked || selected.length !== 3}
                    onClick={() => arrange && commit({ ...arrange.value, cards: selected })}
                  >
                    {arrange
                      ? `Keep selected three face-up · ${selected.length}/3`
                      : `Picked ${selected.length}/3 · confirm on your turn`}
                  </Button>
                ) : null}
                {options.length ? (
                  <Button disabled={blocked || !play} onClick={() => play && commit(play.value)}>
                    Play selected{selected.length ? ` · ${selected.length}` : ''}
                  </Button>
                ) : null}
                {hasPickup ? (
                  <Button
                    variant={options.length ? 'secondary' : 'primary'}
                    disabled={blocked || !pickup}
                    onClick={() => pickup && commit(pickup.value)}
                  >
                    {ownStage === 'face_up'
                      ? selected.length === 1 && pickup
                        ? `Take pile with ${nameOf(selected[0])} · ${data.pile_count + 1} cards`
                        : 'Take pile with a chosen face-up card'
                      : `Take pile · ${data.pile_count} cards`}
                  </Button>
                ) : null}
                {selected.length ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setHint(null);
                      setDraft([]);
                    }}
                    disabled={pending}
                  >
                    Clear selection
                  </Button>
                ) : null}
              </div>
            </DecisionDock>
          ) : null}
        </section>
        {tableInWorkspace ? null : faceRow(selfId)}
      </div>
      <HorizontalRail
        label="Other Shithead players"
        navigationLabel="Shithead players"
        className="shithead-opponents"
        contentClassName="shithead-opponent-row"
      >
        {match.players
          .filter((p) => p.id !== selfId)
          .map((p) => (
            <OpponentPanel
              key={p.id}
              player={p}
              room={room}
              active={match.currentPlayer === p.id}
              caption={
                data.stages[p.id] === 'out'
                  ? `Escaped ${finishPlace(data.finish_order.indexOf(p.id))}`
                  : `${p.count} cards remaining`
              }
              summary={
                <>
                  <div className="opponent-public-cards">
                    {p.cards
                      .filter((c): c is Card => c !== null)
                      .map((card) => (
                        <PlayingCard key={card.id} card={card} compact />
                      ))}
                  </div>
                  <span className="opponent-facts">
                    {data.hidden_slots[p.id]?.filter(Boolean).length ?? 0} hidden table cards ·{' '}
                    {data.stages[p.id] === 'setup' && p.cards.length
                      ? 'face-up cards chosen'
                      : stageNames[data.stages[p.id]]}
                  </span>
                </>
              }
            >
              {faceRow(p.id)}
            </OpponentPanel>
          ))}
      </HorizontalRail>
    </>
  );
}

export function ShitheadTable(props: TableProps) {
  const { match, room, selfId } = props;
  const data = shitheadDetails(match.detail);
  const [pileOpen, setPileOpen] = useState(false);
  const need = requirement(data);
  const run = topRun(match.community, match.discard);
  const name = (id: string) => (id === selfId ? 'You' : playerName(room, id));
  const event = pileEvent(data.last_play, name, match.currentPlayer);
  const newestFirst = [...match.community].reverse();
  return (
    <div className="table-layout stable-game-table shithead-game">
      <PlayerStrip
        {...props}
        playerCaption={(p) =>
          data.stages[p.id] === 'out'
            ? `Escaped ${finishPlace(data.finish_order.indexOf(p.id))}`
            : `${p.count} cards remaining`
        }
      />
      {match.phase === 'finished' && data.loser ? (
        <div className="shithead-outcome" role="status">
          <ShieldCheck size={20} aria-hidden="true" />
          <div>
            <strong>
              {data.loser === selfId
                ? 'You’re the Shithead: the last player holding cards.'
                : `${playerName(room, data.loser)} is the Shithead: the last player holding cards.`}
            </strong>
            <ol className="shithead-finish-order" aria-label="Escape order">
              {data.finish_order.map((id) => (
                <li key={id}>{name(id)}</li>
              ))}
              <li data-last="true">{name(data.loser)} · last</li>
            </ol>
          </div>
        </div>
      ) : null}
      <section className="shithead-piles" aria-label="Shithead piles">
        <div className="shithead-stock">
          <Layers size={20} aria-hidden="true" />
          <strong>{match.drawCount}</strong>
          <span className="small">Draw pile</span>
        </div>
        <div className="shithead-pile">
          {match.discard ? (
            <div
              className="shithead-pile-top"
              data-run={run.length}
              aria-label={
                run.length > 1
                  ? `Top of the pile: ${run.length} × ${match.discard.value}`
                  : `Top of the pile: ${match.discard.label}`
              }
              role="img"
            >
              {run.slice(-3).map((card) => (
                <PlayingCard key={card.id} card={card} compact />
              ))}
            </div>
          ) : (
            <span className="shithead-empty-pile">Lead any card</span>
          )}
          <div>
            <strong>{need.label}</strong>
            {run.length > 1 && match.discard ? (
              <p className="shithead-run-note">
                {match.discard.value} ×{run.length} on top
                {run.length === 3 ? `: one more ${match.discard.value} burns` : ''}
              </p>
            ) : null}
            <p className="small">{data.pile_count} in pile</p>
            {event ? <p className="shithead-pile-event">{event}</p> : null}
            <Button
              size="sm"
              variant="secondary"
              disabled={!match.community.length}
              onClick={() => setPileOpen(true)}
            >
              View pile
            </Button>
          </div>
        </div>
        <div className="shithead-stock">
          <Flame size={20} aria-hidden="true" />
          <strong>{data.burned_count}</strong>
          <span className="small">Burned</span>
        </div>
      </section>
      <TableDecisionPanel open={pileOpen} onOpenChange={setPileOpen} title="Public pile">
        <p className="small muted">
          Last {match.community.length} {match.community.length === 1 ? 'card' : 'cards'}, newest
          first. Four equal top cards burn the pile.
        </p>
        <HorizontalRail
          label="Public pile, newest first"
          navigationLabel="Pile cards"
          contentClassName="opponent-public-cards"
        >
          {newestFirst.map((card) => (
            <PlayingCard key={card.id} card={card} compact />
          ))}
        </HorizontalRail>
      </TableDecisionPanel>
      <div className="shithead-rule-row" aria-label="Active special cards">
        <span>2 · reset</span>
        <span>10 · burn</span>
        <span>Four equal · burn</span>
        {data.settings.seven_low ? <span>7 · low</span> : null}
        {data.settings.transparent_three ? <span>3 · transparent</span> : null}
      </div>
      <ShitheadDecision key={room.matchId ?? match.id} {...props} />
    </div>
  );
}
