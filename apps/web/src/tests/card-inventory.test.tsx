import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PlayingCard, type CardPresentation } from '@games/ui';
import sourceInventory from '@/stories/generated/card-faces.json';

type Face = {
  key: string;
  game: string;
  family: 'shedding' | 'property';
  kind: string;
  card: CardPresentation & { colors: string[]; effect: string };
};
const inventory = sourceInventory as Face[];
const render = (face: Face, compact = false) =>
  renderToStaticMarkup(
    <PlayingCard
      card={face.card as CardPresentation}
      family={face.family as 'shedding' | 'property'}
      compact={compact}
    />,
  );

describe('Canonical card face coverage', () => {
  it('renders every semantic face and legal property orientation at both frame sizes', () => {
    expect(inventory).toHaveLength(245);
    expect(new Set(inventory.map((face) => face.key)).size).toBe(245);
    expect(
      Object.fromEntries(
        ['uno', 'uno-no-mercy', 'monopoly-deal', 'monopoly-deal-no-mercy'].map((game) => [
          game,
          inventory.filter((face) => face.game === game).length,
        ]),
      ),
    ).toEqual({ uno: 54, 'uno-no-mercy': 68, 'monopoly-deal': 56, 'monopoly-deal-no-mercy': 67 });
    for (const face of inventory)
      for (const compact of [false, true]) {
        const html = render(face, compact);
        expect(html).toContain('role="img"');
        expect(html).toContain(`data-color="${face.card.color}"`);
        expect(html).toContain(face.card.value);
        if (face.family === 'property' && face.kind === 'action')
          expect(html).not.toContain('legacy-action');
        for (const color of face.card.colors)
          expect(html).toContain(`data-property-color="${color}"`);
      }
  });
  it('keeps every Deal action graphically distinct, including ordinary and doubled rent', () => {
    const byEffect = new Map(
      inventory.filter((face) => face.kind === 'action').map((face) => [face.card.effect, face]),
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
      if (face.card.colors.length === 10) expect(html).toContain('Any colour');
      if (face.card.colors.includes('sky')) expect(html).toContain('Light blue');
      if (face.card.colors.includes('blue')) expect(html).toContain('Dark blue');
      if (face.card.colors.includes('rail')) expect(html).toContain('Railroad');
      if (face.card.colors.includes('utility')) expect(html).toContain('Utilities');
    }
  });
});
