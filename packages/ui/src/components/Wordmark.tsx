import { Diamond } from 'lucide-react';
export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="brand-mark">
        <Diamond size={22} strokeWidth={2.5} />
      </span>
      games<span className="brand-period">.</span>
    </span>
  );
}
