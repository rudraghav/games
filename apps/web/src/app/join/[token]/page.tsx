import { Join } from '@/features/room/Join';
export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  return <Join invite={(await params).token} />;
}
