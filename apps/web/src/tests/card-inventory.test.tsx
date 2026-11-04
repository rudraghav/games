import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { CardPile, PlayingCard, type CardPresentation } from '@games/ui';
import sourceInventory from '@/stories/generated/card-faces.json';

type Family = 'shedding' | 'property' | 'grid' | 'standard' | 'flip';
type Face = {
  key: string;
  game: string;
  family: Family;
  kind: string;
  card: CardPresentation & { colors: string[]; effect: string };
};
const inventory = sourceInventory as Face[];
const render = (face: Face, compact = false, family: Family = face.family) =>
  renderToStaticMarkup(
    <PlayingCard card={face.card as CardPresentation} family={family} compact={compact} />,
  );
const faces = (game: string) => inventory.filter((face) => face.game === game);

describe('Canonical card face coverage', () => {
  it('renders every semantic face and legal property orientation at both frame sizes', () => {
    expect(inventory).toHaveLength(488);
    expect(new Set(inventory.map((face) => face.key)).size).toBe(488);
    expect(
      Object.fromEntries(
        [
          'uno',
          'uno-no-mercy',
          'monopoly-deal',
          'monopoly-deal-no-mercy',
          'flip-7',
          'skyjo',
          'trio',
          'six-nimmt',
          'standard',
        ].map((game) => [game, faces(game).length]),
      ),
    ).toEqual({
      uno: 54,
      'uno-no-mercy': 68,
      'monopoly-deal': 74,
      'monopoly-deal-no-mercy': 85,
      'flip-7': 22,
      skyjo: 15,
      trio: 12,
      'six-nimmt': 104,
      standard: 54,
    });
    for (const face of inventory)
      for (const compact of [false, true]) {
        const html = render(face, compact);
        expect(html).toContain('role="img"');
        expect(html).toContain(`data-color="${face.card.color}"`);
        if (face.family !== 'standard' || face.kind !== 'joker')
          expect(html).toContain(face.card.value);
        if (face.family === 'property' && face.kind === 'action')
          expect(html).not.toContain('legacy-action');
        for (const color of face.card.colors)
          expect(html).toContain(`data-property-color="${color}"`);
      }
  }, 30_000); // 976 full renders; parallel CI load needs more than the 5 s default.
  it('gives every ordinary property a distinct printed identity rather than collapsing its colour', () => {
    for (const game of ['monopoly-deal', 'monopoly-deal-no-mercy']) {
      const properties = inventory.filter(
        (face) => face.game === game && face.kind === 'property' && face.card.colors.length === 1,
      );
      expect(properties).toHaveLength(28);
      expect(new Set(properties.map((face) => face.card.label)).size).toBe(28);
      for (const face of properties) {
        const html = render(face);
        expect(html).toContain(face.card.label.replaceAll('&', '&amp;'));
        expect(html).not.toContain('gem-district-art');
        expect(html).toContain('deal-rent-ladder');
      }
    }
  });
  it('keeps every Deal action graphically distinct, including ordinary and doubled rent', () => {
    const byEffect = new Map(
      inventory
        .filter((face) => face.family === 'property' && face.kind === 'action')
        .map((face) => [face.card.effect, face]),
    );
    expect(byEffect.size).toBe(24);
    const signatures = [...byEffect.values()].map((face) => {
      const html = render(face);
      return (
        [...html.matchAll(/<path[^>]* d="([^"]+)"/g)].map((match) => match[1]).join('|') +
        (html.includes('×2') ? 'double' : '')
      );
    });
    expect(new Set(signatures).size).toBe(24);
  });
  it('names both printed colors and the chosen orientation without conflating blue, sky, rail or utility', () => {
    for (const face of inventory.filter(
      (face) => face.kind === 'property' && face.card.colors.length > 1,
    )) {
      const html = render(face);
      expect(html).toContain(' active');
      expect(html).toContain(`data-property-color="${face.card.color}" data-active="true"`);
      if (face.card.colors.length === 10) {
        expect(html).toContain('Any colour');
        expect(html).toContain('No cash value');
      }
      if (face.card.colors.includes('sky')) expect(html).toContain('Light blue');
      if (face.card.colors.includes('blue')) expect(html).toContain('Dark blue');
      if (face.card.colors.includes('rail')) expect(html).toContain('Railroad');
      if (face.card.colors.includes('utility')) expect(html).toContain('Utilities');
    }
  });
  it('frames Rent as an action with its colours, never with a wild property band', () => {
    for (const face of inventory.filter((face) => face.card.effect?.startsWith('rent'))) {
      const html = render(face);
      expect(html).toContain('deal-rent-band');
      expect(html).toContain('>RENT<');
      expect(html).not.toContain('data-wild="true"');
    }
    for (const face of inventory.filter(
      (face) => face.kind === 'property' && face.card.colors.length > 1,
    ))
      expect(render(face)).toContain('data-wild="true"');
  });
});

