import type { ActionOption, Card, Match, Room } from '@games/api-client';
import { blackjackDetails, holdemDetails, teenPattiDetails } from '@games/api-client';
import { playerName } from '../types';
import { blackjackPublic, holdemPublic, teenPublic } from './casino-public';
import { visibleBlackjackValue } from './hand-value';

/**
 * Casino copy built only from the viewer's authorized projection and public
 * history. It explains what each offered choice costs and what it does; it never
 * predicts a hidden card or decides an outcome the server has not settled.
 */
type Move = Room['activity'][number];
const plural = (amount: number, word = 'chip') => `${amount} ${word}${amount === 1 ? '' : 's'}`;

export function namer(room: Room, selfId: string) {
  return (id: string, start = false) =>
    id === selfId ? (start ? 'You' : 'you') : playerName(room, id);
}

const own = (match: Match, selfId: string) => match.players.find((p) => p.id === selfId);
const option = (match: Match, type: string) =>
  match.actions.find((item) => item.value.type === type);

/** Hold'em chips needed to call, capped by the stack (the engine's call amount). */
export function holdemCall(match: Match, selfId: string) {
  const player = own(match, selfId);
  if (match.id !== 'holdem' || !player) return 0;
  const current = holdemDetails(match.detail).currentBet;
  return Math.min(Math.max(0, current - player.bet), player.chips ?? 0);
}

/** When calling already takes the whole stack, "All in" is the same move as "Call". */
export function callIsAllIn(match: Match, selfId: string) {
  const player = own(match, selfId);
  return (
    match.id === 'holdem' &&
    Boolean(option(match, 'call')) &&
    Boolean(player) &&
    (player!.chips ?? 0) <= holdemCall(match, selfId)
  );
}

export type ChoiceView = {
  /** The accessible name: the server label, so tests and assistive tech agree. */
  name: string;
  /** Visual-only detail appended to the name, such as the chips it adds. */
  suffix?: string;
  /** What the choice costs or does, read after the name. */
  description?: string;
  tone: 'primary' | 'secondary';
  hidden?: boolean;
};

export function choiceView(match: Match, selfId: string, choice: ActionOption): ChoiceView {
  const type = choice.value.type;
  const secondary = ['fold', 'decline'].includes(type);
  const view: ChoiceView = { name: choice.label, tone: secondary ? 'secondary' : 'primary' };
  if (match.id === 'holdem') {
    const allIn = callIsAllIn(match, selfId);
    if (type === 'all_in' && allIn) return { ...view, hidden: true };
    if (type === 'call' && allIn)
      return {
        ...view,
        name: `Call all in · ${holdemCall(match, selfId)}`,
        description: 'Uses your whole stack. You can’t bet again this hand.',
      };
    if (type === 'all_in') return { ...view, description: 'Puts in every chip you have left.' };
  }
  if (match.id === 'blackjack' && ['double', 'split'].includes(type)) {
    const data = blackjackDetails(match.detail);
    const hand = data.hands[data.activeHand ?? 0];
    if (hand)
      return {
        ...view,
        suffix: ` · +${hand.bet}`,
        description:
          type === 'double'
            ? `Adds ${plural(hand.bet)} and deals exactly one more card.`
            : `Adds ${plural(hand.bet)} and plays the pair as two hands.`,
      };
  }
  if (match.id === 'teen-patti') {
    const data = teenPattiDetails(match.detail);
    if (type === 'peek')
      return {
        ...view,
        description: `After looking, bets cost ${data.stake * 2}–${data.stake * 4} (even).`,
      };
    if (type === 'fold') return { ...view, name: 'Pack (fold)' };
  }
  return view;
}

export type WagerView = {
  min: number;
  max: number;
  step: number;
  range: string;
  presets: { label: string; value: number }[];
};

