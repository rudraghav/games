import { SavedReadingScreen } from '@/features/reading/SavedReading';

export default async function Page({ params }: { params: Promise<{ matchId: string }> }) {
  return <SavedReadingScreen matchId={(await params).matchId} />;
}
