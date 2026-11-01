'use client';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Button, ChoiceGroup, GameTile } from '@games/ui';
import { games } from '@games/api-client/catalog';
import { GameArt } from '@/shared/GameArt';
import { categories, discoveryRank, matchesGame, type Category } from './catalogue-search';

export function GameLibrary({ onChoose }: { onChoose: (id: string) => void }) {
  const [query, setQuery] = useState('');
  const [players, setPlayers] = useState(0);
  const [category, setCategory] = useState<Category>('all');
  const filtered = games
    .filter((game) => matchesGame(game, query, players, category))
    .sort((a, b) => discoveryRank(a.id) - discoveryRank(b.id));
  const reset = () => {
    setQuery('');
    setPlayers(0);
    setCategory('all');
  };
  return (
    <section id="games" className="game-library" aria-labelledby="library-heading">
      <div className="section-heading">
        <h2 id="library-heading">What are we playing?</h2>
        <p className="small muted" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? 'game' : 'games'} for your table
        </p>
      </div>
      <div className="library-controls">
        <label className="library-search">
          <Search size={18} aria-hidden="true" />
          <span className="sr-only">Search games</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Find your next favourite"
          />
          {query ? (
            <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>
              <X size={16} />
            </button>
          ) : null}
        </label>
        <label className="library-players">
          <span>Players</span>
          <select
            aria-label="Players"
            value={players}
            onChange={(event) => setPlayers(Number(event.target.value))}
          >
            <option value={0}>Any group</option>
            {Array.from({ length: 10 }, (_, i) => (
              <option key={i + 1} value={i + 1}>
                {i === 0 ? 'Just me' : `${i + 1} people`}
              </option>
            ))}
          </select>
        </label>
        <ChoiceGroup
          label="Game categories"
          options={categories}
          value={category}
          onChange={setCategory}
        />
      </div>
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
              edition={game.rulesVersion.startsWith('house-') ? 'house' : 'standard'}
              artwork={<GameArt game={game} />}
              onChoose={() => onChoose(game.id)}
            />
          ))}
        </div>
      ) : (
        <div className="library-empty">
          <h3>No games at this table yet.</h3>
          <p>Try another name, category or group size.</p>
          <Button variant="secondary" onClick={reset}>
            Show all games
          </Button>
        </div>
      )}
    </section>
  );
}
