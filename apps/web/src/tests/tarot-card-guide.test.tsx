import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  tarotCardGuide,
  tarotCardGuides,
  tarotShortMeaning,
  type TarotCardGuide as GuideEntry,
} from '@games/api-client/card-guide';
import { tarotArtwork } from '@games/ui';
import { TarotCardGuide } from '@/games/tarot/TarotCardGuide';

const generated = JSON.parse(
  readFileSync(resolve('packages/api-client/src/generated/tarot-card-guide.json'), 'utf8'),
) as GuideEntry[];

/** The text a reader sees: tags removed, entities decoded, whitespace collapsed. */
function visibleText(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#x27;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&rsquo;|&#8217;/g, '’')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
function everyString(card: GuideEntry) {
  return [
    card.name,
    card.number_label,
    card.essence,
    card.figure,
    ...card.symbols.flatMap((item) => [item.symbol, item.meaning]),
    ...(['upright', 'reversed'] as const).flatMap((side) => [
      card[side].short,
      ...card[side].keywords,
      card[side].meaning,
      card[side].love,
      card[side].work,
      card[side].self,
      card[side].advice,
    ]),
    ...Object.values(card.correspondences).flatMap((item) => [item.name, item.gloss]),
    ...card.questions,
  ];
}
function tabs(html: string) {
  return [...html.matchAll(/<button[^>]*role="tab"[^>]*>([^<]*)<\/button>/g)].map((match) => ({
    label: match[1],
    selected: /aria-selected="true"/.test(match[0]),
    tabIndex: /tabindex="(-?\d)"/.exec(match[0])?.[1],
    controls: /aria-controls="([^"]+)"/.exec(match[0])?.[1],
  }));
}
function panels(html: string) {
  return [...html.matchAll(/<section[^>]*role="tabpanel"[^>]*>/g)].map((match) => ({
    id: /id="([^"]+)"/.exec(match[0])?.[1],
    hidden: /\shidden=""/.test(match[0]),
  }));
}

