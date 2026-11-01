import type { components } from '../../packages/api-client/src/generated/schema';

type Game = components['schemas']['GameView'];
type Option = components['schemas']['LegalAction'];
type Action = components['schemas']['Action'];
type Pick = <T>(values: T[]) => T;
type Reveal = { owner: string; slot: number; card: { value: string } };

/** Only public revealed cards are remembered. A private hand is used by its actor
 * for that decision and is never cached or shared with another player's policy. */
export function modernPlayer() {
  const tableMemory = new Map<string, number>();
  const publicEnds = new Map<string, { low?: number; high?: number }>();
  let lastAction: Action | undefined;
  let lastRevealCount = 0;
  let turnReveals: { owner: string; edge: 'low' | 'high'; value: number }[] = [];
  return (game: Game, pick: Pick): Action | undefined => {
    const options = game.actions || [];
    if (game.game_id === 'flip-7') {
      const risk = (game.detail?.at_risk as Record<string, number>)[game.current_player!];
      const stay = options.filter((o) => o.action.type === 'stay');
      return { ...pick(risk >= 18 && stay.length ? stay : options).action };
    }
    if (game.game_id === 'azul') {
      const colors = ['blue', 'yellow', 'red', 'black', 'white'];
      const wall = (game.detail?.walls as Record<string, (string | null)[][]>)[
        game.current_player!
      ];
      const preferred =
        game.phase === 'placing'
          ? options.filter((o) => o.action.choice === '0')
          : options.filter(
              (o) =>
                o.action.type === 'draft_tiles' &&
                wall[0][colors.indexOf(o.action.color!)] === null,
            );
      const placements = options.filter(
        (o) => o.action.type !== 'place_tiles' || o.action.choice !== 'floor',
      );
      return {
        ...pick(preferred.length ? preferred : placements.length ? placements : options).action,
      };
    }
    if (game.game_id !== 'trio') return undefined;
    const reveals = (game.detail?.revealed || []) as Reveal[];
    if (lastAction?.type === 'continue') turnReveals = [];
    for (const player of game.players) {
      if (!player.count) publicEnds.delete(player.id);
    }
    for (const reveal of reveals) {
      if (reveal.owner === 'table') tableMemory.set(String(reveal.slot), Number(reveal.card.value));
    }
    if (lastAction?.type === 'reveal_hand' && reveals.length === lastRevealCount + 1) {
      const edge = lastAction.choice as 'low' | 'high';
      const ends = publicEnds.get(lastAction.target!) || {};
      delete ends[edge];
      publicEnds.set(lastAction.target!, ends);
      turnReveals.push({
        owner: lastAction.target!,
        edge,
        value: Number(reveals.at(-1)!.card.value),
      });
    }
    if (game.phase === 'review' && game.detail?.failed) {
      for (const reveal of turnReveals) {
        const ends = publicEnds.get(reveal.owner) || {};
        const old = ends[reveal.edge];
        ends[reveal.edge] =
          old === undefined
            ? reveal.value
            : reveal.edge === 'low'
              ? Math.min(old, reveal.value)
              : Math.max(old, reveal.value);
        publicEnds.set(reveal.owner, ends);
      }
    }
    const hand = (game.hand || []).map((card) => Number(card.value));
    const known = (option: Option) => {
      const action = option.action;
      if (action.type === 'reveal_table') return tableMemory.get(action.choice!);
      if (action.type !== 'reveal_hand') return undefined;
      if (action.target === game.current_player)
        return action.choice === 'low' ? hand[0] : hand.at(-1);
      return publicEnds.get(action.target!)?.[action.choice as 'low' | 'high'];
    };
    let goal = reveals.length ? Number(reveals[0].card.value) : undefined;
    if (goal === undefined) {
      const counts = new Map<number, number>();
      // Each table position contributes one card. Private duplicate runs at a
      // hand end are accessible consecutively, so they can complete a known set.
      for (const option of options.filter((o) => o.action.type === 'reveal_table')) {
        const value = known(option);
        if (value !== undefined) counts.set(value, (counts.get(value) || 0) + 1);
      }
      for (const value of new Set([hand[0], hand.at(-1)])) {
        if (value !== undefined)
          counts.set(value, (counts.get(value) || 0) + hand.filter((n) => n === value).length);
      }
      for (const player of game.players.filter((p) => p.id !== game.current_player)) {
        const ends = publicEnds.get(player.id);
        const values = player.count === 1 ? [ends?.low ?? ends?.high] : [ends?.low, ends?.high];
        for (const value of values)
          if (value !== undefined) counts.set(value, (counts.get(value) || 0) + 1);
      }
      const complete = [...counts].filter(([, count]) => count >= 3).map(([value]) => value);
      if (complete.length) goal = complete.includes(7) ? 7 : pick(complete);
    }
    let choices = goal === undefined ? [] : options.filter((o) => known(o) === goal);
    if (!choices.length)
      choices = options.filter((o) => o.action.type === 'reveal_table' && known(o) === undefined);
    if (!choices.length) {
      const unknownEnds = options.filter(
        (o) => o.action.type === 'reveal_hand' && known(o) === undefined,
      );
      const nearer = unknownEnds.filter(
        (o) => o.action.choice === (goal !== undefined && goal >= 7 ? 'high' : 'low'),
      );
      choices = nearer.length ? nearer : unknownEnds;
    }
    if (!choices.length) choices = options;
    const action = { ...pick(choices).action };
    lastAction = action;
    lastRevealCount = reveals.length;
    return action;
  };
}
