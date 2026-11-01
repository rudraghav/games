import type { Card, Match, Room } from '@games/api-client';
import { blackjackDetails } from '@games/api-client';

type PublicAction = NonNullable<Room['lastAction']>;
export type CasinoSnapshot = {
  matchId: string | null;
  version: number;
  phase: string;
  currentPlayer: string | null;
  paused: boolean;
  pot: number;
  players: { id: string; chips: number; bet: number; folded: boolean }[];
  cards: Record<string, string[]>;
  action: PublicAction | null;
};
export type ChipTransfer = { playerId: string; amount: number; direction: 'bet' | 'payout' };
export type CasinoTransition = {
  key: string;
  actorId: string | null;
  action: PublicAction | null;
  turnChanged: boolean;
  newCards: string[];
  transfers: ChipTransfer[];
  potChanged: boolean;
};

const cardKeys = (cards: (Card | null)[]) =>
  cards.map((card, index) => card?.id || `hidden-${index}`);

/** Capture only the already-authorized viewer projection, never engine state. */
export function casinoSnapshot(room: Room, match: Match, selfId: string): CasinoSnapshot {
  const cards: Record<string, string[]> = { community: cardKeys(match.community) };
  if (match.detail.dealer_hidden) cards.community.push('dealer-hidden');
  if (match.id === 'blackjack') {
    const blackjack = blackjackDetails(match.detail);
    blackjack.hands.forEach((hand, index) => {
      cards[`own-${index}`] = cardKeys(hand.cards);
    });
  } else cards.own = cardKeys(match.hand);
  for (const player of match.players) {
    if (player.id === selfId) continue;
    cards[`seat-${player.id}`] = player.cards.length
      ? cardKeys(player.cards)
      : Array.from({ length: player.count }, (_, index) => `hidden-${index}`);
  }
  return {
    matchId: room.matchId,
    version: room.matchVersion ?? 0,
    phase: match.phase,
    currentPlayer: match.currentPlayer,
    paused: room.paused,
    pot: match.pot,
    players: match.players.map((player) => ({
      id: player.id,
      chips: player.chips ?? 0,
      bet: player.bet,
      folded: player.folded,
    })),
    cards,
    action: room.lastAction?.version === room.matchVersion ? room.lastAction : null,
  };
}

export function cardMotionKey(group: string, index: number, card: Card | null) {
  return `${group}:${index}:${card?.id || `hidden-${index}`}`;
}

/** A snapshot jump is a resync, not evidence that each missed action was seen. */
export function casinoTransition(
  before: CasinoSnapshot,
  after: CasinoSnapshot,
): CasinoTransition | null {
  if (
    !before.matchId ||
    before.matchId !== after.matchId ||
    after.version !== before.version + 1 ||
    before.paused ||
    after.paused
  )
    return null;
  const newCards: string[] = [];
  const previouslyVisible = new Set(
    Object.values(before.cards)
      .flat()
      .filter((id) => !id.startsWith('hidden-') && id !== 'dealer-hidden'),
  );
  for (const [group, cards] of Object.entries(after.cards)) {
    cards.forEach((id, index) => {
      if (!id.startsWith('hidden-') && id !== 'dealer-hidden' && !previouslyVisible.has(id))
        newCards.push(`${group}:${index}:${id}`);
    });
  }
  const action = after.action;
  const transfers: ChipTransfer[] = [];
  if (action?.amount && after.players.some((player) => player.id === action.actorId)) {
    transfers.push({ playerId: action.actorId, amount: action.amount, direction: 'bet' });
  } else if (!action && after.phase !== 'finished') {
    // Legacy matches may not have a receipt cue. Only animate an observable
    // stack reduction; never infer "call" or "check" from a change of turn.
    for (const player of after.players) {
      const previous = before.players.find((item) => item.id === player.id);
      const paid = previous ? previous.chips - player.chips : 0;
      if (paid > 0) transfers.push({ playerId: player.id, amount: paid, direction: 'bet' });
    }
  }
  if (after.phase === 'finished' && before.phase !== 'finished') {
    for (const player of after.players) {
      const previous = before.players.find((item) => item.id === player.id);
      // The display follows the visible stack increase, not an invented gross
      // side-pot allocation. Include an exact same-action payment if available.
      const paid = action?.actorId === player.id ? (action.amount ?? 0) : 0;
      const received = previous ? player.chips - previous.chips + paid : 0;
      if (received > 0)
        transfers.push({ playerId: player.id, amount: received, direction: 'payout' });
    }
  }
  return {
    key: `${after.matchId}:${after.version}`,
    actorId: action?.actorId ?? before.currentPlayer,
    action,
    turnChanged: before.currentPlayer !== after.currentPlayer,
    newCards,
    transfers,
    potChanged: before.pot !== after.pot,
  };
}

export function casinoActionLabel(gameId: string, type: string) {
  const labels: Record<string, string> = {
    fold: 'Fold',
    check: 'Check',
    call: 'Call',
    raise: 'Raise',
    all_in: 'All in',
    bet: 'Bet',
    hit: 'Hit',
    stand: 'Stand',
    split: 'Split',
    double: 'Double',
    peek: 'Seen',
    show: 'Show',
    sideshow: 'Sideshow',
    accept: gameId === 'blackjack' ? 'Insurance' : 'Sideshow accepted',
    decline: gameId === 'blackjack' ? 'No insurance' : 'Sideshow declined',
  };
  return labels[type] || 'Move';
}

export function casinoPhaseLabel(gameId: string, phase: string) {
  if (phase === 'finished') return 'Results';
  if (gameId === 'holdem')
    return (
      (
        { preflop: 'Pre-flop', flop: 'Flop', turn: 'Turn', river: 'River' } as Record<
          string,
          string
        >
      )[phase] || 'Poker'
    );
  if (gameId === 'teen-patti') return 'Teen Patti';
  return (
    (
      { betting: 'Place bets', insurance: 'Insurance', playing: 'Blackjack' } as Record<
        string,
        string
      >
    )[phase] || 'Blackjack'
  );
}
