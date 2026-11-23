import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { mapProgress, frameIds, cardBackIds } from '@games/api-client';
import { Avatar, Button, LevelRing, PlayingCard, Ticket } from '@games/ui';
import { ProgressChipView } from '@/shared/ProgressChip';
import { RewardsView } from '@/features/rewards/Rewards';
import { ResultsProgressView } from '@/features/room/ResultsProgress';

const noop = () => undefined;
const player = { name: 'Maya Rao', avatar: 2 };
const progress = mapProgress({
  xp: 190,
  level: 3,
  level_xp: 150,
  next_level_xp: 300,
  streak: { current: 4, best: 6, played_today: false },
  totals: { games: 12, wins: 5, different_games: 4, with_friends: 6 },
  badges: [
    {
      id: 'first-game',
      name: 'First game',
      description: 'Finish your first game',
      earned: true,
      value: 1,
      goal: 1,
    },
    {
      id: 'regular',
      name: 'Regular',
      description: 'Finish 10 games',
      earned: true,
      value: 10,
      goal: 10,
    },
    {
      id: 'veteran',
      name: 'Veteran',
      description: 'Finish 50 games',
      earned: false,
      value: 12,
      goal: 50,
    },
    {
      id: 'streak-7',
      name: 'Full week',
      description: 'Play 7 days in a row',
      earned: false,
      value: 6,
      goal: 7,
    },
  ],
  rewards: [
    {
      id: 'frame-gold',
      kind: 'frame',
      name: 'Gold frame',
      requirement: 'Reach level 2',
      state: 'redeemed',
      equipped: true,
      value: 2,
      goal: 2,
    },
    {
      id: 'frame-flame',
      kind: 'frame',
      name: 'Flame frame',
      requirement: 'Earn the Three in a row badge',
      state: 'available',
      equipped: false,
      value: 3,
      goal: 3,
    },
    {
      id: 'frame-crown',
      kind: 'frame',
      name: 'Crown frame',
      requirement: 'Reach level 8',
      state: 'locked',
      equipped: false,
      value: 3,
      goal: 8,
    },
    {
      id: 'back-midnight',
      kind: 'card_back',
      name: 'Midnight card back',
      requirement: 'Reach level 3',
      state: 'redeemed',
      equipped: false,
      value: 3,
      goal: 3,
    },
    {
      id: 'back-royal',
      kind: 'card_back',
      name: 'Royal card back',
      requirement: 'Reach level 6',
      state: 'locked',
      equipped: false,
      value: 3,
      goal: 6,
    },
  ],
});

const meta = { title: 'Rewards/Progress and rewards' } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Tickets: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 18, maxWidth: 560 }}>
      {(['default', 'success', 'muted'] as const).map((variant) => (
        <Ticket key={variant} variant={variant} stub={<Button size="sm">Action</Button>}>
          <strong>{variant}</strong>
          <p className="small muted">A body and a stub joined by a tear line.</p>
        </Ticket>
      ))}
      <Ticket shape="tag" layout="row" stub={<Button size="sm">Copy link</Button>}>
        <strong>Gift tag</strong>
      </Ticket>
      <div style={{ padding: 20, borderRadius: 16, background: 'var(--color-pine)' }}>
        <Ticket layout="row" stubSide="start" stub={<strong>482 913</strong>}>
          On a dark surface the notches show the felt behind.
        </Ticket>
      </div>
      <Ticket>One piece, no stub.</Ticket>
    </div>
  ),
};

export const AvatarFrames: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 24 }}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} style={{ display: 'flex', gap: 30, alignItems: 'center' }}>
          {[...frameIds, 'unknown-frame'].map((frame, index) => (
            <Avatar key={frame} name="Maya Rao" seed={index} size={size} frame={frame} />
          ))}
        </div>
      ))}
    </div>
  ),
};

export const CardBacks: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 18, alignItems: 'end' }}>
      {[undefined, ...cardBackIds].map((back) => (
        <span key={back ?? 'standard'} data-card-back={back} style={{ display: 'flex', gap: 8 }}>
          <PlayingCard faceDown label={back ?? 'Standard back'} />
          <PlayingCard faceDown compact label={`${back ?? 'Standard back'}, compact`} />
        </span>
      ))}
    </div>
  ),
};

export const LevelRings: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <LevelRing level={1} fraction={0} size="sm" label="Level 1, 0 of 50 XP toward level 2" />
      <LevelRing level={3} fraction={0.27} label="Level 3, 40 of 150 XP toward level 4" />
      <LevelRing level={12} fraction={0.9} size="lg" label="Level 12, nearly level 13" />
    </div>
  ),
};

export const HeaderChipAndResultLine: Story = {
  render: () => (
    <div style={{ display: 'grid', gap: 14, maxWidth: 900, justifyItems: 'start' }}>
      <ProgressChipView progress={progress} />
      <ResultsProgressView progress={progress} />
      <ResultsProgressView loading />
    </div>
  ),
};

export const RewardsPage: Story = {
  render: () => (
    <div className="rewards-page" style={{ maxWidth: 1100 }}>
      <RewardsView
        progress={progress}
        player={player}
        notice="Gold frame redeemed. It’s yours to use."
        failure={{
          id: 'frame-crown',
          message: 'Crown frame is not earned yet. Reach level 8 first.',
        }}
        onAction={noop}
      />
    </div>
  ),
};
