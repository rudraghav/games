import { RoomScreen } from '@/features/room/Room';
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  // Keep old links working; RoomScreen resolves the game only after membership is checked.
  return <RoomScreen id={(await params).id} />;
}
