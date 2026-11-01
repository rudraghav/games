"""Synthetic, projection-only engine adapter for the browser-policy regression.

Each input is one JSON command; each output is only the current actor's view.
This process never loads an environment file, database, credential or live room.
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend"))
from app.core.contracts import Action
from app.games.azul.engine import AzulEngine
from app.games.flip_seven.engine import FlipSevenEngine
from app.games.trio.engine import TrioEngine

engines = {e.manifest.id: e for e in (AzulEngine(), FlipSevenEngine(), TrioEngine())}
command = json.loads(sys.stdin.readline())
engine = engines[command["game"]]
state = engine.setup([f"synthetic-{i}" for i in range(command["seats"])], {}, command["seed"])
while True:
    actor = state["order"][state["turn"]]
    print(engine.project_view(state, actor).model_dump_json(), flush=True)
    if state["phase"] == "finished":
        break
    raw = sys.stdin.readline()
    if not raw:
        break
    state = engine.apply_action(state, actor, Action.model_validate_json(raw))
