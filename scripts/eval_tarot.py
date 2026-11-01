"""Small real-provider quality check with non-personal, fixed questions."""

import json
import sys
import time
from pathlib import Path

root = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(root / "backend"))
from app.games.tarot.reading import PROMPT_VERSION, generate_reading
from app.settings import settings

if not settings().gemini_api_key:
    raise SystemExit("GEMINI_API_KEY is not configured; no provider call made.")
scenarios = [
    (["major-00", "wands-01", "major-08"], "How can I make room for a creative hobby?"),
    (["major-16", "cups-05", "major-17"], "I feel stuck in a routine. What could I reflect on?"),
    (["swords-02", "major-11", "pentacles-08"], ""),
]
target = root / "docs/evidence/tarot-evaluation"
target.mkdir(parents=True, exist_ok=True)
for index, (cards, question) in enumerate(scenarios, 1):
    path = target / f"{PROMPT_VERSION}-{index}.json"
    if path.exists():
        raise SystemExit("An evaluation already exists; preserve it and choose a new prompt version.")
    started = time.monotonic()
    result = generate_reading(cards, question)
    elapsed = round(time.monotonic() - started, 2)
    path.write_text(json.dumps({"model": settings().tarot_model, "prompt_version": PROMPT_VERSION,
                               "seconds": elapsed, "question": question,
                               "reading": result.model_dump()}, indent=2) + "\n")
    print(f"Scenario {index}: validated three cards in {elapsed}s; saved {path.relative_to(root)}", flush=True)
