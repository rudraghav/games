const TOKEN = /^[A-Za-z0-9_-]{8,128}$/;
const SHORT_CODE = /^\d{3}[\s-]?\d{3}$/;

function capability(value: string) {
  // New rooms have six digits, read aloud as "482 913" and typed any way.
  if (SHORT_CODE.test(value)) return value.replace(/\D/g, '');
  // Older rooms keep their 8-character code; long invite tokens pass unchanged.
  return TOKEN.test(value) ? value : '';
}

/** Read the invite capability without navigating to or fetching the pasted URL. */
export function roomInvite(value: string) {
  const input = value.trim();
  const direct = capability(input);
  if (direct) return direct;
  try {
    const url = new URL(input, 'https://games.invalid');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    const match = /^\/(?:r|join)\/([^/]+)\/?$/.exec(url.pathname);
    const shared = match ? capability(decodeURIComponent(match[1])) : '';
    if (shared) return shared;
  } catch {
    // The input stays in the field; never echo a private invite into an error.
  }
  throw new Error('Enter a room code or invite link.');
}

/** A six-digit code in two groups for reading aloud; an older code as it is. */
export function groupRoomCode(code: string) {
  return /^\d{6}$/.test(code) ? `${code.slice(0, 3)} ${code.slice(3)}` : code;
}

/**
 * Group digits while a code is being typed ("482 913"). Anything that is not
 * plainly a short code (a pasted link, an older code with letters) is left alone.
 */
export function formatInviteInput(value: string) {
  if (!/^[\d\s-]*$/.test(value)) return value;
  const digits = value.replace(/\D/g, '');
  if (digits.length > 6) return value;
  return digits.length > 3 ? `${digits.slice(0, 3)} ${digits.slice(3)}` : digits;
}

/** The short address friends open: `<origin>/r/<code>`. The code is the only secret in it. */
export function roomShortPath(code: string) {
  return `/r/${encodeURIComponent(code)}`;
}

/** What a friend reads in a shared message. */
export function roomShareText(gameName: string, code: string) {
  return `Join my ${gameName} room, code ${groupRoomCode(code)}`;
}
