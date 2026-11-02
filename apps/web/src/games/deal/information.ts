import type { Card, DealDetails, Match, Room } from '@games/api-client';
import { playerName } from '../types';
import { pileName } from './presentation';

export interface DealInfoEntry {
  card: Card;
  location: string;
  owner?: string;
  setKey?: string;
  banked?: boolean;
}

/** Explicit authorized zones only. Never inspect arbitrary detail or another hand. */
export function dealInfoEntries(match: Match, room: Room, selfId: string, details: DealDetails) {
  const entries: DealInfoEntry[] = match.hand.map((card) => ({ card, location: 'Your hand' }));
  for (const player of match.players) {
    const owner = player.id === selfId ? 'Your' : `${playerName(room, player.id)}’s`;
    entries.push(
      ...player.bank.map((card) => ({
        card,
        owner: player.id,
        banked: true,
        location: `${owner} bank`,
      })),
    );
    for (const [setKey, cards] of Object.entries(player.properties)) {
      entries.push(
        ...cards.map((card) => ({
          card,
          owner: player.id,
          setKey,
          location: `${owner} ${pileName(setKey, details.propertyGroups)}`,
        })),
      );
    }
  }
  if (match.discard) entries.push({ card: match.discard, location: 'Discard' });
  return [...new Map(entries.map((entry) => [entry.card.id, entry])).values()];
}

export function rentOptions(card: Card, match: Match, details: DealDetails, selfId: string) {
  if (!['rent', 'rent_double'].includes(card.effect)) return [];
  const keys = new Set(
    match.actions
      .filter((option) => option.value.card === card.id && option.value.type === 'play')
      .map((option) => option.value.color),
  );
  return details.collections
    .filter((group) => group.player === selfId && keys.has(group.key))
    .map((group) => ({
      key: group.key,
      label: pileName(group.key, details.propertyGroups),
      amount: group.rent * (card.effect === 'rent_double' ? 2 : details.rentMultiplier),
    }));
}
