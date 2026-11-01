import { ArrowRight, Check, Clock3, LoaderCircle, Pause } from 'lucide-react';

export interface TurnNoticeProps {
  label: string;
  message: string;
  tone: 'active' | 'waiting' | 'paused' | 'complete';
  pending?: boolean;
}

/** A compact, shared summary of who can act and the last authoritative message. */
export function TurnNotice({ label, message, tone, pending = false }: TurnNoticeProps) {
  const Icon = pending
    ? LoaderCircle
    : tone === 'active'
      ? ArrowRight
      : tone === 'paused'
        ? Pause
        : tone === 'complete'
          ? Check
          : Clock3;
  return (
    <section
      className="table-announcement turn-notice"
      data-tone={tone}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy={pending}
    >
      <span className="turn-notice-icon" aria-hidden="true">
        <Icon size={18} className={pending ? 'turn-notice-spinner' : undefined} />
      </span>
      <div className="turn-notice-main">
        <strong>{label}</strong>
        <p>{message}</p>
      </div>
      {pending ? <span className="turn-notice-saving">Saving…</span> : null}
    </section>
  );
}
