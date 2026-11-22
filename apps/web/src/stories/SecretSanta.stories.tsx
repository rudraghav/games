import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mapRoom } from '@games/api-client/mappers';
import { SecretSantaTable } from '@/games/secret-santa/SecretSantaTable';
import { santaLinksKey } from '@/games/secret-santa/SantaLinks';
import { SantaLinkView, type SantaLinkState } from '@/features/santa-link/SantaLinkView';
import { santaFixtures, santaOrganiserId } from './fixtures/secret-santa';

/** Hand-made organiser states. Moves are recorded below the table, never sent. */
function OrganiserPreview({
  scenario = 0,
  pending = false,
  disconnected = false,
}: {
  scenario?: number;
  pending?: boolean;
  disconnected?: boolean;
}) {
  const room = mapRoom(santaFixtures[scenario].room);
  const [sent, setSent] = useState<string[]>([]);
  const [client] = useState(() => {
    const cache = new QueryClient({
      defaultOptions: { queries: { staleTime: Infinity, retry: false } },
    });
    // Placeholder links: this preview never asks a server for real ones.
    const detail = room.game!.detail as { people: { id: string; name: string }[] };
    cache.setQueryDefaults(santaLinksKey(room.id, room.matchId, 1), {
      initialData: detail.people.map((person) => ({
        ...person,
        token: `preview-only-link-${person.id.padStart(8, '0')}`,
      })),
    });
    return cache;
  });
  return (
    <QueryClientProvider client={client}>
      <main style={{ maxWidth: 1100, margin: 'auto', padding: 16 }}>
        <SecretSantaTable
          room={{ ...room, paused: disconnected }}
          match={room.game!}
          selfId={santaOrganiserId}
          pending={pending}
          onAction={(action) => setSent((before) => [...before, JSON.stringify(action)])}
        />
        <output aria-label="Recorded moves" style={{ display: 'block', fontSize: 12 }}>
          {sent.join('\n')}
        </output>
      </main>
    </QueryClientProvider>
  );
}

const meta = {
  title: 'Games/Secret Santa',
  component: OrganiserPreview,
  argTypes: {
    scenario: {
      control: 'select',
      options: santaFixtures.map((_, index) => index),
      labels: Object.fromEntries(santaFixtures.map((fixture, index) => [index, fixture.label])),
    },
  },
} satisfies Meta<typeof OrganiserPreview>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Empty: Story = { args: { scenario: 0 } };
export const DrawBlocked: Story = { args: { scenario: 1 } };
export const ImpossibleRules: Story = { args: { scenario: 2 } };
export const ReadyToDraw: Story = { args: { scenario: 3 } };
export const Drawn: Story = { args: { scenario: 4 } };
export const PassThePhone: Story = { args: { scenario: 5 } };
export const BackAtTheList: Story = { args: { scenario: 6 } };
export const Finished: Story = { args: { scenario: 7 } };
export const Saving: Story = { args: { scenario: 3, pending: true } };
export const Disconnected: Story = { args: { scenario: 4, disconnected: true } };

const reveal = {
  title: 'Office party',
  day: 2544,
  location: 'The canteen, third floor',
  budget: 'Around 10 each',
  giverName: 'Sam',
  recipientName: 'Priya',
};
function LinkPreview({ state }: { state: SantaLinkState }) {
  const [shown, setShown] = useState(false);
  return (
    <SantaLinkView
      state={state}
      shown={shown}
      onShow={() => setShown(true)}
      onHide={() => setShown(false)}
      onRetry={() => undefined}
    />
  );
}
export const PrivateLink: Story = {
  render: () => <LinkPreview state={{ kind: 'ready', reveal }} />,
};
export const PrivateLinkOutdated: Story = {
  render: () => <LinkPreview state={{ kind: 'invalid' }} />,
};
export const PrivateLinkLimited: Story = {
  render: () => <LinkPreview state={{ kind: 'limited' }} />,
};
export const PrivateLinkOffline: Story = {
  render: () => <LinkPreview state={{ kind: 'failed' }} />,
};
