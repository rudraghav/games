import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { games } from '@games/api-client/catalog';
import { GameEntry } from '@/features/game-entry/GameEntry';
import { gamePath } from '@/shared/game-paths';

type Props = {
  params: Promise<{ gameId: string }>;
  searchParams: Promise<{ mode?: string | string[] }>;
};

export function generateStaticParams() {
  return games.map((game) => ({ gameId: game.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { gameId } = await params;
  const game = games.find((entry) => entry.id === gameId);
  if (!game) notFound();
  return {
    title: `${game.name} · Games`,
    description: game.subtitle,
    alternates: { canonical: gamePath(game.id) },
  };
}

export default async function Page({ params, searchParams }: Props) {
  const { gameId } = await params;
  const game = games.find((entry) => entry.id === gameId);
  if (!game) notFound();
  const { mode } = await searchParams;
  return (
    <GameEntry key={game.id} game={game} preferredMode={mode === 'bots' ? 'bots' : 'friends'} />
  );
}