describe('Tarot card guide page', () => {
  it('ships one generated entry for each of the 78 illustrated cards', () => {
    expect(tarotCardGuides.map((card) => card.id)).toEqual(Object.keys(tarotArtwork));
    expect(tarotCardGuides).toEqual(generated);
    for (const card of tarotCardGuides) {
      expect(tarotArtwork[card.id].name).toBe(card.name);
      expect(tarotCardGuide(card.id)).toBe(card);
      expect(tarotShortMeaning(card.id)).toBe(card.upright.short);
      expect(tarotShortMeaning(card.id, 'reversed')).toBe(card.reversed.short);
      expect(card.reversed.short).not.toBe(card.upright.short);
    }
    expect(tarotCardGuide('major-22')).toBeUndefined();
    expect(tarotShortMeaning('nothing-01', 'reversed')).toBeUndefined();
  });

  it('shows everything the generated guide says about a card, for every card', () => {
    for (const card of generated) {
      const text = visibleText(renderToStaticMarkup(<TarotCardGuide cardId={card.id} />));
      for (const value of everyString(card)) expect(text).toContain(value);
    }
  });

  it.each(['major-02', 'cups-05', 'major-13', 'swords-10', 'pentacles-13', 'wands-08'])(
    'renders every section of %s in both orientations',
    (cardId) => {
      const card = tarotCardGuide(cardId)!;
      for (const orientation of ['upright', 'reversed'] as const) {
        const html = renderToStaticMarkup(
          <TarotCardGuide cardId={cardId} orientation={orientation} />,
        );
        const text = visibleText(html);
        expect(html).toContain(`data-card="${cardId}"`);
        expect(html).toContain(`data-orientation="${orientation}"`);
        expect(html).toMatch(/<h2 class="tarot-guide-name">[^<]+<\/h2>/);
        expect(text).toContain(card.essence);
        for (const heading of [
          'In love',
          'In work',
          'For yourself',
          'Try this',
          'Who you’re looking at',
          'Symbols in this card',
          'Correspondences',
          'Questions to sit with',
          'Element',
          'Astrology',
          'Number',
        ])
          expect(text).toContain(heading);
        // Each orientation-independent section is labelled by its own heading.
        for (const part of ['figure', 'symbols', 'correspondences', 'questions']) {
          expect(html).toContain(`aria-labelledby="${cardId}-${part}"`);
          expect(html).toContain(`<h3 id="${cardId}-${part}">`);
        }
        expect(html.match(/class="tarot-guide-keywords"/g)).toHaveLength(2);
        expect(html).toContain(`aria-label="Upright keywords"`);
        expect(html).toContain(`aria-label="Reversed keywords"`);
        expect(html.match(/<dt>/g)!.length).toBe(6 + card.symbols.length + 3);
        expect(html).not.toContain('There is no guide entry');
      }
    },
  );

  it('offers both orientations through an accessible switch and opens on the drawn side', () => {
    for (const orientation of ['upright', 'reversed'] as const) {
      const html = renderToStaticMarkup(
        <TarotCardGuide cardId="cups-05" orientation={orientation} />,
      );
      expect(html).toMatch(/role="tablist"[^>]*aria-label="Card orientation"/);
      const [upright, reversed] = tabs(html);
      expect([upright.label, reversed.label]).toEqual(['Upright', 'Reversed']);
      expect(upright.selected).toBe(orientation === 'upright');
      expect(reversed.selected).toBe(orientation === 'reversed');
      // Roving focus: only the selected tab is a Tab stop; arrow keys move between them.
      expect(upright.tabIndex).toBe(orientation === 'upright' ? '0' : '-1');
      expect(reversed.tabIndex).toBe(orientation === 'reversed' ? '0' : '-1');
      const [uprightPanel, reversedPanel] = panels(html);
      expect([uprightPanel.id, reversedPanel.id]).toEqual([upright.controls, reversed.controls]);
      expect(uprightPanel.hidden).toBe(orientation !== 'upright');
      expect(reversedPanel.hidden).toBe(orientation !== 'reversed');
      // Both sides stay in the page, so the other meaning is one press away.
      const text = visibleText(html);
      expect(text).toContain(tarotCardGuide('cups-05')!.upright.meaning);
      expect(text).toContain(tarotCardGuide('cups-05')!.reversed.meaning);
    }
    expect(renderToStaticMarkup(<TarotCardGuide cardId="cups-05" />)).toContain(
      'data-orientation="upright"',
    );
  });

  it('turns only the picture when reversed and keeps the name readable', () => {
    const upright = renderToStaticMarkup(<TarotCardGuide cardId="major-13" />);
    const reversed = renderToStaticMarkup(
      <TarotCardGuide cardId="major-13" orientation="reversed" />,
    );
    expect(upright).toContain('class="tarot-guide-card" data-reversed="false"');
    expect(reversed).toContain('class="tarot-guide-card" data-reversed="true"');
    expect(upright).toContain('aria-label="Death"');
    expect(reversed).toContain('aria-label="Death, shown reversed"');
    expect(visibleText(upright)).toContain('Shown upright');
    expect(visibleText(reversed)).toContain('Shown reversed');
    for (const html of [upright, reversed]) {
      expect(html).toContain('<span class="tarot-name">Death</span>');
      expect(html).toContain(`<image href="${tarotArtwork['major-13'].path}"`);
    }
    const css = readFileSync(resolve('packages/ui/src/styles/tarot-guide.css'), 'utf8');
    expect(css).toMatch(
      /\.tarot-guide-card\[data-reversed='true'\] \.tarot-art \{\s*transform: rotate\(180deg\);/,
    );
    expect(css).not.toMatch(/data-reversed='true'\][^{]*\.tarot-name/);
    expect(readFileSync(resolve('packages/ui/src/styles/theme.css'), 'utf8')).toContain(
      "@import './tarot-guide.css';",
    );
  });

  it('names the family, the drawn position and the image loader it was given', () => {
    const major = renderToStaticMarkup(
      <TarotCardGuide
        cardId="major-02"
        position="Where you are"
        imageLoader={(path) => `/cdn${path}`}
      />,
    );
    expect(visibleText(major)).toContain('Major Arcana · II');
    expect(visibleText(major)).toContain('Drawn as Where you are');
    expect(major).toContain(`<image href="/cdn${tarotArtwork['major-02'].path}"`);
    const minor = renderToStaticMarkup(<TarotCardGuide cardId="cups-05" />);
    expect(visibleText(minor)).toContain('Suit of Cups · Five');
    expect(minor).not.toContain('tarot-guide-position');
  });

  it('says so plainly when a card has no entry', () => {
    const html = renderToStaticMarkup(<TarotCardGuide cardId="major-22" />);
    expect(html).toBe(
      '<p class="tarot-guide-missing" role="status">There is no guide entry for this card yet.</p>',
    );
  });
});
