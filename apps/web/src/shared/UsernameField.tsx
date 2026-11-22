'use client';
import { useId, useState, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Me, Profile } from '@games/api-client';
import { Button } from '@games/ui';
import { api } from '@/lib/session';
import { keys } from './query-keys';
import { typedUsername, usernameProblem, USERNAME_RULE } from './username';

/**
 * Choose, change or remove the handle friends search for. The @ is decoration;
 * only the lowercase handle is sent, and the server's own words explain a refusal.
 */
export function UsernameField({
  username,
  unavailable,
}: {
  username: string | null;
  /** Why a handle cannot be chosen yet, for example before a profile exists. */
  unavailable?: string;
}) {
  const id = useId();
  const cache = useQueryClient();
  const [draft, setDraft] = useState<string>();
  const [busy, setBusy] = useState<'save' | 'remove' | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const value = draft ?? username ?? '';
  function store(profile: Profile) {
    cache.setQueryData<Me>(keys.me, (me) => (me ? { ...me, profile } : me));
    void cache.invalidateQueries({ queryKey: keys.me, exact: true });
  }
  async function run(kind: 'save' | 'remove') {
    setError('');
    setNotice('');
    const problem = kind === 'save' ? usernameProblem(value) : null;
    if (problem) return setError(problem);
    setBusy(kind);
    try {
      const profile = kind === 'save' ? await api.setUsername(value) : await api.clearUsername();
      store(profile);
      setDraft(undefined);
      setNotice(
        profile.username
          ? `Saved. Friends can find you as @${profile.username}.`
          : 'Username removed. Friends can no longer find you by it.',
      );
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Please try again.');
    } finally {
      setBusy(null);
    }
  }
  return (
    <form
      className="username-form"
      onSubmit={(event: FormEvent) => {
        event.preventDefault();
        void run('save');
      }}
    >
      <label className="field" htmlFor={`${id}-input`}>
        Username
      </label>
      <div className="username-input">
        <span aria-hidden="true">@</span>
        <input
          id={`${id}-input`}
          className="input"
          value={value}
          onChange={(event) => {
            setDraft(typedUsername(event.target.value));
            setError('');
            setNotice('');
          }}
          placeholder="yourname"
          maxLength={21}
          disabled={Boolean(unavailable)}
          autoComplete="off"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-describedby={`${id}-rule`}
          aria-invalid={error ? true : undefined}
        />
      </div>
      <p className="small muted" id={`${id}-rule`}>
        {unavailable ||
          `${USERNAME_RULE[0].toUpperCase()}${USERNAME_RULE.slice(1)}. Friends use it to invite you.`}
      </p>
      <div className="username-actions">
        <Button
          type="submit"
          size="sm"
          pending={busy === 'save'}
          disabled={Boolean(unavailable) || busy !== null || !value || value === username}
        >
          Save username
        </Button>
        {username ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            pending={busy === 'remove'}
            disabled={busy !== null}
            onClick={() => void run('remove')}
          >
            Remove username
          </Button>
        ) : null}
      </div>
      {notice ? (
        <p className="small username-status" role="status">
          {notice}
        </p>
      ) : null}
      {error ? (
        <p className="error-note" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
