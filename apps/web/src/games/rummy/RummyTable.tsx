'use client';
import { useState } from 'react';
import type { Card } from '@games/api-client';
import { CardPile, Hand } from '@games/ui';
import type { TableProps } from '../types';
import { PlayerStrip } from '../shared/PlayerStrip';
import { ActionPanel } from '../shared/ActionPanel';

const buckets = ['Ungrouped', 'Group 1', 'Group 2', 'Group 3', 'Group 4'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '★'];
export function RummyTable(props: TableProps) {
  const { match } = props;
  const [selected, setSelected] = useState<string | null>(null);
  const [groups, setGroups] = useState<Record<string, number>>({});
  const [sort, setSort] = useState('dealt');
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
    <div className="table-layout card-game-layout rummy-layout">
      <PlayerStrip {...props} />
      <div className="card-table felt-table">
        <span className="table-watermark">g.</span>
        <div className="center-piles">
          <CardPile label="Draw pile" count={match.drawCount} />
          <CardPile label="Discard" card={match.discard} />
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
            <label className="small">
              Move selected card
              <select
                className="input input--small"
                disabled={!selected}
                value={selected ? (groups[selected] ?? 0) : 0}
                onChange={(event) => {
                  if (selected)
                    setGroups((previous) => ({
                      ...previous,
                      [selected]: Number(event.target.value),
                    }));
                }}
              >
                {buckets.map((label, i) => (
                  <option key={label} value={i}>
                    {label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <div className="rummy-groups">
          {buckets.map((label, bucket) => {
            const cards = arranged(match.hand.filter((card) => (groups[card.id] ?? 0) === bucket));
            return cards.length ? (
              <div className="rummy-group" key={label}>
                <span className="eyebrow">{label}</span>
                <Hand
                  cards={cards}
                  label={label}
                  selectedIds={selected ? [selected] : []}
                  onSelect={(id) => setSelected(id === selected ? null : id)}
                />
              </div>
            ) : null;
          })}
        </div>
      </section>
      <ActionPanel
        {...props}
        selected={selected}
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
