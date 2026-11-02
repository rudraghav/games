import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { Me } from '@games/api-client';
import { Button } from '@games/ui';
import { RoomDialog } from '@/shared/RoomDialog';
import { keys } from '@/shared/query-keys';

const player: Me = {
  profile: { id: '00000000-0000-4000-8000-000000000001', name: 'Jamie', avatar: 3 },
  anonymous: true,
  rooms: [],
  history: [],
};

function RoomSetupPreview({
  mode = 'create',
  withBots = false,
}: {
  mode?: 'create' | 'join' | 'configure';
  withBots?: boolean;
}) {
  const [open, setOpen] = useState(true);
  const [client] = useState(() => {
    const cache = new QueryClient({
      defaultOptions: {
        queries: { staleTime: Infinity, refetchOnWindowFocus: false, retry: false },
        mutations: { retry: false },
      },
    });
    cache.setQueryData(keys.me, player);
    return cache;
  });
  return (
    <QueryClientProvider client={client}>
      <div
        onSubmitCapture={(event) => {
          // Portal events still reach this boundary; stories never create or join rooms.
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <Button onClick={() => setOpen(true)}>Open setup</Button>
        <RoomDialog
          key={`${mode}:${withBots}`}
          open={open}
          onOpenChange={setOpen}
          mode={mode}
          gameId="uno"
          withBots={withBots}
          roomId="00000000-0000-4000-8000-000000000002"
        />
      </div>
    </QueryClientProvider>
  );
}

const meta = {
  title: 'Rooms/Setup',
  component: RoomSetupPreview,
  parameters: {
    nextjs: { appDirectory: true },
    docs: { description: { component: 'Synthetic profile. Room submission is disabled.' } },
  },
} satisfies Meta<typeof RoomSetupPreview>;
export default meta;
type Story = StoryObj<typeof meta>;
export const CreateFriends: Story = {};
export const CreateBots: Story = { args: { withBots: true } };
export const Join: Story = { args: { mode: 'join' } };
export const Configure: Story = { args: { mode: 'configure' } };
