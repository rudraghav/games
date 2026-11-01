import { RoomScreen } from '@/features/room/Room';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  return <RoomScreen id={(await params).id} />;
}
