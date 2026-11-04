import type { Preview } from '@storybook/nextjs-vite';
import { DM_Sans, Fraunces } from 'next/font/google';
import '../src/app/globals.css';
import { Providers } from '../src/providers/Providers';

/* The app sets these font variables on <html> (src/app/layout.tsx). Card inventories and
 * contact sheets must wrap labels with the same face, not the Arial fallback. */
const body = DM_Sans({ subsets: ['latin'], variable: '--font-body' });
const heading = Fraunces({ subsets: ['latin'], variable: '--font-heading' });
if (typeof document !== 'undefined')
  document.documentElement.classList.add(body.variable, heading.variable);

const preview: Preview = {
  decorators: [
    (Story) => (
      <Providers>
        <Story />
      </Providers>
    ),
  ],
  parameters: { layout: 'padded' },
};
export default preview;
