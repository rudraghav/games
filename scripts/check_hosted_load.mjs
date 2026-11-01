/** Fifty simultaneous private rooms: real auth, commits, Broadcast and snapshots.
 * Tokens, room codes, private cards and provider payloads stay only in memory.
 * Setup respects per-player room/join/start limits; cleanup uses authorized leave.
 */
import { randomUUID } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

const target = new URL(process.env.GAMES_TEST_URL || 'http://invalid.local');
if (target.origin !== 'https://games-seven-black.vercel.app' || target.pathname !== '/')
  throw new Error('Use the exact public Games production origin.');
if (process.env.GAMES_LOAD_ROOMS !== '50')
  throw new Error('Set GAMES_LOAD_ROOMS=50 to run the authorized fifty-room check.');
const mode = process.env.GAMES_LOAD_MODE || 'broadcast';
if (!['broadcast', 'poll'].includes(mode)) throw new Error('Choose broadcast or poll measurement.');
// Supply the source verified on the serving deployment, rather than inferring
// it from a local checkout that may contain unrelated tooling changes.
const applicationCommit = process.env.GAMES_LOAD_APP_SHA || null;
if (applicationCommit && !/^[a-f0-9]{40}$/.test(applicationCommit))
  throw new Error('GAMES_LOAD_APP_SHA must be a full verified application commit.');
const source = await readFile(new URL('../.env.cloud.local', import.meta.url), 'utf8');
const values = Object.fromEntries(
  source
    .split('\n')
    .filter((line) => line.includes('='))
    .map((line) => {
      const at = line.indexOf('=');
      return [line.slice(0, at), line.slice(at + 1)];
    }),
);
const supabaseUrl = values.SUPABASE_URL;
const key = values.SUPABASE_PUBLISHABLE_KEY;
if (
  supabaseUrl !== 'https://pdkkpjpholsgmllehzax.supabase.co' ||
  !key?.startsWith('sb_publishable_')
)
  throw new Error('The dedicated personal Games publishable configuration is required.');
const require = createRequire(new URL('../apps/web/package.json', import.meta.url));
const { createClient } = require('@supabase/supabase-js');
const actors = [];
const rooms = [];
const observations = new Map();
const clients = [];
const cleanup = [];
const startTime = new Date().toISOString();
const evidenceFile = `.vercel/hosted-load-${mode}-${startTime.replace(/[:.]/g, '-')}-${randomUUID().slice(0, 8)}.json`;

