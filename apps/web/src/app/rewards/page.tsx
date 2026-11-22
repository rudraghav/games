import type { Metadata } from 'next';
import { RewardsScreen } from '@/features/rewards/Rewards';

export const metadata: Metadata = { title: 'Progress and rewards · Games' };

export default function RewardsPage() {
  return <RewardsScreen />;
}
