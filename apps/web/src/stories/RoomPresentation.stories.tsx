import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Seat, TurnNotice } from '@games/ui';
import { mapRoom } from '@games/api-client/mappers';
import { gameById } from '@games/api-client/catalog';
import { RoomResults } from '@/features/room/RoomResults';
import { fixtures } from './generated/rooms';

function RoomPresentation({
  mode = 'active',
}: {
  mode?: 'active' | 'reaction' | 'pending' | 'paused' | 'team-loss' | 'penalties' | 'no-score';
}) {
  const fixture = fixtures.find((item) => item.room.game_id === 'uno' && item.room.capacity === 2)!;
  const room = mapRoom(fixture.room);
  const game = gameById('uno');
  if (['team-loss', 'penalties', 'no-score'].includes(mode)) {
    return (
      <RoomResults
        room={{
          ...room,
          game: {
            ...room.game!,
            phase: 'finished',
            winners: mode === 'team-loss' ? [] : [room.game!.players[1].id],
            players: room.game!.players.map((player, i) => ({
              ...player,
              score: mode === 'team-loss' ? 1 : i ? 8 : 31,
            })),
          },
        }}
        game={{
          ...game,
          playMode: mode === 'team-loss' ? 'cooperative' : 'competitive',
          scoreLabel: mode === 'team-loss' ? 'Vaults' : 'Penalty points',
          scoreOrder: mode === 'no-score' ? 'none' : 'low',
        }}
      />
    );
  }
  return (
    <div style={{ maxWidth: 760, display: 'grid', gap: 20 }}>
      <TurnNotice
        label={
          mode === 'paused' ? 'Game paused' : mode === 'reaction' ? 'Your decision' : 'Your turn'
        }
        message={
          mode === 'paused'
            ? 'Waiting for your friend to reconnect.'
            : 'A friend played a card. Choose your next move.'
        }
        tone={mode === 'paused' ? 'paused' : 'active'}
        pending={mode === 'pending'}
      />
      <Seat name="A friend with an exceptionally long name" nameLayout="wrap" you ready />
    </div>
  );
}
const meta = {
  title: 'Games/Room presentation',
  component: RoomPresentation,
} satisfies Meta<typeof RoomPresentation>;
export default meta;
type Story = StoryObj<typeof meta>;
export const YourTurn: Story = {};
export const Reaction: Story = { args: { mode: 'reaction' } };
export const Saving: Story = { args: { mode: 'pending' } };
export const Paused: Story = { args: { mode: 'paused' } };
export const TeamDefeat: Story = { args: { mode: 'team-loss' } };
export const LowScoreWins: Story = { args: { mode: 'penalties' } };
export const NoScore: Story = { args: { mode: 'no-score' } };
