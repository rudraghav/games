import { RoomScreen } from '@/features/room/Room';

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tutorial?: string | string[] }>;
}) {
  const [{ id }, { tutorial }] = await Promise.all([params, searchParams]);
  return (
    <RoomScreen id={id} tutorialMatchId={typeof tutorial === 'string' ? tutorial : undefined} />
  );
}
