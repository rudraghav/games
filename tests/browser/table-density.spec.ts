import { expect, test } from '@playwright/test';
import catalogue from '../../packages/api-client/src/generated/catalog.json' with { type: 'json' };

/** Synthetic projections exercise every rendered family; no hidden state or room is fetched. */
test('all table projections keep readable card content, touch controls and reachable decisions', async ({
  page,
}) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Synthetic gallery is local-only.');
  test.setTimeout(180000);
  await page.goto('/design');
  const scenario = page.getByLabel('Table scenario');
  const labels = await scenario.locator('option').allTextContents();
  expect(labels).toHaveLength(catalogue.length * 2);
  const issues: { scenario: string; report: unknown }[] = [];
  for (let index = 0; index < labels.length; index++) {
    await scenario.selectOption(String(index));
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))),
    );
    const report = await page.evaluate(() => {
      const root = document.querySelector('.table-layout,.tarot-table')!;
      const top = root.getBoundingClientRect().top;
      const visible = (node: Element) => (node as HTMLElement).checkVisibility();
      const clipping = [...root.querySelectorAll('.playing-card')].flatMap((card) => {
        if (!visible(card)) return [];
        const frame = card.getBoundingClientRect();
        return [
          ...card.querySelectorAll(
            '.property-name,.property-value,.card-action-name,.card-center,.grid-card-value,.development-cost,.development-card > strong',
          ),
        ]
          .filter(visible)
          .filter((part) => {
            // Text nodes can sit inside a full-card positioning box. Check painted
            // text bounds, not that intentionally translated empty wrapper.
            const range = document.createRange();
            range.selectNodeContents(part);
            const box = range.getBoundingClientRect();
            return (
              box.left < frame.left - 2 ||
              box.top < frame.top - 2 ||
              box.right > frame.right + 2 ||
              box.bottom > frame.bottom + 2
            );
          })
          .map((part) => `${card.getAttribute('aria-label')}: ${part.className}`);
      });
      const controls = [
        ...root.querySelectorAll(
          'button:not(:disabled),select:not(:disabled),input:not(:disabled)',
        ),
      ]
        .filter(visible)
        .filter((control) => {
          const bounds = control.getBoundingClientRect();
          return bounds.width < 43.5 || bounds.height < 43.5;
        })
        .map((control) => control.getAttribute('aria-label') || control.textContent?.trim());
      const gridOverlap = [...root.querySelectorAll('.skyjo-grid')].flatMap((grid) => {
        const cards = [...grid.querySelectorAll('.playing-card')];
        return cards.flatMap((a, index) =>
          cards
            .slice(index + 1)
            .filter((b) => {
              const x = a.getBoundingClientRect(),
                y = b.getBoundingClientRect();
              return (
                Math.min(x.right, y.right) - Math.max(x.left, y.left) > 1 &&
                Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 1
              );
            })
            .map(() => a.getAttribute('aria-label')),
        );
      });
      const choices = root.querySelector(
        '.casino-controls,.card-game-layout > .private-hand,.tarot-pick-area',
      );
      return {
        casino: root.classList.contains('casino-layout'),
        viewportWidth: innerWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        boardClipped:
          innerWidth >= 390 &&
          [...root.querySelectorAll('.board-scroll')].some(
            (board) => board.scrollWidth > board.clientWidth + 1,
          ),
        clipping,
        gridOverlap,
        controls,
        actionOffset: choices ? choices.getBoundingClientRect().top - top : null,
      };
    });
    if (
      report.overflow ||
      report.boardClipped ||
      report.clipping.length ||
      report.gridOverlap.length ||
      report.controls.length ||
      // Casino's full-size public table precedes its private dock on desktop;
      // compact layouts keep decisions between the felt and opponent seat grid.
      (report.actionOffset != null &&
        report.actionOffset >= (report.casino && report.viewportWidth > 900 ? 650 : 330))
    )
      issues.push({ scenario: labels[index], report });
  }
  expect(issues).toEqual([]);
});

test('casino seats adapt to the available room width without colliding', async ({ page }) => {
  test.skip(Boolean(process.env.GAMES_TEST_URL), 'Synthetic gallery is local-only.');
  await page.goto('/design');
  await page.getByLabel('Table scenario').selectOption({ label: 'Texas Hold’em · maximum seats' });
  for (const width of [1120, 740]) {
    await page.locator('.casino-layout').evaluate((table, size) => {
      (table as HTMLElement).style.width = `${size}px`;
      (table as HTMLElement).style.maxWidth = '100%';
    }, width);
    const collisions = await page.locator('.casino-seat').evaluateAll((seats) =>
      seats.flatMap((a, index) =>
        seats
          .slice(index + 1)
          .filter((b) => {
            const x = a.getBoundingClientRect(),
              y = b.getBoundingClientRect();
            return (
              Math.min(x.right, y.right) - Math.max(x.left, y.left) > 2 &&
              Math.min(x.bottom, y.bottom) - Math.max(x.top, y.top) > 2
            );
          })
          .map(() => index),
      ),
    );
    expect(collisions, `seat collisions at ${width}px`).toEqual([]);
  }
});
