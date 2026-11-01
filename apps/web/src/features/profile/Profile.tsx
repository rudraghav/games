'use client';
import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Avatar, Button } from '@games/ui';
import { gameById } from '@games/api-client/catalog';
import { api } from '@/lib/session';
import type { AccountNotice } from '@/lib/account-auth';
import { SiteHeader } from '@/shared/SiteHeader';
import { keys } from '@/shared/query-keys';
import { rememberPlayer } from '@/shared/player-preferences';
import { AccountSection } from './AccountSection';
import { historyResult } from './history-result';

export function ProfileScreen({ confirmation }: { confirmation?: AccountNotice }) {
  const cache = useQueryClient();
  const me = useQuery({ queryKey: keys.me, queryFn: () => api.me() });
  const [name, setName] = useState<string>();
  const [avatar, setAvatar] = useState<number>();
  const [notice, setNotice] = useState('');
  const displayName = name ?? me.data?.profile?.name ?? '';
  const chosenAvatar = avatar ?? me.data?.profile?.avatar ?? 0;
  const save = useMutation({
    mutationFn: () => api.profile(displayName.trim(), chosenAvatar),
    onSuccess: () => {
      rememberPlayer(displayName.trim(), chosenAvatar);
      void cache.invalidateQueries({ queryKey: keys.me });
      setNotice('Looking good. Your profile is saved.');
    },
  });
  function submit(event: FormEvent) {
    event.preventDefault();
    setNotice('');
    save.mutate();
  }
  return (
    <>
      <SiteHeader />
      <main className="profile-page page-width">
        <div className="profile-intro">
          <p className="eyebrow">Your corner of the lounge</p>
          <h1 className="hero-title">A familiar face.</h1>
          <p className="muted">A name, a little personality, and the games you’ve shared.</p>
        </div>
        {me.isPending ? (
          <p className="muted">Finding your player…</p>
        ) : me.error ? (
          <p className="error-note" role="alert">
            {me.error.message}
          </p>
        ) : (
          <div className="profile-grid">
            <section className="profile-card">
              <h2 className="heading-md">Make it yours.</h2>
              <form onSubmit={submit}>
                <label className="field">
                  Your name
                  <input
                    className="input"
                    value={displayName}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={30}
                    required
                    autoComplete="nickname"
                  />
                </label>
                <div className="avatar-options" role="group" aria-label="Your avatar colour">
                  {Array.from({ length: 8 }, (_, i) => (
                    <button
                      className="avatar-option"
                      type="button"
                      key={i}
                      aria-label={`Avatar colour ${i + 1}`}
                      aria-pressed={chosenAvatar === i}
                      onClick={() => setAvatar(i)}
                    >
                      <Avatar name={displayName || 'You'} seed={i} />
                    </button>
                  ))}
                </div>
                <Button type="submit" pending={save.isPending}>
                  Save profile
                </Button>
              </form>
              <AccountSection
                anonymous={me.data?.anonymous ?? true}
                preserveGuest={Boolean(me.data?.profile)}
                confirmation={confirmation}
              />
              {notice ? (
                <p className="small profile-notice" role="status">
                  {notice}
                </p>
              ) : null}
              {save.error ? (
                <p className="error-note" role="alert">
                  {save.error.message}
                </p>
              ) : null}
            </section>
            <section className="profile-card">
              <h2 className="heading-md">One for the memories.</h2>
              <div className="match-history">
                {me.data?.history.length ? (
                  me.data.history.map((match) => (
                    <Link className="history-row" key={match.id} href={`/rooms/${match.roomId}`}>
                      <div>
                        <strong>{gameById(match.gameId).name}</strong>
                        <span className="small muted">
                          {new Intl.DateTimeFormat('en', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          }).format(new Date(match.createdAt * 1000))}
                        </span>
                      </div>
                      <span>
                        {historyResult(
                          gameById(match.gameId),
                          match.score,
                          match.winners.includes(me.data.profile?.id || ''),
                        )}
                      </span>
                    </Link>
                  ))
                ) : (
                  <div className="history-empty">
                    <span>✳</span>
                    <h3>Your next good story starts here.</h3>
                    <p className="small muted">
                      Finish a game or a Tarot reading and it’ll find a home here.
                    </p>
                    <Link href="/" className="button button--secondary button--md">
                      Find your game
                    </Link>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
