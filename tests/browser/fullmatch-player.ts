import type { components } from '../../packages/api-client/src/generated/schema';
import { modernPlayer } from './modern-player';
import { coopNumberAction } from './coop-number-player';
import { seaCatsAction } from './sea-cats-player';
import { shitheadPlayer } from './shithead-player';

type Game = components['schemas']['GameView'];
type Option = components['schemas']['LegalAction'];
type Action = components['schemas']['Action'];

/** Decisions use only this actor's authorized projection, never engine state. */
export function matchPlayer(seed = 73) {
  const modern = modernPlayer();
  const palace = shitheadPlayer();
  let value = seed;
  const pick = <T>(values: T[]) => {
    value = (Math.imul(value, 1664525) + 1013904223) >>> 0;
    return values[value % values.length];
  };
  return (game: Game): Action => {
    const options = game.actions || [];
    if (!options.length) throw new Error('The current player has no legal decisions.');
    const expansionAction =
      coopNumberAction(game, pick) || seaCatsAction(game, pick) || palace(game, pick);
    if (expansionAction) return expansionAction;
    const modernAction = modern(game, pick);
    if (modernAction) return modernAction;
    const ofType = (...types: string[]) => options.filter((o) => types.includes(o.action.type));
    if (game.game_id === 'secret-santa') {
      // The shortest complete event: enough names, one draw, then finish.
      const [next] = ofType('finish').length
        ? ofType('finish')
        : ofType('draw').length
          ? ofType('draw')
          : ofType('add_name');
      const people = Array.isArray(game.detail?.people) ? game.detail.people.length : 0;
      return {
        ...next.action,
        ...(next.input === 'text' ? { choice: `Guest ${people + 1}` } : {}),
      };
    }
    const parlour = parlourAction(game, ofType, pick);
    if (parlour) return parlour;
    let choices: Option[];
    if (game.game_id.startsWith('uno')) {
      choices = ofType('uno');
      if (!choices.length) choices = ofType('play');
    } else if (game.game_id.startsWith('deal') || game.game_id.startsWith('monopoly')) {
      choices = ofType('property');
      if (!choices.length)
        choices = options.filter((o) => !['rearrange', 'end_turn'].includes(o.action.type));
    } else if (game.game_id === 'blackjack') {
      choices = ofType('stand', 'decline');
    } else if (['holdem', 'teen-patti'].includes(game.game_id)) {
      choices = ofType('show', 'check', 'call');
    } else if (game.game_id === 'rummy') {
      // This browser scenario ends legally by dropping; declaration is engine-tested.
      choices = ofType('fold');
    } else if (game.game_id === 'skyjo') {
      // Reveal the grid promptly; no hidden card identities influence decisions.
      choices = ofType('draw_stock', 'discard', 'reveal', 'next_round');
    } else if (game.game_id === 'gem-market') {
      choices = gemChoices(game, options);
    } else {
      choices = options;
    }
    const option = pick(choices.length ? choices : options);
    const action = { ...option.action };
    if (option.input === 'amount') action.amount = option.minimum ?? 0;
    if (option.input === 'cards') action.cards = option.eligible_cards || [];
    if (option.input === 'text') action.choice = 'galactic';
    return action;
  };
}

function gemChoices(game: Game, options: Option[]): Option[] {
  const buys = options.filter((o) => o.action.type === 'buy');
  const information = game.detail?.card_info as
    Record<string, { cost: Record<string, number>; points: number }> | undefined;
  if (!information) return buys.length ? buys : options;
  if (buys.length) {
    const best = Math.max(...buys.map((o) => information[o.action.card || '']?.points ?? 0));
    return buys.filter((o) => (information[o.action.card || '']?.points ?? 0) === best);
  }
  const actor = game.current_player!;
  const tokens = (game.detail?.tokens as Record<string, Record<string, number>>)[actor];
  const bonuses = (game.detail?.bonuses as Record<string, Record<string, number>>)[actor];
  const candidates = [...(game.community || []), ...(game.hand || [])].filter(
    (card) => information[card.id],
  );
  const need = (id: string) =>
    Object.entries(information[id].cost).reduce(
      (sum, [color, amount]) =>
        sum + Math.max(0, amount - (bonuses[color] || 0) - (tokens[color] || 0)),
      0,
    );
  candidates.sort((a, b) => need(a.id) - need(b.id));
  const target = candidates[0];
  if (!target) return options;
  const deficits = Object.fromEntries(
    Object.entries(information[target.id].cost).map(([color, amount]) => [
      color,
      Math.max(0, amount - (bonuses[color] || 0) - (tokens[color] || 0)),
    ]),
  );
  const forced = options.filter((o) => ['return', 'patron'].includes(o.action.type));
  if (forced.length) {
    const unneeded = forced.filter(
      (o) => o.action.type !== 'return' || !deficits[o.action.choice!],
    );
    return unneeded.length ? unneeded : forced;
  }
  const takes = options.filter((o) => ['take', 'take_pair'].includes(o.action.type));
  if (!takes.length) return options;
  const usefulness = (option: Option) =>
    option.action.type === 'take_pair'
      ? Math.min(2, deficits[option.action.choice!] || 0)
      : option.action.choice!.split(',').reduce((sum, color) => sum + (deficits[color] ? 1 : 0), 0);
  const best = Math.max(...takes.map(usefulness));
  return takes.filter((o) => usefulness(o) === best);
}

