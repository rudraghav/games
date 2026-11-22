import { Check, Lock, Ticket as TicketIcon } from 'lucide-react';
import type { Reward } from '@games/api-client';
import { Avatar, Button, PlayingCard, Ticket } from '@games/ui';

export type RewardAction = 'redeem' | 'use' | 'remove';

/** What each state is called on the coupon. */
export function rewardStateLabel(reward: Pick<Reward, 'state' | 'equipped'>) {
  if (reward.state === 'locked') return 'Locked';
  if (reward.state === 'available') return 'Ready to redeem';
  return reward.equipped ? 'In use' : 'Redeemed';
}

/** The button that puts a worn reward away: a frame comes off, a card back returns to standard. */
export function removeLabel(kind: Reward['kind']) {
  return kind === 'frame' ? 'Take off' : 'Use standard back';
}

/**
 * One reward as a coupon. The stub shows the cosmetic itself; the body says what
 * it is, where it stands, and offers the one next step: nothing while locked,
 * Redeem once earned, then Use, then a way to put it away again.
 */
export function RewardCoupon({
  reward,
  player,
  busy,
  disabled = false,
  error,
  justRedeemed = false,
  onAction,
}: {
  reward: Reward;
  /** Whose avatar the frame previews are drawn on. */
  player: { name: string; avatar: number };
  /** The action in flight on this coupon, if any. */
  busy?: RewardAction | null;
  /** Another coupon is being changed, so this one waits. */
  disabled?: boolean;
  /** The server's words when it refused the last action on this coupon. */
  error?: string;
  /** Plays the short tear once, right after a successful redeem. */
  justRedeemed?: boolean;
  onAction: (action: RewardAction) => void;
}) {
  const locked = reward.state === 'locked';
  const redeemed = reward.state === 'redeemed';
  const StateIcon = locked ? Lock : redeemed ? Check : TicketIcon;
  return (
    <Ticket
      as="li"
      className="reward-coupon"
      layout="row"
      stubSide="start"
      variant={locked ? 'muted' : redeemed ? 'success' : 'default'}
      data-state={reward.state}
      data-equipped={reward.equipped || undefined}
      data-just-redeemed={justRedeemed || undefined}
      stubClassName="reward-preview"
      stub={
        // The name is written beside it, so the picture itself is decoration.
        <span
          aria-hidden="true"
          data-card-back={reward.kind === 'card_back' ? reward.id : undefined}
        >
          {reward.kind === 'frame' ? (
            <Avatar name={player.name} seed={player.avatar} size="lg" frame={reward.id} />
          ) : (
            <PlayingCard faceDown compact />
          )}
        </span>
      }
    >
      <div className="reward-copy">
        <h4>{reward.name}</h4>
        <p className="reward-state">
          <StateIcon size={14} aria-hidden="true" />
          {rewardStateLabel(reward)}
        </p>
        {locked ? (
          <>
            <p className="reward-requirement">{reward.requirement}</p>
            <span className="badge-progress">
              <progress
                value={reward.value}
                max={reward.goal}
                aria-label={`${reward.name} progress`}
              />
              <span>
                {reward.value} of {reward.goal}
              </span>
            </span>
          </>
        ) : !redeemed ? (
          // Already met; the server's own sentence says what earned it.
          <p className="reward-requirement">{reward.requirement}</p>
        ) : null}
      </div>
      {locked ? null : (
        <div className="reward-actions">
          {reward.state === 'available' ? (
            <Button
              aria-label={`Redeem ${reward.name}`}
              pending={busy === 'redeem'}
              disabled={disabled || Boolean(busy)}
              onClick={() => onAction('redeem')}
            >
              Redeem
            </Button>
          ) : reward.equipped ? (
            <Button
              variant="secondary"
              aria-label={`${removeLabel(reward.kind)}: ${reward.name}`}
              pending={busy === 'remove'}
              disabled={disabled || Boolean(busy)}
              onClick={() => onAction('remove')}
            >
              {removeLabel(reward.kind)}
            </Button>
          ) : (
            <Button
              aria-label={`Use ${reward.name}`}
              pending={busy === 'use'}
              disabled={disabled || Boolean(busy)}
              onClick={() => onAction('use')}
            >
              Use
            </Button>
          )}
        </div>
      )}
      {error ? (
        <p className="error-note reward-error" role="alert">
          {error}
        </p>
      ) : null}
    </Ticket>
  );
}
