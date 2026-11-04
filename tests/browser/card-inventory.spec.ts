import { expect, test } from '@playwright/test';
import inventory from '../../apps/web/src/stories/generated/card-faces.json' with { type: 'json' };

/** Every printed part a player reads on a face. Hidden parts (by size) are skipped. */
const PRINT =
  '.shedding-index,.shedding-colour,.shedding-face strong,.card-action-name,.flip-index,.flip-face strong,.flip-caption,.grid-card-value,.standard-index b,.property-value,.property-name,.property-color-label,.property-active-label,.money-art strong,.deal-card-instruction,.deal-card-meta > span:first-child,.deal-card-foot > span:not(.deal-rent-ladder),.deal-rent-ladder small,.deal-rent-ladder b';
const STORIES: [string, string][] = [
  ['uno', 'uno'],
  ['uno-no-mercy', 'uno-no-mercy'],
  ['deal', 'monopoly-deal'],
  ['deal-no-mercy', 'monopoly-deal-no-mercy'],
  ['flip-7', 'flip-7'],
  ['flip-7-shedding-family', 'flip-7'],
  ['skyjo', 'skyjo'],
  ['trio', 'trio'],
  ['six-nimmt', 'six-nimmt'],
  ['standard-deck', 'standard'],
];

test('yellow card ranks, corners and action labels keep readable contrast in both frames', async ({
  page,
}) => {
  test.skip(
    !process.env.GAMES_CARD_STORY_URL,
    'Requires the explicit local card inventory Storybook.',
  );
  for (const story of ['uno', 'uno-no-mercy']) {
    await page.goto(
      `${process.env.GAMES_CARD_STORY_URL}/iframe.html?id=games-card-inventory--${story}&viewMode=story`,
    );
    await expect(page.locator('.playing-card[data-color="yellow"]').first()).toBeVisible();
    const issues = await page.locator('.playing-card[data-color="yellow"]').evaluateAll((cards) => {
      const luminance = (colour: string) => {
        const rgb = colour
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number)
          .map((value) => value / 255);
        return rgb
          .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
          .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      };
      return cards.flatMap((card) =>
        [
          ...card.querySelectorAll(
            '.shedding-face,.shedding-index,.shedding-colour,.card-action-name',
          ),
        ].flatMap((part) => {
          const style = getComputedStyle(part);
          const background =
            style.backgroundColor === 'rgba(0, 0, 0, 0)'
              ? getComputedStyle(card).backgroundColor
              : style.backgroundColor;
          const [low, high] = [luminance(style.color), luminance(background)].sort((a, b) => a - b);
          const ratio = (high + 0.05) / (low + 0.05);
          return ratio < 4.5
            ? [{ card: card.getAttribute('aria-label'), part: part.className, ratio }]
            : [];
        }),
      );
    });
    expect(issues).toEqual([]);
  }
});

test('number faces print their value with WCAG AA contrast on every card colour', async ({
  page,
}) => {
  test.skip(
    !process.env.GAMES_CARD_STORY_URL,
    'Requires the explicit local card inventory Storybook.',
  );
  for (const story of ['flip-7', 'skyjo', 'trio', 'six-nimmt', 'uno', 'uno-no-mercy']) {
    await page.goto(
      `${process.env.GAMES_CARD_STORY_URL}/iframe.html?id=games-card-inventory--${story}&viewMode=story`,
    );
    await expect(page.locator('[data-face-key]').first()).toBeVisible();
    // Wild cards print on a four-colour gradient, which has no single background to measure.
    const cards = page.locator('[data-face-key] .playing-card:not([data-color="wild"])');
    const issues = await cards.evaluateAll((cards) => {
      const parse = (colour: string) =>
        colour
          .match(/[\d.]+/g)!
          .slice(0, 3)
          .map(Number);
      const luminance = (rgb: number[]) =>
        rgb
          .map((value) => value / 255)
          .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
          .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
      const surface = (element: Element) => {
        for (let node: Element | null = element; node; node = node.parentElement) {
          const background = getComputedStyle(node).backgroundColor;
          if (background !== 'rgba(0, 0, 0, 0)') return parse(background);
        }
        return [255, 255, 255];
      };
      return cards.flatMap((card) =>
        [
          ...card.querySelectorAll(
            '.grid-card-value,.flip-index,.flip-face strong,.flip-caption,.shedding-index,.shedding-colour,.shedding-face strong',
          ),
        ]
          .filter((part) => part.textContent?.trim() && (part as HTMLElement).checkVisibility())
          .flatMap((part) => {
            const style = getComputedStyle(part);
            const size = parseFloat(style.fontSize);
            const large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
            const [low, high] = [luminance(parse(style.color)), luminance(surface(part))].sort(
              (a, b) => a - b,
            );
            const ratio = (high + 0.05) / (low + 0.05);
            return ratio < (large ? 3 : 4.5)
              ? [{ card: card.getAttribute('aria-label'), part: part.className, ratio, size }]
              : [];
          }),
      );
    });
    expect(issues).toEqual([]);
  }
});

