import { expect, test } from '@playwright/test';
import inventory from '../../apps/web/src/stories/generated/card-faces.json' with { type: 'json' };

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
        [...card.querySelectorAll('.shedding-face,.shedding-index,.card-action-name')].flatMap(
          (part) => {
            const style = getComputedStyle(part);
            const background =
              style.backgroundColor === 'rgba(0, 0, 0, 0)'
                ? getComputedStyle(card).backgroundColor
                : style.backgroundColor;
            const [low, high] = [luminance(style.color), luminance(background)].sort(
              (a, b) => a - b,
            );
            const ratio = (high + 0.05) / (low + 0.05);
            return ratio < 4.5
              ? [{ card: card.getAttribute('aria-label'), part: part.className, ratio }]
              : [];
          },
        ),
      );
    });
    expect(issues).toEqual([]);
  }
});

test('every canonical card face has readable normal and compact interiors', async ({ page }) => {
  test.skip(
    !process.env.GAMES_CARD_STORY_URL,
    'Requires the explicit local card inventory Storybook.',
  );
  test.setTimeout(120000);
  const issues: unknown[] = [];
  for (const [story, game] of [
    ['uno', 'uno'],
    ['uno-no-mercy', 'uno-no-mercy'],
    ['deal', 'monopoly-deal'],
    ['deal-no-mercy', 'monopoly-deal-no-mercy'],
  ]) {
    await page.goto(
      `${process.env.GAMES_CARD_STORY_URL}/iframe.html?id=games-card-inventory--${story}&viewMode=story`,
    );
    await expect(page.locator('[data-face-key]')).toHaveCount(
      inventory.filter((face) => face.game === game).length,
    );
    await page.evaluate(() => document.fonts.ready);
    const report = await page.locator('[data-face-key]').evaluateAll((figures) =>
      figures.flatMap((figure) =>
        [...figure.querySelectorAll('.playing-card')].flatMap((card) => {
          const frame = card.getBoundingClientRect();
          const parts = [
            ...card.querySelectorAll(
              '.shedding-index,.shedding-face strong,.card-action-name,.property-value,.property-name,.property-color-label,.property-active-label,.money-art strong,.deal-card-instruction,.deal-card-meta > span:first-child,.deal-card-foot > span:not(.deal-rent-ladder),.deal-rent-ladder small,.deal-rent-ladder b',
            ),
          ].filter((part) => part.textContent?.trim() && (part as HTMLElement).checkVisibility());
          const ranges = parts.map((part) => {
            const range = document.createRange();
            range.selectNodeContents(part);
            return { part: part.className, box: range.getBoundingClientRect() };
          });
          const face = card.querySelector('.shedding-face');
          const faceBounds = face?.getBoundingClientRect();
          const faceClips = faceBounds
            ? [...card.querySelectorAll('.shedding-face strong')]
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
                  Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left) > 1 &&
                  Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top) > 1,
              )
              .map((b) => `${a.part} / ${b.part}`),
          );
          return clipped.length || collisions.length || faceClips.length
            ? [
                {
                  key: figure.getAttribute('data-face-key'),
                  compact: card.classList.contains('playing-card--compact'),
                  clipped,
                  collisions,
                  faceClips,
                },
              ]
            : [];
        }),
      ),
    );
    issues.push(...report);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  expect(issues).toEqual([]);
});
