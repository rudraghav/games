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
import { playerName, type TableProps } from '../types';

function ShitheadDecision(props: TableProps) {
  const { match, room, selfId, onAction, pending } = props;
  const data = shitheadDetails(match.detail);
  const [selection, setSelection] = useState<{ version: number | null; cards: string[] }>({
    version: room.matchVersion,
    cards: [],
  });
  const selected = selection.version === room.matchVersion ? selection.cards : [];
  const [sortBySuit, setSortBySuit] = useState(false);
  const ownStage = data.stages[selfId];
  const myTurn = match.currentPlayer === selfId && match.phase !== 'finished';
  const blocked = pending || room.paused || !myTurn;
  const arrange = match.actions.find((o) => o.value.type === 'arrange');
  const options = match.actions.filter((o) => o.value.type === 'play');
  const own = match.players.find((p) => p.id === selfId);
  const sortedHand = [...match.hand].sort((a, b) => {
    const rankOrder = (card: Card) => '23456789TJQKA'.indexOf(card.id[0]);
    return (
      (sortBySuit ? a.suit.localeCompare(b.suit) : rankOrder(a) - rankOrder(b)) ||
      (sortBySuit ? rankOrder(a) - rankOrder(b) : a.suit.localeCompare(b.suit))
    );
  });
  const ownFaceUp = own?.cards.filter((c): c is Card => c !== null) || [];
  const pool = ownStage === 'face_up' ? ownFaceUp : match.hand;
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
  const hasDecision = Boolean(arrange || options.length || hasPickup);
  const instruction =
    ownStage === 'setup'
      ? 'Choose three cards to keep face-up.'
      : ownStage === 'face_down'
        ? 'Choose a hidden card on your table.'
        : ownStage === 'out'
          ? 'You are safe. The remaining players continue.'
          : ownStage === 'face_up'
            ? 'Play from your face-up cards, or select one to take with the pile.'
            : 'Select one or more cards of the same rank.';

  function select(card: Card) {
    setSelection((previous) => {
      const old = previous.version === room.matchVersion ? previous.cards : [];
      let cards: string[];
      if (old.includes(card.id)) cards = old.filter((id) => id !== card.id);
      else if (arrange) cards = [...old.slice(-2), card.id];
      else {
        const same = old.every((id) => pool.find((c) => c.id === id)?.value === card.value);
        cards = same ? [...old, card.id] : [card.id];
      }
      return { version: room.matchVersion, cards };
    });
  }
  function faceRow(playerId: string) {
    const player = match.players.find((p) => p.id === playerId)!;
    const self = playerId === selfId;
    const stage = data.stages[playerId];
    return (
      <section
        className="shithead-player-table"
        data-self={self}
        aria-label={`${self ? 'Your' : playerName(room, playerId)} table cards`}
      >
        <div className="shithead-table-heading">
          <strong>{self ? 'Your table' : playerName(room, playerId)}</strong>
          <span className="small muted">
            {stage === 'out' ? 'Safe' : `${data.hand_counts[playerId]} in hand`}
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
                  onClick={flip ? () => onAction(flip.value) : undefined}
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

  return (
    <>
      <div className="shithead-own-zone" data-stage={ownStage}>
        <section className="shithead-workspace" aria-label="Your cards and decisions">
          <div className="shithead-table-heading">
            <h2>
              {ownStage === 'setup'
                ? 'Choose your table cards'
                : ownStage === 'face_up'
                  ? 'Play your face-up cards'
                  : ownStage === 'face_down'
                    ? 'Reveal a hidden card'
                    : ownStage === 'out'
                      ? 'You are safe'
                      : 'Your hand'}
            </h2>
            {match.hand.length ? (
              <Button size="sm" variant="ghost" onClick={() => setSortBySuit((old) => !old)}>
                {sortBySuit ? 'Sort by rank' : 'Sort by suit'}
              </Button>
            ) : (
              <span className="small muted">0 cards</span>
            )}
          </div>
          <p className="small muted">
            {myTurn || ownStage === 'out' ? instruction : 'Waiting for the current player.'}
          </p>
          <div className="shithead-private-cards">
            {match.hand.length ? (
              <Hand
                cards={sortedHand}
                disabled={blocked}
                selectedIds={selected}
                onSelect={
                  !blocked ? (id) => select(match.hand.find((c) => c.id === id)!) : undefined
                }
              />
            ) : (
              <p className="small muted">
                {ownStage === 'face_down'
                  ? 'Your hidden cards are ready.'
                  : ownStage === 'face_up'
                    ? 'Play from your table below.'
                    : 'Hand cleared.'}
              </p>
            )}
          </div>
          {hasDecision ? (
            <DecisionDock
              className="shithead-actions"
              label="Your Shithead actions"
              size="standard"
              pending={pending}
            >
              {arrange ? (
                <Button
                  disabled={blocked || selected.length !== 3}
                  onClick={() => onAction({ ...arrange.value, cards: selected })}
                >
                  Keep selected three face-up · {selected.length}/3
                </Button>
              ) : null}
              {options.length ? (
                <Button disabled={blocked || !play} onClick={() => play && onAction(play.value)}>
                  Play selected{selected.length ? ` · ${selected.length}` : ''}
                </Button>
              ) : null}
              {hasPickup ? (
                <Button
                  variant="secondary"
                  disabled={blocked || !pickup}
                  onClick={() => pickup && onAction(pickup.value)}
                >
                  {ownStage === 'face_up'
                    ? 'Take pile with selected card'
                    : `Take pile · ${data.pile_count} cards`}
                </Button>
              ) : null}
              {selected.length ? (
                <Button
                  variant="ghost"
                  onClick={() => setSelection({ version: room.matchVersion, cards: [] })}
                  disabled={pending}
                >
                  Clear selection
                </Button>
              ) : null}
            </DecisionDock>
          ) : null}
        </section>
        {faceRow(selfId)}
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
              caption={data.stages[p.id] === 'out' ? 'Safe' : `${p.count} cards remaining`}
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
                    {data.stages[p.id].replaceAll('_', ' ')}
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
  const { match, room } = props;
  const data = shitheadDetails(match.detail);
  const [pileOpen, setPileOpen] = useState(false);
  const comparison =
    data.comparison_rank === '2' || !data.comparison_rank
      ? 'Any rank'
      : data.low_required
        ? 'Seven or lower'
        : `Match or beat ${data.comparison_rank}`;
  return (
    <div className="table-layout stable-game-table shithead-game">
      <PlayerStrip
        {...props}
        playerCaption={(p) => (data.stages[p.id] === 'out' ? 'Safe' : `${p.count} cards remaining`)}
      />
      <section className="shithead-piles" aria-label="Shithead piles">
        <div className="shithead-stock">
          <Layers size={20} aria-hidden="true" />
          <strong>{match.drawCount}</strong>
          <span className="small">Draw pile</span>
        </div>
        <div className="shithead-pile">
          {match.discard ? (
            <PlayingCard card={match.discard} compact />
          ) : (
            <span className="shithead-empty-pile">Lead any card</span>
          )}
          <div>
            <strong>{comparison}</strong>
            <p className="small">{data.pile_count} in pile</p>
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
          Last {match.community.length} {match.community.length === 1 ? 'card' : 'cards'}, oldest to
          newest. Four equal top cards burn the pile.
        </p>
        <HorizontalRail
          label="Public pile, oldest to newest"
          navigationLabel="Pile cards"
          contentClassName="opponent-public-cards"
        >
          {match.community.map((card) => (
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
      {match.phase === 'finished' && data.loser ? (
        <div className="shithead-outcome" role="status">
          <ShieldCheck size={20} aria-hidden="true" />
          <span>{playerName(room, data.loser)} is last. Everyone else escaped.</span>
        </div>
      ) : null}
      <ShitheadDecision key={room.matchId ?? match.id} {...props} />
    </div>
  );
}
