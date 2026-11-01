'use client';
import { useState } from 'react';
import { CardPile, Hand } from '@games/ui';
import { gameById } from '@games/api-client/catalog';
import type { TableProps } from '../types';
import { ActionPanel } from './ActionPanel';
import { PlayerStrip } from './PlayerStrip';

export function CardTable(props: TableProps) {
  const { match } = props;
  const [selected, setSelected] = useState<string | null>(null);
  const [sort, setSort] = useState('dealt');
  const family = gameById(match.id).family === 'shedding' ? 'shedding' : 'standard';
  const cards =
    sort === 'dealt'
      ? match.hand
      : [...match.hand].sort((a, b) =>
          sort === 'suit'
            ? `${a.suit}-${a.value}`.localeCompare(`${b.suit}-${b.value}`, undefined, {
                numeric: true,
              })
            : a.value.localeCompare(b.value, undefined, { numeric: true }),
        );
  return (
    <div className="table-layout">
      <PlayerStrip {...props} />
      <div className="card-table felt-table">
        <span className="table-watermark">g.</span>
        <div className="center-piles">
          <CardPile label="Draw pile" count={match.drawCount} family={family} />
          <CardPile label="Discard" card={match.discard} family={family} />
        </div>
        {match.detail.color ? (
          <span className="table-detail">Current colour: {String(match.detail.color)}</span>
        ) : null}
        {match.detail.wild_rank ? (
          <span className="table-detail">Wild rank: {String(match.detail.wild_rank)}</span>
        ) : null}
      </div>
      <div className="private-hand">
        <div className="hand-heading">
          <h3>
            Your hand <span className="muted">{match.hand.length}</span>
          </h3>
          {match.id === 'rummy' ? (
            <label className="small">
              Sort{' '}
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
          ) : null}
        </div>
        <Hand
          family={family}
          cards={cards}
          selectedIds={selected ? [selected] : []}
          onSelect={(id) => setSelected(id === selected ? null : id)}
        />
      </div>
      <ActionPanel
        {...props}
        selected={selected}
        clear={() => setSelected(null)}
        onAction={(action) => {
          props.onAction(action);
          setSelected(null);
        }}
      />
    </div>
  );
}
