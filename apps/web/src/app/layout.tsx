import type { Metadata } from 'next';
import { DM_Sans, Fraunces } from 'next/font/google';
import { Providers } from '@/providers/Providers';
import './globals.css';
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const heading = Fraunces({ subsets: ['latin'], variable: '--font-heading' });
export const metadata: Metadata = {
  title: 'Games — Good company. Great games.',
  description:
    'Your favourite card games, together in one beautiful space. Create a private room, invite your people, and make a night of it.',
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${body.variable} ${heading.variable}`}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
