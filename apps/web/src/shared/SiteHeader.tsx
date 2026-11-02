import Link from 'next/link';
import { Wordmark } from '@games/ui';
import { AccountNav } from './AccountNav';
export function SiteHeader({
  children,
  onGamesClick,
}: {
  children?: React.ReactNode;
  onGamesClick?: () => void;
}) {
  return (
    <header className="site-header page-width">
      <Link href="/" aria-label="Games home">
        <Wordmark />
      </Link>
      <nav className="header-nav" aria-label="Main navigation">
        <Link href="/#games" onClick={onGamesClick}>
          Games
        </Link>
      </nav>
      <div className="header-actions">
        <AccountNav />
        {children}
      </div>
    </header>
  );
}
