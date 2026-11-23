import Link from 'next/link';
import { Wordmark } from '@games/ui';
import { AccountNav } from './AccountNav';
import { ProgressChip } from './ProgressChip';
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
          <Link href="/rewards">Rewards</Link>
        </nav>
      ) : null}
      <div className="header-actions">
        <ProgressChip />
        <AccountNav />
        {children}
      </div>
    </header>
  );
}
