import type { ActionOption, Card, DealDetails, Match, Room } from '@games/api-client';
import { playerName } from '../types';
import { bankValue, groupName } from './presentation';

/**
 * Plain-language Deal decisions, said from the viewer's seat. Every sentence
 * uses only public cards (banks and property sets) or the viewer's own hand.
 */
export interface DealContext {
  match: Match;
  room: Room;
  details: DealDetails;
  selfId: string;
}

export const optionKey = (option: ActionOption) => JSON.stringify(option.value);

/** Printed card names for engine effect ids. */
export const EFFECT_TITLES: Record<string, string> = {
  sly: 'Sly Deal',
  forced: 'Forced Deal',
  breaker: 'Deal Breaker',
  heist: 'Heist',
  crash: 'Market Crash',
  super_sly: 'Super Sly Deal',
  tough: 'Tough Luck',
  repossession: 'Repossession',
  tax: 'Tax Collector',
  unfair: 'Unfair Trade',
  forced_debt: 'Forced Debt',
  bill: 'bill',
};

const BUILDING_RENT: Record<string, number> = { house: 3, hotel: 4, shack: 5 };

export interface Located {
  card: Card;
  owner: string;
  zone: 'hand' | 'bank' | 'set';
  setKey: string | null;
}

/** Where a card the viewer may see sits: own hand, any bank or any property set. */
export function locate(
  match: Match,
  selfId: string,
  id: string | null | undefined,
): Located | null {
  if (!id) return null;
  const inHand = match.hand.find((card) => card.id === id);
  if (inHand) return { card: inHand, owner: selfId, zone: 'hand', setKey: null };
  for (const player of match.players) {
    const banked = player.bank.find((card) => card.id === id);
    if (banked) return { card: banked, owner: player.id, zone: 'bank', setKey: null };
    for (const [key, cards] of Object.entries(player.properties)) {
      const card = cards.find((item) => item.id === id);
      if (card) return { card, owner: player.id, zone: 'set', setKey: key };
    }
  }
  return null;
}

const isProperty = (card: Card) => card.suit === 'property';
const isMoney = (card: Card) => card.subtitle === 'MONEY';

/** A name that tells two wilds apart: "Wild Green/Dark blue", "Any-colour wild". */
export function cardTitle(card: Card, details: DealDetails) {
  if (isProperty(card) && card.colors.length > 2) return 'Any-colour wild';
  if (isProperty(card) && card.colors.length === 2)
    return `Wild ${card.colors.map((color) => groupName(color, details.propertyGroups)).join('/')}`;
  if (isMoney(card)) return `${card.value} money`;
  return card.label;
}

/** Bank value in words; the any-colour wild has none. */
export const valueText = (card: Card) => (bankValue(card) ? card.value : 'no cash value');

/** "Green set 2" for a pile key such as green:1. */
export function setName(key: string, details: DealDetails) {
  const [color, index] = key.split(':');
  return `${groupName(color, details.propertyGroups)} set${index === undefined ? '' : ` ${Number(index) + 1}`}`;
}

export function progress(ctx: DealContext, owner: string, key: string) {
  const info = ctx.details.collections.find((item) => item.player === owner && item.key === key);
  const reference = ctx.details.propertyGroups.find((group) => group.color === key.split(':')[0]);
  const cards = ctx.match.players.find((player) => player.id === owner)?.properties[key] || [];
  return {
    count: info?.count ?? cards.filter(isProperty).length,
    size: info?.setSize ?? reference?.setSize ?? 0,
    complete: info?.complete ?? false,
    rent: info?.rent ?? 0,
    cards,
  };
}

export function name(ctx: DealContext, id: string) {
  return id === ctx.selfId ? 'you' : playerName(ctx.room, id);
}
export function possessive(ctx: DealContext, id: string) {
  return id === ctx.selfId ? 'your' : `${playerName(ctx.room, id)}’s`;
}
const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/** "your Green set 2 (2/3)" */
export function pileText(ctx: DealContext, owner: string, key: string) {
  const { count, size } = progress(ctx, owner, key);
  return `${possessive(ctx, owner)} ${setName(key, ctx.details)} (${count}/${size})`;
}

