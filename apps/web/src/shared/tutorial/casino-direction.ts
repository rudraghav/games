import { blackjackDetails, type ActionOption, type Match } from '@games/api-client';
import { choiceView, wagerView } from '@/games/casino/casino-guidance';
import { visibleBlackjackValue } from '@/games/casino/hand-value';

/** Explain the current player's visible hand or the price offered in the existing wager dock. */
export function casinoDirection(match: Match, suggested: ActionOption | undefined, selfId: string) {
  if (!suggested || !['blackjack', 'holdem', 'teen-patti'].includes(match.id)) return;
  if (suggested.input === 'amount') {
    return {
      option: suggested,
      tip: wagerView(match, selfId, suggested).range + '. Choose your amount at the table.',
    };
  }
  if (match.id === 'blackjack' && suggested.value.type === 'stand') {
    const { hands, activeHand } = blackjackDetails(match.detail);
    const hand = hands[activeHand ?? (hands.length === 1 ? 0 : -1)];
    const total = hand?.cards.length && visibleBlackjackValue(hand.cards);
    if (total) {
      const hit = match.actions.find((o) => o.value.type === 'hit');
      if (hit && total.total <= 11) {
        return {
          option: hit,
          tip: `Your hand totals ${total.total}. Even a ten keeps you at or below 21, so you can hit once without busting.`,
        };
      }
      return {
        option: suggested,
        tip: `Standing keeps your ${total.soft ? 'soft ' : ''}${total.total} and ends play on this hand.`,
      };
    }
  }
  const detail = choiceView(match, selfId, suggested).description;
  if (detail) return { option: suggested, tip: detail };
}
