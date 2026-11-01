import { Check, MessageCircle, Sparkles } from 'lucide-react';

/** Original, decorative prompt-card compositions for the party catalogue. */
export function PartyArtwork({ gameId }: { gameId: string }) {
  const mode = gameId === 'most-likely' ? 'vote' : gameId === 'hot-seat' ? 'predict' : 'spill';
  return (
    <div className="game-art party-artwork" data-party-art={mode} aria-hidden="true">
      <div className="party-artwork__card party-artwork__card--back">
        <Sparkles />
        <span className="party-artwork__lines">
          <i />
          <i />
          <i />
        </span>
      </div>
      <div className="party-artwork__card party-artwork__card--front">
        {mode === 'spill' ? (
          <>
            <MessageCircle className="party-artwork__symbol" strokeWidth={1.5} />
            <strong className="party-artwork__question">?</strong>
            <span className="party-artwork__answer-lines">
              <i />
              <i />
            </span>
          </>
        ) : mode === 'vote' ? (
          <>
            <div className="party-artwork__votes">
              <span />
              <span />
              <span />
            </div>
            <strong className="party-artwork__question">
              <Check />
            </strong>
            <span className="party-artwork__ballot">
              <span />
              <span />
              <span />
            </span>
          </>
        ) : (
          <>
            <Sparkles className="party-artwork__symbol" />
            <div className="party-artwork__ab">
              <b>A</b>
              <i>or</i>
              <b>B</b>
            </div>
            <span className="party-artwork__answer-lines">
              <i />
              <i />
            </span>
          </>
        )}
      </div>
      <span className="party-artwork__spark">✳</span>
    </div>
  );
}
