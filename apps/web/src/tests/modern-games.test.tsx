import { it, expect } from 'vitest';
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { renderToStaticMarkup } from 'react-dom/server';
import { mapRoom } from '@games/api-client/mappers';
import { fixtures } from '@/stories/generated/rooms';
import { AzulTable } from '@/games/modern/AzulTable';
import { TrioTable } from '@/games/modern/TrioTable';
import { FlipSevenTable } from '@/games/modern/FlipSevenTable';
import { matchPlayer } from '../../../../tests/browser/fullmatch-player';
import type { components } from '@games/api-client/wire';

it('renders all modern minimum/maximum projections with labeled actions', () => {
  const tables = { azul: AzulTable, trio: TrioTable, 'flip-7': FlipSevenTable };
  const selected = fixtures.filter((f) => f.room.game_id in tables);
  expect(selected).toHaveLength(6);
  for (const fixture of selected) {
    const room = mapRoom(fixture.room);
    const Table = tables[room.gameId as keyof typeof tables];
    const html = renderToStaticMarkup(
      <Table
        match={room.game!}
        room={room}
        selfId={fixture.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
    expect(html).toContain('aria-label=');
    expect(html).not.toContain('undefined');
  }
});

it('names Azul’s next starter only after someone claims the marker', () => {
  const fixture = fixtures.find((item) => item.room.game_id === 'azul')!;
  const room = mapRoom(fixture.room);
  const match = room.game!;
  const render = (marker: boolean) =>
    renderToStaticMarkup(
      <AzulTable
        room={room}
        match={{ ...match, detail: { ...match.detail, marker } }}
        selfId={fixture.selfId}
        onAction={() => undefined}
        pending={false}
      />,
    );
  expect(render(true)).toContain('First center taker starts next');
  expect(render(false)).toContain(
    `${room.members.find((member) => member.id === match.detail.starter)!.name} starts next`,
  );
  expect(render(false)).not.toContain('First center taker starts next');
});

for (const [game, seats] of [
  ['flip-7', 3],
  ['flip-7', 10],
  ['trio', 3],
  ['trio', 6],
  ['azul', 2],
  ['azul', 4],
] as const) {
  it(`completes ${game} at ${seats} seats using only authorized actor projections`, async () => {
    for (const seed of [17, 41, 73]) {
      const process = spawn('backend/.venv/bin/python', ['scripts/modern_policy_bridge.py'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      const choose = matchPlayer(seed);
      const lines = createInterface({ input: process.stdout });
      let moves = 0;
      let finished = false;
      let stderr = '';
      process.stderr.on('data', (chunk: Buffer) => {
        stderr += chunk.toString();
      });
      process.stdin.write(JSON.stringify({ game, seats, seed }) + '\n');
      try {
        for await (const line of lines) {
          const view = JSON.parse(line) as components['schemas']['GameView'];
          if (view.phase === 'finished') {
            expect(view.winners?.length).toBeGreaterThan(0);
            finished = true;
            break;
          }
          if (++moves > 3000) throw new Error(`${game} exceeded the full-match bound`);
          process.stdin.write(JSON.stringify(choose(view)) + '\n');
        }
        expect(stderr).toBe('');
        expect(finished).toBe(true);
      } finally {
        lines.close();
        process.stdin.end();
        process.kill();
      }
    }
  }, 30000);
}
