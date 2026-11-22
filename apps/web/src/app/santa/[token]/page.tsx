import type { Metadata } from 'next';
import { SantaLinkScreen } from '@/features/santa-link/SantaLink';

// A private link: search engines never list it and it never travels as a referrer.
export const metadata: Metadata = {
  title: 'Your Secret Santa · Games',
  description: 'See who you are buying a gift for.',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  return <SantaLinkScreen token={(await params).token} />;
}
