import { blackjackDetails, holdemDetails, type Room } from '@games/api-client';
import { groupSettledPots } from './casino-pots';
import { holdemPublic, teenPublic } from './casino-public';

const signed = (amount: number) => `${amount > 0 ? '+' : ''}${amount}`;
const chips = (amount: number) => `${amount} chip${amount === 1 ? '' : 's'}`;

/** The saved settlement is authoritative; no winners or shares are recomputed. */
export function CasinoSettlement({ room }: { room: Room }) {
  const match = room.game;
  if (
    !match ||
    !['holdem', 'blackjack', 'teen-patti'].includes(match.id) ||
    match.phase !== 'finished'
  )
    return null;
  const name = (id: string) => room.members.find((member) => member.id === id)?.name || 'Player';
  if (match.id === 'blackjack') {
    const blackjack = blackjackDetails(match.detail);
    if (!Object.keys(blackjack.settlements).length) return null;
    // The viewer's own hands are in the projection; their ledger reads first.
    const ownCards = blackjack.hands.flatMap((hand) => hand.cards.map((card) => card.id)).join();
    const ledgers = Object.entries(blackjack.settlements);
    const ownId = ownCards
      ? ledgers.find(
          ([, result]) =>
            result.hands.flatMap((hand) => hand.cards.map((card) => card.id)).join() === ownCards,
        )?.[0]
      : undefined;
    ledgers.sort(([a], [b]) => Number(b === ownId) - Number(a === ownId));
    return (
      <section className="game-information-settlement" aria-label="Blackjack settlement">
        <h3>Hand and insurance settlement</h3>
        <ul>
          {ledgers.map(([id, result]) => (
            <li key={id} data-own={id === ownId || undefined}>
              <strong>
                {id === ownId ? 'You' : name(id)}: {signed(result.net)} chips net
              </strong>
              {result.hands.map((hand, i) => (
                <span key={i}>
                  Hand {i + 1}: {hand.settlement?.outcome} · {hand.bet} wagered,{' '}
                  {hand.settlement?.payout} returned ({signed(hand.settlement?.net ?? 0)} net).{' '}
                  {hand.settlement?.reason.replaceAll('_', ' ')}.
                </span>
              ))}
              <span>
                Insurance: {result.insurance.stake} wagered, {result.insurance.payout ?? 0} returned{' '}
                ({signed(result.insurance.net ?? 0)} net).
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  if (match.id === 'teen-patti') {
    const data = teenPublic(match);
    const shown = Object.entries(data.hand_evaluations);
    const outs = Object.entries(data.out_reasons);
    if (!shown.length && !outs.length && !data.finish_reason) return null;
    const how =
      data.finish_reason === 'pot_limit'
        ? 'The pot reached the 1024 limit, so every remaining hand was shown.'
        : data.finish_reason === 'show'
          ? 'A show compared the last two hands; the player who asked loses ties.'
          : 'Everyone else packed, so no hand had to be shown.';
    return (
      <section className="game-information-settlement" aria-label="Teen Patti result">
        <h3>How the pot was won</h3>
        <p className="small">
          {how} {match.message}
        </p>
        <ul>
          {shown
            .sort(
              ([a], [b]) => Number(match.winners.includes(b)) - Number(match.winners.includes(a)),
            )
            .map(([id, hand]) => (
              <li key={id}>
                <strong>
                  {name(id)}
                  {match.winners.includes(id) ? ' wins' : ''}: {hand.category}
                </strong>
                <span>{hand.description}</span>
              </li>
            ))}
          {outs.map(([id, reason]) => (
            <li key={`out-${id}`}>
              <strong>
                {name(id)}:{' '}
                {reason === 'lost_sideshow'
                  ? 'lost a sideshow'
                  : reason === 'lost_show'
                    ? 'lost the show'
                    : 'packed'}
              </strong>
              <span>
                {reason === 'packed'
                  ? 'Folded before the end; the cards stay hidden.'
                  : reason === 'lost_sideshow'
                    ? 'A private comparison found the weaker hand; the cards stay hidden.'
                    : 'The weaker hand at the show.'}
              </span>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  const data = holdemDetails(match.detail);
  const hands = holdemPublic(match).hand_evaluations;
  if (!data.pots.length && !Object.keys(data.refunds).length) return null;
  const pots = groupSettledPots(data.pots);
  return (
    <section className="game-information-settlement" aria-label="Pot settlement">
      <h3>Pot settlement</h3>
      <ul>
        {pots.map((pot, index) => (
          <li key={index}>
            <strong>
              {pot.name}: {chips(pot.amount)}
            </strong>
            {pot.allInBelow.length ? (
              <span>
                {pot.allInBelow
                  .map((id) => `${name(id)} was all in for ${data.contributions[id] ?? 0}`)
                  .join(' · ')}
                , so only {pot.eligible.map(name).join(', ')} could win it.
              </span>
            ) : null}
            <span>
              {pot.winners.length > 1 ? 'Split between ' : 'Won by '}
              {pot.winners.map(name).join(', ')}
              {data.settlementReason === 'uncontested' ? ' · everyone else folded' : ''}
            </span>
            {pot.winners.length > 1 && Object.keys(pot.awards).length ? (
              <span>
                {Object.entries(pot.awards)
                  .map(([id, amount]) => `${name(id)} receives ${amount}`)
                  .join(' · ')}
              </span>
            ) : null}
            {pot.oddChips.length ? (
              <span>
                Odd chip to {pot.oddChips.map(name).join(', ')} (first eligible winner clockwise
                after the dealer button).
              </span>
            ) : null}
          </li>
        ))}
        {Object.entries(data.refunds).map(([id, amount]) => (
          <li key={id}>
            <strong>
              {amount} chips returned to {name(id)}
            </strong>
            <span>Nobody matched this part of the bet.</span>
          </li>
        ))}
        {Object.entries(data.evaluations)
          .sort(([a], [b]) => Number(match.winners.includes(b)) - Number(match.winners.includes(a)))
          .map(([id, hand]) => (
            <li key={`hand-${id}`}>
              <strong>
                {name(id)}
                {match.winners.includes(id) ? ' wins' : ''}: {hands[id]?.short ?? hand.category}
              </strong>
              <span>{hand.description}</span>
              <span>Best five: {hand.cards.map((card) => card.label).join(' · ')}</span>
            </li>
          ))}
      </ul>
    </section>
  );
}
