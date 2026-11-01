"""Check/migrate the dedicated Games cloud and configure an explicit Vercel environment."""

import argparse
import json
import os
import secrets
import subprocess
import sys
from pathlib import Path
from typing import Literal

import httpx
from sqlalchemy import create_engine, text
from sqlalchemy.pool import NullPool

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
from app.cloud_config import PREVIEW_URL, CloudConfig
from app.db import connection_args
from app.settings import settings


def vercel(*args: str, value: str | None = None) -> subprocess.CompletedProcess[str]:
    result = subprocess.run(
        ["pnpm", "dlx", "vercel@65.8.0", *args, "--scope", "rudraghavs-projects",
         "--global-config", str(ROOT / ".vercel/personal-auth")],
        cwd=ROOT, input=value, capture_output=True, text=True,
    )
    if result.returncode:
        raise ValueError("A Vercel operation failed; no automatic retry or deployment was attempted.")
    return result


def target_check() -> None:
    who = json.loads(vercel("whoami", "--format", "json").stdout)
    link = json.loads((ROOT / ".vercel/project.json").read_text())
    if (who.get("username") != "rudraghav"
            or who.get("team", {}).get("slug") != "rudraghavs-projects"
            or link.get("projectId") != "prj_ktWnIpFSa7waRIO8gm7dQrkAB6Za"
            or who.get("linkedProject", {}).get("id") != link["projectId"]):
        raise ValueError("The personal Games Vercel project is not selected; no writes permitted.")


def check(config: CloudConfig) -> None:
    with httpx.Client(timeout=20) as client:
        response = client.get(PREVIEW_URL + "/auth/v1/settings", headers={"apikey": config.publishable_key})
        if response.status_code != 200:
            raise ValueError("The Games project's publishable key was rejected.")
        if not response.json().get("external", {}).get("anonymous_users"):
            raise ValueError("Enable anonymous sign-ins in Games preview Authentication settings.")
        keys = client.get(PREVIEW_URL + "/auth/v1/.well-known/jwks.json").json().get("keys", [])
        if not any(key.get("alg") in {"ES256", "RS256"} for key in keys):
            raise ValueError("Games preview needs an asymmetric JWT signing key for hosted identity.")
    url = config.database_url(migration=True)
    engine = create_engine(url, poolclass=NullPool, connect_args=connection_args(url))
    try:
        with engine.connect() as connection:
            connection.execute(text("select 1"))
            if connection.scalar(text("select to_regnamespace('games') is not null")):
                if not connection.scalar(text("select to_regclass('public.alembic_version') is not null")):
                    raise ValueError("An untracked Games schema exists; migration stopped for review.")
        print("Games preview target, anonymous auth, signing keys and session pooler verified.")
    finally:
        engine.dispose()


def app_secret() -> str:
    path = ROOT / ".vercel/preview-app-secret"
    if path.is_symlink():
        raise ValueError("The preview secret path must not be a symlink.")
    if not path.exists():
        with os.fdopen(os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600), "w") as file:
            file.write(secrets.token_urlsafe(48))
    if path.stat().st_mode & 0o077:
        raise ValueError("The preview encryption secret needs owner-only permissions.")
    return path.read_text()


def migrate(config: CloudConfig) -> None:
    environment = {**os.environ, **{key: value for key, (value, _) in config.runtime(app_secret()).items()},
                   "MIGRATION_DATABASE_URL": config.database_url(migration=True)}
    for args in (("upgrade", "head"), ("check",)):
        result = subprocess.run([sys.executable, "-m", "alembic", *args], cwd=ROOT / "backend",
                                env=environment, capture_output=True, text=True)
        if result.returncode:
            raise ValueError("The reviewed Games migration/schema check failed; deployment stopped.")
    url = config.database_url(migration=True)
    engine = create_engine(url, poolclass=NullPool, connect_args=connection_args(url))
    try:
        with engine.connect() as connection:
            tables = connection.execute(text(
                "select relname, relrowsecurity from pg_class c join pg_namespace n on n.oid=c.relnamespace "
                "where n.nspname='games' and c.relkind='r'"))
            for table, rls in tables:
                if not rls:
                    raise ValueError("A private Games table is missing RLS; deployment stopped.")
                for role in ("anon", "authenticated"):
                    allowed = role == "authenticated" and table == "room_members"
                    has_access = connection.scalar(text(
                        "select has_table_privilege(:role, :table, 'SELECT')"),
                        {"role": role, "table": f"games.{table}"})
                    if bool(has_access) != allowed:
                        raise ValueError("Private table grants differ from the reviewed access model.")
        print("Cloud Alembic upgrade, schema drift and private-table RLS/grants verified.")
    finally:
        engine.dispose()


def configure(config: CloudConfig, environment: Literal["preview", "production"] = "preview") -> None:
    values = config.runtime(app_secret(), environment=environment)
    if environment == "production":
        ai = settings()
        if not ai.gemini_api_key:
            raise ValueError("The existing Games Gemini key must be configured before production setup.")
        values.update({"GEMINI_API_KEY": (ai.gemini_api_key, True),
                       "TAROT_MODEL": (ai.tarot_model, False),
                       "TAROT_API_TIER": (ai.tarot_api_tier, False)})
    current = json.loads(vercel("env", "ls", "--json", "--environment", environment, "--project", "games").stdout)["envs"]
    existing = {}
    for item in current:
        if item["key"] in values:
            if item.get("target") != [environment] or item.get("gitBranch") or item["key"] in existing:
                raise ValueError("A cloud setting is shared/branch-specific; configuration stopped.")
            existing[item["key"]] = item
    for key, (value, secret) in values.items():
        vercel("env", "update" if key in existing else "add", key, "--environment", environment,
               "--project", "games", "--type", "secret" if secret else "config", "--yes", value=value)
        print(f"Configured {environment} {key} ({'Secret' if secret else 'Config'}).", flush=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("check", "migrate", "configure"))
    parser.add_argument("--environment", choices=("preview", "production"), default="preview")
    args = parser.parse_args()
    try:
        config = CloudConfig.read(ROOT / ".env.cloud.local")
        target_check()
        check(config)
        if args.operation == "migrate":
            migrate(config)
        elif args.operation == "configure":
            configure(config, args.environment)
    except ValueError as error:
        raise SystemExit(str(error)) from None
    except Exception as error:
        # Driver/HTTP exceptions may include credentials. Report only the class.
        raise SystemExit(f"Games preview setup failed ({type(error).__name__}); no deployment attempted.") from None


if __name__ == "__main__":
    main()
