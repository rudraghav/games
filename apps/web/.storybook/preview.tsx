import type { Preview } from '@storybook/nextjs-vite';
import '../src/app/globals.css';
import { Providers } from '../src/providers/Providers';
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
