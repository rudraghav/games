import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { GameLibrary } from '@/features/lounge/GameLibrary';
import { RoomShortcut } from '@/features/lounge/RoomShortcut';
import { GameTile } from '@games/ui';
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
