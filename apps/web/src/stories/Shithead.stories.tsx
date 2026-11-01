import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { mapRoom } from '@games/api-client/mappers';
import { ShitheadTable } from '@/games/shithead/ShitheadTable';
import { fixtures } from './generated/rooms';

function ShitheadPreview({
  maximum = false,
  pending = false,
  disconnected = false,
}: {
  maximum?: boolean;
  pending?: boolean;
  disconnected?: boolean;
}) {
  const fixture = fixtures.find(
    (f) => f.room.game_id === 'shithead' && f.room.capacity === (maximum ? 5 : 2),
  )!;
  const room = mapRoom(fixture.room);
  return (
    <ShitheadTable
      room={{ ...room, paused: disconnected }}
      match={room.game!}
      selfId={fixture.selfId}
      onAction={() => undefined}
      pending={pending}
    />
  );
}
const meta = { title: 'Games/Shithead', component: ShitheadPreview } satisfies Meta<
  typeof ShitheadPreview
>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Setup: Story = {};
export const FivePlayers: Story = { args: { maximum: true } };
export const Pending: Story = { args: { pending: true } };
export const Disconnected: Story = { args: { disconnected: true } };
