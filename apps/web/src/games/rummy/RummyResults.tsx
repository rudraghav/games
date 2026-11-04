'use client';
import { PlayingCard } from '@games/ui';
import { rummyDetails, type Card } from '@games/api-client';
import { playerName, type TableProps } from '../types';
import { isJokerCard, markedLabel, meldNames, orderedMeld, rummyOut } from './rummy-view';

/**
 * Every hand the engine reveals at the finish, grouped by the server's own
 * melds, so the table can check the winning declaration and each loss.
 */
export function RummyResults({
  match,
  room,
  selfId,
}: Pick<TableProps, 'match' | 'room' | 'selfId'>) {
  const data = rummyDetails(match.detail);
  const out = rummyOut(match.detail);
  const wild = String(match.detail.wild_rank ?? data.wild_rank);
  const players = [...match.players].sort(
    (a, b) =>
      Number(match.winners.includes(b.id)) - Number(match.winners.includes(a.id)) ||
      (data.settlements[b.id]?.score ?? 0) - (data.settlements[a.id]?.score ?? 0),
  );
  return (
    <section
      className="game-information-settlement rummy-results"
      aria-label="Rummy score explanation"
    >
      <h3>
        {data.finish_reason === 'valid_declaration'
          ? 'Valid declaration'
          : data.finish_reason === 'last_active_player'
            ? 'Last active player wins'
            : 'Points settled'}
      </h3>
      <ul>
        {players.map((player) => {
          const result = data.settlements[player.id];
          if (!result) return null;
          const cards = new Map(
            player.cards.filter((c): c is Card => c !== null).map((c) => [c.id, c]),
          );
          const cardOf = (id: string) => cards.get(id);
          const won = match.winners.includes(player.id);
          const penalty = out[player.id];
          const name = player.id === selfId ? 'You' : playerName(room, player.id);
          const groups = [
            ...result.analysis.melds.map((meld) => ({
              title: meldNames[meld.kind],
              ids: orderedMeld(meld.cards, cardOf),
            })),
            ...(result.analysis.unmatched.length
              ? [{ title: 'Unmatched', ids: orderedMeld(result.analysis.unmatched, cardOf) }]
              : []),
          ];
          return (
            <li key={player.id} data-winner={won}>
              <div className="rummy-result-heading">
                <strong>
                  {name}: {result.score > 0 ? '+' : ''}
                  {result.score} {Math.abs(result.score) === 1 ? 'point' : 'points'}
                </strong>
                <span>
                  {won
                    ? data.finish_reason === 'valid_declaration'
                      ? 'Declared a valid hand and collects the others’ loss points.'
                      : 'Last player left in the deal; collects the others’ loss points.'
                    : penalty
                      ? penalty.reason === 'false_declaration'
                        ? `False declaration: fixed ${penalty.penalty}-point penalty.`
                        : `Dropped: fixed ${penalty.penalty}-point penalty.`
                      : result.analysis.scoring_gate
                        ? 'Unmatched cards count, capped at 80.'
                        : 'Sequence requirement not met; full hand points, capped at 80.'}
                </span>
              </div>
              {cards.size ? (
                <div
                  className="rummy-result-melds"
                  role="group"
                  aria-label={player.id === selfId ? 'Your hand' : `${name}’s hand`}
                >
                  {groups.map((group, index) => (
                    <div className="rummy-result-meld" key={index}>
                      <span className="eyebrow">{group.title}</span>
                      <div className="rummy-result-cards">
                        {group.ids.map((id) => {
                          const card = cardOf(id);
                          if (!card) return null;
                          const wildCard = isJokerCard(card, wild);
                          return (
                            <PlayingCard
                              key={id}
                              card={card}
                              compact
                              className={wildCard ? 'rummy-mark--wild' : undefined}
                              label={markedLabel(card, wildCard ? ['wild'] : [])}
                            />
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