export function wagerView(match: Match, selfId: string, choice: ActionOption): WagerView {
  const min = choice.minimum ?? 0;
  const max = choice.maximum ?? min;
  const step = choice.step || 1;
  const fit = (value: number) => {
    const bounded = Math.min(max, Math.max(min, Math.round(value)));
    return bounded - ((bounded - min) % step);
  };
  const presets: { label: string; value: number }[] = [];
  const add = (label: string, value: number) => {
    const fitted = fit(value);
    if (!presets.some((item) => item.value === fitted)) presets.push({ label, value: fitted });
  };
  let range = `${min}–${max} chips`;
  if (match.id === 'holdem') {
    const current = holdemDetails(match.detail).currentBet;
    const call = holdemCall(match, selfId);
    // A pot-sized raise: call first, then raise by everything now in the pot.
    add(`Min ${min}`, min);
    add('½ pot', current + Math.floor((match.pot + call) / 2));
    add('Pot', current + match.pot + call);
    if (!option(match, 'all_in')) add(`Max ${max}`, max);
    range = `${current ? 'Raise to' : 'Bet'} ${min}–${max} chips`;
  } else if (match.id === 'teen-patti') {
    const blind = teenPattiDetails(match.detail).blind;
    add(`Min ${min}`, min);
    add(`Max ${max}`, max);
    range = blind
      ? `Blind bet ${min}–${max} chips`
      : `Chaal (seen bet) ${min}–${max} chips, even amounts`;
  } else {
    for (const value of [min, 10, 20, 50]) if (value >= min && value <= max) add(`${value}`, value);
    range = `${min}–${max} chips, even amounts`;
  }
  return {
    min,
    max,
    step,
    range,
    presets: presets.filter((item) => item.value >= min && item.value <= max).slice(0, 4),
  };
}

/** Why an amount can't be sent yet, in words; null when the server would accept it. */
export function wagerProblem(amount: number, wager: Pick<WagerView, 'min' | 'max' | 'step'>) {
  if (!Number.isFinite(amount)) return 'Enter an amount.';
  if (amount < wager.min) return `Enter at least ${wager.min}.`;
  if (amount > wager.max) return `Enter at most ${wager.max}.`;
  if ((amount - wager.min) % wager.step !== 0)
    return wager.step === 2 ? 'Use an even amount.' : `Use steps of ${wager.step}.`;
  return null;
}

/** The dock's line for the viewer: what the offered choices cost and do. */
export function casinoInstruction(match: Match, room: Room, selfId: string): string | null {
  const player = own(match, selfId);
  if (!player || match.phase === 'finished') return null;
  const who = namer(room, selfId);
  if (match.id === 'holdem') {
    const invested = holdemPublic(match).contributions[selfId] ?? player.bet;
    const forfeit = invested
      ? `Folding gives up the ${plural(invested)} you’ve put in.`
      : 'Folding costs nothing more.';
    if (player.folded) return 'You folded. The hand plays on without you.';
    if (!player.chips && !match.actions.length)
      return 'You’re all in. The remaining cards are dealt; you can win up to your share of the pot.';
    if (!match.actions.length) return null;
    const raise = option(match, 'raise');
    const call = holdemCall(match, selfId);
    if (option(match, 'call')) {
      if (callIsAllIn(match, selfId))
        return `Calling puts your last ${plural(player.chips ?? 0)} in, so you can’t bet again this hand. ${forfeit}`;
      return `${plural(call)} to call.${raise ? ' A raise makes everyone else match your total or fold.' : ''} ${forfeit}`;
    }
    return `Nothing to call, so checking is free.${raise ? ` A bet of ${raise.minimum}+ makes everyone else match it or fold.` : ''}`;
  }
  if (match.id === 'teen-patti') {
    const data = teenPattiDetails(match.detail);
    const extra = teenPublic(match);
    if (player.folded)
      return extra.out_reasons[selfId] === 'lost_sideshow'
        ? 'You lost the sideshow, so you’re out of this hand.'
        : 'You packed. You’ll see the result when the hand ends.';
    if (data.sideshow && data.sideshow.target === selfId && match.actions.length) {
      const asker = who(data.sideshow.actor);
      return `${asker} asks you for a sideshow. Accept: your two hands are compared privately and the weaker one packs (equal hands: ${asker} packs). Decline: play continues.`;
    }
    if (!match.actions.length) return null;
    const bet = option(match, 'bet');
    const parts = [
      bet
        ? data.blind
          ? `Blind bets cost ${bet.minimum}–${bet.maximum}; after looking they cost ${data.stake * 2}–${data.stake * 4}.`
          : `Chaal ${bet.minimum}–${bet.maximum} chips (even).`
        : 'You can’t afford the stake; you can pack.',
    ];
    if (option(match, 'sideshow') && data.sideshow_target)
      parts.push(
        `A sideshow (${data.sideshow_cost ?? bet?.minimum ?? 0}) compares your hand privately with ${who(data.sideshow_target)}’s; the weaker hand packs and ties pack you.`,
      );
    if (option(match, 'show'))
      parts.push(
        'A show reveals both hands; the better hand takes the pot and ties go against you.',
      );
    return parts.join(' ');
  }
  // Blackjack
  const data = blackjackDetails(match.detail);
  if (!match.actions.length) return null;
  if (match.phase === 'betting') {
    const bet = option(match, 'bet');
    return `Bet ${bet?.minimum ?? 2}–${bet?.maximum ?? player.chips ?? 0} chips in even amounts. Blackjack pays 3:2; a tie returns your bet.`;
  }
  if (match.phase === 'insurance') {
    const insure = option(match, 'accept');
    const cost = Math.floor(player.bet / 2);
    return insure
      ? `Insurance costs ${plural(cost)} and pays 2:1 if the dealer has blackjack. Your hand bet is settled separately.`
      : 'You can’t afford insurance; decline to continue.';
  }
  const index = data.activeHand ?? 0;
  const hand = data.hands[index];
  if (!hand) return null;
  const value = visibleBlackjackValue(hand.cards);
  const total = value ? `${value.soft ? 'soft ' : ''}${value.total}` : 'unknown';
  const up = match.community[0];
  const parts = [
    `${data.hands.length > 1 ? `Hand ${index + 1} of ${data.hands.length}` : 'Your hand'}: ${total}${up ? ` against the dealer’s ${up.value}` : ''}.`,
  ];
  if (option(match, 'double')) parts.push(`Double adds ${hand.bet} for exactly one more card.`);
  if (option(match, 'split')) parts.push(`Split adds ${hand.bet} and plays two hands.`);
  return parts.join(' ');
}

