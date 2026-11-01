import type { components } from '../../packages/api-client/src/generated/schema';

type Game = components['schemas']['GameView'];
type Card = components['schemas']['CardView'];
type Action = components['schemas']['Action'];
type Pick = <T>(items: T[]) => T;

/** Natural acceptance play uses this actor's hand and public collections only. */
export function seaCatsAction(game: Game, pick: Pick): Action | undefined {
  const options = game.actions || [];
  if (game.game_id === 'boop') {
    // Adults create a natural win instead of repeatedly choosing kittens after
    // graduation. All board positions and both pools are public in this game.
    const graduates = options.filter((o) => o.action.type === 'graduate');
    const adults = options.filter((o) => o.action.type === 'place' && o.action.color === 'cat');
    return { ...pick(graduates.length ? graduates : adults.length ? adults : options).action };
  }
  if (game.game_id !== 'sea-salt-paper') return undefined;
  const ending = options.filter((o) => ['reveal_mermaids', 'stop'].includes(o.action.type));
  if (ending.length) return { ...pick(ending).action };
  const pair = options.filter((o) => o.action.type === 'pair');
  if (pair.length) return { ...pick(pair).action };

  const own = game.players.find((p) => p.id === game.current_player);
  const collection = [...game.hand, ...(own?.bank || [])];
  const kinds = new Map<string, number>();
  const colors = new Map<string, number>();
  for (const card of collection) {
    kinds.set(card.suit || '', (kinds.get(card.suit || '') || 0) + 1);
    colors.set(card.color, (colors.get(card.color) || 0) + 1);
  }
  // This is deliberately a small hand-selection heuristic, not an import of
  // server scoring or a peek at stock/opponent cards.
  const usefulness = (card: Card) => {
    const count = kinds.get(card.suit || '') || 0;
    if (card.suit === 'mermaid') return 3 + Math.max(0, ...colors.values());
    if (card.suit === 'penguin') return 1 + 2 * count;
    if (card.suit === 'sailor') return count ? 5 : 0;
    if (card.suit === 'octopus') return count ? 3 : 0;
    if (card.suit === 'shell') return count ? 2 : 0;
    if (['crab', 'boat', 'fish'].includes(card.suit || '')) return count % 2 ? 2 : 0;
    if (card.suit === 'shark') return (kinds.get('swimmer') || 0) > count ? 2 : 0;
    if (card.suit === 'swimmer') return (kinds.get('shark') || 0) > count ? 2 : 0;
    const multipliers: Record<string, [string, number]> = {
      lighthouse: ['boat', 1],
      shoal: ['fish', 1],
      'penguin-colony': ['penguin', 2],
      captain: ['sailor', 3],
    };
    const multiplier = multipliers[card.suit || ''];
    return multiplier ? (kinds.get(multiplier[0]) || 0) * multiplier[1] : 0;
  };
  if (game.phase === 'draw') {
    const tops = (game.detail?.discard_tops || []) as (Card | null)[];
    const goodDiscards = options.filter(
      (o) =>
        o.action.type === 'take_discard' &&
        tops[Number(o.action.choice)] &&
        usefulness(tops[Number(o.action.choice)]!) >= 2,
    );
    const stock = options.filter((o) => o.action.type === 'take_stock');
    return { ...pick(goodDiscards.length ? goodDiscards : stock.length ? stock : options).action };
  }
  const cardChoices = options.filter((o) => ['keep', 'take_inspected'].includes(o.action.type));
  if (cardChoices.length) {
    const cards = (game.detail?.private_options || []) as Card[];
    const value = (action: Action) => usefulness(cards.find((card) => card.id === action.card)!);
    const best = Math.max(...cardChoices.map((o) => value(o.action)));
    return { ...pick(cardChoices.filter((o) => value(o.action) === best)).action };
  }
  return { ...pick(options).action };
}
