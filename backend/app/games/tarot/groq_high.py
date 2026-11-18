"""Evaluation-only high-effort request with a bounded effective shortlist."""

import json
from copy import deepcopy
from typing import Any

from app.games.tarot.providers import build_alternative_request

PROFILE_VERSION = "compact-groq-high-1"
OUTPUT_CAP = 5000
CANDIDATE_LIMIT = 2


def build_groq_high_request(source: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    """Return effective canonical input AND wire; decode/validate the former.

Only candidate rows are bounded. Every retained fact, chart value and prompt is
preserved. The legacy canonical response schema is not used by this adapter;
the strict wire schema is rebuilt from the effective shortlist.
"""
    effective = deepcopy(source)
    context = json.loads(effective["input"])
    cards = context.get("cards")
    if not isinstance(cards, list) or len(cards) != 3:
        raise ValueError("invalid_groq_high_canonical_input")
    for card in cards:
        references = card.get("reference_characters") if isinstance(card, dict) else None
        if not isinstance(references, list) or not references:
            raise ValueError("invalid_groq_high_canonical_input")
        card["reference_characters"] = references[:CANDIDATE_LIMIT]
    effective["input"] = json.dumps(context, ensure_ascii=False, separators=(",", ":"))
    body = build_alternative_request("groq", effective)
    if (body.get("model") != "openai/gpt-oss-120b" or body.get("reasoning_effort") != "high"
            or body.get("max_completion_tokens") != 4096):
        raise ValueError("invalid_groq_high_base_request")
    body["max_completion_tokens"] = OUTPUT_CAP
    return effective, body
