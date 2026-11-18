"""Explicit capture for application diagnostics that do not propagate to root."""

import pytest

from app.ai_logging import get_ai_logger


@pytest.fixture
def ai_caplog(caplog):
    logger = get_ai_logger()
    logger.addHandler(caplog.handler)
    try:
        yield caplog
    finally:
        logger.removeHandler(caplog.handler)
