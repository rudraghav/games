"""One bounded synthetic combined-reading evaluation; never use personal birth data."""

import argparse
import json
import logging
import sys
import time
from datetime import UTC, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from app.astrology.chart import chart_at
from app.games.tarot.reading import PROMPT_VERSION, generate_reading
from app.settings import settings

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument("--output", type=Path, required=True)
parser.add_argument("--ordinary", action="store_true", help="Evaluate the ordinary Tarot regression instead")
parser.add_argument("--system", choices=("western", "vedic", "both"), default="both")
parser.add_argument("--cards", nargs=3, default=["major-00", "wands-01", "major-08"],
                    help="Three canonical cards; only synthetic evaluation spreads")
args = parser.parse_args()
logging.basicConfig(level=logging.INFO)
if args.output.exists():
    parser.error("Preserve existing evidence; choose a new output path.")
if not settings().gemini_api_key:
    parser.error("GEMINI_API_KEY is not configured; no request made.")

# Public J2000 astronomical reference instant and Greenwich observatory, not a person.
chart = None
if not args.ordinary:
    preview = chart_at(datetime(2000, 1, 1, 12, tzinfo=UTC), 51.4779, 0, args.system)
    assert preview.chart is not None
    chart = preview.chart
started = time.monotonic()
try:
    reading = generate_reading(
        args.cards,
        "How can I make room for a creative hobby?",
        astrology_chart=chart,
    )
except Exception as error:
    # Provider exceptions can contain URLs or response bodies. Emit only class.
    raise SystemExit(f"Evaluation failed ({type(error).__name__}); private provider details suppressed.") from None
assert len(reading.cards) == 3
assert all(section.quirky_interpretation and section.characters for section in reading.cards)
if chart:
    assert reading.astrology is not None
    for system in ("western", "vedic") if args.system == "both" else (args.system,):
        assert getattr(reading.astrology.interpretation, system)
    assert reading.astrology.chart == chart
else:
    assert reading.astrology is None
result = {
    "fixture": "Public J2000 reference; synthetic question; no personal birth input",
    "mode": "ordinary" if args.ordinary else args.system,
    "model": settings().tarot_model,
    "prompt_version": PROMPT_VERSION,
    "seconds": round(time.monotonic() - started, 2),
    "reading": reading.model_dump(exclude_none=True),
}
args.output.parent.mkdir(parents=True, exist_ok=True)
args.output.write_text(json.dumps(result, indent=2) + "\n")
print(json.dumps({key: result[key] for key in ("mode", "model", "prompt_version", "seconds")}))
