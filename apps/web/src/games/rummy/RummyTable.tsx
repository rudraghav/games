'use client';
import { useEffect, useState } from 'react';
import { rummyDetails, type Action, type ActionOption, type Card } from '@games/api-client';
import { Button, DecisionDock, Modal, PlayingCard } from '@games/ui';
import { playerName, type TableProps } from '../types';
import { PlayerStrip } from '../shared/PlayerStrip';
import { TablePile } from '../shared/TablePile';
import { useTableDraft } from '../shared/table-draft';
import { RummyDock } from './RummyDock';
import { RummyHand } from './RummyHand';
import { RummyResults } from './RummyResults';
import {
  arrangeCards,
  isJokerCard,
  isPrintedJoker,
  meldNames,
  orderedMeld,
  outCaption,
  rummyOut,
  wildPlural,
  wildValue,
  type CardMark,
  type RummySort,
} from './rummy-view';

const buckets = ['Ungrouped', 'Group 1', 'Group 2', 'Group 3', 'Group 4'];
type Draft = { groups: Record<string, number>; sort: RummySort; selected: string | null };
type Analysis = NonNullable<ReturnType<typeof rummyDetails>['analysis']>;

export function RummyTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  // The viewer's own arrangement survives refresh and reconnect for this deal
  // only; ids no longer in the hand are ignored.
  const [draft, setDraft] = useTableDraft<Draft>(`rummy:${room.id}:${room.matchId ?? match.id}`, {
    groups: {},
    sort: 'dealt',
    selected: null,
  });
  const [confirm, setConfirm] = useState<{
    kind: 'declare' | 'drop';
    action: Action;
    version: number | null;
  } | null>(null);
  const [submitted, setSubmitted] = useState<Action | null>(null);
  // Closed explanations are not mounted, so they cannot crowd the table below.
  const [analysisOpen, setAnalysisOpen] = useState(false);
  const data = rummyDetails(match.detail);
  const out = rummyOut(match.detail);
  const wild = String(match.detail.wild_rank ?? data.wild_rank);
  const cut = match.community[0];
  const finished = match.phase === 'finished';
  const groups = draft.groups;
  const sort = draft.sort;
  const selectedCard = match.hand.find((card) => card.id === draft.selected);
  const select = (id: string | null) => setDraft((old) => ({ ...old, selected: id }));
  // A committed discard leaves the hand; forget it so a later reshuffle can't
  // bring back a stale selection.
  const staleSelection = Boolean(draft.selected && !selectedCard);
  useEffect(() => {
    if (staleSelection) setDraft((old) => ({ ...old, selected: null }));
  }, [staleSelection, setDraft]);
  const cardOf = (id: string) =>
    match.hand.find((card) => card.id === id) ??
    match.players.flatMap((p) => p.cards).find((card) => card?.id === id) ??
    undefined;
  const cardName = (id: string) => {
    const card = cardOf(id);
    if (!card) return id;
    return isJokerCard(card, wild) && !isPrintedJoker(card) ? `${card.label} (joker)` : card.label;
  };

  const drawStock = match.actions.find((option) => option.value.type === 'draw_stock');
  const drawDiscard = match.actions.find((option) => option.value.type === 'draw_discard');
  const discardOptions = match.actions.filter((option) => option.value.type === 'discard');
  const discarding = match.phase === 'discard' && discardOptions.length > 0;
  // The engine appends a drawn card and withholds the discard move for a card
  // taken from the discard pile this turn; both are read from this projection.
  const drawn = discarding ? match.hand.at(-1) : undefined;
  const taken = discarding
    ? match.hand.find((card) => !discardOptions.some((option) => option.value.card === card.id))
    : undefined;
  const winning = discarding
    ? match.hand.filter((card) => data.discard_analyses[card.id]?.valid)
    : [];
  const winningIds = new Set(winning.map((card) => card.id));
  const preview = selectedCard ? data.discard_analyses[selectedCard.id] : undefined;
  // Name a best discard only when it actually lowers your points; prefer
  // keeping jokers when discards tie.
  const ranked = discarding
    ? Object.entries(data.discard_analyses).sort(
        ([idA, a], [idB, b]) =>
          Number(b.valid) - Number(a.valid) ||
          a.deadwood - b.deadwood ||
          Number(isJokerCard({ id: idA }, wild)) - Number(isJokerCard({ id: idB }, wild)),
      )
    : [];
  const bestDiscard =
    ranked.length && ranked[0][1].deadwood < ranked[ranked.length - 1][1].deadwood
      ? ranked[0]
      : undefined;
  const selfOut = out[selfId];
  const discardTopIsJoker = Boolean(match.discard && isJokerCard(match.discard, wild));

  function marks(card: Card): CardMark[] {
    const list: CardMark[] = [];
    if (isJokerCard(card, wild)) list.push('wild');
    if (winningIds.has(card.id)) list.push('win');
    else if (card.id === taken?.id) list.push('taken');
    else if (card.id === drawn?.id) list.push('new');
    return list;
  }
  const shownMarks = new Set(match.hand.flatMap(marks));

  // The analysis that explains the current choice: the selected discard, the
  // best available discard on your turn, otherwise your 13-card hand.
  const shown: { title: string; analysis: Analysis } | null =
    finished || selfOut
      ? null
      : preview
        ? {
            title: `After discarding ${selectedCard!.label}: ${
              preview.valid ? 'valid declaration' : `${preview.deadwood} loss points`
            }`,
            analysis: preview,
          }
        : winning.length
          ? {
              title:
                winning.length > 2
                  ? `You can declare: ${winning.length} winning discards`
                  : `You can declare: discard ${winning.map((card) => card.label).join(' or ')}`,
              analysis: data.discard_analyses[winning[0].id],
            }
          : bestDiscard
            ? {
                title: `Best discard ${cardName(bestDiscard[0])}: ${bestDiscard[1].deadwood} loss points`,
                analysis: bestDiscard[1],
              }
            : ranked.length
              ? {
                  title: `Your hand: ${ranked[0][1].deadwood} loss points after any discard`,
                  analysis: ranked[0][1],
                }
              : data.analysis
                ? {
                    title: `Your hand: ${data.analysis.deadwood} loss points`,
                    analysis: data.analysis,
                  }
                : null;

  function arrangeMelds() {
    const source = shown?.analysis ?? data.analysis;
    if (!source) return;
    const next: Record<string, number> = {};
    source.melds.slice(0, buckets.length - 1).forEach((meld, index) => {
      for (const id of meld.cards) next[id] = index + 1;
    });
    setDraft((old) => ({ ...old, groups: next, sort: old.sort === 'dealt' ? 'rank' : old.sort }));
  }
  // A group that matches one of the server's melds says what kind it is.
  function groupKind(cards: Card[]) {
    const ids = cards.map((card) => card.id).sort();
    const meld = shown?.analysis.melds.find(
      (item) => item.cards.length === ids.length && [...item.cards].sort().join() === ids.join(),
    );
    return meld ? meldNames[meld.kind] : null;
  }

  function decide(option: ActionOption) {
    const action = option.value;
    if (action.type === 'declare' && !preview?.valid) {
      setConfirm({ kind: 'declare', action, version: room.matchVersion });
      return;
    }
    setSubmitted(action);
    onAction(action);
  }
  function commitConfirmed() {
    if (confirm && confirm.version === room.matchVersion) {
      setSubmitted(confirm.action);
      onAction(confirm.action);
    }
    setConfirm(null);
  }
  const activeOthers = match.players.filter((p) => p.id !== selfId && !out[p.id]);
  const dropCost = data.drop_cost;

  return (
    <div className="table-layout stable-game-table card-game-layout rummy-layout">
      <PlayerStrip
        {...props}
        playerCaption={(player) => {
          const result = data.settlements[player.id];
          if (finished && result) return `${result.score > 0 ? '+' : ''}${result.score} points`;
          const penalty = out[player.id];
          if (penalty) return outCaption(penalty);
          return `${player.count} cards`;
        }}
      />
      {finished ? <RummyResults match={match} room={room} selfId={selfId} /> : null}
      <div className="card-table felt-table">
        <span className="table-watermark">g.</span>
        <div className="center-piles">
          <TablePile
            label="Draw pile"
            count={match.drawCount}
            action={drawStock}
            onAction={(action) => {
              setSubmitted(action);
              onAction(action);
            }}
            pending={pending}
            paused={room.paused}
          />
          <TablePile
            label={discardTopIsJoker ? 'Discard · joker' : 'Discard'}
            card={match.discard}
            action={drawDiscard}
            onAction={(action) => {
              setSubmitted(action);
              onAction(action);
            }}
            pending={pending}
            paused={room.paused}
          />
          {cut ? (
            <div className="card-pile rummy-wild-card">
              <PlayingCard
                card={cut}
                className="rummy-mark--wild"
                label={
                  isPrintedJoker(cut)
                    ? 'Cut card: a printed joker, so aces are wild'
                    : `Cut card ${cut.label}: every ${wildValue(wild)} is a wild joker`
                }
              />
              <span>Wild: {wildPlural(wild)}</span>
            </div>
          ) : null}
        </div>
        <p className="table-detail rummy-wild-note">
          {cut && isPrintedJoker(cut)
            ? 'A printed joker was cut, so aces are wild. Both printed jokers are wild too.'
            : `Every ${wildValue(wild)} and both printed jokers act as jokers.`}
          {discardTopIsJoker && match.discard
            ? ` The ${match.discard.label} on the discard is a joker and can’t be taken.`
            : ''}
        </p>
      </div>
      <section className="private-hand" aria-label="Arrange your rummy hand">
        <div className="hand-heading">
          <h3>
            Your hand <span className="muted">{match.hand.length} cards</span>
          </h3>
          <div className="rummy-tools">
            <label className="small">
              Sort
              <select
                className="input input--small"
                value={sort}
                onChange={(event) =>
                  setDraft((old) => ({ ...old, sort: event.target.value as RummySort }))
                }
              >
                <option value="dealt">As dealt</option>
                <option value="suit">By suit</option>
                <option value="rank">By rank</option>
              </select>
            </label>
            <Button
              size="sm"
              variant="secondary"
              disabled={!shown?.analysis.melds.length || finished}
              onClick={arrangeMelds}
            >
              Group my melds
            </Button>
          </div>
        </div>
        <div className="rummy-groups">
          {buckets.map((label, bucket) => {
            const cards = arrangeCards(
              match.hand.filter((card) => (groups[card.id] ?? 0) === bucket),
              sort,
            );
            const kind = bucket ? groupKind(cards) : null;
            return cards.length ? (
              <div className="rummy-group" data-bucket={bucket} key={label}>
                <span className="eyebrow">
                  {label}
                  {kind ? <span className="rummy-group-kind"> · {kind}</span> : null}
                </span>
                <RummyHand
                  cards={cards}
                  label={label}
                  selectedId={selectedCard?.id ?? null}
                  marks={marks}
                  disabled={pending || room.paused}
                  onSelect={(id) => select(id === selectedCard?.id ? null : id)}
                />
              </div>
            ) : null;
          })}
        </div>
        {shownMarks.size ? (
          <p className="rummy-legend small" aria-hidden="true">
            {shownMarks.has('wild') ? (
              <span data-mark="wild">
                <b>Wild</b> joker
              </span>
            ) : null}
            {shownMarks.has('win') ? (
              <span data-mark="win">
                <b>Win</b> discard it to declare
              </span>
            ) : null}
            {shownMarks.has('new') ? (
              <span data-mark="new">
                <b>New</b> just drawn
              </span>
            ) : null}
            {shownMarks.has('taken') ? (
              <span data-mark="taken">
                <b>Taken</b> from the discard; keep it this turn
              </span>
            ) : null}
          </p>
        ) : null}
        {finished ? null : (
          <DecisionDock
            className="rummy-group-controls"
            size="compact"
            role="group"
            label={selectedCard ? `Move ${selectedCard.label} to a group` : 'Arrange card groups'}
          >
            <span className="small">
              {selectedCard
                ? `Move ${selectedCard.label} to:`
                : 'Select a card to move it between groups.'}
            </span>
            <div>
              {buckets.map((label, bucket) => (
                <Button
                  key={label}
                  size="sm"
                  variant={
                    selectedCard && (groups[selectedCard.id] ?? 0) === bucket
                      ? 'primary'
                      : 'secondary'
                  }
                  aria-pressed={Boolean(selectedCard && (groups[selectedCard.id] ?? 0) === bucket)}
                  disabled={!selectedCard || pending || room.paused}
                  onClick={() =>
                    selectedCard &&
                    setDraft((old) => ({
                      ...old,
                      groups: { ...old.groups, [selectedCard.id]: bucket },
                    }))
                  }
                >
                  {label}
                </Button>
              ))}
            </div>
          </DecisionDock>
        )}
        {finished ? null : (
          <p className="small muted rummy-groups-note">
            Groups are only for you and stay in this tab for this deal. The server finds your best
            valid arrangement when you declare.
          </p>
        )}
      </section>
      <RummyDock
        match={match}
        room={room}
        selfId={selfId}
        pending={pending}
        submitted={submitted}
        selectedCard={selectedCard}
        preview={preview}
        taken={taken}
        drawn={drawn}
        winning={winning}
        selfOut={selfOut}
        discardTop={match.discard ?? null}
        discardTopIsJoker={discardTopIsJoker}
        onSelect={(id) => select(id)}
        onDecide={decide}
        onDrop={(option) =>
          setConfirm({ kind: 'drop', action: option.value, version: room.matchVersion })
        }
        clear={() => select(null)}
      />
      {shown ? (
        <details
          className="game-information-settlement rummy-analysis"
          open={analysisOpen}
          onToggle={(event) => setAnalysisOpen(event.currentTarget.open)}
        >
          <summary>{shown.title}</summary>
          {analysisOpen ? (
            <>
              <p className="small">
                {shown.analysis.sequence_count} sequences, {shown.analysis.pure_sequence_count}{' '}
                pure.{' '}
                {shown.analysis.scoring_gate
                  ? 'The sequence requirement is met; only unmatched cards count toward loss points.'
                  : 'Until you have two sequences including one pure sequence, all non-joker cards count (maximum 80).'}
              </p>
              <ul>
                {shown.analysis.melds.map((meld, i) => (
                  <li key={i}>
                    <strong>{meld.kind.replaceAll('_', ' ')}</strong>
                    <span>{orderedMeld(meld.cards, cardOf).map(cardName).join(', ')}</span>
                  </li>
                ))}
                {shown.analysis.unmatched.length ? (
                  <li>
                    <strong>Unmatched</strong>
                    <span>
                      {orderedMeld(shown.analysis.unmatched, cardOf).map(cardName).join(', ')}
                    </span>
                  </li>
                ) : null}
              </ul>
            </>
          ) : null}
        </details>
      ) : null}
      <p className="small muted table-help">
        Two sequences, including one pure sequence. A false declaration costs 80 points.
        {match.actions.some((option) => option.value.type === 'fold')
          ? ` Dropping now costs ${dropCost} points.`
          : ''}
      </p>
      <Modal
        open={Boolean(confirm?.kind === 'declare' && confirm.version === room.matchVersion)}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title="Declare an invalid hand?"
        description="The remaining cards do not form a valid declaration. This will end your participation with an 80-point penalty."
      >
        <Button variant="secondary" onClick={() => setConfirm(null)}>
          Keep playing
        </Button>
        <Button disabled={pending || room.paused} onClick={commitConfirmed}>
          Declare for 80 points
        </Button>
      </Modal>
      <Modal
        open={Boolean(confirm?.kind === 'drop' && confirm.version === room.matchVersion)}
        onOpenChange={(open) => {
          if (!open) setConfirm(null);
        }}
        title={`Drop for ${dropCost} points?`}
        description={`You sit out the rest of this deal and lose ${dropCost} points.${
          activeOthers.length === 1
            ? ` ${playerName(room, activeOthers[0].id)} is the only other player left, so they win the deal now.`
            : ' The others keep playing.'
        }`}
      >
        <Button variant="secondary" onClick={() => setConfirm(null)}>
          Keep playing
        </Button>
        <Button variant="danger" disabled={pending || room.paused} onClick={commitConfirmed}>
          Drop for {dropCost}
        </Button>
      </Modal>
    </div>
  );
}