describe('Printed faces that identify the card without colour or tiny print', () => {
  it('gives each Flip 7 card its own face, never an Uno caption or draw-two mark', () => {
    const flip = faces('flip-7');
    expect(flip.map((face) => face.card.value).sort()).toEqual(
      [
        ...Array.from({ length: 13 }, (_, n) => String(n)),
        '+10',
        '+2',
        '+4',
        '+6',
        '+8',
        'Flip Three',
        'Freeze',
        'Second Chance',
        '×2',
      ].sort(),
    );
    for (const face of flip)
      // FlipSevenTable used to pass the Uno family: the printed ✦ suit still selects the Flip face.
      for (const family of ['flip', 'shedding'] as const) {
        const html = render(face, true, family);
        expect(html).toContain('playing-card--flip');
        expect(html).not.toContain('shedding-draw-mark');
        expect(html).not.toContain('card-action-name');
        expect(html).not.toMatch(/>yellow</i);
      }
    const signature = (value: string) => {
      const html = render(
        flip.find((face) => face.card.value === value)!,
        true,
      );
      return html.match(/<span class="flip-face"[\s\S]*?<\/span>/)![0];
    };
    expect(new Set(['Freeze', 'Flip Three', 'Second Chance'].map(signature)).size).toBe(3);
    expect(render(flip.find((face) => face.card.value === 'Freeze')!)).toContain('>Freeze<');
    expect(render(flip.find((face) => face.card.value === '+4')!)).toContain('>points<');
    expect(render(flip.find((face) => face.card.value === '×2')!)).toContain('>double<');
  });
  it('spells out every Uno colour so red and green never differ by hue alone', () => {
    for (const face of [...faces('uno'), ...faces('uno-no-mercy')]) {
      const html = render(face);
      if (face.card.color === 'wild') expect(html).not.toContain('shedding-colour');
      else
        expect(html).toContain(
          `<span class="shedding-colour" aria-hidden="true">${face.card.color[0].toUpperCase()}</span>`,
        );
    }
    const face = (kind: string) =>
      render(faces('uno-no-mercy').find((face) => face.kind === kind)!).match(
        /<span class="shedding-face"[\s\S]*?<\/span>/,
      )![0];
    // Skip, Skip everyone and Reverse each draw a different pictogram.
    expect(new Set(['skip', 'skip_all', 'reverse'].map(face)).size).toBe(3);
    expect(render(faces('uno').find((face) => face.kind === 'draw2')!)).toContain('Draw 2');
  });
  it('gives grid games their own palettes and dark numerals on light faces', () => {
    const band = (value: number) =>
      render(faces('skyjo').find((face) => face.card.value === String(value))!).match(
        /data-grid-band="([a-z]+)"/,
      )![1];
    expect([-2, -1, 0, 1, 5, 9].map(band)).toEqual([
      'negative',
      'negative',
      'zero',
      'low',
      'middle',
      'high',
    ]);
    expect(
      new Set(faces('trio').map((face) => render(face).match(/data-grid-number="(\d+)"/)![1])),
    ).toHaveProperty('size', 12);
    const hundred = render(faces('six-nimmt').find((face) => face.card.value === '100')!);
    expect(hundred).toContain('data-grid-game="six-nimmt"');
    expect(hundred).toContain('data-chars="3"');
  });
  it('draws the standard deck from compact derivatives with a large index and real jokers', () => {
    for (const face of faces('standard')) {
      const html = render(face, true);
      expect(html).toMatch(/href="\/playing-cards\/web\/[a-z0-9_]+\.webp"/);
      expect(html).toContain('standard-index');
      if (face.kind === 'joker') {
        expect(html).toContain('_joker.webp');
        expect(html).toContain('>Joker<');
      } else expect(html).toContain(`<b>${face.card.value}</b>`);
    }
    const jokers = faces('standard')
      .filter((face) => face.kind === 'joker')
      .map((face) => render(face));
    expect(new Set(jokers.map((html) => html.match(/(red|black)_joker/)![1])).size).toBe(2);
  });
  it('draws an emptied pile as an empty slot, never as a hidden card back', () => {
    const empty = renderToStaticMarkup(<CardPile label="Discard" />);
    expect(empty).toContain('aria-label="Empty discard pile"');
    expect(empty).not.toContain('card-back-pattern');
    const drained = renderToStaticMarkup(<CardPile label="Draw pile" count={0} />);
    expect(drained).toContain('aria-label="Empty draw pile"');
    const stock = renderToStaticMarkup(<CardPile label="Draw pile" count={31} />);
    expect(stock).toContain('card-back-pattern');
    expect(stock).toContain('aria-label="Face-down card"');
  });
});
