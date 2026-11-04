import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { rummyDetails, type Card } from '@games/api-client';
import { midgameScenarios } from '@/stories/generated/midgame-scenarios';
import { RummyTable } from '@/games/rummy/RummyTable';
import { RummyDock } from '@/games/rummy/RummyDock';
import { isJokerCard, wildPlural } from '@/games/rummy/rummy-view';
import type { TableProps } from '@/games/types';

function scenario(id: string, finished = false): TableProps {
  const fixture = midgameScenarios.find((item) => item.id === id)!;
  const room = mapRoom({
    ...fixture.room,
    ...(finished ? { game: fixture.next.game, status: 'finished' } : {}),
  });
  return {
    room,
    match: room.game!,
    selfId: fixture.selfId,
    pending: false,
    onAction: () => undefined,
  };
}
// Legally reached states: a winning 14-card hand, and a card just taken from the discard.
const declareId = midgameScenarios.find(
  (item) => item.game === 'rummy' && item.next.action.type === 'declare',
)!.id;
const takenId = midgameScenarios.find(
  (item) =>
    item.game === 'rummy' &&
    item.room.game!.phase === 'discard' &&
    item.room.game!.hand.some(
      (card) => !(item.room.game!.actions ?? []).some((option) => option.action.card === card.id),
    ),
)?.id;
const dockProps = (p: TableProps) => ({
  match: p.match,
  room: p.room,
  selfId: p.selfId,
  pending: false,
  submitted: null,
  winning: [] as Card[],
  discardTop: p.match.discard ?? null,
  discardTopIsJoker: false,
  onSelect: () => undefined,
  onDecide: () => undefined,
  onDrop: () => undefined,
  clear: () => undefined,
});

