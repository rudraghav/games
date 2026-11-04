import type { Card, DealDetails, Match, Room } from '@games/api-client';
import { playerName } from '../types';
import { distinctNames } from '../shared/seat-names';
import { bankValue, groupName } from './presentation';

/** Printed card names for the pending effects a table can be waiting on. */
const EFFECT_NAMES: Record<string, string> = {
  sly: 'Sly deal',
  forced: 'Forced deal',
  breaker: 'Deal breaker',
  heist: 'Heist',
  crash: 'Market crash',
  super_sly: 'Super sly deal',
  tough: 'Tough luck',
  repossession: 'Repossession',
  tax: 'Tax collector',
  unfair: 'Unfair trade',
  forced_debt: 'Forced debt',
};

/** Short printed colour names for chips: the name is the cue, never colour alone. */
export const SHORT_SET_NAMES: Record<string, string> = {
  brown: 'Brown',
  sky: 'Lt blue',
  pink: 'Pink',
  orange: 'Orange',
  red: 'Red',
  yellow: 'Yellow',
  green: 'Green',
  blue: 'Dk blue',
  rail: 'Rail',
  utility: 'Utility',
};

export interface Denomination {
  value: number;
  label: string;
  count: number;
  cards: Card[];
}

/** Bank cards grouped by printed value, smallest first: 1M ×3 · 2M ×2. */
export function denominations(bank: Card[]): Denomination[] {
  const groups = new Map<number, Card[]>();
  for (const card of bank)
    groups.set(bankValue(card), [...(groups.get(bankValue(card)) || []), card]);
  return [...groups.entries()]
    .sort(([a], [b]) => a - b)
    .map(([value, cards]) => ({ value, label: `${value}M`, count: cards.length, cards }));
}

export const bankTotal = (bank: Card[]) => bank.reduce((sum, card) => sum + bankValue(card), 0);

const list = (names: string[]) =>
  names.length <= 1
    ? names[0] || ''
    : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

/** Debts as "Mira" or "Mira ×2, Sam" from a debtor's list of creditors. */
export function debtNames(room: Room, creditors: string[], selfId: string) {
  const counts = new Map<string, number>();
  for (const id of creditors) counts.set(id, (counts.get(id) || 0) + 1);
  return list(
    [...counts.entries()].map(
      ([id, count]) =>
        `${id === selfId ? 'you' : playerName(room, id)}${count > 1 ? ` ×${count}` : ''}`,
    ),
  );
}

export type StatusTone = 'active' | 'waiting' | 'complete';
export interface TableStatus {
  /** One plain sentence about the current state, said from the viewer's seat. */
  text: string;
  tone: StatusTone;
  /** Remaining ordinary plays, shown only during a normal turn, with their owner. */
  plays: { left: number; owner: string; mine: boolean } | null;
  /** Short dock heading for a seat that is not choosing a card. */
  title: string;
  /** What the viewer can do now, for the idle dock. */
  hint: string;
}

/** The engine's pending effect in words: "Ada's Sly deal" or "your 5M rent". */
function effectName(details: DealDetails) {
  const effect = details.pendingAction;
  if (!effect) return details.pending || 'action';
  if (effect.kind === 'bill')
    return effect.source_collection ? `${effect.amount ?? 0}M rent` : `${effect.amount ?? 0}M bill`;
  return EFFECT_NAMES[effect.kind] || effect.kind.replaceAll('_', ' ');
}

/** A settled No Mercy debt hands one card to its creditor before the turn resumes. */
function giftFrom(match: Match, room: Room) {
  const last = room.activity.at(-1);
  return last?.type === 'settle_debt' &&
    match.currentPlayer &&
    last.targets.includes(match.currentPlayer) &&
    !match.detail.pending_action
    ? last.actorId
    : null;
}

/**
 * Viewer-aware turn, pending and result copy for the shared centre row and the
 * idle command dock. It uses only the public projection and public move history.
 */
