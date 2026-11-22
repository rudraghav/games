import {
  Award,
  BookOpen,
  Check,
  Compass,
  Crown,
  Flame,
  Gift,
  Layers,
  Medal,
  Play,
  Sparkles,
  Star,
  Trophy,
  Users,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { Badge } from '@games/api-client';

/** A picture for each badge the server sends today; any other badge gets the plain medal. */
const icons: Record<string, LucideIcon> = {
  'first-game': Play,
  regular: Medal,
  veteran: Star,
  'first-win': Trophy,
  'five-wins': Sparkles,
  'twenty-five-wins': Crown,
  explorer: Compass,
  collector: Layers,
  'good-company': Users,
  'full-table': UsersRound,
  'streak-3': Flame,
  'streak-7': Flame,
  reader: BookOpen,
  organiser: Gift,
};

/** Earned badges in colour with a check; the rest muted, with how far along they are. */
export function BadgeGrid({ badges }: { badges: readonly Badge[] }) {
  return (
    <ul className="badge-grid">
      {badges.map((badge) => {
        const Icon = Object.hasOwn(icons, badge.id) ? icons[badge.id] : Award;
        return (
          <li className="badge" key={badge.id} data-earned={badge.earned}>
            <span className="badge-medal" aria-hidden="true">
              <Icon size={22} />
            </span>
            <div className="badge-copy">
              <strong>{badge.name}</strong>
              <span className="badge-description">{badge.description}</span>
              {badge.earned ? (
                <span className="badge-earned">
                  <Check size={14} aria-hidden="true" /> Earned
                </span>
              ) : (
                <span className="badge-progress">
                  <progress
                    value={badge.value}
                    max={badge.goal}
                    aria-label={`${badge.name} progress`}
                  />
                  <span>
                    {badge.value} of {badge.goal}
                  </span>
                </span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
