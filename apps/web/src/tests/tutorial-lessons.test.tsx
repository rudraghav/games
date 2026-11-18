import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { games } from '@games/api-client/catalog';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { GameRulebook } from '@/shared/tutorial/RulesIllustrations';
import { tutorialLessons } from '@/shared/tutorial/lessons';
import { rulebookTopics } from '@/shared/tutorial/rulebook-topics';

describe('illustrated game lessons', () => {
  it('renders every published rule in order, with a goal and three captioned examples per game', () => {
    expect(Object.keys(tutorialLessons).sort()).toEqual(games.map((game) => game.id).sort());
    expect(Object.keys(rulebookTopics).sort()).toEqual(games.map((game) => game.id).sort());
    for (const game of games) {
      const lesson = tutorialLessons[game.id];
      expect(lesson.goal, game.id).toBeTruthy();
      expect(lesson.rules, game.id).toHaveLength(3);
      expect(new Set(lesson.rules.map((rule) => rule.title)).size, game.id).toBe(3);
      const html = renderToStaticMarkup(<GameRulebook game={game} />);
      expect(html, game.id).toContain(renderToStaticMarkup(<>{lesson.goal}</>));
      expect(html.match(/<figcaption>/g), game.id).toHaveLength(3);
      expect(html.match(/<li>[^<]*<\/li>/g), game.id).toEqual(
        game.rules.map((text) => renderToStaticMarkup(<li>{text}</li>)),
      );
      const starts = rulebookTopics[game.id].map(([firstRule]) => firstRule);
      expect(starts[0], game.id).toBe(0);
      expect(starts, game.id).toEqual([...new Set(starts)].sort((a, b) => a - b));
      expect(starts[starts.length - 1], game.id).toBeLessThan(game.rules.length);
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
                (row) => row.length === piece.rows[0].length && /^[.brwgkK]+$/.test(row),
              ),
              game.id,
            ).toBe(true);
          }
        }
      }
    }
  });

  it('puts an explicitly supplied tutorial control before the illustrations and reference', () => {
    const html = renderToStaticMarkup(
      <GameRulebook game={games[0]} tutorialControl={<button>Play tutorial</button>} />,
    );
    expect(html).toContain('<button>Play tutorial</button>');
    expect(html.indexOf('<button>')).toBeLessThan(html.indexOf('<figure'));
    expect(html.indexOf('<figure')).toBeLessThan(html.indexOf('aria-label="Rules reference"'));
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
