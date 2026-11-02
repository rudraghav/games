import { notFound } from 'next/navigation';
import { DealWorkspaceReview } from '@/features/design/DealWorkspaceReview';

export default function Page() {
  if (process.env.NODE_ENV === 'production') notFound();
  return <DealWorkspaceReview />;
}
