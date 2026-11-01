"""Generate public, synthetic Storybook scenarios through the real projections."""

import json
import sys
import time
from pathlib import Path
from uuid import NAMESPACE_DNS, uuid5

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "backend"))
from app.games.registry import ENGINES
from app.rooms.schemas import MemberView, RoomView

names = ["Alexandra with a rather long name", "Dev", "Mira", "Sam", "Noor", "Alex", "Jules", "Kai", "Robin", "Ari"]
fixtures = []
for game_id, engine in ENGINES.items():
    for maximum in (False, True):
        n = engine.manifest.max_players if maximum else engine.manifest.min_players
        players = [str(uuid5(NAMESPACE_DNS, f"games-story-{i}")) for i in range(n)]
        state = engine.setup(players, {s.key: s.default for s in engine.manifest.settings}, seed=17)
        if maximum and game_id.startswith("uno"):
            count = 17 if game_id == "uno-no-mercy" else 35
            for _ in range(count):
                state["hands"][players[0]].append(state["deck"].pop())
        view = RoomView(id=str(uuid5(NAMESPACE_DNS, f"games-story-{game_id}-{maximum}")),
                        name="Component preview", code="PREVIEW1", game_id=game_id,
                        owner_id=players[0], capacity=n, settings={}, status="playing", revision=1,
                        match_id=str(uuid5(NAMESPACE_DNS, f"match-{game_id}")), match_version=1,
                        paused=False, missing_players=[], messages=[],
                        members=[MemberView(id=p, name=names[i], avatar=i % 8, ready=False,
                                            seated=True, connected=True, last_seen=time.time())
                                 for i, p in enumerate(players)],
                        game=engine.project_view(state, players[0]))
        fixtures.append({"label": f"{engine.manifest.name} · {'maximum' if maximum else 'minimum'} seats",
                         "selfId": players[0], "room": view.model_dump(mode="json")})
path = root / "apps/web/src/stories/generated/rooms.ts"
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text('import type { components } from "@games/api-client/wire";\n'
                'export const fixtures = ' + json.dumps(fixtures, indent=2) +
                ' satisfies { label: string; selfId: string; room: components["schemas"]["RoomView"] }[];\n')
print(f"Generated {len(fixtures)} synthetic, viewer-projected table scenarios.")
