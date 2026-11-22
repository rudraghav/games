import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import type { Invitation, PlayerHit } from '@games/api-client';
import { BotPlayersFields } from '@/shared/BotPlayersFields';
import { botNameProblem, emptyBotRows } from '@/shared/bot-seats';
import { InvitationList } from '@/features/lounge/Invitations';
import { FriendSearchResults, PendingInvites } from '@/features/room/InviteByUsername';

const players: PlayerHit[] = [
  { username: 'sam_plays', name: 'Sam', avatar: 2 },
  { username: 'samira', name: 'Samira K', avatar: 5 },
  { username: 'sammy_the_long_usern', name: 'Sammy with a very long display name', avatar: 6 },
];
const invitation: Invitation = {
  roomId: '11111111-1111-4111-8111-111111111111',
  roomName: 'Friday game night',
  gameId: 'uno',
  fromName: 'Sam',
  fromAvatar: 2,
  players: 2,
  capacity: 4,
  createdAt: 1700000000,
};
const noop = () => undefined;

function BotRows({ count }: { count: number }) {
  const [rows, setRows] = useState(emptyBotRows);
  const shown = rows.slice(0, count);
  return (
    <div style={{ maxWidth: 404 }}>
      <BotPlayersFields
        rows={shown}
        hostName="Jamie"
        problem={botNameProblem(shown, 'Jamie')}
        onChange={(index, change) =>
          setRows((current) =>
            current.map((row, at) => (at === index ? { ...row, ...change } : row)),
          )
        }
      />
    </div>
  );
}

const meta = {
  title: 'Rooms/Bots and invitations',
  component: BotRows,
  args: { count: 3 },
  parameters: {
    docs: { description: { component: 'Synthetic players. Nothing is sent or saved.' } },
  },
} satisfies Meta<typeof BotRows>;
export default meta;
type Story = StoryObj<typeof meta>;

export const BotPlayers: Story = {};
export const OneBot: Story = { args: { count: 1 } };
export const SearchResults: Story = {
  render: () => (
    <div style={{ maxWidth: 420 }}>
      <FriendSearchResults
        term="sa"
        searching={false}
        failed=""
        players={players}
        invited={['samira']}
        ownUsername={null}
        busy={null}
        onInvite={noop}
      />
      <PendingInvites invites={[players[1]]} canCancel={() => true} busy={null} onCancel={noop} />
    </div>
  ),
};
export const SearchStates: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 16, maxWidth: 420 }}>
      {[
        { term: 's' },
        { term: 'sa', searching: true },
        { term: 'qq', players: [] },
        { term: 'sa', failed: 'That’s a lot of searches. Wait a minute, then try again.' },
      ].map((state, index) => (
        <FriendSearchResults
          key={index}
          searching={false}
          failed=""
          players={undefined}
          invited={[]}
          ownUsername={null}
          busy={null}
          onInvite={noop}
          {...state}
        />
      ))}
    </div>
  ),
};
export const HomeInvitations: Story = {
  render: () => (
    <div style={{ maxWidth: 900 }}>
      <InvitationList
        invitations={[
          invitation,
          {
            ...invitation,
            roomId: '22222222-2222-4222-8222-222222222222',
            roomName: 'A very long room name for a weekend of Sea Salt & Paper',
            gameId: 'sea-salt-paper',
            fromName: 'Priya Raghunathan',
            fromAvatar: 4,
          },
        ]}
        onJoin={noop}
        onDecline={noop}
      />
    </div>
  ),
};
