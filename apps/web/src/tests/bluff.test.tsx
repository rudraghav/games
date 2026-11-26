import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { bluffDetails, bluffRanks } from '@games/api-client';
import { fixtures } from '@/stories/generated/rooms';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { BluffTable } from '@/games/bluff/BluffTable';
import {
  decisions,
  playAction,
  playLimit,
  playLine,
  suggestedRank,
  toggleCard,
} from '@/games/bluff/bluff-view';
import type { TableProps } from '@/games/types';

function fromRoom(wire: Parameters<typeof mapRoom>[0], selfId: string): TableProps {
  const room = mapRoom(wire);
  return { room, match: room.game!, selfId, pending: false, onAction: () => undefined };
}
const opening = () => {
  const fixture = fixtures.find((f) => f.label === 'Bluff · minimum seats')!;
  return fromRoom(fixture.room, fixture.selfId);
};
const scenario = (id: string) => {
  const found = midgameScenarios.find((s) => s.id === id)!;
  return fromRoom(found.room, found.selfId);
};
const sample = {
  rank: 'Q',
  pile_count: 6,
  discarded_count: 4,
  plays: [
    { player: 'a', count: 2 },
    { player: 'b', count: 4 },
  ],
  last_play: { player: 'b', count: 4 },
  passed: ['c'],
  going_out: 'b',
  reveal: {
    caller: 'c',
    player: 'b',
    rank: 'Q',
    count: 4,
    truthful: false,
    taker: 'b',
    pile_count: 6,
    starter: 'c',
  },
};

describe('Bluff detail parser', () => {
  it('accepts the README contract and every generated projection', () => {
    expect(bluffDetails(sample)).toMatchObject({ rank: 'Q', pileCount: 6, goingOut: 'b' });
    expect(bluffDetails({ ...sample, rank: null, reveal: null, last_play: null })).toMatchObject({
      rank: null,
      reveal: null,
    });
    for (const fixture of fixtures.filter((f) => f.room.game_id === 'bluff'))
      expect(() => bluffDetails(fixture.room.game!.detail)).not.toThrow();
    for (const s of midgameScenarios.filter((s) => s.game === 'bluff'))
      expect(() => bluffDetails(s.room.game!.detail)).not.toThrow();
    expect(bluffRanks).toHaveLength(13);
  });

  it('refuses extra keys, faces in the pile and impossible counts', () => {
    expect(() => bluffDetails({ ...sample, pile: ['QS:0'] })).toThrow();
    expect(() =>
      bluffDetails({ ...sample, plays: [{ player: 'a', count: 2, cards: ['QS:0'] }] }),
    ).toThrow();
    expect(() =>
      bluffDetails({ ...sample, reveal: { ...sample.reveal, cards: ['QS:0'] } }),
    ).toThrow();
    expect(() => bluffDetails({ ...sample, last_play: { player: 'b', count: 5 } })).toThrow();
    expect(() => bluffDetails({ ...sample, rank: 'T' })).toThrow();
  });
});

