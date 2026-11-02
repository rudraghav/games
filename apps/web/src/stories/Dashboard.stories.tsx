import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GameLibrary } from '@/features/lounge/GameLibrary';
import { RoomShortcut } from '@/features/lounge/RoomShortcut';
import { GameTile, SegmentedTabs } from '@games/ui';
import { LoungeRooms } from '@/features/lounge/Lounge';
import { gameById } from '@games/api-client/catalog';
import { GameArt } from '@/shared/GameArt';

const meta = {
  title: 'Dashboard/Discovery',
  component: GameLibrary,
  args: { onChoose: () => undefined },
} satisfies Meta<typeof GameLibrary>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Catalogue: Story = {};
export const SoloTile: Story = {
  render: () => {
    const game = gameById('uno');
    return (
      <div className="game-library" style={{ maxWidth: 260 }}>
        <GameTile
          name={game.name}
          subtitle={game.subtitle}
          minPlayers={game.minPlayers}
          maxPlayers={game.maxPlayers}
          minutes={game.minutes}
          tone={game.color}
          artwork={<GameArt game={game} />}
          soloMode
          onChoose={() => undefined}
        />
      </div>
    );
  },
};
export const MemberRoomShortcuts: Story = {
  render: () => (
    <div className="room-shortcuts" style={{ maxWidth: 700 }}>
      <RoomShortcut
        room={{
          id: 'preview-one',
          name: 'Friday table',
          gameId: 'uno',
          status: 'playing',
          players: 4,
        }}
      />
      <RoomShortcut
        room={{
          id: 'preview-two',
          name: 'A table with a deliberately long room name for friends',
          gameId: 'azul',
          status: 'lobby',
          players: 2,
        }}
      />
    </div>
  ),
};

const memberRooms = [
  { id: 'preview-one', name: 'Friday table', gameId: 'uno', status: 'playing', players: 4 },
  { id: 'preview-two', name: 'Azul with friends', gameId: 'azul', status: 'lobby', players: 2 },
  { id: 'preview-three', name: 'Last game', gameId: 'holdem', status: 'finished', players: 3 },
];
function TabbedDashboard({
  state = 'member',
  initial = 'games',
}: {
  state?: 'member' | 'empty' | 'loading' | 'error';
  initial?: 'games' | 'rooms';
}) {
  const [tab, setTab] = useState<'games' | 'rooms'>(initial);
  return (
    <div style={{ maxWidth: 1120 }}>
      <SegmentedTabs
        label="Browse"
        value={tab}
        onValueChange={setTab}
        items={[
          { value: 'games', label: 'Games', content: <GameLibrary onChoose={() => undefined} /> },
          {
            value: 'rooms',
            label: 'Rooms',
            content: (
              <LoungeRooms
                rooms={state === 'member' ? memberRooms : []}
                loading={state === 'loading'}
                error={state === 'error'}
                onRetry={() => undefined}
              />
            ),
          },
        ]}
      />
    </div>
  );
}
export const GamesAndRooms: Story = { render: () => <TabbedDashboard /> };
export const MemberRooms: Story = { render: () => <TabbedDashboard initial="rooms" /> };
export const EmptyRooms: Story = {
  render: () => <TabbedDashboard initial="rooms" state="empty" />,
};
export const LoadingRooms: Story = {
  render: () => <TabbedDashboard initial="rooms" state="loading" />,
};
export const RoomsUnavailable: Story = {
  render: () => <TabbedDashboard initial="rooms" state="error" />,
};
