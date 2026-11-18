import { LoaderCircle } from 'lucide-react';
import type { ReadingView } from '@games/api-client';

type Progress = NonNullable<ReadingView['progress']>;

const stages: Record<Progress['stage'], string> = {
  preparing: 'Preparing your spread.',
  matching: 'Finding character connections.',
  writing: 'Writing your reading.',
  retrying: 'Retrying your reading.',
  checking: 'Checking your reading.',
  saving: 'Saving your reading.',
};

export function remainingEstimate(seconds: number | null) {
  if (seconds === null) return 'Taking longer than expected…';
  const rounded = Math.max(5, Math.ceil(seconds / 5) * 5);
  return rounded < 60
    ? `About ${rounded} sec remaining`
    : `About ${Math.ceil(rounded / 60)} min remaining`;
}

/** Stages come from the saved attempt. Numbers are estimates, never model token counts. */
export function ReadingProgress({
  progress,
  recovering = false,
}: {
  progress?: Progress;
  recovering?: boolean;
}) {
  const current = recovering ? undefined : progress;
  const message = recovering
    ? 'Checking your saved reading.'
    : current?.stage === 'retrying' && current.provider
      ? `Retrying with ${current.provider}.`
      : current
        ? stages[current.stage]
        : 'Starting your reading.';
  // A running attempt must never claim completion, even with an invalid estimate.
  const percent = current ? Math.max(0, Math.min(99, current.estimatedPercent)) : undefined;
  const remaining = current ? remainingEstimate(current.estimatedSecondsRemaining) : null;

  return (
    <section className="tarot-generation-progress" aria-label="Reading progress">
      <LoaderCircle className="spin" size={26} aria-hidden="true" />
      <p role="status" aria-live="polite" aria-atomic="true">
        {message}
      </p>
      <div
        className="tarot-generation-meter"
        role="progressbar"
        aria-label="Estimated reading progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={
          percent === undefined ? message : `${message} ${percent}% estimated. ${remaining}`
        }
        data-indeterminate={percent === undefined || undefined}
      >
        <span style={{ width: percent === undefined ? '100%' : `${percent}%` }} />
      </div>
      {percent !== undefined ? (
        <p className="tarot-generation-estimate">
          <span>{percent}% estimated</span>
          <span>{remaining}</span>
        </p>
      ) : (
        <p className="small muted">
          {recovering ? 'Your cards stay saved.' : 'Waiting for the reading service.'}
        </p>
      )}
    </section>
  );
}