async function api(actor, path, method = 'GET', data, allowMissing = false) {
  const response = await fetch(new URL(`/api/backend/v1/${path}`, target), {
    method,
    headers: { Authorization: `Bearer ${actor.token}`, 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data),
    signal: AbortSignal.timeout(30000),
  });
  const operation =
    path.startsWith('rooms/') && path.split('/').length === 2
      ? 'room snapshot'
      : path.split('/').at(-1);
  if (allowMissing && response.status === 404) return null;
  if (!response.ok) throw new Error(`Games ${method} ${operation} status ${response.status}`);
  return response.json();
}
async function settledBatch(operations, operation) {
  const results = await Promise.allSettled(operations);
  const failed = results.filter((result) => result.status === 'rejected');
  if (failed.length) throw new Error(`Games ${operation} failures: ${failed.length}`);
  return results.map((result) => result.value);
}
function summary(samples) {
  const sorted = [...samples].sort((a, b) => a - b);
  return {
    median: Math.round(sorted[Math.floor(sorted.length / 2)]),
    p95: Math.round(sorted[Math.ceil(sorted.length * 0.95) - 1]),
    max: Math.round(sorted.at(-1)),
  };
}
async function observe(room) {
  const pending = observations.get(room.id);
  if (!pending || pending.fetching || pending.complete) return;
  pending.fetching = true;
  try {
    const snapshot = await api(room.observer, `rooms/${room.id}`);
    if (snapshot.match_version >= room.match_version + 1) {
      pending.complete = true;
      pending.resolve({
        synchronizationMs: performance.now() - pending.started,
        broadcastMs: pending.broadcastAt ? pending.broadcastAt - pending.started : null,
      });
    }
  } finally {
    pending.fetching = false;
  }
}
let outcome;
try {
  // Five identities each own ten rooms and observe another ten. No identity
  // exceeds the existing 12-create/hour,30-join/minute,20-start/minute limits.
  for (let index = 0; index < 5; index++) {
    const response = await fetch(supabaseUrl + '/auth/v1/signup', {
      method: 'POST',
      headers: { apikey: key, 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(20000),
    });
    if (!response.ok) throw new Error(`Games guest signup status ${response.status}`);
    const session = await response.json();
    if (!session.access_token) throw new Error('Games guest session was not issued.');
    actors.push({
      token: session.access_token,
      id: session.user?.id,
      name: `Load Verification ${index + 1}`,
    });
  }
  if (actors.some((actor) => !actor.id) || new Set(actors.map((actor) => actor.id)).size !== 5)
    throw new Error('Games guest identities must be distinct.');
  for (let batch = 0; batch < 10; batch++) {
    const created = await settledBatch(
      actors.map(async (host, index) => {
        const room = await api(host, 'rooms', 'POST', {
          name: host.name,
          game_id: 'blackjack',
          capacity: 1,
          room_name: `Verification load ${startTime.slice(0, 10)} ${batch * 5 + index + 1}`,
        });
        const entry = { ...room, host, observer: actors[(index + 1) % actors.length] };
        rooms.push(entry);
        return entry;
      }),
      'room creation',
    );
    await settledBatch(
      created.map(async (room) => {
        await api(room.observer, 'rooms/join', 'POST', {
          invite: room.code,
          name: room.observer.name,
        });
        await api(room.host, `rooms/${room.id}/ready`, 'PUT', { ready: true });
        Object.assign(room, await api(room.host, `rooms/${room.id}/start`, 'POST'));
      }),
      'room preparation',
    );
  }
  if (
    rooms.length !== 50 ||
    new Set(rooms.map((room) => room.id)).size !== 50 ||
    new Set(rooms.map((room) => room.match_id)).size !== 50
  )
    throw new Error('Fifty unique rooms and matches were not prepared.');
  if (mode === 'broadcast') {
    for (const actor of actors) {
      const client = createClient(supabaseUrl, key, {
        auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
        realtime: { params: { eventsPerSecond: 100 } },
      });
      await client.realtime.setAuth(actor.token);
      clients.push(client);
      actor.realtime = client;
    }
    await Promise.all(
      rooms.map(
        (room) =>
          new Promise((resolve, reject) => {
            const timer = setTimeout(
              () => reject(new Error('A private channel did not subscribe.')),
              20000,
            );
            room.observer.realtime
              .channel(`room:${room.id}`, { config: { private: true } })
              .on('broadcast', { event: 'state_changed' }, (event) => {
                const pending = observations.get(room.id);
                if (
                  !pending ||
                  typeof event.payload?.version !== 'number' ||
                  event.payload.version < room.revision + 1
                )
                  return;
                pending.broadcastAt ??= performance.now();
                observe(room).catch(() => pending.reject(new Error('Observer snapshot failed.')));
              })
              .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                  clearTimeout(timer);
                  resolve();
                } else if (['CHANNEL_ERROR', 'TIMED_OUT', 'CLOSED'].includes(status)) {
                  clearTimeout(timer);
                  reject(new Error('A private channel was rejected.'));
                }
              });
          }),
      ),
    );
  }
  await Promise.all(rooms.map((room) => api(room.host, `rooms/${room.id}/heartbeat`, 'POST')));
  const observed = rooms.map(
    (room) =>
      new Promise((resolve, reject) => {
        observations.set(room.id, { resolve, reject, started: 0, complete: false });
      }),
  );
  const allObserved = Promise.all(observed);
  // A notification can fail before the parallel action requests settle.
  // Attach a handler immediately; the same promise is still awaited below.
  allObserved.catch(() => undefined);
  let poll;
  if (mode === 'poll')
    poll = setInterval(() => {
      for (const room of rooms) {
        const pending = observations.get(room.id);
        if (pending.started)
          observe(room).catch(() => pending.reject(new Error('Polling snapshot failed.')));
      }
    }, 250);
  try {
    const actionResults = await Promise.allSettled(
      rooms.map(async (room) => {
        const option = room.game.actions.find((option) => option.action.type === 'bet');
        if (!option) throw new Error('Blackjack opening bet is unavailable.');
        const pending = observations.get(room.id);
        pending.started = performance.now();
        const response = await api(room.host, `rooms/${room.id}/actions`, 'POST', {
          match_id: room.match_id,
          expected_version: room.match_version,
          action_id: randomUUID(),
          action: { ...option.action, amount: option.minimum },
        });
        if (response.match_version !== room.match_version + 1)
          throw new Error('Committed match version did not advance exactly once.');
        return performance.now() - pending.started;
      }),
    );
    const failed = actionResults.filter((result) => result.status === 'rejected');
    if (failed.length) throw new Error(`Games concurrent action failures: ${failed.length}`);
    const actions = actionResults.map((result) => result.value);
    let timer;
    const synchronized = await Promise.race([
      allObserved,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Not all observers synchronized within 30 seconds.')),
          30000,
        );
      }),
    ]).finally(() => clearTimeout(timer));
    outcome = {
      startedAt: startTime,
      origin: target.origin,
      rooms: 50,
      guests: 5,
      mode,
      passed: true,
      committedActions: actions.length,
      synchronizedRooms: synchronized.length,
      actionMs: summary(actions),
      synchronizationMs: summary(synchronized.map((x) => x.synchronizationMs)),
      ...(mode === 'broadcast'
        ? { broadcastMs: summary(synchronized.map((x) => x.broadcastMs)) }
        : {}),
      semantics:
        'Submission to committed response; submission to authorized observer snapshot after private Broadcast or explicit 250ms polling.',
    };
  } finally {
    if (poll) clearInterval(poll);
  }
} catch (error) {
  outcome = {
    startedAt: startTime,
    origin: target.origin,
    roomsPrepared: rooms.length,
    mode,
    passed: false,
    error:
      error instanceof Error &&
      /^(Games |Fifty rooms|A private|Observer |Polling |Blackjack |Committed |Not all)/.test(
        error.message,
      )
        ? error.message
        : error instanceof Error
          ? error.name
          : 'Unknown failure',
  };
  process.exitCode = 1;
  // A committed create response can be lost in transit. Each identity is newly
  // issued for this invocation and owns at most ten rooms; the existing /me list
  // can recover its exact task rooms without retrying an uncertain mutation.
  let recovered = 0;
  for (const [index, host] of actors.entries()) {
    try {
      const me = await api(host, 'me');
      for (const summary of me.rooms) {
        if (
          !summary.name.startsWith(`Verification load ${startTime.slice(0, 10)} `) ||
          rooms.some((room) => room.id === summary.id)
        )
          continue;
        const room = await api(host, `rooms/${summary.id}`);
        rooms.push({ ...room, host, observer: actors[(index + 1) % actors.length] });
        recovered++;
      }
    } catch {
      /* The failure metadata remains false; cleanup attempts known rooms. */
    }
  }
  outcome.recoveredCommittedRooms = recovered;
} finally {
  await Promise.all(clients.map((client) => client.removeAllChannels()));
  await Promise.all(clients.map((client) => client.realtime.disconnect()));
  // Preserve all data/history; close only this invocation's memberships.
  for (const room of rooms) {
    try {
      await api(room.host, `rooms/${room.id}/abandon`, 'POST');
      if (room.observer)
        await api(room.observer, `rooms/${room.id}/leave`, 'POST', undefined, true);
      const left = await api(room.host, `rooms/${room.id}/leave`, 'POST');
      if (left.status !== 'closed') throw new Error('The task-owned room was not closed.');
      cleanup.push(true);
    } catch {
      cleanup.push(false);
    }
  }
  outcome.cleanupClosedRooms = cleanup.filter(Boolean).length;
  if (cleanup.some((value) => !value)) {
    outcome.passed = false;
    process.exitCode = 1;
  }
  outcome.applicationCommit = applicationCommit;
  outcome.evidenceFile = evidenceFile;
  console.log(JSON.stringify(outcome, null, 2));
  await mkdir(new URL('../.vercel/', import.meta.url), { recursive: true });
  await writeFile(
    new URL(`../${evidenceFile}`, import.meta.url),
    JSON.stringify(outcome, null, 2) + '\n',
    { mode: 0o600, flag: 'wx' },
  );
}
