import type { Card } from '@games/api-client';
import { stackingRule } from './uno-view';

/**
 * Descriptions only: the server determines permitted moves and outcomes.
 * `stacking` is the table's projected "Stack draw cards" rule when known;
 * otherwise it is read from the room settings and the game's default.
 */
export function sheddingCardInformation(
  card: Card,
  mercy: boolean,
  settings: Record<string, boolean>,
  activePlayers: number,
  stacking: boolean = stackingRule(mercy, settings),
) {
  if (card.value === '7' && (mercy || settings.seven_zero))
    return 'Swap hands with one chosen player.';
  if (card.value === '0' && (mercy || settings.seven_zero))
    return 'Everyone passes their hand in the current direction.';
  if (card.value === 'Skip') return 'The next player loses their turn.';
  if (card.value === 'Reverse')
    return activePlayers === 2
      ? 'With two players, Reverse skips the other player.'
      : 'Reverse the direction of play.';
  if (card.value === 'Discard all') return 'Discard every card of this colour from your hand.';
  if (card.value === 'Skip everyone') return 'Skip every other player and play again.';
  if (card.value === 'Colour roulette')
    return 'The next player chooses a colour, then draws until finding it. Reaching 25 cards eliminates them.';
  if (card.value === 'Reverse +4')
    return activePlayers === 2
      ? stacking
        ? 'Reverse play and take the four-card penalty yourself, unless you stack an allowed draw.'
        : 'Reverse play. With two players the four-card penalty comes back to you.'
      : stacking
        ? 'Reverse play and add four to the draw penalty. Stack an equal or higher draw to pass it on.'
        : 'Reverse play. The next player in the new direction draws four and loses their turn.';
  if (card.value === 'Wild') return 'Choose the colour for the next play.';
  if (card.value === '+4' && !mercy && card.color === 'wild')
    return stacking
      ? 'Choose a colour. The next player draws four, or stacks another Wild +4. It cannot be challenged while stacking is on.'
      : 'Choose a colour. The next player may challenge if you still hold the current colour.';
  if (/^\+\d+$/.test(card.value)) {
    const amount = card.value.slice(1);
    if (mercy)
      return stacking
        ? `Add ${amount} to the draw penalty. Stack an equal or higher draw to pass it on; 25 cards means elimination.`
        : `The next player draws ${amount} and loses their turn; 25 cards means elimination.`;
    return stacking
      ? 'The next player draws two, or stacks a +2 or Wild +4 to pass it on.'
      : 'The next player draws two and loses their turn.';
  }
  return null;
}
