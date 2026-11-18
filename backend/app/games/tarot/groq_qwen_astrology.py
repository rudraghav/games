"""Astrology-only Qwen diagnostic with an exact two-reference shortlist."""

import json
from copy import deepcopy
from typing import Any

from app.games.tarot.groq_qwen_v2 import build_groq_qwen_v2_request, decode_groq_qwen_v2_output
from app.games.tarot.providers import AlternativeOutputError, build_alternative_request

PROFILE_VERSION = "qwen-astrology-medium-1"
MODEL = "qwen/qwen3.8-27b"
OUTPUT_CAP = 4096
CANDIDATE_LIMIT = 2


def _context(source: dict[str, Any]) -> dict[str, Any]:
    context = json.loads(source["input"])
    if (not isinstance(context, dict) or not isinstance(context.get("astrology"), list)
            or not 1 <= len(context["astrology"]) <= 2
            or not isinstance(context.get("cards"), list) or len(context["cards"]) != 3):
        raise AlternativeOutputError("invalid_astrology_canonical_request")
    for card in context["cards"]:
        if (not isinstance(card, dict) or not isinstance(card.get("reference_characters"), list)
                or not card["reference_characters"]):
            raise AlternativeOutputError("invalid_astrology_canonical_request")
    return context


def build_groq_qwen_astrology_request(source: dict[str, Any]) -> tuple[dict[str, Any], dict[str, Any]]:
    """Return the supplied shortlist AND wire; never trim retained fact text."""
    effective = deepcopy(source)
    context = _context(effective)
    for card in context["cards"]:
        card["reference_characters"] = card["reference_characters"][:CANDIDATE_LIMIT]
    effective["input"] = json.dumps(context, ensure_ascii=False, separators=(",", ":"))
    body = build_groq_qwen_v2_request(build_alternative_request("groq", effective))
    if (body.get("model") != MODEL or body.get("reasoning_effort") != "none"
            or body.get("reasoning_format") != "hidden" or body.get("max_completion_tokens") != OUTPUT_CAP):
        raise AlternativeOutputError("invalid_astrology_base_profile")
    body["reasoning_effort"] = "medium"
    return effective, body


def decode_groq_qwen_astrology_output(body: object, canonical_request: dict[str, Any]) -> dict[str, Any]:
    context = _context(canonical_request)
    if any(len(card["reference_characters"]) > CANDIDATE_LIMIT for card in context["cards"]):
        raise AlternativeOutputError("invalid_astrology_effective_shortlist")
    return decode_groq_qwen_v2_output(body, canonical_request)
