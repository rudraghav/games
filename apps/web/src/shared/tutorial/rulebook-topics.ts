/** Each heading starts at the given rule in the published catalogue. */
type RuleTopic = readonly [firstRule: number, heading: string];

const partyTopics: RuleTopic[] = [
  [0, 'Spotlight turns'],
  [2, 'Scoring and passing'],
];

export const rulebookTopics: Record<string, RuleTopic[]> = {
  uno: [
    [0, 'Matching and drawing'],
    [1, 'Calling UNO'],
    [2, 'Penalties, stacking and Draw Four'],
  ],
  'uno-no-mercy': [
    [0, 'Matching cards and calling UNO'],
    [2, 'Elimination, penalties and stacking'],
  ],
  deal: [
    [0, 'Sets and turn limits'],
    [2, 'Rent and counters'],
    [4, 'Buildings'],
  ],
  'deal-no-mercy': [
    [0, 'Sets and turn limits'],
    [2, 'Debt and counters'],
    [4, 'Buildings and house deck'],
  ],
  holdem: [
    [0, 'Your hand'],
    [1, 'Blinds and betting'],
  ],
  rummy: [
    [0, 'Turns and declarations'],
    [2, 'Jokers and discards'],
    [4, 'Points and drops'],
  ],
  'teen-patti': [
    [0, 'Playing blind or seen'],
    [1, 'Hands and stakes'],
  ],
  roulette: [
    [0, 'Choosing a bet'],
    [2, 'Zero and the final balance'],
  ],
  slots: [
    [0, 'Stakes and symbols'],
    [2, 'Returns and the final balance'],
  ],
  blackjack: [
    [0, 'Totals and payouts'],
    [2, 'Splitting and doubling'],
  ],
  skyjo: [
    [0, 'Revealing and clearing cards'],
    [2, 'Final score'],
  ],
  tarot: [
    [0, 'Choosing your cards'],
    [2, 'Reading your spread'],
  ],
  'four-in-a-row': [
    [0, 'Dropping a disc'],
    [1, 'Wins and draws'],
  ],
  reversi: [
    [0, 'Placement and passing'],
    [2, 'Counting discs'],
  ],
  'word-agents': [
    [0, 'Clues and guesses'],
    [2, 'Agents and the assassin'],
  ],
  'gem-market': [
    [0, 'Gems and developments'],
    [2, 'Prestige and ties'],
  ],
  checkers: [
    [0, 'Moves and jumps'],
    [2, 'Kings and endgames'],
  ],
  mancala: [
    [0, 'Pits and sowing'],
    [2, 'Captures and the final sweep'],
  ],
  'flip-7': [
    [0, 'Taking cards'],
    [1, 'Action cards'],
    [3, 'Banking points'],
  ],
  trio: [
    [0, 'Hands and reveals'],
    [2, 'Completing trios'],
  ],
  azul: [
    [0, 'Drafting and pattern lines'],
    [2, 'Walls and floor penalties'],
    [4, 'Endgame bonuses'],
  ],
  'spill-or-chill': partyTopics,
  'most-likely': partyTopics,
  'hot-seat': [
    [0, 'Predictions and reveals'],
    [3, 'Scoring and passing'],
  ],
  'the-gang': [
    [0, 'Vaults and cards'],
    [2, 'Taking chips'],
    [4, 'Showdown and table talk'],
  ],
  'six-nimmt': [
    [0, 'Choosing a card'],
    [2, 'Resolving rows'],
    [4, 'Counting penalties'],
  ],
  'sea-salt-paper': [
    [0, 'Draws and duos'],
    [2, 'Stop or Last Chance'],
    [4, 'Ending the round and match'],
  ],
  boop: [
    [0, 'Placement and boops'],
    [3, 'Graduating and winning'],
  ],
  shithead: [
    [0, 'Setup and ordinary plays'],
    [2, 'Burns and pickups'],
    [4, 'Clearing your last cards'],
    [6, 'Optional house rules'],
  ],
};
