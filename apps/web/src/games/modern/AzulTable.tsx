'use client';
import { useRef } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, AzulTileArt } from '@games/ui';
import { azulDetails } from '@games/api-client';
import { PlayerStrip } from '../shared/PlayerStrip';
import { playerName, type TableProps } from '../types';

const colors = ['blue', 'yellow', 'red', 'black', 'white'] as const;
function Tile({ color, ghost = false }: { color: string; ghost?: boolean }) {
  return (
    <span className="azul-tile" data-color={color} data-ghost={ghost} aria-label={`${color} tile`}>
      <AzulTileArt color={color} />
    </span>
  );
}

export function AzulTable(props: TableProps) {
  const { match, room, selfId, pending, onAction } = props;
  const data = azulDetails(match.detail);
  const factories = useRef<HTMLDivElement>(null);
  const blocked = pending || room.paused;
  function scrollFactories(direction: number) {
    const rail = factories.current;
    if (!rail) return;
    rail.scrollBy({
      left: direction * rail.clientWidth,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }
  const next = match.actions.find((o) => o.value.type === 'next_round');
  function offer(tiles: string[], source: string) {
    return (
      <section
        className={`azul-factory${source === 'center' ? ' azul-factory--center' : ''}`}
        key={source}
        aria-label={source === 'center' ? 'Center offer' : `Factory ${Number(source) + 1}`}
      >
        <span className="small muted">
          {source === 'center' ? 'Center' : `Factory ${Number(source) + 1}`}
          {source === 'center' && data.marker ? ' · first player' : ''}
        </span>
        <div className="azul-factory-colors">
          {source === 'center' && data.marker ? (
            <span
              className="azul-center-marker"
              title="First player next round; goes on your floor"
            >
              <Tile color="first" />
            </span>
          ) : null}
          {colors
            .filter((color) => tiles.includes(color))
            .map((color) => {
              const option = match.actions.find(
                (o) =>
                  o.value.type === 'draft_tiles' &&
                  o.value.choice === source &&
                  o.value.color === color,
              );
              const count = tiles.filter((t) => t === color).length;
              return (
                <button
                  key={color}
                  className="azul-draft-button"
                  type="button"
                  disabled={blocked || !option}
                  aria-label={`Take ${count} ${color} from ${source === 'center' ? 'center' : `factory ${Number(source) + 1}`}`}
                  onClick={() => option && onAction(option.value)}
                >
                  <Tile color={color} />
                  <b>×{count}</b>
                </button>
              );
            })}
          {!tiles.length && !(source === 'center' && data.marker) ? (
            <span className="azul-empty-offer">Empty</span>
          ) : null}
        </div>
      </section>
    );
  }
  const orderedPlayers = [...match.players].sort(
    (a, b) => Number(b.id === selfId) - Number(a.id === selfId),
  );
  return (
    <div className="table-layout modern-game">
      <PlayerStrip {...props} playerCaption={(p) => `${p.score} points`} />
      <section className="azul-table" data-phase={match.phase} aria-label="Azul tile table">
        <div className="modern-game-heading">
          <div>
            <p className="eyebrow">Round {data.round}</p>
            <h2>{match.phase === 'placing' ? 'Place your tiles' : 'Choose tiles'}</h2>
          </div>
          <span className="small muted">
            {data.marker
              ? 'First center taker starts next'
              : `${playerName(room, data.starter)} starts next`}
          </span>
        </div>
        <div className="azul-supply">
          {offer(data.center, 'center')}
          <div className="azul-factory-navigation">
            <h3>{data.factories.length} factories</h3>
            <div>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Previous factories"
                onClick={() => scrollFactories(-1)}
              >
                <ArrowLeft size={18} aria-hidden="true" />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                aria-label="Next factories"
                onClick={() => scrollFactories(1)}
              >
                <ArrowRight size={18} aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="azul-factories" ref={factories}>
            {data.factories.map((f, i) => offer(f, String(i)))}
          </div>
        </div>
        {match.phase === 'placing' ? (
          <div className="azul-draft-preview">
            <div>
              {data.draft.map((color, index) => (
                <Tile key={index} color={color} />
              ))}
            </div>
            <p>
              {match.currentPlayer === selfId
                ? 'Choose one pattern line on your board, or the floor.'
                : `${playerName(room, match.currentPlayer!)} is placing tiles.`}
            </p>
          </div>
        ) : null}
        <div className="azul-player-boards">
          {orderedPlayers.map((player) => (
            <details
              key={player.id}
              className="azul-player-board"
              data-own={player.id === selfId}
              aria-label={`${playerName(room, player.id)} board`}
              open={player.id === selfId}
            >
              <summary className="azul-board-name">
                <strong>
                  {playerName(room, player.id)}
                  {player.id === selfId ? ' · you' : ''}
                </strong>
                <b>{player.score} pts</b>
              </summary>
              <div className="azul-board-body">
                <div className="azul-pattern-lines" aria-label="Pattern lines">
                  {data.lines[player.id].map((line, row) => {
                    const option =
                      player.id === selfId
                        ? match.actions.find(
                            (o) => o.value.type === 'place_tiles' && o.value.choice === String(row),
                          )
                        : undefined;
                    return (
                      <button
                        type="button"
                        className="azul-pattern-line"
                        key={row}
                        aria-label={`Place on pattern line ${row + 1}, ${row + 1 - line.length} spaces available`}
                        disabled={blocked || !option}
                        onClick={() => option && onAction(option.value)}
                      >
                        <small>{row + 1}</small>
                        <span>
                          {Array.from({ length: row + 1 }, (_, col) =>
                            col < row + 1 - line.length ? (
                              <span key={col} className="azul-tile azul-tile--empty" />
                            ) : (
                              <Tile key={col} color={line[col - (row + 1 - line.length)]} />
                            ),
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="azul-wall" aria-label="Wall">
                  {data.walls[player.id].flatMap((row, r) =>
                    row.map((color, col) => (
                      <Tile
                        key={`${r}-${col}`}
                        color={color || colors[(col - r + 5) % 5]}
                        ghost={!color}
                      />
                    )),
                  )}
                </div>
              </div>
              <div className="azul-floor">
                <span className="small muted">Floor</span>
                <div>
                  {Array.from({ length: 7 }, (_, i) => (
                    <span key={i} className="azul-floor-cell">
                      {data.floors[player.id][i] ? (
                        <Tile color={data.floors[player.id][i]} />
                      ) : (
                        <small>−{[1, 1, 2, 2, 2, 3, 3][i]}</small>
                      )}
                    </span>
                  ))}
                </div>
                {player.id === selfId &&
                match.actions.some((o) => o.value.type === 'place_tiles') ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={blocked}
                    onClick={() => {
                      const option = match.actions.find(
                        (o) => o.value.type === 'place_tiles' && o.value.choice === 'floor',
                      );
                      if (option) onAction(option.value);
                    }}
                  >
                    Place on floor
                  </Button>
                ) : null}
              </div>
              {data.last_scores[player.id] ? (
                <p className="small muted azul-round-summary">
                  Last round: +{data.last_scores[player.id].wall} wall · −
                  {data.last_scores[player.id].floor} floor
                  {data.last_scores[player.id].bonus !== undefined
                    ? ` · +${data.last_scores[player.id].bonus} bonuses`
                    : ''}
                </p>
              ) : null}
            </details>
          ))}
        </div>
        {next ? (
          <div className="modern-review">
            <p>Round scored. Keep your unfinished lines.</p>
            <Button disabled={blocked} onClick={() => onAction(next.value)}>
              Next round
            </Button>
          </div>
        ) : null}
      </section>
    </div>
  );
}
