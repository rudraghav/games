import type { CardPresentation } from '../components/PlayingCard';

const suits: Record<string, string> = {
  '♣': 'clubs',
  '♦': 'diamonds',
  '♥': 'hearts',
  '♠': 'spades',
};
const ranks: Record<string, string> = { A: 'ace', J: 'jack', Q: 'queen', K: 'king' };
/** Pinned, licensed vector faces; artwork is decorative and labels stay in the UI. */
export function standardCardAsset(card: CardPresentation) {
  if (card.value.toLowerCase().includes('joker'))
    return `/playing-cards/${card.color === 'red' ? 'red' : 'black'}_joker.svg`;
  const suit = suits[card.suit];
  const rank = ranks[card.value] || (/^(?:[2-9]|10)$/.test(card.value) ? card.value : null);
  return suit && rank ? `/playing-cards/${rank}_of_${suit}.svg` : null;
}
