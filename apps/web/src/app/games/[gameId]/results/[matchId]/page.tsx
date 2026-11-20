import { notFound } from 'next/navigation';
import { SavedChanceSession } from '@/features/profile/SavedChanceSession';

export default async function Page({
  params,
}: {
  params: Promise<{ gameId: string; matchId: string }>;
}) {
  const { gameId, matchId } = await params;
  if (gameId !== 'roulette' && gameId !== 'slots') notFound();
  return <SavedChanceSession gameId={gameId} matchId={matchId} />;
}
