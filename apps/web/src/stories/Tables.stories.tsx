import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { mapRoom } from '@games/api-client/mappers';
import { tableRegistry } from '@/games/registry';
import { fixtures } from './generated/rooms';

function TablePreview({
  scenario = 0,
  pending = false,
  disconnected = false,
}: {
  scenario?: number;
  pending?: boolean;
  disconnected?: boolean;
}) {
  const fixture = fixtures[scenario];
  const room = mapRoom(fixture.room);
  const Table = tableRegistry[room.gameId];
  if (!room.game) return null;
  return (
    <main style={{ maxWidth: 1100, margin: 'auto' }}>
      <Table
        room={{ ...room, paused: disconnected }}
        match={room.game}
        selfId={fixture.selfId}
        onAction={() => undefined}
        pending={pending}
      />
    </main>
  );
}
const meta = {
  title: 'Games/Tables',
  component: TablePreview,
  argTypes: {
    scenario: {
      control: 'select',
      options: fixtures.map((_, i) => i),
      mapping: {},
      labels: Object.fromEntries(fixtures.map((fixture, i) => [i, fixture.label])),
    },
  },
} satisfies Meta<typeof TablePreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Uno: Story = { args: { scenario: 0 } };
export const MaximumHand: Story = { args: { scenario: 1 } };
export const NoMercy: Story = { args: { scenario: 3 } };
export const Property: Story = { args: { scenario: 5 } };
export const Poker: Story = { args: { scenario: 9 } };
export const Skyjo: Story = { args: { scenario: 17 } };
export const Tarot: Story = { args: { scenario: 18 } };
export const FourInARow: Story = { args: { scenario: 20 } };
export const Reversi: Story = { args: { scenario: 22 } };
export const WordAgents: Story = { args: { scenario: 25 } };
export const GemMarket: Story = { args: { scenario: 27 } };
export const Pending: Story = { args: { scenario: 1, pending: true } };
export const Disconnected: Story = { args: { scenario: 9, disconnected: true } };
