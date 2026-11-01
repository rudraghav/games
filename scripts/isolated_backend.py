"""Run checks in a new, disposable LOCAL database; never reset the development DB."""

import os
import subprocess
import sys
from pathlib import Path
from uuid import uuid4

from sqlalchemy import create_engine, text
from sqlalchemy.engine import make_url

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "backend"))
from app.settings import settings

config = settings()
url = make_url(config.database_url)
if config.app_env != "development" or url.host not in {"127.0.0.1", "localhost"}:
    raise SystemExit("Isolated checks require the dedicated local development database.")
database = "games_verify_" + uuid4().hex[:12]
admin = create_engine(url.set(database="postgres"), isolation_level="AUTOCOMMIT")
env = {**os.environ, "DATABASE_URL": url.set(database=database).render_as_string(hide_password=False),
       "APP_ENV": "development", "DEV_AUTH_ENABLED": "true", "GAMES_ISOLATED_TEST": "1"}
try:
    with admin.connect() as conn:
        conn.execute(text(f'CREATE DATABASE "{database}"'))
    python = str(root / "backend/.venv/bin/python")
    def run(args: list[str]) -> None:
        subprocess.run([python, *args], cwd=root / "backend", env=env, check=True)
    run(["-m", "alembic", "upgrade", "head"])
    run(["-m", "alembic", "check"])
    run(["-m", "pytest", *(sys.argv[1:] or ["tests", "-q"])])
finally:
    # This exact random DB was created above by this invocation. No other DB is touched.
    with admin.connect() as conn:
        conn.execute(text(f'DROP DATABASE IF EXISTS "{database}" WITH (FORCE)'))
    admin.dispose()
