"""Focused import guards: no game/feature reaches across another module."""

import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
errors = []
for path in (root / "backend/app/games").glob("*/*.py"):
    module = path.parent.name
    for imported in re.findall(r"from app\.games\.([a-z_]+)", path.read_text()):
        if imported != module:
            errors.append(f"{path.relative_to(root)} imports another game's implementation")
for path in (root / "apps/web/src/features").rglob("*.tsx"):
    module = path.relative_to(root / "apps/web/src/features").parts[0]
    for imported in re.findall(r"from ['\"]@/features/([^/]+)", path.read_text()):
        if imported != module:
            errors.append(f"{path.relative_to(root)} imports another feature")
for path in (root / "packages/ui/src").rglob("*.tsx"):
    if re.search(r"from ['\"](?:@/|@games/api-client)", path.read_text()):
        errors.append(f"{path.relative_to(root)} depends on application logic")
if errors:
    raise SystemExit("\n".join(errors))
print("Game, feature and shared UI import boundaries pass.")
