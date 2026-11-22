'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wordmark } from '@games/ui';
import { passiveApi } from '@/lib/session';
import { roomPath } from '@/shared/game-paths';
import { roomInvite } from '@/shared/room-invite';
import { Join } from './Join';

/** Where a member's short link leads: their table, or the old room address as a fallback. */
export function shortLinkDestination(room: { id: string; gameId: string }) {
  try {
    return roomPath(room);
  } catch {
    return `/rooms/${encodeURIComponent(room.id)}`;
  }
}

/**
 * Ask whether this visitor is already in the room behind `code`. Someone with no
 * session, or in no room at all, cannot be a member, so the server is not asked:
 * a lookup that misses counts toward its wrong-code limit, and a friend opening
 * an invitation must never use up their attempts before they join.
 */
export async function findOwnRoom(
  code: string,
  client: Pick<typeof passiveApi, 'me' | 'lookup'> = passiveApi,
) {
  try {
    const invite = roomInvite(code);
    const me = await client.me();
    if (!me.rooms.length) return null;
    return await client.lookup(invite);
  } catch {
    // Not signed in, not a member, a mistyped code or no network: offer to join.
    return null;
  }
}

/**
 * `/r/<code>`: someone already in the room goes straight to their table; everyone
 * else sees the join screen with the code filled in. The lookup never creates a
 * guest, answers only for a member, and runs at most once each time the page opens.
 */
export function ShortRoomLink({ code }: { code: string }) {
  const router = useRouter();
  // Development remounts effects; the ref keeps that to a single question.
  const asked = useRef(false);
  const [answer, setAnswer] = useState<'checking' | 'join' | 'member'>('checking');
  useEffect(() => {
    if (asked.current) return;
    asked.current = true;
    void findOwnRoom(code).then((room) => {
      if (!room) return setAnswer('join');
      setAnswer('member');
      router.replace(shortLinkDestination(room));
    });
  }, [code, router]);
  if (answer !== 'join')
    return (
      <main className="center-state">
        <Link href="/">
          <Wordmark />
        </Link>
        <h1 className="heading-md" role="status">
          Opening your room…
        </h1>
      </main>
    );
  return <Join invite={code} />;
}
