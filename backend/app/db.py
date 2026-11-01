from functools import lru_cache
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.settings import settings


def connection_args(url: str) -> dict[str, Any]:
    options: dict[str, Any] = {"connect_timeout": 10, "prepare_threshold": None}
    if make_url(url).host in {"127.0.0.1", "localhost"}:
        options["options"] = "-c search_path=public"
    else:
        options["sslmode"] = "require"
    return options


@lru_cache
def sessions() -> sessionmaker[Session]:
    config = settings()
    config.check()
    engine = create_engine(
        config.database_url,
        poolclass=NullPool,
        connect_args=connection_args(config.database_url),
    )
    return sessionmaker(engine, expire_on_commit=False)
