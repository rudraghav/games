"""Explicit capture for application diagnostics that do not propagate to root."""

import pytest

from app.ai_logging import get_ai_logger
from app.settings import settings


@pytest.fixture(autouse=True)
def isolated_reading_credentials(monkeypatch):
    """Deterministic suites must never inherit real local provider credentials."""
    config = settings()
    monkeypatch.setattr(config, "gemini_api_key", "local-test-adapter")
    monkeypatch.setattr(config, "groq_api_key", "")
    monkeypatch.setattr(config, "cloudflare_api_token", "")
    monkeypatch.setattr(config, "cloudflare_account_id", "")


@pytest.fixture
def ai_caplog(caplog):
    logger = get_ai_logger()
    logger.addHandler(caplog.handler)
    try:
        yield caplog
    finally:
        logger.removeHandler(caplog.handler)
