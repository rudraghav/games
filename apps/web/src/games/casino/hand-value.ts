import type { Card } from '@games/api-client';

/** Total only supplied visible ranks, never predict a dealer card or outcome. */
export function visibleBlackjackValue(cards: readonly Card[]) {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    const value =
      card.value === 'A' ? 11 : ['J', 'Q', 'K'].includes(card.value) ? 10 : Number(card.value);
    if (!Number.isFinite(value) || value < 1 || value > 11) return null;
    total += value;
    if (card.value === 'A') aces += 1;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return { total, soft: aces > 0, bust: total > 21 };
}

export function blackjackValueLabel(cards: readonly Card[]) {
  const value = visibleBlackjackValue(cards);
  return !value
    ? 'Total unavailable'
    : `${value.total}${value.bust ? ' · bust' : value.soft ? ' · soft' : ''}`;
}
