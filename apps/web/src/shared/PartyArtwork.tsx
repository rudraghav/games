import { Check, MessageCircle, Sparkles } from 'lucide-react';

/** Original, decorative prompt-card compositions for the party catalogue. */
export function PartyArtwork({ gameId }: { gameId: string }) {
  const mode = gameId === 'most-likely' ? 'vote' : gameId === 'hot-seat' ? 'predict' : 'spill';
  return (
    <div className="game-art party-artwork" data-party-art={mode} aria-hidden="true">
      <div className="party-artwork__card party-artwork__card--back">
        <Sparkles />
        <span>
          {mode === 'vote'
            ? 'The room has spoken.'
            : mode === 'predict'
              ? 'You know me. Right?'
              : 'A little plot twist.'}
        </span>
      </div>
      <div className="party-artwork__card party-artwork__card--front">
        {mode === 'spill' ? (
          <>
            <MessageCircle className="party-artwork__symbol" strokeWidth={1.5} />
            <strong>
              Tell us
              <br />
              everything.
            </strong>
            <small>or absolutely nothing.</small>
          </>
        ) : mode === 'vote' ? (
          <>
            <div className="party-artwork__votes">
              <span />
              <span />
              <span />
            </div>
            <strong>
              Who’s the
              <br />
              plot twist?
            </strong>
            <span className="party-artwork__ballot">
              <Check size={15} strokeWidth={3} /> Your vote. Their reputation.
            </span>
          </>
        ) : (
          <>
            <small>Trust your gut.</small>
            <div className="party-artwork__ab">
              <b>A</b>
              <i>or</i>
              <b>B</b>
            </div>
            <strong>
              Read your
              <br />
              people.
            </strong>
          </>
        )}
      </div>
      <span className="party-artwork__spark">✳</span>
    </div>
  );
}
