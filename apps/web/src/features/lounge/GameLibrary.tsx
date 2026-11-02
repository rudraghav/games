'use client';
import { useRef, useState } from 'react';
import { Search, UsersRound, RotateCcw, X } from 'lucide-react';
import { Button, ChoiceGroup, GameTile } from '@games/ui';
import { games } from '@games/api-client/catalog';
import { GameArt } from '@/shared/GameArt';
import { categories, findGames, type Category } from './catalogue-search';

export function GameLibrary({ onChoose }: { onChoose: (id: string, withBots: boolean) => void }) {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState(0);
  const [category, setCategory] = useState<Category>('all');
  const search = useRef<HTMLInputElement>(null);
  const categoryRail = useRef<HTMLDivElement>(null);
  const hasFilters = query.trim().length > 0 || players !== 0 || category !== 'all';
  const filtered = findGames(games, query, players, category);
  const reset = () => {
    setQuery('');
    setPlayers(0);
    setCategory('all');
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
              onChange={setCategory}
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
        <p className="library-count sr-only" role="status" aria-atomic="true">
          {filtered.length} {filtered.length === 1 ? 'game' : 'games'}
        </p>
      </div>
      <div id="game-catalogue">
        {filtered.length ? (
          <div className="catalogue-grid">
            {filtered.map((game) => (
              <GameTile
                key={game.id}
                name={game.name}
                subtitle={game.subtitle}
                minPlayers={game.minPlayers}
                maxPlayers={game.maxPlayers}
                minutes={game.minutes}
                tone={game.color}
                soloMode={players === 1 || category === 'solo'}
                edition={game.rulesVersion.startsWith('house-') ? 'house' : 'standard'}
                artwork={<GameArt game={game} />}
                onChoose={() =>
                  onChoose(game.id, (players === 1 || category === 'solo') && game.botsSupported)
                }
              />
            ))}
          </div>
        ) : (
          <div className="library-empty">
            <h3>No games found</h3>
            <p>Try another name, category or group size.</p>
            <Button variant="secondary" onClick={reset}>
              Show all games
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
