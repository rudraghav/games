import type { Card } from '@games/api-client';

/** Descriptions only: the server determines permitted moves and outcomes. */
export function sheddingCardInformation(
  card: Card,
  mercy: boolean,
  settings: Record<string, boolean>,
  activePlayers: number,
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
      ? 'Reverse play and take the four-card penalty yourself, unless you stack an allowed draw.'
      : 'Reverse play and add four to the draw penalty. Stack an equal or higher draw to pass it on.';
  if (card.value === 'Wild') return 'Choose the colour for the next play.';
  if (card.value === '+4' && !mercy && card.color === 'wild')
    return 'Choose a colour. The next player may challenge if you still hold the current colour.';
  if (/^\+\d+$/.test(card.value))
    return mercy
      ? `Add ${card.value.slice(1)} to the draw penalty. Stack an equal or higher draw to pass it on; 25 cards means elimination.`
      : settings.stack_draw_two
        ? 'The next player draws two, or stacks another draw-two card.'
        : 'The next player draws two and loses their turn.';
  return null;
}
