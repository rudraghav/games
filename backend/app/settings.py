import os
from functools import lru_cache
from typing import Literal

from pydantic import Field
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
    tarot_model: str = "gemini-4-hydrogen"
    tarot_api_tier: Literal["free", "paid"] = "free"
    tarot_daily_limit: int = 100
    # Groq answers first: in the November 2026 evaluation it was the fastest (about 2s) and
    # tied each portrait to the question most directly. Its free tier allows roughly one
    # reading a minute, so a busy minute falls through to Gemini, then Cloudflare.
    tarot_provider_order: list[Literal["gemini", "groq", "cloudflare"]] = Field(
        default=["groq", "gemini", "cloudflare"], max_length=3,
    )
    groq_api_key: str = ""
    cloudflare_account_id: str = Field(default="", pattern=r"^(?:[0-9a-f]{32})?$")
    cloudflare_api_token: str = ""
    tarot_groq_modes: list[Literal["ordinary", "western", "vedic", "both"]] = Field(
        default=["ordinary", "western", "vedic", "both"],
    )
    tarot_cloudflare_modes: list[Literal["ordinary", "western", "vedic", "both"]] = Field(
        default=["ordinary", "western", "vedic", "both"],
    )

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
