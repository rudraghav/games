import { expect, test } from '@playwright/test';
import inventory from '../../apps/web/src/stories/generated/card-faces.json' with { type: 'json' };

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
              '.shedding-index,.shedding-face strong,.card-action-name,.property-value,.property-name,.property-color-label,.property-active-label,.money-art strong',
            ),
          ].filter((part) => part.textContent?.trim());
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
