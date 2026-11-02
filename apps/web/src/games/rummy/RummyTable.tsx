'use client';
import { useState } from 'react';
import type { Card } from '@games/api-client';
import { Button, Hand, DecisionDock } from '@games/ui';
import type { TableProps } from '../types';
import { PlayerStrip } from '../shared/PlayerStrip';
import { ActionPanel } from '../shared/ActionPanel';
import { TablePile } from '../shared/TablePile';

const buckets = ['Ungrouped', 'Group 1', 'Group 2', 'Group 3', 'Group 4'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '★'];
export function RummyTable(props: TableProps) {
  const { match, room, pending, onAction } = props;
  const [selected, setSelected] = useState<string | null>(null);
  const [groups, setGroups] = useState<Record<string, number>>({});
  const [sort, setSort] = useState('dealt');
  const selectedCard = match.hand.find((card) => card.id === selected);
  const drawStock = match.actions.find((option) => option.value.type === 'draw_stock');
  const drawDiscard = match.actions.find((option) => option.value.type === 'draw_discard');
  const decisionMatch = {
    ...match,
    actions: match.actions.filter(
      (option) => !['draw_stock', 'draw_discard'].includes(option.value.type),
    ),
  };
  function arranged(cards: Card[]) {
    return sort === 'dealt'
      ? cards
      : [...cards].sort((a, b) => {
          const rankDifference = ranks.indexOf(a.value) - ranks.indexOf(b.value);
          return sort === 'suit'
            ? a.suit.localeCompare(b.suit) || rankDifference
            : rankDifference || a.suit.localeCompare(b.suit);
        });
  }
  return (
    <div className="table-layout stable-game-table card-game-layout rummy-layout">
      <PlayerStrip {...props} />
      <div className="card-table felt-table">
        <span className="table-watermark">g.</span>
        <div className="center-piles">
          <TablePile
            label="Draw pile"
            count={match.drawCount}
            action={drawStock}
            onAction={onAction}
            pending={pending}
            paused={room.paused}
          />
          <TablePile
            label="Discard"
            card={match.discard}
            action={drawDiscard}
            onAction={onAction}
            pending={pending}
            paused={room.paused}
          />
        </div>
        <span className="table-detail">Wild rank: {String(match.detail.wild_rank)}</span>
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
                onChange={(event) => setSort(event.target.value)}
              >
                <option value="dealt">As dealt</option>
                <option value="suit">By suit</option>
                <option value="rank">By rank</option>
              </select>
            </label>
          </div>
        </div>
        <DecisionDock
          className="rummy-group-controls"
          size="compact"
          role="group"
          label={selectedCard ? `Move ${selectedCard.label} to a group` : 'Arrange card groups'}
        >
          <span className="small">
            {selectedCard ? `Group ${selectedCard.label}` : 'Select a card to arrange your groups.'}
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
                  setGroups((previous) => ({ ...previous, [selectedCard.id]: bucket }))
                }
              >
                {label}
              </Button>
            ))}
          </div>
        </DecisionDock>
        <div className="rummy-groups">
          {buckets.map((label, bucket) => {
            const cards = arranged(match.hand.filter((card) => (groups[card.id] ?? 0) === bucket));
            return cards.length ? (
              <div className="rummy-group" key={label}>
                <span className="eyebrow">{label}</span>
                <Hand
                  cards={cards}
                  disabled={pending || room.paused}
                  label={label}
                  selectedIds={selectedCard ? [selectedCard.id] : []}
                  onSelect={(id) => setSelected(id === selected ? null : id)}
                />
              </div>
            ) : null;
          })}
        </div>
      </section>
      <ActionPanel
        {...props}
        match={decisionMatch}
        selected={selectedCard?.id}
        cardSelectionRequired
        pinSelection
        instruction={
          match.actions.length
            ? match.phase === 'draw'
              ? 'Draw from either available pile. Arrange your hand at any time.'
              : !selectedCard
                ? 'Select a card to discard or declare.'
                : undefined
            : undefined
        }
        clear={() => setSelected(null)}
        onAction={(action) => {
          props.onAction(action);
          setSelected(null);
        }}
      />
      <p className="small muted table-help">
        Two sequences, including one pure sequence. A false declaration costs 80 points.
      </p>
    </div>
  );
}
