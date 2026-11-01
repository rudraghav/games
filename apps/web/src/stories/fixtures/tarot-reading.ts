import type { ReadingView } from '@games/api-client';

// Non-personal creative-hobby evaluation, Gemini 3.5 Flash-Lite, 1 November 2026.
// Editorial sample based on a saved real response; one company-name typo corrected.
export const tarotReadingExample = {
  title: 'A Gentle Creative Tarot Reflection',
  introduction:
    'Welcome to your reading. You are looking to carve out space for a new creative hobby amidst the bustle of everyday life. Let us look at what the cards reveal about your starting point, your shifting energy, and your best path forward.',
  cards: [
    {
      card_id: 'major-00',
      position: 'Where you are',
      title: 'The Fool',
      interpretation:
        'You stand at the threshold of a fresh endeavor, fueled by genuine curiosity and an openness to new experiences. Taking a thoughtful leap means acknowledging that you do not need to have everything figured out right away to begin.',
      pop_culture: null,
      quirky_interpretation:
        'You are currently like someone buying specialized mountaineering gear for a walk in a very gentle park. Your enthusiasm is boundless, even if your backpack is currently full of snacks and optimism rather than actual survival tools.',
      characters: [
        {
          name: 'Michael Scott',
          source: 'The Office',
          connection:
            'Much like Michael diving headfirst into Dunder Mifflin events or grandiose schemes with absolute earnestness, you are embracing a brand new pursuit with total, unadulterated dedication and an endearing lack of a concrete plan.',
        },
      ],
    },
    {
      card_id: 'wands-01',
      position: 'What is shifting',
      title: 'Ace of Wands',
      interpretation:
        'A bright creative spark is demanding your attention, whispering that it is time for a small, tangible experiment. Your enthusiasm is building up momentum and urgently needs a constructive, joyful outlet to express itself.',
      pop_culture: null,
      quirky_interpretation:
        'Your inner creative energy is buzzing like a tiny spaceship engine that has just been jump-started with a bunch of cosmic batteries and a very determined raccoon pressing buttons.',
      characters: [
        {
          name: 'Tony Stark',
          source: 'Iron Man',
          connection:
            'Similar to Tony tinkering late into the night in his workshop on a sudden breakthrough invention, you are experiencing a sudden surge of raw inspiration that simply has to be built, tested, and played with.',
        },
      ],
    },
    {
      card_id: 'major-08',
      position: 'Your next move',
      title: 'Strength',
      interpretation:
        'When obstacles or self-doubt arise, meet them with patient, gentle courage rather than harsh self-discipline. Lasting habits are built through steady, compassionate persistence instead of demanding perfection from yourself right out of the gate.',
      pop_culture: null,
      quirky_interpretation:
        'Think of this as gently convincing a very stubborn, sleepy house cat to move off your keyboard, using soft purrs and patience rather than attempting to wrestle a majestic lion into submission.',
      characters: [
        {
          name: 'Matilda Wormwood',
          source: 'Matilda',
          connection:
            'Just as Matilda quietly uses her inner quiet resilience and focus to navigate a chaotic environment, you are called to handle your schedule constraints with calm, steadfast determination.',
        },
      ],
    },
  ],
  next_step:
    'Spend ten minutes today gathering your supplies for your hobby and place them in plain sight as a friendly invitation to play.',
} satisfies NonNullable<ReadingView['reading']>;

export const tarotReadingCards = [
  { id: 'major-00', label: 'The Fool' },
  { id: 'wands-01', label: 'Ace of Wands' },
  { id: 'major-08', label: 'Strength' },
];
