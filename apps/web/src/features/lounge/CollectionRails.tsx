'use client';
import { ArrowRight } from 'lucide-react';
import { games } from '@games/api-client/catalog';
import { GameTile, HorizontalRail } from '@games/ui';
import { GameArt } from '@/shared/GameArt';
import { gamePath } from '@/shared/game-paths';
import { collectionGames, collections, type Collection } from './collections';

/**
 * The curated rails above the library. Each scrolls inside itself, shows who
 * and how long on every card, and has a See all that sets the library's filter.
 */
export function CollectionRails({ onSeeAll }: { onSeeAll: (collection: Collection) => void }) {
  return (
    // `game-library` scopes the same cover artwork rules the library tiles use.
    <div className="game-collections game-library">
      {collections.map((collection) => {
        const picks = collectionGames(collection, games);
        if (!picks.length) return null;
        const heading = `collection-${collection.id}`;
        return (
          <section
            key={collection.id}
            className="game-collection"
            data-collection={collection.id}
            aria-labelledby={heading}
          >
            <div className="game-collection-heading">
              <div>
                <h2 id={heading}>{collection.title}</h2>
                <p>{collection.note}</p>
              </div>
              <button
                type="button"
                className="game-collection-all"
                aria-label={`See all: ${collection.title}`}
                onClick={() => onSeeAll(collection)}
              >
                See all
                <ArrowRight size={15} aria-hidden="true" />
              </button>
            </div>
            <HorizontalRail
              label={`${collection.title} games`}
              navigationLabel={`games in ${collection.title}`}
              className="home-rail game-rail"
              contentClassName="game-rail-content"
            >
              {picks.map((game) => (
                <GameTile
                  key={game.id}
                  variant="rail"
                  name={game.name}
                  subtitle={game.subtitle}
                  minPlayers={game.minPlayers}
                  maxPlayers={game.maxPlayers}
                  minutes={game.minutes}
                  tone={game.color}
                  groupLabel={game.family === 'organiser' ? 'Any group' : undefined}
                  soloMode={Boolean(collection.withBots)}
                  edition={game.rulesVersion.startsWith('house-') ? 'house' : 'standard'}
                  artwork={<GameArt game={game} />}
                  href={`${gamePath(game.id)}${collection.withBots && game.botsSupported ? '?mode=bots' : ''}`}
                />
              ))}
            </HorizontalRail>
          </section>
        );
      })}
    </div>
  );
}
