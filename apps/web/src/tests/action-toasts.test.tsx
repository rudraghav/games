import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayingCard, type CardPresentation } from '@games/ui';
import type { Room } from '@games/api-client';
import { notable } from '@/features/room/ActionToasts';
import inventory from '@/stories/generated/card-faces.json';

type Move = Room['activity'][number];
const move = (patch: Partial<Move>): Move => ({
  version: 2,
  actorId: 'ada',
  type: 'play',
  label: 'Played an action',
  targets: [],
  amount: null,
  cards: [],
  destination: null,
  count: null,
  ...patch,
});

describe('Action notifications', () => {
  it('keeps routine moves quiet and surfaces the ones that change what others can do', () => {
    for (const type of ['bank', 'property', 'draw', 'end_turn', 'check', 'call', 'hit', 'drop'])
      expect(notable(move({ type }), 'casino', 'me'), type).toBeNull();
    for (const type of ['no', 'challenge', 'raise', 'all_in', 'steal', 'declare', 'take_row'])
      expect(notable(move({ type }), 'casino', 'me'), type).toEqual({ forYou: false });
    // In Deal every played action is news; a banked or placed card is not.
    expect(notable(move({ type: 'play' }), 'property', 'me')).toEqual({ forYou: false });
    expect(notable(move({ type: 'play' }), 'shedding', 'me')).toBeNull();
    expect(
      notable(move({ type: 'pickup', label: 'Flipped a card and took the pile' }), 'palace', 'me'),
    ).not.toBeNull();
  });
  it('marks a move aimed at the viewer, but never the viewer’s own move', () => {
    expect(notable(move({ targets: ['me', 'bo'] }), 'property', 'me')).toEqual({ forYou: true });
    expect(notable(move({ targets: ['bo'] }), 'shedding', 'me')).toEqual({ forYou: false });
    expect(notable(move({ actorId: 'me', targets: ['me'] }), 'shedding', 'me')).toEqual({
      forYou: false,
    });
  });
});

describe('Deal face colour pairing', () => {
  type Face = {
    game: string;
    kind: string;
    card: CardPresentation & { colors: readonly string[] };
  };
  const faces = (inventory as Face[]).filter((face) => face.game === 'monopoly-deal');
  const render = (card: CardPresentation, compact = false) =>
    renderToStaticMarkup(<PlayingCard card={card} family="property" compact={compact} />);
  it('carries a two-colour blend on wild headers and rent art, and a spectrum for any colour', () => {
    const pairRent = faces.find(
      (face) => face.card.effect === 'rent' && face.card.colors.length === 2,
    )!;
    const anyRent = faces.find(
      (face) => face.card.effect === 'rent' && face.card.colors.length === 10,
    )!;
    const [a, b] = pairRent.card.colors;
    expect(render(pairRent.card)).toContain(`--deal-a:var(--deal-${a});--deal-b:var(--deal-${b})`);
    expect(render(pairRent.card)).toContain('data-rent="pair"');
    expect(render(anyRent.card)).toContain('data-rent="spectrum"');
    expect(render(anyRent.card)).not.toContain('--deal-a');
    const wild = faces.find((face) => face.kind === 'property' && face.card.colors.length === 2)!;
    const other = wild.card.colors.find((color) => color !== wild.card.color)!;
    // The colour a wild is played as always leads the header.
    expect(render(wild.card)).toContain(
      `--deal-a:var(--deal-${wild.card.color});--deal-b:var(--deal-${other})`,
    );
  });
  it('names an ordinary property’s colour in words and marks the full-set rent', () => {
    const property = faces.find(
      (face) => face.kind === 'property' && face.card.colors.length === 1,
    )!;
    const html = render(property.card);
    expect(html).toMatch(/class="property-color-label" data-property-color="[a-z]+">[A-Z]/);
    expect(html.match(/data-full="true"/g)).toHaveLength(1);
  });
  it('tints money by denomination and explains compact actions in a tooltip', () => {
    const money = faces.find((face) => face.kind === 'money' && face.card.value === '5M')!;
    expect(render(money.card)).toContain('data-denomination="5M"');
    const sly = faces.find((face) => face.card.effect === 'sly')!;
    expect(render(sly.card, true)).toContain('data-tip="Sly deal · Take one property');
    expect(render(sly.card)).not.toContain('data-tip');
  });
});
