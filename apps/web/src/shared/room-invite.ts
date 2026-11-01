/** Read the invite capability without navigating to or fetching the pasted URL. */
export function roomInvite(value: string) {
  const input = value.trim();
  if (/^[A-Za-z0-9_-]{8,128}$/.test(input)) return input;
  try {
    const url = new URL(input, 'https://games.invalid');
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error();
    const match = /^\/join\/([^/]+)\/?$/.exec(url.pathname);
    const token = match ? decodeURIComponent(match[1]) : '';
    if (/^[A-Za-z0-9_-]{8,128}$/.test(token)) return token;
  } catch {
    // The input stays in the field; never echo a private invite into an error.
  }
  throw new Error('Enter a room code or invite link.');
}
