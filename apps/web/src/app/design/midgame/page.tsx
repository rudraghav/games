import { notFound } from 'next/navigation';
import { MidgameWorkspaceReview } from '@/features/design/MidgameWorkspaceReview';

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <MidgameWorkspaceReview />;
}
