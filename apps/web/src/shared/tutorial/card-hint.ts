import {
  flipSevenDetails,
  rummyDetails,
  sheddingDetails,
  type ActionOption,
  type Match,
  type Room,
} from '@games/api-client';
import { cardConsequence, stackingRule, unoExtras } from '@/games/shared/uno-view';
import { playerName } from '@/games/types';

/** Compare only the learner's legal discards with the server's analysis of their hand. */
export function cardPracticeMove(match: Match) {
  if (match.id !== 'rummy' || match.phase !== 'discard') return undefined;
  const analyses = rummyDetails(match.detail).discard_analyses;
  const winning = match.actions.find(
    ({ value }) => value.type === 'declare' && analyses[value.card]?.valid,
  );
  if (winning) return winning;
  const discards = match.actions.filter(
    ({ value }) => value.type === 'discard' && analyses[value.card],
  );
  return discards.reduce<ActionOption | undefined>(
    (best, option) =>
      !best || analyses[option.value.card].deadwood < analyses[best.value.card].deadwood
        ? option
        : best,
    undefined,
  );
}

export function cardPracticeHint(match: Match, option: ActionOption, room: Room, selfId: string) {
  const move = option.value;
  if (match.id === 'uno' || match.id === 'uno-no-mercy') {
    const details = sheddingDetails(match.detail);
    const mercy = match.id === 'uno-no-mercy';
    const extras = unoExtras(match.detail);
    if (move.type === 'draw' && details.penalty > 0) {
      return `Take the ${details.penalty}-card penalty and pass the turn.${
        details.eliminationLimit && match.hand.length + details.penalty >= details.eliminationLimit
          ? ` This reaches the ${details.eliminationLimit}-card elimination limit.`
          : ''
      }`;
    }
    if (move.type === 'draw') {
      if (!mercy) return 'Draw one card. If it fits, you can play that card immediately or pass.';
      if (details.eliminationLimit && match.hand.length + 1 >= details.eliminationLimit)
        return `Drawing one more card reaches the ${details.eliminationLimit}-card elimination limit.`;
      return 'Draw until you get a playable card, then play it. Reaching 25 cards eliminates you.';
    }
    if (move.type === 'choose') {
      return details.pendingKind === 'roulette'
        ? 'Choose the colour you will draw until. A wild does not stop the draw.'
        : 'Choose the opening colour. The next card must match it or be a legal wild.';
    }
    const card = move.type === 'play' && match.hand.find((c) => c.id === move.card);
    if (card)
      return cardConsequence(card, {
        match,
        room,
        selfId,
        mercy,
        limit: details.eliminationLimit,
        hand: match.hand,
        color: details.color,
        direction: details.direction,
        penalty: details.penalty,
        sevenZero: Boolean(room.settings.seven_zero),
        stacking: stackingRule(mercy, room.settings, extras.stacking),
        missingTurn: extras.missingTurn,
      });
  }
  if (match.id === 'skyjo') {
    if ((move.type === 'reveal' || move.type === 'swap') && typeof move.slot === 'number') {
      const position = `row ${Math.floor(move.slot / 4) + 1}, column ${(move.slot % 4) + 1}`;
      if (move.type === 'reveal')
        return `Turn over the hidden card in ${position}. Its number will count toward your grid.`;
      return `Put ${match.drawn?.label ?? 'your drawn card'} in ${position}. The card currently there goes on the discard pile.`;
    }
    if (move.type === 'draw_discard' && match.discard) {
      return `Taking the visible ${match.discard.label} commits you to swapping it into your grid. A stock draw gives you the option to discard it instead.`;
    }
  }
  if (match.id === 'flip-7') {
    const data = flipSevenDetails(match.detail);
    const points = data.at_risk[selfId] ?? 0;
    if (move.type === 'stay')
      return `Bank your ${points} round points. The remaining active players can keep drawing.`;
    if (move.type === 'hit') {
      const protectedHand = match.players
        .find((p) => p.id === selfId)
        ?.cards.some((c) => c?.value === 'Second Chance');
      return protectedHand
        ? 'Draw one card. Your Second Chance can cancel one repeated number.'
        : `Draw one card. A number already in your hand busts this round. Staying instead banks ${points}.`;
    }
    if (move.type === 'target_effect' && move.target) {
      const who = move.target === selfId ? 'Your hand' : `${playerName(room, move.target)}’s hand`;
      if (data.pending_card === 'Freeze')
        return `${who} stops drawing this round and banks ${data.at_risk[move.target] ?? 0} points.`;
      if (data.pending_card === 'Flip Three')
        return `${who} must draw up to three cards. A bust ends the draw early.`;
      if (data.pending_card === 'Second Chance')
        return `${who} can discard one repeated number instead of busting.`;
    }
  }
  if (match.id === 'trio' && move.type === 'reveal_hand') {
    const who = move.target === selfId ? 'your row' : `${playerName(room, move.target)}’s row`;
    return `Reveal the ${move.choice === 'low' ? 'lowest' : 'highest'} card in ${who}. Only the two ends of a sorted hand are eligible.`;
  }
  if (match.id === 'rummy' && (move.type === 'discard' || move.type === 'declare')) {
    const info = rummyDetails(match.detail).discard_analyses[move.card];
    if (info?.valid)
      return 'This discard leaves all 13 cards in valid groups, including two sequences and a pure sequence. Declaring now wins the deal.';
    if (info && move.type === 'discard') {
      const loss = `After this discard, your projected loss is ${info.deadwood} ${info.deadwood === 1 ? 'point' : 'points'}.`;
      return info.scoring_gate
        ? `${loss} You have two sequences including a pure one, so only unmatched cards count, up to 80 points.`
        : `${loss} Until you have two sequences including a pure one, all non-joker cards count, up to 80 points.`;
    }
  }
  return undefined;
}
