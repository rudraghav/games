import Link from 'next/link';
import { Wordmark } from '@games/ui';
import { AccountNav } from './AccountNav';
export function SiteHeader({
  children,
  onHomeClick,
  showGamesLink = true,
}: {
  children?: React.ReactNode;
  onHomeClick?: () => void;
  showGamesLink?: boolean;
}) {
  return (
    <header className="site-header page-width">
      <Link href="/" aria-label="Games home" onClick={onHomeClick}>
        <Wordmark />
      </Link>
      {showGamesLink ? (
        <nav className="header-nav" aria-label="Main navigation">
          <Link href="/#games">Games</Link>
        </nav>
      ) : null}
      <div className="header-actions">
        <AccountNav />
        {children}
      </div>
    </header>
  );
}