/**
 * Housie, Liar's Dice, Bluff and Truth or Dare: short, terminating choices from
 * the actor's own projection only (their ticket, their dice, their hand).
 */
function parlourAction(
  game: Game,
  ofType: (...types: string[]) => Option[],
  pick: <T>(values: T[]) => T,
): Action | null {
  const detail = (game.detail || {}) as Record<string, unknown>;
  if (game.game_id === 'housie') {
    // Claim first (smallest prize first, so Full house ends it last), then mark, then call.
    const order = ['early_five', 'top_line', 'middle_line', 'bottom_line', 'full_house'];
    const claims = ofType('claim').sort(
      (a, b) => order.indexOf(a.action.choice || '') - order.indexOf(b.action.choice || ''),
    );
    const [next] = claims.length
      ? claims
      : ofType('mark').length
        ? ofType('mark')
        : ofType('call_number');
    return next ? { ...next.action } : null;
  }
  if (game.game_id === 'liars-dice') {
    const [roll] = ofType('next_round');
    if (roll) return { ...roll.action };
    const bid = detail.bid as { quantity: number; face: number } | null;
    const total = Number(detail.total_dice) || 0;
    const bids = ofType('bid');
    const [call] = ofType('call_liar');
    if (call && (!bids.length || (bid && bid.quantity * 3 >= total))) return { ...call.action };
    const dice = (detail.dice as number[]) || [];
    const held = (option: Option) =>
      dice.filter((die) => String(die) === option.action.choice).length;
    const best = Math.max(...bids.map(held));
    const option = pick(bids.filter((item) => held(item) === best));
    return { ...option.action, amount: option.minimum ?? 1 };
  }
  if (game.game_id === 'bluff') {
    const [next] = ofType('continue');
    if (next) return { ...next.action };
    const hand = game.hand || [];
    const plays = ofType('play');
    const [skip] = ofType('skip');
    const [call] = ofType('call_bluff');
    // An occasional call exercises the reveal; passing sets the pile aside, so the match always ends.
    if (call && pick([0, 1, 2, 3, 4, 5]) === 0) return { ...call.action };
    if (plays.length > 1) {
      // Starting a round: declare the rank held most, and play up to four of it.
      const count = (rank: string) => hand.filter((card) => card.value === rank).length;
      const option = plays.reduce((a, b) =>
        count(b.action.choice || '') > count(a.action.choice || '') ? b : a,
      );
      const cards = hand
        .filter((card) => card.value === option.action.choice)
        .slice(0, option.maximum ?? 4);
      return {
        ...option.action,
        cards: (cards.length ? cards : hand.slice(0, 1)).map((card) => card.id),
      };
    }
    const [play] = plays;
    const honest = hand.filter((card) => card.value === detail.rank).slice(0, play?.maximum ?? 4);
    if (play && honest.length) return { ...play.action, cards: honest.map((card) => card.id) };
    return {
      ...(skip || play || call).action,
      ...(skip ? {} : { cards: hand.slice(0, 1).map((card) => card.id) }),
    };
  }
  if (game.game_id === 'truth-or-dare') {
    const [done] = ofType('done', 'next');
    if (done) return { ...done.action };
    const options = ofType('pick', 'assign');
    return options.length ? { ...pick(options).action } : null;
  }
  return null;
}
