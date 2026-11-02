'use client';

import { useState } from 'react';
import { mapRoom } from '@games/api-client/mappers';
import type { Action } from '@games/api-client';
import type { components } from '@games/api-client/wire';
import { DealTable } from '@/games/deal/DealTable';
import { dealScenarios } from '@/stories/generated/deal-scenarios';

const actionKey = (action: Action) =>
  JSON.stringify(Object.fromEntries(Object.entries(action).sort(([a], [b]) => a.localeCompare(b))));
type WireRoom = components['schemas']['RoomView'];

/** Local-only review harness. Fixtures contain personalized public projections. */
export function DealWorkspaceReview() {
  const [index, setIndex] = useState(0);
  const [snapshot, setSnapshot] = useState<WireRoom | null>(null);
  const [submitted, setSubmitted] = useState<Action | null>(null);
  const [pending, setPending] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const fixture = dealScenarios[index];
  const room = mapRoom(snapshot || fixture.room);
  const reset = () => {
    setSnapshot(null);
    setSubmitted(null);
    setResetCount((value) => value + 1);
  };
  function record(action: Action) {
    setSubmitted(action);
    const transition = fixture.transitions.find(
      (item) => actionKey(item.action) === actionKey(action),
    );
    if (transition) setSnapshot(transition.room);
  }
  return (
    <main className="page-width" style={{ paddingBlock: 24 }}>
      <h1 className="heading-md">Deal workspace review</h1>
      <p className="small muted">
        Synthetic engine scenarios. No room, account or database changes.
      </p>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'end', marginBlock: 20 }}
      >
        <label className="field" style={{ flex: '1 1 240px' }}>
          Deal scenario
          <select
            className="input"
            value={fixture.id}
            onChange={(event) => {
              setIndex(dealScenarios.findIndex((item) => item.id === event.target.value));
              reset();
            }}
          >
            {dealScenarios.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="button button-secondary" onClick={reset}>
          Reset scenario
        </button>
        <label>
          <input
            type="checkbox"
            checked={pending}
            onChange={(event) => setPending(event.target.checked)}
          />{' '}
          Saving a move
        </label>
        <label>
          <input
            type="checkbox"
            checked={disconnected}
            onChange={(event) => setDisconnected(event.target.checked)}
          />{' '}
          Disconnected
        </label>
      </div>
      {room.game ? (
        <DealTable
          key={`${fixture.id}:${room.matchVersion}:${resetCount}`}
          room={{ ...room, paused: disconnected }}
          match={room.game}
          selfId={fixture.selfId}
          pending={pending}
          onAction={record}
        />
      ) : null}
      <details style={{ marginTop: 24 }} open={Boolean(submitted)}>
        <summary>Recorded UI action</summary>
        <output
          aria-label="Submitted action"
          style={{ display: 'block', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
        >
          {submitted ? JSON.stringify(submitted) : 'No action submitted'}
        </output>
      </details>
    </main>
  );
}
