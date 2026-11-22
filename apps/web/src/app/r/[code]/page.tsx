import { ShortRoomLink } from '@/features/room/ShortRoomLink';
export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  return <ShortRoomLink code={(await params).code} />;
}