describe('Bluff choices', () => {
  it('limits a selection to the offered maximum and says so when it is reached', () => {
    const { match } = opening();
    expect(playLimit(match.actions)).toBe(4);
    let state = { cards: [] as string[], full: false };
    for (const card of match.hand.slice(0, 4)) state = toggleCard(state.cards, card.id, 4);
    expect(state).toEqual({ cards: match.hand.slice(0, 4).map((c) => c.id), full: false });
    const fifth = toggleCard(state.cards, match.hand[4].id, 4);
    expect(fifth.full).toBe(true);
    expect(fifth.cards).toHaveLength(4);
    // Tapping a chosen card frees a place.
    expect(toggleCard(state.cards, match.hand[0].id, 4).cards).toHaveLength(3);
    // A two-card hand plays at most two.
    const small = match.actions.map((o) => ({ ...o, maximum: 2 }));
    expect(playLimit(small)).toBe(2);
    expect(
      playAction(
        small,
        'A',
        match.hand.slice(0, 3).map((c) => c.id),
      ),
    ).toBeNull();
  });

  it('lets a starter declare any of the 13 offered ranks and sends that option with the cards', () => {
    const { match, selfId } = opening();
    expect(match.currentPlayer).toBe(selfId);
    const plays = match.actions.filter((o) => o.value.type === 'play');
    expect(plays.map((o) => o.value.choice)).toEqual([...bluffRanks]);
    const chosen = match.hand.slice(0, 2).map((c) => c.id);
    expect(playAction(match.actions, null, chosen)).toBeNull();
    expect(playAction(match.actions, '7', [])).toBeNull();
    const seven = plays.find((o) => o.value.choice === '7')!;
    expect(playAction(match.actions, '7', chosen)).toEqual({ ...seven.value, cards: chosen });
    // Cards of one rank suggest that rank; mixed cards suggest nothing.
    const [first] = match.hand;
    const same = match.hand.filter((c) => c.value === first.value).map((c) => c.id);
    expect(suggestedRank(match.hand, same)).toBe(first.value);
    const mixed = [first.id, match.hand.find((c) => c.value !== first.value)!.id];
    expect(suggestedRank(match.hand, mixed)).toBeNull();
    const dock = decisions(match.actions, '7', chosen);
    expect(dock.map((d) => [d.key, d.label, d.variant])).toEqual([
      ['play', 'Play 2 as 7s', 'primary'],
    ]);
  });

  it('sends a follower’s single play with its cards, Pass as skip and Call bluff as call_bluff', () => {
    const { match } = scenario('bluff-2-17-4');
    expect(bluffDetails(match.detail).rank).toBe('Q');
    const chosen = [match.hand[0].id];
    const dock = decisions(match.actions, 'Q', chosen);
    expect(dock.map((d) => d.key)).toEqual(['play', 'skip', 'call_bluff']);
    expect(dock.filter((d) => d.variant === 'primary')).toHaveLength(1);
    const play = match.actions.find((o) => o.value.type === 'play')!;
    expect(dock[0]).toMatchObject({
      label: 'Play 1 as Queens',
      action: { ...play.value, cards: chosen },
    });
    expect(dock[1]).toMatchObject({ label: 'Pass', action: { type: 'skip' } });
    expect(dock[2]).toMatchObject({ label: 'Call bluff', action: { type: 'call_bluff' } });
    // Without cards the play waits; the other two choices stay available.
    expect(decisions(match.actions, 'Q', [])[0].action).toBeNull();
  });

  it('writes each play as a count and a claimed rank', () => {
    expect(playLine('Ada', 3, '7')).toBe('Ada played 3 cards as 7s');
    expect(playLine('You', 1, 'Q')).toBe('You played 1 card as Queens');
    expect(playLine('Bo', 2, 'A')).toBe('Bo played 2 cards as Aces');
  });
});

describe('Bluff table', () => {
  it('shows the opening hand, a face-down empty pile and the 13-rank picker', () => {
    const p = opening();
    const html = renderToStaticMarkup(<BluffTable {...p} />);
    expect(html).toContain('bluff-game');
    expect(html).toContain('New round');
    expect(html).toContain('aria-label="Rank to declare"');
    expect(html.match(/class="bluff-rank"/g)).toHaveLength(13);
    // One filled button in the view; it waits for cards and a rank.
    expect(html.match(/button--primary/g)).toHaveLength(1);
    for (const card of p.match.hand) expect(html).toContain(`aria-label="${card.label}"`);
  });

  it('lists the round’s plays by count and rank, never by face', () => {
    const p = scenario('bluff-6-31-7');
    const html = renderToStaticMarkup(<BluffTable {...p} />);
    expect(html).toContain('played 2 cards as Queens');
    expect(html).toContain('played 1 card as Queens');
    expect(html).toContain('passed');
    expect(html).toContain('Pile · 6');
    expect(html).toMatch(/playing-card--back/);
    expect(html).toContain('Call bluff turns over');
  });

  it('turns over only the called play and says who takes the pile', () => {
    const p = scenario('bluff-6-31-8');
    const data = bluffDetails(p.match.detail);
    const html = renderToStaticMarkup(<BluffTable {...p} />);
    expect(p.match.community).toHaveLength(2);
    expect(html.match(/aria-label="The called play, face up"/g)).toHaveLength(1);
    for (const card of p.match.community) expect(html).toContain(`aria-label="${card.label}"`);
    expect(html).toContain('Honest: every card matches');
    expect(html).toContain(
      `${data.reveal!.taker === p.selfId ? 'You take' : 'takes'} the pile · ${data.reveal!.pile_count} cards`,
    );
    expect(html).toContain(
      data.reveal!.starter === p.selfId ? 'You start the next round.' : 'starts the next round.',
    );
    expect(html).toContain('Continue');
    expect(html.match(/button--primary/g)).toHaveLength(1);
    expect(html).not.toContain('aria-label="Rank to declare"');
  });

  it('warns when a player is on their last cards', () => {
    const p = scenario('bluff-2-17-4');
    const other = p.match.players.find((pl) => pl.id !== p.selfId)!.id;
    const html = renderToStaticMarkup(
      <BluffTable {...p} match={{ ...p.match, detail: { ...p.match.detail, going_out: other } }} />,
    );
    expect(html).toContain('played their last cards. If this play stands, they win.');
    expect(html).toContain('Last cards');
  });
});
