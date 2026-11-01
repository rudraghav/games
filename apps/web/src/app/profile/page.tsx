import { ProfileScreen } from '@/features/profile/Profile';
import { accountNotice } from '@/lib/account-auth';
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ confirmation?: string }>;
}) {
  return <ProfileScreen confirmation={accountNotice((await searchParams).confirmation)} />;
}