/** Each seat's latest public move this street (Hold'em) or this round, in a few words. */
export function seatMoves(room: Room, match: Match): Record<string, string> {
  const moves = [...room.activity].sort((a, b) => a.version - b.version);
  let start = 0;
  if (match.id === 'holdem' && match.community.length) {
    const board = new Set(match.community.map((card) => card.id));
    moves.forEach((move, index) => {
      if (move.cards.some((card) => board.has(card.id))) start = index + 1;
    });
  }
  const result: Record<string, string> = {};
  for (const move of moves.slice(start)) {
    const label = seatMoveLabel(match, move);
    if (label) result[move.actorId] = label;
  }
  return result;
}

function seatMoveLabel(match: Match, move: Move) {
  const player = match.players.find((item) => item.id === move.actorId);
  const amount = move.amount ?? 0;
  if (match.id === 'holdem')
    return (
      {
        fold: 'Folded',
        check: 'Checked',
        call: 'Called',
        raise: player?.bet ? `Raised to ${player.bet}` : 'Raised',
        all_in: 'All in',
      } as Record<string, string>
    )[move.type];
  if (match.id === 'teen-patti')
    return (
      {
        fold: 'Packed',
        peek: 'Saw cards',
        bet: `Bet ${amount}`,
        show: 'Asked to show',
        sideshow: 'Asked for sideshow',
        accept: 'Took sideshow',
        decline: 'Refused sideshow',
      } as Record<string, string>
    )[move.type];
  return (
    {
      bet: `Bet ${amount}`,
      accept: 'Insured',
      decline: 'No insurance',
      hit: 'Hit',
      stand: 'Stood',
      split: 'Split',
      double: 'Doubled',
    } as Record<string, string>
  )[move.type];
}

export type Cue = { actor: string | null; text: string } | null;

