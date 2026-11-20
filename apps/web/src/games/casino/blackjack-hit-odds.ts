import type { Card, Match } from '@games/api-client';
import { visibleBlackjackValue } from './hand-value';

function pip(card: Card | null) {
  if (card?.value === 'A') return 1;
  if (['10', 'J', 'Q', 'K'].includes(card?.value ?? '')) return 10;
  return /^[2-9]$/.test(card?.value ?? '') ? Number(card?.value) : 0;
}

/** Single-hit bust probability for this table's six-deck game after the dealer checks blackjack. */
export function blackjackHitBustChance(match: Match) {
  if (match.phase !== 'playing' || !match.actions.some((move) => move.value.type === 'hit'))
    return null;
  const hand = visibleBlackjackValue(match.hand);
  if (!hand || match.hand.length < 2 || match.community.length !== 1) return null;
  const upcard = pip(match.community[0]);
  // All player cards, including split and finished hands, already appear on their seats.
  const shown = [...match.community, ...match.players.flatMap((seat) => seat.cards)];
  const unseen = 312 - shown.length;
  if (unseen !== (match.drawCount ?? 0) + 1 || unseen < 2) return null;
  const remaining = [0, 24, 24, 24, 24, 24, 24, 24, 24, 24, 96];
  for (const card of shown) {
    const rank = pip(card);
    if (!rank || --remaining[rank] < 0) return null;
  }
  // With an ace or ten up, reaching play rules out one value for the hidden dealer card.
  const forbiddenHole = upcard === 1 ? 10 : upcard === 10 ? 1 : 0;
  const possibleHoles = unseen - remaining[forbiddenHole];
  if (!possibleHoles) return null;
  if (hand.soft) return 0;
  let bustPairs = 0;
  for (let hit = 1; hit <= 10; hit++) {
    if (hand.total + hit <= 21) continue;
    const holesAfterHit = possibleHoles - (hit === forbiddenHole ? 0 : 1);
    bustPairs += remaining[hit] * holesAfterHit;
  }
  return bustPairs / (possibleHoles * (unseen - 1));
}
