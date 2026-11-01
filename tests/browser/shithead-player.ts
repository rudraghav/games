import type { components } from '../../packages/api-client/src/generated/schema';
type Game = components['schemas']['GameView'];
type Action = components['schemas']['Action'];
type Pick = <T>(values: T[]) => T;

/** A bounded human acceptance strategy using this actor's view, never hidden slots. */
export function shitheadPlayer() {
  const observed = new Map<string, string[]>();
  const vary = new Set<string>();
  return (game: Game, pick: Pick): Action | undefined => {
    if (game.game_id !== 'shithead') return undefined;
    const options = game.actions || [];
    const rankValue = (id: string) =>
      id[0] === 'T' ? 20 : id[0] === '2' ? 19 : '23456789TJQKA'.indexOf(id[0]) + 2;
    const arrange = options.find((o) => o.action.type === 'arrange');
    if (arrange)
      return {
        ...arrange.action,
        cards: [...game.hand]
          .sort((a, b) => rankValue(b.id) - rankValue(a.id))
          .slice(0, 3)
          .map((c) => c.id),
      };
    const player = game.current_player!;
    const signature = JSON.stringify([
      game.hand.map((c) => c.id[0]).sort(),
      game.community?.map((c) => c.id[0]),
      game.players.map((p) => p.count),
    ]);
    const recent = observed.get(player) || [];
    if (recent.includes(signature)) vary.add(player);
    observed.set(player, [...recent.slice(-63), signature]);
    const plays = options.filter((o) => o.action.type === 'play');
    if (plays.length) {
      if (vary.has(player)) return { ...pick(options).action };
      const best = Math.max(
        ...plays.map((o) => (o.action.cards?.length || 0) * 30 - rankValue(o.action.cards![0])),
      );
      return {
        ...pick(
          plays.filter(
            (o) => (o.action.cards?.length || 0) * 30 - rankValue(o.action.cards![0]) === best,
          ),
        ).action,
      };
    }
    return { ...pick(options).action };
  };
}
