"""Generate public, synthetic Storybook scenarios through the real projections."""

import argparse
import json
import sys
from pathlib import Path
from uuid import NAMESPACE_DNS, uuid5

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "backend"))
from app.games.registry import ENGINES
from app.rooms.schemas import MemberView, RoomView

parser = argparse.ArgumentParser()
parser.add_argument("--game", choices=sorted(ENGINES), action="append", help="Refresh only this game's opening fixtures")
parser.add_argument("--check", action="store_true", help="Compare projections without writing")
args = parser.parse_args()
path = root / "apps/web/src/stories/generated/rooms.ts"
prefix = 'import type { components } from "@games/api-client/wire";\nexport const fixtures = '
suffix = ' satisfies { label: string; selfId: string; room: components["schemas"]["RoomView"] }[];\n'
names = ["Alexandra with a rather long name", "Dev", "Mira", "Sam", "Noor", "Alex", "Jules", "Kai", "Robin", "Ari"]
fixtures = []
for game_id, engine in ENGINES.items():
    if args.game and game_id not in args.game:
        continue
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
                                            seated=True, connected=True, last_seen=0)
                                 for i, p in enumerate(players)],
                        game=engine.project_view(state, players[0]))
        fixtures.append({"label": f"{engine.manifest.name} · {'maximum' if maximum else 'minimum'} seats",
                         "selfId": players[0], "room": view.model_dump(mode="json")})
if args.game:
    # Keep the existing fixture order and all unrelated historical snapshots
    # when adding a game. No real room or clock data belongs in new fixtures.
    existing = json.loads(path.read_text().removeprefix(prefix).removesuffix(suffix))
    replacements = {item["room"]["id"]: item for item in fixtures}
    fixtures = [replacements.pop(item["room"]["id"], item) for item in existing]
    fixtures.extend(replacements.values())
content = prefix + json.dumps(fixtures, indent=2) + suffix
if args.check:
    if not path.exists() or path.read_text() != content:
        raise SystemExit("Opening table fixtures differ from their engine projections.")
    print("Opening table fixtures match the selected engine projections.")
    sys.exit(0)
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text(content)
print(f"Generated {len(fixtures)} synthetic, viewer-projected table scenarios.")
