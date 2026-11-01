import os
from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=("../.env", ".env", "../.env.ai.local", ".env.ai.local"), extra="ignore"
    )
    app_env: str = "development"
    database_url: str = ""
    migration_database_url: str = ""
    supabase_url: str = ""
    app_secret: str = ""
    dev_auth_enabled: bool = False
    gemini_api_key: str = ""
    tarot_model: str = "gemini-3.5-flash-lite"
    tarot_api_tier: Literal["free", "paid"] = "free"
    tarot_daily_limit: int = 100

    def check(self) -> None:
        if not self.database_url or len(self.app_secret) < 32:
            raise RuntimeError("DATABASE_URL and APP_SECRET must be configured.")
        if self.dev_auth_enabled and (self.app_env != "development" or os.environ.get("VERCEL")):
            raise RuntimeError("Development identity is forbidden in hosted environments.")
        if not self.dev_auth_enabled and not self.supabase_url.startswith("https://"):
            raise RuntimeError(
                "A dedicated Supabase project is required for hosted authentication."
            )


@lru_cache
def settings() -> Settings:
    return Settings()
