'use client';
import { useRef, useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button, ChoiceGroup, GameTile } from '@games/ui';
import { games } from '@games/api-client/catalog';
import { GameArt } from '@/shared/GameArt';
import { gamePath } from '@/shared/game-paths';
import { teamSizes, teamTimes, teamsNote, type TeamSize, type TeamTime } from './catalogue-search';
import { browseGames, occasions, opensWithBots, type Occasion } from './occasions';

/** The one featured game. It leads the default view and is an ordinary tile everywhere else. */
export const FEATURED_GAME = 'tarot';

/**
 * The one library on the home page: a search box, one row of occasions, and a
 * grid in which every game appears once. In the default view (All, no search)
 * the featured game comes first as one wide card and the rest follow in
 * discovery order. For teams adds its note and two quick filters, and only
 * while it is chosen.
 */
export function GameLibrary({
  preset,
}: {
  /** The occasion to open with, for example from Play solo. */
  preset?: Occasion;
}) {
  const [query, setQuery] = useState('');
  const [occasion, setOccasion] = useState<Occasion>(preset ?? 'all');
  const [teamSize, setTeamSize] = useState<TeamSize | ''>('');
  const [teamTime, setTeamTime] = useState<TeamTime | ''>('');
  const search = useRef<HTMLInputElement>(null);
  const occasionRow = useRef<HTMLDivElement>(null);
  const teams = occasion === 'teams';
  const found = browseGames(games, query, occasion, { size: teamSize, time: teamTime });
  // Featured only when nothing narrows the list, and never shown twice.
  const featured =
    occasion === 'all' && !query.trim()
      ? found.find((game) => game.id === FEATURED_GAME)
      : undefined;
  const shown = featured ? [featured, ...found.filter((game) => game !== featured)] : found;
  const choose = (next: Occasion) => {
    setOccasion(next);
    if (next !== 'teams') {
      setTeamSize('');
      setTeamTime('');
    }
  };
  const reset = () => {
    setQuery('');
    choose('all');
    if (occasionRow.current) occasionRow.current.scrollLeft = 0;
    search.current?.focus();
  };
  return (
    <section id="games" className="game-library" aria-label="Games">
      <div className="library-controls">
        <label className="library-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search games</span>
          <input
            ref={search}
            type="search"
            aria-label="Search games"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search games"
            aria-controls="game-catalogue"
            onKeyDown={(event) => {
              if (event.key === 'Escape' && query) setQuery('');
            }}
          />
          {query ? (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('');
                search.current?.focus();
              }}
            >
              <X size={16} />
            </button>
          ) : null}
        </label>
        <div className="library-occasion-row" ref={occasionRow}>
          <ChoiceGroup
            label="Occasion"
            className="library-occasions"
            options={occasions}
            value={occasion}
            onChange={choose}
          />
        </div>
        {teams ? (
          <div className="team-filters">
            <p className="team-note">{teamsNote}</p>
            <div className="team-filter">
              <span className="team-filter-label" aria-hidden="true">
                Group size
              </span>
              {/* Pressing the chosen size again clears it. */}
              <ChoiceGroup
                label="Group size"
                className="team-choices"
                options={teamSizes}
                value={teamSize}
                onChange={(next) => setTeamSize(next === teamSize ? '' : next)}
              />
            </div>
            <div className="team-filter">
              <span className="team-filter-label" aria-hidden="true">
                Time
              </span>
              <ChoiceGroup
                label="Time"
                className="team-choices"
                options={teamTimes}
                value={teamTime}
                onChange={(next) => setTeamTime(next === teamTime ? '' : next)}
              />
            </div>
          </div>
        ) : null}
        <p className="library-count sr-only" role="status" aria-atomic="true">
          {shown.length} {shown.length === 1 ? 'game' : 'games'}
        </p>
      </div>
      <div id="game-catalogue">
        {shown.length ? (
          <div className="catalogue-grid">
            {shown.map((game) => (
              <GameTile
                key={game.id}
                name={game.name}
                minPlayers={game.minPlayers}
                maxPlayers={game.maxPlayers}
                minutes={game.minutes}
                tone={game.color}
                variant={game === featured ? 'featured' : 'standard'}
                subtitle={game === featured ? game.subtitle : undefined}
                actionLabel={game === featured ? 'Start reading' : undefined}
                groupLabel={game.family === 'organiser' ? 'Any group' : undefined}
                soloMode={opensWithBots(occasion, game)}
                edition={game.rulesVersion.startsWith('house-') ? 'house' : 'standard'}
                artwork={<GameArt game={game} />}
                href={`${gamePath(game.id)}${opensWithBots(occasion, game) ? '?mode=bots' : ''}`}
              />
            ))}
          </div>
        ) : (
          <div className="library-empty">
            <h3>No games found</h3>
            <p>
              {teams && (teamSize || teamTime) && !query.trim()
                ? 'No team pick fits both choices. Try another group size or time.'
                : 'Try another name, or look through all games.'}
            </p>
            <Button variant="secondary" onClick={reset}>
              Show all games
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
