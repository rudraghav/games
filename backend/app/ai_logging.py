"""Private AI diagnostics, independent of the host's web-server log level.

Callers log only reviewed metadata: never questions, credentials, provider prose
or exception tracebacks. This logger does not configure third-party loggers.
"""

import logging
import sys
from threading import RLock

LOGGER_NAME = "games.ai"
_HANDLER_NAME = "games.ai.metadata"
_CONFIG_LOCK = RLock()


class _MetadataStreamHandler(logging.StreamHandler):
    def emit(self, record: logging.LogRecord) -> None:
        # Vercel classifies stdout as INFO and stderr as ERROR. Keep routine
        # usage off stderr and retain the original WARNING/ERROR in the prefix.
        self.stream = sys.stderr if record.levelno >= logging.WARNING else sys.stdout
        super().emit(record)


def get_ai_logger() -> logging.Logger:
    """Return one INFO logger with a single owned, severity-routed handler."""
    with _CONFIG_LOCK:
        logger = logging.getLogger(LOGGER_NAME)
        logger.disabled = False
        logger.setLevel(logging.INFO)
        logger.propagate = False
        handler = next((item for item in logger.handlers if item.name == _HANDLER_NAME), None)
        if handler is None:
            handler = _MetadataStreamHandler()
            handler.set_name(_HANDLER_NAME)
            logger.addHandler(handler)
        handler.setLevel(logging.INFO)
        handler.setFormatter(logging.Formatter("%(levelname)s %(message)s"))
        return logger
