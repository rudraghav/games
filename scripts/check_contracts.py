import json
import subprocess
import sys
from pathlib import Path
from tempfile import TemporaryDirectory

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "backend"))
from app.main import app, catalogue

target = root / "packages/api-client"
expected = {target / "openapi.json": app.openapi(),
            target / "src/generated/catalog.json": [g.model_dump() for g in catalogue()]}
for path, value in expected.items():
    if json.loads(path.read_text()) != value:
        raise SystemExit(f"Contract drift: {path.relative_to(root)}. Run pnpm gen:api.")
with TemporaryDirectory(prefix="games-contract-") as temp:
    output = Path(temp) / "schema.d.ts"
    subprocess.run(["pnpm", "exec", "openapi-typescript", str(target / "openapi.json"), "-o", str(output)], cwd=root, check=True)
    if output.read_text() != (target / "src/generated/schema.d.ts").read_text():
        raise SystemExit("Wire-type drift. Run pnpm gen:api.")
subprocess.run([sys.executable, str(root / "scripts/export_card_faces.py"), "--check"],
               cwd=root, check=True)
print("OpenAPI, catalogue, generated wire types and public card faces match the backend.")
