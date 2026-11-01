"""Export the real backend contract and catalogue without starting a server."""

import json
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "backend"))
from app.main import app, catalogue

target = root / "packages/api-client"
(target / "src/generated").mkdir(parents=True, exist_ok=True)
(target / "openapi.json").write_text(json.dumps(app.openapi(), indent=2) + "\n")
(target / "src/generated/catalog.json").write_text(
    json.dumps([g.model_dump() for g in catalogue()], indent=2) + "\n"
)
print(f"Exported backend OpenAPI and {len(catalogue())}-experience catalogue.")
