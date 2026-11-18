import { SavedReadingScreen } from '@/features/reading/SavedReading';

export default async function Page({ params }: { params: Promise<{ matchId: string }> }) {
  // The shared screen moves an authorized saved reading to its named canonical route.
  return <SavedReadingScreen matchId={(await params).matchId} />;
}
