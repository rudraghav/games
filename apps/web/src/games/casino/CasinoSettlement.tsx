import { blackjackDetails, holdemDetails, type Room } from '@games/api-client';

const signed = (amount: number) => `${amount > 0 ? '+' : ''}${amount}`;

/** The saved settlement is authoritative; no winners or shares are recomputed. */
export function CasinoSettlement({ room }: { room: Room }) {
  const match = room.game;
  if (!match || !['holdem', 'blackjack'].includes(match.id) || match.phase !== 'finished')
    return null;
  const name = (id: string) => room.members.find((member) => member.id === id)?.name || 'Player';
  if (match.id === 'blackjack') {
    const blackjack = blackjackDetails(match.detail);
    if (!Object.keys(blackjack.settlements).length) return null;
    return (
      <section className="game-information-settlement" aria-label="Blackjack settlement">
        <h3>Hand and insurance settlement</h3>
        <ul>
          {Object.entries(blackjack.settlements).map(([id, result]) => (
            <li key={id}>
              <strong>
                {name(id)}: {signed(result.net)} chips net
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
  const data = holdemDetails(match.detail);
  if (!data.pots.length && !Object.keys(data.refunds).length) return null;
  return (
    <section className="game-information-settlement" aria-label="Pot settlement">
      <h3>Pot settlement</h3>
      <ul>
        {data.pots.map((pot, index) => (
          <li key={index}>
            <strong>
              {index === 0 ? 'Main pot' : `Side pot ${index}`}: {pot.amount} chips
            </strong>
            <span>
              {pot.winners.length > 1 ? 'Split between ' : 'Won by '}
              {pot.winners.map(name).join(', ')}
              {data.settlementReason === 'uncontested' ? ' · everyone else folded' : ''}
            </span>
            {Object.keys(pot.awards).length ? (
              <span>
                {Object.entries(pot.awards)
                  .map(([id, amount]) => `${name(id)} receives ${amount}`)
                  .join(' · ')}
              </span>
            ) : null}
            {pot.odd_chips.length ? (
              <span>
                Odd chip to {pot.odd_chips.map(name).join(', ')} (first eligible winner clockwise
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
            <span>Unmatched wager</span>
          </li>
        ))}
        {Object.entries(data.evaluations).map(([id, hand]) => (
          <li key={`hand-${id}`}>
            <strong>
              {name(id)}: {hand.description}
            </strong>
            <span>Best five: {hand.cards.map((card) => card.label).join(' · ')}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
