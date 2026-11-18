import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { games } from '@games/api-client/catalog';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { IllustratedRules } from '@/shared/tutorial/RulesIllustrations';
import { tutorialLessons } from '@/shared/tutorial/lessons';

describe('illustrated game lessons', () => {
  it('provides three accessible, noninteractive examples and a goal for each registered game', () => {
    expect(Object.keys(tutorialLessons).sort()).toEqual(games.map((game) => game.id).sort());
    for (const game of games) {
      const lesson = tutorialLessons[game.id];
      expect(lesson.goal, game.id).toBeTruthy();
      expect(lesson.rules, game.id).toHaveLength(3);
      expect(new Set(lesson.rules.map((rule) => rule.title)).size, game.id).toBe(3);
      const html = renderToStaticMarkup(<IllustratedRules gameId={game.id} />);
      expect(
        html.match(/class="lesson-picture" role="img" aria-label="[^"]+"/g),
        game.id,
      ).toHaveLength(3);
      expect(html, game.id).not.toMatch(/<(button|input|a)\b/);
      for (const rule of lesson.rules) {
        expect(rule.text, game.id).toBeTruthy();
        expect(rule.visual.pieces.length, game.id).toBeGreaterThan(0);
        for (const piece of rule.visual.pieces) {
          if (piece.kind === 'board') {
            expect(
              piece.rows.every(
                (row) => row.length === piece.rows[0].length && /^[.brwg]+$/.test(row),
              ),
              game.id,
            ).toBe(true);
          }
        }
      }
    }
  });

  it('explains every move present in the legal mid-game samples, including edition-specific reactions', () => {
    for (const sample of midgameScenarios) {
      for (const option of sample.room.game?.actions || []) {
        expect(
          tutorialLessons[sample.game].actions[option.action.type],
          sample.game + '/' + option.action.type,
        ).toBeTruthy();
      }
    }
    expect(tutorialLessons['deal-no-mercy'].actions.settle_debt).toContain('debt chip');
    expect(tutorialLessons['uno-no-mercy'].actions.draw).toContain('25');
    expect(tutorialLessons.shithead.actions.flip).toContain('blind');
    expect(tutorialLessons['sea-salt-paper'].actions.reveal_mermaids).toContain('four mermaids');
  });
});
