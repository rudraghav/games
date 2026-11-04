import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { azulDetails, gemsDetails } from '@games/api-client';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { AzulTable } from '@/games/modern/AzulTable';
import { GemsTable } from '@/games/gems/GemsTable';
import type { TableProps } from '@/games/types';

function scenario(id: string) {
  const fixture = midgameScenarios.find((item) => item.id === id)!;
  const room = mapRoom(fixture.room);
  return { room, match: room.game!, selfId: fixture.selfId };
}

/** The same public table from another seat: no legal actions and no private hand. */
function seenBy(props: ReturnType<typeof scenario>, viewer: string) {
  return { ...props, selfId: viewer, match: { ...props.match, actions: [], hand: [] } };
}

function render(
  Table: (props: TableProps) => React.ReactNode,
  props: Omit<TableProps, 'onAction' | 'pending'>,
) {
  return renderToStaticMarkup(<Table {...props} onAction={() => undefined} pending={false} />);
}

const count = (html: string, text: string) => html.split(text).length - 1;

describe('Azul decisions', () => {
  it('shows the drafted tiles and every destination with its cost while placing', () => {
    const props = scenario('azul-4-31-16');
    const data = azulDetails(props.match.detail);
    const html = render(AzulTable, props);
    const group = html.slice(html.indexOf('aria-label="Drafted tiles"'));
    expect(count(group.slice(0, group.indexOf('</div>')), `aria-label="${data.draft[0]} tile"`)).toBe(
      data.draft.length,
    );
    expect(html).toContain('aria-label="Where the tiles go"');
    expect(count(html, 'class="azul-choice"')).toBe(6);
    // Overflow names its point cost before anything is sent.
    expect(html).toMatch(/to the floor costing \d+ points?/);
  });

  it('tells a waiting seat whose tiles are being placed instead of instructing them', () => {
    const props = scenario('azul-4-31-16');
    const actor = props.match.currentPlayer!;
    const viewer = props.match.players.find((player) => player.id !== actor)!.id;
    const html = render(AzulTable, seenBy(props, viewer));
    const data = azulDetails(props.match.detail);
    expect(html).toContain(`is placing <strong>${data.draft.length} ${data.draft[0]}</strong>`);
    expect(html).not.toContain('Where the tiles go');
    expect(html).not.toContain('Your turn');
  });

  it('shows the round review to every seat and the next-round control only to the starter', () => {
    const props = scenario('azul-4-31-31');
    const starter = render(AzulTable, props);
    expect(starter).toContain('Start round 2');
    expect(starter).toContain('aria-label="Round review"');
    const viewer = props.match.players.find((player) => player.id !== props.selfId)!.id;
    const waiting = render(AzulTable, seenBy(props, viewer));
    expect(waiting).toContain('aria-label="Round review"');
    expect(waiting).toContain('to start round 2');
    expect(waiting).not.toContain('Start round 2');
    for (const player of props.match.players)
      expect(waiting).toContain(`${player.score} ${player.score === 1 ? 'pt' : 'pts'}`);
  });

  it('summarises every opponent board without opening it', () => {
    const props = scenario('azul-4-31-16');
    const html = render(AzulTable, props);
    expect(count(html, 'class="azul-mini-board"')).toBe(props.match.players.length - 1);
    expect(html).toMatch(/aria-label="Pattern lines[^"]*\. \d+ wall tiles?\."/);
  });

  it('explains end bonuses on the final table', () => {
    const props = scenario('azul-4-31-31');
    const match = { ...props.match, phase: 'finished', currentPlayer: null, actions: [] };
    const html = render(AzulTable, { ...props, match });
    expect(html).toContain('aria-label="Final scores"');
    expect(html).toContain('Bonuses: row +2, column +7, colour set +10.');
    expect(html).not.toContain('starts next');
  });
});

describe('Gem Market decisions', () => {
  it('marks affordable cards from the server quotes and gives patrons no discount token', () => {
    const props = scenario('gem-market-4-31-99-crowded');
    const data = gemsDetails(props.match.detail);
    const html = render(GemsTable, props);
    const affordable = Object.values(data.purchaseQuotes).filter((quote) => quote.affordable).length;
    expect(count(html, '>Affordable<')).toBe(affordable);
    const patrons = props.match.community.filter((card) => card.suit === 'patron');
    expect(count(html, 'development-card--patron')).toBeGreaterThanOrEqual(patrons.length);
    expect(html).not.toContain('aria-label="gold discount"');
  });

  it('opens the market on the first tier that still has cards', () => {
    const props = scenario('gem-market-4-31-99-crowded');
    const data = gemsDetails(props.match.detail);
    const tierOne = props.match.community.filter((card) => data.cardInfo[card.id]?.tier === 1);
    expect(tierOne).toHaveLength(0);
    const html = render(GemsTable, props);
    expect(html).toMatch(/data-active="true" aria-label="Tier 2 developments"/);
  });

  it('tells waiting seats who is returning gems and how many, from public counts', () => {
    const props = scenario('gem-market-4-31-53');
    const actor = props.match.currentPlayer!;
    const held = Object.values(gemsDetails(props.match.detail).tokens[actor]).reduce(
      (sum, n) => sum + n,
      0,
    );
    const viewer = props.match.players.find((player) => player.id !== actor)!.id;
    const html = render(GemsTable, seenBy(props, viewer));
    expect(html).toContain(`is returning ${held - 10} gem`);
    expect(html).not.toContain('Return 0 gems');
    expect(render(GemsTable, props)).toContain(`Return ${held - 10} gems to hold ten.`);
  });

  it('says whose turn is the last one in the final round', () => {
    const props = scenario('gem-market-4-31-99-crowded');
    expect(gemsDetails(props.match.detail).finalRound).toBe(true);
    const html = render(GemsTable, props);
    expect(html).toContain('Final round');
    expect(html).toContain('This is your last turn');
    const index = props.match.players.findIndex((player) => player.id === props.match.currentPlayer);
    const done = props.match.players.slice(0, index).find((player) => player.id !== props.selfId);
    if (done) expect(render(GemsTable, seenBy(props, done.id))).toContain('Your turns are done');
  });
});
