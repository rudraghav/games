"""Configure only the explicitly linked personal Games preview; no deployment."""

import argparse
import json
import subprocess
import sys
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "backend"))
from app.settings import settings

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--refresh-ai", action="store_true", help="Replace only Games preview AI settings")
args = parser.parse_args()

base = ["pnpm", "dlx", "vercel@65.8.0"]
scope = ["--scope", "rudraghavs-projects", "--global-config", str(root / ".vercel/personal-auth")]
identity = subprocess.run([*base, "whoami", *scope, "--format", "json"], cwd=root, capture_output=True, text=True, check=True)
who = json.loads(identity.stdout)
link = json.loads((root / ".vercel/project.json").read_text())
if who.get("username") != "rudraghav" or who.get("team", {}).get("slug") != "rudraghavs-projects" or link.get("projectId") != "prj_ktWnIpFSa7waRIO8gm7dQrkAB6Za" or who.get("linkedProject", {}).get("id") != link["projectId"]:
    raise SystemExit("The personal Games account/project is not selected. No settings changed.")
if not settings().gemini_api_key:
    raise SystemExit("GEMINI_API_KEY is required; no settings changed.")
values = {
    "GEMINI_API_KEY": (settings().gemini_api_key, True),
    "TAROT_MODEL": (settings().tarot_model, False),
    "TAROT_API_TIER": (settings().tarot_api_tier, False),
    "APP_ENV": ("preview", False),
    "DEV_AUTH_ENABLED": ("false", False),
    "NEXT_PUBLIC_DEV_AUTH": ("false", False),
}
existing = {}
if args.refresh_ai:
    values = {name: value for name, value in values.items() if name in {"GEMINI_API_KEY", "TAROT_MODEL", "TAROT_API_TIER"}}
    result = subprocess.run([*base, "env", "ls", "--json", "--environment", "preview", "--project", "games", *scope],
                            cwd=root, capture_output=True, text=True, check=True)
    for item in json.loads(result.stdout)["envs"]:
        if item["key"] in values:
            if item["key"] in existing or item.get("target") != ["preview"] or item.get("gitBranch"):
                raise SystemExit("An AI setting is shared or branch-specific; no settings changed.")
            existing[item["key"]] = item

for name, (value, secret) in values.items():
    operation = "update" if name in existing else "add"
    result = subprocess.run([*base, "env", operation, name, "--environment", "preview", "--project", "games",
                             "--sensitive" if secret else "--no-sensitive", "--yes", *scope],
                            cwd=root, input=value, text=True, capture_output=True)
    if result.returncode:
        # CLI errors can quote inputs. Keep provider values out of terminal output.
        raise SystemExit(f"Could not {operation} {name}; inspect its Vercel setting before retrying. No automatic retry performed.")
    print(f"Configured preview {name} ({'secret' if secret else 'config'}).", flush=True)
