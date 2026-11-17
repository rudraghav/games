"""Validate the public reference index without encoding or retaining player input."""

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))
import numpy as np
from app.games.tarot.characters import CHARACTERS
from app.games.tarot.reference_retrieval import catalogue_hash, load_index

metadata, vectors, _, _ = load_index()
if metadata["ids"] != [entry["id"] for entry in CHARACTERS] or metadata["catalogueHash"] != catalogue_hash(CHARACTERS):
    raise SystemExit("Tarot reference index drift. Run scripts/build_tarot_reference_index.py.")
if not np.allclose(np.linalg.norm(vectors, axis=1), 1.0, atol=0.001):
    raise SystemExit("Tarot reference vectors must be normalized and nonempty.")
if any(not entry.get("sourceContext") or not entry.get("contextSourceUrl") for entry in CHARACTERS):
    raise SystemExit("Every eligible reference needs sourced public context.")
print(json.dumps({"indexedReferences": len(CHARACTERS), "publicEvidence": True, "integrity": "passed"}))