/**
 * The exact card in words, including the active colour of a wild and where it
 * sits: "Wild Green/Dark blue · Green active · 4M · from Alexandra’s Green set 2 (2/3)".
 */
export function cardPhrase(
  ctx: DealContext,
  id: string,
  { from = true, title = true, owner = true } = {},
) {
  const place = locate(ctx.match, ctx.selfId, id);
  if (!place) return 'a card';
  const { card } = place;
  const parts = title ? [cardTitle(card, ctx.details)] : [];
  if (isProperty(card) && card.colors.length > 1)
    parts.push(`${groupName(card.color, ctx.details.propertyGroups)} active`);
  if (!isMoney(card)) parts.push(valueText(card));
  if (from && place.zone === 'set' && place.setKey)
    parts.push(
      `${isProperty(card) ? 'from' : 'on'} ${
        owner
          ? pileText(ctx, place.owner, place.setKey)
          : `${setName(place.setKey, ctx.details)} (${progress(ctx, place.owner, place.setKey).count}/${progress(ctx, place.owner, place.setKey).size})`
      }`,
    );
  if (from && place.zone === 'bank') parts.push(`from ${possessive(ctx, place.owner)} bank`);
  return parts.join(' · ');
}

/** The exact card in a sentence: "your Wild Green/Dark blue (Green active, 4M) from your Green set 2 (2/3)". */
export function cardProse(ctx: DealContext, id: string) {
  const place = locate(ctx.match, ctx.selfId, id);
  if (!place) return 'a card';
  const { card, owner } = place;
  if (place.zone === 'bank') return `${possessive(ctx, owner)} ${card.value} bank card`;
  const bits = [];
  if (isProperty(card) && card.colors.length > 1)
    bits.push(`${groupName(card.color, ctx.details.propertyGroups)} active`);
  bits.push(valueText(card));
  const base = `${possessive(ctx, owner)} ${cardTitle(card, ctx.details)} (${bits.join(', ')})`;
  return place.zone === 'set' && place.setKey
    ? `${base} ${isProperty(card) ? 'from' : 'on'} ${owner === ctx.selfId ? 'your' : 'their'} ${setName(place.setKey, ctx.details)} (${progress(ctx, owner, place.setKey).count}/${progress(ctx, owner, place.setKey).size})`
    : base;
}

/** What a set becomes once the listed cards leave it: "2/3 → 1/3, no longer complete". */
export function setImpact(ctx: DealContext, owner: string, key: string, leaving: string[]) {
  const before = progress(ctx, owner, key);
  const gone = before.cards.filter((card) => leaving.includes(card.id) && isProperty(card)).length;
  const after = before.count - gone;
  const lost = before.complete && after < before.size;
  const buildings = before.cards.filter((card) => !isProperty(card)).map((card) => card.label);
  return {
    text: `${setName(key, ctx.details)}: ${before.count}/${before.size} → ${after}/${before.size}${
      lost
        ? ` · breaks a complete set${buildings.length ? ` and its ${buildings.join(' and ')} rent` : ''}`
        : after === 0
          ? ' · set emptied'
          : ''
    }`,
    lost,
  };
}

/** Rent for one of the actor's sets after Double the Rent or a Double Rent card. */
export function rentQuote(ctx: DealContext, card: Card, key: string, owner = ctx.selfId) {
  const base = progress(ctx, owner, key).rent;
  const multiplier = card.effect === 'rent_double' ? 2 : ctx.details.rentMultiplier;
  return { base, multiplier, amount: base * multiplier };
}

const amountText = ({ base, multiplier, amount }: ReturnType<typeof rentQuote>, from: string) =>
  `${amount}M rent ${from}${multiplier > 1 ? ` (${base}M ×${multiplier})` : ''}`;

export interface OptionText {
  /** Short heading of one choice. */
  title: string;
  /** The consequence in words. */
  detail: string;
  /** Property colours for a swatch: the active colour first. */
  colors: string[];
}

/** The public cards each other player loses to a Super Sly Deal in this colour. */
function superSlyVictims(ctx: DealContext, color: string) {
  return ctx.match.players
    .filter((player) => player.id !== ctx.selfId)
    .flatMap((player) =>
      Object.entries(player.properties).flatMap(([key, cards]) =>
        cards
          .filter((card) => isProperty(card) && card.colors.includes(color))
          .map((card) => ({ owner: player.id, key, card })),
      ),
    );
}

