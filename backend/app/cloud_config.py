"""Fail-closed Games preview configuration; never render credential values."""

from dataclasses import dataclass, field
from pathlib import Path
from typing import Literal, Self

import jwt
from sqlalchemy import URL

PREVIEW_REF = "pdkkpjpholsgmllehzax"
PREVIEW_URL = f"https://{PREVIEW_REF}.supabase.co"
PREVIEW_POOLER = "aws-0-ap-south-1.pooler.supabase.com"


@dataclass(frozen=True)
class CloudConfig:
    password: str = field(repr=False)
    publishable_key: str = field(repr=False)

    @classmethod
    def read(cls, path: Path) -> Self:
        if not path.is_file() or path.is_symlink():
            raise ValueError("Create the private .env.cloud.local setup file first.")
        if path.stat().st_mode & 0o077:
            raise ValueError("The cloud setup file must be readable only by its owner (mode 600).")
        values = {}
        for line in path.read_text().splitlines():
            if not line or line.lstrip().startswith("#") or "=" not in line:
                continue
            name, _, value = line.partition("=")
            if name in values:
                raise ValueError("The cloud setup file contains duplicate setting names.")
            values[name] = value
        expected = {"SUPABASE_PROJECT_REF": PREVIEW_REF, "SUPABASE_URL": PREVIEW_URL,
                    "SUPABASE_POOLER_HOST": PREVIEW_POOLER}
        if any(values.get(name) != value for name, value in expected.items()):
            raise ValueError("The cloud setup does not identify the dedicated Games preview project.")
        password, key = values.get("SUPABASE_DB_PASSWORD", ""), values.get("SUPABASE_PUBLISHABLE_KEY", "")
        if not password or not key:
            raise ValueError("Fill SUPABASE_DB_PASSWORD and SUPABASE_PUBLISHABLE_KEY; do not send them in chat.")
        if not key.startswith("sb_publishable_"):
            try:
                claims = jwt.decode(key, options={"verify_signature": False})
                if claims.get("role") != "anon" or claims.get("ref") != PREVIEW_REF:
                    raise ValueError
            except (jwt.PyJWTError, ValueError) as error:
                raise ValueError("Use this project's publishable key; secret/service-role keys are forbidden.") from error
        return cls(password=password, publishable_key=key)

    def database_url(self, *, migration: bool = False) -> str:
        return URL.create("postgresql+psycopg", username=f"postgres.{PREVIEW_REF}",
                          password=self.password, host=PREVIEW_POOLER,
                          port=5432 if migration else 6543, database="postgres").render_as_string(
                              hide_password=False)

    def runtime(self, app_secret: str, *, environment: Literal["preview", "production"] = "preview") -> dict[str, tuple[str, bool]]:
        if len(app_secret) < 32:
            raise ValueError("A separate, stable preview encryption secret is required.")
        if environment not in {"preview", "production"}:
            raise ValueError("Choose an explicit Games deployment environment.")
        return {"DATABASE_URL": (self.database_url(), True),
                "APP_SECRET": (app_secret, True), "SUPABASE_URL": (PREVIEW_URL, False),
                "NEXT_PUBLIC_SUPABASE_URL": (PREVIEW_URL, False),
                "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY": (self.publishable_key, False),
                "APP_ENV": (environment, False), "DEV_AUTH_ENABLED": ("false", False),
                "NEXT_PUBLIC_DEV_AUTH": ("false", False)}