/** The felt's "what just happened" line, attributed and from the viewer's seat. */
export function feltCue(room: Room, match: Match, selfId: string): Cue {
  const who = namer(room, selfId);
  if (match.phase === 'finished') return resultCue(room, match, selfId);
  const action = room.lastAction?.version === room.matchVersion ? room.lastAction : null;
  if (!action) return null;
  const actor = action.actorId === selfId ? 'You' : playerName(room, action.actorId);
  const amount = action.amount ?? 0;
  const player = match.players.find((item) => item.id === action.actorId);
  if (match.id === 'holdem') {
    const text = (
      {
        fold: 'folded',
        check: 'checked',
        call: `called ${amount}`,
        raise: player?.bet ? `raised to ${player.bet} (+${amount})` : `raised (+${amount})`,
        all_in: `went all in (+${amount})`,
      } as Record<string, string>
    )[action.type];
    return text ? { actor, text } : null;
  }
  if (match.id === 'teen-patti') {
    const extra = teenPublic(match);
    const data = teenPattiDetails(match.detail);
    const result = extra.sideshow_result;
    if (['accept', 'decline'].includes(action.type) && result) {
      if (!result.accepted)
        return {
          actor,
          text: `declined ${result.requester === selfId ? 'your' : `${who(result.requester)}’s`} sideshow; play continues`,
        };
      const loser = result.loser;
      if (!loser) return { actor, text: 'accepted the sideshow' };
      const winner = loser === result.requester ? result.target : result.requester;
      if (loser === selfId)
        return { actor: null, text: `Sideshow: ${who(winner)} had the stronger hand, so you pack` };
      if (winner === selfId)
        return { actor: null, text: `Sideshow: your hand was stronger, so ${who(loser)} packs` };
      return {
        actor: null,
        text: `Sideshow: ${who(winner)}’s hand was stronger, so ${who(loser)} packs`,
      };
    }
    if (action.type === 'sideshow' && data.sideshow)
      return { actor, text: `asked ${who(data.sideshow.target)} for a sideshow (${amount})` };
    const text = (
      {
        fold: 'packed',
        peek: action.actorId === selfId ? 'looked at your cards' : 'looked at their cards',
        bet: `bet ${amount}`,
        show: `asked for a show (${amount})`,
      } as Record<string, string>
    )[action.type];
    return text ? { actor, text } : null;
  }
  const text = (
    {
      bet: `bet ${amount}`,
      accept: `took insurance (${amount})`,
      decline: 'declined insurance',
      hit: 'hit',
      stand: 'stood',
      double: `doubled down (+${amount})`,
      split: `split (+${amount})`,
    } as Record<string, string>
  )[action.type];
  return text ? { actor, text } : null;
}

function resultCue(room: Room, match: Match, selfId: string): Cue {
  const who = namer(room, selfId);
  const winners = match.winners.map((id) => who(id, true));
  const named =
    winners.length > 2
      ? `${winners.slice(0, 2).join(', ')} and ${winners.length - 2} more`
      : winners.join(' and ');
  const verb = match.winners.length > 1 ? 'split' : match.winners[0] === selfId ? 'win' : 'wins';
  if (match.id === 'blackjack') {
    const dealer = visibleBlackjackValue(match.community);
    if (!dealer) return null;
    const natural = match.community.length === 2 && dealer.total === 21;
    return {
      actor: null,
      text: natural
        ? 'Dealer has blackjack'
        : dealer.total > 21
          ? `Dealer busts with ${dealer.total}`
          : `Dealer stands on ${dealer.total}`,
    };
  }
  if (!match.winners.length) return null;
  const hand =
    match.id === 'holdem'
      ? holdemPublic(match).hand_evaluations[match.winners[0]]?.short
      : teenPublic(match).hand_evaluations[match.winners[0]]?.short;
  const how = hand
    ? ` with ${handPhrase(hand)}`
    : match.id === 'holdem'
      ? ': everyone else folded'
      : ': everyone else packed';
  return { actor: null, text: `${named} ${verb} ${plural(match.pot)}${how}` };
}

/** "a flush", "two pair", "ace high": a hand name as it reads in a sentence. */
export function handPhrase(name: string) {
  const lower = name.charAt(0).toLowerCase() + name.slice(1);
  return / high$|^(two pair|three of a kind|four of a kind)$/i.test(name) ? lower : `a ${lower}`;
}

export type SeatResult = { tone: 'win' | 'loss' | 'push'; chip: string; caption: string };

const signed = (value: number) => (value > 0 ? `+${value}` : value < 0 ? `−${-value}` : '0');

