import {
  arrow,
  back,
  board,
  cat,
  district,
  face,
  flip,
  gem,
  grid,
  icon,
  number,
  paper,
  picture,
  pit,
  property,
  rankChip,
  reel,
  tarot,
  tile,
  token,
  uno,
  word,
  type LessonPicture,
} from './lesson-pictures';

export interface TutorialRule {
  title: string;
  text: string;
  visual: LessonPicture;
}
export interface TutorialLesson {
  goal: string;
  rules: TutorialRule[];
  actions: Record<string, string>;
}

const rule = (title: string, text: string, visual: LessonPicture): TutorialRule => ({
  title,
  text,
  visual,
});
const unoMatch = rule(
  'Match the top card',
  'Play a card with the same colour, number or symbol. A blue 5 can go on a red 5.',
  picture('A red 5 followed by a blue 5.', uno('5', 'red'), arrow, uno('5', 'blue')),
);
const unoCall = rule(
  'Call UNO at one',
  'When you go down to one card, tap UNO before another player catches you. Empty your hand to win.',
  picture('One card left in a hand and the UNO call.', back, icon('message', 'UNO!')),
);
const unoMoves = {
  play: 'A matching colour, number or symbol makes a card playable. A wild can change the colour.',
  draw: 'An ordinary draw takes one card. Taking a draw penalty instead adds the penalty cards and passes the turn.',
  uno: 'Calling UNO protects a one-card hand until the next ordinary move.',
  catch_uno: 'Catching a player who missed their UNO call gives that player a draw penalty.',
  choose: 'The chosen colour determines what can be played next.',
  end_turn: 'Passing after a draw leaves the top card in place for the next player.',
  accept: 'Accepting a draw penalty takes the required cards.',
  challenge:
    'A challenge checks whether the Wild +4 player held the colour it replaced. An unsuccessful challenge costs two extra cards.',
};
const dealSet = rule(
  'Build three colours',
  'Play properties into their matching sets. Complete three different colours to win. The two dark-blue properties make one complete set.',
  picture(
    'Park Place and Boardwalk complete dark blue.',
    property('blue', 'Park Place', '4M'),
    property('blue', 'Boardwalk', '4M'),
  ),
);
const dealTurn = rule(
  'Choose up to three plays',
  'You draw two at the start of your turn, or five if your hand is empty. Play a property, bank a card, or use an action. A banked card stays money.',
  picture(
    'Take cards from the stock, then choose up to three plays.',
    back,
    arrow,
    icon('hand', '3 plays'),
  ),
);
const dealMoves = {
  property:
    'A property on the table counts toward its assigned colour set. Three full sets in different colours win.',
  bank: 'A banked card becomes money permanently. Its value can pay future bills.',
  play: 'Playing a card for its printed effect spends one of the turn’s three ordinary plays.',
  rearrange: 'A movable wild can change sets on its owner’s turn without spending a play.',
  end_turn: 'Ending a turn passes play once the hand is within its seven-card limit.',
  discard: 'After playing, discard down to the seven-card hand limit.',
  pay: 'Pay from your table. Money and properties count at their printed value, with no change.',
  no: 'Just Say No cancels an action against you unless the other player counters it.',
  accept: 'Accepting lets the pending action resolve without playing Just Say No.',
};
const nextPrompt = 'The spotlight player advances after everyone can see the result.';
const partyPass = rule(
  'Passing is always allowed',
  'You can pass on any prompt. After two spotlight turns each, the highest score wins and ties share the win.',
  picture(
    'Pass earns zero and play continues.',
    icon('shield', 'Pass'),
    arrow,
    icon('flag', 'Next'),
  ),
);
export const tutorialLessons: Record<string, TutorialLesson> = {
  uno: {
    goal: 'Be the first to empty your hand.',
    rules: [
      unoMatch,
      rule(
        'Use the draw pile',
        'Draw one card. If you draw a red 4 while red is in play, you can play that 4 immediately or pass. Only the newly drawn card can be played this turn.',
        picture('A red 4 is drawn from the stock.', back, arrow, uno('4', 'red')),
      ),
      unoCall,
    ],
    actions: unoMoves,
  },
  'uno-no-mercy': {
    goal: 'Empty your hand or be the last player below 25 cards.',
    rules: [
      unoMatch,
      rule(
        'Pass the penalty',
        'Stack an equal or higher draw card to send the combined penalty onward. A +2 followed by +4 makes the next player face six.',
        picture(
          'Draw two plus draw four builds a six-card penalty.',
          uno('+2', 'red'),
          uno('+4', 'blue'),
          icon('hand', '6 cards'),
        ),
      ),
      rule(
        'Stay below 25',
        'Draw until you find a playable card when you have no match. Reaching 25 cards puts you out. Empty your hand or be the last player left.',
        picture(
          'A hand reaching 25 cards ends that player’s game.',
          icon('hand', '25 cards'),
          arrow,
          icon('flag', 'Out'),
        ),
      ),
    ],
    actions: {
      ...unoMoves,
      draw: 'Ordinary draws continue until a match. A draw penalty makes you take the accumulated cards and pass. Reaching 25 cards puts you out.',
      play: 'Match the discard or play a wild. Against a draw stack, only an equal or higher draw value can pass it on.',
      choose:
        'The selected colour becomes active. In colour roulette, the player draws until a non-wild of that colour appears or they reach 25 cards.',
    },
  },
  deal: {
    goal: 'Complete three property sets in different colours.',
    rules: [
      dealSet,
      dealTurn,
      rule(
        'Pay from the table',
        'Rent comes out of your bank or properties. A 3M card can pay a 2M bill, but the extra 1M is lost. Cards in hand stay private.',
        picture(
          'A 3M payment covers a 2M bill.',
          icon('bank', '3M'),
          arrow,
          icon('message', 'Bill 2M'),
        ),
      ),
    ],
    actions: dealMoves,
  },
  'deal-no-mercy': {
    goal: 'Complete three different-colour property sets while managing debt.',
    rules: [
      dealSet,
      dealTurn,
      rule(
        'Settle debt first',
        'If a bill leaves you with a debt chip, settle it with a hand card before your ordinary plays. Your creditor immediately uses or banks that card.',
        picture('A debt chip is settled by giving a card.', token('poker', 'Debt'), arrow, back),
      ),
    ],
    actions: {
      ...dealMoves,
      no: 'In this edition, using Just Say No during your own turn spends a play. A counter can still answer it.',
      settle_debt:
        'Settling one debt chip passes a hand card to that creditor and uses one of your plays.',
      give: 'The pending action names who receives the chosen card.',
      keep: 'Keep one of the offered cards. The remaining cards are distributed as the action directs.',
      choose: 'The pending card effect determines which of the offered options you can choose.',
    },
  },
  holdem: {
    goal: 'Win the pot with the strongest five-card hand or by getting everyone else to fold.',
    rules: [
      rule(
        'Start with two private cards',
        'Only you can see your two pocket cards. The middle of the table eventually holds five cards that everyone can use.',
        picture('An ace and a king in a private hand.', face('A', '♠'), face('K', '♦')),
      ),
      rule(
        'Match the price to stay',
        'Check when nothing is owed. Call to match a bet, raise to increase it, or fold and leave this pot.',
        picture(
          'A two-chip call matches a two-chip bet.',
          token('poker', 'Bet 2'),
          arrow,
          token('poker', 'Call 2'),
        ),
      ),
      rule(
        'Find your best five',
        'Use any five of the seven available cards. Three queens beat a pair. You also win the pot if everyone else folds.',
        picture(
          'Three queens of different suits are three of a kind.',
          face('Q', '♣'),
          face('Q', '♥'),
          face('Q', '♦'),
        ),
      ),
    ],
    actions: {
      check: 'Checking stays in the hand without adding chips when you owe nothing.',
      call: 'Calling matches the outstanding bet up to your remaining stack.',
      raise: 'A raise increases the total opponents must match to stay in this pot.',
      fold: 'Folding gives up this pot. Chips already committed remain in the middle.',
      all_in:
        'An all-in commits the remaining stack. Extra chips from deeper stacks can form a side pot.',
    },
  },
  rummy: {
    goal: 'Declare all 13 cards in valid groups, including two sequences with at least one pure sequence.',
    rules: [
      rule(
        'Draw one, discard one',
        'Draw from the stock or take the visible discard. Keep your best 13 and discard the extra card. You cannot immediately discard the card you picked up from the discard pile.',
        picture('A stock card is drawn and a five is discarded.', back, arrow, face('5', '♣')),
      ),
      rule(
        'Find a pure run',
        'Three or more consecutive cards in one suit form a sequence. A pure sequence uses no joker as a substitute.',
        picture(
          'The six, seven and eight of hearts form a pure sequence.',
          face('6', '♥'),
          face('7', '♥'),
          face('8', '♥'),
        ),
      ),
      rule(
        'Declare a complete hand',
        'Arrange all 13 cards in groups. You need at least two sequences, including a pure one. A set can group equal ranks in different suits.',
        picture(
          'Three queens of different suits form a set.',
          face('Q', '♣'),
          face('Q', '♦'),
          face('Q', '♥'),
        ),
      ),
    ],
    actions: {
      draw_stock:
        'The stock supplies one unknown card. A draw gives you fourteen cards to choose from.',
      draw_discard: 'The visible discard joins your hand. Keep it through this turn’s discard.',
      discard: 'Discarding one card restores a 13-card hand and passes the turn.',
      declare:
        'A valid declaration covers all 13 remaining cards with groups including two sequences, one pure. A false declaration costs 80 points.',
      fold: 'Dropping costs 20 points before your first discard and 40 later.',
    },
  },
  'teen-patti': {
    goal: 'Win the pot with the stronger three-card hand or as the last player still in.',
    rules: [
      rule(
        'Bet blind or look',
        'Three cards are dealt face down. Look to play seen, or stay blind. At a base stake of one, blind bets cost one or two chips and seen bets cost two or four.',
        picture('Three private cards begin face down.', back, back, back),
      ),
      rule(
        'Recognise a strong hand',
        'Three of one rank is a trail, the strongest hand. Next come a suited run, any run, a single suit, a pair and high card.',
        picture('Three sevens form a trail.', face('7', '♥'), face('7', '♦'), face('7', '♣')),
      ),
      rule(
        'Win the pot',
        'If everyone else packs, you take the pot. With two players left, an eligible show compares both hands. Equal hands favour the player who did not ask for the show.',
        picture(
          'Two hands compare for the pot.',
          icon('people', '2 left'),
          arrow,
          token('poker', 'Pot'),
        ),
      ),
    ],
    actions: {
      bet: 'Blind and seen players have different legal prices. The chosen chips go into the pot.',
      peek: 'Looking makes your three cards visible to you and changes future bets to seen prices.',
      show: 'A show compares the last two hands. The requester loses a tie.',
      sideshow: 'A seen player can ask the eligible seen neighbour for a private comparison.',
      accept:
        'Accepting a sideshow compares both hands. The weaker hand packs and the requester loses a tie.',
      decline: 'Declining a sideshow keeps both hands in the game.',
      fold: 'Packing gives up the pot and keeps your cards hidden.',
    },
  },
  roulette: {
    goal: 'Finish the session with more than your starting 100 chips.',
    rules: [
      rule(
        'Choose your bet',
        'Choose one number or an outside bet such as red. You can change the bet and stake until you spin.',
        picture('A two-chip bet on red.', token('gold', '2'), arrow, token('coral', 'Red')),
      ),
      rule(
        'Read the pocket',
        'There are 37 pockets. Zero wins a straight bet on zero. Every outside bet loses on zero.',
        picture(
          'Zero lands in the green pocket.',
          icon('flag', '0'),
          arrow,
          icon('check', 'Zero wins'),
        ),
      ),
      rule(
        'Count the return',
        'A winning straight bet returns 36 times your stake. A winning outside bet returns twice your stake. Both totals include the chips you put in.',
        picture(
          'A five-chip winning bet on red returns ten chips.',
          token('coral', '5'),
          arrow,
          token('gold', '10'),
        ),
      ),
    ],
    actions: {
      spin: 'Choose the pocket or group, check the stake and tap Spin once. The history shows the pocket, returned chips and net result.',
    },
  },
  slots: {
    goal: 'See where your 100 chips finish after five spins on one payline.',
    rules: [
      rule(
        'Pick a stake',
        'Choose 1 to 10 chips. The stake stays editable until you spin.',
        picture(
          'Select five chips for one spin.',
          token('poker', '5'),
          arrow,
          icon('hand', 'Spin'),
        ),
      ),
      rule(
        'Read the center line',
        'A line of three identical symbols pays the multiplier shown in the paytable. Exactly two cherries anywhere on the line also pay.',
        picture(
          'Two cherries and a star pay twice the stake.',
          reel('cherry'),
          reel('cherry'),
          reel('star'),
        ),
      ),
      rule(
        'Check the receipt',
        'A five-chip spin paying twice the stake returns ten chips, a net gain of five. Each new spin is independent.',
        picture(
          'Pay five chips and get ten chips back.',
          token('coral', '5'),
          arrow,
          token('gold', '10'),
        ),
      ),
    ],
    actions: {
      spin: 'Choose a stake and tap Spin. Check the three center symbols against the paytable and read the change in your balance.',
    },
  },
  blackjack: {
    goal: 'Beat the dealer’s total without going over 21.',
    rules: [
      rule(
        'Get close to 21',
        'Number cards count as shown. Face cards count ten. An ace counts one or eleven, whichever helps. An ace and a king make a natural blackjack.',
        picture('An ace and king make twenty-one.', face('A', '♠'), face('K', '♥')),
      ),
      rule(
        'Hit or stand',
        'Hit to take another card or stand to keep your total. A ten and a six make 16. Drawing a nine would make 25 and bust the hand.',
        picture(
          'A ten and a six followed by a nine would bust.',
          face('10', '♦'),
          face('6', '♣'),
          face('9', '♠'),
        ),
      ),
      rule(
        'Compare with the dealer',
        'Beat the dealer without busting. An ordinary tie returns the stake. A natural blackjack pays three to two unless the dealer also has one.',
        picture(
          'A two-chip natural earns three chips in profit.',
          token('poker', 'Bet 2'),
          arrow,
          token('poker', 'Profit 3'),
        ),
      ),
    ],
    actions: {
      bet: 'The opening wager sets the stake for this hand.',
      stand: 'Standing keeps this total and ends play on the active hand.',
      hit: 'Hitting adds one card to the active hand. A total over 21 busts.',
      double: 'Doubling adds an equal stake, takes exactly one card and stands.',
      split: 'Splitting separates an eligible pair into two hands with a stake on each.',
      accept: 'Insurance is a separate side bet on the dealer having a natural blackjack.',
      decline: 'Declining insurance leaves the original hand and stake in play.',
    },
  },
  skyjo: {
    goal: 'Finish with the lowest total by replacing high cards and clearing matching columns.',
    rules: [
      rule(
        'Turn over two',
        'Start with twelve cards in a grid. Reveal two of your own to begin. Lower numbers are better.',
        picture(
          'Two starting cards reveal a two and a nine.',
          grid('2', 'green'),
          grid('9', 'coral'),
          back,
        ),
      ),
      rule(
        'Trade a high card away',
        'Take the visible discard and swap it with any card in your grid. From the stock, you may instead discard what you drew and reveal a hidden grid card.',
        picture('A nine is replaced by a two.', grid('9', 'coral'), arrow, grid('2', 'green')),
      ),
      rule(
        'Clear a matching column',
        'Three equal face-up numbers in one vertical column leave the grid. When someone reaches 100 total points, the lowest total wins.',
        {
          ...picture(
            'Three revealed fours in the same column clear together.',
            grid('4', 'green'),
            grid('4', 'green'),
            grid('4', 'green'),
          ),
          column: true,
        },
      ),
    ],
    actions: {
      reveal: 'Turning a hidden grid card face up makes its value visible to everyone.',
      draw_discard: 'Taking the top discard commits you to swapping it into your grid.',
      draw_stock:
        'Drawing from the stock lets you see the card before choosing to swap or discard it.',
      swap: 'The drawn card replaces the chosen grid card face up. Three matching face-up cards in a column clear.',
      discard: 'Discarding the stock draw leaves you to reveal a hidden card in your grid.',
      next_round: 'Round totals carry over and each player receives a fresh grid.',
    },
  },
  tarot: {
    goal: 'Build a three-card spread to explore a question or a moment in your life.',
    rules: [
      rule(
        'Choose a card',
        'Tap a face-down card to lift it, or slide over the fan and let go. Tap the lifted card again to reveal it. Your first card describes where you are now.',
        picture(
          'A face-down card lifts above its neighbour. A second tap reveals it. The Fool is an example.',
          tarot(),
          tarot(),
          arrow,
          tarot('major-00', 'The Fool'),
        ),
      ),
      rule(
        'Build a three-card spread',
        'Your second card explores what is shifting. The third suggests your next move. The three positions give the same cards different context.',
        picture(
          'The Fool, The Magician and The High Priestess in three spread positions.',
          tarot('major-00', 'The Fool'),
          tarot('major-01', 'The Magician'),
          tarot('major-02', 'The High Priestess'),
        ),
      ),
      rule(
        'Ask for your reading',
        'After the third pick, you can add a question, include astrology, or request a reading with just your cards. The cards offer prompts for reflection.',
        picture(
          'A chosen card and a personal question inform the reading.',
          tarot('major-01', 'The Magician'),
          icon('message', 'Question'),
        ),
      ),
    ],
    actions: {
      pick: 'Each pick fills the next position, from where you are to what is shifting and then your next move.',
    },
  },
  'four-in-a-row': {
    goal: 'Connect four of your discs in an unbroken line.',
    rules: [
      rule(
        'Drop into a column',
        'Choose an open column. Your disc falls to its lowest empty space, so the stack underneath determines where it lands.',
        picture('A coral disc rests directly on top of a gold disc.', board(['...', '..r', '..g'])),
      ),
      rule(
        'Spot a threat',
        'Check where a disc would land. If that square would give the other player four in a row, drop there to block.',
        picture('A coral disc blocks the open end of three gold discs.', board(['....', 'gggr'])),
      ),
      rule(
        'Connect four',
        'Make an unbroken line of four discs of your colour across, down or on a diagonal. A full board with no line is a draw.',
        picture('Four coral discs connect along the bottom.', board(['.g.g', 'rrrr'])),
      ),
    ],
    actions: {
      drop: 'The disc falls to the lowest open space in the chosen column. Four connected discs of your colour win.',
    },
  },
  reversi: {
    goal: 'Finish with more discs of your colour on the board.',
    rules: [
      rule(
        'Bracket a line',
        'Tap a marked square to preview which opposing discs it traps against one of yours. Tap the same square again to place and flip them.',
        picture(
          'Black can play the empty square beside the white disc because black anchors the far end.',
          board(['.wb']),
        ),
      ),
      rule(
        'Flip what you enclose',
        'Every bracketed line flips, including diagonals. In the example, placing black beside white turns a row into three black discs.',
        picture(
          'White between two black discs flips to black.',
          board(['bwb']),
          arrow,
          board(['bbb']),
        ),
      ),
      rule(
        'Finish with more discs',
        'If you have no capturing move, the turn passes. When neither side can move, count the discs. Most wins.',
        picture('A finished four-disc example has three black and one white.', board(['bb', 'bw'])),
      ),
    ],
    actions: {
      place:
        'A placement must bracket an opposing line. Every line enclosed by the new disc and one of yours flips.',
    },
  },
  'word-agents': {
    goal: 'Find all your team’s agents before your opponents do, while avoiding the assassin.',
    rules: [
      rule(
        'Link words with one clue',
        'The spymaster sees a secret key. Give one word and a number for how many of your agents it links. “Space, 2” could link Moon and Comet.',
        picture(
          'The clue Space, two, links Moon and Comet.',
          icon('message', 'Space · 2'),
          word('Moon'),
          word('Comet'),
        ),
      ),
      rule(
        'Guess together',
        'Make at least one guess. After a friendly agent, stop or keep guessing, up to the clue number plus one.',
        picture('Moon revealed as a friendly agent.', word('Moon', true), icon('check', 'Agent')),
      ),
      rule(
        'Avoid the assassin',
        'A bystander or enemy agent ends your guesses. The assassin ends the game immediately in the other team’s favour. Find all your agents first.',
        picture(
          'The assassin ends the game for the guessing team.',
          icon('eye', 'Assassin'),
          arrow,
          icon('flag', 'Game over'),
        ),
      ),
    ],
    actions: {
      clue: 'Give one word and the number of agents it links. Your team must guess once and may take one extra guess beyond that number.',
      guess:
        'A friendly agent lets the team continue within its guess limit. A bystander or enemy ends the turn, and the assassin ends the game.',
      end_guesses: 'Ending guesses passes the turn and leaves unrevealed words for later.',
    },
  },
  'gem-market': {
    goal: 'Build discounts and score the most prestige when the final round ends.',
    rules: [
      rule(
        'Collect your colours',
        'Take three different colours, or one of each available colour if fewer than three remain. You can take two alike when at least four of that colour remain. Return any gems over ten.',
        picture(
          'A ruby, emerald and sapphire are three different gems.',
          gem('ruby'),
          gem('emerald'),
          gem('sapphire'),
        ),
      ),
      rule(
        'Buy a lasting discount',
        'Pay the shown cost to buy a development. Its gem bonus reduces that colour’s cost on every later purchase.',
        picture(
          'An emerald development gives a lasting emerald discount.',
          district('emerald'),
          arrow,
          gem('emerald'),
        ),
      ),
      rule(
        'Build prestige',
        'Buy developments with points and meet patron requirements. When someone reaches 15 prestige, finish the seating round. The highest score wins.',
        picture(
          'Fifteen prestige triggers the last round.',
          icon('star', '15'),
          arrow,
          icon('flag', 'Final round'),
        ),
      ),
    ],
    actions: {
      take: 'Take different colours from the available supply. Return excess chips if you exceed ten.',
      buy: 'Pay after applying your permanent discounts. The bought development adds its bonus and printed prestige.',
      take_pair:
        'Two of one colour can be taken only if at least four of that colour remain in supply.',
      reserve: 'A reserved development is yours to buy later. Take a gold chip if one remains.',
      reserve_blind:
        'Reserving blind takes the top card of the chosen tier into your private reserve, with gold if available.',
      return: 'Return enough chips to bring your wallet down to ten.',
      patron:
        'A patron visits when your permanent bonuses meet its requirements, adding three prestige.',
      pass: 'A pass moves play on when the game offers no other turn action.',
    },
  },
  checkers: {
    goal: 'Win by leaving your opponent without a piece they can legally move.',
    rules: [
      rule(
        'Move on dark squares',
        'An ordinary piece moves one diagonal step forward into an empty dark square. Select the piece, then its destination.',
        picture(
          'A coral piece moves one square diagonally ahead.',
          board(['..', '.r'], true),
          arrow,
          board(['r.', '..'], true),
        ),
      ),
      rule(
        'Take an available jump',
        'Jump over a diagonally adjacent opponent into the empty square beyond it. Captures are compulsory. Continue any available jump with the same piece.',
        picture(
          'Coral jumps diagonally over ivory and the captured piece disappears.',
          board(['...', '.w.', 'r..'], true),
          arrow,
          board(['..r', '...', '...'], true),
        ),
      ),
      rule(
        'Crown a king',
        'Reaching the far row crowns the piece and ends its turn. A king can move and jump in either diagonal direction. Win by leaving the opponent no legal move.',
        picture(
          'A coral piece reaches the far row and becomes a king.',
          token('coral'),
          arrow,
          icon('crown', 'King'),
        ),
      ),
    ],
    actions: {
      move: 'Move diagonally on dark squares. An available jump is compulsory, and that piece continues jumping while a capture remains, unless it is crowned.',
    },
  },
  mancala: {
    goal: 'Finish with more seeds in your store than your opponent.',
    rules: [
      rule(
        'Sow one seed per pit',
        'Tap one of your nonempty pits to see where its last seed lands. Tap again to sow one seed per pit counterclockwise, including your store and skipping theirs.',
        picture(
          'Three lifted seeds are sown one each into the next three pits.',
          pit(1),
          pit(1),
          pit(1),
        ),
      ),
      rule(
        'Land in your store',
        'Count the steps to your store. If your last seed lands there and neither side is empty, you sow again.',
        picture('A last seed lands in your store for another turn.', pit(1), arrow, pit(1, true)),
      ),
      rule(
        'Capture and count',
        'If your last seed lands in your own empty pit opposite a nonempty pit, take both into your store. When a side empties, sweep the other side. Most seeds wins.',
        picture(
          'One landing seed and three opposite seeds make four seeds in the store.',
          pit(1),
          pit(3),
          arrow,
          pit(4, true),
        ),
      ),
    ],
    actions: {
      sow: 'Sow counterclockwise and skip the other store. The last seed can earn an extra turn in your store or capture from an opposite pit.',
    },
  },
  'flip-7': {
    goal: 'Bank points without repeating a number and lead when a round ends at 200 or more.',
    rules: [
      rule(
        'Draw distinct numbers',
        'Hit to draw. A new number adds its value to this round. Drawing a number you already have busts, unless Second Chance saves you.',
        picture(
          'Two fours bust a hand without Second Chance.',
          flip('4'),
          flip('4'),
          icon('flag', 'Bust'),
        ),
      ),
      rule(
        'Stay to bank',
        'Stay to keep your current score. With a 3 and an 8 and no modifiers, staying banks 11.',
        picture('Three plus eight banks eleven points.', flip('3'), flip('8'), icon('bank', '11')),
      ),
      rule(
        'Reach seven',
        'Seven distinct numbers end the round and earn a 15-point bonus. The highest score at or above 200 after a round wins. Tied leaders play on.',
        picture(
          'Seven different numbers earn fifteen bonus points.',
          icon('hand', '7 distinct'),
          arrow,
          icon('star', '+15'),
        ),
      ),
    ],
    actions: {
      hit: 'A new number adds to this hand. A duplicate busts it unless protected by Second Chance.',
      stay: 'Staying banks the current round score and ends your draws this round.',
      target_effect:
        'Choose an eligible seat for the shown effect. Freeze banks a hand, Flip Three forces draws, and Second Chance protects against one duplicate.',
      next_round: 'Banked scores carry forward and the next dealer starts a fresh round.',
    },
  },
  trio: {
    goal: 'Collect three trios, or win immediately with three sevens.',
    rules: [
      rule(
        'Reveal one number',
        'Turn up a face-down table card, or ask any player, including yourself, for their lowest or highest card. Hands stay sorted.',
        picture('A table position turns over to reveal a seven.', back, arrow, number(7, 0)),
      ),
      rule(
        'Remember the matches',
        'Keep revealing while the numbers match. A mismatch ends the attempt and the cards return to their places.',
        picture('A six followed by a nine ends the attempt.', number(6, 0), number(9, 0)),
      ),
      rule(
        'Collect three of a kind',
        'Three matching numbers earn a trio. Collect three trios to win, or win immediately with the trio of sevens.',
        picture('Three sevens win immediately.', number(7, 0), number(7, 0), number(7, 0)),
      ),
    ],
    actions: {
      reveal_table:
        'A table reveal shows one chosen hidden position. Continue only while the numbers match.',
      reveal_hand:
        'Only the current lowest or highest card of a hand can be requested, including your own hand.',
      continue:
        'Review which positions matched before the turn continues. Completed trios stay with their winner.',
    },
  },
  azul: {
    goal: 'Build your tiled wall and finish with the highest score.',
    rules: [
      rule(
        'Take one colour',
        'Tap a colour in a factory or the centre to preview all its matching tiles. Choose a destination to commit. Tiles left in that factory slide into the centre.',
        picture(
          'Two matching blue ceramic tiles can be taken together.',
          tile('blue'),
          tile('blue'),
        ),
      ),
      rule(
        'Fill one pattern line',
        'Place your entire draft in one compatible line. The line holds only one colour, and its wall row must still have space for that colour. Excess tiles go to the floor.',
        picture(
          'Three red tiles fill a three-space pattern line.',
          tile('red'),
          tile('red'),
          tile('red'),
        ),
      ),
      rule(
        'Score the wall',
        'At round end, each full line moves one tile to the wall. Neighbours score together and floor tiles cost points. A completed horizontal wall row triggers final scoring.',
        picture(
          'A completed yellow pattern line sends one yellow tile to its wall row.',
          tile('yellow'),
          tile('yellow'),
          arrow,
          tile('yellow'),
        ),
      ),
    ],
    actions: {
      draft_tiles:
        'Draft all tiles of the chosen colour from one source. Leaving tiles in a factory sends those tiles to the centre.',
      place_tiles:
        'Choose one compatible pattern line or the floor. Tiles that do not fit go to the floor. Filled floor spaces cost points at round end.',
      next_round:
        'Completed pattern lines have scored on the wall. Unfinished lines stay for the next round.',
    },
  },
  'spill-or-chill': {
    goal: 'Take turns in the spotlight and collect participation points.',
    rules: [
      rule(
        'Read your spotlight prompt',
        'One player gets the spotlight. Read the prompt aloud and choose Spill, Chill or Pass. Spoken answers stay off the game record.',
        picture(
          'The spotlight passes one prompt to a player.',
          icon('message', 'Prompt'),
          arrow,
          icon('people', 'Spotlight'),
        ),
      ),
      rule(
        'Spill or Chill',
        'Spill and Chill each earn one participation point. Only the button choice is recorded. The spotlight player advances the round.',
        picture(
          'Either participation choice earns one point.',
          icon('message', 'Spill'),
          icon('check', 'Chill'),
          icon('star', '+1'),
        ),
      ),
      partyPass,
    ],
    actions: {
      respond:
        'Spill and Chill each earn one participation point. Pass earns zero. Your spoken answer is never recorded.',
      next_prompt: nextPrompt,
    },
  },
  'most-likely': {
    goal: 'Vote on who fits each prompt and see who earns the most spotlight points.',
    rules: [
      rule(
        'Pick someone else',
        'Read the prompt and privately choose another player who fits it, or pass. You cannot vote for yourself.',
        picture(
          'Choose another player for the prompt.',
          icon('message', 'Prompt'),
          arrow,
          icon('people', 'Another player'),
        ),
      ),
      rule(
        'Lock your vote',
        'You may change your selection until you lock it. Everyone’s choices are revealed together after the last vote.',
        picture(
          'A private vote is locked before the group reveal.',
          icon('lock', 'Private'),
          arrow,
          icon('eye', 'Reveal'),
        ),
      ),
      rule(
        'Count the votes',
        'Each player tied for the most positive votes gets one point. An all-pass round gives none. After two spotlight turns each, most points wins.',
        picture(
          'A tied positive vote gives both leaders one point.',
          icon('people', 'Tie'),
          arrow,
          icon('star', '+1 each'),
        ),
      ),
    ],
    actions: {
      vote: 'Your submitted vote stays private until everyone locks. You can vote for another player or pass.',
      next_prompt: nextPrompt,
    },
  },
  'hot-seat': {
    goal: 'Predict the spotlight player’s answers to earn points.',
    rules: [
      rule(
        'Answer in secret',
        'The spotlight player picks A or B. Everyone else predicts which answer that player picked. Anyone may pass.',
        picture(
          'Two private options for one spotlight answer.',
          icon('message', 'A'),
          icon('message', 'B'),
          icon('lock', 'Private'),
        ),
      ),
      rule(
        'Lock before the reveal',
        'You can change your choice before locking. The answer and predictions are shown only after everyone submits.',
        picture(
          'Locked predictions reveal together.',
          icon('lock', 'Locked'),
          arrow,
          icon('eye', 'Reveal'),
        ),
      ),
      rule(
        'Match the spotlight',
        'Each correct prediction earns one point. If the spotlight passes, nobody scores. After two spotlight turns per player, the highest total wins.',
        picture(
          'Predicting A when the spotlight answers A earns one point.',
          icon('message', 'A'),
          icon('check', 'A'),
          icon('star', '+1'),
        ),
      ),
    ],
    actions: {
      choose:
        'The spotlight answer stays private until the group has locked. A spotlight pass gives nobody a point.',
      predict:
        'Predict the spotlight player’s answer. A correct prediction earns one point after everyone locks.',
      next_prompt: nextPrompt,
    },
  },
  'the-gang': {
    goal: 'Work together to open three vaults before the third alarm.',
    rules: [
      rule(
        'Rank your hand together',
        'You share a goal, but keep your pocket cards private. Take a star chip to show how strong you think your hand is compared with the others. One star is weakest.',
        picture(
          'White one-star and three-star chips rank the opening hands.',
          rankChip(1, 'white'),
          rankChip(3, 'white'),
        ),
      ),
      rule(
        'Revise after each reveal',
        'Rank with white chips before the flop, yellow on the flop, orange on the turn and red on the river. You can change or return a chip until everyone holds one.',
        picture(
          'The flop brings a new estimate with a yellow two-star chip.',
          icon('eye', 'Flop'),
          arrow,
          rankChip(2, 'yellow'),
        ),
      ),
      rule(
        'Open three vaults',
        'Reveal from lowest red chip to highest. Hands must stay equal or get stronger along the line. Win three vaults before three alarms.',
        picture(
          'Three successful vaults win the game.',
          icon('vault', '1'),
          icon('vault', '2'),
          icon('vault', '3'),
        ),
      ),
    ],
    actions: {
      claim_chip:
        'A chip signals your relative hand strength. Taking an occupied chip leaves its previous holder needing another.',
      return_chip: 'Returning your chip leaves that rank open for someone else.',
      reveal_hand:
        'Hands reveal in red-chip order. An equal or stronger hand keeps the ordering correct.',
      next_heist: 'The next heist starts with fresh cards. Vault and alarm totals carry over.',
    },
  },
  'six-nimmt': {
    goal: 'Keep the fewest penalty points by avoiding unwanted rows.',
    rules: [
      rule(
        'Pick a number in secret',
        'Everyone locks one card from their hand. Numbers reveal together and resolve from smallest to largest. Aim for the fewest penalty points.',
        picture(
          'A locked 26 remains secret until everyone has chosen.',
          number(26),
          icon('lock', 'Locked'),
        ),
      ),
      rule(
        'Follow the nearest lower end',
        'Find the highest row end below your number. With ends 8, 23, 41 and 60, a 26 follows the 23. Below every end, you choose a row to take.',
        picture('Number 26 goes directly after 23.', number(23), arrow, number(26)),
      ),
      rule(
        'Avoid the sixth spot',
        'The dashed 7 is the sixth card. Take the five cards before it and count their bullheads as penalties. The 7 stays as the new starter.',
        picture(
          'The full row holds 1, 2, 3, 4 and 6. Playing 7 after 6 takes those five cards and leaves 7 alone.',
          { kind: 'full-number-row', numbers: [1, 2, 3, 4, 6, 7] },
        ),
      ),
    ],
    actions: {
      select_number:
        'A locked card stays secret until all players select. Revealed numbers resolve from lowest to highest.',
      take_row:
        'A number below every row end must replace a row. Its owner takes those cards as penalties.',
      next_selection: 'The next trick starts after everyone can inspect the resolved rows.',
      next_round:
        'Round penalties carry into the total. Start with ten fresh cards and four new row starters.',
    },
  },
  'sea-salt-paper': {
    goal: 'Build scoring combinations and end rounds when your cards give you the advantage.',
    rules: [
      rule(
        'Take a card',
        'Take a visible discard, or draw two from the stock. Choose one to keep. If a discard pile is empty, the other card must go there.',
        picture(
          'Two cards drawn from stock leave one card in hand.',
          back,
          back,
          arrow,
          icon('hand', 'Keep 1'),
        ),
      ),
      rule(
        'Play a duo',
        'A matching duo gives an effect. Two fish draw a card, two boats give another turn, two crabs search a discard pile, and shark with swimmer steals a card.',
        picture(
          'Two folded fish let you draw.',
          paper('fish', 'green'),
          paper('fish', 'yellow'),
          arrow,
          back,
        ),
      ),
      rule(
        'Choose how to finish',
        'At seven or more card points you may Stop for immediate scoring or call Last Chance and give opponents one last turn. Collecting all four mermaids wins outright.',
        picture(
          'At seven points a player may stop or call Last Chance.',
          icon('star', '7 points'),
          arrow,
          icon('flag', 'Stop?'),
        ),
      ),
    ],
    actions: {
      take_discard: 'Take the publicly visible top card of the chosen discard pile.',
      take_stock:
        'With two stock cards, choose one to keep and a legal pile for the other. An empty discard pile must be filled first. A lone stock card goes straight into your hand.',
      keep: 'Your kept card stays private. The other goes face up on the selected discard pile.',
      pair: 'A legal duo leaves your hand, scores on the table and activates its pictured effect.',
      inspect: 'The crab duo lets you inspect one discard pile and take a card from it.',
      take_inspected: 'Take one card from the pile you inspected with your crabs.',
      steal: 'The shark and swimmer take one random card from an eligible opponent.',
      end_turn: 'Ending the turn keeps your cards and leaves the round open.',
      stop: 'At seven or more card points, Stop ends the round immediately for normal scoring.',
      last_chance:
        'Last Chance gives opponents a final turn and wagers your card points on tying or beating their scores.',
      reveal_mermaids: 'Revealing all four mermaids wins the match immediately.',
      next_round: 'Round scores carry over. A fresh round starts with new discard piles.',
    },
  },
  boop: {
    goal: 'Line up three adult cats or finish your turn with all eight adult cats on the bed.',
    rules: [
      rule(
        'Place and push',
        'Place a kitten or cat on an empty square. Adjacent pieces it can push move one space away. An occupied landing square blocks a push. Kittens cannot push adult cats.',
        picture(
          'The blue kitten starts in the middle. Placing coral on its left pushes blue one square to the right.',
          board(['.K.']),
          arrow,
          board(['k.K']),
        ),
      ),
      rule(
        'Grow your kittens',
        'After the pushes, a line of three of your pieces can graduate. Remove that line and take adult cats into your pool for later turns.',
        picture(
          'Three kittens in a row can graduate into adult cats.',
          cat(false),
          cat(false),
          cat(false),
        ),
      ),
      rule(
        'Line up adult cats',
        'On your turn, three adult cats in a straight line win. Having all eight adult cats on the bed also wins.',
        picture('Three adult cats in a row win.', cat(true), cat(true), cat(true)),
      ),
    ],
    actions: {
      place:
        'The new piece pushes eligible neighbours one space away. Occupied landing squares block pushes, and kittens cannot push cats.',
      graduate: 'The chosen line of three returns to your pool as adult cats.',
      return_piece:
        'With all eight pieces on the bed, you can bring one back to your pool as an adult cat.',
    },
  },
  shithead: {
    goal: 'Empty your hand and both rows of table cards before you are the last player left.',
    rules: [
      rule(
        'Choose your table cards',
        'Choose three of your six starting cards to leave face up. The other three stay in your hand. Your three hidden table cards come last.',
        picture(
          'A two, ten and king are one example of a face-up set.',
          face('2', '♥'),
          face('10', '♠'),
          face('K', '♦'),
        ),
      ),
      rule(
        'Match or beat the pile',
        'Play one card, or several of the same rank, that meets the pile’s rank. Refill to three from the stock. A 2 resets the rank. A 10 burns the pile and gives you another turn.',
        picture('An eight can be played over a six.', face('6', '♠'), arrow, face('8', '♥')),
      ),
      rule(
        'Clear your three layers',
        'Use your hand, then your face-up cards, then flip hidden cards blindly. A failed blind play puts the pile in your hand. Everyone who empties their cards escapes.',
        picture(
          'Play from the hand, then face up, then face down.',
          icon('hand', 'Hand'),
          face('K', '♣'),
          back,
        ),
      ),
    ],
    actions: {
      arrange:
        'The three chosen cards go face up on your table. The other three stay in your hand.',
      play: 'Play a legal rank or a group of that same rank. A 2 resets the pile, and a 10 or four consecutive equal ranks burns it.',
      flip: 'When only hidden cards remain, flip a slot blind. A failed flip joins the pile in your hand.',
      pickup:
        'Picking up adds the pile to your hand and ends your turn. From the face-up stage, include one selected face-up card.',
    },
  },
};
