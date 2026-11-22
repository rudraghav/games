export const savedReadingRoute = /^v1\/readings\/[\da-f-]{36}$/;
export const playerSearchRoute = /^v1\/players\/search$/;
/** One person's Secret Santa draw. The token is the whole secret: a single URL-safe segment. */
export const santaRevealRoute = /^v1\/secret-santa\/[A-Za-z0-9_-]{20,120}$/;
const routes: [RegExp, readonly string[]][] = [
  [/^v1\/games$/, ['GET']],
  [/^v1\/games\/[a-z][a-z0-9-]{0,31}\/play$/, ['POST']],
  [/^v1\/me$/, ['GET']],
  [/^v1\/profile$/, ['PUT']],
  [/^v1\/profile\/username$/, ['PUT', 'DELETE']],
  [playerSearchRoute, ['GET']],
  [/^v1\/invitations\/[\da-f-]{36}\/accept$/, ['POST']],
  [/^v1\/invitations\/[\da-f-]{36}$/, ['DELETE']],
  [savedReadingRoute, ['GET']],
  [/^v1\/chance-sessions\/[\da-f-]{36}$/, ['GET']],
  [/^v1\/rooms$/, ['POST']],
  [/^v1\/rooms\/join$/, ['POST']],
  // A 6-digit code, an older 8-character code or an invite token; never a path.
  [/^v1\/rooms\/lookup\/[A-Za-z0-9_-]{6,128}$/, ['GET']],
  [/^v1\/rooms\/[\da-f-]{36}$/, ['GET']],
  [/^v1\/rooms\/[\da-f-]{36}\/reading$/, ['GET', 'POST']],
  [/^v1\/rooms\/[\da-f-]{36}\/astrology\/(places|chart)$/, ['POST']],
  // The organiser's links, and one person's own draw. Both are read-only.
  [/^v1\/rooms\/[\da-f-]{36}\/secret-santa\/links$/, ['GET']],
  [santaRevealRoute, ['GET']],
  [
    /^v1\/rooms\/[\da-f-]{36}\/(heartbeat|start|actions|chat|claim-host|invite|abandon|leave)$/,
    ['POST'],
  ],
  [/^v1\/rooms\/[\da-f-]{36}\/(ready|settings)$/, ['PUT']],
  [/^v1\/rooms\/[\da-f-]{36}\/bots(?:\/drive)?$/, ['POST']],
  [/^v1\/rooms\/[\da-f-]{36}\/bots\/bot:[a-f0-9]{32}$/, ['PATCH']],
  [/^v1\/rooms\/[\da-f-]{36}\/invites$/, ['POST']],
  [/^v1\/rooms\/[\da-f-]{36}\/invites\/[a-z0-9_]{3,20}$/, ['DELETE']],
  [/^v1\/rooms\/[\da-f-]{36}\/members\/(?:[\da-f-]{36}|bot:[a-f0-9]{32})$/, ['DELETE']],
];
export function isBackendRoute(path: string, method: string) {
  return routes.some(([pattern, methods]) => pattern.test(path) && methods.includes(method));
}
