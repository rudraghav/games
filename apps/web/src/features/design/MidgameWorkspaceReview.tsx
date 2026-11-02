'use client';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mapRoom } from '@games/api-client/mappers';
import type { Action, Room } from '@games/api-client';
import type { components } from '@games/api-client/wire';
import { tableRegistry } from '@/games/registry';
import { midgameScenarios, type MidgameScenario } from '@/stories/generated/midgame-scenarios';

type GameView = components['schemas']['GameView'];
const actionKey = (action: Action) =>
  JSON.stringify(Object.fromEntries(Object.entries(action).sort(([a], [b]) => a.localeCompare(b))));

/** Public, reproducible legal trajectories. This route cannot write real rooms. */
export function MidgameWorkspaceReview() {
  const [scenarioId, setScenarioId] = useState(midgameScenarios[0].id);
  const [next, setNext] = useState<GameView | null>(null);
  const [submitted, setSubmitted] = useState<Action | null>(null);
  const [pending, setPending] = useState(false);
  const [disconnected, setDisconnected] = useState(false);
  const [resetCount, setResetCount] = useState(0);
  const fixture = midgameScenarios.find((item) => item.id === scenarioId)!;
  const games = [...new Map(midgameScenarios.map((item) => [item.game, item.room.game_id])).keys()];
  const scenarios = midgameScenarios.filter((item) => item.game === fixture.game);
  const room = mapRoom({
    ...fixture.room,
    ...(next
      ? {
          game: next,
          match_version: fixture.step + 1,
          status: next.phase === 'finished' ? 'finished' : 'playing',
        }
      : {}),
  });
  function reset(id = fixture.id) {
    setScenarioId(id);
    setNext(null);
    setSubmitted(null);
    setResetCount((value) => value + 1);
  }
  function record(action: Action) {
    setSubmitted(action);
    if (actionKey(action) === actionKey(fixture.next.action)) setNext(fixture.next.game);
  }
  return (
    <main className="page-width" style={{ paddingBlock: 24 }}>
      <h1 className="heading-md">Mid-game workspace review</h1>
      <p className="small muted" style={{ marginBlock: 12 }}>
        Legally reached engine projections at both player limits. No account or database writes.
      </p>
      <div
        style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'end', marginBlock: 16 }}
      >
        <label className="field" style={{ flex: '1 1 180px' }}>
          Game
          <select
            className="input"
            value={fixture.game}
            onChange={(event) =>
              reset(midgameScenarios.find((item) => item.game === event.target.value)!.id)
            }
          >
            {games.map((game) => (
              <option value={game} key={game}>
                {game}
              </option>
            ))}
          </select>
        </label>
        <label className="field" style={{ flex: '2 1 260px' }}>
          Mid-game scenario
          <select
            className="input"
            value={fixture.id}
            onChange={(event) => reset(event.target.value)}
          >
            {scenarios.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="button button--secondary button--md"
          onClick={() => reset()}
        >
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
      <div className="midgame-review-table" data-midgame={fixture.id}>
        <PreviewTable
          key={`${fixture.id}:${resetCount}`}
          fixture={fixture}
          room={{ ...room, paused: disconnected }}
          pending={pending}
          onAction={record}
        />
      </div>
      <details style={{ marginTop: 18 }}>
        <summary>Recorded legal continuation</summary>
        <p className="small muted">
          Reached after {fixture.step} legal actions from seed {fixture.seed}, {fixture.seats}{' '}
          seats. Applying this recorded move changes only this local projection.
        </p>
        <button
          type="button"
          className="button button--secondary button--md"
          onClick={() => record(fixture.next.action)}
        >
          Apply recorded legal move
        </button>
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

function PreviewTable({
  fixture,
  room,
  pending,
  onAction,
}: {
  fixture: MidgameScenario;
  room: Room;
  pending: boolean;
  onAction: (action: Action) => void;
}) {
  const [previewCache] = useState(() => {
    const cache = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    cache.setQueryData(['tarot-reading', fixture.room.id, fixture.room.match_id], {
      status: 'unavailable',
      reading: null,
      api_tier: 'free',
      message: 'AI generation is disabled in this local preview.',
    });
    return cache;
  });
  const Table = tableRegistry[fixture.game];
  return (
    <QueryClientProvider client={previewCache}>
      {room.game ? (
        <Table
          room={room}
          match={room.game}
          selfId={fixture.selfId}
          pending={pending}
          onAction={onAction}
        />
      ) : null}
    </QueryClientProvider>
  );
}
