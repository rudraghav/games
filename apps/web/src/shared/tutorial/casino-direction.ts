import {
  rouletteDetails,
  slotsDetails,
  blackjackDetails,
  type ActionOption,
  type Match,
} from '@games/api-client';
import { choiceView, wagerView } from '@/games/casino/casino-guidance';
import { visibleBlackjackValue } from '@/games/casino/hand-value';

/** Explain the current player's visible hand or the price offered in the existing wager dock. */
export function casinoDirection(match: Match, suggested: ActionOption | undefined, selfId: string) {
  if (suggested?.value.type === 'spin' && (match.id === 'roulette' || match.id === 'slots')) {
    const wheel = match.id === 'roulette';
    const history = wheel
      ? rouletteDetails(match.detail).history
      : slotsDetails(match.detail).history;
    const last = history.at(-1);
    const tip = !last
      ? wheel
        ? 'Red covers 18 of the 37 pockets. Select Red or choose a number, then set your stake and spin.'
        : 'Start with one chip. Read the three center symbols after they stop.'
      : history.length === 1
        ? `Your first spin returned ${last.payout} on a stake of ${last.stake}. Open Spin history to see how the balance changed.`
        : wheel
          ? 'A new spin has the same 37 possible pockets. Open Payouts and odds to compare an outside bet with a single number.'
          : 'Open Paytable and odds to compare two cherries with three matching symbols, then choose your next stake.';
    return { option: suggested, tip };
  }
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
