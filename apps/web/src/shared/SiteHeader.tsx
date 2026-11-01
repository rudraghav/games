import Link from 'next/link';
import { Wordmark } from '@games/ui';
import { AccountNav } from './AccountNav';
export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="site-header page-width">
      <Link href="/" aria-label="Games home">
        <Wordmark />
      </Link>
      <nav className="header-nav" aria-label="Main navigation">
        <Link href="/#games">The games</Link>
        <Link href="/#how-it-works">How it works</Link>
      </nav>
      <div className="header-actions">
        <AccountNav />
        {children}
      </div>
    </header>
  );
}