export function tableStatus(
  match: Match,
  room: Room,
  selfId: string,
  details: DealDetails,
): TableStatus {
  // Short, still-distinct names keep the status to two lines on a phone.
  const short = distinctNames(room.members.map((member) => playerName(room, member.id)));
  const labels = new Map(room.members.map((member, index) => [member.id, short[index]]));
  const nameOf = (id: string) => labels.get(id) || playerName(room, id);
  const who = (id: string | null | undefined) =>
    !id ? 'a player' : id === selfId ? 'you' : nameOf(id);
  const Who = (id: string | null | undefined) => {
    const name = who(id);
    return name.charAt(0).toUpperCase() + name.slice(1);
  };
  const whose = (id: string) => (id === selfId ? 'your' : `${nameOf(id)}’s`);
  const current = match.currentPlayer;
  const acting = match.actions.length > 0;
  const waiting = (text: string, title = `Waiting for ${who(current)}`): TableStatus => ({
    text,
    tone: 'waiting',
    plays: null,
    title,
    hint: `${text}. You can inspect any public card meanwhile.`,
  });

  if (match.phase === 'finished') {
    const winners = match.winners;
    const sets = list(
      details.collections
        .filter((group) => group.player === winners[0] && group.complete)
        .map((group) => groupName(group.key, details.propertyGroups)),
    );
    const text = !winners.length
      ? 'Match over'
      : `${winners.includes(selfId) ? 'You' : list(winners.map(nameOf))} won${sets ? ` with ${sets}` : ''}`;
    return { text, tone: 'complete', plays: null, title: 'Match over', hint: text };
  }

  const effect = details.pendingAction;
  if (details.pending && effect) {
    const name = effectName(details);
    const by = effect.actor;
    if (effect.stage === 'payment') {
      const amount = `${effect.amount ?? details.paymentAmount}M`;
      if (current === selfId)
        return {
          text: `You owe ${who(by)} ${amount}`,
          tone: 'active',
          plays: null,
          title: `You owe ${amount}`,
          hint: `Pay ${who(by)} ${amount} from your bank or properties.`,
        };
      return waiting(
        by === selfId
          ? `Waiting for ${who(current)} to pay you ${amount}`
          : `${Who(current)} owes ${who(by)} ${amount}`,
      );
    }
    if (effect.stage === 'select') {
      if (current === selfId)
        return {
          text: `Choose what your ${name} takes from ${who(effect.target)}`,
          tone: 'active',
          plays: null,
          title: `Your ${name}`,
          hint: `Choose a card to take from ${who(effect.target)}.`,
        };
      return waiting(
        effect.target === selfId
          ? `${Who(by)} is choosing what to take from you`
          : `${Who(by)} is choosing what to take from ${who(effect.target)}`,
      );
    }
    if (effect.stage === 'distribution') {
      if (current === selfId)
        return {
          text: `Choose what you keep from ${whose(by)} ${name}`,
          tone: 'active',
          plays: null,
          title: `${Who(by)}’s ${name}`,
          hint: 'Choose what you keep; the rest goes to them.',
        };
      return waiting(`${Who(current)} is choosing what to keep from ${whose(by)} ${name}`);
    }
    // Counter window: the responder may play Just Say No or let it stand.
    if (current === selfId)
      return {
        text: effect.blocked
          ? `${Who(effect.target)} blocked ${whose(by)} ${name} with Just Say No`
          : effect.kind === 'bill'
            ? `${Who(by)} charges you ${name.replace(' bill', '')}`
            : `${Who(by)} played ${name} on you`,
        tone: 'active',
        plays: null,
        title: 'Your response',
        hint: 'Respond to the pending action.',
      };
    return waiting(
      by === selfId
        ? `Waiting for ${who(current)} to respond to your ${name}`
        : effect.target === selfId
          ? `Waiting for ${who(current)} to answer your Just Say No`
          : `${Who(by)}’s ${name} on ${who(effect.target)}: waiting for ${who(current)}`,
    );
  }

  const giver = giftFrom(match, room);
  if (giver) {
    if (current === selfId)
      return {
        text: `Play or bank the card ${who(giver)} gave you`,
        tone: 'active',
        plays: null,
        title: 'Card received',
        hint: `Play or bank the card ${who(giver)} gave you for their debt.`,
      };
    return waiting(`${Who(current)} is using the card ${who(giver)} gave them`);
  }

  if (match.phase === 'discard') {
    if (current === selfId) {
      const extra = Math.max(0, match.hand.length - 7);
      return {
        text: `Discard ${extra} card${extra === 1 ? '' : 's'}: you can keep 7`,
        tone: 'active',
        plays: null,
        title: 'Discard down to 7',
        hint: `Select ${extra === 1 ? 'the card' : `${extra} cards, one at a time,`} to discard.`,
      };
    }
    return waiting(`${Who(current)} is discarding down to 7 cards`);
  }

  const creditors = details.debts[selfId] || [];
  const settling = match.actions.some((option) => option.value.type === 'settle_debt');
  if (current === selfId && creditors.length && settling) {
    const owed = debtNames(room, creditors, selfId);
    return {
      text: `You owe ${owed} ${creditors.length === 1 ? 'a debt chip' : `${creditors.length} debt chips`}: settle before you play`,
      tone: 'active',
      plays: null,
      title: `You owe ${owed}`,
      hint: `Give ${owed} a card from your hand; they play or bank it at once.`,
    };
  }

  const left = Math.max(0, details.moves);
  if (current === selfId) {
    const extra = match.hand.length - 7;
    return {
      text:
        extra > 0 && left > 0
          ? `Your turn: ending now means discarding ${extra} card${extra === 1 ? '' : 's'}`
          : 'Your turn',
      tone: 'active',
      plays: { left, owner: 'you', mine: true },
      title: 'Your move',
      hint: match.actions.some(
        (option) => option.value.card && match.hand.some((card) => card.id === option.value.card),
      )
        ? 'Select a card in your hand to play, place or bank it.'
        : match.actions.some((option) => option.value.type === 'rearrange')
          ? 'Select a property in your sets to move it, or end your turn.'
          : acting
            ? 'No card can be played now. End your turn when ready.'
            : 'No card can be played now.',
    };
  }
  if (current)
    return {
      text: `${Who(current)}’s turn`,
      tone: 'waiting',
      plays: { left, owner: nameOf(current), mine: false },
      title: `${Who(current)}’s turn`,
      hint: 'You can inspect any public card while you wait.',
    };
  return { text: 'At the table', tone: 'waiting', plays: null, title: 'At the table', hint: '' };
}
