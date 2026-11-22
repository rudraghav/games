import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Modal } from '@games/ui';
import { TarotCardGuide } from '@/games/tarot/TarotCardGuide';

const meta = {
  title: 'Games/Tarot card guide',
  component: TarotCardGuide,
  args: { cardId: 'major-02' },
} satisfies Meta<typeof TarotCardGuide>;
export default meta;
type Story = StoryObj<typeof meta>;

export const HighPriestessUpright: Story = {};
export const FiveOfCupsReversed: Story = {
  args: { cardId: 'cups-05', orientation: 'reversed', position: 'What is shifting' },
};
export const DeathUpright: Story = { args: { cardId: 'major-13' } };
export const TenOfSwordsReversed: Story = {
  args: { cardId: 'swords-10', orientation: 'reversed' },
};
export const QueenOfPentacles: Story = { args: { cardId: 'pentacles-13' } };
export const EightOfWands: Story = { args: { cardId: 'wands-08', position: 'Your next move' } };
/** The same page inside the shared dialog, where it is narrower than the window. */
export const InADialog: Story = {
  args: { cardId: 'major-16', orientation: 'reversed', position: 'Where you are' },
  render: (args) => (
    <Modal open onOpenChange={() => undefined} title="Card guide" wide>
      <TarotCardGuide {...args} />
    </Modal>
  ),
};
