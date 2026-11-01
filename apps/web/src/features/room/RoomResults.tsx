import type { Room } from '@games/api-client';
import type { Game } from '@games/api-client/catalog';

/** Results follow the server's winners and each game's declared score units. */
export function RoomResults({ room, game }: { room: Room; game: Game }) {
  const match = room.game;
  if (!match) return null;
  const name = (id: string) => room.members.find((member) => member.id === id)?.name || 'Player';
  const cooperative = game.playMode === 'cooperative';
  const title = cooperative
    ? match.winners.length
      ? 'You won together!'
      : 'The team didn’t make it this time.'
    : match.detail.draw === true
      ? 'An even match. It’s a draw.'
      : match.winners.length
        ? `${match.winners.map(name).join(' & ')} ${match.winners.length === 1 ? 'wins' : 'win'}!`
        : 'A good round, well played.';
  const players = [...match.players];
  if (!cooperative && game.scoreOrder !== 'none')
    players.sort((a, b) => (game.scoreOrder === 'low' ? a.score - b.score : b.score - a.score));
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
          <strong>{players[0].score}</strong> {game.scoreLabel}
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
                {player.score} {game.scoreLabel.toLocaleLowerCase()}
                {player.chips != null ? ` · ${player.chips} chips` : ''}
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
