"""Prove safe AI diagnostics actually emit without Uvicorn configuration."""

import json
import os
import subprocess
import sys
from pathlib import Path

BACKEND = Path(__file__).resolve().parents[1]


def isolated_python(source):
    result = subprocess.run(
        [sys.executable, "-B", "-c", source], cwd=BACKEND,
        env={**os.environ, "PYTHONPATH": str(BACKEND)}, capture_output=True, text=True, timeout=20,
    )
    assert result.returncode == 0, result.stderr
    return result


def test_plain_asgi_import_emits_safe_usage_without_enabling_other_loggers():
    result = isolated_python('''
import json, logging
from app.main import app
from app.ai_logging import get_ai_logger
from app.games.tarot.reading import _log_usage
names = ("", "uvicorn", "uvicorn.error", "httpx", "httpcore", "sqlalchemy.engine")
def states():
    return {name: (logging.getLogger(name).level,
                   tuple(id(h) for h in logging.getLogger(name).handlers),
                   logging.getLogger(name).propagate) for name in names}
before = states()
assert logging.getLogger("uvicorn.error").getEffectiveLevel() == logging.WARNING
_log_usage({"usage": {"total_input_tokens": 10, "total_output_tokens": 20,
                      "total_thought_tokens": 30},
            "question": "PRIVATE QUESTION", "api_key": "PRIVATE KEY",
            "error": "PRIVATE RAW ERROR", "steps": [{"text": "PRIVATE READING"}],
            "reasoning": "PRIVATE THOUGHT", "signature": "PRIVATE SIGNATURE"}, "test-model", 1)
logger = get_ai_logger()
print(json.dumps({"unrelatedLoggingUnchanged": states() == before,
                  "infoEnabled": logger.isEnabledFor(logging.INFO),
                  "propagate": logger.propagate,
                  "ownedHandlers": sum(h.name == "games.ai.metadata" for h in logger.handlers)}))
''')
    lines = result.stdout.splitlines()
    assert len(lines) == 2 and not result.stderr
    state = json.loads(lines[1])
    assert state == {"unrelatedLoggingUnchanged": True, "infoEnabled": True,
                     "propagate": False, "ownedHandlers": 1}
    assert lines[0].startswith("INFO ")
    usage = json.loads(lines[0].removeprefix("INFO "))
    assert usage["provider"] == "gemini" and usage["attempt"] == 1
    assert (usage["input_tokens"], usage["output_tokens"], usage["thought_tokens"]) == (10, 20, 30)
    assert "PRIVATE" not in result.stdout + result.stderr


def test_reconfiguration_reload_and_concurrency_do_not_duplicate_owned_handler():
    result = isolated_python('''
import importlib, json, logging
from concurrent.futures import ThreadPoolExecutor
from app import ai_logging
parent_handler = logging.StreamHandler()
parent_handler.setFormatter(logging.Formatter("ROOT DUPLICATE %(message)s"))
logging.getLogger().addHandler(parent_handler)
with ThreadPoolExecutor(max_workers=8) as pool:
    loggers = list(pool.map(lambda _: ai_logging.get_ai_logger(), range(40)))
original_handler = next(h for h in loggers[0].handlers if h.name == "games.ai.metadata")
for _ in range(3):
    ai_logging = importlib.reload(ai_logging)
    assert ai_logging.get_ai_logger() is loggers[0]
logger = ai_logging.get_ai_logger()
logger.disabled = True
logger = ai_logging.get_ai_logger()
logger.info("games.ai.preflight provider=gemini model=test-model attempt=1")
logger.warning("games.ai.failure model=test-model error_type=ValueError validation_errors=0")
logger.error("games.ai.failure model=test-model error_type=RuntimeError validation_errors=0")
print(json.dumps({"sameLogger": all(item is logger for item in loggers),
                  "sameHandler": original_handler in logger.handlers,
                  "ownedHandlers": sum(h.name == "games.ai.metadata" for h in logger.handlers),
                  "rootHandlerPreserved": parent_handler in logging.getLogger().handlers}))
''')
    stdout = result.stdout.splitlines()
    assert stdout[0] == "INFO games.ai.preflight provider=gemini model=test-model attempt=1"
    assert len(stdout) == 2
    assert json.loads(stdout[1]) == {"sameLogger": True, "sameHandler": True,
                                   "ownedHandlers": 1, "rootHandlerPreserved": True}
    assert result.stderr.splitlines() == [
        "WARNING games.ai.failure model=test-model error_type=ValueError validation_errors=0",
        "ERROR games.ai.failure model=test-model error_type=RuntimeError validation_errors=0",
    ]
