'use client';
import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Button } from '@games/ui';
import { mapRoom } from '@games/api-client/mappers';
import { CasinoTable } from '@/games/casino/CasinoTable';
import type { components } from '@games/api-client/wire';
import sequences from './fixtures/casino-motion.json';

type Game = keyof typeof sequences;
/** Deterministic legal matches, exported from engines as authorized projections. */
function CasinoMotionPreview({ game = 'holdem' }: { game?: Game }) {
  const data = sequences[game];
  const [index, setIndex] = useState(0);
  const [generation, setGeneration] = useState(0);
  const [paused, setPaused] = useState(false);
  const snapshot = data.snapshots[Math.min(index, data.snapshots.length - 1)];
  const room = mapRoom({ ...snapshot, paused } as components['schemas']['RoomView']);
  return (
    <main style={{ maxWidth: 1180, margin: 'auto', padding: '12px 0' }}>
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          flexWrap: 'wrap',
          marginBottom: 18,
        }}
      >
        <Button
          onClick={() => setIndex((current) => Math.min(current + 1, data.snapshots.length - 1))}
          disabled={index >= data.snapshots.length - 1}
        >
          Next move
        </Button>
        <Button
          variant="secondary"
          onClick={() => setIndex((current) => Math.min(current + 5, data.snapshots.length - 1))}
        >
          Skip five versions
        </Button>
        <Button variant="secondary" onClick={() => setGeneration((current) => current + 1)}>
          Refresh table
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            setIndex(0);
            setGeneration((current) => current + 1);
          }}
        >
          Restart preview
        </Button>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', minHeight: 44 }}>
          <input
            type="checkbox"
            checked={paused}
            onChange={(event) => setPaused(event.target.checked)}
          />
          Pause connection
        </label>
        <span className="small muted" aria-label="Preview version">
          Version {room.matchVersion} of {data.snapshots.length}
        </span>
      </div>
      <CasinoTable
        key={`${game}:${generation}`}
        room={room}
        match={room.game!}
        selfId={data.selfId}
        pending={false}
        onAction={() => undefined}
      />
    </main>
  );
}
const meta = { title: 'Games/Casino motion', component: CasinoMotionPreview } satisfies Meta<
  typeof CasinoMotionPreview
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Poker: Story = { args: { game: 'holdem' } };
export const TeenPatti: Story = { args: { game: 'teen-patti' } };
export const SplitBlackjack: Story = { args: { game: 'blackjack' } };
