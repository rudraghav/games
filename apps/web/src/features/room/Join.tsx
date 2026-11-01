'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wordmark } from '@games/ui';
import { RoomDialog } from '@/shared/RoomDialog';
export function Join({ invite }: { invite: string }) {
  const router = useRouter();
  return (
    <main className="center-state">
      <Link href="/">
        <Wordmark />
      </Link>
      <h1 className="heading-md">There’s a seat for you.</h1>
      <RoomDialog
        open
        mode="join"
        invite={invite}
        onOpenChange={(open) => {
          if (!open) router.push('/');
        }}
      />
    </main>
  );
}
