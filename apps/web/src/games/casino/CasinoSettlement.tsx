import { holdemDetails, type Room } from '@games/api-client';

/** The saved settlement is authoritative; no winners or shares are recomputed. */
export function CasinoSettlement({ room }: { room: Room }) {
  const match = room.game;
  if (!match || match.id !== 'holdem' || match.phase !== 'finished') return null;
  const data = holdemDetails(match.detail);
  const name = (id: string) => room.members.find((member) => member.id === id)?.name || 'Player';
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
            </span>
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
      </ul>
    </section>
  );
}