/** One legal option in words, said from the viewer's seat. */
export function describeOption(option: ActionOption, ctx: DealContext): OptionText {
  const action = option.value;
  const own = locate(ctx.match, ctx.selfId, action.card);
  const card = own?.card;
  const groups = ctx.details.propertyGroups;
  const who = (id: string) => playerName(ctx.room, id);
  if ((action.type === 'property' || action.type === 'rearrange') && card) {
    const key = action.choice || `${action.color}:0`;
    const color = action.color || key.split(':')[0];
    const existing = ctx.match.players.find((player) => player.id === ctx.selfId)?.properties[key];
    const { count, size } = progress(ctx, ctx.selfId, key);
    const now = existing?.length ? count : 0;
    const next = now + 1;
    const names = (existing || []).filter(isProperty).map((item) => cardTitle(item, ctx.details));
    const parts = [
      existing?.length ? names.join(', ') : 'New pile',
      `${now}/${size} → ${next}/${size}${next >= size ? ' · completes the set' : ''}`,
    ];
    if (card.colors.length > 1)
      parts.push(`${cardTitle(card, ctx.details)} turns ${groupName(color, groups)}`);
    if (action.type === 'rearrange') parts.unshift('Free move, uses no play');
    return {
      title: existing?.length ? setName(key, ctx.details) : `New ${setName(key, ctx.details)}`,
      detail: parts.join(' · '),
      colors: [color],
    };
  }
  if (action.type === 'settle_debt' && card) {
    const debts = ctx.details.debts[ctx.selfId] || [];
    const owed = debts.filter((id) => id === action.target).length;
    return {
      title: `Give ${cardTitle(card, ctx.details)} to ${who(action.target)}`,
      detail: `Settles 1 of your ${owed || 1} debt chip${owed > 1 ? 's' : ''} to ${who(action.target)}. They play or bank it at once.`,
      colors: [],
    };
  }
  if (action.type === 'choose' || action.type === 'keep') {
    const place = locate(ctx.match, ctx.selfId, action.card);
    return {
      title: `${action.type === 'choose' ? 'Take' : 'Keep'} ${place ? cardTitle(place.card, ctx.details) : 'card'}`,
      detail: cardPhrase(ctx, action.card),
      colors: place && isProperty(place.card) ? [place.card.color] : [],
    };
  }
  if (action.type === 'give') {
    const place = locate(ctx.match, ctx.selfId, action.card);
    return {
      title: `Give ${place ? cardTitle(place.card, ctx.details) : 'card'} to ${who(action.target)}`,
      detail: cardPhrase(ctx, action.card),
      colors: place && isProperty(place.card) ? [place.card.color] : [],
    };
  }
  if (action.type !== 'play' || !card) return { title: option.label, detail: '', colors: [] };
  const effect = card.effect;
  if (effect === 'rent' || effect === 'rent_double') {
    const quote = rentQuote(ctx, card, action.color);
    const { count, size } = progress(ctx, ctx.selfId, action.color);
    return {
      title: `${setName(action.color, ctx.details)} (${count}/${size})`,
      detail: amountText(
        quote,
        action.target ? `from ${who(action.target)}` : 'from each other player',
      ),
      colors: [action.color.split(':')[0]],
    };
  }
  if (effect in BUILDING_RENT) {
    const { count, size, rent } = progress(ctx, ctx.selfId, action.color);
    return {
      title: `${setName(action.color, ctx.details)} (${count}/${size})`,
      detail: `Adds a ${card.label}: rent ${rent}M → ${rent + BUILDING_RENT[effect]}M`,
      colors: [action.color.split(':')[0]],
    };
  }
  if (effect === 'sly' || effect === 'forced') {
    const take = locate(ctx.match, ctx.selfId, action.choice);
    const give = action.cards?.[0];
    return {
      title: take ? cardTitle(take.card, ctx.details) : 'property',
      detail: [
        cardPhrase(ctx, action.choice, { title: false, owner: false }),
        give ? `you give ${cardPhrase(ctx, give, { owner: false })}` : '',
      ]
        .filter(Boolean)
        .join(' · '),
      colors: take ? [take.card.color] : [],
    };
  }
  if (effect === 'breaker') {
    const target = action.target;
    const cards =
      ctx.match.players.find((player) => player.id === target)?.properties[action.color] || [];
    const total = cards.reduce((sum, item) => sum + bankValue(item), 0);
    return {
      title: `${who(target)}’s ${setName(action.color, ctx.details)} (complete)`,
      detail: `Take ${cards.map((item) => cardTitle(item, ctx.details)).join(', ')} · ${total}M · +1 complete set for you`,
      colors: [action.color.split(':')[0]],
    };
  }
  if (effect === 'super_sly') {
    const victims = superSlyVictims(ctx, action.color);
    return {
      title: `Every ${groupName(action.color, groups)} property`,
      detail: `Takes ${victims.length} card${victims.length === 1 ? '' : 's'}: ${victims
        .map(
          ({ owner, key, card: item }) =>
            `${who(owner)}’s ${cardTitle(item, ctx.details)}${
              item.colors.length > 1
                ? ` (${groupName(item.color, groups)} active, in ${setName(key, ctx.details)})`
                : ''
            }`,
        )
        .join('; ')}`,
      colors: [action.color],
    };
  }
  const billed: Record<string, string> = {
    debt: 'Pays you 5M',
    yoink: 'Pays you 10M',
    birthday: 'Each other player pays you 2M',
    forced_debt:
      'Gets a debt chip: on their turn they give you a card from their hand before playing',
    unfair: 'Swap your bank with theirs',
    tax: 'Keeps one bank card and hands out the rest',
    repossession: 'Keeps one property and hands out the rest',
    heist: 'Take one bank card from each other player with money',
    crash: 'Take one property from each other player with properties',
    tough: `Take every ${action.choice || ''} card from their hand`,
    pass_go: 'Draw 2 cards',
    fill: 'Draw up to 7 cards',
    go_again: 'Take another turn after this one',
    double: 'Your next Rent this turn charges double',
  };

  return {
    title: action.target ? playerName(ctx.room, action.target) : card.label,
    detail: billed[effect] || card.label,
    colors: [],
  };
}

