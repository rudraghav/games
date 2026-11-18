import { RoomScreen } from '@/features/room/Room';

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string; id: string }>;
}) {
  // The member-authorized response, not this URL's slug, chooses the table.
  return <RoomScreen id={(await params).id} />;
}
