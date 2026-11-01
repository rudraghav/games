const routes: [RegExp, readonly string[]][] = [
  [/^v1\/games$/, ['GET']],
  [/^v1\/me$/, ['GET']],
  [/^v1\/profile$/, ['PUT']],
  [/^v1\/rooms$/, ['POST']],
  [/^v1\/rooms\/join$/, ['POST']],
  [/^v1\/rooms\/[\da-f-]{36}$/, ['GET']],
  [/^v1\/rooms\/[\da-f-]{36}\/reading$/, ['GET', 'POST']],
  [
    /^v1\/rooms\/[\da-f-]{36}\/(heartbeat|start|actions|chat|claim-host|invite|abandon|leave)$/,
    ['POST'],
  ],
  [/^v1\/rooms\/[\da-f-]{36}\/(ready|settings)$/, ['PUT']],
  [/^v1\/rooms\/[\da-f-]{36}\/bots(?:\/drive)?$/, ['POST']],
  [/^v1\/rooms\/[\da-f-]{36}\/members\/(?:[\da-f-]{36}|bot:[a-f0-9]{32})$/, ['DELETE']],
];
export function isBackendRoute(path: string, method: string) {
  return routes.some(([pattern, methods]) => pattern.test(path) && methods.includes(method));
}