/** The commit button for one option: says what leaves whose hand or table. */
export function commitLabel(option: ActionOption, ctx: DealContext) {
  const action = option.value;
  const card = locate(ctx.match, ctx.selfId, action.card)?.card;
  const title = card ? cardTitle(card, ctx.details) : 'card';
  switch (action.type) {
    case 'property':
      return 'Place property';
    case 'rearrange':
      return 'Move property';
    case 'discard':
      return `Discard ${title}`;
    case 'bank':
      return `Bank for ${card?.value || ''}`.trim();
    case 'settle_debt':
    case 'give':
      return `Give ${title} to ${playerName(ctx.room, action.target)}`;
    case 'choose':
      return `Take ${title}`;
    case 'keep':
      return `Keep ${title}`;
    default:
      if (card && ['sly', 'forced'].includes(card.effect) && action.choice) {
        const take = locate(ctx.match, ctx.selfId, action.choice);
        if (take) return `Play ${card.label} · take ${cardTitle(take.card, ctx.details)}`;
      }
      if (card && action.target && !action.choice && !action.color)
        return `Play ${card.label} on ${playerName(ctx.room, action.target)}`;
      if (card && ['rent', 'rent_double'].includes(card.effect) && action.color)
        return `Charge ${rentQuote(ctx, card, action.color).amount}M rent`;
      return `Play ${card?.label || 'card'}`;
  }
}

export interface PendingText {
  /** One sentence: who wants to do what to which card. */
  headline: string;
  /** Extra facts: source set, rent source, what the set becomes. */
  facts: string[];
  /** What accepting does, for the responder. */
  accept: string;
  acceptLabel: string;
  /** What Just Say No does, for the responder. */
  no: string;
  /** For seats that are waiting. */
  waiting: string;
}

/**
 * The pending effect from the viewer's seat. The responder sees what accepting
 * and Just Say No each do; the actor and bystanders see who they wait for.
 */
