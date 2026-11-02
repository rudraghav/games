import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TarotReading } from '@/games/tarot/TarotReading';
import { tarotReadingCards, tarotReadingExample } from './fixtures/tarot-reading';

const meta = {
  title: 'Games/Tarot reading',
  component: TarotReading,
  args: { reading: tarotReadingExample, cards: tarotReadingCards },
  decorators: [
    (Story) => (
      <main className="tarot-table">
        <Story />
      </main>
    ),
  ],
} satisfies Meta<typeof TarotReading>;
export default meta;
type Story = StoryObj<typeof meta>;

export const PersonalReading: Story = {};
export const TwoCharacterConnections: Story = {
  args: {
    reading: {
      ...tarotReadingExample,
      cards: tarotReadingExample.cards.map((card, index) => ({
        ...card,
        characters:
          index === 0
            ? [
                ...card.characters,
                {
                  name: 'Chihiro',
                  source: 'Spirited Away',
                  connection:
                    'Her first uncertain steps into an unfamiliar world mirror this card’s willingness to begin.',
                },
              ]
            : card.characters,
      })),
    },
  },
};
export const SavedEarlierReading: Story = {
  args: {
    reading: {
      ...tarotReadingExample,
      cards: tarotReadingExample.cards.map((card) => ({
        ...card,
        quirky_interpretation: null,
        characters: [],
        pop_culture:
          'Like Chihiro in Spirited Away, a new experience invites a small, brave first step.',
      })),
    },
  },
};
export const CharactersAndLongNames: Story = {
  args: {
    reading: {
      ...tarotReadingExample,
      cards: tarotReadingExample.cards.map((card, index) => ({
        ...card,
        characters:
          index === 0
            ? [
                {
                  name: 'Princess Peach',
                  source: 'Super Mario',
                  connection:
                    'Her calm agency is a reminder to choose the next step for yourself, even when the adventure gets chaotic.',
                },
                {
                  name: 'Miles Morales',
                  source: 'Spider-Man: Into the Spider-Verse',
                  connection:
                    'He learns by taking a small leap before he has every answer. Your creative experiment can begin the same way.',
                },
              ]
            : index === 1
              ? [
                  {
                    name: 'Chidi Anagonye',
                    source: 'The Good Place',
                    connection:
                      'Careful thought helps until it stops you trying. Let one imperfect, thoughtful experiment answer the next question.',
                  },
                ]
              : card.characters,
      })),
    },
  },
};
