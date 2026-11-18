import { gemsDetails, type ActionOption, type Match } from '@games/api-client';
import { boardExtras, mancalaExtras, plural } from '../board-previews';

export function boardDirection(match: Match): { option: ActionOption; tip: string } | undefined {
  const [first] = match.actions;
  if (!first) return;
  if (match.id === 'reversi' && first.value.type === 'place') {
    const flips = boardExtras(match.detail, match.community.length).flips[first.value.choice];
    if (!flips?.length) return;
    const square = (index: number) =>
      String.fromCharCode(65 + (index % 8)) + (1 + Math.floor(index / 8));
    const target = square(Number(first.value.choice));
    const affected = flips.map(square).join(', ');
    return {
      option: first,
      tip: `Tap ${target} once to preview the flip at ${affected}. Tap ${target} again to place your disc.`,
    };
  }
  if (match.id === 'checkers' && first.value.type === 'move') {
    const [from, to] = first.value.choice.split(':').map(Number);
    const start = match.community[from];
    const end = match.community[to];
    if (!start || !end) return;
    const jump = Math.abs(Math.floor(from / 8) - Math.floor(to / 8)) === 2;
    const midpoint = match.community[(from + to) / 2];
    const crowned =
      start.subtitle !== 'King' && (Math.floor(to / 8) === 0 || Math.floor(to / 8) === 7);
    return {
      option: first,
      tip:
        jump && midpoint
          ? `You must capture. Jump from ${start.label} over ${midpoint.label} to ${end.label}.${crowned ? ' The far row crowns your piece and ends the turn.' : ' If another jump lights up, continue with that same piece.'}`
          : `Move your ${start.subtitle === 'King' ? 'king' : 'piece'} from ${start.label} to the empty dark square ${end.label}.${crowned ? ' Reaching the far row crowns it.' : ''}`,
    };
  }
  if (match.id === 'mancala') {
    const { previews } = mancalaExtras(match.detail);
    const sows = match.actions.filter((o) => o.value.type === 'sow' && previews[o.value.choice]);
    const option =
      sows.find((o) => previews[o.value.choice].captures > 0) ??
      sows.find((o) => previews[o.value.choice].extraTurn) ??
      sows[0];
    if (!option) return;
    const { landing, captures, extraTurn } = previews[option.value.choice];
    const pit = (landing % 7) + 1;
    const own = Math.floor(Number(option.value.choice) / 7) === Math.floor(landing / 7);
    const effect =
      captures > 0
        ? `Your last seed lands in your empty pit ${pit}. The capture puts ${plural(captures, 'seed')} in your store.`
        : extraTurn
          ? 'Your last seed lands in your store, earning another sow if both sides still have seeds.'
          : `Your last seed lands in ${own ? 'your' : 'the other player’s'} pit ${pit}.`;
    return { option, tip: `${effect} Tap the pit to preview, then tap it again to sow.` };
  }
  if (match.id === 'gem-market') {
    const buy = match.actions.find((o) => o.value.type === 'buy');
    if (!buy) return;
    const info = gemsDetails(match.detail).cardInfo[buy.value.card];
    const reserved = match.hand.some((card) => card.id === buy.value.card);
    const where = reserved ? 'your reserved cards' : info ? `Tier ${info.tier}` : 'the market';
    return {
      option: buy,
      tip: `You can afford this development in ${where}. Select it to review the payment. Buying it gives you a permanent ${info?.bonus ?? 'gem'} discount.`,
    };
  }
}
