import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { mapRoom } from '@games/api-client/mappers';
import { tableRegistry } from '@/games/registry';
import { midgameScenarios } from './generated/midgame-scenarios';
import { fixtures } from './generated/rooms';

/**
 * Housie, Liar's Dice, Bluff and Truth or Dare on legally reached tables.
 * Every scenario uses the default settings, so Truth or Dare is always the
 * friendly edition here: no 18+ prompt or fate ever appears in a story.
 */
function ParlourPreview({
  scenario,
  opening,
  pending = false,
  disconnected = false,
}: {
  /** A legal mid-game state from `scripts/export_midgame_scenarios.py`. */
  scenario?: string;
  /** Or an opening table from `scripts/export_fixtures.py`. */
  opening?: string;
  pending?: boolean;
  disconnected?: boolean;
}) {
  const source = scenario
    ? midgameScenarios.find((item) => item.id === scenario)!
    : fixtures.find((item) => item.label === opening)!;
  const room = mapRoom(source.room);
  const Table = tableRegistry[room.gameId];
  return (
    <Table
      room={{ ...room, paused: disconnected }}
      match={room.game!}
      selfId={source.selfId}
      onAction={() => undefined}
      pending={pending}
    />
  );
}
const meta = { title: 'Games/Parlour games', component: ParlourPreview } satisfies Meta<
  typeof ParlourPreview
>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HousieOpening: Story = { args: { opening: 'Housie · minimum seats' } };
export const HousieClaim: Story = { args: { scenario: 'housie-2-17-43' } };
export const HousieTenTickets: Story = { args: { scenario: 'housie-10-31-65' } };
export const LiarsDiceOpeningBid: Story = { args: { scenario: 'liars-dice-2-17-2' } };
export const LiarsDiceFacingABid: Story = { args: { scenario: 'liars-dice-6-31-54' } };
export const LiarsDiceReveal: Story = { args: { scenario: 'liars-dice-6-31-68' } };
export const BluffStartingARound: Story = { args: { scenario: 'bluff-2-17-3' } };
export const BluffFollowing: Story = { args: { scenario: 'bluff-6-31-2' } };
export const BluffReveal: Story = { args: { scenario: 'bluff-6-31-8' } };
export const TruthOrDareChoosing: Story = { args: { scenario: 'truth-or-dare-2-17-3' } };
export const TruthOrDareDare: Story = { args: { scenario: 'truth-or-dare-2-17-2' } };
export const TruthOrDareBurningBuilding: Story = { args: { scenario: 'truth-or-dare-10-31-8' } };
export const TruthOrDareResult: Story = { args: { scenario: 'truth-or-dare-10-31-9' } };
export const Pending: Story = { args: { scenario: 'liars-dice-6-31-54', pending: true } };
export const Disconnected: Story = { args: { scenario: 'bluff-6-31-2', disconnected: true } };
