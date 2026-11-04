import type { CardPresentation } from '../components/PlayingCard';

const suits: Record<string, string> = {
  '♣': 'clubs',
  '♦': 'diamonds',
  '♥': 'hearts',
  '♠': 'spades',
};
const ranks: Record<string, string> = { A: 'ace', J: 'jack', Q: 'queen', K: 'king' };

/** Printed jokers arrive as id `JK:n`, label "Joker" and value "★" (the label stays in the UI). */
export function isStandardJoker(card: CardPresentation) {
  return (
    /^JK(:|$)/.test(card.id) ||
    card.label.toLowerCase() === 'joker' ||
    card.value.toLowerCase().includes('joker')
  );
}

/** The deck prints one black and one red joker; alternate them by copy number. */
export function standardJokerInk(card: CardPresentation): 'red' | 'black' {
  if (card.color === 'red' || card.color === 'black') return card.color;
  const copy = Number(card.id.split(':')[1]);
  return Number.isFinite(copy) && copy % 2 === 1 ? 'red' : 'black';
}

/**
 * Pinned, licensed vector faces, drawn from their compact WebP derivatives
 * (`scripts/prepare_card_art.mjs playing-cards`, cropped inside the printed
 * outline). Artwork is decorative and labels stay in the UI.
 */
export const standardCardArtSize = { width: 288, height: 419 } as const;
export function standardCardAsset(card: CardPresentation) {
  if (isStandardJoker(card)) return `/playing-cards/web/${standardJokerInk(card)}_joker.webp`;
  const suit = suits[card.suit];
  const rank = ranks[card.value] || (/^(?:[2-9]|10)$/.test(card.value) ? card.value : null);
  return suit && rank ? `/playing-cards/web/${rank}_of_${suit}.webp` : null;
}