/** One seat's settled result, for its caption and result chip. */
export function seatResult(match: Match, playerId: string): SeatResult | null {
  if (match.phase !== 'finished') return null;
  const player = match.players.find((item) => item.id === playerId);
  if (!player) return null;
  if (match.id === 'blackjack') {
    const ledger = blackjackDetails(match.detail).settlements[playerId];
    if (!ledger) return null;
    const outcomes = ledger.hands.map((hand) => hand.settlement?.outcome);
    const net = ledger.net;
    const tone = net > 0 ? 'win' : net < 0 ? 'loss' : 'push';
    let caption = net > 0 ? 'Won' : net < 0 ? 'Lost' : 'Push';
    if (outcomes.length === 1 && outcomes[0] === 'blackjack') caption = 'Blackjack';
    else if (
      outcomes.length === 1 &&
      ledger.hands[0] &&
      (visibleBlackjackValue(ledger.hands[0].cards)?.total ?? 0) > 21
    )
      caption = 'Bust';
    else if (outcomes.length > 1) {
      const won = outcomes.filter((item) => item === 'win' || item === 'blackjack').length;
      const pushed = outcomes.filter((item) => item === 'push').length;
      caption =
        won === 0 && pushed === 0
          ? outcomes.length === 2
            ? 'Lost both hands'
            : `Lost all ${outcomes.length} hands`
          : pushed === outcomes.length
            ? 'Push'
            : `Won ${won} of ${outcomes.length} hands`;
    }
    return { tone, chip: signed(net), caption };
  }
  const net = player.score;
  const won = match.winners.includes(playerId);
  const tone = won ? 'win' : 'loss';
  if (match.id === 'holdem') {
    const hand = holdemPublic(match).hand_evaluations[playerId]?.short;
    const caption = won
      ? hand
        ? `Won · ${hand}`
        : 'Won'
      : player.folded
        ? 'Folded'
        : hand
          ? `Lost · ${hand}`
          : 'Lost';
    return { tone, chip: signed(net), caption };
  }
  const extra = teenPublic(match);
  const hand = extra.hand_evaluations[playerId]?.short;
  const reason = extra.out_reasons[playerId];
  const caption = won
    ? hand
      ? `Won · ${hand}`
      : 'Won'
    : reason === 'lost_sideshow'
      ? 'Lost sideshow'
      : reason === 'lost_show'
        ? `Lost show${hand ? ` · ${hand}` : ''}`
        : reason === 'packed' || player.folded
          ? 'Packed'
          : hand
            ? `Lost · ${hand}`
            : 'Lost';
  return { tone, chip: signed(net), caption };
}

/** Cards that made the winning hands, so the table can mark them. */
export function winningCards(match: Match): Set<string> {
  const ids = new Set<string>();
  if (match.phase !== 'finished') return ids;
  if (match.id === 'holdem') {
    const evaluations = holdemPublic(match).hand_evaluations;
    for (const id of match.winners)
      for (const card of evaluations[id]?.cards ?? []) ids.add(card.id);
  }
  if (match.id === 'teen-patti') {
    const shown = teenPublic(match).hand_evaluations;
    for (const id of match.winners)
      if (shown[id])
        for (const card of match.players.find((p) => p.id === id)?.cards ?? [])
          if (card) ids.add(card.id);
  }
  return ids;
}

export type GroupedHand = { cards: Card[]; total: number; soft: boolean; bet: number };

/** Split a Blackjack seat's flattened public cards back into its hands. */
export function blackjackSeatHands(match: Match, playerId: string): GroupedHand[] {
  if (match.id !== 'blackjack') return [];
  const sizes = blackjackPublic(match).public_hands[playerId] ?? [];
  const cards = (match.players.find((p) => p.id === playerId)?.cards ?? []).filter(
    (card): card is Card => card !== null,
  );
  if (!sizes.length || sizes.reduce((sum, hand) => sum + hand.size, 0) !== cards.length) return [];
  let offset = 0;
  return sizes.map((hand) => {
    const slice = cards.slice(offset, offset + hand.size);
    offset += hand.size;
    return { cards: slice, total: hand.total, soft: hand.soft, bet: hand.bet };
  });
}
