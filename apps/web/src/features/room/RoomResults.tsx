import type { Room } from '@games/api-client';
import type { Game } from '@games/api-client/catalog';
import { CasinoSettlement } from '@/games/casino/CasinoSettlement';
import { nameList } from '@/games/shared/turn-state';
import { unoExtras } from '@/games/shared/uno-view';

/** Results follow the server's winners and each game's declared score units. */
export function RoomResults({ room, game }: { room: Room; game: Game }) {
  const match = room.game;
  if (!match) return null;
  const name = (id: string) => {
    const member = room.members.find((member) => member.id === id);
    return member
      ? `${member.name}${member.isBot && !/^bot\b/i.test(member.name) ? ' (Bot)' : ''}`
      : 'Player';
  };
  const cooperative = game.playMode === 'cooperative';
  const title = cooperative
    ? match.winners.length
      ? 'You won together!'
      : 'The team didn’t make it this time.'
    : match.detail.draw === true
      ? 'An even match. It’s a draw.'
      : match.winners.length
        ? `${nameList(match.winners.map(name), 3)} ${match.winners.length === 1 ? 'wins' : 'win'}!`
        : 'A good round, well played.';
  // "1 point", never "1 points"; plural labels lose their final s for a single unit.
  const unit = (score: number, label = game.scoreLabel) =>
    Math.abs(score) === 1 ? label.replace(/s$/, '') : label;
  const players = [...match.players];
  if (!cooperative && game.scoreOrder !== 'none')
    players.sort((a, b) => (game.scoreOrder === 'low' ? a.score - b.score : b.score - a.score));
  // Elimination games (No Mercy) rank knocked-out seats below everyone still in,
  // the last one out first, instead of listing them all at 0.
  const out = unoExtras(match.detail).out;
  const outIndex = (id: string) => out.findIndex((entry) => entry.player === id);
  if (out.length)
    players.sort((a, b) => {
      const ia = outIndex(a.id);
      const ib = outIndex(b.id);
      return (ia === -1 ? -1 : 0) - (ib === -1 ? -1 : 0) || (ia === -1 ? 0 : ib - ia);
    });
  // Winners lead the list (team games, unscored games) so the result reads top-down.
  players.sort(
    (a, b) => Number(match.winners.includes(b.id)) - Number(match.winners.includes(a.id)),
  );
  const ordinal = (n: number) =>
    `${n}${n % 10 === 1 && n % 100 !== 11 ? 'st' : n % 10 === 2 && n % 100 !== 12 ? 'nd' : n % 10 === 3 && n % 100 !== 13 ? 'rd' : 'th'}`;
  const sharedTeamScore =
    cooperative &&
    game.scoreOrder !== 'none' &&
    players.length > 0 &&
    players.every((player) => player.score === players[0].score);
  return (
    <section className="results" aria-label="Match results">
      <span className="eyebrow">{cooperative ? 'Your team result' : 'The results are in'}</span>
      <h2 className="heading-md">{title}</h2>
      {!cooperative && game.scoreOrder === 'low' ? (
        <p className="small muted results-score-note">Lower score wins.</p>
      ) : null}
      {sharedTeamScore ? (
        <p className="team-result-score">
          <strong>{players[0].score}</strong> {unit(players[0].score)}
        </p>
      ) : null}
      <div className="scoreboard" role="list" aria-label="Player results">
        {players.map((player) => (
          <div
            key={player.id}
            role="listitem"
            data-winner={match.winners.includes(player.id)}
            aria-label={`${name(player.id)}${match.winners.includes(player.id) ? ', winner' : ''}`}
          >
            <strong>{name(player.id)}</strong>
            {game.scoreOrder !== 'none' && !sharedTeamScore ? (
              <span>
                {player.score} {unit(player.score, game.scoreLabel.toLocaleLowerCase())}
                {player.chips != null ? ` · ${player.chips} chips` : ''}
              </span>
            ) : null}
            {outIndex(player.id) !== -1 ? (
              <span className="small muted">
                Out {ordinal(outIndex(player.id) + 1)} · {out[outIndex(player.id)].cards} cards
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <CasinoSettlement room={room} />
    </section>
  );
}