describe('Rummy table decisions', () => {
  it('names the wild rank in words, shows the cut card and marks every joker in the hand', () => {
    const p = scenario(declareId);
    const wild = String(p.match.detail.wild_rank);
    const html = renderToStaticMarkup(<RummyTable {...p} />);
    expect(html).toContain(`Wild: ${wildPlural(wild)}`);
    expect(html).not.toContain('Wild rank:');
    const jokers = p.match.hand.filter((card) => isJokerCard(card, wild));
    expect(jokers.length).toBeGreaterThan(0);
    // One marker per joker in the hand plus the face-up cut card.
    expect(html.match(/rummy-mark--wild/g)).toHaveLength(jokers.length + 1);
    // A raw engine rank such as "T" is never shown to players.
    const tens = renderToStaticMarkup(
      <RummyTable
        {...p}
        match={{
          ...p.match,
          community: [{ ...p.match.hand[0], id: 'TH:1', label: '10 ♥', value: '10', suit: '♥' }],
          detail: { ...p.match.detail, wild_rank: 'T' },
        }}
      />,
    );
    expect(tens).toContain('Wild: 10s');
    expect(tens).toContain('Every 10 and both printed jokers act as jokers.');
  });

  it('surfaces an available declaration before any card is selected', () => {
    const p = scenario(declareId);
    const data = rummyDetails(p.match.detail);
    const winning = p.match.hand.filter((card) => data.discard_analyses[card.id]?.valid);
    expect(winning.length).toBeGreaterThan(0);
    const html = renderToStaticMarkup(<RummyTable {...p} />);
    expect(html).toContain('You can declare');
    expect(html).not.toMatch(/Your hand: \d+ loss points/);
    for (const card of winning) {
      expect(html).toContain(`aria-label="${card.label} (discard it to declare)"`);
      expect(html).toContain(`aria-label="Select ${card.label} to declare"`);
    }
  });

  it('puts a winning Declare first and keeps Discard secondary; a losing Declare is secondary', () => {
    const p = scenario(declareId);
    const data = rummyDetails(p.match.detail);
    const card = p.match.hand.find((item) => data.discard_analyses[item.id]?.valid)!;
    const valid = renderToStaticMarkup(
      <RummyDock {...dockProps(p)} selectedCard={card} preview={data.discard_analyses[card.id]} />,
    );
    const declare = valid.indexOf(`>Declare · discard ${card.label}<`);
    const discard = valid.indexOf(`>Discard ${card.label}<`);
    expect(declare).toBeGreaterThan(-1);
    expect(declare).toBeLessThan(discard);
    expect(valid).toMatch(/button--primary[^>]*>Declare · discard/);
    expect(valid).toMatch(/button--secondary[^>]*>Discard /);
    expect(valid).toContain('data-decision-actions');
    const losing = p.match.hand.find(
      (item) => data.discard_analyses[item.id] && !data.discard_analyses[item.id].valid,
    )!;
    const invalid = renderToStaticMarkup(
      <RummyDock
        {...dockProps(p)}
        selectedCard={losing}
        preview={data.discard_analyses[losing.id]}
      />,
    );
    expect(invalid.indexOf(`>Discard ${losing.label}<`)).toBeLessThan(
      invalid.indexOf(`>Declare · discard ${losing.label}<`),
    );
    expect(invalid).toMatch(/button--secondary[^>]*>Declare · discard/);
    expect(invalid).toContain('false declaration');
  });

  it('marks a card taken from the discard and explains why it cannot go straight back', () => {
    expect(takenId).toBeTruthy();
    const p = scenario(takenId!);
    const taken = p.match.hand.find(
      (card) => !p.match.actions.some((option) => option.value.card === card.id),
    )!;
    const html = renderToStaticMarkup(<RummyTable {...p} />);
    expect(html).toContain(`aria-label="${taken.label} (taken from the discard)"`);
    expect(html).toContain(`You took ${taken.label} from the discard.`);
    const dock = renderToStaticMarkup(
      <RummyDock {...dockProps(p)} selectedCard={taken} taken={taken} />,
    );
    expect(dock).toContain('can’t be discarded now');
    expect(dock).not.toContain(`>Discard ${taken.label}<`);
  });

  it('asks before dropping and tells every seat who dropped or declared falsely', () => {
    const p = scenario(
      midgameScenarios.find(
        (item) => item.id.startsWith('rummy-6') && item.room.game!.phase === 'draw',
      )!.id,
    );
    const others = p.match.players.filter((player) => player.id !== p.selfId);
    const html = renderToStaticMarkup(
      <RummyTable
        {...p}
        match={{
          ...p.match,
          detail: {
            ...p.match.detail,
            out: {
              [others[0].id]: { penalty: 80, reason: 'false_declaration' },
              [others[1].id]: { penalty: 20, reason: 'drop' },
            },
          },
        }}
      />,
    );
    expect(html).toContain('False declaration · −80');
    expect(html).toContain('Dropped · −20');
    expect(html).not.toContain('Folded');
    expect(html).toMatch(/button--secondary[^>]*>Drop for \d+…</);
    const out = renderToStaticMarkup(
      <RummyDock
        {...dockProps(p)}
        match={{ ...p.match, actions: [] }}
        selfOut={{ penalty: 80, reason: 'false_declaration' }}
      />,
    );
    expect(out).toContain('You’re out of this deal (−80, false declaration)');
  });

  it('reveals every hand grouped by the server’s melds at the finish', () => {
    const p = scenario(declareId, true);
    expect(p.match.phase).toBe('finished');
    const html = renderToStaticMarkup(<RummyTable {...p} />);
    expect(html).toContain('aria-label="Rummy score explanation"');
    expect(html).toContain('Valid declaration');
    expect(html).toContain('Pure sequence');
    const revealed = p.match.players.reduce((total, player) => total + player.cards.length, 0);
    const results = html.slice(
      html.indexOf('aria-label="Rummy score explanation"'),
      html.indexOf('</section>', html.indexOf('aria-label="Rummy score explanation"')),
    );
    expect(results.match(/class="playing-card /g)).toHaveLength(revealed);
    expect(results).toContain('You: +');
    // The live hand analysis is replaced by the settled results.
    expect(html).not.toMatch(/Your hand: \d+ loss points/);
  });
});