export function describePending(ctx: DealContext): PendingText | null {
  const effect = ctx.details.pendingAction;
  if (!effect) return null;
  const actor = effect.actor;
  const target = effect.target;
  const responder = effect.responder;
  const title = EFFECT_TITLES[effect.kind] || effect.kind.replaceAll('_', ' ');
  const Actor = capital(name(ctx, actor));
  const facts: string[] = [];
  const taken = effect.transfers.filter((transfer) => transfer.source === target);
  const given = effect.transfers.filter((transfer) => transfer.source === actor);
  const takenIds = taken.flatMap((transfer) => transfer.cards);
  const givenIds = given.flatMap((transfer) => transfer.cards);
  const describeIds = (ids: string[]) =>
    ids
      .filter((id) => {
        const place = locate(ctx.match, ctx.selfId, id);
        return place && (place.zone !== 'set' || isProperty(place.card) || ids.length === 1);
      })
      .map((id) => cardProse(ctx, id));
  const setsTouched = (owner: string, ids: string[]) =>
    [
      ...new Set(
        ids
          .map((id) => locate(ctx.match, ctx.selfId, id))
          .filter((place): place is Located => Boolean(place?.setKey))
          .map((place) => place.setKey!),
      ),
    ].map((key) => `${capital(possessive(ctx, owner))} ${setImpact(ctx, owner, key, ids).text}`);
  let object = '';
  let outcome = '';
  switch (effect.kind) {
    case 'sly':
    case 'crash':
    case 'heist':
      object = describeIds(takenIds).join('; ') || 'a card';
      outcome = `${Actor} ${actor === ctx.selfId ? 'take' : 'takes'} it`;
      facts.push(...setsTouched(target, takenIds));
      break;
    case 'forced':
      object = `${describeIds(takenIds).join('; ')}, in exchange for ${describeIds(givenIds).join('; ')}`;
      {
        const titleOf = (ids: string[]) =>
          ids
            .map((id) => locate(ctx.match, ctx.selfId, id)?.card)
            .filter((card): card is Card => Boolean(card && isProperty(card)))
            .map((card) => cardTitle(card, ctx.details))
            .join(', ');
        outcome =
          target === ctx.selfId
            ? `you give ${titleOf(takenIds)} and get ${titleOf(givenIds)}`
            : actor === ctx.selfId
              ? `you get ${titleOf(takenIds)} and give ${titleOf(givenIds)}`
              : 'the two cards swap owners';
      }
      facts.push(...setsTouched(target, takenIds), ...setsTouched(actor, givenIds));
      break;
    case 'breaker':
    case 'super_sly': {
      const total = takenIds
        .map((id) => locate(ctx.match, ctx.selfId, id)?.card)
        .reduce((sum, card) => sum + (card ? bankValue(card) : 0), 0);
      object = `${takenIds.length} card${takenIds.length === 1 ? '' : 's'} (${total}M): ${describeIds(takenIds).join('; ')}`;
      outcome = `${Actor} ${actor === ctx.selfId ? 'take' : 'takes'} ${takenIds.length === 1 ? 'it' : 'them all'}`;
      if (effect.kind === 'breaker' && effect.collection)
        facts.push(`${capital(pileText(ctx, target, effect.collection))} is complete`);
      facts.push(...setsTouched(target, takenIds));
      break;
    }
    case 'unfair':
      object = 'banks';
      outcome = 'the two banks swap';
      break;
    case 'bill':
      object = `${effect.amount ?? 0}M`;
      outcome = `${target === ctx.selfId ? 'you choose' : `${capital(name(ctx, target))} chooses`} ${effect.amount ?? 0}M from bank or properties to pay`;
      if (effect.source_collection)
        facts.push(
          `Rent on ${pileText(ctx, actor, effect.source_collection)}${effect.multiplier > 1 ? ` ×${effect.multiplier}` : ''}`,
        );
      break;
    case 'tough':
      object = `every ${effect.category || ''} card in ${possessive(ctx, target)} hand`;
      outcome = `${Actor} ${actor === ctx.selfId ? 'take' : 'takes'} them`;
      break;
    case 'forced_debt':
      object = 'a debt chip';
      outcome = `${target === ctx.selfId ? 'you owe' : `${capital(name(ctx, target))} owes`} ${name(ctx, actor)} a card from hand at the start of ${target === ctx.selfId ? 'your' : 'their'} turn`;
      break;
    case 'tax':
    case 'repossession':
      object = effect.kind === 'tax' ? 'bank cards' : 'properties';
      outcome = `${target === ctx.selfId ? 'you keep' : `${capital(name(ctx, target))} keeps`} one and ${target === ctx.selfId ? 'hand' : 'hands'} out the rest`;
      break;
    default:
      object = title;
      outcome = 'it goes ahead';
  }
  const verb =
    effect.kind === 'bill'
      ? `${actor === ctx.selfId ? 'charge' : 'charges'} ${name(ctx, target)} ${object}`
      : effect.kind === 'forced'
        ? `${actor === ctx.selfId ? 'want' : 'wants'} to Forced Deal ${object}`
        : effect.kind === 'unfair'
          ? `${actor === ctx.selfId ? 'want' : 'wants'} to swap banks with ${name(ctx, target)}`
          : effect.kind === 'forced_debt'
            ? `${actor === ctx.selfId ? 'want' : 'wants'} to give ${name(ctx, target)} a debt chip`
            : effect.kind === 'tax' || effect.kind === 'repossession'
              ? `${actor === ctx.selfId ? 'play' : 'plays'} ${title} on ${name(ctx, target)}`
              : `${actor === ctx.selfId ? 'want' : 'wants'} to ${title} ${object}`;
  const headline = `${Actor} ${verb}.`;
  if (effect.stage === 'select')
    return {
      headline: `${Actor} ${actor === ctx.selfId ? 'are' : 'is'} choosing ${
        effect.kind === 'heist' ? 'a bank card' : 'a property'
      } to take from ${possessive(ctx, target)} table (${title}).`,
      facts,
      accept: '',
      acceptLabel: '',
      no: '',
      waiting: `Waiting for ${name(ctx, actor)} to choose.`,
    };
  if (effect.stage === 'distribution')
    return {
      headline: `${possessive(ctx, actor) === 'your' ? 'Your' : capital(possessive(ctx, actor))} ${title}: ${outcome}.`,
      facts,
      accept: '',
      acceptLabel: '',
      no: '',
      waiting: `Waiting for ${name(ctx, target)} to choose.`,
    };
  const answerer = capital(name(ctx, responder));
  if (effect.blocked) {
    // The actor (or the target after a counter-counter) decides whether the block stands.
    const blocker = target === responder ? actor : target;
    return {
      headline: `${capital(name(ctx, blocker))} blocked ${possessive(ctx, actor)} ${title} with Just Say No.`,
      facts: [`If restored: ${headline}`, ...facts],
      accept: `${possessive(ctx, actor) === 'your' ? 'Your' : capital(possessive(ctx, actor))} ${title} is cancelled.`,
      acceptLabel: 'Accept the block',
      no: `${capital(possessive(ctx, actor))} ${title} goes ahead unless ${name(ctx, blocker)} ${blocker === ctx.selfId ? 'answer' : 'answers'} with another Just Say No.`,
      waiting: `Waiting for ${name(ctx, responder)} to accept the block or answer with Just Say No.`,
    };
  }
  return {
    headline,
    facts,
    accept: effect.kind === 'bill' ? capital(`${outcome}.`) : `${capital(outcome)}.`,
    acceptLabel:
      effect.kind === 'bill' ? `Accept and pay ${effect.amount ?? 0}M` : `Accept ${title}`,
    no: `${
      (
        {
          bill: 'You pay nothing',
          forced_debt: 'You get no debt chip',
          forced: 'Nothing is swapped',
          unfair: 'The banks stay as they are',
          tough: 'You keep your hand',
          tax: 'You keep your bank',
          repossession: 'You keep your properties',
        } as Record<string, string>
      )[effect.kind] || (takenIds.length > 1 ? 'You keep them' : 'You keep it')
    } unless ${name(ctx, actor)} ${actor === ctx.selfId ? 'answer' : 'answers'} with their own Just Say No.`,
    waiting: `Waiting for ${responder === ctx.selfId ? 'you' : answerer}: accept (${
      outcome.charAt(0).toLowerCase() + outcome.slice(1)
    }) or Just Say No.`,
  };
}
