/** Allowlisted aggregate diagnostics: no URLs, identifiers, headers or bodies. */
export function proxyFailure(
  path: string,
  method: string,
  started: number,
  status: number,
  error?: unknown,
) {
  const route = path
    .replace(/(rooms\/)(?!join(?:\/|$))[^/]+/, '$1:room')
    .replace(/(members\/)[^/]+/, '$1:member');
  const name = error instanceof Error ? error.name : '';
  const cause =
    error instanceof Error && error.cause && typeof error.cause === 'object'
      ? (error.cause as { code?: unknown }).code
      : undefined;
  const codes = ['ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN', 'ENETUNREACH'];
  return {
    route,
    method,
    status,
    durationMs: Math.max(0, Math.round(performance.now() - started)),
    reason: !error
      ? 'upstream_http'
      : name === 'TimeoutError' || name === 'AbortError'
        ? 'proxy_timeout'
        : typeof cause === 'string' && codes.includes(cause)
          ? cause
          : 'upstream_transport',
  };
}
