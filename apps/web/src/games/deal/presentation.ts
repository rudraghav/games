import type { ActionOption, Card, DealGroup, Match, Room } from '@games/api-client';
import { playerName } from '../types';

export const bankValue = (card: Card) => Number.parseInt(card.value, 10) || 0;
export const groupName = (key: string, groups: DealGroup[]) =>
  groups.find((group) => group.color === key.split(':')[0])?.name || key.split(':')[0];
export const pileName = (key: string, groups: DealGroup[]) =>
  `${groupName(key, groups)}${key.includes(':') ? ` · set ${Number(key.split(':')[1]) + 1}` : ''}`;

export function actionLabel(option: ActionOption, match: Match, room: Room, groups: DealGroup[]) {
  const action = option.value;
  const assets = [
    ...match.hand,
    ...match.players.flatMap((player) => [
      ...player.bank,
      ...Object.values(player.properties).flat(),
    ]),
  ];
  const cardName = (id: string) => assets.find((card) => card.id === id)?.label || 'property';
  const parts = [
    action.target ? playerName(room, action.target) : '',
    action.color
      ? pileName(
          action.choice && ['property', 'rearrange'].includes(action.type)
            ? action.choice
            : action.color,
          groups,
        )
      : '',
    action.choice && !['property', 'rearrange'].includes(action.type)
      ? assets.some((card) => card.id === action.choice)
        ? `Take ${cardName(action.choice)}`
        : action.choice
      : '',
    action.cards?.length ? `Give ${action.cards.map(cardName).join(', ')}` : '',
  ].filter(Boolean);
  return parts.join(' · ') || option.label;
}

/** Pick bank cards with the least overpayment. Never auto-select property. */
export function suggestBankPayment(bank: Card[], eligible: string[], due: number): string[] {
  const candidates = bank.filter((card) => eligible.includes(card.id));
  const sums = new Map<number, string[]>([[0, []]]);
  for (const card of candidates) {
    for (const [sum, ids] of [...sums]) {
      const next = sum + bankValue(card);
      if (!sums.has(next)) sums.set(next, [...ids, card.id]);
    }
  }
  const amount = [...sums.keys()].filter((value) => value >= due).sort((a, b) => a - b)[0];
  return amount === undefined ? candidates.map((card) => card.id) : sums.get(amount)!;
}
