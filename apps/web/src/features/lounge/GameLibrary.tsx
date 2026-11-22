'use client';
import { useRef, useState } from 'react';
import { Search, UsersRound, RotateCcw, X } from 'lucide-react';
import { Button, ChoiceGroup, GameTile } from '@games/ui';
import { games } from '@games/api-client/catalog';
import { GameArt } from '@/shared/GameArt';
import { gamePath } from '@/shared/game-paths';
import {
  categories,
  findGames,
  teamSizes,
  teamTimes,
  teamsNote,
  type Category,
  type TeamSize,
  type TeamTime,
} from './catalogue-search';

export function GameLibrary({
  initialSolo = false,
  preset,
}: {
  initialSolo?: boolean;
  /** The view to open with, from Play solo or a collection's See all. */
  preset?: { category: Category; players: number };
}) {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState(preset?.players ?? (initialSolo ? 1 : 0));
  const [category, setCategory] = useState<Category>(
    preset?.category ?? (initialSolo ? 'solo' : 'all'),
  );
  // The two quick filters that exist only inside For teams.
  const [teamSize, setTeamSize] = useState<TeamSize | ''>('');
  const [teamTime, setTeamTime] = useState<TeamTime | ''>('');
  const search = useRef<HTMLInputElement>(null);
  const categoryRail = useRef<HTMLDivElement>(null);
  const teams = category === 'teams';
  const hasFilters = query.trim().length > 0 || players !== 0 || category !== 'all';
  const filtered = findGames(games, query, players, category, { size: teamSize, time: teamTime });
  const featured = filtered.find((game) => game.id === 'tarot');
  const ordered = featured ? [featured, ...filtered.filter((game) => game !== featured)] : filtered;
  const reset = () => {
    setQuery('');
    setPlayers(0);
    setCategory('all');
    setTeamSize('');
    setTeamTime('');
    if (categoryRail.current) categoryRail.current.scrollLeft = 0;
    search.current?.focus();
  };
  return (
    <section id="games" className="game-library" aria-labelledby="library-heading">
      <h2 id="library-heading" className="sr-only">
        Games
      </h2>
      <div className="library-controls">
        <div className="library-toolbar">
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
          <label className="library-players">
            <UsersRound size={16} aria-hidden="true" />
            <span className="sr-only">Players</span>
            <select
              aria-label="Players"
              value={players}
              onChange={(event) => setPlayers(Number(event.target.value))}
            >
              <option value={0}>Players</option>
              {Array.from({ length: 10 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {i === 0 ? 'Just me' : `${i + 1} people`}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="library-category-row">
          <div className="library-category-rail" ref={categoryRail}>
            <ChoiceGroup
              label="Game categories"
              className="library-categories"
              options={categories}
              value={category}
              onChange={(next) => {
                setCategory(next);
                if (next !== 'teams') {
                  setTeamSize('');
                  setTeamTime('');
                }
              }}
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="library-reset"
            onClick={reset}
            disabled={!hasFilters}
            aria-label="Reset filters"
            title="Reset filters"
          >
            <RotateCcw size={17} aria-hidden="true" />
          </Button>
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
          {filtered.length} {filtered.length === 1 ? 'game' : 'games'}
        </p>
      </div>
      <div id="game-catalogue">
        {filtered.length ? (
          <div className="catalogue-grid">
            {ordered.map((game) => (
              <GameTile
                key={game.id}
                name={game.name}
                subtitle={game.subtitle}
                minPlayers={game.minPlayers}
                maxPlayers={game.maxPlayers}
                minutes={game.minutes}
                tone={game.color}
                variant={game.id === 'tarot' ? 'featured' : 'standard'}
                actionLabel={game.id === 'tarot' ? 'Start reading' : undefined}
                groupLabel={game.family === 'organiser' ? 'Any group' : undefined}
                soloMode={players === 1 || category === 'solo'}
                edition={game.rulesVersion.startsWith('house-') ? 'house' : 'standard'}
                artwork={<GameArt game={game} />}
                href={`${gamePath(game.id)}${(players === 1 || category === 'solo') && game.botsSupported ? '?mode=bots' : ''}`}
              />
            ))}
          </div>
        ) : (
          <div className="library-empty">
            <h3>No games found</h3>
            <p>
              {teams && (teamSize || teamTime)
                ? 'No team pick fits both choices. Try another group size or time.'
                : 'Try another name, category or group size.'}
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