test('every canonical card face has readable interiors at every size its game draws', async ({
  page,
}) => {
  test.skip(
    !process.env.GAMES_CARD_STORY_URL,
    'Requires the explicit local card inventory Storybook.',
  );
  test.setTimeout(240000);
  const issues: unknown[] = [];
  for (const [story, game] of STORIES) {
    await page.goto(
      `${process.env.GAMES_CARD_STORY_URL}/iframe.html?id=games-card-inventory--${story}&viewMode=story`,
    );
    await expect(page.locator('[data-face-key]')).toHaveCount(
      inventory.filter((face) => face.game === game).length,
    );
    await page.evaluate(() => document.fonts.ready);
    const report = await page.locator('[data-face-key]').evaluateAll(
      (figures, selector) =>
        figures.flatMap((figure) =>
          [...figure.querySelectorAll('.card-inventory-frame')].flatMap((frameElement) => {
            const card = frameElement.querySelector('.playing-card')!;
            const scaled = frameElement.hasAttribute('data-scaled');
            const frame = card.getBoundingClientRect();
            const parts = [...card.querySelectorAll(selector)].filter(
              (part) => part.textContent?.trim() && (part as HTMLElement).checkVisibility(),
            );
            const ranges = parts.map((part) => {
              const range = document.createRange();
              range.selectNodeContents(part);
              return {
                element: part,
                part: part.className,
                box: range.getBoundingClientRect(),
                size: parseFloat(getComputedStyle(part).fontSize),
              };
            });
            const face = card.querySelector('.shedding-face,.flip-face');
            const faceBounds = face?.getBoundingClientRect();
            const faceClips = faceBounds
              ? [...card.querySelectorAll('.shedding-face strong,.flip-face strong')]
                  .filter((rank) => {
                    const range = document.createRange();
                    range.selectNodeContents(rank);
                    const box = range.getBoundingClientRect();
                    return (
                      box.left < faceBounds.left - 0.5 ||
                      box.right > faceBounds.right + 0.5 ||
                      box.top < faceBounds.top - 0.5 ||
                      box.bottom > faceBounds.bottom + 0.5
                    );
                  })
                  .map(() => 'central counter outside its face')
              : [];
            const clipped = ranges
              .filter(
                ({ box }) =>
                  box.left < frame.left - 1 ||
                  box.top < frame.top - 1 ||
                  box.right > frame.right + 1 ||
                  box.bottom > frame.bottom + 1,
              )
              .map(({ part }) => part);
            const collisions = ranges.flatMap((a, i) =>
              ranges
                .slice(i + 1)
                .filter(
                  (b) =>
                    // A corner index holds its colour letter: nested print is one block.
                    !a.element.contains(b.element) &&
                    !b.element.contains(a.element) &&
                    Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left) > 1 &&
                    Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top) > 1,
                )
                .map((b) => `${a.part} / ${b.part}`),
            );
            // Printed text a player must read stays at 7px or more (8px off the Deal faces).
            const floor = card.classList.contains('playing-card--property') ? 7 : 8;
            const tiny = scaled
              ? []
              : ranges
                  .filter(({ size }) => size < floor)
                  .map(({ part, size }) => `${part} ${size}px`);
            return clipped.length || collisions.length || faceClips.length || tiny.length
              ? [
                  {
                    key: figure.getAttribute('data-face-key'),
                    frame: frameElement.getAttribute('data-frame'),
                    clipped,
                    collisions,
                    faceClips,
                    tiny,
                  },
                ]
              : [];
          }),
        ),
      PRINT,
    );
    issues.push(...report);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  expect(issues).toEqual([]);
});

test('Flip 7 faces stay distinct even when a table passes the Uno family', async ({ page }) => {
  test.skip(
    !process.env.GAMES_CARD_STORY_URL,
    'Requires the explicit local card inventory Storybook.',
  );
  for (const story of ['flip-7', 'flip-7-shedding-family']) {
    await page.goto(
      `${process.env.GAMES_CARD_STORY_URL}/iframe.html?id=games-card-inventory--${story}&viewMode=story`,
    );
    await expect(page.locator('[data-face-key]')).toHaveCount(22);
    await expect(page.locator('[data-face-key] .playing-card--shedding')).toHaveCount(0);
    await expect(page.locator('[data-face-key] .card-action-name')).toHaveCount(0);
    for (const name of ['Freeze', 'Flip Three', 'Second Chance'])
      await expect(
        page.locator(`[data-face-key] .playing-card[aria-label="${name}"] .flip-caption`).first(),
      ).toHaveText(name);
  }
});

test('an emptied discard is drawn as an empty slot, not a hidden card', async ({ page }) => {
  test.skip(
    !process.env.GAMES_CARD_STORY_URL,
    'Requires the explicit local card inventory Storybook.',
  );
  await page.goto(
    `${process.env.GAMES_CARD_STORY_URL}/iframe.html?id=games-card-inventory--piles&viewMode=story`,
  );
  const taken = page.locator('[data-pile="Rummy discard just taken"]');
  await expect(taken.getByRole('img', { name: 'Empty discard pile' })).toBeVisible();
  await expect(taken.locator('.card-back-pattern')).toHaveCount(0);
  const drained = page.locator('[data-pile="Empty draw pile"]');
  await expect(drained.getByRole('img', { name: 'Empty draw pile' })).toBeVisible();
  await expect(
    page.locator('[data-pile="Rummy draw pile"]').getByRole('img', { name: 'Face-down card' }),
  ).toBeVisible();
});
